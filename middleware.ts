import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isNonLocalizedPath } from './lib/site';

// Configuración directa en el middleware
const intlMiddleware = createMiddleware({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed' // / = español, /en = inglés
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Landing, páginas de marketing (/paquetes, /disenos/*, etc.) y archivos
  // generados (íconos, imagen para compartir) no llevan prefijo de idioma.
  if (isNonLocalizedPath(pathname)) {
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
     * - assets (public assets like images)
     * ni cualquier ruta con extensión de archivo (favicon.ico, robots.txt,
     * sitemap.xml, site.webmanifest, .well-known/…): esos archivos no pasan
     * por la reescritura de idioma.
     */
    '/((?!api|_next/static|_next/image|assets|.*\\..*).*)',
  ],
};
