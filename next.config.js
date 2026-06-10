/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warnings don't fail the build; only errors do.
    // We've fixed all errors - this is a safety net for any remaining warnings.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Type errors are caught at dev time; don't block production builds.
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
