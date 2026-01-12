'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const locationTypes = [
  { id: 'home', label: '🏠 Home', value: 'home' },
  { id: 'office', label: '🏢 Office', value: 'office' },
  { id: 'friend', label: '👥 Friends & Family', value: 'friend' },
  { id: 'other', label: '📍 Other', value: 'other' },
];

const relations = [
  'Self',
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Colleague',
  'Other',
];

type SelectedWorker = {
  id?: number | string;
  name: string;
  skill: string;
  price: string;
  distanceKm: number;
  rating?: number;
  jobs?: number;
  verified?: boolean;
};

type CreateBookingResponse = {
  id: string;
  status: string;
};

export default function BookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stage, setStage] = useState<'location' | 'receiver'>('location');
  const [selectedWorker, setSelectedWorker] = useState<SelectedWorker | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    locationType: 'home',
    locationAddress: '',
    receiverName: '',
    receiverPhone: '',
    relation: '',
  });

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('selectedWorker') : null;
    if (raw) {
      try {
        setSelectedWorker(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const createBooking = useMutation({
    mutationFn: (body: any) => apiFetch<CreateBookingResponse>({ path: '/api/v1/bookings', method: 'POST', body }),
    onSuccess: (data) => {
      router.push(`/payment?id=${data.id}`);
    },
  });

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationTypeSelect = (type: string) => {
    setFormData({ ...formData, locationType: type });
    // If selecting Home or Office, skip receiver details
    if (type === 'home' || type === 'office') {
      setStage('location');
    }
  };

  const handleReceiverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const receiverRequired = formData.locationType === 'friend' || formData.locationType === 'other';
  const locationComplete = formData.locationAddress?.trim().length > 0;

  const submitBooking = () => {
    const payload = {
      customerId: user?.id || 'guest',
      workerId: selectedWorker?.id?.toString?.() ?? 'demo-worker',
      jobId: selectedWorker?.id ? String(selectedWorker.id) : undefined,
      serviceName: selectedWorker?.skill ?? 'General Service',
      customerName: formData.name,
      customerPhone: formData.phone,
      locationType: formData.locationType,
      locationAddress: formData.locationAddress,
      receiverName: receiverRequired ? formData.receiverName || formData.name : undefined,
      receiverPhone: receiverRequired ? formData.receiverPhone || formData.phone : undefined,
      receiverRelation: receiverRequired ? formData.relation || 'Other' : undefined,
    };
    createBooking.mutate(payload);
  };

  const handleContinue = () => {
    if (!receiverRequired) {
      submitBooking();
    } else {
      setStage('receiver');
    }
  };

  const handleConfirm = () => {
    submitBooking();
  };

  const content = (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Book Service</h1>
          <p className="text-sm text-gray-500 mt-1">
            {stage === 'location'
              ? 'Step 1: Service Location Details'
              : 'Step 2: Receiver Information'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {selectedWorker && (
          <div className="mb-6 bg-white border-2 border-brand/20 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Worker Selected</div>
                <div className="text-lg font-semibold text-primary">{selectedWorker.name}</div>
                <div className="text-sm text-gray-600">{selectedWorker.skill}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{selectedWorker.price}</div>
                <div className="text-sm text-gray-500">📍 {selectedWorker.distanceKm} km</div>
              </div>
            </div>
          </div>
        )}

        {createBooking.isError && (
          <div className="mb-4 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {(createBooking.error as Error)?.message || 'Could not create booking'}
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          <motion.div
            className={`flex-1 h-2 rounded-full transition-colors ${
              stage === 'location' || stage === 'receiver' ? 'bg-brand' : 'bg-gray-200'
            }`}
          />
          <motion.div
            className={`flex-1 h-2 rounded-full transition-colors ${
              stage === 'receiver' ? 'bg-brand' : 'bg-gray-200'
            }`}
          />
        </div>

        {/* Location Details Stage */}
        {stage === 'location' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Your Name */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleLocationChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand focus:outline-none transition-colors"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleLocationChange}
                  placeholder="10-digit number"
                  maxLength={10}
                  className="w-full px-4 py-3 pl-16 border-2 border-gray-200 rounded-xl focus:border-brand focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Location Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-3">
                Service Location Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {locationTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLocationTypeSelect(type.value)}
                    className={`p-4 rounded-xl border-2 font-medium text-lg transition-all ${
                      formData.locationType === type.value
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {type.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Location Address */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-primary">
                Service Address
              </label>
              <p className="text-sm text-gray-600">
                Enter the complete address including street, building, and flat/house number
              </p>
              <textarea
                name="locationAddress"
                value={formData.locationAddress}
                onChange={handleLocationChange}
                placeholder="e.g., 123 Main Street, Apt 4B, Downtown, City, State 12345"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Continue Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinue}
              disabled={!formData.name || !formData.phone || !locationComplete || createBooking.isPending}
              className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              {createBooking.isPending
                ? 'Booking...'
                : formData.locationType === 'home' || formData.locationType === 'office'
                  ? 'Confirm Booking →'
                  : 'Add Receiver Details →'}
            </motion.button>

            {/* Back Button */}
            <button
              onClick={() => window.history.back()}
              className="w-full bg-white border-2 border-gray-200 text-primary py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {/* Receiver Details Stage */}
        {stage === 'receiver' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Service Location Summary */}
            <div className="bg-brand/10 border-2 border-brand rounded-xl p-4">
              <h3 className="font-semibold text-primary mb-2">Your Location Details</h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Name:</span> {formData.name}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> +91 {formData.phone}
                </p>
                <p>
                  <span className="font-medium">Type:</span>{' '}
                  {locationTypes.find((t) => t.value === formData.locationType)?.label}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {formData.locationAddress}
                </p>
              </div>
            </div>

            <div className="border-t-2 border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-primary mb-6">Receiver Details</h2>

              {/* Receiver Name */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Receiver Name
                </label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleReceiverChange}
                  placeholder="Enter receiver's full name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand focus:outline-none transition-colors"
                />
              </div>

              {/* Receiver Phone */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Receiver Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="receiverPhone"
                    value={formData.receiverPhone}
                    onChange={handleReceiverChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    className="w-full px-4 py-3 pl-16 border-2 border-gray-200 rounded-xl focus:border-brand focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Relation */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Relation to You
                </label>
                <select
                  name="relation"
                  value={formData.relation}
                  onChange={handleReceiverChange}
                  aria-label="Relation to you"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand focus:outline-none transition-colors"
                >
                  <option value="">Select relation...</option>
                  {relations.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Confirm Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={!formData.receiverName || !formData.receiverPhone || !formData.relation || createBooking.isPending}
              className="w-full bg-gradient-to-r from-brand to-brand-dark text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              {createBooking.isPending ? 'Booking...' : '✓ Confirm Booking'}
            </motion.button>

            {/* Back Button */}
            <button
              onClick={() => setStage('location')}
              className="w-full bg-white border-2 border-gray-200 text-primary py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
