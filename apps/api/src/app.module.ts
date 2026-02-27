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

let mongoServer: MongoMemoryServer | null = null;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({ ttl: 60, limit: 60 }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        // Check for production MongoDB URI (Railway uses MONGODB_URI)
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        if (uri) {
          console.log(`[mongo] connecting to production database`);
          return { uri };
        }
        
        // Only use in-memory MongoDB for local development
        if (process.env.NODE_ENV === 'production') {
          throw new Error('MONGODB_URI environment variable is required in production');
        }
        
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
  ],
})
export class AppModule implements OnModuleDestroy {
  async onModuleDestroy() {
    if (mongoServer) await mongoServer.stop();
  }
}
