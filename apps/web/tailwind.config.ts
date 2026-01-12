import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  safelist: [
    // Theme gradient colors
    'bg-gradient-to-br',
    'from-blue-500', 'via-blue-600', 'to-blue-700',
    'from-orange-400', 'via-orange-500', 'to-red-500',
    'from-green-400', 'via-green-500', 'to-green-600',
    'from-purple-400', 'via-purple-500', 'to-purple-600',
    'from-slate-700', 'via-slate-800', 'to-slate-900',
    'from-pink-500', 'via-fuchsia-500', 'to-purple-600',
    'from-gray-700', 'via-gray-800', 'to-gray-900',
    // Theme primary colors
    'bg-blue-600', 'bg-orange-600', 'bg-green-600', 'bg-purple-600',
    'bg-slate-800', 'bg-fuchsia-600', 'bg-gray-800',
    'hover:bg-blue-700', 'hover:bg-orange-700', 'hover:bg-green-700',
    'hover:bg-purple-700', 'hover:bg-slate-900', 'hover:bg-fuchsia-700',
    'hover:bg-gray-900',
    // Theme text colors
    'text-blue-600', 'text-orange-600', 'text-green-600', 'text-purple-600',
    'text-slate-800', 'text-fuchsia-600', 'text-gray-800',
    // Theme border colors
    'border-blue-600', 'border-orange-600', 'border-green-600', 'border-purple-600',
    'border-slate-800', 'border-fuchsia-600', 'border-gray-800',
    // Theme ring colors
    'ring-blue-500', 'ring-orange-500', 'ring-green-500', 'ring-purple-500',
    'ring-slate-700', 'ring-fuchsia-500', 'ring-gray-700',
    // Theme background colors
    'bg-blue-50', 'bg-orange-50', 'bg-green-50', 'bg-purple-50',
    'bg-slate-50', 'bg-fuchsia-50', 'bg-gray-50',
    // Logo gradients
    'from-blue-600', 'from-orange-600', 'from-green-600', 'from-purple-600',
    'from-slate-800', 'from-fuchsia-600', 'from-gray-800',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF6B35',
          dark: '#E8590C',
          light: '#FF8F66',
        },
        primary: {
          DEFAULT: '#1a1a1a',
          light: '#333333',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config