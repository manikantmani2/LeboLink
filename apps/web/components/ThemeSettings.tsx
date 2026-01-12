'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, themeColors } from '@/lib/theme-context';

export default function ThemeSettings() {
  const [showModal, setShowModal] = useState(false);
  const { themeIndex, setThemeIndex } = useTheme();

  const handleThemeChange = (index: number) => {
    setThemeIndex(index);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-12 h-12 bg-transparent rounded-lg flex items-center justify-center hover:bg-gray-100/50 transition-all"
        title="Theme Settings"
      >
        <motion.svg 
          className="w-6 h-6 text-gray-600 hover:text-gray-900" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.32, repeat: Infinity, ease: 'linear' }}
          whileHover={{ scale: 1.1 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 z-50 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">THEME SETTINGS</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Choose Theme Color</h3>
              
              <div className="grid grid-cols-4 gap-4">
                {themeColors.map((theme, index) => (
                  <motion.button
                    key={theme.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleThemeChange(index)}
                    className={`relative h-16 rounded-xl ${theme.gradient} shadow-md hover:shadow-lg transition-all ${
                      themeIndex === index ? 'ring-4 ring-offset-2 ring-blue-400' : ''
                    }`}
                    title={theme.name}
                  >
                    {themeIndex === index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="text-white text-2xl drop-shadow-lg">✓</span>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
              
              <p className="text-sm text-gray-500 mt-6 text-center">
                Selected: <span className="font-semibold text-gray-700">{themeColors[themeIndex].name}</span>
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
