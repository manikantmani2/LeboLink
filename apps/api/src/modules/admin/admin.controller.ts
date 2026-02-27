import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, UseGuards, Headers } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { AuditActionType } from './admin-audit-log.schema';

@Controller({ path: 'v1/admin' })
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('analytics')
  async getAnalytics(@Query('period') period?: 'week' | 'month' | 'year') {
    return this.adminService.getAnalytics(period);
  }

  // User Management
  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      role,
      search,
    );
  }

  @Get('users/:id')
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateUser(id, data);
  }

  @Patch('users/:id/block')
  async blockUser(
    @Param('id') id: string,
    @Headers('x-admin-id') adminId: string,
    @Body('note') note?: string,
  ) {
    return this.adminService.changeUserAccountStatus(id, 'blocked', adminId, note);
  }

  @Patch('users/:id/deactivate')
  async deactivateUser(
    @Param('id') id: string,
    @Headers('x-admin-id') adminId: string,
    @Body('note') note?: string,
  ) {
    return this.adminService.changeUserAccountStatus(id, 'deactivated', adminId, note);
  }

  @Patch('users/:id/activate')
  async activateUser(
    @Param('id') id: string,
    @Headers('x-admin-id') adminId: string,
    @Body('note') note?: string,
  ) {
    return this.adminService.changeUserAccountStatus(id, 'active', adminId, note);
  }

  @Get('users/export/csv')
  async exportUsersCsv(
    @Query('role') role: string | undefined,
    @Res() res: Response,
  ) {
    const rows = await this.adminService.getUsersExportRows(role);
    const headers = [
      'id',
      'name',
      'email',
      'phone',
      'role',
      'accountStatus',
      'workerApprovalStatus',
      'kycStatus',
      'jobCategory',
      'paymentPerHour',
      'preferredLocation',
      'createdAt',
    ];

    const escapeCsv = (value: string | number) => {
      const str = String(value ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => escapeCsv((row as any)[h] ?? '')).join(',')),
    ];

    const csv = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="users-export-${Date.now()}.csv"`);
    return res.send(csv);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Headers('x-admin-id') adminId: string) {
    return this.adminService.deleteUser(id, adminId);
  }

  @Get('workers/pending-approval')
  async getPendingWorkerApprovals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getPendingWorkerApprovals(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    );
  }

  @Patch('workers/:id/approval')
  async setWorkerApprovalStatus(
    @Param('id') id: string,
    @Body() body: { status: 'approved' | 'rejected' | 'suspended'; adminId: string; reason?: string },
  ) {
    return this.adminService.setWorkerApprovalStatus(id, body);
  }

  // KYC Management
  @Get('kyc/pending')
  async getPendingKyc(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getPendingKyc(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post('kyc/:userId/verify')
  async verifyKyc(@Param('userId') userId: string) {
    return this.adminService.updateKycStatus(userId, 'verified');
  }

  @Post('kyc/:userId/reject')
  async rejectKyc(
    @Param('userId') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.updateKycStatus(userId, 'rejected', reason);
  }

  // Booking Management
  @Get('bookings')
  async getBookings(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllBookings(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
    );
  }

  @Get('revenue/summary')
  async getRevenueSummary() {
    return this.adminService.getRevenueSummary();
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('adminId') adminId?: string,
    @Query('targetUserId') targetUserId?: string,
    @Query('actionType') actionType?: AuditActionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getAuditLogs({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      adminId,
      targetUserId,
      actionType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}
