import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller({ path: 'v1/users' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('workers')
  async registerWorker(@Body() body: { phone: string; name: string; skills?: string[]; kyc?: { idType?: string; idNumber?: string; documentUrl?: string } }) {
    return this.usersService.registerWorker(body);
  }

  @Get('search')
  async searchWorkers(@Query('q') q?: string, @Query('category') category?: string) {
    return this.usersService.searchWorkers(q, category);
  }

  @Get('workers')
  async listWorkers(@Query('category') category?: string) {
    return this.usersService.searchWorkers(undefined, category);
  }

  @Get(':id([0-9a-fA-F]{24})')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id([0-9a-fA-F]{24})')
  async updateUser(@Param('id') id: string, @Body() body: { 
    name?: string; 
    email?: string; 
    phone?: string;
    profileImage?: string;
    settings?: any;
  }) {
    return this.usersService.updateUser(id, body);
  }
}
