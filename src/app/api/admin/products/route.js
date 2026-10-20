import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/products';
import { verifyServerAdmin } from '@/lib/auth';

/**
 * GET /api/admin/products
 * Returns all products for admin management.
 * Protected by verifyServerAdmin and middleware.
 */
export async function GET() {
  try {
    const { authorized } = await verifyServerAdmin();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Akses ditolak: Diperlukan autentikasi ADMIN.' },
        { status: 401 }
      );
    }

    const products = await getProducts({
      includeInactive: true,
      includeHidden: true,
    });

    return NextResponse.json({ products, total: products.length });
  } catch (error) {
    console.error('[Admin Products API GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil data produk.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Creates a new product with validation.
 * Protected by verifyServerAdmin and middleware.
 */
export async function POST(request) {
  try {
    const { authorized } = await verifyServerAdmin();
    if (!authorized) {
      return NextResponse.json(
        { error: 'Akses ditolak: Diperlukan autentikasi ADMIN.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const created = await createProduct(body);

    return NextResponse.json(
      {
        message: 'Produk berhasil dibuat.',
        product: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin Products API POST] Error:', error);

    const status = error.statusCode || 500;
    return NextResponse.json(
      {
        error: error.message || 'Gagal membuat produk baru.',
        validationErrors: error.validationErrors || null,
      },
      { status }
    );
  }
}
