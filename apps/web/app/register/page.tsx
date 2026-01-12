'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth';

type RegisterStep = 'phone' | 'otp' | 'profile';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { theme } = useTheme();

  const [step, setStep] = useState<RegisterStep>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'worker',
    // Worker specific fields
    jobCategory: '',
    paymentPerHour: '',
    preferredLocation: '',
    nextAvailableDate: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.phone || formData.phone.length !== 10) {
      setError('Phone must be 10 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });

      if (!response.ok) throw new Error('Failed to send OTP');
      const data = await response.json();
      setDevOtp(data.devCode || data.otp);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.otp || formData.otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp: formData.otp }),
      });

      if (!response.ok) throw new Error('Invalid OTP');
      setStep('profile');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name) {
      setError('Name is required');
      return;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setError('Valid email is required');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate worker fields if worker role
    if (formData.role === 'worker') {
      if (!formData.jobCategory) {
        setError('Job category is required');
        return;
      }
      if (!formData.paymentPerHour || parseFloat(formData.paymentPerHour) <= 0) {
        setError('Payment per hour must be greater than 0');
        return;
      }
      if (!formData.preferredLocation) {
        setError('Preferred location is required');
        return;
      }
      if (!formData.nextAvailableDate) {
        setError('Next available date is required');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          otp: formData.otp,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          ...(formData.role === 'worker' && {
            jobCategory: formData.jobCategory,
            paymentPerHour: parseFloat(formData.paymentPerHour),
            preferredLocation: formData.preferredLocation,
            nextAvailableDate: formData.nextAvailableDate,
          }),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Registration failed');
      }

      const data = await response.json();
      const userData = {
        id: data.userId,
        phone: data.phone,
        role: data.role,
        name: data.name,
        email: data.email,
      };
      login(data.token, data.userId, userData);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">Create Account</h1>
            <p className="text-center text-gray-600 text-sm mt-2">
              {step === 'phone' && 'Enter your phone number'}
              {step === 'otp' && 'Verify your phone number'}
              {step === 'profile' && 'Complete your profile'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Dev OTP Display */}
          {devOtp && step === 'otp' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-amber-500/20 backdrop-blur-sm border border-amber-400/50 rounded-xl"
            >
              <p className="text-amber-700 text-sm font-mono font-bold">🔑 OTP: {devOtp}</p>
            </motion.div>
          )}

          {/* Phone Step */}
          {step === 'phone' && (
            <motion.form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="10-digit number"
                  maxLength={10}
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </motion.button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/')}
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Login
                </button>
              </p>
            </motion.form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <motion.form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setFormData({ ...formData, otp: '' });
                    setDevOtp('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || formData.otp.length !== 6}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Profile Step */}
          {step === 'profile' && (
            <motion.form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'customer' | 'worker' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="customer">Customer</option>
                  <option value="worker">Worker</option>
                </select>
              </div>

              {/* Worker Specific Fields */}
              {formData.role === 'worker' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🔧 Job Category
                      </label>
                      <select
                        value={formData.jobCategory}
                        onChange={(e) => setFormData({ ...formData, jobCategory: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      >
                        <option value="">Select your job category</option>
                        <option value="Cleaning">House Cleaning & Maintenance</option>
                        <option value="Plumbing">Plumbing & Water Works</option>
                        <option value="Electrical">Electrical & Appliance Repair</option>
                        <option value="Carpentry">Carpentry & Woodwork</option>
                        <option value="Painting">Painting & Wall Finishing</option>
                        <option value="HVAC">AC & Refrigeration Repair</option>
                        <option value="Landscaping">Gardening & Landscaping</option>
                        <option value="Handyman">General Handyman Services</option>
                        <option value="Tutoring">Tutoring & Education</option>
                        <option value="Childcare">Childcare & Babysitting</option>
                        <option value="Cooking">Home Cooking & Catering</option>
                        <option value="Elder Care">Elder Care & Nursing</option>
                        <option value="Pet Care">Pet Care & Grooming</option>
                        <option value="Transportation">Transportation & Moving</option>
                        <option value="Other">Other Services</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Select the primary service you offer</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        💰 Payment Per Hour (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.paymentPerHour}
                        onChange={(e) => setFormData({ ...formData, paymentPerHour: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="500"
                        step="0.01"
                        min="0"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter your hourly rate</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📍 Preferred Location
                      </label>
                      <input
                        type="text"
                        value={formData.preferredLocation}
                        onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g., Bangalore, Mumbai"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">City or area where you prefer to work</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Available From
                      </label>
                      <input
                        type="date"
                        value={formData.nextAvailableDate}
                        onChange={(e) => setFormData({ ...formData, nextAvailableDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">When are you available to start work?</p>
                    </div>
                  </motion.div>
                </>
              )}

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </motion.button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/')}
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Login
                </button>
              </p>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
