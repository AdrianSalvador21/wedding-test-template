import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Configuración directa en el middleware
const intlMiddleware = createMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed' // / = español, /en = inglés
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Excluir la landing page (/) del middleware de internacionalización
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Excluir assets estáticos - IMPORTANTE para que las imágenes funcionen
  if (pathname.startsWith('/assets/') || 
      pathname.startsWith('/.well-known/') ||
      pathname === '/favicon.ico' ||
      pathname.startsWith('/robots.txt') ||
      pathname.startsWith('/sitemap.xml')) {
    return NextResponse.next();
  }

  // Bloquear requests innecesarios que pueden causar problemas de rendimiento
  if (pathname.includes('/wp-admin') || 
      pathname.includes('/xmlrpc.php') || 
      pathname.includes('/.env')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Aplicar middleware de internacionalización solo a rutas que no sean la landing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets like images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
