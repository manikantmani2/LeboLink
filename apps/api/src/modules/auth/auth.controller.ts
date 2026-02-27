import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller({ path: 'v1/auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Send OTP via email
  @Post('send-email-otp')
  async sendEmailOtp(@Body('email') email: string) {
    return this.authService.sendEmailOtp(email);
  }

  // Send OTP via SMS to phone
  @Post('send-sms-otp')
  async sendSmsOtp(@Body('phone') phone: string) {
    return this.authService.sendSmsOtp(phone);
  }

  // Legacy endpoint - accepts either email or phone
  @Post('send-otp')
  async sendOtp(@Body() body: { email?: string; phone?: string }) {
    if (body.email) {
      return this.authService.sendEmailOtp(body.email);
    } else if (body.phone) {
      return this.authService.sendSmsOtp(body.phone);
    }
    throw new Error('Email or Phone required');
  }

  // Verify OTP - accepts either email or phone
  @Post('verify-otp')
  async verifyOtp(@Body() body: { email?: string; phone?: string; otp: string }) {
    if (body.email) {
      return this.authService.verifyEmailOtp(body.email, body.otp);
    } else if (body.phone) {
      return this.authService.verifySmsOtp(body.phone, body.otp);
    }
    throw new Error('Email or Phone required');
  }

  @Post('register')
  async register(@Body() body: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    otp: string;
    role: 'customer' | 'worker';
    jobCategory?: string;
    paymentPerHour?: number;
    preferredLocation?: string;
    nextAvailableDate?: string;
  }) {
    return this.authService.register(body);
  }

  // Login with password - accepts either email or phone
  @Post('login')
  async login(@Body() body: { email?: string; phone?: string; password: string }) {
    return this.authService.passwordLogin(body);
  }

  @Post('admin-login')
  async adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.adminLogin(body.email, body.password);
  }

  @Post('admin-verify-otp')
  async adminVerifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyAdminOtp(body.email, body.otp);
  }
}
