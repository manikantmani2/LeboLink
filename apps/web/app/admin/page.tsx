'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

type DashboardStats = {
  statistics: {
    totalUsers: number;
    totalWorkers: number;
    totalCustomers: number;
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    totalRevenue: number;
    pendingKyc: number;
  };
  recentBookings: Array<{
    id: string;
    serviceName: string;
    status: string;
    amount: number;
    createdAt: string;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    phone: string;
    role: string;
    createdAt: string;
  }>;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, userId } = useAuth();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'bookings' | 'kyc' | 'analytics'>('dashboard');

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/home');
    }
  }, [user, router]);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiFetch<DashboardStats>({ 
      path: '/api/v1/admin/dashboard',
      headers: { 'x-admin-id': userId || '' },
    }),
    enabled: !!userId && user?.role === 'admin',
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin privileges required</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  const stats = dashboardData?.statistics;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-dark text-white flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">LeboLink Management</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'bookings', label: 'Bookings', icon: '📋' },
              { id: 'kyc', label: 'KYC Verification', icon: '✓' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'text-brand border-b-2 border-brand'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeSection === 'dashboard' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="👥"
                color="blue"
              />
              <StatCard
                title="Total Revenue"
                value={`₹${stats.totalRevenue.toLocaleString()}`}
                icon="💰"
                color="green"
              />
              <StatCard
                title="Active Bookings"
                value={stats.activeBookings}
                icon="🔄"
                color="orange"
              />
              <StatCard
                title="Pending KYC"
                value={stats.pendingKyc}
                icon="⏳"
                color="purple"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Workers</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalWorkers}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Customers</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="text-sm text-gray-600 mb-1">Completed</div>
                <div className="text-2xl font-bold text-gray-900">{stats.completedBookings}</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings</h3>
                <div className="space-y-3">
                  {dashboardData.recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <div className="font-medium text-gray-900">{booking.serviceName || 'Service'}</div>
                        <div className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-brand">₹{booking.amount}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {dashboardData.recentUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-purple-500 text-white flex items-center justify-center text-sm font-bold">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.phone}</div>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'users' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management</h2>
            <p className="text-gray-600 mb-4">View and manage all users</p>
            <button
              onClick={() => router.push('/admin/users')}
              className="px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
            >
              Go to User Management
            </button>
          </div>
        )}

        {activeSection === 'bookings' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Management</h2>
            <p className="text-gray-600 mb-4">Monitor and manage all bookings</p>
            <button
              onClick={() => router.push('/admin/bookings')}
              className="px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
            >
              Go to Bookings
            </button>
          </div>
        )}

        {activeSection === 'kyc' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Verification</h2>
            <p className="text-gray-600 mb-4">Review and approve worker KYC documents</p>
            <button
              onClick={() => router.push('/admin/kyc')}
              className="px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
            >
              Go to KYC Verification
            </button>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
            <p className="text-gray-600 mb-4">View detailed analytics and trends</p>
            <button
              onClick={() => router.push('/admin/analytics')}
              className="px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
            >
              Go to Analytics
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: 'blue' | 'green' | 'orange' | 'purple' }) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorMap[color]} text-white flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    requested: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    worker: 'bg-orange-100 text-orange-700',
    customer: 'bg-blue-100 text-blue-700',
    admin: 'bg-purple-100 text-purple-700',
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
}
