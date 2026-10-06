import { NextResponse } from 'next/server';
import { verifyPassword, createCustomerToken, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';

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

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { success: false, message: 'Database tidak tersedia saat ini.' },
        { status: 503 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Find user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    // 2. Verify password against passwordHash
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    // 3. Create customer session token
    const token = createCustomerToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

    // 4. Set HttpOnly cookie
    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
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
