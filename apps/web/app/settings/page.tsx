"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/lib/auth';

type Settings = {
  availability: boolean;
  autoAcceptJobs: boolean;
  maxJobsPerDay: number;
  workRadius: number;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingAlerts: boolean;
  paymentAlerts: boolean;
  promotionAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showPhoneNumber: boolean;
  showLastSeen: boolean;
  allowReviews: boolean;
  language: string;
  currency: string;
};

const defaults: Settings = {
  availability: true,
  autoAcceptJobs: false,
  maxJobsPerDay: 5,
  workRadius: 10,
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  bookingAlerts: true,
  paymentAlerts: true,
  promotionAlerts: false,
  soundEnabled: true,
  vibrationEnabled: true,
  showPhoneNumber: false,
  showLastSeen: true,
  allowReviews: true,
  language: 'English',
  currency: 'INR',
};

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [s, setS] = useState<Settings>(defaults);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'work' | 'notifications' | 'privacy' | 'app'>('work');

  const profile = {
    name: user?.name || 'Sumit',
    email: user?.email || 'sumi@gmail.com',
    phone: user?.phone || '+91 9876543210',
    role: user?.role || 'Customer',
    verified: true,
  };

  useEffect(() => {
    const raw = localStorage.getItem('lebolink:settings');
    if (raw) {
      try {
        setS({ ...defaults, ...JSON.parse(raw) });
      } catch {}
    }
  }, []);

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('lebolink:settings', JSON.stringify(s));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 200);
  };

  const reset = () => {
    setS(defaults);
    localStorage.removeItem('lebolink:settings');
    setSaved(false);
  };

  const tabs = [
    { id: 'work' as const, label: 'Work', icon: '💼' },
    { id: 'notifications' as const, label: 'Notifications', icon: '🔔' },
    { id: 'privacy' as const, label: 'Privacy', icon: '🔒' },
    { id: 'app' as const, label: 'App', icon: '⚙️' },
  ];

  const ToggleSwitch = ({ checked, onChange, disabled }: { checked: boolean; onChange: (val: boolean) => void; disabled?: boolean }) => (
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-24">
        <header className="bg-gradient-to-r from-brand to-brand-dark text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-80">← Back</span>
              <div>
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-sm opacity-90">Manage preferences, notifications, and account</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors">Edit Profile</button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 -mt-10 mb-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                {profile.name[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold capitalize">{profile.role}</span>
                  {profile.verified && <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">Verified</span>}
                </div>
                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  <div className="flex items-center gap-2"><span className="text-gray-400">📧</span>{profile.email}</div>
                  <div className="flex items-center gap-2"><span className="text-gray-400">📞</span>{profile.phone}<span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Verified</span></div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto flex justify-start md:justify-end text-sm">
              <button
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-transform hover:-translate-y-[1px]"
              >
                <span className="text-base">🔒</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 sticky top-[76px] z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-brand border-b-2 border-brand'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'work' && (
              <motion.div
                key="work"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-2xl">🎯</span> Work Preferences</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between py-3 cursor-pointer border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">Available for Work</div>
                        <div className="text-xs text-gray-500">You'll appear in search results</div>
                      </div>
                      <ToggleSwitch checked={s.availability} onChange={(val) => setS({ ...s, availability: val })} />
                    </label>
                    <label className="flex items-center justify-between py-3 cursor-pointer border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">Auto-Accept Jobs</div>
                        <div className="text-xs text-gray-500">Automatically accept matching requests</div>
                      </div>
                      <ToggleSwitch checked={s.autoAcceptJobs} onChange={(val) => setS({ ...s, autoAcceptJobs: val })} />
                    </label>
                    <div className="py-3 border-b border-gray-100">
                      <label className="block">
                        <div className="font-medium text-gray-900 mb-2">Max Jobs Per Day</div>
                        <div className="flex items-center gap-4">
                          <input type="range" min="1" max="20" value={s.maxJobsPerDay} onChange={(e) => setS({ ...s, maxJobsPerDay: parseInt(e.target.value) })} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand" />
                          <span className="text-sm font-bold text-brand min-w-[3ch] text-center">{s.maxJobsPerDay}</span>
                        </div>
                      </label>
                    </div>
                    <div className="py-3">
                      <label className="block">
                        <div className="font-medium text-gray-900 mb-2">Work Radius (km)</div>
                        <div className="flex items-center gap-4">
                          <input type="range" min="1" max="50" value={s.workRadius} onChange={(e) => setS({ ...s, workRadius: parseInt(e.target.value) })} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand" />
                          <span className="text-sm font-bold text-brand min-w-[4ch] text-center">{s.workRadius} km</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-2xl">📢</span> Notification Channels</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between py-3 cursor-pointer border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">Push Notifications</div>
                        <div className="text-xs text-gray-500">Instant alerts on device</div>
                      </div>
                      <ToggleSwitch checked={s.pushNotifications} onChange={(val) => setS({ ...s, pushNotifications: val })} />
                    </label>
                    <label className="flex items-center justify-between py-3 cursor-pointer border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">Email Notifications</div>
                        <div className="text-xs text-gray-500">Updates via email</div>
                      </div>
                      <ToggleSwitch checked={s.emailNotifications} onChange={(val) => setS({ ...s, emailNotifications: val })} />
                    </label>
                    <label className="flex items-center justify-between py-3 cursor-pointer">
                      <div>
                        <div className="font-medium text-gray-900">SMS Notifications</div>
                        <div className="text-xs text-gray-500">Text messages for important updates</div>
                      </div>
                      <ToggleSwitch checked={s.smsNotifications} onChange={(val) => setS({ ...s, smsNotifications: val })} />
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-2xl">🎚️</span> Notification Types</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between py-3 cursor-pointer border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">Booking Alerts</div>
                        <div className="text-xs text-gray-500">New bookings and status updates</div>
                      </div>
                      <ToggleSwitch checked={s.bookingAlerts} onChange={(val) => setS({ ...s, bookingAlerts: val })} />
                    </label>
                    <label className="flex items-center justify-between py-3 cursor-pointer border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">Payment Alerts</div>
                        <div className="text-xs text-gray-500">Payment received and transaction updates</div>
                      </div>
                      <ToggleSwitch checked={s.paymentAlerts} onChange={(val) => setS({ ...s, paymentAlerts: val })} />
                    </label>
                    <label className="flex items-center justify-between py-3 cursor-pointer">
                      <div>
                        <div className="font-medium text-gray-900">Promotions & Offers</div>
                        <div className="text-xs text-gray-500">Special deals and announcements</div>
                      </div>
                      <ToggleSwitch checked={s.promotionAlerts} onChange={(val) => setS({ ...s, promotionAlerts: val })} />
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-2xl">🔊</span> Sound & Vibration</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between py-3 cursor-pointer border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">Sound Alerts</div>
                        <div className="text-xs text-gray-500">Play sound for notifications</div>
                      </div>
                      <ToggleSwitch checked={s.soundEnabled} onChange={(val) => setS({ ...s, soundEnabled: val })} />
                    </label>
                    <label className="flex items-center justify-between py-3 cursor-pointer">
                      <div>
                        <div className="font-medium text-gray-900">Vibration</div>
                        <div className="text-xs text-gray-500">Vibrate on new notifications</div>
                      </div>
                      <ToggleSwitch checked={s.vibrationEnabled} onChange={(val) => setS({ ...s, vibrationEnabled: val })} />
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-2xl">🛡️</span> Privacy</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between py-3 cursor-pointer border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">Show Phone Number</div>
                        <div className="text-xs text-gray-500">Display your phone on public profile</div>
                      </div>
                      <ToggleSwitch checked={s.showPhoneNumber} onChange={(val) => setS({ ...s, showPhoneNumber: val })} />
                    </label>
                    <label className="flex items-center justify-between py-3 cursor-pointer border-b border-gray-100">
                      <div>
                        <div className="font-medium text-gray-900">Show Last Seen</div>
                        <div className="text-xs text-gray-500">Let others see when you were last online</div>
                      </div>
                      <ToggleSwitch checked={s.showLastSeen} onChange={(val) => setS({ ...s, showLastSeen: val })} />
                    </label>
                    <label className="flex items-center justify-between py-3 cursor-pointer">
                      <div>
                        <div className="font-medium text-gray-900">Allow Reviews</div>
                        <div className="text-xs text-gray-500">Let customers rate your service</div>
                      </div>
                      <ToggleSwitch checked={s.allowReviews} onChange={(val) => setS({ ...s, allowReviews: val })} />
                    </label>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Privacy Notice</h4>
                      <p className="text-sm text-blue-700">We never share your personal data without consent. Control what others see above.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'app' && (
              <motion.div
                key="app"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-2xl">🌐</span> Language & Region</h3>
                  <div className="space-y-4">
                    <div className="py-3 border-b border-gray-100">
                      <label className="block">
                        <div className="font-medium text-gray-900 mb-2">Language</div>
                        <select value={s.language} onChange={(e) => setS({ ...s, language: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent">
                          <option>English</option>
                          <option>हिंदी (Hindi)</option>
                          <option>தமிழ் (Tamil)</option>
                          <option>తెలుగు (Telugu)</option>
                          <option>বাংলা (Bengali)</option>
                          <option>मराठी (Marathi)</option>
                        </select>
                      </label>
                    </div>
                    <div className="py-3">
                      <label className="block">
                        <div className="font-medium text-gray-900 mb-2">Currency</div>
                        <select value={s.currency} onChange={(e) => setS({ ...s, currency: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent">
                          <option value="INR">₹ INR - Indian Rupee</option>
                          <option value="USD">$ USD - US Dollar</option>
                          <option value="EUR">€ EUR - Euro</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
            <div className="flex gap-2 bg-white/80 backdrop-blur-lg rounded-full shadow-2xl border border-gray-200/50 p-2">
              <button onClick={reset} disabled={saving} className="border border-gray-300 text-gray-700 rounded-full px-5 py-2.5 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm">
                <span className="flex items-center justify-center gap-1.5"><span className="text-lg">🔄</span> Reset</span>
              </button>
              <button onClick={save} disabled={saving} className="bg-gradient-to-r from-brand to-brand-dark text-white rounded-full px-5 py-2.5 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-sm">
                {saving ? (
                  <span className="flex items-center justify-center gap-1.5"><span className="animate-spin text-lg">⏳</span> Saving...</span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5"><span className="text-lg">💾</span> Save</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-2xl font-bold shadow-2xl">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">✓</span>
                  <span>Settings saved successfully!</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
