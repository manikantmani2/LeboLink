import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller({ path: 'v1/auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register (simplified - no OTP required)
  @Post('register')
  async register(@Body() body: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    role: 'customer' | 'worker';
    jobCategory?: string;
    paymentPerHour?: number;
    preferredLocation?: string;
    nextAvailableDate?: string;
  }) {
    return this.authService.register(body as any);
  }

  // Login with password - accepts either email or phone
  @Post('login')
  async login(@Body() body: { email?: string; phone?: string; password: string }) {
    return this.authService.passwordLogin(body);
  }

  // Admin login - password only (no OTP)
  @Post('admin-login')
  async adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.adminLogin(body.email, body.password);
  }
}
