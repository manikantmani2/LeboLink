import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(private readonly usersService: UsersService) {}

  async adminLogin(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password required');
    }

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

    const storedPassword = admin.password || admin.passwordHash;
    if (!storedPassword) throw new BadRequestException('Admin password not set');

    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid admin credentials');
    }

    return {
      success: true,
      email,
      userId: admin._id?.toString?.() ?? '',
      token: 'jwt-admin-token-placeholder',
      role: 'admin',
      name: admin.name,
    };
  }

  async register(body: {
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
    if (!body.email && !body.phone) {
      throw new BadRequestException('Email or Phone is required');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const userData: any = {
      name: body.name,
      password: hashedPassword,
      role: body.role,
    };

    if (body.email) userData.email = body.email;
    if (body.phone) userData.phone = body.phone.replace(/\D/g, '');

    if (body.role === 'worker') {
      userData.jobCategory = body.jobCategory;
      userData.paymentPerHour = body.paymentPerHour;
      userData.preferredLocation = body.preferredLocation;
      userData.nextAvailableDate = body.nextAvailableDate;
    }

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
    if (!body.email && !body.phone) {
      throw new BadRequestException('Email or Phone is required');
    }
    if (!body.password) {
      throw new BadRequestException('Password is required');
    }

    let user = null;
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

    const storedPassword = user.password || user.passwordHash;
    if (!storedPassword) throw new BadRequestException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(body.password, storedPassword);
    if (!isPasswordValid) throw new BadRequestException('Invalid credentials');

    const hasProfile = !!(user.name && user.role);
    const workerApprovalStatus = user.role === 'worker' ? (user.workerApproval?.status || 'pending') : undefined;
    const canWork = user.role === 'worker' ? user.accountStatus === 'active' && workerApprovalStatus === 'approved' : true;

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
}
