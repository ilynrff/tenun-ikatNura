import { NextResponse } from 'next/server';
import { verifyServerAdmin } from '@/lib/auth';

export async function GET() {
  const { authorized, user } = await verifyServerAdmin();
  if (!authorized) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}
