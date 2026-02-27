import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { Booking, BookingDocument } from '../bookings/booking.schema';
import { Payment, PaymentDocument } from '../payments/payment.schema';
import { Review, ReviewDocument } from '../reviews/review.schema';
import { AdminAuditLog, AdminAuditLogDocument, AuditActionType } from './admin-audit-log.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(AdminAuditLog.name) private auditLogModel: Model<AdminAuditLogDocument>,
  ) {}

  // Dashboard Statistics
  async getDashboardStats() {
    const [
      totalUsers,
      totalWorkers,
      approvedWorkers,
      pendingWorkerApprovals,
      totalCustomers,
      blockedUsers,
      deactivatedUsers,
      totalBookings,
      activeBookings,
      completedBookings,
      totalRevenue,
      pendingKyc,
    ] = await Promise.all([
      this.userModel.countDocuments({ isDeleted: { $ne: true } }),
      this.userModel.countDocuments({ role: 'worker', isDeleted: { $ne: true } }),
      this.userModel.countDocuments({ role: 'worker', isDeleted: { $ne: true }, 'workerApproval.status': 'approved' }),
      this.userModel.countDocuments({ role: 'worker', isDeleted: { $ne: true }, 'workerApproval.status': 'pending' }),
      this.userModel.countDocuments({ role: 'customer', isDeleted: { $ne: true } }),
      this.userModel.countDocuments({ isDeleted: { $ne: true }, accountStatus: 'blocked' }),
      this.userModel.countDocuments({ isDeleted: { $ne: true }, accountStatus: 'deactivated' }),
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({ status: { $in: ['requested', 'accepted', 'in-progress'] } }),
      this.bookingModel.countDocuments({ status: 'completed' }),
      this.paymentModel.aggregate([
        { $match: { status: { $in: ['succeeded', 'cod_collected'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then(r => r[0]?.total || 0),
      this.userModel.countDocuments({ isDeleted: { $ne: true }, 'kyc.status': 'pending' }),
    ]);

    // Get recent activities
    const recentBookings = await this.bookingModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const recentUsers = await this.userModel
      .find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name phone role createdAt accountStatus workerApproval')
      .lean();

    return {
      statistics: {
        totalUsers,
        totalWorkers,
        approvedWorkers,
        pendingWorkerApprovals,
        totalCustomers,
        blockedUsers,
        deactivatedUsers,
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
        accountStatus: (u as any).accountStatus || 'active',
        workerApprovalStatus: (u as any).workerApproval?.status,
        createdAt: (u as any).createdAt,
      })),
    };
  }

  // User Management
  async getAllUsers(page = 1, limit = 20, role?: string, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = { isDeleted: { $ne: true } };
    
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
        accountStatus: (u as any).accountStatus || 'active',
        workerApprovalStatus: (u as any).workerApproval?.status || (u.role === 'worker' ? 'pending' : undefined),
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
    const user = await this.userModel.findOne({ _id: userId, isDeleted: { $ne: true } }).lean();
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
        accountStatus: (user as any).accountStatus || 'active',
        workerApproval: (user as any).workerApproval,
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

  async changeUserAccountStatus(
    userId: string,
    status: 'active' | 'blocked' | 'deactivated',
    adminId: string,
    note?: string,
  ) {
    const user = await this.userModel.findOne({ _id: userId, isDeleted: { $ne: true } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'admin' && status !== 'active') {
      throw new ForbiddenException('Admin users cannot be blocked or deactivated');
    }

    const admin = await this.userModel.findById(adminId);
    if (!admin) throw new NotFoundException('Admin not found');

    const previousStatus = user.accountStatus || 'active';
    user.accountStatus = status;
    if (note) {
      user.moderationNote = note;
    }
    await user.save();

    // Create audit log
    let actionType: AuditActionType;
    if (status === 'blocked') actionType = AuditActionType.BLOCK_USER;
    else if (status === 'deactivated') actionType = AuditActionType.DEACTIVATE_USER;
    else actionType = AuditActionType.ACTIVATE_USER;

    await this.createAuditLog({
      actionType,
      adminId,
      adminName: admin.name || 'Unknown Admin',
      targetUserId: userId,
      targetUserName: user.name || 'Unknown User',
      targetUserRole: user.role,
      previousValue: previousStatus,
      newValue: status,
      reason: note,
    });

    return {
      success: true,
      message: `User ${status} successfully`,
      user: user.toObject(),
    };
  }

  async getPendingWorkerApprovals(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const query: any = {
      role: 'worker',
      isDeleted: { $ne: true },
      'workerApproval.status': 'pending',
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [workers, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      this.userModel.countDocuments(query),
    ]);

    return {
      workers: workers.map((u) => ({
        id: u._id?.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone,
        skills: u.skills,
        jobCategory: u.jobCategory,
        paymentPerHour: u.paymentPerHour,
        preferredLocation: u.preferredLocation,
        kycStatus: u.kyc?.status || 'not_submitted',
        workerApprovalStatus: u.workerApproval?.status || 'pending',
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

  async setWorkerApprovalStatus(
    workerId: string,
    payload: { status: 'approved' | 'rejected' | 'suspended'; adminId: string; reason?: string },
  ) {
    const worker = await this.userModel.findOne({ _id: workerId, role: 'worker', isDeleted: { $ne: true } });
    if (!worker) throw new NotFoundException('Worker not found');

    const admin = await this.userModel.findById(payload.adminId);
    if (!admin) throw new NotFoundException('Admin not found');

    const previousStatus = worker.workerApproval?.status || 'pending';
    const now = new Date();
    worker.workerApproval = {
      ...(worker.workerApproval || {}),
      status: payload.status,
      updatedAt: now,
      ...(payload.status === 'approved'
        ? { approvedAt: now, approvedBy: payload.adminId, rejectionReason: undefined, rejectedAt: undefined, rejectedBy: undefined }
        : {}),
      ...(payload.status === 'rejected' || payload.status === 'suspended'
        ? { rejectedAt: now, rejectedBy: payload.adminId, rejectionReason: payload.reason || 'Rejected by admin' }
        : {}),
    };

    if (payload.status === 'approved') {
      worker.accountStatus = 'active';
    }

    await worker.save();

    // Create audit log
    let actionType: AuditActionType;
    if (payload.status === 'approved') actionType = AuditActionType.APPROVE_WORKER;
    else if (payload.status === 'rejected') actionType = AuditActionType.REJECT_WORKER;
    else actionType = AuditActionType.SUSPEND_WORKER;

    await this.createAuditLog({
      actionType,
      adminId: payload.adminId,
      adminName: admin.name || 'Unknown Admin',
      targetUserId: workerId,
      targetUserName: worker.name || 'Unknown Worker',
      targetUserRole: worker.role,
      previousValue: previousStatus,
      newValue: payload.status,
      reason: payload.reason,
    });

    return {
      success: true,
      message: `Worker ${payload.status} successfully`,
      worker: worker.toObject(),
    };
  }

  async deleteUser(userId: string, adminId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const admin = await this.userModel.findById(adminId);
    if (!admin) throw new NotFoundException('Admin not found');

    // Check if user has active bookings
    const activeBookings = await this.bookingModel.countDocuments({
      $or: [{ customerId: userId }, { workerId: userId }],
      status: { $in: ['requested', 'accepted', 'in-progress'] },
    });

    if (activeBookings > 0) {
      throw new ForbiddenException('Cannot delete user with active bookings');
    }

    const previousStatus = user.accountStatus || 'active';
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.deletedBy = adminId;
    user.accountStatus = 'deactivated';
    await user.save();

    // Create audit log
    await this.createAuditLog({
      actionType: AuditActionType.DELETE_USER,
      adminId,
      adminName: admin.name || 'Unknown Admin',
      targetUserId: userId,
      targetUserName: user.name || 'Unknown User',
      targetUserRole: user.role,
      previousValue: previousStatus,
      newValue: 'deleted',
      metadata: { activeBookingsCount: activeBookings },
    });
    return { success: true, message: 'User deleted successfully' };
  }

  // KYC Management
  async getPendingKyc(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel
        .find({ 'kyc.status': 'pending' })
        .find({ isDeleted: { $ne: true } })
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

  async getRevenueSummary() {
    const [totalRevenue, todayRevenue, monthRevenue] = await Promise.all([
      this.paymentModel
        .aggregate([
          { $match: { status: { $in: ['succeeded', 'cod_collected'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .then((r) => r[0]?.total || 0),
      this.paymentModel
        .aggregate([
          {
            $match: {
              status: { $in: ['succeeded', 'cod_collected'] },
              createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .then((r) => r[0]?.total || 0),
      this.paymentModel
        .aggregate([
          {
            $match: {
              status: { $in: ['succeeded', 'cod_collected'] },
              createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .then((r) => r[0]?.total || 0),
    ]);

    return {
      totalRevenue,
      todayRevenue,
      monthRevenue,
    };
  }

  async getUsersExportRows(role?: string) {
    const query: any = { isDeleted: { $ne: true } };
    if (role && ['worker', 'customer', 'admin'].includes(role)) {
      query.role = role;
    }

    const users = await this.userModel.find(query).sort({ createdAt: -1 }).lean();

    return users.map((u) => ({
      id: u._id?.toString() || '',
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || '',
      accountStatus: (u as any).accountStatus || 'active',
      workerApprovalStatus: u.workerApproval?.status || '',
      kycStatus: u.kyc?.status || '',
      jobCategory: u.jobCategory || '',
      paymentPerHour: u.paymentPerHour || '',
      preferredLocation: u.preferredLocation || '',
      createdAt: (u as any).createdAt ? new Date((u as any).createdAt).toISOString() : '',
    }));
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

  // Audit Logging
  private async createAuditLog(payload: {
    actionType: AuditActionType;
    adminId: string | Types.ObjectId;
    targetUserId: string | Types.ObjectId;
    targetUserName: string;
    targetUserRole: string;
    adminName: string;
    previousValue?: string;
    newValue?: string;
    reason?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const auditLog = new this.auditLogModel({
        actionType: payload.actionType,
        adminId: new Types.ObjectId(payload.adminId.toString()),
        adminName: payload.adminName,
        targetUserId: new Types.ObjectId(payload.targetUserId.toString()),
        targetUserName: payload.targetUserName,
        targetUserRole: payload.targetUserRole,
        previousValue: payload.previousValue,
        newValue: payload.newValue,
        reason: payload.reason,
        metadata: payload.metadata,
        performedAt: new Date(),
      });
      await auditLog.save();
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Failed to create audit log:', error);
    }
  }

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    adminId?: string;
    targetUserId?: string;
    actionType?: AuditActionType;
    startDate?: Date;
    endDate?: Date;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (params.adminId) {
      query.adminId = new Types.ObjectId(params.adminId);
    }

    if (params.targetUserId) {
      query.targetUserId = new Types.ObjectId(params.targetUserId);
    }

    if (params.actionType) {
      query.actionType = params.actionType;
    }

    if (params.startDate || params.endDate) {
      query.performedAt = {};
      if (params.startDate) query.performedAt.$gte = params.startDate;
      if (params.endDate) query.performedAt.$lte = params.endDate;
    }

    const [logs, total] = await Promise.all([
      this.auditLogModel.find(query).sort({ performedAt: -1 }).skip(skip).limit(limit).lean(),
      this.auditLogModel.countDocuments(query),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log._id?.toString(),
        actionType: log.actionType,
        adminId: log.adminId?.toString(),
        adminName: log.adminName,
        targetUserId: log.targetUserId?.toString(),
        targetUserName: log.targetUserName,
        targetUserRole: log.targetUserRole,
        previousValue: log.previousValue,
        newValue: log.newValue,
        reason: log.reason,
        metadata: log.metadata,
        performedAt: log.performedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
