'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme-context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [useOtpFallback, setUseOtpFallback] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ email: '', password: '' });

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({ email: '', password: '' });

    if (!formData.email || !formData.email.includes('@')) {
      setValidationErrors((prev) => ({ ...prev, email: 'Valid email is required' }));
      return;
    }
    if (!formData.password) {
      setValidationErrors((prev) => ({ ...prev, password: 'Password is required' }));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const endpoint = isAdminMode ? `${apiBase}/api/v1/auth/admin-login` : `${apiBase}/api/v1/auth/login`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      if (data.requiresOtp) {
        // Extract and display dev code for admin OTP
        if (data.devCode) {
          setDevOtp(data.devCode);
        }
        setStep('otp');
      } else {
        // Extract user data from response
        const userData = {
          id: data.userId,
          email: data.email,
          phone: data.phone,
          role: data.role,
          name: data.name
        };
        login(data.token, data.userId, userData);
        onClose();
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
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiBase}/api/v1/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      setDevOtp(data.devCode || data.otp);
      setStep('otp');
    } catch (err: any) {
      console.error('OTP Send Error:', err);
      setError(err.message || 'Failed to send verification code. Please check your email address and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const endpoint = isAdminMode ? `${apiBase}/api/v1/auth/admin-verify-otp` : `${apiBase}/api/v1/auth/verify-otp`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });

      if (!response.ok) throw new Error('Invalid OTP');
      const data = await response.json();
      
      // Extract user data from response
      const userData = {
        id: data.userId,
        email: data.email,
        phone: data.phone,
        role: data.role,
        name: data.name
      };
      login(data.token, data.userId, userData);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl shadow-lg p-8 border border-white/30"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(20px) saturate(150%)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-center text-white mb-4">Login</h2>

              {/* Admin Toggle */}
              <div className="flex items-center justify-center mb-6">
                <button
                  onClick={() => {
                    setIsAdminMode(!isAdminMode);
                    setError('');
                    setFormData({ email: '', password: '', otp: '' });
                    setStep('credentials');
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    isAdminMode 
                      ? 'bg-white text-gray-900' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isAdminMode ? '👤 Admin' : 'User'}
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl"
                >
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Dev OTP Display */}
              {devOtp && step === 'otp' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 bg-amber-500/20 backdrop-blur-sm border border-amber-400/50 rounded-xl"
                >
                  <p className="text-amber-200 text-sm font-mono font-bold">🔑 OTP: {devOtp}</p>
                </motion.div>
              )}

              {/* Credentials Form */}
              {step === 'credentials' && !useOtpFallback && (
                <motion.form onSubmit={handlePasswordLogin} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setValidationErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      className="w-full px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-lg rounded-xl focus:ring-2 focus:ring-white/50 outline-none transition-all border-b-2 text-white placeholder-gray-400"
                      placeholder="Enter Email Address *"
                    />
                    {validationErrors.email && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
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
                      className="w-full px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-lg rounded-xl focus:ring-2 focus:ring-white/50 outline-none pr-12 transition-all border-b-2 text-white placeholder-gray-400"
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
                      <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-white/50"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-200">
                      Remember Me
                    </label>
                  </div>

                  <div className="flex items-center justify-center text-xs">
                    <button
                      type="button"
                      onClick={() => {}}
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
                    className="w-full bg-white text-gray-900 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Signing in...' : 'Login'}
                  </motion.button>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center text-sm text-gray-300 mt-4"
                  >
                    Don't have an account?{' '}
                    <button
                      onClick={() => {
                        onClose();
                        router.push('/register');
                      }}
                      className="text-white font-semibold hover:opacity-80 transition-all"
                    >
                      Create Account
                    </button>
                  </motion.p>
                </motion.form>
              )}

              {/* OTP Request Form */}
              {step === 'credentials' && useOtpFallback && (
                <motion.form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setValidationErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      className="w-full px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-lg rounded-xl focus:ring-2 focus:ring-white/50 outline-none transition-all border-b-2 text-white placeholder-gray-400"
                      placeholder="Enter Email Address"
                      required
                    />
                    {validationErrors.email && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-gray-900 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                <motion.form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2 text-center">
                    Enter 6-Digit OTP sent to {formData.email}
                    </label>
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-3 border border-white/20 bg-white/10 backdrop-blur-lg rounded-xl focus:ring-2 focus:ring-white/50 outline-none text-center text-2xl tracking-widest font-mono transition-all border-b-2 text-white placeholder-gray-400"
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
                      onClick={() => {
                        setStep('credentials');
                        setFormData({ ...formData, otp: '' });
                        setDevOtp('');
                      }}
                      className="flex-1 bg-gray-200/80 backdrop-blur-sm text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-300/80 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading || formData.otp.length !== 6}
                      className="flex-1 bg-white text-gray-900 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
