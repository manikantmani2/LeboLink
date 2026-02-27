'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiBase, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';

type User = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'worker' | 'customer' | 'admin';
  kycStatus: string;
  workerApprovalStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  accountStatus?: 'active' | 'deactivated' | 'blocked';
  createdAt: string;
};

type AdminUsersResponse = {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, userId } = useAuth();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string>('');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const adminHeaders = useMemo(() => ({ 'x-admin-id': userId || '' }), [userId]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, role, search],
    queryFn: () =>
      apiFetch<AdminUsersResponse>({
        path: `/api/v1/admin/users?page=${page}&limit=20${role ? `&role=${role}` : ''}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
        headers: adminHeaders,
      }),
    enabled: !!userId && user?.role === 'admin',
  });

  const updateStatus = useMutation({
    mutationFn: ({ targetUserId, action, note }: { targetUserId: string; action: 'activate' | 'deactivate' | 'block'; note?: string }) =>
      apiFetch({
        path: `/api/v1/admin/users/${targetUserId}/${action}`,
        method: 'PATCH',
        body: note ? { note } : undefined,
        headers: adminHeaders,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const updateWorkerApproval = useMutation({
    mutationFn: ({ targetUserId, status, reason }: { targetUserId: string; status: 'approved' | 'rejected' | 'suspended'; reason?: string }) =>
      apiFetch({
        path: `/api/v1/admin/workers/${targetUserId}/approval`,
        method: 'PATCH',
        body: {
          status,
          reason,
          adminId: userId,
        },
        headers: adminHeaders,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (targetUserId: string) =>
      apiFetch({
        path: `/api/v1/admin/users/${targetUserId}`,
        method: 'DELETE',
        headers: adminHeaders,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const exportCsv = async () => {
    const response = await fetch(`${apiBase}/api/v1/admin/users/export/csv${role ? `?role=${role}` : ''}`, {
      method: 'GET',
      headers: adminHeaders,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to export CSV');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (targetUserId: string) => {
    if (confirm('Delete this user? This is irreversible for operational use.')) {
      deleteUser.mutate(targetUserId);
    }
  };

  const handleRejectWorker = (targetUserId: string) => {
    const reason = prompt('Reason for rejection (required):');
    if (!reason) return;
    updateWorkerApproval.mutate({ targetUserId, status: 'rejected', reason });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">← Back</button>
              <h1 className="text-xl font-bold text-gray-900">User Governance</h1>
            </div>
            <button
              onClick={exportCsv}
              className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
            />
            <select
              value={role}
              onChange={(e) => {
                setPage(1);
                setRole(e.target.value);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
            >
              <option value="">All Roles</option>
              <option value="worker">Workers</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker Approval</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">KYC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data?.users?.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{row.name || 'Unnamed'}</div>
                        <div className="text-sm text-gray-600">{row.phone}</div>
                        {row.email && <div className="text-xs text-gray-500">{row.email}</div>}
                      </td>
                      <td className="px-4 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(row.role)}`}>{row.role}</span></td>
                      <td className="px-4 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getAccountColor(row.accountStatus || 'active')}`}>{row.accountStatus || 'active'}</span></td>
                      <td className="px-4 py-4">
                        {row.role === 'worker' ? (
                          <span className={`px-2 py-1 text-xs rounded-full ${getWorkerApprovalColor(row.workerApprovalStatus || 'pending')}`}>
                            {row.workerApprovalStatus || 'pending'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getKycColor(row.kycStatus)}`}>{row.kycStatus}</span></td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => router.push(`/admin/users/${row.id}`)}
                            className="px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            View
                          </button>

                          {row.role === 'worker' && (row.workerApprovalStatus || 'pending') === 'pending' && (
                            <>
                              <button
                                onClick={() => updateWorkerApproval.mutate({ targetUserId: row.id, status: 'approved' })}
                                className="px-3 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectWorker(row.id)}
                                className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {(row.accountStatus || 'active') !== 'blocked' && (
                            <button
                              onClick={() => updateStatus.mutate({ targetUserId: row.id, action: 'block' })}
                              className="px-3 py-1 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Block
                            </button>
                          )}

                          {(row.accountStatus || 'active') === 'active' && (
                            <button
                              onClick={() => updateStatus.mutate({ targetUserId: row.id, action: 'deactivate' })}
                              className="px-3 py-1 text-xs rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            >
                              Deactivate
                            </button>
                          )}

                          {(row.accountStatus || 'active') !== 'active' && (
                            <button
                              onClick={() => updateStatus.mutate({ targetUserId: row.id, action: 'activate' })}
                              className="px-3 py-1 text-xs rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            >
                              Activate
                            </button>
                          )}

                          {row.role !== 'admin' && (
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="px-3 py-1 text-xs rounded-lg bg-gray-900 text-white hover:bg-black"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data?.pagination && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.pagination.total)} of {data.pagination.total} users
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    worker: 'bg-orange-100 text-orange-700',
    customer: 'bg-blue-100 text-blue-700',
    admin: 'bg-purple-100 text-purple-700',
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
}

function getKycColor(status: string): string {
  const colors: Record<string, string> = {
    verified: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    not_submitted: 'bg-gray-100 text-gray-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

function getAccountColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    deactivated: 'bg-yellow-100 text-yellow-700',
    blocked: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

function getWorkerApprovalColor(status: string): string {
  const colors: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-orange-100 text-orange-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}
