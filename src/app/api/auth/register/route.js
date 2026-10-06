import { NextResponse } from 'next/server';
import { hashPassword, createCustomerToken, CUSTOMER_COOKIE_NAME } from '@/lib/customerAuth';

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

    const { name, email, phone, password } = body;

    // 1. Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Alamat email wajib diisi.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi minimal harus 6 karakter.' },
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

    // 2. Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email sudah terdaftar. Silakan login.' },
        { status: 400 }
      );
    }

    // 3. Hash password and save user
    const passwordHash = hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: 'USER',
      },
    });

    // 4. Create customer session token
    const token = createCustomerToken(newUser);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
        },
      },
      { status: 201 }
    );

    // 5. Set HttpOnly cookie
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
    console.error('[POST /api/auth/register] Error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat pendaftaran.' },
      { status: 500 }
    );
  }
}
