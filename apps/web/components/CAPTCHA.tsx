'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type CAPTCHAProps = {
  onChange: (isValid: boolean) => void;
  value: string;
};

export default function CAPTCHA({ onChange, value }: CAPTCHAProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  // Generate new CAPTCHA on mount
  useEffect(() => {
    generateCAPTCHA();
  }, []);

  const generateCAPTCHA = () => {
    const n1 = Math.floor(Math.random() * 50) + 1;
    const n2 = Math.floor(Math.random() * 50) + 1;
    setNum1(n1);
    setNum2(n2);
    setAnswer('');
    setError(false);
    onChange(false);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAnswer(val);

    if (val === '') {
      onChange(false);
      setError(false);
      return;
    }

    const correctAnswer = num1 + num2;
    const isCorrect = parseInt(val) === correctAnswer;

    if (isCorrect) {
      setError(false);
      onChange(true);
    } else {
      setError(true);
      onChange(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <label className="block text-sm font-medium text-gray-700">
        Verify You're Human
      </label>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-gray-800">
              {num1} <span className="text-2xl mx-2">+</span> {num2} <span className="text-2xl mx-2">=</span> <span className="text-blue-600">?</span>
            </p>
          </div>
          <button
            type="button"
            onClick={generateCAPTCHA}
            className="ml-4 px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
            title="Refresh CAPTCHA"
          >
            🔄
          </button>
        </div>

        <input
          type="text"
          placeholder="Enter the answer"
          value={answer}
          onChange={handleAnswerChange}
          className={`w-full border-2 rounded-lg p-3 text-center text-lg font-semibold focus:outline-none transition-colors ${
            answer === ''
              ? 'border-gray-200 focus:border-blue-500'
              : error
              ? 'border-red-500 focus:border-red-600'
              : 'border-green-500 focus:border-green-600'
          }`}
        />

        {error && answer !== '' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-sm mt-2 text-center font-medium"
          >
            ✗ Incorrect answer. Please try again.
          </motion.p>
        )}

        {!error && answer !== '' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-600 text-sm mt-2 text-center font-medium"
          >
            ✓ Verified! You're good to go.
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
