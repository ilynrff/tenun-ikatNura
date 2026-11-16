import { NextResponse } from 'next/server';
import { verifyServerAdmin } from '@/lib/auth';
import { getAdminOrders } from '@/lib/adminOrders';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/orders
 * Mengambil daftar pesanan pelanggan untuk admin.
 * Mendukung pagination, filter status, dan pencarian.
 * Terproteksi ganda oleh middleware dan verifyServerAdmin().
 */
export async function GET(request) {
  try {
    // 1. Verifikasi Otorisasi Admin di Sisi Server
    const { authorized } = await verifyServerAdmin();
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Diperlukan sesi autentikasi ADMIN yang valid.' },
        { status: 401 }
      );
    }

    // 2. Ekstrak & Sanitasi Query Parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '15';
    const search = searchParams.get('search') || '';
    const orderStatus = searchParams.get('orderStatus') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // 3. Ambil data dari Service Layer
    const result = await getAdminOrders({
      page,
      limit,
      search,
      orderStatus,
      paymentStatus,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      orders: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('[Admin Orders API GET] Error:', error.message || error);
    const status = error.statusCode || 500;
    const clientMessage =
      status === 400 || status === 503
        ? (error.message || 'Permintaan tidak valid.')
        : 'Terjadi kesalahan pada server saat memuat daftar pesanan.';

    return NextResponse.json(
      {
        success: false,
        error: clientMessage,
      },
      { status }
    );
  }
}

