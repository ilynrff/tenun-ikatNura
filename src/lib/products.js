import collectionsData from '@/data/collections.json';
import { formatRupiah, parsePriceToNumber } from './format';
import { getCategoryNameBySlug } from './categories';
import prisma from './prisma';

/**
 * Normalizes a raw product object (from Prisma or JSON) to ensure all required fields exist
 * @param {Object} item 
 * @returns {Object}
 */
export function normalizeProduct(item) {
  if (!item) return null;

  const numPrice = typeof item.price === 'number' ? item.price : parsePriceToNumber(item.price);
  const stock = typeof item.stock === 'number' ? Math.max(0, Math.floor(item.stock)) : 5;
  const isOutOfStock = stock === 0;

  let images = [];
  if (Array.isArray(item.images) && item.images.length > 0) {
    images = item.images;
  } else if (item.image) {
    images = [item.image];
  } else {
    images = ['/images/hero/hero-main.jpg'];
  }

  const primaryImage = item.primaryImage || images[0] || '/images/hero/hero-main.jpg';
  const categorySlug = item.categorySlug || item.category || 'outer';

  return {
    ...item,
    id: String(item.id || item.slug || item.sku),
    sku: item.sku || 'NURA-ITEM',
    slug: item.slug || item.id,
    name: item.name || item.title || 'Karya Tenun Nura',
    category: categorySlug,
    categorySlug: categorySlug,
    categoryLabel: item.category?.name || item.categoryLabel || 'Koleksi Tenun',
    price: numPrice,
    formattedPrice: formatRupiah(numPrice),
    stock: stock,
    isOutOfStock: isOutOfStock,
    images: images,
    primaryImage: primaryImage,
    sizes: Array.isArray(item.sizes) && item.sizes.length > 0 ? item.sizes : ['S', 'M', 'L', 'XL'],
    colors: Array.isArray(item.colors) ? item.colors : [],
    care: Array.isArray(item.care) ? item.care : [],
    material: typeof item.material === 'object' && item.material !== null ? item.material : {
      type: typeof item.material === 'string' ? item.material : 'Tenun Ikat Tradisional',
      composition: 'Katun & Benang Tenun Alam',
      texture: 'Halus bertekstur tenun khas',
      comfort: 'Nyaman dan adem',
    },
    story: item.story || item.description || '',
    tagline: item.tagline || '',
    description: item.description || '',
    isActive: item.isActive !== false,
    isVisible: item.isVisible !== false,
    featured: item.featured === true,
    signature: item.signature === true,
    archPosition: typeof item.archPosition === 'number' ? item.archPosition : (item.archIndex || 0),
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Check if Database (Prisma) is available
 */
function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Get all products with optional filtering (Async / DB-aware)
 */
export async function getProducts({
  includeInactive = false,
  includeHidden = false,
  category = null,
  search = null,
  featured = null,
  archOnly = false,
} = {}) {
  // If Prisma is configured, try querying database
  if (isDbConfigured()) {
    try {
      const where = {};

      if (!includeInactive) where.isActive = true;
      if (!includeHidden) where.isVisible = true;
      if (category && category !== 'all') where.categorySlug = category;
      if (featured !== null) where.featured = Boolean(featured);
      if (archOnly) where.archPosition = { gt: 0 };

      if (search && search.trim()) {
        const q = search.trim();
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }

      const rows = await prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: archOnly ? { archPosition: 'asc' } : { createdAt: 'desc' },
      });

      if (rows && rows.length > 0) {
        return rows.map(normalizeProduct);
      }
    } catch (err) {
      console.warn('[Products Service] Prisma query fallback to collections.json:', err.message);
    }
  }

  // Static Fallback
  let products = collectionsData.map(normalizeProduct);

  if (!includeInactive) {
    products = products.filter((p) => p.isActive);
  }

  if (!includeHidden) {
    products = products.filter((p) => p.isVisible);
  }

  if (category && category !== 'all') {
    products = products.filter((p) => p.category === category || p.categorySlug === category);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    products = products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const skuMatch = p.sku.toLowerCase().includes(q);
      const catMatch = p.categoryLabel.toLowerCase().includes(q);
      const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
      return nameMatch || skuMatch || catMatch || descMatch;
    });
  }

  if (featured !== null) {
    products = products.filter((p) => p.featured === Boolean(featured));
  }

  if (archOnly) {
    products = products
      .filter((p) => p.archPosition > 0)
      .sort((a, b) => a.archPosition - b.archPosition);
  }

  return products;
}

/**
 * Get product by unique slug
 */
export async function getProductBySlug(slug) {
  if (!slug) return null;

  if (isDbConfigured()) {
    try {
      const row = await prisma.product.findUnique({
        where: { slug },
        include: { category: true },
      });
      if (row) return normalizeProduct(row);
    } catch (err) {
      console.warn('[Products Service] getProductBySlug DB error, falling back:', err.message);
    }
  }

  const raw = collectionsData.find((p) => p.slug === slug || p.id === slug);
  return raw ? normalizeProduct(raw) : null;
}

