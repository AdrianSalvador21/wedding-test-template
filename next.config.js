const withNextIntl = require('next-intl/plugin')('./i18n.ts');

// Rutas que nunca deben indexarse (invitaciones, demos, paneles, login y API).
// El encabezado refuerza la meta `noindex` de app/[locale]/layout.tsx; sirve
// también donde no hay HTML (API) y para las rutas sin prefijo de idioma.
const NOINDEX_SOURCES = [
  '/:locale(es|en)/wedding/:path*',
  '/wedding/:path*',
  '/:locale(es|en)/admin/:path*',
  '/admin/:path*',
  '/:locale(es|en)/login',
  '/login',
  '/:locale(es|en)/invitation',
  '/invitation',
  '/:locale(es|en)/demo',
  '/demo',
  '/:locale(es|en)/typography-test',
  '/typography-test',
  '/api/:path*',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Permitir imágenes locales y optimización
    unoptimized: false, // Mantener optimización habilitada
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
    // firebase-admin depende de módulos nativos y de gRPC: debe cargarse desde node_modules en el servidor.
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  compiler: {
    // Se conservan los console.error para poder diagnosticar fallas de servidor en producción.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  // PostHog exige que las rutas del proxy no pierdan la barra final (spec 11).
  skipTrailingSlashRedirect: true,
  // Proxy de analítica en el propio dominio: los bloqueadores de anuncios filtran los
  // dominios de PostHog pero no `/ingest`. Región US (spec 11).
  async rewrites() {
    return [
      { source: '/ingest/static/:path*', destination: 'https://us-assets.i.posthog.com/static/:path*' },
      { source: '/ingest/array/:path*', destination: 'https://us-assets.i.posthog.com/array/:path*' },
      { source: '/ingest/:path*', destination: 'https://us.i.posthog.com/:path*' },
    ];
  },
  async redirects() {
    return [
      // /favicon.ico se sirve como el ícono generado en app/icon.tsx.
      { source: '/favicon.ico', destination: '/icon', permanent: true },
      // /disenos no es una página: la galería de diseños es una sección de la landing.
      { source: '/disenos', destination: '/#disenos', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      ...NOINDEX_SOURCES.map((source) => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      })),
      {
        source: '/.well-known/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
