'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme-context';
import ThemeSettings from '@/components/ThemeSettings';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromLanding = searchParams.get('from') === 'landing';
  const { login } = useAuth();
  const { theme } = useTheme();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [useOtpFallback, setUseOtpFallback] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ phone: '', password: '' });

  const currentTheme = theme;

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({ phone: '', password: '' });
    setLoading(true);

    // Validation
    if (!formData.phone) {
      setValidationErrors((prev) => ({ ...prev, phone: 'Phone number cannot be blank.' }));
      setLoading(false);
      return;
    }
    if (!formData.password) {
      setValidationErrors((prev) => ({ ...prev, password: 'Password cannot be blank.' }));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      login(data.token, data.userId, {
        id: data.userId,
        phone: formData.phone,
        role: (data.role || 'customer') as 'customer' | 'worker',
        name: data.name,
      });

      if (!data.hasProfile) {
        router.push('/signup');
      } else {
        router.push(data.role === 'worker' ? '/feed' : '/home');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setDevOtp(data.devCode || '');
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
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          otp: formData.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      login(data.token, data.userId, {
        id: data.userId,
        phone: formData.phone,
        role: (data.role || 'customer') as 'customer' | 'worker',
        name: data.name,
      });

      if (!data.hasProfile) {
        router.push('/signup');
      } else {
        router.push(data.role === 'worker' ? '/feed' : '/home');
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center backdrop-blur-xl">
      {/* Theme Settings Button */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSettings />
      </div>

      <div className="w-full max-w-md px-4">
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-lg p-8 border border-white/30"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(20px) saturate(150%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <h2 className="text-2xl font-bold text-center text-white mb-6">Login</h2>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Dev OTP Display */}
          {devOtp && step === 'otp' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 backdrop-blur-sm border-2 border-amber-400 rounded-xl"
            >
              <p className="text-amber-800 text-sm font-mono font-bold">🔑 Dev OTP: {devOtp}</p>
            </motion.div>
          )}

          {/* Credentials Form */}
          {step === 'credentials' && !useOtpFallback && (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handlePasswordLogin}
              className="space-y-3"
            >
              <div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') });
                      setValidationErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    className={`w-full px-4 py-3 border ${
                      validationErrors.phone ? 'border-red-400' : 'border-gray-300/50'
                    } bg-white/10 backdrop-blur-lg rounded-xl focus:ring-2 focus:ring-white/50 ${theme?.border || 'focus:border-blue-500'} outline-none transition-all border-b-2 border-white/20`}
                    placeholder="Enter Phone Number *"
                    maxLength={10}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setValidationErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    className={`w-full px-4 py-3 border ${
                      validationErrors.password ? 'border-red-400' : 'border-gray-300/50'
                    } bg-white/10 backdrop-blur-lg rounded-xl focus:ring-2 focus:ring-white/50 ${theme?.border || 'focus:border-blue-500'} outline-none pr-12 transition-all border-b-2 border-white/20`}
                    placeholder="Enter Password *"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                  {validationErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`w-4 h-4 ${theme?.primary || 'text-blue-600'} border-gray-300 rounded focus:ring-white/50`}
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-200">
                    Remember Me
                  </label>
                </div>

                {/* Links */}
                <div className="flex items-center justify-center text-xs">
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="text-red-400 hover:text-red-300 font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setUseOtpFallback(true)}
                    className="text-gray-200 hover:text-white font-medium text-xs transition-colors"
                  >
                    Use OTP Login?
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full ${theme?.gradient || 'bg-gradient-to-r from-blue-600 to-purple-600'} hover:opacity-90 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span> Signing in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* OTP Request Form */}
            {step === 'credentials' && useOtpFallback && (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      className={`w-full pl-14 pr-4 py-2 border border-white/20 bg-white/10 backdrop-blur-lg rounded-xl focus:ring-2 focus:ring-white/50 outline-none transition-all border-b-2`}
                      placeholder="10-digit number"
                      required
                      maxLength={10}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full ${theme?.gradient || 'bg-gradient-to-r from-blue-600 to-purple-600'} hover:opacity-90 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setUseOtpFallback(false)}
                  className="w-full text-center py-2 text-sm text-gray-200 font-semibold hover:text-white rounded-xl transition-all"
                >
                  ← Back to Password Login
                </button>
              </motion.form>
            )}

            {/* OTP Verification Form */}
            {step === 'otp' && (
              <motion.form
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Enter 6-Digit OTP sent to +91 {formData.phone}
                  </label>
                  <input
                    type="text"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                    className={`w-full px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-lg rounded-xl focus:ring-2 focus:ring-white/50 outline-none text-center text-2xl tracking-widest font-mono transition-all border-b-2`}
                    placeholder="000000"
                    required
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => { setStep('credentials'); setFormData({ ...formData, otp: '' }); setDevOtp(''); }}
                    className="flex-1 bg-gray-200/80 backdrop-blur-sm text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-300/80 transition-all"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || formData.otp.length !== 6}
                    className={`flex-1 ${theme?.gradient || 'bg-gradient-to-r from-blue-600 to-purple-600'} hover:opacity-90 text-white py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </motion.button>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full text-center py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50/50 rounded-xl transition-all"
                >
                  Resend OTP
                </button>
              </motion.form>
            )}

            {/* Sign Up Link */}
            {step === 'credentials' && !useOtpFallback && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-sm text-gray-300 mt-4"
              >
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/signup')}
                  className={`font-semibold ${theme?.text || 'text-blue-600'} hover:opacity-80 transition-all`}
                  style={{
                    background: `linear-gradient(135deg, ${theme?.from?.replace('from-', '') || 'rgb(37, 99, 235)'}, ${theme?.to?.replace('to-', '') || 'rgb(147, 51, 234)'}`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Create Account
                </button>
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>
  );
}