/**
 * Get product by ID
 */
export async function getProductById(id) {
  if (!id) return null;

  if (isDbConfigured()) {
    try {
      const row = await prisma.product.findFirst({
        where: {
          OR: [{ id: id }, { slug: id }, { sku: id }],
        },
        include: { category: true },
      });
      if (row) return normalizeProduct(row);
    } catch (err) {
      console.warn('[Products Service] getProductById DB error, falling back:', err.message);
    }
  }

  const raw = collectionsData.find((p) => p.id === id || p.slug === id || p.sku === id);
  return raw ? normalizeProduct(raw) : null;
}

/**
 * Validate product payload
 */
export function validateProductData(data, isUpdate = false) {
  const errors = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Nama produk wajib diisi.';
  }

  if (!data.sku || !data.sku.trim()) {
    errors.sku = 'SKU produk wajib diisi.';
  } else if (!/^[A-Z0-9_-]+$/i.test(data.sku.trim())) {
    errors.sku = 'SKU hanya boleh berisi huruf, angka, tanda strip (-), dan underscore (_).';
  }

  if (!data.categorySlug && !data.category) {
    errors.categorySlug = 'Kategori produk wajib dipilih.';
  }

  const priceNum = typeof data.price === 'number' ? data.price : parsePriceToNumber(data.price);
  if (isNaN(priceNum) || priceNum < 0) {
    errors.price = 'Harga produk harus berupa angka positif.';
  }

  const stockNum = typeof data.stock === 'number' ? data.stock : parseInt(data.stock, 10);
  if (isNaN(stockNum) || stockNum < 0) {
    errors.stock = 'Stok produk harus berupa angka minimal 0.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Helper to generate slug from name
 */
export function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Create a new product (Database persistence)
 */
export async function createProduct(inputData) {
  const validation = validateProductData(inputData);
  if (!validation.isValid) {
    const err = new Error('Validasi data produk gagal.');
    err.validationErrors = validation.errors;
    err.statusCode = 400;
    throw err;
  }

  const slug = inputData.slug ? generateSlug(inputData.slug) : generateSlug(inputData.name);
  const sku = inputData.sku.trim().toUpperCase();
  const categorySlug = inputData.categorySlug || inputData.category;
  const price = typeof inputData.price === 'number' ? inputData.price : parsePriceToNumber(inputData.price);
  const stock = typeof inputData.stock === 'number' ? inputData.stock : parseInt(inputData.stock, 10) || 0;

  const images = Array.isArray(inputData.images) && inputData.images.length > 0
    ? inputData.images.filter(Boolean)
    : (inputData.image ? [inputData.image] : ['/images/hero/hero-main.jpg']);

  const sizes = Array.isArray(inputData.sizes) && inputData.sizes.length > 0
    ? inputData.sizes
    : ['S', 'M', 'L', 'XL'];

  const colors = Array.isArray(inputData.colors) ? inputData.colors : [];
  const care = Array.isArray(inputData.care) ? inputData.care : [];

  if (isDbConfigured()) {
    // Check SKU & Slug uniqueness
    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      const err = new Error(`SKU "${sku}" sudah digunakan produk lain.`);
      err.statusCode = 409;
      throw err;
    }

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      const err = new Error(`Slug "${slug}" sudah digunakan produk lain.`);
      err.statusCode = 409;
      throw err;
    }

    // Ensure category exists or create it
    await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: {
        slug: categorySlug,
        name: (await getCategoryNameBySlug(categorySlug)) || categorySlug,
        isActive: true,
      },
    });

    const created = await prisma.product.create({
      data: {
        sku,
        slug,
        name: inputData.name.trim(),
        tagline: inputData.tagline?.trim() || null,
        description: inputData.description?.trim() || null,
        story: inputData.story?.trim() || null,
        material: inputData.material || null,
        price,
        stock,
        images,
        sizes,
        colors,
        care,
        isActive: inputData.isActive !== false,
        isVisible: inputData.isVisible !== false,
        featured: Boolean(inputData.featured),
        signature: Boolean(inputData.signature),
        archPosition: parseInt(inputData.archPosition, 10) || 0,
        categorySlug,
      },
      include: { category: true },
    });

    return normalizeProduct(created);
  } else {
    // Simulation / local fallback response
    const mockProduct = normalizeProduct({
      id: `local-${Date.now()}`,
      sku,
      slug,
      name: inputData.name,
      tagline: inputData.tagline,
      description: inputData.description,
      story: inputData.story,
      material: inputData.material,
      price,
      stock,
      images,
      sizes,
      colors,
      care,
      isActive: inputData.isActive !== false,
      isVisible: inputData.isVisible !== false,
      featured: Boolean(inputData.featured),
      signature: Boolean(inputData.signature),
      archPosition: parseInt(inputData.archPosition, 10) || 0,
      categorySlug,
    });
    return mockProduct;
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(id, inputData) {
  const validation = validateProductData(inputData, true);
  if (!validation.isValid) {
    const err = new Error('Validasi data produk gagal.');
    err.validationErrors = validation.errors;
    err.statusCode = 400;
    throw err;
  }

  const categorySlug = inputData.categorySlug || inputData.category;
  const price = typeof inputData.price === 'number' ? inputData.price : parsePriceToNumber(inputData.price);
  const stock = typeof inputData.stock === 'number' ? inputData.stock : parseInt(inputData.stock, 10) || 0;

  const images = Array.isArray(inputData.images) && inputData.images.length > 0
    ? inputData.images.filter(Boolean)
    : (inputData.image ? [inputData.image] : ['/images/hero/hero-main.jpg']);

  const sizes = Array.isArray(inputData.sizes) && inputData.sizes.length > 0
    ? inputData.sizes
    : ['S', 'M', 'L', 'XL'];

  const colors = Array.isArray(inputData.colors) ? inputData.colors : [];
  const care = Array.isArray(inputData.care) ? inputData.care : [];

  if (isDbConfigured()) {
    // Find target product
    const target = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }, { sku: id }] },
    });

    if (!target) {
      const err = new Error(`Produk dengan ID "${id}" tidak ditemukan.`);
      err.statusCode = 404;
      throw err;
    }

    const sku = inputData.sku ? inputData.sku.trim().toUpperCase() : target.sku;
    const slug = inputData.slug ? generateSlug(inputData.slug) : target.slug;

    // Check SKU collision with other products
    if (sku !== target.sku) {
      const existingSku = await prisma.product.findUnique({ where: { sku } });
      if (existingSku && existingSku.id !== target.id) {
        const err = new Error(`SKU "${sku}" sudah digunakan produk lain.`);
        err.statusCode = 409;
        throw err;
      }
    }

    // Check Slug collision with other products
    if (slug !== target.slug) {
      const existingSlug = await prisma.product.findUnique({ where: { slug } });
      if (existingSlug && existingSlug.id !== target.id) {
        const err = new Error(`Slug "${slug}" sudah digunakan produk lain.`);
        err.statusCode = 409;
        throw err;
      }
    }

    if (categorySlug) {
      await prisma.category.upsert({
        where: { slug: categorySlug },
        update: {},
        create: {
          slug: categorySlug,
          name: (await getCategoryNameBySlug(categorySlug)) || categorySlug,
          isActive: true,
        },
      });
    }

    const updated = await prisma.product.update({
      where: { id: target.id },
      data: {
        sku,
        slug,
        name: inputData.name ? inputData.name.trim() : target.name,
        tagline: inputData.tagline !== undefined ? inputData.tagline?.trim() || null : target.tagline,
        description: inputData.description !== undefined ? inputData.description?.trim() || null : target.description,
        story: inputData.story !== undefined ? inputData.story?.trim() || null : target.story,
        material: inputData.material !== undefined ? inputData.material : target.material,
        price,
        stock,
        images,
        sizes,
        colors,
        care,
        isActive: inputData.isActive !== undefined ? Boolean(inputData.isActive) : target.isActive,
        isVisible: inputData.isVisible !== undefined ? Boolean(inputData.isVisible) : target.isVisible,
        featured: inputData.featured !== undefined ? Boolean(inputData.featured) : target.featured,
        signature: inputData.signature !== undefined ? Boolean(inputData.signature) : target.signature,
        archPosition: inputData.archPosition !== undefined ? parseInt(inputData.archPosition, 10) || 0 : target.archPosition,
        categorySlug: categorySlug || target.categorySlug,
      },
      include: { category: true },
    });

    return normalizeProduct(updated);
  } else {
    // Simulated update for offline/fallback mode
    return normalizeProduct({
      id,
      sku: inputData.sku,
      slug: inputData.slug || id,
      name: inputData.name,
      tagline: inputData.tagline,
      description: inputData.description,
      story: inputData.story,
      material: inputData.material,
      price,
      stock,
      images,
      sizes,
      colors,
      care,
      isActive: inputData.isActive !== false,
      isVisible: inputData.isVisible !== false,
      featured: Boolean(inputData.featured),
      signature: Boolean(inputData.signature),
      archPosition: parseInt(inputData.archPosition, 10) || 0,
      categorySlug,
    });
  }
}

/**
 * Delete / Soft delete product
 */
export async function deleteProduct(id) {
  if (isDbConfigured()) {
    const target = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }, { sku: id }] },
    });

    if (!target) {
      const err = new Error(`Produk dengan ID "${id}" tidak ditemukan.`);
      err.statusCode = 404;
      throw err;
    }

    await prisma.product.delete({
      where: { id: target.id },
    });

    return { success: true, deletedId: target.id };
  }

  return { success: true, deletedId: id };
}
