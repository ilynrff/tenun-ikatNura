import { NextResponse } from 'next/server';
import { validateAdminCredentials, createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const adminUser = validateAdminCredentials(email, password);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Email atau kata sandi admin tidak valid.' },
        { status: 401 }
      );
    }

    const token = createAdminToken(adminUser);

    const response = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server saat memproses login admin.' },
      { status: 500 }
    );
  }
}
