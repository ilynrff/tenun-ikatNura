import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/categories';

/**
 * GET /api/admin/categories
 * Returns all categories (including inactive) for admin management.
 * Route is protected by middleware (STEP 2 auth guard).
 * READ-ONLY.
 */
export async function GET() {
  try {
    const categories = getAllCategories({ includeInactive: true, includeAllTab: false });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('[Admin Categories API] Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori.' },
      { status: 500 }
    );
  }
}
