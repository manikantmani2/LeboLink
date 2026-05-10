'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth';
import { getApiBase } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'worker',
    jobCategory: '',
    paymentPerHour: '',
    preferredLocation: '',
    nextAvailableDate: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name) {
      setError('Name is required');
      return;
    }

    if (!formData.email && !formData.phone) {
      setError('Email or phone is required');
      return;
    }

    if (formData.email && !formData.email.includes('@')) {
      setError('Valid email is required');
      return;
    }

    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setError('Phone number must be 10 digits');
        return;
      }
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
      const apiBase = getApiBase();
      const registerData: any = {
        name: formData.name,
        password: formData.password,
        role: formData.role,
      };

      if (formData.email) registerData.email = formData.email;
      if (formData.phone) registerData.phone = formData.phone;

      if (formData.role === 'worker') {
        registerData.jobCategory = formData.jobCategory;
        registerData.paymentPerHour = parseFloat(formData.paymentPerHour);
        registerData.preferredLocation = formData.preferredLocation;
        registerData.nextAvailableDate = formData.nextAvailableDate;
      }

      const response = await fetch(`${apiBase}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
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
            <p className="text-center text-gray-600 text-sm mt-2">Create your LeboLink account</p>
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="9876543210"
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
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🔧 Job Category</label>
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
                    <option value="Other">Other Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💰 Payment Per Hour (₹)</label>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📍 Preferred Location</label>
                  <input
                    type="text"
                    value={formData.preferredLocation}
                    onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Bangalore, Mumbai"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📅 Available From</label>
                  <input
                    type="date"
                    value={formData.nextAvailableDate}
                    onChange={(e) => setFormData({ ...formData, nextAvailableDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </motion.div>
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
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500">
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

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>

            <p className="text-center text-sm text-gray-600">Already have an account? <button onClick={() => router.push('/login')} className="text-blue-600 font-semibold hover:text-blue-700">Login</button></p>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
