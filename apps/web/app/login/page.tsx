'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme-context';
import { getApiBase, parseResponseBody } from '@/lib/api';
import ThemeSettings from '@/components/ThemeSettings';

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { theme } = useTheme();

  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({ email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ contact: '', password: '' });

  const currentTheme = theme;

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({ contact: '', password: '' });
    setLoading(true);

    const isEmailMethod = method === 'email';
    const contact = isEmailMethod ? formData.email : formData.phone;

    if (!contact) {
      setValidationErrors((prev) => ({ ...prev, contact: `${isEmailMethod ? 'Email' : 'Phone'} cannot be blank.` }));
      setLoading(false);
      return;
    }

    if (!isEmailMethod) {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setError('Phone number must be 10 digits');
        setLoading(false);
        return;
      }
      if (!/^[6-9]/.test(cleanPhone)) {
        setError('Indian phone number must start with 6, 7, 8, or 9');
        setLoading(false);
        return;
      }
    }

    if (!formData.password) {
      setValidationErrors((prev) => ({ ...prev, password: 'Password cannot be blank.' }));
      setLoading(false);
      return;
    }

    try {
      const apiBase = getApiBase();
      const loginData = isEmailMethod
        ? { email: formData.email, password: formData.password }
        : { phone: formData.phone, password: formData.password };

      const response = await fetch(`${apiBase}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await parseResponseBody<any>(response);
      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      login(data.token, data.userId, {
        id: data.userId,
        email: data.email || formData.email,
        phone: data.phone || formData.phone,
        role: (data.role || 'customer') as 'customer' | 'worker',
        name: data.name,
      });

      if (!data.hasProfile) {
        router.push('/signup');
      } else {
        router.push(data.role === 'worker' ? '/feed' : '/home');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center backdrop-blur-xl">
      <div className="absolute top-4 right-4 z-20">
        <ThemeSettings />
      </div>

      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-lg p-8 border border-white/30"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(20px) saturate(150%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          }}
        >
          <h2 className="text-2xl font-bold text-center text-white mb-6">Login</h2>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-4 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} onSubmit={handlePasswordLogin} className="space-y-3">
            <div className="flex gap-3 mb-2">
              <button type="button" onClick={() => { setMethod('email'); setValidationErrors({ contact: '', password: '' }); setError(''); }} className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all ${method === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/50'}`}>📧 Email</button>
              <button type="button" onClick={() => { setMethod('phone'); setValidationErrors({ contact: '', password: '' }); setError(''); }} className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all ${method === 'phone' ? 'bg-blue-600 text-white' : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/50'}`}>📱 Phone</button>
            </div>

            <div>
              {method === 'email' ? (
                <input type="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setValidationErrors((prev) => ({ ...prev, contact: '' })); }} className={`w-full px-4 py-3 border ${validationErrors.contact && method === 'email' ? 'border-red-400' : 'border-gray-300/50'} bg-white/10 backdrop-blur-lg rounded-xl focus:ring-2 focus:ring-white/50 outline-none transition-all border-b-2 border-white/20`} placeholder="Enter Email Address *" />
              ) : (
                <input type="tel" value={formData.phone} onChange={(e) => { const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10); let formatted = ''; if (onlyDigits.length > 0) { if (onlyDigits.length <= 5) { formatted = onlyDigits; } else if (onlyDigits.length <= 8) { formatted = onlyDigits.slice(0, 5) + ' ' + onlyDigits.slice(5); } else { formatted = onlyDigits.slice(0, 5) + ' ' + onlyDigits.slice(5, 8) + ' ' + onlyDigits.slice(8); } } setFormData({ ...formData, phone: formatted }); setValidationErrors((prev) => ({ ...prev, contact: '' })); }} className={`w-full px-4 py-3 border ${validationErrors.contact && method === 'phone' ? 'border-red-400' : 'border-gray-300/50'} bg-white/10 backdrop-blur-lg rounded-xl focus:ring-2 focus:ring-white/50 outline-none transition-all border-b-2 border-white/20`} placeholder="Enter Phone Number * (98765 43210)" maxLength={14} />
              )}
              {validationErrors.contact && <p className="text-red-500 text-xs mt-1">{validationErrors.contact}</p>}
            </div>

            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setValidationErrors((prev) => ({ ...prev, password: '' })); }} className={`w-full px-4 py-3 border ${validationErrors.password ? 'border-red-400' : 'border-gray-300/50'} bg-white/10 backdrop-blur-lg rounded-xl focus:ring-2 focus:ring-white/50 outline-none pr-12 transition-all border-b-2 border-white/20`} placeholder="Enter Password *" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors">{showPassword ? '👁️' : '👁️‍🗨️'}</button>
              {validationErrors.password && <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>}
            </div>

            <div className="flex items-center">
              <input type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className={`w-4 h-4 ${theme?.primary || 'text-blue-600'} border-gray-300 rounded focus:ring-white/50`} />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-200">Remember Me</label>
            </div>

            <div className="flex items-center justify-center text-xs">
              <button type="button" onClick={() => router.push('/forgot-password')} className="text-red-400 hover:text-red-300 font-medium transition-colors">Forgot Password?</button>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:opacity-90 transition-all">
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>

            <p className="text-center text-sm text-gray-300 mt-2">Don't have an account? <button onClick={() => router.push('/signup')} className="text-white font-semibold">Create Account</button></p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
