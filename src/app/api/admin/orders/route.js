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
    // 1. Log detail lengkap ke Vercel Runtime Logs untuk observabilitas tanpa mengekspos credential ke browser
    console.error('[Admin Orders API GET] Error Details:', {
      name: error?.name,
      code: error?.code,
      meta: error?.meta,
      message: error?.message,
      stack: error?.stack,
    });

    // 2. Identifikasi kategori error database
    const isAuthError =
      error?.code === 'P1000' ||
      /authentication failed|password authentication|credentials.*not valid/i.test(error?.message || '');

    const isConnectionOrTimeout =
      error?.name === 'PrismaClientInitializationError' ||
      error?.name === 'PrismaClientRustPanicError' ||
      ['P1001', 'P1002', 'P1003', 'P1008', 'P1011', 'P1017', 'P2024'].includes(error?.code) ||
      /Can't reach database|timed out|timeout|Connection terminated|Server has closed the connection|connection closed|Connection refused|ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN/i.test(
        error?.message || ''
      );

    const isSchemaError =
      ['P2021', 'P2022', 'P2010'].includes(error?.code) ||
      /does not exist|column .* does not exist|relation .* does not exist|prepared statement .* does not exist/i.test(
        error?.message || ''
      );

    let status = 500;
    let clientMessage = 'Terjadi kesalahan pada server saat memuat daftar pesanan.';

    if (isAuthError) {
      status = 503;
      clientMessage =
        'Kredensial database pada server (DATABASE_URL) tidak valid. Silakan periksa konfigurasi environment variable di Vercel.';
    } else if (isConnectionOrTimeout) {
      status = 503;
      clientMessage =
        'Koneksi ke database sedang mengalami gangguan atau batas waktu (timeout). Silakan coba lagi beberapa saat lagi.';
    } else if (isSchemaError) {
      status = 503;
      clientMessage =
        'Struktur database belum sesuai atau parameter koneksi pooler perlu diperbarui (pastikan pgbouncer=true aktif di Vercel).';
    } else if (error?.statusCode === 400 || error?.statusCode === 503) {
      status = error.statusCode;
      clientMessage = error.message || 'Permintaan tidak valid.';
    } else if (error?.statusCode) {
      status = error.statusCode;
    }

    return NextResponse.json(
      {
        success: false,
        error: clientMessage,
      },
      { status }
    );
  }
}

