'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import RatingStars from '@/components/RatingStars';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type CustomerBooking = {
  id: string;
  serviceName: string;
  workerName?: string;
  status: 'requested' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  amount: number;
  createdAt: string;
  address?: string;
  phone?: string;
  etaMinutes?: number;
  paymentStatus?: string;
  rating?: number;
};

type CustomerBookingsResponse = {
  bookings: CustomerBooking[];
  totalSpent: number;
  activeCount: number;
  completedCount: number;
};

type CancelResponse = { success: boolean; message: string };
type ReviewResponse = { success: boolean; message: string };

export default function MyBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const bookingsQuery = useQuery({
    queryKey: ['customer-bookings', user?.id],
    queryFn: () =>
      apiFetch<CustomerBookingsResponse>({
        path: `/api/v1/bookings/customer/${user?.id}`,
        method: 'GET',
      }),
    refetchInterval: 5000,
  });

  const cancelBooking = useMutation({
    mutationFn: (bookingId: string) =>
      apiFetch<CancelResponse>({
        path: `/api/v1/bookings/${bookingId}/status`,
        method: 'PATCH',
        body: { status: 'cancelled' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      setShowCancelModal(false);
    },
  });

  const submitReview = useMutation({
    mutationFn: ({ bookingId, rating, comment }: { bookingId: string; rating: number; comment: string }) =>
      apiFetch<ReviewResponse>({
        path: `/api/v1/reviews`,
        method: 'POST',
        body: { bookingId, rating, comment },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      setShowReviewModal(false);
      setRating(5);
      setReview('');
    },
  });

  const mockData: CustomerBookingsResponse = {
    bookings: [
      {
        id: '1',
        serviceName: 'Electrical Wiring',
        workerName: 'Rajesh Kumar',
        status: 'in-progress',
        amount: 500,
        createdAt: '2026-01-09T10:30:00Z',
        address: '123 Main St, Delhi',
        phone: '9876543210',
        etaMinutes: 15,
        paymentStatus: 'pending',
      },
      {
        id: '2',
        serviceName: 'Plumbing Repair',
        workerName: 'Amit Singh',
        status: 'completed',
        amount: 400,
        createdAt: '2026-01-08T14:00:00Z',
        address: '456 Park Road, Gurgaon',
        paymentStatus: 'paid',
        rating: 5,
      },
      {
        id: '3',
        serviceName: 'House Cleaning',
        workerName: 'Priya Sharma',
        status: 'requested',
        amount: 300,
        createdAt: '2026-01-09T09:00:00Z',
        address: '789 Oak Ave, Noida',
        etaMinutes: 25,
        paymentStatus: 'pending',
      },
    ],
    totalSpent: 1200,
    activeCount: 2,
    completedCount: 1,
  };

  const data = bookingsQuery.data || mockData;
  const activeBookings = data.bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled');
  const completedBookings = data.bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  const getStatusBadge = (status: string) => {
    const badges = {
      requested: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🕐', label: 'Requested' },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓', label: 'Accepted' },
      'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🚗', label: 'In Progress' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: '✅', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: '✖', label: 'Cancelled' },
    };
    const badge = badges[status as keyof typeof badges] || badges.requested;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit`}>
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </span>
    );
  };

  const content = (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand to-brand-dark text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-white/80 text-sm mt-1">Track and manage your service bookings</p>
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
            <div className="text-2xl font-bold text-primary">{data.activeCount}</div>
            <div className="text-xs text-gray-600 mt-1">Active</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-green-500 text-center"
          >
            <div className="text-2xl font-bold text-green-600">{data.completedCount}</div>
            <div className="text-xs text-gray-600 mt-1">Completed</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 shadow-sm border-l-4 border-yellow-500 text-center"
          >
            <div className="text-2xl font-bold text-yellow-600">₹{data.totalSpent}</div>
            <div className="text-xs text-gray-600 mt-1">Total Spent</div>
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
            Active ({activeBookings.length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-brand text-white shadow-lg'
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            History ({completedBookings.length})
          </motion.button>
        </div>

        {/* Bookings List */}
        <AnimatePresence>
          {activeTab === 'active' ? (
            <div className="space-y-4">
              {activeBookings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white rounded-2xl"
                >
                  <div className="text-5xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No active bookings</h3>
                  <p className="text-gray-600 mb-4">Book a service to get started!</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => router.push('/home')}
                    className="bg-brand text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-dark transition-all"
                  >
                    Browse Workers
                  </motion.button>
                </motion.div>
              ) : (
                activeBookings.map((booking, i) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-brand/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-primary">{booking.serviceName}</h3>
                        <p className="text-sm text-gray-600 mt-1">Worker: {booking.workerName || 'Assigning...'}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-brand">₹{booking.amount}</div>
                        {booking.etaMinutes && (
                          <div className="text-xs text-gray-500 mt-1">ETA: {booking.etaMinutes} mins</div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">{getStatusBadge(booking.status)}</div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>📅</span>
                        <span>{new Date(booking.createdAt).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      {booking.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span>📍</span>
                          <span>{booking.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/tracking?id=${booking.id}`)}
                        className="flex-1 bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
                      >
                        <span>🗺️</span>
                        <span>Track Order</span>
                      </motion.button>
                      {booking.status === 'requested' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowCancelModal(true);
                          }}
                          className="flex-1 border-2 border-red-500 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all"
                        >
                          Cancel
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {completedBookings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white rounded-2xl"
                >
                  <div className="text-5xl mb-4">📜</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No booking history yet</h3>
                  <p className="text-gray-600">Your completed bookings will appear here</p>
                </motion.div>
              ) : (
                completedBookings.map((booking, i) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-white border-2 rounded-2xl p-5 shadow-sm ${
                      booking.status === 'completed' ? 'border-green-100' : 'border-red-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-primary">{booking.serviceName}</h3>
                        <p className="text-sm text-gray-600 mt-1">Worker: {booking.workerName}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${booking.status === 'completed' ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{booking.amount}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">{getStatusBadge(booking.status)}</div>

                    {booking.status === 'completed' && !booking.rating && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowReviewModal(true);
                        }}
                        className="w-full bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 mb-3"
                      >
                        <span>⭐</span>
                        <span>Rate This Service</span>
                      </motion.button>
                    )}

                    {booking.rating && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Your Rating:</span>
                          <RatingStars rating={booking.rating} />
                        </div>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => router.push(`/tracking?id=${booking.id}`)}
                      className="w-full border-2 border-gray-200 text-primary py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      View Details
                    </motion.button>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedBooking && (
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
            <h3 className="text-2xl font-bold text-primary mb-4">Cancel Booking?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking for <strong>{selectedBooking.serviceName}</strong>?
            </p>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowCancelModal(false)}
                className="flex-1 border-2 border-gray-200 text-primary p-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                No, Keep It
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => cancelBooking.mutate(selectedBooking.id)}
                disabled={cancelBooking.isPending}
                className="flex-1 bg-red-500 text-white p-3 rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {cancelBooking.isPending ? 'Cancelling...' : 'Yes, Cancel'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
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
            <h3 className="text-2xl font-bold text-primary mb-4">Rate Your Experience</h3>
            <p className="text-gray-600 mb-4">How was your service with {selectedBooking.workerName}?</p>

            {/* Rating Stars */}
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star)}
                  className="text-5xl"
                >
                  {star <= rating ? '⭐' : '☆'}
                </motion.button>
              ))}
            </div>

            {/* Review Text */}
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience (optional)..."
              className="w-full border-2 border-gray-200 rounded-xl p-4 mb-6 focus:border-brand focus:outline-none resize-none"
              rows={4}
            />

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setShowReviewModal(false);
                  setRating(5);
                  setReview('');
                }}
                className="flex-1 border-2 border-gray-200 text-primary p-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => submitReview.mutate({ bookingId: selectedBooking.id, rating, comment: review })}
                disabled={submitReview.isPending}
                className="flex-1 bg-yellow-500 text-white p-3 rounded-xl font-semibold hover:bg-yellow-600 transition-all disabled:opacity-50"
              >
                {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
