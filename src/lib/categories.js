import categoriesData from '@/data/categories.json';
import prisma from './prisma';

const ALL_TAB = {
  id: 'all',
  name: 'Semua',
  slug: 'all',
  description: 'Seluruh koleksi karya busana tenun ikat otentik Tenun Ikat Nura.',
  isActive: true,
};

function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Category Data Service
 * Reads and manages category data for Tenun Ikat Nura (Prisma DB first with fallback)
 */

export async function getAllCategories({ includeInactive = false, includeAllTab = true } = {}) {
  if (isDbConfigured()) {
    try {
      const where = includeInactive ? {} : { isActive: true };
      const rows = await prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      if (rows && rows.length > 0) {
        let list = rows.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          isActive: cat.isActive,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        }));

        if (includeAllTab) {
          list = [ALL_TAB, ...list];
        }

        return list;
      }
    } catch (err) {
      console.warn('[Categories Service] Prisma query fallback to categories.json:', err.message);
    }
  }

  // Fallback to static JSON
  let list = [...categoriesData];

  if (!includeInactive) {
    list = list.filter((cat) => cat.isActive !== false);
  }

  if (!includeAllTab) {
    list = list.filter((cat) => cat.slug !== 'all');
  }

  return list;
}

export async function getCategoryBySlug(slug) {
  if (!slug) return null;

  if (slug === 'all') {
    return ALL_TAB;
  }

  if (isDbConfigured()) {
    try {
      const row = await prisma.category.findUnique({
        where: { slug },
      });
      if (row) {
        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description || '',
          isActive: row.isActive,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }
    } catch (err) {
      console.warn('[Categories Service] getCategoryBySlug DB error, falling back:', err.message);
    }
  }

  return categoriesData.find((cat) => cat.slug === slug || cat.id === slug) || null;
}

export async function getCategoryNameBySlug(slug) {
  const cat = await getCategoryBySlug(slug);
  return cat ? cat.name : slug;
}
