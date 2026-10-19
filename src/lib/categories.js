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
 * Generate URL-friendly slug from string
 */
export function generateCategorySlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Category Data Service
 * Reads and manages category data for Tenun Ikat Nura (Prisma DB first with fallback)
 */

export async function getAllCategories({
  includeInactive = false,
  includeAllTab = true,
  withProductCount = true,
} = {}) {
  if (isDbConfigured()) {
    try {
      const where = includeInactive ? {} : { isActive: true };
      const include = withProductCount
        ? { _count: { select: { products: true } } }
        : undefined;

      const rows = await prisma.category.findMany({
        where,
        include,
        orderBy: { name: 'asc' },
      });

      if (rows && rows.length > 0) {
        let list = rows.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description || '',
          isActive: cat.isActive,
          productCount: cat._count ? cat._count.products : 0,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        }));

        if (includeAllTab) {
          list = [{ ...ALL_TAB, productCount: 0 }, ...list];
        }

        return list;
      }
    } catch (err) {
      console.warn('[Categories Service] Prisma query fallback to categories.json:', err.message);
    }
  }

  // Fallback to static JSON
  let list = categoriesData.map((cat) => ({
    ...cat,
    productCount: 0,
  }));

  if (!includeInactive) {
    list = list.filter((cat) => cat.isActive !== false);
  }

  if (!includeAllTab) {
    list = list.filter((cat) => cat.slug !== 'all');
  }

  return list;
}

export async function getCategoryByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;

  if (idOrSlug === 'all') {
    return ALL_TAB;
  }

  if (isDbConfigured()) {
    try {
      const row = await prisma.category.findFirst({
        where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
        include: { _count: { select: { products: true } } },
      });
      if (row) {
        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description || '',
          isActive: row.isActive,
          productCount: row._count ? row._count.products : 0,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }
    } catch (err) {
      console.warn('[Categories Service] getCategoryByIdOrSlug DB error, falling back:', err.message);
    }
  }

  return categoriesData.find((cat) => cat.slug === idOrSlug || cat.id === idOrSlug) || null;
}

export async function getCategoryBySlug(slug) {
  return getCategoryByIdOrSlug(slug);
}

export async function getCategoryNameBySlug(slug) {
  const cat = await getCategoryBySlug(slug);
  return cat ? cat.name : slug;
}

/**
 * Create a new category in database
 */
