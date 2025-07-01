import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Manejar requests de Chrome DevTools y herramientas de desarrollo
  if (pathname.startsWith('/.well-known/')) {
    return NextResponse.next();
  }

  // Manejar otros requests problemáticos comunes
  if (pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Bloquear requests innecesarios que pueden causar problemas de rendimiento
  if (pathname.includes('/wp-admin') || 
      pathname.includes('/xmlrpc.php') || 
      pathname.includes('/.env')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 