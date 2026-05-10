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

function normalizeMongoUri(rawValue?: string): string | undefined {
  if (!rawValue) return undefined;

  let value = rawValue.trim();

  // Accept env values pasted as "MONGODB_URI=...".
  if (value.startsWith('MONGODB_URI=')) {
    value = value.slice('MONGODB_URI='.length).trim();
  }

  // Remove surrounding single/double quotes.
  value = value.replace(/^['"]+|['"]+$/g, '').trim();

  return value || undefined;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({ ttl: 60, limit: 60 }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri =
          normalizeMongoUri(process.env.MONGODB_URI) ||
          normalizeMongoUri(process.env.MONGO_URI);

        // If user provided a URI, check host reachability and prefer it when reachable.
        if (uri) {
          if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
            console.error('[mongo] invalid URI format. Expected mongodb:// or mongodb+srv://');
          }

          // In production, require the URI.
          if (process.env.NODE_ENV === 'production') {
            console.log(`[mongo] connecting to production database`);
            return { uri };
          }

          // For development, attempt a quick TCP check to the host:port in the URI.
          try {
            const match = uri.match(/mongodb(?:\+srv)?:\/\/([^\/:]+)(?::(\d+))?/);
            if (match) {
              const host = match[1];
              const port = parseInt(match[2] || '27017', 10);
              const reachable = await new Promise<boolean>((resolve) => {
                const net = require('net');
                const socket = new net.Socket();
                const onError = () => {
                  socket.destroy();
                  resolve(false);
                };
                socket.setTimeout(2000);
                socket.once('error', onError);
                socket.once('timeout', onError);
                socket.connect(port, host, () => {
                  socket.end();
                  resolve(true);
                });
              });

              if (reachable) {
                console.log(`[mongo] connecting to provided database at ${host}:${port}`);
                return { uri };
              }
              console.warn(`[mongo] provided MongoDB at ${host}:${port} is unreachable; falling back to in-memory for dev`);
            } else {
              // If we can't parse the host, attempt to use the URI anyway.
              console.log('[mongo] provided MONGODB URI present; attempting to use it');
              return { uri };
            }
          } catch (err) {
            console.warn('[mongo] error while checking provided MongoDB URI, falling back to in-memory', (err as any)?.message || err);
          }
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
