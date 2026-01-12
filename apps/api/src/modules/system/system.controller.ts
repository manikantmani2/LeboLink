import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller({ path: 'v1/system' })
export class SystemController {
  constructor(@InjectConnection() private readonly conn: Connection) {}

  @Get('health')
  health() {
    const state = this.conn.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
    return {
      mongo: state === 1 ? 'connected' : state === 2 ? 'connecting' : state === 3 ? 'disconnecting' : 'disconnected',
      dbName: this.conn.name,
    };
  }
}
