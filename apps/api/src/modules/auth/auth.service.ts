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
    if (!email) throw new BadRequestException('Email is required to send OTP');
    
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Please provide a valid email address');
    }

    const code = this.generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    this.store.set(email, { code, expiresAt });

    // Always try to send via email
    const emailSent = await this.sendVerificationEmail(email, code);

    // If email failed in production, throw error; in dev, allow fallback
    if (!emailSent && process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Failed to send verification code. Please check your email address and try again.');
    }

    // Development/Fallback: return dev code for testing
    this.logger.log(`OTP sent to ${email} - Code: ${code}`);
    return { 
      success: true, 
      email,
      ...(process.env.NODE_ENV !== 'production' && { devCode: code }) // Only expose devCode in development
    };
  }

  private async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    // Try to send via email if transporter is available
    if (this.emailTransporter) {
      try {
        await this.emailTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'LeboLink Email Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
                <h1 style="margin: 0; font-size: 28px;">LeboLink Verification</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
                <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">Hi there!</p>
                <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">We received a request to verify your email address for your LeboLink account.</p>
                
                <div style="background: white; padding: 20px; border: 2px solid #667eea; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase;">Your Verification Code</p>
                  <p style="color: #667eea; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 2px;">${code}</p>
                  <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">This code expires in 15 minutes</p>
                </div>

                <p style="color: #333; font-size: 14px; margin: 20px 0 0 0;">
                  <strong>Don't share this code with anyone.</strong> LeboLink will never ask you for this code.
                </p>
                <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                  If you didn't request this verification, you can safely ignore this email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 11px; margin: 0; text-align: center;">
                  © 2026 LeboLink. All rights reserved. | <a href="https://lebolink.com" style="color: #667eea; text-decoration: none;">Visit Website</a>
                </p>
              </div>
            </div>
          `,
        });
        this.logger.log(`OTP email successfully sent to ${email}`);
        return true;
      } catch (error: any) {
        this.logger.error(`Failed to send OTP email to ${email}: ${error.message}`);
        return false;
      }
    }

    // No email transporter available - log for development
    this.logger.warn(`[DEV] Email transporter not configured. Code for ${email}: ${code}`);
    return process.env.NODE_ENV !== 'production'; // Allow in development without email
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

    // Send OTP for email verification
    const code = this.generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    this.store.set(`admin_${email}`, { code, expiresAt });

    // Send admin verification email
    const emailSent = await this.sendAdminVerificationEmail(email, code);

    // If email failed in production, throw error; in dev, allow fallback
    if (!emailSent && process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Failed to send verification code. Please check your email and try again.');
    }

    // Development/Fallback: return dev code for testing
    this.logger.log(`Admin verification code sent to ${email} - Code: ${code}`);
    return { 
      success: true, 
      message: 'Verification code sent to admin email',
      email,
      requiresOtp: true,
      ...(process.env.NODE_ENV !== 'production' && { devCode: code })
    };
  }

  private async sendAdminVerificationEmail(email: string, code: string): Promise<boolean> {
    // Try to send via email if transporter is available
    if (this.emailTransporter) {
      try {
        await this.emailTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'LeboLink Admin Verification Code - Security Alert',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
                <h1 style="margin: 0; font-size: 28px;">🔐 Admin Verification Required</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
                <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">An admin login attempt was made on your LeboLink account.</p>
                
                <div style="background: white; padding: 20px; border: 2px solid #dc3545; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <p style="color: #999; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase;">Verification Code</p>
                  <p style="color: #dc3545; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 2px;">${code}</p>
                  <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">This code expires in 15 minutes</p>
                </div>

                <p style="color: #333; font-size: 14px; margin: 20px 0 0 0;">
                  <strong>⚠️ Security Notice:</strong> Never share this code with anyone. LeboLink staff will never ask for this code.
                </p>
                <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                  If you didn't attempt to login, please change your password immediately and contact support.
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #999; font-size: 11px; margin: 0; text-align: center;">
                  © 2026 LeboLink. All rights reserved.
                </p>
              </div>
            </div>
          `,
        });
        this.logger.log(`Admin verification email successfully sent to ${email}`);
        return true;
      } catch (error: any) {
        this.logger.error(`Failed to send admin verification email to ${email}: ${error.message}`);
        return false;
      }
    }

    // No email transporter available - log for development
    this.logger.warn(`[DEV] Email transporter not configured. Admin code for ${email}: ${code}`);
    return process.env.NODE_ENV !== 'production'; // Allow in development without email
  }
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
    phone?: string;
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
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role,
    };

    // Add phone if provided
    if (body.phone) {
      userData.phone = body.phone;
    }

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
      phone: user.phone || null,
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
