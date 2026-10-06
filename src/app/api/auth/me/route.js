import { NextResponse } from 'next/server';
import { verifyServerCustomer } from '@/lib/customerAuth';

export async function GET() {
  try {
    const { authorized, user } = await verifyServerCustomer();

    if (!authorized || !user) {
      return NextResponse.json(
        { success: false, user: null, message: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('[GET /api/auth/me] Error:', error.message);
    return NextResponse.json(
      { success: false, user: null, message: 'Kesalahan server' },
      { status: 500 }
    );
  }
}
