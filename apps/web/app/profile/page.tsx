'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme-context';
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import ThemeSettings from '@/components/ThemeSettings';

type UserProfile = {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'customer' | 'worker';
  skills?: string[];
  profileImage?: string;
  settings?: Settings;
};

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, userId } = useAuth();
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [s, setS] = useState<Settings>(defaults);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'work' | 'notifications' | 'privacy' | 'app'>('profile');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Fetch user profile
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => apiFetch<UserProfile>({ path: `/api/v1/users/${userId}` }),
    enabled: !!userId,
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
      // Load settings from database
      if (profile.settings) {
        setS({ ...defaults, ...profile.settings });
      }
      // Load profile image from database
      if (profile.profileImage) {
        setProfileImage(profile.profileImage);
      }
    }
  }, [profile]);

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setProfileImage(result);
        // Save to database
        try {
          await apiFetch({
            path: `/api/v1/users/${userId}`,
            method: 'PUT',
            body: { profileImage: result },
          });
          refetch();
        } catch (error) {
          console.error('Failed to save profile image:', error);
          alert('Failed to save profile image');
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = async () => {
    setProfileImage(null);
    // Remove from database
    try {
      await apiFetch({
        path: `/api/v1/users/${userId}`,
        method: 'PUT',
        body: { profileImage: null },
      });
      refetch();
    } catch (error) {
      console.error('Failed to remove profile image:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await apiFetch({
        path: `/api/v1/users/${userId}`,
        method: 'PUT',
        body: { settings: s },
      });
      await refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    setS(defaults);
    setSaved(false);
    try {
      await apiFetch({
        path: `/api/v1/users/${userId}`,
        method: 'PUT',
        body: { settings: defaults },
      });
      await refetch();
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  // Define tabs based on user role
  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
    ...(profile?.role === 'worker' ? [{ id: 'work' as const, label: 'Work', icon: '💼' }] : []),
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

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: (data: { name?: string; email?: string; phone?: string }) =>
      apiFetch({ path: `/api/v1/users/${userId}`, method: 'PUT', body: data }),
    onSuccess: () => {
      setIsEditing(false);
      refetch();
    },
  });

  const handleSave = () => {
    updateProfile.mutate(formData);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const content = (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className={`${theme.gradient} text-white shadow-md relative`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-sm opacity-80 hover:opacity-100">← Back</button>
          </div>
          <h1 className="text-xl font-bold">Profile & Settings</h1>
          <div className="w-6"></div>
        </div>
        {/* Theme Settings Button */}
        <div className="absolute top-4 right-4">
          <ThemeSettings />
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="relative flex flex-col items-center gap-2">
                <div
                  onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                  className="cursor-pointer relative group"
                >
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white ring-2 ring-brand/20 hover:ring-brand/40 transition-all"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg border-4 border-white ring-2 ring-brand/20 hover:ring-brand/40 transition-all">
                      {profile?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center text-sm shadow-lg">
                    📷
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold capitalize">{profile?.role || 'Customer'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                    <span>✓</span> Verified
                  </span>
                </div>

                {/* Photo Menu */}
                {showPhotoMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowPhotoMenu(false)}
                    />
                    <div className="absolute top-0 left-24 z-50 bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden min-w-[180px]">
                      {profileImage && (
                        <button
                          onClick={() => {
                            setShowImageModal(true);
                            setShowPhotoMenu(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors text-left"
                        >
                          <span className="text-lg">👁️</span>
                          <span className="text-sm">View photo</span>
                        </button>
                      )}
                      <label className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleImageUpload(e);
                            setShowPhotoMenu(false);
                          }}
                          className="hidden"
                        />
                        <span className="text-lg">📂</span>
                        <span className="text-sm">Upload photo</span>
                      </label>
                      {profileImage && (
                        <button
                          onClick={() => {
                            removeProfileImage();
                            setShowPhotoMenu(false);
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-600 transition-colors text-left border-t border-gray-700"
                        >
                          <span className="text-lg">🗑️</span>
                          <span className="text-sm">Remove photo</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold capitalize">{profile?.role || 'Customer'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-0.5">
                    <span>✓</span> Verified
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{profile?.name || 'Sumit'}</h2>
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📧</span>
                    <span>{formData.email || user?.email || 'sumi@gmail.com'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-pink-500">📞</span>
                    <span>{formData.phone || user?.phone || '9876543210'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-[140px]">
              <div className="flex gap-2 bg-white/80 backdrop-blur-lg rounded-full shadow-lg border border-gray-200/50 p-1.5">
                <button onClick={resetSettings} disabled={saving} className="border border-gray-300 text-gray-700 rounded-full px-3 py-1.5 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs">
                  <span className="flex items-center justify-center gap-1"><span>🔄</span> Reset</span>
                </button>
                <button onClick={saveSettings} disabled={saving} className={`${theme.primary} text-white rounded-full px-3 py-1.5 font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-xs`}>
                  {saving ? (
                    <span className="flex items-center justify-center gap-1"><span className="animate-spin">⏳</span> Saving</span>
                  ) : (
                    <span className="flex items-center justify-center gap-1"><span>💾</span> Save</span>
                  )}
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-3 py-1.5 font-semibold text-white shadow-sm hover:shadow-md transition-transform hover:scale-105 text-xs"
              >
                <span>🔒</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
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

        {/* Settings Content */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">📝</span> Edit Profile
                    </h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className={`px-4 py-2 ${theme.primary} text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all`}
                      >
                        ✏️ Edit Profile
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                            className="w-full pl-14 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none cursor-not-allowed"
                            placeholder="10-digit number"
                            maxLength={10}
                            disabled
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: profile?.name || '',
                              email: profile?.email || '',
                              phone: profile?.phone || '',
                            });
                          }}
                          className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={updateProfile.isPending}
                          className={`flex-1 px-4 py-3 ${theme.primary} text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="py-3 border-b border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Full Name</div>
                        <div className="text-base font-medium text-gray-900">{profile?.name || 'Not set'}</div>
                      </div>

                      <div className="py-3 border-b border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Email Address</div>
                        <div className="text-base font-medium text-gray-900">{profile?.email || 'Not set'}</div>
                      </div>

                      <div className="py-3 border-b border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Phone Number</div>
                        <div className="text-base font-medium text-gray-900 flex items-center gap-2">
                          <span>+91 {profile?.phone}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span>
                        </div>
                      </div>

                      <div className="py-3">
                        <div className="text-xs text-gray-500 mb-1">Role</div>
                        <div className="text-base font-medium text-gray-900 capitalize">{profile?.role || 'Customer'}</div>
                      </div>

                      {profile?.role === 'worker' && profile?.skills && profile.skills.length > 0 && (
                        <div className="py-3">
                          <div className="text-xs text-gray-500 mb-2">Skills</div>
                          <div className="flex flex-wrap gap-2">
                            {profile.skills.map((skill, i) => (
                              <span key={i} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {updateProfile.isSuccess && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 p-6">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✅</span>
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1">Profile Updated</h4>
                        <p className="text-sm text-green-700">Your profile information has been successfully updated.</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

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

                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-2xl">⚡</span> Developer Info</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">API Base URL</div>
                      <div className="text-sm text-gray-700 font-mono break-all bg-white px-3 py-2 rounded border border-gray-200">{process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">App Version</div>
                      <div className="text-sm text-gray-700 font-mono">v1.0.0</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
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

        {/* Image View Modal */}
        <AnimatePresence>
          {showImageModal && profileImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
              onClick={() => setShowImageModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute -top-4 -right-4 w-10 h-10 bg-white text-gray-900 rounded-full text-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  ×
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
