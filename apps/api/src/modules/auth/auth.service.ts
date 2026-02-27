import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import * as nodemailer from 'nodemailer';

type OtpEntry = { code: string; expiresAt: number };

// Global store to persist across hot-reloads
const globalOtpStore = new Map<string, OtpEntry>();

@Injectable()
export class AuthService {
  private store: Map<string, OtpEntry> = globalOtpStore;
  private emailTransporter: nodemailer.Transporter | null = null;
  private logger = new Logger('AuthService');

  constructor(private readonly usersService: UsersService) {
    // Initialize email transporter for production
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
      this.logger.log('Email service initialized');
    }
  }

  async sendOtp(email: string) {
    if (!email) throw new BadRequestException('Email required');
    
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    const code = this.generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    this.store.set(email, { code, expiresAt });

    // Try to send via email in production
    if (process.env.NODE_ENV === 'production' && this.emailTransporter) {
      try {
        await this.emailTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'LeboLink Verification Code',
          html: `
            <h2>Your LeboLink Verification Code</h2>
            <p>Enter this code to verify your email:</p>
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 2px;">${code}</h1>
            <p>This code expires in 15 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          `,
        });
        this.logger.log(`OTP sent to ${email} via email`);
        return { success: true, email };
      } catch (error) {
        this.logger.error(`Failed to send OTP via email: ${error.message}`);
        throw new BadRequestException('Failed to send verification code. Please try again later.');
      }
    }

    // Development fallback: log OTP to console
    this.logger.warn(`[DEV] OTP for ${email}: ${code}`);
    return { success: true, email, devCode: code };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyOtp(email: string, otp: string) {
    if (!email || !otp) throw new BadRequestException('Email and OTP required');
    const entry = this.store.get(email);
    if (!entry) throw new BadRequestException('OTP not requested');
    if (Date.now() > entry.expiresAt) {
      this.store.delete(email);
      throw new BadRequestException('OTP expired');
    }
    if (entry.code !== otp) throw new BadRequestException('Invalid OTP');

    this.store.delete(email);
    const user = await this.usersService.findOrCreateByEmail(email);
    
    // Check if user has completed profile
    const hasProfile = !!(user.name && user.role);
    
    // TODO: issue real JWT tied to user/email
    return { 
      success: true, 
      email, 
      userId: user._id?.toString?.() ?? '', 
      token: 'jwt-token-placeholder',
      hasProfile,
      role: user.role,
      name: user.name
    };
  }

  async adminLogin(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password required');
    }

    // Find admin user by email
    const admin = await this.usersService.findByEmail(email);
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

    // Send OTP for MFA verification via email
    const code = this.generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    this.store.set(`admin_${email}`, { code, expiresAt });

    // Try to send via email in production
    if (process.env.NODE_ENV === 'production' && this.emailTransporter) {
      try {
        await this.emailTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'LeboLink Admin Verification Code',
          html: `
            <h2>Admin Login Verification</h2>
            <p>Enter this code to verify your admin login:</p>
            <h1 style="color: #dc3545; font-size: 32px; letter-spacing: 2px;">${code}</h1>
            <p>This code expires in 15 minutes.</p>
            <p>If you didn't request this code, please contact your administrator.</p>
          `,
        });
        this.logger.log(`Admin verification email sent to ${email}`);
        return { 
          success: true, 
          message: 'Verification code sent to admin email',
          email,
          requiresOtp: true
        };
      } catch (error) {
        this.logger.error(`Failed to send admin OTP via email: ${error.message}`);
        throw new BadRequestException('Failed to send verification code. Please try again later.');
      }
    }

    // Development fallback: log OTP to console
    this.logger.warn(`[DEV] Admin OTP for ${email}: ${code}`);
    return { 
      success: true, 
      message: 'Verification code sent to admin email',
      email,
      requiresOtp: true,
      devCode: code 
    };
  }

  async verifyAdminOtp(email: string, otp: string) {
    if (!email || !otp) throw new BadRequestException('Email and OTP required');
    
    const entry = this.store.get(`admin_${email}`);
    if (!entry) throw new BadRequestException('OTP not requested or admin login not initiated');
    if (Date.now() > entry.expiresAt) {
      this.store.delete(`admin_${email}`);
      throw new BadRequestException('OTP expired');
    }
    if (entry.code !== otp) throw new BadRequestException('Invalid OTP');

    this.store.delete(`admin_${email}`);
    
    // Find admin by email
    const admin = await this.usersService.findByEmail(email);
    if (!admin || admin.role !== 'admin') {
      throw new BadRequestException('Admin not found');
    }

    return { 
      success: true, 
      email, 
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
    if (!body.email || !body.otp) throw new BadRequestException('Email and OTP required');

    // Verify OTP
    const entry = this.store.get(body.email);
    if (!entry) throw new BadRequestException('OTP not requested');
    if (Date.now() > entry.expiresAt) {
      this.store.delete(body.email);
      throw new BadRequestException('OTP expired');
    }
    if (entry.code !== body.otp) throw new BadRequestException('Invalid OTP');

    this.store.delete(body.email);

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
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
    };
  }

  async passwordLogin(email: string, password: string) {
    if (!email || !password) throw new BadRequestException('Email and password required');
    
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('Invalid email or password');
    if (user.isDeleted) throw new BadRequestException('Account deleted');
    if (user.accountStatus === 'blocked') throw new BadRequestException('Your account is blocked by admin');
    if (user.accountStatus === 'deactivated') throw new BadRequestException('Your account is deactivated by admin');
    
    // Check which password field is used (password or passwordHash)
    const storedPassword = user.password || user.passwordHash;
    if (!storedPassword) throw new BadRequestException('Invalid email or password');
    
    // Compare plain password with hashed password
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    if (!isPasswordValid) throw new BadRequestException('Invalid email or password');
    
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
      email: user.email,
      phone: user.phone,
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
