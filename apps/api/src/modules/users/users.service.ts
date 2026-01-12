import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string) {
    return this.userModel.findById(id).lean();
  }

  async updateUser(id: string, payload: { 
    name?: string; 
    email?: string; 
    phone?: string;
    profileImage?: string;
    settings?: {
      availability?: boolean;
      autoAcceptJobs?: boolean;
      maxJobsPerDay?: number;
      workRadius?: number;
      pushNotifications?: boolean;
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      bookingAlerts?: boolean;
      paymentAlerts?: boolean;
      promotionAlerts?: boolean;
      soundEnabled?: boolean;
      vibrationEnabled?: boolean;
      showPhoneNumber?: boolean;
      showLastSeen?: boolean;
      allowReviews?: boolean;
      language?: string;
      currency?: string;
    };
  }) {
    const user = await this.userModel.findById(id);
    if (!user) throw new Error('User not found');
    
    if (payload.name) user.name = payload.name;
    if (payload.email) user.email = payload.email;
    if (payload.phone) user.phone = payload.phone;
    if (payload.profileImage !== undefined) user.profileImage = payload.profileImage;
    if (payload.settings) {
      user.settings = {
        ...user.settings,
        ...payload.settings,
      };
    }
    
    await user.save();
    return user.toObject();
  }

  async findByPhoneAndPassword(phone: string, password: string) {
    return this.userModel.findOne({ phone, password }).lean();
  }

  async findByPhone(phone: string) {
    return this.userModel.findOne({ phone }).lean();
  }

  async findOrCreateByPhone(phone: string, role: 'worker' | 'customer' | 'admin' = 'worker') {
    const user = await this.userModel.findOne({ phone });
    if (user) return user.toObject();

    const createdUser = await this.userModel.create({ phone, role });
    return createdUser.toObject();
  }

  async registerUser(payload: {
    phone: string;
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'worker';
  }) {
    const existing = await this.userModel.findOne({ phone: payload.phone });
    if (existing) {
      existing.name = payload.name ?? existing.name;
      existing.email = payload.email ?? existing.email;
      existing.password = payload.password ?? existing.password;
      existing.role = payload.role;
      await existing.save();
      return existing.toObject();
    }

    const created = await this.userModel.create({
      phone: payload.phone,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
    });
    return created.toObject();
  }

  async registerWorker(payload: {
    phone: string;
    name: string;
    skills?: string[];
    kyc?: { idType?: string; idNumber?: string; documentUrl?: string };
  }) {
    const existing = await this.userModel.findOne({ phone: payload.phone });
    if (existing) {
      existing.name = payload.name ?? existing.name;
      existing.role = 'worker';
      existing.skills = payload.skills ?? existing.skills;
      existing.kyc = {
        idType: payload.kyc?.idType,
        idNumber: payload.kyc?.idNumber,
        documentUrl: payload.kyc?.documentUrl,
        status: 'pending',
      };
      await existing.save();
      return existing.toObject();
    }

    const created = await this.userModel.create({
      phone: payload.phone,
      name: payload.name,
      role: 'worker',
      skills: payload.skills ?? [],
      kyc: {
        idType: payload.kyc?.idType,
        idNumber: payload.kyc?.idNumber,
        documentUrl: payload.kyc?.documentUrl,
        status: 'pending',
      },
    });
    return created.toObject();
  }

  async createAdmin(payload: {
    phone: string;
    name: string;
    role: 'admin';
    passwordHash: string;
  }) {
    const existing = await this.userModel.findOne({ 
      phone: payload.phone
    });
    
    if (existing) {
      console.log('[SEED] Admin user already exists');
      return existing.toObject();
    }

    const created = await this.userModel.create({
      phone: payload.phone,
      name: payload.name,
      role: payload.role,
      passwordHash: payload.passwordHash,
      skills: [],
      location: undefined, // Admin doesn't need location
    });
    
    return created.toObject();
  }



  async searchWorkers(q?: string, category?: string) {
    const query: any = { role: 'worker' };
    if (category) {
      query.skills = { $in: [new RegExp(category, 'i')] };
    }
    const docs = await this.userModel.find(query).limit(25).lean();

    const normalized = docs
      .filter((u) => {
        if (!q) return true;
        const term = q.toLowerCase();
        const inName = (u.name || '').toLowerCase().includes(term);
        const inSkills = (u.skills || []).some((s) => s.toLowerCase().includes(term));
        return inName || inSkills;
      })
      .map((u) => ({
        id: u._id?.toString?.() ?? '',
        name: u.name || `Worker ${u.phone}`,
        skill: (u.skills && u.skills[0]) || 'General',
        category: ((u.skills?.[0] ?? 'general')).toLowerCase(),
        price: `₹${400 + Math.floor(Math.random() * 200)}/hr`,
        distanceKm: Math.round(Math.random() * 3 * 10) / 10 + 0.5,
        rating: 4.5 + Math.random() * 0.5,
        jobs: 50 + Math.floor(Math.random() * 150),
        verified: (u.kyc?.status ?? 'pending') === 'verified',
      }));

    return { workers: normalized };
  }
}
