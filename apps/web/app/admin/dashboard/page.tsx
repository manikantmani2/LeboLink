'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTheme } from '@/lib/theme-context';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div 
      className="min-h-screen p-8"
      style={{
        background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)`,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Welcome, {user.name || 'Admin'}!
            </p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Admin Info */}
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-lg border-l-4 border-blue-600"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Admin Profile
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Name</p>
              <p className="text-gray-900 dark:text-white font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Phone</p>
              <p className="text-gray-900 dark:text-white font-semibold">{user.phone}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Role</p>
              <p className="text-gray-900 dark:text-white font-semibold">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">User ID</p>
              <p className="text-gray-900 dark:text-white font-semibold">{user.id.slice(0, 8)}...</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Users Stats */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-blue-600"
          >
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">Coming soon</p>
          </div>

          {/* Bookings Stats */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-purple-600"
          >
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
              Active Bookings
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">Coming soon</p>
          </div>

          {/* Revenue Stats */}
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-green-600"
          >
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">₹0</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">Coming soon</p>
          </div>
        </div>

        {/* Features Coming Soon */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Features
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>✓ User Management (coming soon)</li>
            <li>✓ Booking Management (coming soon)</li>
            <li>✓ Analytics Dashboard (coming soon)</li>
            <li>✓ KYC Verification (coming soon)</li>
            <li>✓ Payment Tracking (coming soon)</li>
            <li>✓ Reports & Export (coming soon)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
