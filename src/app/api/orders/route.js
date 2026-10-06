// ============================================================
// POST /api/orders — TENUN IKAT NURA
// Phase 3B-2: Order API Route
// ============================================================
//
// Accepts JSON body:
// {
//   customerName, customerWhatsapp, customerEmail?,
//   shippingAddress, shippingCity?, shippingPostalCode?,
//   note?,
//   items: [{ productId, quantity, size?, variant? }]
// }
//
// Returns 201 on success with order summary.
// Returns 4xx/5xx on validation or server errors.
//
// Security:
//   - Price, stock, sku, productName are NEVER taken from client.
//   - All financial data is sourced from the database.
//   - Guest checkout: no authentication required.
// ============================================================

import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/orders';
import { verifyServerCustomer } from '@/lib/customerAuth';

/**
 * POST /api/orders
 * Create a new order for authenticated customer from cart data.
 */
export async function POST(request) {
  try {
    // ── 0. Enforce Server-Side Customer Authentication ──
    const { authorized, user } = await verifyServerCustomer();
    if (!authorized || !user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak: Silakan masuk atau buat akun terlebih dahulu untuk membuat pesanan.',
        },
        { status: 401 }
      );
    }

    // ── 1. Parse request body ─────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Request body tidak valid (bukan JSON).' },
        { status: 400 }
      );
    }

    // ── 2. Delegate to order service ──────────────────────
    const order = await createOrder({
      userId: user.id, // Authenticated userId strictly sourced from verified server session
      customerName: body.customerName,
      customerWhatsapp: body.customerWhatsapp,
      customerEmail: body.customerEmail || user.email,
      shippingAddress: body.shippingAddress,
      shippingCity: body.shippingCity,
      shippingPostalCode: body.shippingPostalCode,
      note: body.note,
      items: body.items,
    });

    // ── 3. Return success ─────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/orders] Error:', err.message);

    const status = err.statusCode || 500;
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Terjadi kesalahan pada server. Silakan coba lagi.',
      },
      { status }
    );
  }
}
