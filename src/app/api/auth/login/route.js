import { NextResponse } from 'next/server';
import { verifyPassword, createCustomerToken, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';
import { validateAdminCredentials, createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

function getPrisma() {
  if (global.prisma) return global.prisma;
  if (!process.env.DATABASE_URL) return null;
  try {
    const { PrismaClient } = require('@prisma/client');
    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    return global.prisma;
  } catch (err) {
    return null;
  }
}

/**
 * POST /api/auth/login
 * Unified Server-Side Credential Dispatcher.
 *
 * Securely detects whether candidate is Admin or Customer based strictly on server-side
 * environment configuration (ADMIN_EMAIL). Issues only the appropriate HttpOnly session cookie
 * (nura_admin_session vs nura_customer_session).
 *
 * Returns identical generic error messages on any failure to prevent account enumeration.
 */
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Request body tidak valid.' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();

    // ── 1. Admin Verification (Environment-Based) ─────────────
    if (configuredAdminEmail && cleanEmail === configuredAdminEmail) {
      const adminUser = validateAdminCredentials(cleanEmail, password);

      if (!adminUser) {
        // Uniform error message to prevent enumeration
        return NextResponse.json(
          { success: false, message: 'Email atau kata sandi tidak sesuai.' },
          { status: 401 }
        );
      }

      const adminToken = createAdminToken(adminUser);

      const response = NextResponse.json({
        success: true,
        role: 'ADMIN',
        redirectUrl: '/admin',
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: 'ADMIN',
        },
      });

      // Issue Admin HttpOnly session cookie
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: adminToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      // Clear any existing customer session cookie
      response.cookies.set({
        name: CUSTOMER_COOKIE_NAME,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    // ── 2. Customer Verification (Database-Based) ─────────────
    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { success: false, message: 'Database tidak tersedia saat ini.' },
        { status: 503 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    const customerToken = createCustomerToken(user);

    const response = NextResponse.json({
      success: true,
      role: 'USER',
      redirectUrl: '/',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'USER',
      },
    });

    // Issue Customer HttpOnly session cookie
    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: customerToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Clear any existing admin session cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('[POST /api/auth/login] Error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat login.' },
      { status: 500 }
    );
  }
}
