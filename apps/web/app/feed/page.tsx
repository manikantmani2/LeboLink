'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import BottomNav from '@/components/BottomNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import JobCard from '@/components/JobCard';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Job = {
  id: string;
  bookingId: string;
  title: string;
  distanceKm: number;
  when: string;
  price: string;
  rating?: number;
  status?: string;
};

type JobsResponse = {
  jobs: Job[];
};

export default function FeedPage() {
  const { user } = useAuth();
  const [acceptedJobs, setAcceptedJobs] = useState<Set<string>>(new Set());

  const jobsQuery = useQuery({
    queryKey: ['available-jobs', user?.id],
    queryFn: () =>
      apiFetch<JobsResponse>({
        path: '/api/v1/bookings/available',
        method: 'GET',
      }),
    refetchInterval: 10000,
  });

  const handleJobAction = (action: 'accept' | 'schedule', bookingId: string) => {
    if (action === 'accept' || action === 'schedule') {
      setAcceptedJobs((prev) => new Set([...prev, bookingId]));
    }
  };

  const jobs: Job[] = jobsQuery.data?.jobs || [
    { id: '1', bookingId: 'b1', title: 'Electrician needed', distanceKm: 2, when: 'Today', price: '₹400', rating: 4.8 },
    { id: '2', bookingId: 'b2', title: 'Plumber for leak fix', distanceKm: 3.5, when: 'Tomorrow', price: '₹550', rating: 4.6 },
    { id: '3', bookingId: 'b3', title: 'House cleaning', distanceKm: 1.2, when: 'This evening', price: '₹300', rating: 4.9 },
  ];

  const availableJobs = jobs.filter((job) => !acceptedJobs.has(job.bookingId));

  const content = (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand to-brand-dark text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Available Jobs</h1>
              <p className="text-white/80 text-sm mt-1">Accept or schedule work near you</p>
            </div>
            <div className="text-4xl">💼</div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-brand"
          >
            <div className="text-2xl font-bold text-primary">{availableJobs.length}</div>
            <div className="text-sm text-gray-600">Available Jobs</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-green-500"
          >
            <div className="text-2xl font-bold text-green-600">{acceptedJobs.size}</div>
            <div className="text-sm text-gray-600">Accepted Jobs</div>
          </motion.div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobsQuery.isPending && availableJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-4">⏳</div>
              <p className="text-gray-600">Loading nearby jobs...</p>
            </motion.div>
          ) : availableJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-2xl"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">You're all caught up!</h3>
              <p className="text-gray-600">You've accepted or scheduled all available jobs. Check back soon!</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {availableJobs.map((job, i) => (
                <motion.div
                  key={job.bookingId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <JobCard
                    {...job}
                    onAction={handleJobAction}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Accepted Jobs Section */}
        {acceptedJobs.size > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-4">Your Accepted Jobs</h2>
            <div className="space-y-3">
              {jobs
                .filter((job) => acceptedJobs.has(job.bookingId))
                .map((job, i) => (
                  <motion.div
                    key={job.bookingId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border-2 border-green-200 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-primary text-lg">{job.title}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          📍 {job.distanceKm} km · ⏰ {job.when} · 💰 {job.price}
                        </div>
                      </div>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                        ✓ Accepted
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
