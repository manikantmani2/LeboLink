'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import RatingStars from './RatingStars';

type Props = {
  id?: number;
  name: string;
  skill: string;
  price: string;
  distanceKm: number;
  rating?: number;
  jobs?: number;
  verified?: boolean;
};

export default function WorkerCard({ id, name, skill, price, distanceKm, rating = 4.2, jobs = 0, verified = false }: Props) {
  const router = useRouter();

  const handleBooking = () => {
    // Store worker details in session/localStorage for booking page
    sessionStorage.setItem(
      'selectedWorker',
      JSON.stringify({ id, name, skill, price, distanceKm, rating, jobs, verified })
    );
    router.push('/booking');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="border-2 border-gray-100 rounded-2xl p-5 shadow-sm bg-white hover:shadow-xl hover:border-brand/30 transition-all cursor-pointer"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-white font-bold text-2xl">
            {name.charAt(0)}
          </div>
          {verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg">
              ✓
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-bold text-lg text-primary">{name}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <span>{skill}</span>
                <span className="text-gray-400">•</span>
                <span className="text-brand font-medium">📍 {distanceKm} km</span>
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2 mb-3">
            <div className="flex items-center gap-1">
              <RatingStars rating={rating} />
              <span className="text-sm font-semibold text-gray-700">{rating}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-600">{jobs} jobs</span>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">{price}</div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBooking}
              className="px-6 py-2.5 rounded-full bg-brand text-white font-semibold text-sm shadow-md hover:shadow-lg hover:bg-brand-dark transition-all"
            >
              Book Now →
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
