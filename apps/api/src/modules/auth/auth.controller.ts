import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller({ path: 'v1/auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body('phone') phone: string) {
    return this.authService.sendOtp(phone);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { phone: string; otp: string }) {
    return this.authService.verifyOtp(body.phone, body.otp);
  }

  @Post('register')
  async register(@Body() body: {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
    role: 'customer' | 'worker';
  }) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { phone: string; password: string }) {
    return this.authService.passwordLogin(body.phone, body.password);
  }

  @Post('admin-login')
  async adminLogin(@Body() body: { password: string; phone: string }) {
    return this.authService.adminLogin(body.password, body.phone);
  }

  @Post('admin-verify-otp')
  async adminVerifyOtp(@Body() body: { phone: string; otp: string }) {
    return this.authService.verifyAdminOtp(body.phone, body.otp);
  }
}
