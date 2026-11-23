import { NextResponse } from 'next/server';
import { getCustomerOrderDetail } from '@/lib/orders';
import { verifyServerCustomer } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/[id]
 * Mengambil detail pesanan tertentu milik customer yang sedang login.
 * Memverifikasi kepemilikan userId langsung pada query database.
 */
export async function GET(request, { params }) {
  try {
    // 1. Verifikasi Sesi Customer
    const { authorized, user } = await verifyServerCustomer();
    if (!authorized || !user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak: Silakan masuk terlebih dahulu untuk melihat detail pesanan.',
        },
        { status: 401 }
      );
    }

    // 2. Ekstrak Parameter ID/OrderNumber (Next.js 15 compatible)
    const resolvedParams = params ? await params : {};
    const orderId = resolvedParams.id;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'ID atau nomor pesanan tidak valid.',
        },
        { status: 400 }
      );
    }

    // 3. Ambil data dengan verifikasi kepemilikan userId
    const order = await getCustomerOrderDetail(user.id, orderId);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err) {
    console.error('[GET /api/orders/[id]] Error:', err.message);
    const status = err.statusCode || 500;
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Terjadi kesalahan pada server saat memuat detail pesanan.',
      },
      { status }
    );
  }
}

