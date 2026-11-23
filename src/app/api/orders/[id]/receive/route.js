import { NextResponse } from 'next/server';
import { confirmCustomerOrderReceipt } from '@/lib/orders';
import { verifyServerCustomer } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/orders/[id]/receive
 * Mengonfirmasi penerimaan barang oleh customer untuk pesanan berstatus SHIPPED.
 * Mengubah orderStatus menjadi COMPLETED, mencatat receivedAt dan completionSource = CUSTOMER_CONFIRMED.
 *
 * Keamanan:
 * - Autentikasi sesi via verifyServerCustomer() -> 401 jika tidak sah.
 * - Resolusi kepemilikan userId dilakukan secara ketat di query database -> 404 jika bukan milik customer.
 * - Validasi status: hanya SHIPPED yang dapat dikonfirmasi -> 409 jika status lain.
 * - Atomic conditional update mencegah race condition antar request atau dengan admin.
 * - Request body diabaikan: nilai userId, orderStatus, receivedAt, completionSource seluruhnya dikontrol server.
 */
export async function POST(request, { params }) {
  try {
    // 1. Verifikasi Sesi Customer
    const { authorized, user } = await verifyServerCustomer();
    if (!authorized || !user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak: Silakan masuk terlebih dahulu untuk mengonfirmasi penerimaan pesanan.',
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

    // 3. Konfirmasi Penerimaan Pesanan (Atomic + Strict Ownership)
    const order = await confirmCustomerOrderReceipt(user.id, orderId);

    return NextResponse.json({
      success: true,
      message: 'Penerimaan pesanan berhasil dikonfirmasi.',
      order,
    });
  } catch (err) {
    console.error('[POST /api/orders/[id]/receive] Error:', err.message);
    const status = err.statusCode || 500;
    const clientMessage =
      status === 500
        ? 'Terjadi kesalahan pada server saat memproses konfirmasi penerimaan pesanan.'
        : err.message || 'Gagal mengonfirmasi penerimaan pesanan.';

    return NextResponse.json(
      {
        success: false,
        error: clientMessage,
      },
      { status }
    );
  }
}

