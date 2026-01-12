import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { Booking, BookingDocument } from '../bookings/booking.schema';
import { Payment, PaymentDocument } from '../payments/payment.schema';
import { Review, ReviewDocument } from '../reviews/review.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  // Dashboard Statistics
  async getDashboardStats() {
    const [
      totalUsers,
      totalWorkers,
      totalCustomers,
      totalBookings,
      activeBookings,
      completedBookings,
      totalRevenue,
      pendingKyc,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: 'worker' }),
      this.userModel.countDocuments({ role: 'customer' }),
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({ status: { $in: ['requested', 'accepted', 'in-progress'] } }),
      this.bookingModel.countDocuments({ status: 'completed' }),
      this.bookingModel.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then(r => r[0]?.total || 0),
      this.userModel.countDocuments({ 'kyc.status': 'pending' }),
    ]);

    // Get recent activities
    const recentBookings = await this.bookingModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentUsers = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name phone role createdAt')
      .lean();

    return {
      statistics: {
        totalUsers,
        totalWorkers,
        totalCustomers,
        totalBookings,
        activeBookings,
        completedBookings,
        totalRevenue,
        pendingKyc,
      },
      recentBookings: recentBookings.map(b => ({
        id: b._id?.toString(),
        serviceName: b.serviceName,
        status: b.status,
        amount: b.amount,
        createdAt: b.createdAt,
      })),
      recentUsers: recentUsers.map(u => ({
        id: u._id?.toString(),
        name: u.name,
        phone: u.phone,
        role: u.role,
        createdAt: (u as any).createdAt,
      })),
    };
  }

  // User Management
  async getAllUsers(page = 1, limit = 20, role?: string, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};
    
    if (role && ['worker', 'customer', 'admin'].includes(role)) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.userModel.countDocuments(query),
    ]);

    return {
      users: users.map(u => ({
        id: u._id?.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        skills: u.skills,
        kycStatus: u.kyc?.status || 'not_submitted',
        profileImage: u.profileImage,
        createdAt: (u as any).createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');

    const [bookingsCount, completedBookings, totalEarnings, reviews] = await Promise.all([
      this.bookingModel.countDocuments({
        $or: [{ customerId: userId }, { workerId: userId }],
      }),
      this.bookingModel.countDocuments({
        workerId: userId,
        status: 'completed',
      }),
      this.bookingModel.aggregate([
        { $match: { workerId: userId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then(r => r[0]?.total || 0),
      this.reviewModel.find({ workerId: userId }).limit(5).lean(),
    ]);

    return {
      user: {
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        skills: user.skills,
        profileImage: user.profileImage,
        settings: user.settings,
        kyc: user.kyc,
        location: user.location,
        createdAt: (user as any).createdAt,
      },
      statistics: {
        bookingsCount,
        completedBookings,
        totalEarnings,
        reviewsCount: reviews.length,
        averageRating: reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length 
          : 0,
      },
      recentReviews: reviews.map(r => ({
        id: r._id?.toString(),
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
    };
  }

  async updateUser(userId: string, data: any) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true },
    ).lean();
    
    if (!user) throw new NotFoundException('User not found');
    return { success: true, user };
  }

  async deleteUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Check if user has active bookings
    const activeBookings = await this.bookingModel.countDocuments({
      $or: [{ customerId: userId }, { workerId: userId }],
      status: { $in: ['requested', 'accepted', 'in-progress'] },
    });

    if (activeBookings > 0) {
      throw new ForbiddenException('Cannot delete user with active bookings');
    }

    await this.userModel.findByIdAndDelete(userId);
    return { success: true, message: 'User deleted successfully' };
  }

  // KYC Management
  async getPendingKyc(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel
        .find({ 'kyc.status': 'pending' })
        .skip(skip)
        .limit(limit)
        .sort({ 'kyc.submittedAt': -1 })
        .lean(),
      this.userModel.countDocuments({ 'kyc.status': 'pending' }),
    ]);

    return {
      kycRequests: users.map(u => ({
        id: u._id?.toString(),
        name: u.name,
        phone: u.phone,
        email: u.email,
        kyc: u.kyc,
        createdAt: (u as any).createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateKycStatus(userId: string, status: 'verified' | 'rejected', reason?: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (!user.kyc) throw new NotFoundException('No KYC found for this user');

    user.kyc.status = status;
    if (reason) {
      (user.kyc as any).rejectionReason = reason;
    }
    await user.save();

    return { success: true, message: `KYC ${status}`, user: user.toObject() };
  }

  // Booking Management
  async getAllBookings(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};
    
    if (status && ['requested', 'accepted', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const [bookings, total] = await Promise.all([
      this.bookingModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.bookingModel.countDocuments(query),
    ]);

    // Populate user details
    const bookingsWithUsers = await Promise.all(
      bookings.map(async (booking) => {
        const [customer, worker] = await Promise.all([
          this.userModel.findById(booking.customerId).select('name phone').lean(),
          this.userModel.findById(booking.workerId).select('name phone').lean(),
        ]);

        return {
          id: booking._id?.toString(),
          serviceName: booking.serviceName,
          status: booking.status,
          amount: booking.amount,
          paymentStatus: booking.paymentStatus,
          customer: customer ? { id: customer._id?.toString(), name: customer.name, phone: customer.phone } : null,
          worker: worker ? { id: worker._id?.toString(), name: worker.name, phone: worker.phone } : null,
          location: booking.location,
          createdAt: booking.createdAt,
        };
      }),
    );

    return {
      bookings: bookingsWithUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Analytics
  async getAnalytics(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const [
      bookingsByDay,
      revenueByDay,
      topWorkers,
      bookingsByStatus,
      userGrowth,
    ] = await Promise.all([
      // Bookings trend
      this.bookingModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      
      // Revenue trend
      this.bookingModel.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      
      // Top workers
      this.bookingModel.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
        {
          $group: {
            _id: '$workerId',
            totalBookings: { $sum: 1 },
            totalEarnings: { $sum: '$amount' },
          },
        },
        { $sort: { totalEarnings: -1 } },
        { $limit: 10 },
      ]),
      
      // Bookings by status
      this.bookingModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      
      // User growth
      this.userModel.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Populate worker details for top workers
    const topWorkersWithDetails = await Promise.all(
      topWorkers.map(async (w) => {
        const worker = await this.userModel.findById(w._id).select('name phone skills').lean();
        return {
          workerId: w._id,
          name: worker?.name || 'Unknown',
          phone: worker?.phone,
          skills: worker?.skills,
          totalBookings: w.totalBookings,
          totalEarnings: w.totalEarnings,
        };
      }),
    );

    return {
      period,
      bookingsTrend: bookingsByDay,
      revenueTrend: revenueByDay,
      topWorkers: topWorkersWithDetails,
      bookingsByStatus,
      userGrowth,
    };
  }
}
