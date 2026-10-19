import { NextResponse } from 'next/server';
import { getCategoryByIdOrSlug, updateCategory, deleteCategory } from '@/lib/categories';
import { verifyServerAdmin } from '@/lib/auth';

/**
 * GET /api/admin/categories/[id]
 * Fetch single category details by ID or Slug
 * Protected by verifyServerAdmin.
 */
export async function GET(request, { params }) {
  try {
    const { authorized } = await verifyServerAdmin();
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Diperlukan autentikasi ADMIN.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const category = await getCategoryByIdOrSlug(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: `Kategori dengan ID/slug "${id}" tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('[Admin Category Detail API GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil detail kategori.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/categories/[id]
 * Updates an existing category (name, slug, description, isActive)
 * Protected by verifyServerAdmin.
 */
export async function PUT(request, { params }) {
  try {
    const { authorized } = await verifyServerAdmin();
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Diperlukan autentikasi ADMIN.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const updated = await updateCategory(id, body);

    return NextResponse.json({
      success: true,
      message: 'Kategori berhasil diperbarui.',
      category: updated,
    });
  } catch (error) {
    console.error('[Admin Category Detail API PUT] Error:', error);
    const status = error.statusCode || 500;
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memperbarui kategori.',
      },
      { status }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Deletes a category safely
 * Strictly rejected if products still use this category.
 * Protected by verifyServerAdmin.
 */
export async function DELETE(request, { params }) {
  try {
    const { authorized } = await verifyServerAdmin();
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Diperlukan autentikasi ADMIN.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const result = await deleteCategory(id);

    return NextResponse.json({
      success: true,
      message: `Kategori "${result.name || id}" berhasil dihapus.`,
      result,
    });
  } catch (error) {
    console.error('[Admin Category Detail API DELETE] Error:', error);
    const status = error.statusCode || 500;
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menghapus kategori.',
        code: error.code || null,
        productCount: error.productCount || 0,
      },
      { status }
    );
  }
}
