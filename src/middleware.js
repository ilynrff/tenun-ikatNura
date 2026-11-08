import { NextResponse } from 'next/server';
import { verifyAdminTokenEdge, ADMIN_COOKIE_NAME } from '@/lib/edgeAuth';

/**
 * Middleware for route protection
 * Enforces cryptographic HMAC-SHA256 signature verification via Web Crypto API.
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect Admin Pages (/admin/...)
  if (pathname.startsWith('/admin')) {
    // Whitelist admin login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Cryptographic signature and claim verification
    const admin = await verifyAdminTokenEdge(sessionCookie.value);
    if (!admin) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Protect Admin API routes (/api/admin/...)
  if (pathname.startsWith('/api/admin')) {
    // Whitelist login, logout, and session check routes
    if (
      pathname === '/api/admin/auth/login' ||
      pathname === '/api/admin/auth/logout' ||
      pathname === '/api/admin/auth/me'
    ) {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Diperlukan autentikasi ADMIN.' },
        { status: 401 }
      );
    }

    // Cryptographic signature and claim verification
    const admin = await verifyAdminTokenEdge(sessionCookie.value);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Token autentikasi ADMIN tidak valid atau telah berakhir.' },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
