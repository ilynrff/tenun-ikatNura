import collectionsData from '@/data/collections.json';
import { formatRupiah, parsePriceToNumber } from './format';
import { getCategoryNameBySlug } from './categories';

/**
 * Normalizes a raw product object to ensure all required fields exist
 * @param {Object} item 
 * @returns {Object}
 */
export function normalizeProduct(item) {
  if (!item) return null;

  const numPrice = parsePriceToNumber(item.price);
  const stock = typeof item.stock === 'number' ? Math.max(0, Math.floor(item.stock)) : 5;
  const isOutOfStock = stock === 0;

  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : (item.image ? [item.image] : ['/images/hero/hero-main.jpg']);

  const primaryImage = item.primaryImage || images[0] || '/images/hero/hero-main.jpg';

  return {
    ...item,
    id: item.id || item.slug || item.sku,
    sku: item.sku || 'NURA-ITEM',
    slug: item.slug || item.id,
    name: item.name || item.title || 'Karya Tenun Nura',
    category: item.category || 'outer',
    categoryLabel: item.categoryLabel || getCategoryNameBySlug(item.category) || 'Koleksi Tenun',
    price: numPrice,
    formattedPrice: formatRupiah(numPrice),
    stock: stock,
    isOutOfStock: isOutOfStock,
    images: images,
    primaryImage: primaryImage,
    sizes: Array.isArray(item.sizes) ? item.sizes : ['S', 'M', 'L', 'XL'],
    isActive: item.isActive !== false,
    isVisible: item.isVisible !== false,
    featured: item.featured === true,
    signature: item.signature === true,
    archPosition: typeof item.archPosition === 'number' ? item.archPosition : (item.archIndex || 0),
  };
}

/**
 * Get all products with optional filtering
 */
export function getProducts({
  includeInactive = false,
  includeHidden = false,
  category = null,
  search = null,
  featured = null,
  archOnly = false,
} = {}) {
  let products = collectionsData.map(normalizeProduct);

  // Filter inactive (soft-deleted) products
  if (!includeInactive) {
    products = products.filter((p) => p.isActive);
  }

  // Filter hidden products (for customer side)
  if (!includeHidden) {
    products = products.filter((p) => p.isVisible);
  }

  // Filter by category
  if (category && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }

  // Filter by search query
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

  // Filter featured
  if (featured !== null) {
    products = products.filter((p) => p.featured === Boolean(featured));
  }

  // Filter arch gallery placement
  if (archOnly) {
    products = products.filter((p) => p.archPosition > 0).sort((a, b) => a.archPosition - b.archPosition);
  }

  return products;
}

/**
 * Get product by unique slug
 */
export function getProductBySlug(slug) {
  if (!slug) return null;
  const raw = collectionsData.find((p) => p.slug === slug);
  return raw ? normalizeProduct(raw) : null;
}

/**
 * Get product by ID
 */
export function getProductById(id) {
  if (!id) return null;
  const raw = collectionsData.find((p) => p.id === id || p.slug === id || p.sku === id);
  return raw ? normalizeProduct(raw) : null;
}

/**
 * Get related products by category
 */
export function getRelatedProducts(currentProductId, category, limit = 4) {
  return collectionsData
    .filter((p) => (p.id || p.slug) !== currentProductId && p.isActive !== false && p.isVisible !== false)
    .sort((a, b) => (a.category === category ? -1 : 1))
    .slice(0, limit)
    .map(normalizeProduct);
}
