import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import * as twilio from 'twilio';

type OtpEntry = { code: string; expiresAt: number };

// Global store to persist across hot-reloads
const globalOtpStore = new Map<string, OtpEntry>();

@Injectable()
export class AuthService {
  private store: Map<string, OtpEntry> = globalOtpStore;
  private twilioClient: twilio.Twilio | null = null;
  private logger = new Logger('AuthService');

  constructor(private readonly usersService: UsersService) {
    // Initialize Twilio client if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.logger.log('Twilio SMS service initialized');
    }
  }

  async sendOtp(phone: string) {
    if (!phone) throw new BadRequestException('Phone required');
    const code = this.generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    this.store.set(phone, { code, expiresAt });

    // Try to send via Twilio in production
    if (process.env.NODE_ENV === 'production' && this.twilioClient) {
      try {
        await this.twilioClient.messages.create({
          body: `Your LeboLink OTP is: ${code}\n\nValid for 15 minutes. Do not share this code.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: this.formatPhoneNumber(phone),
        });
        this.logger.log(`OTP sent to ${phone} via SMS`);
        return { success: true, phone };
      } catch (error) {
        this.logger.error(`Failed to send OTP via Twilio: ${error.message}`);
        throw new BadRequestException('Failed to send OTP. Please try again later.');
      }
    }

    // Development fallback: log OTP to console
    this.logger.warn(`[DEV] OTP for ${phone}: ${code}`);
    return { success: true, phone, devCode: code };
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Add country code if not present (assumes +1 for US, adjust as needed)
    if (cleaned.length === 10) return `+1${cleaned}`;
    if (cleaned.length === 11 && cleaned[0] === '1') return `+${cleaned}`;
    if (!cleaned.startsWith('+')) return `+${cleaned}`;
    return cleaned;
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
    if (admin.isDeleted) {
      throw new BadRequestException('Account deleted');
    }
    if (admin.accountStatus === 'blocked' || admin.accountStatus === 'deactivated') {
      throw new BadRequestException('Admin account is not active');
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

    // Try to send via Twilio in production
    if (process.env.NODE_ENV === 'production' && this.twilioClient) {
      try {
        await this.twilioClient.messages.create({
          body: `Your LeboLink Admin OTP is: ${code}\n\nValid for 15 minutes. Do not share this code.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: this.formatPhoneNumber(phone),
        });
        this.logger.log(`Admin OTP sent to ${phone} via SMS`);
        return { 
          success: true, 
          message: 'OTP sent to admin phone',
          phone,
          requiresOtp: true
        };
      } catch (error) {
        this.logger.error(`Failed to send admin OTP via Twilio: ${error.message}`);
        throw new BadRequestException('Failed to send OTP. Please try again later.');
      }
    }

    // Development fallback: log OTP to console
    this.logger.warn(`[DEV] Admin OTP for ${phone}: ${code}`);
    return { 
      success: true, 
      message: 'OTP sent to admin phone',
      phone,
      requiresOtp: true,
      devCode: code 
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
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async passwordLogin(phone: string, password: string) {
    if (!phone || !password) throw new BadRequestException('Phone and password required');
    
    const user = await this.usersService.findByPhone(phone);
    if (!user) throw new BadRequestException('Invalid phone or password');
    if (user.isDeleted) throw new BadRequestException('Account deleted');
    if (user.accountStatus === 'blocked') throw new BadRequestException('Your account is blocked by admin');
    if (user.accountStatus === 'deactivated') throw new BadRequestException('Your account is deactivated by admin');
    
    // Check which password field is used (password or passwordHash)
    const storedPassword = user.password || user.passwordHash;
    if (!storedPassword) throw new BadRequestException('Invalid phone or password');
    
    // Compare plain password with hashed password
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    if (!isPasswordValid) throw new BadRequestException('Invalid phone or password');
    
    // Check if user has completed profile (requires name and role)
    const hasProfile = !!(user.name && user.role);
    const workerApprovalStatus =
      user.role === 'worker'
        ? (user.workerApproval?.status || 'pending')
        : undefined;
    const canWork =
      user.role === 'worker'
        ? user.accountStatus === 'active' && workerApprovalStatus === 'approved'
        : true;
    
    return {
      success: true,
      phone: user.phone,
      email: user.email,
      userId: user._id?.toString?.() ?? '',
      token: 'jwt-token-placeholder',
      hasProfile,
      role: user.role || 'customer',
      name: user.name,
      requiresOtp: false,
      accountStatus: user.accountStatus || 'active',
      workerApprovalStatus,
      canWork,
    };
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
