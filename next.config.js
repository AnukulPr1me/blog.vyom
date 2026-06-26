/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    // Mobile-first device sizes — no 2048px variants that waste bandwidth
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Cache optimized images for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // AVIF ~50% smaller than WebP on mobile — best for LCP
    formats: ['image/avif', 'image/webp'],
    // Allow SVGs (for icons, logos)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },

  // Gzip/Brotli compression — reduces HTML/JS/CSS transfer by ~70%
  compress: true,

  // No source maps in production — smaller JS bundles
  productionBrowserSourceMaps: false,

  // Experimental: optimize package imports to reduce bundle size
  // (tree-shakes lucide-react so only used icons are bundled)
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking — stops your pages being embedded in iframes on other sites
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Don't send full referrer URL to external sites
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Enforce HTTPS for 1 year — prevents downgrade attacks
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Control browser features
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Basic XSS protection for older browsers
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        // Immutable cache for hashed static assets
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // API routes — never cache, always fresh
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
