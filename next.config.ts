import type { NextConfig } from 'next';
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:js|css|woff2?|png|jpg|svg|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

module.exports = withPWA(nextConfig);
