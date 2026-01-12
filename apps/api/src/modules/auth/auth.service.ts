import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

type OtpEntry = { code: string; expiresAt: number };

// Global store to persist across hot-reloads
const globalOtpStore = new Map<string, OtpEntry>();

@Injectable()
export class AuthService {
  private store: Map<string, OtpEntry> = globalOtpStore;

  constructor(private readonly usersService: UsersService) {}

  async sendOtp(phone: string) {
    if (!phone) throw new BadRequestException('Phone required');
    const code = this.generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    this.store.set(phone, { code, expiresAt });

    // In production, integrate Firebase/AWS SNS here.
    console.log(`[OTP] ${phone} -> ${code}`);

    return { success: true, phone, devCode: process.env.NODE_ENV !== 'production' ? code : undefined };
  }

  async verifyOtp(phone: string, otp: string) {
    if (!phone || !otp) throw new BadRequestException('Phone and OTP required');
    const entry = this.store.get(phone);
    if (!entry) throw new BadRequestException('OTP not requested');
    if (Date.now() > entry.expiresAt) {
      this.store.delete(phone);
      throw new BadRequestException('OTP expired');
    }
    if (entry.code !== otp) throw new BadRequestException('Invalid OTP');

    this.store.delete(phone);
    const user = await this.usersService.findOrCreateByPhone(phone);
    
    // Check if user has completed profile
    const hasProfile = !!(user.name && user.role);
    
    // TODO: issue real JWT tied to user/phone
    return { 
      success: true, 
      phone, 
      userId: user._id?.toString?.() ?? '', 
      token: 'jwt-token-placeholder',
      hasProfile,
      role: user.role,
      name: user.name
    };
  }

  async adminLogin(password: string, phone: string) {
    if (!password || !phone) {
      throw new BadRequestException('Phone and password required');
    }

    // Find admin user by phone
    const admin = await this.usersService.findByPhone(phone);
    if (!admin || admin.role !== 'admin') {
      throw new BadRequestException('Invalid admin credentials');
    }

    // Verify password
    if (!admin.passwordHash) {
      throw new BadRequestException('Admin password not set');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid admin credentials');
    }

    // Send OTP for MFA
    const code = this.generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    this.store.set(`admin_${phone}`, { code, expiresAt });

    console.log(`[ADMIN OTP] ${phone} -> ${code}`);

    return { 
      success: true, 
      message: 'OTP sent to admin phone',
      phone,
      requiresOtp: true,
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined 
    };
  }

  async verifyAdminOtp(phone: string, otp: string) {
    if (!phone || !otp) throw new BadRequestException('Phone and OTP required');
    
    const entry = this.store.get(`admin_${phone}`);
    if (!entry) throw new BadRequestException('OTP not requested or admin login not initiated');
    if (Date.now() > entry.expiresAt) {
      this.store.delete(`admin_${phone}`);
      throw new BadRequestException('OTP expired');
    }
    if (entry.code !== otp) throw new BadRequestException('Invalid OTP');

    this.store.delete(`admin_${phone}`);
    
    // Find admin by phone
    const admin = await this.usersService.findByPhone(phone);
    if (!admin || admin.role !== 'admin') {
      throw new BadRequestException('Admin not found');
    }

    return { 
      success: true, 
      phone, 
      userId: admin._id?.toString?.() ?? '', 
      token: 'jwt-admin-token-placeholder',
      role: 'admin',
      name: admin.name
    };
  }

  async register(body: {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
    role: 'customer' | 'worker';
    jobCategory?: string;
    paymentPerHour?: number;
    preferredLocation?: string;
    nextAvailableDate?: string;
  }) {
    if (!body.phone || !body.otp) throw new BadRequestException('Phone and OTP required');

    // Verify OTP
    const entry = this.store.get(body.phone);
    if (!entry) throw new BadRequestException('OTP not requested');
    if (Date.now() > entry.expiresAt) {
      this.store.delete(body.phone);
      throw new BadRequestException('OTP expired');
    }
    if (entry.code !== body.otp) throw new BadRequestException('Invalid OTP');

    this.store.delete(body.phone);

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Prepare user data
    const userData: any = {
      phone: body.phone,
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role,
    };

    // Add worker-specific fields if worker role
    if (body.role === 'worker') {
      userData.jobCategory = body.jobCategory;
      userData.paymentPerHour = body.paymentPerHour;
      userData.preferredLocation = body.preferredLocation;
      userData.nextAvailableDate = body.nextAvailableDate;
    }

    // Register user with role and details
    const user = await this.usersService.registerUser(userData);

    return {
      success: true,
      token: 'jwt-token-placeholder',
      userId: user._id?.toString?.() ?? '',
      name: user.name,
      role: user.role,
    };
  }

  async passwordLogin(phone: string, password: string) {
    if (!phone || !password) throw new BadRequestException('Phone and password required');
    
    const user = await this.usersService.findByPhone(phone);
    if (!user || !user.password) throw new BadRequestException('Invalid phone or password');
    
    // Compare plain password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new BadRequestException('Invalid phone or password');
    
    // Check if user has completed profile
    const hasProfile = !!(user.name && user.role);
    
    return {
      success: true,
      phone,
      userId: user._id?.toString?.() ?? '',
      token: 'jwt-token-placeholder',
      hasProfile,
      role: user.role,
      name: user.name
    };
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
