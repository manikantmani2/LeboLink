import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import * as nodemailer from 'nodemailer';

// Twilio uses CommonJS export, so we use require
const twilio = require('twilio');

type OtpEntry = { code: string; expiresAt: number };
type SmsSendResult = { success: true } | { success: false; message: string };

// Global store to persist across hot-reloads
const globalOtpStore = new Map<string, OtpEntry>();

@Injectable()
export class AuthService {
  private store: Map<string, OtpEntry> = globalOtpStore;
  private emailTransporter: nodemailer.Transporter | null = null;
  private twilioClient: any = null;
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

    // Initialize Twilio for SMS
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      this.logger.log('Twilio SMS service initialized');
    }
  }

  // ====== EMAIL OTP ======
  async sendEmailOtp(email: string) {
    if (!email) throw new BadRequestException('Email is required to send OTP');
    
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Please provide a valid email address');
    }

    const code = this.generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    this.store.set(`email_${email}`, { code, expiresAt });

    // Try to send via email
    const emailSent = await this.sendVerificationEmail(email, code);

    // If email failed in production, throw error; in dev, allow fallback
    if (!emailSent && process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Failed to send verification code. Please check your email address and try again.');
    }

    this.logger.log(`Email OTP sent to ${email} - Code: ${code}`);
    return { 
      success: true, 
      email,
      method: 'email',
      ...(process.env.NODE_ENV !== 'production' && { devCode: code })
    };
  }

  async verifyEmailOtp(email: string, otp: string) {
    if (!email || !otp) throw new BadRequestException('Email and OTP required');
    
    const entry = this.store.get(`email_${email}`);
    if (!entry) throw new BadRequestException('OTP not requested');
    if (Date.now() > entry.expiresAt) {
      this.store.delete(`email_${email}`);
      throw new BadRequestException('OTP expired');
    }
    if (entry.code !== otp) throw new BadRequestException('Invalid OTP');

    this.store.delete(`email_${email}`);
    const user = await this.usersService.findOrCreateByEmail(email);
    
    // Check if user has completed profile
    const hasProfile = !!(user.name && user.role);
    
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

  // ====== SMS OTP ======
  async sendSmsOtp(phone: string) {
    if (!phone) throw new BadRequestException('Phone is required to send OTP');
    
    // Validate phone format (Indian: 10 digits, starts with 6-9)
    if (!this.isValidIndianPhone(phone)) {
      throw new BadRequestException('Please provide a valid Indian phone number (10 digits, starting with 6-9)');
    }

    const code = this.generateCode();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    // Store with cleaned phone number (digits only)
    const cleanPhone = phone.replace(/\D/g, '');
    this.store.set(`phone_${cleanPhone}`, { code, expiresAt });

    // Try to send via SMS
    const smsResult = await this.sendVerificationSms(cleanPhone, code);

    // If SMS failed in production, throw error; in dev, allow fallback
    if (!smsResult.success && process.env.NODE_ENV === 'production') {
      throw new BadRequestException(smsResult.message);
    }

    this.logger.log(`SMS OTP sent to ${cleanPhone} - Code: ${code}`);
    return { 
      success: true, 
      phone: cleanPhone,
      method: 'sms',
      ...(process.env.NODE_ENV !== 'production' && { devCode: code })
    };
  }

  async verifySmsOtp(phone: string, otp: string) {
    if (!phone || !otp) throw new BadRequestException('Phone and OTP required');
    
    const cleanPhone = phone.replace(/\D/g, '');
    const entry = this.store.get(`phone_${cleanPhone}`);
    if (!entry) throw new BadRequestException('OTP not requested or expired');
    if (Date.now() > entry.expiresAt) {
      this.store.delete(`phone_${cleanPhone}`);
      throw new BadRequestException('OTP expired. Please request a new one.');
    }
    if (entry.code !== otp) throw new BadRequestException('Invalid OTP');

    this.store.delete(`phone_${cleanPhone}`);
    const user = await this.usersService.findOrCreateByPhone(cleanPhone);
    
    // Check if user has completed profile
    const hasProfile = !!(user.name && user.role);
    
    return { 
      success: true, 
      phone: cleanPhone, 
      userId: user._id?.toString?.() ?? '', 
      token: 'jwt-token-placeholder',
      hasProfile,
      role: user.role,
      name: user.name
    };
  }

  // ====== LEGACY METHODS (for backward compatibility) ======
  async sendOtp(email: string) {
    return this.sendEmailOtp(email);
  }

  async verifyOtp(email: string, otp: string) {
    return this.verifyEmailOtp(email, otp);
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
        this.logger.log(`Email verification sent to ${email}`);
        return true;
      } catch (error: any) {
        this.logger.error(`Failed to send email to ${email}: ${error.message}`);
        return false;
      }
    }

    this.logger.warn(`[DEV] Email transporter not configured. Code for ${email}: ${code}`);
    return process.env.NODE_ENV !== 'production';
  }

  private async sendVerificationSms(phone: string, code: string): Promise<SmsSendResult> {
    // Send SMS via Twilio if configured
    if (this.twilioClient && process.env.TWILIO_PHONE) {
      try {
        const formattedPhone = this.toIndianE164(phone);
        const formattedFrom = process.env.TWILIO_PHONE.startsWith('+')
          ? process.env.TWILIO_PHONE
          : `+${process.env.TWILIO_PHONE.replace(/\D/g, '')}`;
        
        await this.twilioClient.messages.create({
          from: formattedFrom,
          to: formattedPhone,
          body: `Your LeboLink verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nNever share this code with anyone.`
        });
        
        this.logger.log(`SMS successfully sent to ${formattedPhone}`);
        return { success: true };
      } catch (error: any) {
        const errorCode = error?.code;
        const errorMessage = error?.message || 'Unknown SMS provider error';
        this.logger.error(`Failed to send SMS to ${phone}: [${errorCode ?? 'N/A'}] ${errorMessage}`);

        if (errorCode === 21211) {
          return { success: false, message: 'Invalid phone number format. Please use a valid Indian mobile number.' };
        }
        if (errorCode === 21608) {
          return { success: false, message: 'This destination number is not enabled in Twilio trial account. Verify this phone in Twilio or upgrade account.' };
        }
        if (errorCode === 21408) {
          return { success: false, message: 'SMS permissions for this country are disabled in Twilio. Enable India (+91) in Twilio Geographic Permissions.' };
        }

        return { success: false, message: 'Failed to send verification code to phone. Please try again.' };
      }
    }

    // Development mode: just log the code
    this.logger.warn(`[DEV] SMS not configured. Code for ${phone}: ${code}`);
    if (process.env.NODE_ENV !== 'production') {
      return { success: true };
    }

    return {
      success: false,
      message: 'SMS service is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_PHONE on the API service.'
    };
  }

  private toIndianE164(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (digits.length === 10) {
      return `+91${digits}`;
    }

    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`;
    }

    return phone.startsWith('+') ? phone : `+${digits}`;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Basic phone validation - at least 10 digits
    const phoneRegex = /^\d{10,}$/;
    return phoneRegex.test(phone.replace(/[^\d]/g, ''));
  }

  private isValidIndianPhone(phone: string): boolean {
    // Indian phone validation: exactly 10 digits, starting with 6-9
    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length !== 10) {
      return false;
    }
    // First digit must be 6, 7, 8, or 9
    return /^[6-9]\d{9}$/.test(cleanPhone);
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
    // At least one of email or phone is required
    if (!body.email && !body.phone) {
      throw new BadRequestException('Email or Phone is required');
    }
    if (!body.otp) {
      throw new BadRequestException('OTP is required');
    }

    // Verify OTP based on email or phone
    let verificationKey = '';
    let cleanPhone = '';
    if (body.email) {
      verificationKey = `email_${body.email}`;
    } else if (body.phone) {
      cleanPhone = body.phone.replace(/\D/g, '');
      verificationKey = `phone_${cleanPhone}`;
    }

    const entry = this.store.get(verificationKey);
    if (!entry) throw new BadRequestException('OTP not requested');
    if (Date.now() > entry.expiresAt) {
      this.store.delete(verificationKey);
      throw new BadRequestException('OTP expired');
    }
    if (entry.code !== body.otp) throw new BadRequestException('Invalid OTP');

    this.store.delete(verificationKey);

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Prepare user data
    const userData: any = {
      name: body.name,
      password: hashedPassword,
      role: body.role,
    };

    // Add email if provided
    if (body.email) {
      userData.email = body.email;
    }

    // Add phone if provided (use cleaned version)
    if (body.phone) {
      userData.phone = cleanPhone || body.phone.replace(/\D/g, '');
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
      email: user.email || null,
      phone: user.phone || null,
      name: user.name,
      role: user.role,
    };
  }

  async passwordLogin(body: { email?: string; phone?: string; password: string }) {
    // At least one of email or phone required
    if (!body.email && !body.phone) {
      throw new BadRequestException('Email or Phone is required');
    }
    if (!body.password) {
      throw new BadRequestException('Password is required');
    }

    let user = null;

    // Find user by email or phone
    if (body.email) {
      user = await this.usersService.findByEmail(body.email);
    } else if (body.phone) {
      const cleanPhone = body.phone.replace(/\D/g, '');
      user = await this.usersService.findByPhone(cleanPhone);
    }

    if (!user) throw new BadRequestException('Invalid credentials');
    if (user.isDeleted) throw new BadRequestException('Account deleted');
    if (user.accountStatus === 'blocked') throw new BadRequestException('Your account is blocked by admin');
    if (user.accountStatus === 'deactivated') throw new BadRequestException('Your account is deactivated by admin');
    
    // Check which password field is used (password or passwordHash)
    const storedPassword = user.password || user.passwordHash;
    if (!storedPassword) throw new BadRequestException('Invalid credentials');
    
    // Compare plain password with hashed password
    const isPasswordValid = await bcrypt.compare(body.password, storedPassword);
    if (!isPasswordValid) throw new BadRequestException('Invalid credentials');
    
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
