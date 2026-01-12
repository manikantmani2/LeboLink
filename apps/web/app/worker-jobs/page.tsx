'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import BottomNav from '@/components/BottomNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type AcceptedJob = {
  id: string;
  title: string;
  customer: string;
  price: string;
  status: 'accepted' | 'in-progress' | 'completed';
  scheduledTime?: string;
  address?: string;
  phone?: string;
};

type WorkerJobsResponse = {
  jobs: AcceptedJob[];
  totalEarnings: number;
  completedJobs: number;
};

export default function WorkerJobsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const jobsQuery = useQuery({
    queryKey: ['worker-jobs', user?.id],
    queryFn: () =>
      apiFetch<WorkerJobsResponse>({
        path: '/api/v1/bookings/worker-jobs',
        method: 'GET',
      }),
    refetchInterval: 5000,
  });

  const mockJobs: WorkerJobsResponse = {
    jobs: [
      {
        id: '1',
        title: 'Electrical wiring',
        customer: 'Rajesh Kumar',
        price: '₹500',
        status: 'in-progress',
        scheduledTime: 'Today, 2:30 PM',
        address: '123 Main Street, Delhi',
        phone: '98765 43210',
      },
      {
        id: '2',
        title: 'Plumbing repair',
        customer: 'Priya Singh',
        price: '₹400',
        status: 'accepted',
        scheduledTime: 'Tomorrow, 10:00 AM',
        address: '456 Park Road, Gurgaon',
        phone: '87654 32109',
      },
      {
        id: '3',
        title: 'House cleaning',
        customer: 'Amit Patel',
        price: '₹300',
        status: 'completed',
        scheduledTime: 'Yesterday, 3:00 PM',
        address: '789 Oak Avenue, Noida',
        phone: '76543 21098',
      },
    ],
    totalEarnings: 1200,
    completedJobs: 8,
  };

  const jobs = jobsQuery.data || mockJobs;
  const activeJobs = jobs.jobs.filter((j) => j.status !== 'completed');
  const completedJobs = jobs.jobs.filter((j) => j.status === 'completed');

  const content = (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand to-brand-dark text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">My Jobs</h1>
          <p className="text-white/80 text-sm mt-1">Track your accepted and completed work</p>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-brand text-center"
          >
            <div className="text-2xl font-bold text-primary">{activeJobs.length}</div>
            <div className="text-xs text-gray-600 mt-1">Active Jobs</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-green-500 text-center"
          >
            <div className="text-2xl font-bold text-green-600">{jobs.completedJobs}</div>
            <div className="text-xs text-gray-600 mt-1">Completed</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-yellow-500 text-center"
          >
            <div className="text-2xl font-bold text-yellow-600">₹{jobs.totalEarnings}</div>
            <div className="text-xs text-gray-600 mt-1">Earnings</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-sm">
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-brand text-white shadow-lg'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            Active Jobs ({activeJobs.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-brand text-white shadow-lg'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            Completed ({completedJobs.length})
          </motion.button>
        </div>

        {/* Jobs List */}
        <AnimatePresence>
          {activeTab === 'active' ? (
            <div className="space-y-4">
              {activeJobs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white rounded-2xl"
                >
                  <div className="text-5xl mb-4">😴</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No active jobs</h3>
                  <p className="text-gray-600">Check the feed to accept new jobs!</p>
                </motion.div>
              ) : (
                activeJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-brand/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-primary">{job.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">Customer: {job.customer}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-brand">{job.price}</div>
                        <div
                          className={`text-xs font-semibold mt-1 px-3 py-1 rounded-full ${
                            job.status === 'in-progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {job.status === 'in-progress' ? '🚗 In Progress' : '✓ Accepted'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>⏰</span>
                        <span>{job.scheduledTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>📍</span>
                        <span>{job.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>📞</span>
                        <span>{job.phone}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {job.status === 'accepted' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
                          >
                            <span>🚗</span>
                            <span>Start Work</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 border-2 border-gray-200 text-primary py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                          >
                            <span>Cancel</span>
                          </motion.button>
                        </>
                      )}
                      {job.status === 'in-progress' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                          <span>✓</span>
                          <span>Mark as Completed</span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {completedJobs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white rounded-2xl"
                >
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No completed jobs yet</h3>
                  <p className="text-gray-600">Keep working to build your profile!</p>
                </motion.div>
              ) : (
                completedJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border-2 border-green-100 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-primary">{job.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">Customer: {job.customer}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{job.price}</div>
                        <div className="text-xs font-semibold mt-1 px-3 py-1 rounded-full bg-green-100 text-green-700">
                          ✓ Completed
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Completed on {job.scheduledTime}</p>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
