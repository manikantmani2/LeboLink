'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleRoleSelection = (role: 'worker' | 'customer') => {
    // Store role preference in localStorage
    if (user?.id) {
      localStorage.setItem(`user_${user.id}_role`, role);
    }
    
    // Redirect based on role
    if (role === 'worker') {
      router.push('/feed');
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand/5 to-purple-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              L
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-primary mb-2">Who is using LeboLink?</h2>
          <p className="text-center text-gray-600 mb-8">Pick the option that matches what you need to do today.</p>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelection('worker')}
              className="w-full text-left border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:border-brand hover:bg-brand/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center text-2xl group-hover:bg-brand/20 transition-colors">
                  🔧
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg text-primary">Worker / Service Provider</div>
                  <div className="text-sm text-gray-600">Accept or reject jobs, schedule visits, keep customers updated</div>
                </div>
                <div className="text-brand text-xl">→</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelection('customer')}
              className="w-full text-left border-2 border-gray-200 rounded-xl p-6 shadow-sm hover:border-brand hover:bg-brand/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center text-2xl group-hover:bg-brand/20 transition-colors">
                  👤
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg text-primary">Customer</div>
                  <div className="text-sm text-gray-600">Book a worker, share location, pay securely, and track progress</div>
                </div>
                <div className="text-brand text-xl">→</div>
              </div>
            </motion.button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            You can always switch roles later from your profile
          </p>
        </div>
      </motion.div>
    </div>
  );
}
