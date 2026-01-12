'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';

type Noti = {
  id: string;
  title: string;
  message: string;
  at: string;
  read: boolean;
  type: 'booking' | 'promo' | 'system';
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Noti[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('lebolink:notifications');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
        return;
      } catch {}
    }
    const seed: Noti[] = [
      { id: '1', title: 'Booking Confirmed', message: 'Your electrician will arrive in 30 minutes.', at: new Date().toISOString(), read: false, type: 'booking' },
      { id: '2', title: 'Limited Time Offer', message: 'Get 10% off on cleaning services today.', at: new Date(Date.now() - 3600_000).toISOString(), read: false, type: 'promo' },
      { id: '3', title: 'Welcome to LeboLink', message: 'Thanks for joining! Explore services near you.', at: new Date(Date.now() - 24 * 3600_000).toISOString(), read: true, type: 'system' },
    ];
    setItems(seed);
  }, []);

  useEffect(() => {
    localStorage.setItem('lebolink:notifications', JSON.stringify(items));
  }, [items]);

  const visible = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'unread') return items.filter((n) => !n.read);
    return items.filter((n) => n.read);
  }, [items, filter]);

  const markAllRead = () => setItems((curr) => curr.map((n) => ({ ...n, read: true })));
  const clearRead = () => setItems((curr) => curr.filter((n) => !n.read));

  const content = (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Notifications</h1>
            <p className="text-sm text-gray-500">Stay up to date</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="text-sm bg-brand text-white px-3 py-2 rounded-lg">Mark all read</button>
            <button onClick={clearRead} className="text-sm border border-gray-200 px-3 py-2 rounded-lg">Clear read</button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-3 flex items-center gap-2">
          {(['all','unread','read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm ${filter===f?'bg-brand text-white':'bg-white border border-gray-200'}`}
            >
              {f[0].toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {visible.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border">
            <div className="text-5xl mb-2">🔔</div>
            <p className="text-gray-600">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {visible.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`bg-white rounded-2xl border p-4 flex items-start justify-between ${n.read?'opacity-80':''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{n.type==='booking'?'📦':n.type==='promo'?'🎁':'ℹ️'}</span>
                    <div>
                      <h3 className="font-semibold text-primary">{n.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(n.at).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!n.read && (
                      <button onClick={() => setItems((curr)=>curr.map(x=>x.id===n.id?{...x,read:true}:x))} className="text-sm bg-brand text-white px-3 py-2 rounded-lg">Mark read</button>
                    )}
                    <button onClick={() => setItems((curr)=>curr.filter(x=>x.id!==n.id))} className="text-sm border border-gray-200 px-3 py-2 rounded-lg">Dismiss</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
