'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';

const customerNavItems = [
  { href: '/home', label: 'Home', icon: '🏠', activeIcon: '🏠' },
  { href: '/my-bookings', label: 'Bookings', icon: '📋', activeIcon: '📋' },
  { href: '/tracking', label: 'Tracking', icon: '🗺️', activeIcon: '🗺️' },
  { href: '/profile', label: 'Profile', icon: '👤', activeIcon: '👤' },
];

const workerNavItems = [
  { href: '/feed', label: 'Jobs', icon: '💼', activeIcon: '💼' },
  { href: '/worker-jobs', label: 'My Jobs', icon: '📊', activeIcon: '📊' },
  { href: '/earnings', label: 'Earnings', icon: '💰', activeIcon: '💰' },
  { href: '/profile', label: 'Profile', icon: '👤', activeIcon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isWorker = user?.role === 'worker';
  const navItems = isWorker ? workerNavItems : customerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-brand/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`text-2xl relative z-10 transition-transform ${isActive ? 'scale-110' : ''}`}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span
                className={`text-xs font-semibold relative z-10 ${
                  isActive ? 'text-brand' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