export async function createCategory({ name, slug, description, isActive = true }) {
  if (!name || !name.trim()) {
    const err = new Error('Nama kategori wajib diisi.');
    err.statusCode = 400;
    throw err;
  }

  const cleanName = name.trim();
  const cleanSlug = slug && slug.trim() ? generateCategorySlug(slug) : generateCategorySlug(cleanName);

  if (!cleanSlug) {
    const err = new Error('Slug kategori tidak valid.');
    err.statusCode = 400;
    throw err;
  }

  if (cleanSlug === 'all') {
    const err = new Error('Slug "all" dicadangkan untuk sistem katalog.');
    err.statusCode = 400;
    throw err;
  }

  if (isDbConfigured()) {
    const existing = await prisma.category.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      const err = new Error(`Slug kategori "${cleanSlug}" sudah digunakan.`);
      err.statusCode = 409;
      throw err;
    }

    const created = await prisma.category.create({
      data: {
        name: cleanName,
        slug: cleanSlug,
        description: description ? description.trim() : null,
        isActive: isActive !== false,
      },
    });

    return {
      id: created.id,
      name: created.name,
      slug: created.slug,
      description: created.description || '',
      isActive: created.isActive,
      productCount: 0,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  return {
    id: `local-${Date.now()}`,
    name: cleanName,
    slug: cleanSlug,
    description: description ? description.trim() : '',
    isActive: isActive !== false,
    productCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Update an existing category
 * Handles safe slug renaming if products are already linked
 */
export async function updateCategory(id, { name, slug, description, isActive }) {
  if (!id) {
    const err = new Error('ID kategori diperlukan.');
    err.statusCode = 400;
    throw err;
  }

  if (name !== undefined && !name.trim()) {
    const err = new Error('Nama kategori tidak boleh kosong.');
    err.statusCode = 400;
    throw err;
  }

  if (isDbConfigured()) {
    const target = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { _count: { select: { products: true } } },
    });

    if (!target) {
      const err = new Error(`Kategori dengan ID/slug "${id}" tidak ditemukan.`);
      err.statusCode = 404;
      throw err;
    }

    const newName = name !== undefined ? name.trim() : target.name;
    const newDesc = description !== undefined ? (description?.trim() || null) : target.description;
    const newActive = isActive !== undefined ? Boolean(isActive) : target.isActive;
    const newSlug = slug !== undefined && slug.trim() ? generateCategorySlug(slug) : target.slug;

    if (newSlug === 'all') {
      const err = new Error('Slug "all" dicadangkan untuk sistem.');
      err.statusCode = 400;
      throw err;
    }

    // Slug is being changed
    if (newSlug !== target.slug) {
      const collision = await prisma.category.findUnique({ where: { slug: newSlug } });
      if (collision && collision.id !== target.id) {
        const err = new Error(`Slug "${newSlug}" sudah digunakan oleh kategori lain.`);
        err.statusCode = 409;
        throw err;
      }

      const productsCount = target._count?.products || 0;

      // If products exist, migrate relations safely using an atomic transaction
      if (productsCount > 0) {
        return await prisma.$transaction(async (tx) => {
          // 1. Create new category with newSlug
          const newCat = await tx.category.create({
            data: {
              name: newName,
              slug: newSlug,
              description: newDesc,
              isActive: newActive,
            },
          });

          // 2. Point all products to newSlug
          await tx.product.updateMany({
            where: { categorySlug: target.slug },
            data: { categorySlug: newSlug },
          });

          // 3. Delete old category
          await tx.category.delete({
            where: { id: target.id },
          });

          return {
            id: newCat.id,
            name: newCat.name,
            slug: newCat.slug,
            description: newCat.description || '',
            isActive: newCat.isActive,
            productCount: productsCount,
            createdAt: newCat.createdAt,
            updatedAt: newCat.updatedAt,
          };
        });
      } else {
        // No products attached, directly update Category.slug
        const updated = await prisma.category.update({
          where: { id: target.id },
          data: {
            name: newName,
            slug: newSlug,
            description: newDesc,
            isActive: newActive,
          },
          include: { _count: { select: { products: true } } },
        });

        return {
          id: updated.id,
          name: updated.name,
          slug: updated.slug,
          description: updated.description || '',
          isActive: updated.isActive,
          productCount: 0,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        };
      }
    }

    // Slug is unchanged
    const updated = await prisma.category.update({
      where: { id: target.id },
      data: {
        name: newName,
        description: newDesc,
        isActive: newActive,
      },
      include: { _count: { select: { products: true } } },
    });

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description || '',
      isActive: updated.isActive,
      productCount: updated._count?.products || 0,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  return {
    id,
    name: name || id,
    slug: slug || id,
    description: description || '',
    isActive: isActive !== false,
    productCount: 0,
    updatedAt: new Date(),
  };
}

/**
 * Delete a category safely
 * Strictly rejects deletion if category is currently used by any products
 */
export async function deleteCategory(id) {
  if (!id) {
    const err = new Error('ID kategori diperlukan.');
    err.statusCode = 400;
    throw err;
  }

  if (isDbConfigured()) {
    const target = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { _count: { select: { products: true } } },
    });

    if (!target) {
      const err = new Error(`Kategori dengan ID/slug "${id}" tidak ditemukan.`);
      err.statusCode = 404;
      throw err;
    }

    const productsCount =
      target._count?.products ??
      (await prisma.product.count({ where: { categorySlug: target.slug } }));

    if (productsCount > 0) {
      const err = new Error(
        `Kategori "${target.name}" tidak dapat dihapus karena masih digunakan oleh ${productsCount} produk. Pindahkan produk ke kategori lain terlebih dahulu.`
      );
      err.statusCode = 400;
      err.code = 'CATEGORY_IN_USE';
      err.productCount = productsCount;
      throw err;
    }

    await prisma.category.delete({
      where: { id: target.id },
    });

    return {
      success: true,
      deletedId: target.id,
      slug: target.slug,
      name: target.name,
    };
  }

  return { success: true, deletedId: id };
}
