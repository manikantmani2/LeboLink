'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import BookingStepper from '@/components/BookingStepper';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/api';

const fallbackSteps = ['Requested', 'Accepted', 'In Progress', 'Completed'];

type TrackResponse = {
  booking: {
    id: string;
    status: string;
    etaMinutes?: number;
    trackingNote?: string;
    location?: { address: string; type?: string };
    receiver?: { name: string; phone: string; relation?: string };
    customerName?: string;
    customerPhone?: string;
    serviceName?: string;
    workerId?: string;
    statusHistory?: { status: string; at: string; note?: string; etaMinutes?: number }[];
  };
  progress: { steps: string[]; currentStep: number; etaMinutes?: number; note?: string };
  map?: {
    workerLocation?: { lat: number; lng: number };
    customerLocation?: { lat: number; lng: number };
  };
};

export default function TrackingPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="p-6 text-gray-700">Loading booking...</div>}>
        <TrackingPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function TrackingPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get('id');

  const query = useQuery({
    queryKey: ['booking-track', bookingId],
    queryFn: () => apiFetch<TrackResponse>({ path: `/api/v1/bookings/${bookingId}/track` }),
    enabled: Boolean(bookingId),
    refetchInterval: 5000,
  });

  if (!bookingId) {
    return <div className="p-6 text-gray-700">No booking id provided.</div>;
  }

  if (query.isPending) {
    return <div className="p-6 text-gray-700">Loading booking...</div>;
  }

  if (query.isError) {
    return (
      <div className="p-6 text-red-600">
        {(query.error as Error)?.message || 'Unable to load booking'}
      </div>
    );
  }

  const { booking, progress } = query.data as TrackResponse;
  const steps = progress?.steps?.length ? progress.steps.map((s) => s.replace('-', ' ')) : fallbackSteps;
  const statusLabel = booking.status.replace('-', ' ');
  const etaText = typeof progress.etaMinutes === 'number'
    ? `${progress.etaMinutes} mins`
    : typeof booking.etaMinutes === 'number'
      ? `${booking.etaMinutes} mins`
      : 'Updating...';

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Booking #{booking.id?.slice(-6) || bookingId}</p>
            <h1 className="text-2xl font-semibold text-primary capitalize">{statusLabel}</h1>
          </div>
          <button
            onClick={() => router.push('/home')}
            className="text-sm font-semibold text-brand hover:text-brand-dark"
          >
            ← Back to Home
          </button>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <BookingStepper current={progress.currentStep} steps={steps} />
          <div className="flex items-center justify-between text-sm text-gray-700">
            <div className="font-semibold text-primary">ETA: {etaText}</div>
            <div className="capitalize px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold">
              {statusLabel}
            </div>
          </div>
          {progress.note && (
            <div className="text-sm text-gray-600">{progress.note}</div>
          )}
          {/* Live Status Indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-blue-900 mb-1">🔄 Service in Progress</p>
            <p className="text-xs text-blue-700">Worker is on the way. Updates every 5 seconds.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm space-y-1">
            <div className="font-semibold text-primary mb-1">Service Details</div>
            <p className="text-sm text-gray-800">{booking.serviceName || 'Scheduled service'}</p>
            <p className="text-xs text-gray-600">Worker: {booking.workerId || 'Assigned'}</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm space-y-1">
            <div className="font-semibold text-primary mb-1">Location</div>
            <p className="text-sm text-gray-800">{booking.location?.address || 'Address shared'}</p>
            {booking.location?.type && (
              <p className="text-xs text-gray-600 capitalize">{booking.location.type}</p>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-1">
          <div className="font-semibold text-primary mb-1">Contact</div>
          <p className="text-sm text-gray-800">
            Customer: {booking.customerName || 'You'} {booking.customerPhone ? `(+91 ${booking.customerPhone})` : ''}
          </p>
          {booking.receiver && (
            <p className="text-sm text-gray-800">
              Receiver: {booking.receiver.name} {booking.receiver.phone ? `(+91 ${booking.receiver.phone})` : ''}
              {booking.receiver.relation ? ` · ${booking.receiver.relation}` : ''}
            </p>
          )}
        </div>

        {booking.statusHistory?.length ? (
          <div className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
            <div className="font-semibold text-primary">Timeline</div>
            {booking.statusHistory.map((item) => (
              <div key={`${item.status}-${item.at}`} className="flex items-center justify-between text-sm text-gray-700">
                <span className="capitalize">{item.status.replace('-', ' ')}</span>
                <span className="text-gray-500">{new Date(item.at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
