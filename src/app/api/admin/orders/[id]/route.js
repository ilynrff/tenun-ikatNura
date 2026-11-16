import { NextResponse } from 'next/server';
import { verifyServerAdmin } from '@/lib/auth';
import { getAdminOrderById, updateAdminOrder } from '@/lib/adminOrders';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/orders/[id]
 * Mengambil detail lengkap satu pesanan berdasarkan ID atau OrderNumber.
 * Menyertakan rincian produk, informasi pengiriman, status, dan catatan.
 * Terproteksi ganda oleh middleware dan verifyServerAdmin().
 */
export async function GET(request, { params }) {
  try {
    // 1. Verifikasi Otorisasi Admin di Sisi Server
    const { authorized } = await verifyServerAdmin();
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Diperlukan sesi autentikasi ADMIN yang valid.' },
        { status: 401 }
      );
    }

    // 2. Ekstrak parameter ID (Next.js 15: params harus di-await)
    const { id } = await params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { success: false, error: 'Parameter ID pesanan tidak valid.' },
        { status: 400 }
      );
    }

    // 3. Ambil data dari Service Layer
    const order = await getAdminOrderById(id.trim());

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Pesanan dengan identifikasi "${id}" tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('[Admin Order Detail API GET] Error:', error.message || error);
    const status = error.statusCode || 500;
    const clientMessage =
      status === 503
        ? (error.message || 'Layanan database tidak tersedia saat ini.')
        : 'Terjadi kesalahan pada server saat memuat rincian pesanan.';

    return NextResponse.json(
      {
        success: false,
        error: clientMessage,
      },
      { status }
    );
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Memperbarui status pesanan, pembayaran, data pengiriman, atau catatan admin.
 * Memvalidasi otorisasi server admin dan aturan transisi status.
 */
export async function PATCH(request, { params }) {
  try {
    // 1. Verifikasi Otorisasi Admin di Sisi Server
    const { authorized } = await verifyServerAdmin();
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Diperlukan sesi autentikasi ADMIN yang valid.' },
        { status: 401 }
      );
    }

    // 2. Ekstrak parameter ID (Next.js 15: params harus di-await)
    const { id } = await params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { success: false, error: 'Parameter ID pesanan tidak valid.' },
        { status: 400 }
      );
    }

    // 3. Parse JSON Body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Request body tidak valid (harus berupa JSON).' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: 'Payload harus berupa objek JSON.' },
        { status: 400 }
      );
    }

    // 4. Delegasi ke Service Layer
    const updatedOrder = await updateAdminOrder(id.trim(), body);

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil diperbarui.',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('[Admin Order Detail API PATCH] Error:', error.message || error);
    const status = error.statusCode || 500;

    // Error operasional yang aman ditampilkan ke admin: 400, 401, 404, 409
    const clientMessage =
      status === 400 || status === 401 || status === 404 || status === 409
        ? error.message
        : status === 503
        ? (error.message || 'Layanan database tidak tersedia saat ini.')
        : 'Terjadi kesalahan pada server saat memperbarui pesanan.';

    return NextResponse.json(
      {
        success: false,
        error: clientMessage,
      },
      { status }
    );
  }
}


