import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemController } from './system.controller';
import { SeedService } from './seed.service';
import { User, UserSchema } from '../users/users.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [SystemController],
  providers: [SeedService],
})
export class SystemModule {}
