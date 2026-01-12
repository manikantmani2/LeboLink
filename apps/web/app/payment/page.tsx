'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiFetch } from '@/lib/api';

const stripePromise = typeof window !== 'undefined'
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
  : null;

type BookingResponse = {
  id: string;
  amount?: number;
  currency?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
};

type IntentResponse = {
  paymentId: string;
  clientSecret?: string;
  amount: number;
  currency: string;
  status: string;
};

export default function PaymentPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="p-6 text-gray-700">Loading payment...</div>}>
        <PaymentPageInner />
      </Suspense>
    </ProtectedRoute>
  );
}

function PaymentPageInner() {
  const params = useSearchParams();
  const bookingId = params.get('id');

  if (!bookingId) {
    return <div className="p-6 text-red-600">Missing booking id.</div>;
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return <div className="p-6 text-amber-600">Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable online payments.</div>;
  }

  return <PaymentContent bookingId={bookingId} />;
}

function PaymentContent({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentStatus, setIntentStatus] = useState<string | null>(null);

  const bookingQuery = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => apiFetch<BookingResponse>({ path: `/api/v1/bookings/${bookingId}` }),
  });

  const intentMutation = useMutation({
    mutationFn: (method: 'card' | 'upi' | 'cod') =>
      apiFetch<IntentResponse>({ path: '/api/v1/payments/intent', method: 'POST', body: { bookingId, method } }),
    onSuccess: (data, method) => {
      setIntentStatus(data.status);
      if (method === 'cod') {
        router.push(`/tracking?id=${bookingId}`);
        return;
      }
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    },
  });

  const startOnlinePayment = () => intentMutation.mutate('card');
  const chooseCod = () => intentMutation.mutate('cod');

  const amountText = bookingQuery.data?.amount
    ? `${bookingQuery.data.amount} ${bookingQuery.data.currency ?? 'INR'}`
    : '₹499';

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Complete Payment</h1>
          <p className="text-gray-600 text-sm">Booking #{bookingId.slice(-6)}</p>
        </div>

        {bookingQuery.isLoading && <div className="text-gray-600">Loading booking...</div>}
        {bookingQuery.isError && (
          <div className="text-red-600 text-sm">Could not load booking details.</div>
        )}

        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Amount</span>
            <span className="text-xl font-bold text-primary">{amountText}</span>
          </div>
          <div className="text-xs text-gray-500">Flat-fee pricing applied.</div>
        </div>

        {!clientSecret && (
          <div className="space-y-3">
            <button
              onClick={startOnlinePayment}
              disabled={intentMutation.isPending}
              className="w-full bg-brand text-white rounded-xl py-4 font-semibold shadow hover:shadow-md disabled:opacity-50"
            >
              {intentMutation.isPending ? 'Preparing payment...' : 'Pay Online (Card/UPI)'}
            </button>
            <button
              onClick={chooseCod}
              disabled={intentMutation.isPending}
              className="w-full border-2 border-gray-200 rounded-xl py-4 font-semibold text-primary bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Cash on Delivery
            </button>
            {intentStatus && <div className="text-xs text-gray-600">Payment status: {intentStatus}</div>}
          </div>
        )}

        {clientSecret && (
          <Elements
            stripe={stripePromise!}
            options={{ clientSecret, appearance: { theme: 'stripe' } }}
          >
            <CardPaymentForm onSuccess={() => router.push(`/tracking?id=${bookingId}`)} />
          </Elements>
        )}
      </div>
    </div>
  );
}

function CardPaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });
    setSubmitting(false);
    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      return;
    }
    onSuccess();
  };

  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
      <PaymentElement />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button
        onClick={handleSubmit}
        disabled={submitting || !stripe || !elements}
        className="w-full bg-brand text-white rounded-xl py-3 font-semibold disabled:opacity-50"
      >
        {submitting ? 'Processing...' : 'Pay now'}
      </button>
    </div>
  );
}
