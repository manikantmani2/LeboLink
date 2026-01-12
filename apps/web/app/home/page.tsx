'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import WorkerCard from '@/components/WorkerCard';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 'all', name: 'All', icon: '🏠' },
  { id: 'electrician', name: 'Electrician', icon: '⚡' },
  { id: 'plumber', name: 'Plumber', icon: '🔧' },
  { id: 'cleaner', name: 'Cleaner', icon: '🧹' },
  { id: 'driver', name: 'Driver', icon: '🚗' },
  { id: 'carpenter', name: 'Carpenter', icon: '🔨' },
];

const workers = [
  { id: 1, name: 'Ravi Kumar', skill: 'Electrician', category: 'electrician', price: '₹400/hr', distanceKm: 2.1, rating: 4.8, jobs: 120, verified: true },
  { id: 2, name: 'Anita Sharma', skill: 'Cleaner', category: 'cleaner', price: '₹300/job', distanceKm: 1.4, rating: 4.9, jobs: 95, verified: true },
  { id: 3, name: 'Suresh Patel', skill: 'Driver', category: 'driver', price: '₹600/day', distanceKm: 3.2, rating: 4.7, jobs: 150, verified: true },
  { id: 4, name: 'Mohit Singh', skill: 'Plumber', category: 'plumber', price: '₹450/hr', distanceKm: 1.8, rating: 4.9, jobs: 180, verified: true },
  { id: 5, name: 'Priya Reddy', skill: 'Carpenter', category: 'carpenter', price: '₹500/hr', distanceKm: 2.5, rating: 4.6, jobs: 78, verified: true },
];

export default function HomePage() {
  const { searchQuery, selectedCategory, setSearchQuery, setSelectedCategory } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number>(0);
  const router = useRouter();

  const serverWorkersQuery = useQuery({
    queryKey: ['workers', { q: searchQuery, category: activeCategory }],
    queryFn: () =>
      apiFetch<{ workers: typeof workers }>({
        path: `/api/v1/users/search?q=${encodeURIComponent(searchQuery || '')}&category=${activeCategory === 'all' ? '' : activeCategory}`,
      }),
    staleTime: 10_000,
  });

  const sourceWorkers = serverWorkersQuery.data?.workers?.length ? serverWorkersQuery.data.workers : workers;

  const filteredWorkers = useMemo(() => {
    return sourceWorkers.filter((worker) => {
      const matchesCategory = activeCategory === 'all' || worker.category === activeCategory;
      const matchesSearch = !searchQuery || worker.name.toLowerCase().includes(searchQuery.toLowerCase()) || worker.skill.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVerified = !verifiedOnly || worker.verified;
      const matchesDistance = maxDistance == null || worker.distanceKm <= maxDistance;
      const matchesRating = worker.rating >= minRating;
      return matchesCategory && matchesSearch && matchesVerified && matchesDistance && matchesRating;
    });
  }, [sourceWorkers, activeCategory, searchQuery, verifiedOnly, maxDistance, minRating]);

  const content = (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">LeboLink</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="text-green-500">📍</span> Delivering in 30 mins
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/notifications')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="text-2xl">🔔</span>
              </button>
              <button onClick={() => router.push('/profile')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="text-2xl">👤</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for electricians, plumbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-full border-2 border-gray-200 focus:border-brand focus:outline-none transition-colors"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categories Scroll */}
        <div className="overflow-x-auto scrollbar-hide border-t border-gray-100">
          <div className="flex gap-2 px-4 py-3 max-w-7xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedCategory(cat.id === 'all' ? null : cat.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-brand text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-brand'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="font-medium text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-brand to-brand-dark text-white rounded-2xl p-6 mb-6 shadow-lg"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">{filteredWorkers.length}</div>
              <div className="text-sm opacity-90">Available Now</div>
            </div>
            <div>
              <div className="text-3xl font-bold">⚡</div>
              <div className="text-sm opacity-90">30 Min Delivery</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.8★</div>
              <div className="text-sm opacity-90">Avg Rating</div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">
            {filteredWorkers.length} Professionals Near You
          </h2>
          <button onClick={() => setShowFilter(true)} className="text-brand font-medium text-sm flex items-center gap-1">
            <span>Filter</span>
            <span>⚙️</span>
          </button>
        </div>

        {/* Workers Grid */}
        {filteredWorkers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No workers found</h3>
            <p className="text-gray-500">Try adjusting your search or category</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredWorkers.map((worker, i) => (
              <motion.div
                key={worker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <WorkerCard {...worker} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary">Filters</h3>
              <button onClick={() => setShowFilter(false)} className="text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
                <span>Verified workers only</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="w-32 text-sm text-gray-600">Max distance (km)</span>
                <label htmlFor="max-distance" className="sr-only">Max Distance</label>
                <input id="max-distance" type="number" min={1} max={20} value={maxDistance ?? ''} onChange={(e) => setMaxDistance(e.target.value ? Number(e.target.value) : null)} placeholder="Max" className="border rounded px-3 py-2 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-32 text-sm text-gray-600">Min rating</span>
                <label htmlFor="min-rating" className="sr-only">Min Rating</label>
                <input id="min-rating" type="number" min={0} max={5} step={0.1} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} placeholder="Rating" className="border rounded px-3 py-2 w-32" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => { setVerifiedOnly(false); setMaxDistance(null); setMinRating(0); }} className="flex-1 border-2 border-gray-200 rounded-xl py-3">Reset</button>
              <button onClick={() => setShowFilter(false)} className="flex-1 bg-brand text-white rounded-xl py-3">Apply</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
