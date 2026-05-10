import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('v1/health')
export class HealthController {
  constructor(@InjectConnection() private readonly conn: Connection) {}

  @Get('health')
  health() {
    const state = this.conn.readyState;
    return {
      status: 'ok',
      mongo: state === 1 ? 'connected' : state === 2 ? 'connecting' : state === 3 ? 'disconnecting' : 'disconnected',
      dbName: this.conn.name,
    };
  }
}
