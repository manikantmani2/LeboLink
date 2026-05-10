const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async rewrites() {
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
});