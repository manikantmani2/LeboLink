import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SystemModule } from './modules/system/system.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersService } from './modules/users/users.service';

let mongoServer: MongoMemoryServer | null = null;

@Injectable()
class StartupSeed implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    const existing = await this.usersService.findById('seed-check').catch(() => null);
    if (existing) return;
    
    // Create admin user with proper credentials
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('Hello@&1234', 10);
    
    await this.usersService.createAdmin({
      phone: '9155682599',
      name: 'Manikant Sharma',
      role: 'admin',
      passwordHash: hashedPassword,
    });
    
    // Create worker users
    await this.usersService.registerWorker({
      phone: '9999990001',
      name: 'Amit Sharma',
      skills: ['electrician'],
      kyc: { idType: 'AADHAAR', idNumber: 'XXXX-XXXX-0001' },
    });
    await this.usersService.registerWorker({
      phone: '9999990002',
      name: 'Priya Verma',
      skills: ['cleaner'],
      kyc: { idType: 'PAN', idNumber: 'XXXXX0002X' },
    });
    await this.usersService.registerWorker({
      phone: '9999990003',
      name: 'Rahul Singh',
      skills: ['plumber'],
      kyc: { idType: 'DL', idNumber: 'DL0003' },
    });
    
    console.log('[SEED] Admin credentials:');
    console.log('  Phone: 9155682599');
    console.log('  Password: Hello@&1234');
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({ ttl: 60, limit: 60 }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri = process.env.MONGO_URI;
        if (uri) return { uri };
        mongoServer = await MongoMemoryServer.create();
        const memUri = mongoServer.getUri('lebolink');
        console.log(`[mongo] using in-memory at ${memUri}`);
        return { uri: memUri };
      },
    }),
    UsersModule,
    AuthModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    SystemModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    StartupSeed,
  ],
})
export class AppModule implements OnModuleDestroy {
  async onModuleDestroy() {
    if (mongoServer) await mongoServer.stop();
  }
}
