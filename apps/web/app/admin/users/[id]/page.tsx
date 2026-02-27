'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type UserDetailsResponse = {
  user: {
    id: string;
    name?: string;
    email?: string;
    phone: string;
    role: string;
    accountStatus?: string;
    workerApproval?: { status?: string; rejectionReason?: string };
    skills?: string[];
    kyc?: { status?: string; idType?: string; idNumber?: string };
    createdAt: string;
  };
  statistics: {
    bookingsCount: number;
    completedBookings: number;
    totalEarnings: number;
    reviewsCount: number;
    averageRating: number;
  };
};

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, userId } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-details', params.id],
    queryFn: () =>
      apiFetch<UserDetailsResponse>({
        path: `/api/v1/admin/users/${params.id}`,
        headers: { 'x-admin-id': userId || '' },
      }),
    enabled: !!params.id && !!userId,
  });

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  const profile = data?.user;
  const stats = data?.statistics;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">← Back</button>
          <h1 className="text-xl font-bold text-gray-900">User Profile</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info label="Name" value={profile?.name || 'N/A'} />
            <Info label="Phone" value={profile?.phone || 'N/A'} />
            <Info label="Email" value={profile?.email || 'N/A'} />
            <Info label="Role" value={profile?.role || 'N/A'} />
            <Info label="Account Status" value={profile?.accountStatus || 'active'} />
            <Info label="Worker Approval" value={profile?.workerApproval?.status || 'N/A'} />
            <Info label="KYC Status" value={profile?.kyc?.status || 'not_submitted'} />
            <Info label="Joined" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A'} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <Stat title="Bookings" value={stats?.bookingsCount || 0} />
            <Stat title="Completed" value={stats?.completedBookings || 0} />
            <Stat title="Earnings" value={`₹${(stats?.totalEarnings || 0).toLocaleString()}`} />
            <Stat title="Reviews" value={stats?.reviewsCount || 0} />
            <Stat title="Avg Rating" value={(stats?.averageRating || 0).toFixed(1)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-600">{title}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}
