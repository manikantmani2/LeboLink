'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';

type KycRequest = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  kyc: {
    idType?: string;
    idNumber?: string;
    documentUrl?: string;
    status?: string;
  };
  createdAt: string;
};

export default function AdminKycPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-kyc'],
    queryFn: () =>
      apiFetch<{ kycRequests: KycRequest[] }>({
        path: '/api/v1/admin/kyc/pending',
        headers: { 'x-admin-id': userId || '' },
      }),
    enabled: !!userId,
  });

  const verifyKyc = useMutation({
    mutationFn: (userId: string) =>
      apiFetch({
        path: `/api/v1/admin/kyc/${userId}/verify`,
        method: 'POST',
        headers: { 'x-admin-id': userId || '' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      alert('KYC verified successfully');
    },
  });

  const rejectKyc = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      apiFetch({
        path: `/api/v1/admin/kyc/${userId}/reject`,
        method: 'POST',
        body: { reason },
        headers: { 'x-admin-id': userId || '' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc'] });
      alert('KYC rejected');
    },
  });

  const handleVerify = (userId: string) => {
    if (confirm('Verify this KYC?')) {
      verifyKyc.mutate(userId);
    }
  };

  const handleReject = (userId: string) => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      rejectKyc.mutate({ userId, reason });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">KYC Verification</h1>
          </div>
        </div>
      </div>

      {/* KYC Requests */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          </div>
        ) : data?.kycRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
            <p className="text-gray-600">No pending KYC verifications</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-6"
          >
            {data?.kycRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-purple-500 text-white flex items-center justify-center font-bold text-lg">
                        {request.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{request.name}</h3>
                        <p className="text-sm text-gray-600">{request.phone}</p>
                        {request.email && <p className="text-xs text-gray-500">{request.email}</p>}
                      </div>
                    </div>

                    {/* KYC Details */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ID Type:</span>
                        <span className="text-sm font-medium text-gray-900">{request.kyc.idType || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ID Number:</span>
                        <span className="text-sm font-medium text-gray-900">{request.kyc.idNumber || 'N/A'}</span>
                      </div>
                      {request.kyc.documentUrl && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Document:</span>
                          <a
                            href={request.kyc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-brand hover:underline"
                          >
                            View Document →
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Submitted:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 md:w-48">
                    <button
                      onClick={() => handleVerify(request.id)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>✓</span>
                      <span>Verify</span>
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>✗</span>
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => router.push(`/admin/users/${request.id}`)}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
