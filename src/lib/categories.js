import categoriesData from '@/data/categories.json';

/**
 * Category Data Service
 * Reads and manages category data for Tenun Ikat Nura
 */

export function getAllCategories({ includeInactive = false, includeAllTab = true } = {}) {
  let list = [...categoriesData];

  if (!includeInactive) {
    list = list.filter((cat) => cat.isActive !== false);
  }

  if (!includeAllTab) {
    list = list.filter((cat) => cat.slug !== 'all');
  }

  return list;
}

export function getCategoryBySlug(slug) {
  if (!slug) return null;
  return categoriesData.find((cat) => cat.slug === slug || cat.id === slug) || null;
}

export function getCategoryNameBySlug(slug) {
  const cat = getCategoryBySlug(slug);
  return cat ? cat.name : slug;
}
