'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

type DashboardResponse = {
  statistics: {
    totalUsers: number;
    totalWorkers: number;
    approvedWorkers: number;
    pendingWorkerApprovals: number;
    totalCustomers: number;
    blockedUsers: number;
    deactivatedUsers: number;
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    totalRevenue: number;
    pendingKyc: number;
  };
};

type RevenueSummary = {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
};

export default function AdminDashboard() {
  const { user, userId, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard-main'],
    queryFn: () =>
      apiFetch<DashboardResponse>({
        path: '/api/v1/admin/dashboard',
        headers: { 'x-admin-id': userId || '' },
      }),
    enabled: !!userId && user?.role === 'admin',
    refetchInterval: 15000,
  });

  const revenueQuery = useQuery({
    queryKey: ['admin-revenue-summary'],
    queryFn: () =>
      apiFetch<RevenueSummary>({
        path: '/api/v1/admin/revenue/summary',
        headers: { 'x-admin-id': userId || '' },
      }),
    enabled: !!userId && user?.role === 'admin',
  });

  if (!user || user.role !== 'admin') {
    return null;
  }

  const stats = dashboardQuery.data?.statistics;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Owner controls and organization analytics</p>
          </div>
          <button
            onClick={logout}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Users" value={stats?.totalUsers || 0} />
          <Card title="Workers (Approved)" value={`${stats?.approvedWorkers || 0}/${stats?.totalWorkers || 0}`} />
          <Card title="Pending Worker Approvals" value={stats?.pendingWorkerApprovals || 0} />
          <Card title="Blocked Users" value={stats?.blockedUsers || 0} />
          <Card title="Active Bookings" value={stats?.activeBookings || 0} />
          <Card title="Completed Bookings" value={stats?.completedBookings || 0} />
          <Card title="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} />
          <Card title="Pending KYC" value={stats?.pendingKyc || 0} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Today Revenue" value={`₹${(revenueQuery.data?.todayRevenue || 0).toLocaleString()}`} />
          <Card title="Month Revenue" value={`₹${(revenueQuery.data?.monthRevenue || 0).toLocaleString()}`} />
          <Card title="Deactivated Users" value={stats?.deactivatedUsers || 0} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Rights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ActionButton label="User Governance" onClick={() => router.push('/admin/users')} />
            <ActionButton label="Booking Governance" onClick={() => router.push('/admin/bookings')} />
            <ActionButton label="Activity Log" onClick={() => router.push('/admin/audit-logs')} />
            <ActionButton label="KYC Verification" onClick={() => router.push('/admin/kyc')} />
            <ActionButton label="Analytics" onClick={() => router.push('/admin/analytics')} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 font-medium text-gray-800"
    >
      {label}
    </button>
  );
}
