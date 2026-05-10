const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');

if (process.env.NODE_ENV === 'production' && !apiBase) {
  throw new Error(
    'Missing NEXT_PUBLIC_API_BASE_URL environment variable during build. ' +
      'Set NEXT_PUBLIC_API_BASE_URL to your deployed backend API URL in Vercel project settings.'
  );
}

module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
});