import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/products';

/**
 * GET /api/admin/products/[id]
 * Fetch single product details by ID or Slug.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { error: `Produk dengan ID "${id}" tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('[Admin Product Detail API GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil detail produk.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/products/[id]
 * Updates an existing product.
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateProduct(id, body);

    return NextResponse.json({
      message: 'Produk berhasil diperbarui.',
      product: updated,
    });
  } catch (error) {
    console.error('[Admin Product Detail API PUT] Error:', error);

    const status = error.statusCode || 500;
    return NextResponse.json(
      {
        error: error.message || 'Gagal memperbarui produk.',
        validationErrors: error.validationErrors || null,
      },
      { status }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Deletes a product.
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const result = await deleteProduct(id);

    return NextResponse.json({
      message: 'Produk berhasil dihapus.',
      result,
    });
  } catch (error) {
    console.error('[Admin Product Detail API DELETE] Error:', error);

    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus produk.' },
      { status }
    );
  }
}
