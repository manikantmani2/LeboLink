const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const defaultProductionApiBase = 'https://lebolink-api.onrender.com';

module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async rewrites() {
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || defaultProductionApiBase).replace(/\/$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
});