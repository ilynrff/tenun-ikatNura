import { NextResponse } from 'next/server';
import { getAllCategories, createCategory } from '@/lib/categories';
import { verifyServerAdmin } from '@/lib/auth';

/**
 * GET /api/admin/categories
 * Returns all categories (including inactive) with product count for admin management.
 * Route is protected by middleware and verifyServerAdmin.
 */
export async function GET() {
  try {
    const { authorized } = await verifyServerAdmin();
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Diperlukan autentikasi ADMIN.' },
        { status: 401 }
      );
    }

    const categories = await getAllCategories({
      includeInactive: true,
      includeAllTab: false,
      withProductCount: true,
    });
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('[Admin Categories API GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil data kategori.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Creates a new category.
 * Protected by verifyServerAdmin.
 */
export async function POST(request) {
  try {
    const { authorized } = await verifyServerAdmin();
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Diperlukan autentikasi ADMIN.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const created = await createCategory(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Kategori berhasil dibuat.',
        category: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin Categories API POST] Error:', error);
    const status = error.statusCode || 500;
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal membuat kategori baru.',
      },
      { status }
    );
  }
}
