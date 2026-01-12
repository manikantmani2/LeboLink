'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import ProtectedRoute from '@/components/ProtectedRoute';

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: 'How do I book a service?',
    answer: 'Browse workers on the Home page, select a worker, fill in your details, and proceed to payment. You can track your order in real-time after booking.',
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel bookings with "Requested" status from the My Bookings page. Once a worker accepts and starts the job, cancellation is not available.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept UPI, cards (via Stripe), and Cash on Delivery (COD). You can choose your preferred payment method during checkout.',
  },
  {
    question: 'How do I track my order?',
    answer: 'Go to the Tracking page or click "Track Order" on your booking card in My Bookings. You can see real-time location and status updates.',
  },
  {
    question: 'How do I rate a worker?',
    answer: 'After your service is completed, go to My Bookings → History tab, and click "Rate This Service" on the completed booking.',
  },
  {
    question: 'What if the worker doesn\'t show up?',
    answer: 'Contact our support immediately via the "Contact Support" button below. We will assign another worker or process a full refund.',
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const content = (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand to-brand-dark text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => router.back()} className="mb-2 text-white/80 hover:text-white">
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-white/80 text-sm mt-1">We're here to help you</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push('/my-bookings')}
              className="bg-white border-2 border-brand rounded-2xl p-5 text-center shadow-sm hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-2">📋</div>
              <div className="font-semibold text-primary">My Bookings</div>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push('/tracking')}
              className="bg-white border-2 border-brand rounded-2xl p-5 text-center shadow-sm hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-2">🗺️</div>
              <div className="font-semibold text-primary">Track Order</div>
            </motion.button>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mb-8">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-2">Need Immediate Help?</h3>
            <p className="mb-4 text-white/90">Our support team is available 24/7</p>
            <div className="flex gap-3">
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="tel:+919999999999"
                className="flex-1 bg-white text-green-600 py-3 rounded-xl font-semibold text-center hover:bg-green-50 transition-all flex items-center justify-center gap-2"
              >
                <span>📞</span>
                <span>Call Us</span>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="https://wa.me/919999999999"
                target="_blank"
                className="flex-1 bg-white text-green-600 py-3 rounded-xl font-semibold text-center hover:bg-green-50 transition-all flex items-center justify-center gap-2"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* FAQs */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-all"
                >
                  <span className="font-semibold text-primary pr-4">{faq.question}</span>
                  <span className="text-2xl text-brand">{expandedFAQ === index ? '−' : '+'}</span>
                </button>
                {expandedFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-5 pb-5 text-gray-700 leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Email Support */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-primary mb-2">Email Support</h3>
          <p className="text-gray-700 mb-3">For non-urgent queries, email us at:</p>
          <a
            href="mailto:support@lebolink.com"
            className="text-brand font-semibold underline hover:text-brand-dark"
          >
            support@lebolink.com
          </a>
          <p className="text-sm text-gray-600 mt-2">We typically respond within 24 hours</p>
        </div>

        {/* App Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>LeboLink v1.0.0</p>
          <p className="mt-1">© 2026 LeboLink. All rights reserved.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
