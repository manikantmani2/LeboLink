'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

interface AuditLog {
  id: string;
  actionType: string;
  adminId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  targetUserRole: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  metadata?: Record<string, any>;
  performedAt: string;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  BLOCK_USER: 'Blocked User',
  DEACTIVATE_USER: 'Deactivated User',
  ACTIVATE_USER: 'Activated User',
  DELETE_USER: 'Deleted User',
  APPROVE_WORKER: 'Approved Worker',
  REJECT_WORKER: 'Rejected Worker',
  SUSPEND_WORKER: 'Suspended Worker',
  UPDATE_USER: 'Updated User',
  VERIFY_KYC: 'Verified KYC',
  REJECT_KYC: 'Rejected KYC',
};

const ACTION_TYPE_COLORS: Record<string, string> = {
  BLOCK_USER: 'bg-red-100 text-red-800',
  DEACTIVATE_USER: 'bg-orange-100 text-orange-800',
  ACTIVATE_USER: 'bg-green-100 text-green-800',
  DELETE_USER: 'bg-red-200 text-red-900',
  APPROVE_WORKER: 'bg-green-100 text-green-800',
  REJECT_WORKER: 'bg-red-100 text-red-800',
  SUSPEND_WORKER: 'bg-yellow-100 text-yellow-800',
  UPDATE_USER: 'bg-blue-100 text-blue-800',
  VERIFY_KYC: 'bg-green-100 text-green-800',
  REJECT_KYC: 'bg-red-100 text-red-800',
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('');
  const limit = 20;

  const { data, isLoading } = useQuery<AuditLogsResponse>({
    queryKey: ['admin', 'audit-logs', page, actionFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (actionFilter) {
        params.append('actionType', actionFilter);
      }
      return apiFetch<AuditLogsResponse>({ path: `/v1/admin/audit-logs?${params}` });
    },
  });

  const actionTypes = useMemo(
    () => Object.keys(ACTION_TYPE_LABELS).sort(),
    []
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatTimeDifference = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
              <p className="text-gray-600 mt-1">
                Track all administrative actions and moderation activities
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Actions</option>
                {actionTypes.map((type) => (
                  <option key={type} value={type}>
                    {ACTION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {actionFilter && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setActionFilter('');
                    setPage(1);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        {data && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {data.logs.length} of {data.pagination.total} total activities
              </div>
              <div className="text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading activity logs...</div>
          ) : !data || data.logs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">📋</div>
              <div className="text-gray-600 font-medium">No activity logs found</div>
              <div className="text-gray-500 text-sm mt-1">
                {actionFilter
                  ? 'Try adjusting your filters'
                  : 'Activity logs will appear here as admins perform actions'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTimeDifference(log.performedAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(log.performedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            ACTION_TYPE_COLORS[log.actionType] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ACTION_TYPE_LABELS[log.actionType] || log.actionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.adminName}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {log.adminId.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {log.targetUserName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 capitalize">
                            {log.targetUserRole}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {log.targetUserId.slice(-8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {log.previousValue && log.newValue && (
                          <div className="text-sm">
                            <span className="text-gray-500">{log.previousValue}</span>
                            <span className="text-gray-400 mx-1">→</span>
                            <span className="font-medium text-gray-900">{log.newValue}</span>
                          </div>
                        )}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {Object.entries(log.metadata).map(([key, value]) => (
                              <div key={key}>
                                {key}: {JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {log.reason ? (
                          <div className="text-sm text-gray-700 max-w-xs">{log.reason}</div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
