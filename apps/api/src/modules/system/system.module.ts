import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemController } from './system.controller';

@Module({
  imports: [MongooseModule],
  controllers: [SystemController],
})
export class SystemModule {}
