'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import OTPInput from '@/components/OTPInput';
import CAPTCHA from '@/components/CAPTCHA';

type SendOtpResponse = { success: boolean; devCode?: string };
type RegisterResponse = { success: boolean; token: string; userId: string };
type VerifyOtpResponse = { success: boolean; token: string; userId: string };

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [stage, setStage] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const sendOtp = useMutation({
    mutationFn: () =>
      apiFetch<SendOtpResponse>({
        path: '/api/v1/auth/send-otp',
        method: 'POST',
        body: { phone: formData.phone },
      }),
    onSuccess: (data) => {
      setStage('otp');
      setDevCode(data.devCode);
    },
  });

  const registerUser = useMutation({
    mutationFn: () =>
      apiFetch<RegisterResponse>({
        path: '/api/v1/auth/register',
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          otp,
          role: formData.role,
        },
      }),
    onSuccess: (data) => {
      login(data.token, data.userId, {
        id: data.userId,
        phone: formData.phone,
        role: formData.role as 'customer' | 'worker',
        name: formData.name,
        email: formData.email,
      });
      router.push('/role');
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone || formData.phone.length !== 10) newErrors.phone = 'Valid 10-digit phone required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm() && captchaVerified) {
      sendOtp.mutate();
    }
  };

  const handleSignup = () => {
    registerUser.mutate();
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

          <h2 className="text-3xl font-bold text-center text-primary mb-2">Create Account</h2>
          <p className="text-center text-gray-600 mb-8">
            {stage === 'details'
              ? 'Join LeboLink today - quick and easy registration'
              : 'Verify your phone number'}
          </p>

          {stage === 'details' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-brand focus:outline-none transition-colors"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-brand focus:outline-none transition-colors"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="Enter 10-digit number"
                    className="w-full border-2 border-gray-200 rounded-xl p-3 pl-16 focus:border-brand focus:outline-none transition-colors"
                  />
                </div>
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-brand focus:outline-none transition-colors"
                />
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-brand focus:outline-none transition-colors"
                />
                {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">I am a</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-transparent has-[:checked]:border-orange-600">
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={formData.role === 'customer'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 font-medium text-primary">Customer</span>
                  </label>
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-transparent has-[:checked]:border-orange-600">
                    <input
                      type="radio"
                      name="role"
                      value="worker"
                      checked={formData.role === 'worker'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 font-medium text-primary">Worker/Service Provider</span>
                  </label>
                </div>
              </div>

              {/* CAPTCHA */}
              <CAPTCHA value="" onChange={setCaptchaVerified} />

              <button
                onClick={handleContinue}
                disabled={sendOtp.isPending || !captchaVerified}
                className="w-full bg-gradient-to-r from-brand to-brand-dark text-white rounded-xl p-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-6"
              >
                {sendOtp.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Sending OTP...
                  </span>
                ) : (
                  'Continue →'
                )}
              </button>

              {sendOtp.isError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg"
                >
                  {(sendOtp.error as Error)?.message}
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {devCode && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 text-center"
                >
                  <p className="text-xs text-amber-700 mb-2 font-medium">🔐 Development Mode - Your OTP:</p>
                  <p className="text-4xl font-bold text-amber-900 tracking-widest">{devCode}</p>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter 6-digit OTP sent to <span className="text-brand font-semibold">+91 {formData.phone}</span>
                </label>
                <OTPInput length={6} value={otp} onChange={setOtp} />
              </div>

              <button
                onClick={handleSignup}
                disabled={!otp || registerUser.isPending}
                className="w-full bg-gradient-to-r from-brand to-brand-dark text-white rounded-xl p-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {registerUser.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Creating Account...
                  </span>
                ) : (
                  'Create Account & Continue →'
                )}
              </button>

              <button
                onClick={() => {
                  setStage('details');
                  setOtp('');
                  setDevCode(undefined);
                }}
                className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>

              {registerUser.isError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg"
                >
                  {(registerUser.error as Error)?.message}
                </motion.p>
              )}
            </motion.div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-brand font-semibold hover:underline"
            >
              Login here
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            By continuing, you agree to our{' '}
            <button className="text-brand font-medium">Terms</button> &{' '}
            <button className="text-brand font-medium">Privacy Policy</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
