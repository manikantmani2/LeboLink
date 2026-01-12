'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { useEffect, useState } from 'react';
import ThemeSettings from '@/components/ThemeSettings';
import LoginModal from '@/components/LoginModal';

const defaultTheme = {
  from: 'from-blue-500',
  via: 'via-blue-600',
  to: 'to-blue-700',
  logo: 'from-blue-600',
  primary: 'bg-blue-600 hover:bg-blue-700',
  text: 'text-blue-600',
  border: 'border-blue-600',
  ring: 'ring-blue-500',
  lightBg: 'bg-blue-50',
  gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700'
};

const categories = [
  { name: 'Electrician', icon: '⚡', color: 'bg-yellow-500' },
  { name: 'Plumber', icon: '🔧', color: 'bg-blue-500' },
  { name: 'Cleaner', icon: '🧹', color: 'bg-green-500' },
  { name: 'Driver', icon: '🚗', color: 'bg-purple-500' },
  { name: 'Carpenter', icon: '🔨', color: 'bg-orange-500' },
  { name: 'Painter', icon: '🎨', color: 'bg-pink-500' },
  { name: 'Cook', icon: '👨‍🍳', color: 'bg-red-500' },
  { name: 'Gardener', icon: '🌱', color: 'bg-emerald-500' },
];

const features = [
  {
    step: '1',
    title: 'Choose Service',
    desc: 'Select from 100+ verified professionals',
    icon: '🔍',
  },
  {
    step: '2',
    title: 'Book Instantly',
    desc: 'Confirm your booking in seconds',
    icon: '⚡',
  },
  {
    step: '3',
    title: 'Get Service',
    desc: 'Professional arrives in 30 minutes',
    icon: '✅',
  },
];

export default function LandingPage() {
  return <LandingPageContent />;
}

function LandingPageContent() {
  const router = useRouter();
  const [theme, setTheme] = useState(defaultTheme);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Get theme from context
  const themeContext = useTheme();
  
  useEffect(() => {
    if (themeContext?.theme) {
      setTheme(themeContext.theme);
    }
  }, [themeContext]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className={`w-10 h-10 ${theme.primary} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                L
              </div>
              <span className="text-2xl font-bold text-primary">LeboLink</span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLoginModal(true)}
                className="text-primary hover:text-brand transition-colors font-medium"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signup')}
                className={`${theme.primary} text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl`}
              >
                Get Started
              </button>
              <ThemeSettings />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`inline-flex items-center space-x-2 ${theme.lightBg} px-4 py-2 rounded-full mb-6`}>
                <span className="text-2xl">⚡</span>
                <span className={`${theme.text} font-semibold`}>30 Minute Delivery Guaranteed</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
                Get Skilled Labour
                <span className={`block ${theme.text}`}>At Your Doorstep</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                India's fastest labour booking platform. Book trusted electricians, plumbers, cleaners,
                drivers & more - delivered to your location in just 30 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/signup')}
                  className={`${theme.primary} text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105`}
                >
                  Book Now →
                </button>
                <button className="border-2 border-primary text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-primary hover:text-white transition-all">
                  Learn More
                </button>
              </div>
              <div className="flex items-center space-x-8 mt-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 text-2xl">✓</span>
                  <span>Verified Professionals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 text-2xl">✓</span>
                  <span>Instant Booking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 text-2xl">✓</span>
                  <span>Secure Payment</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-purple-500/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-9xl mb-4">👷</div>
                    <p className="text-2xl font-bold text-primary">Your Service Hero</p>
                    <p className="text-gray-600">Ready in 30 minutes</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">Popular Services</h2>
            <p className="text-xl text-gray-600">Choose from 100+ verified professional services</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, i) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push('/signup')}
                className="bg-white border-2 border-gray-100 rounded-2xl p-6 text-center cursor-pointer hover:shadow-xl transition-all hover:border-brand"
              >
                <div
                  className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 text-3xl`}
                >
                  {category.icon}
                </div>
                <h3 className="font-semibold text-primary">{category.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get service in 3 simple steps</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg text-center relative"
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {feature.step}
                </div>
                <div className="text-6xl mb-4 mt-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${theme.gradient}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of satisfied customers. Book your first service now!
            </p>
            <button
              onClick={() => router.push('/signup')}
              className="bg-white text-brand px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:scale-105"
            >
              Start Booking Now →
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white font-bold text-xl">
                  L
                </div>
                <span className="text-2xl font-bold">LeboLink</span>
              </div>
              <p className="text-gray-400 text-sm">
                India's fastest labour booking platform. 30-minute delivery guaranteed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Electrician</li>
                <li>Plumber</li>
                <li>Cleaner</li>
                <li>Driver</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Refund Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400 space-y-1">
            <div>© 2026 LeboLink. All rights reserved.</div>
            <div>
              Designed &amp; Developed by{' '}
              <a
                href="https://www.linkedin.com/in/manikant-sharma-14252425a/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-white hover:text-gray-300 underline underline-offset-4"
              >
                Manikant Sharma
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
