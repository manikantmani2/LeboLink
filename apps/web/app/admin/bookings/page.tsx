'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Booking = {
  id: string;
  serviceName?: string;
  status: string;
  amount: number;
  paymentStatus?: string;
  customer?: { name?: string; phone?: string } | null;
  worker?: { name?: string; phone?: string } | null;
  createdAt: string;
};

type BookingsResponse = {
  bookings: Booking[];
  pagination: { page: number; total: number; totalPages: number };
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const { user, userId } = useAuth();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', status, page],
    queryFn: () =>
      apiFetch<BookingsResponse>({
        path: `/api/v1/admin/bookings?page=${page}&limit=20${status ? `&status=${status}` : ''}`,
        headers: { 'x-admin-id': userId || '' },
      }),
    enabled: !!userId,
  });

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">← Back</button>
            <h1 className="text-xl font-bold text-gray-900">Booking Management</h1>
          </div>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="requested">Requested</option>
            <option value="accepted">Accepted</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.bookings?.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{b.serviceName || 'Service'}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">{b.customer?.name || 'N/A'}<div className="text-xs text-gray-500">{b.customer?.phone || ''}</div></td>
                      <td className="px-4 py-4 text-sm text-gray-700">{b.worker?.name || 'Unassigned'}<div className="text-xs text-gray-500">{b.worker?.phone || ''}</div></td>
                      <td className="px-4 py-4 text-sm font-semibold text-green-700">₹{(b.amount || 0).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm"><span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{b.status}</span></td>
                      <td className="px-4 py-4 text-sm text-gray-500">{new Date(b.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data?.pagination && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">Page {page} of {data.pagination.totalPages || 1}</div>
                <div className="flex gap-2">
                  <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50">Previous</button>
                  <button onClick={() => setPage(page + 1)} disabled={page >= (data.pagination.totalPages || 1)} className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
