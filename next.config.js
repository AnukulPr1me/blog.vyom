/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    // Realistic device sizes — no need to generate 2048px+ for a blog
    deviceSizes: [360, 480, 640, 768, 1024, 1280],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Cache optimized images for 30 days — external images rarely change
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // AVIF is ~50% smaller than WebP on mobile — better LCP
    formats: ['image/avif', 'image/webp'],
  },

  // Compress responses — reduces transfer size by ~70% for HTML/CSS/JS
  compress: true,

  // Reduce JS bundle size: don't include source maps in production
  productionBrowserSourceMaps: false,

  // HTTP cache headers for static assets — Vercel respects these
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Static assets get long cache — content-hashed filenames ensure
        // no stale content is served after a deploy
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
