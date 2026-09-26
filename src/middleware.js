import { NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'nura_admin_session';

/**
 * Middleware for route protection
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect Admin Pages (/admin/...)
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      // Redirect unauthenticated user to admin login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Quick structural check of token
    const parts = sessionCookie.value.split('.');
    if (parts.length !== 2) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf-8'));
      if ((payload.exp && payload.exp < Date.now()) || payload.role !== 'ADMIN') {
        const loginUrl = new URL('/admin/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch (e) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Protect Admin API routes (/api/admin/...)
  if (pathname.startsWith('/api/admin')) {
    // Whitelist login route
    if (pathname === '/api/admin/auth/login') {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Diperlukan autentikasi ADMIN.' },
        { status: 401 }
      );
    }

    const parts = sessionCookie.value.split('.');
    if (parts.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Token autentikasi tidak valid.' },
        { status: 401 }
      );
    }

    try {
      const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf-8'));
      if (payload.exp && payload.exp < Date.now() || payload.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Akses ditolak: Sesi ADMIN telah berakhir atau tidak valid.' },
          { status: 403 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Format token rusak.' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
