import path from 'node:path';
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    // Pin workspace root so Turbopack ignores a stray lockfile in $HOME.
    root: path.resolve(__dirname, '..', '..'),
  },
  // Hide the dev-only "N" / "Compiling…" badge; compile and runtime errors still show.
  devIndicators: false,
  async redirects() {
    // Old job pages now live under the persistent navbar on /home.
    return [
      { source: '/ish', destination: '/home/ish', permanent: false },
      { source: '/map', destination: '/home/ish/xarita', permanent: false },
    ];
  },
  async rewrites() {
    // Next.js 16 refuses to optimize upstream images that resolve to a
    // private IP. We proxy MinIO (localhost:9000) through the web origin so
    // <Image src="/_media/..."> stays same-origin and loads fine.
    const minio = (
      process.env.NEXT_PUBLIC_MINIO_ORIGIN ?? 'http://localhost:9000'
    ).replace(/\/$/, '');
    const bucket = process.env.NEXT_PUBLIC_MINIO_BUCKET ?? 'joymee-media';
    return [
      { source: '/_media/:path*', destination: `${minio}/${bucket}/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      // MinIO (S3-compatible) for user uploads
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'http', hostname: '127.0.0.1', port: '9000' },
      // API static (if ever served via next/image)
      { protocol: 'http', hostname: 'localhost', port: '4001' },
      // Cloudflare tunnel / R2 variants
      { protocol: 'https', hostname: '**.trycloudflare.com' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.r2.dev' },
    ],
  },
};

export default nextConfig;
