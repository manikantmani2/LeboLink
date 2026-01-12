'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import RatingStars from './RatingStars';

type Props = {
  id: string;
  title: string;
  distanceKm: number;
  when: string;
  price: string;
  bookingId: string;
  rating?: number;
  onAction?: (action: 'accept' | 'schedule', bookingId: string) => void;
};

type AcceptResponse = { success: boolean; message: string };

export default function JobCard({ id, title, distanceKm, when, price, bookingId, rating = 4.5, onAction }: Props) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  const acceptJob = useMutation({
    mutationFn: () =>
      apiFetch<AcceptResponse>({
        path: `/api/v1/bookings/${bookingId}/status`,
        method: 'PATCH',
        body: { status: 'accepted' },
      }),
    onSuccess: () => {
      onAction?.('accept', bookingId);
    },
  });

  const scheduleJob = useMutation({
    mutationFn: () =>
      apiFetch<AcceptResponse>({
        path: `/api/v1/bookings/${bookingId}/status`,
        method: 'PATCH',
        body: { status: 'accepted', scheduledAt: scheduledTime },
      }),
    onSuccess: () => {
      onAction?.('schedule', bookingId);
      setShowScheduleModal(false);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-gray-100 rounded-2xl p-5 shadow-sm bg-white hover:shadow-lg hover:border-brand/30 transition-all"
    >
      <div className="font-semibold text-base text-primary">{title}</div>
      <div className="text-sm text-gray-600 mt-1">
        <span className="inline-block">📍 {distanceKm} km</span>
        <span className="mx-2">·</span>
        <span className="inline-block">⏰ {when}</span>
        <span className="mx-2">·</span>
        <span className="inline-block font-semibold text-brand">{price}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <RatingStars rating={rating} />
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => acceptJob.mutate()}
            disabled={acceptJob.isPending}
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {acceptJob.isPending ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Accepting...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Accept</span>
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowScheduleModal(true)}
            disabled={scheduleJob.isPending}
            className="px-4 py-2 rounded-lg border-2 border-brand text-brand text-sm font-semibold hover:bg-brand/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>📅</span>
            <span>Schedule</span>
          </motion.button>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full bg-white rounded-t-3xl p-6"
          >
            <h3 className="text-2xl font-bold text-primary mb-4">Schedule Job</h3>
            <p className="text-gray-600 mb-4">Select when you want to accept this job</p>

            <div className="space-y-3 mb-6">
              {['Today', 'Tomorrow', 'This Week', 'Next Week'].map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setScheduledTime(option);
                    scheduleJob.mutate();
                  }}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all text-left font-medium text-primary"
                >
                  {option}
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setScheduledTime('');
                  setShowScheduleModal(false);
                }}
                className="flex-1 border-2 border-gray-200 text-primary p-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => scheduleJob.mutate()}
                disabled={!scheduledTime || scheduleJob.isPending}
                className="flex-1 bg-brand text-white p-3 rounded-xl font-semibold hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scheduleJob.isPending ? 'Scheduling...' : 'Schedule'}
              </motion.button>
            </div>

            {scheduleJob.isError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg mt-4"
              >
                {(scheduleJob.error as Error)?.message}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
