'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme-context';
import { motion } from 'framer-motion';

type AnalyticsData = {
  period: string;
  bookingsTrend: Array<{ _id: string; count: number }>;
  revenueTrend: Array<{ _id: string; revenue: number }>;
  topWorkers: Array<{
    workerId: string;
    name: string;
    phone?: string;
    skills?: string[];
    totalBookings: number;
    totalEarnings: number;
  }>;
  bookingsByStatus: Array<{ _id: string; count: number }>;
  userGrowth: Array<{ _id: string; count: number }>;
};

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Redirect if not admin
  if (typeof window !== 'undefined' && user?.role !== 'admin') {
    router.push('/');
    return null;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () =>
      apiFetch<AnalyticsData>({
        path: `/api/v1/admin/analytics?period=${period}`,
        headers: { 'x-admin-id': user?.id || '' },
      }),
    enabled: typeof window !== 'undefined' && !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  const totalBookings = data?.bookingsTrend.reduce((sum, d) => sum + d.count, 0) || 0;
  const totalRevenue = data?.revenueTrend.reduce((sum, d) => sum + d.revenue, 0) || 0;
  const totalNewUsers = data?.userGrowth.reduce((sum, d) => sum + d.count, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
            <div className="text-3xl font-bold text-gray-900">{totalBookings}</div>
            <div className="text-xs text-gray-500 mt-1">in {period}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">in {period}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">New Users</div>
            <div className="text-3xl font-bold text-purple-600">{totalNewUsers}</div>
            <div className="text-xs text-gray-500 mt-1">in {period}</div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bookings by Status</h3>
            <div className="space-y-3">
              {data?.bookingsByStatus.map((item) => (
                <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-medium text-gray-700 capitalize">{item._id}</span>
                  <span className="text-lg font-bold text-brand">{item.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Day</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data?.revenueTrend.slice(0, 10).map((item) => (
                <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-xs text-gray-600">{item._id}</span>
                  <span className="text-sm font-semibold text-green-600">₹{item.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Workers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Workers</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.topWorkers.map((worker, index) => (
                  <tr key={worker.workerId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-brand to-purple-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{worker.name}</div>
                      {worker.phone && <div className="text-xs text-gray-500">{worker.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {worker.skills?.map((skill, i) => (
                          <span key={i} className={`px-2 py-0.5 text-xs ${theme.lightBg} ${theme.text} rounded-full`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{worker.totalBookings}</td>
                    <td className="px-6 py-4 font-bold text-green-600">₹{worker.totalEarnings.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}