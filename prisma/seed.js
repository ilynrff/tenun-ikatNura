const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function parsePriceToNumber(rawPrice) {
  if (typeof rawPrice === 'number') return Math.max(0, Math.floor(rawPrice));
  if (typeof rawPrice !== 'string') return 0;
  const cleaned = rawPrice.replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

async function main() {
  console.log('🌱 Starting Tenun Ikat Nura database seed...');

  // 1. Read static JSON files
  const categoriesPath = path.join(__dirname, '../src/data/categories.json');
  const collectionsPath = path.join(__dirname, '../src/data/collections.json');

  const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  const collectionsData = JSON.parse(fs.readFileSync(collectionsPath, 'utf8'));

  // 2. Seed Categories (filter out 'all' UI tab)
  const actualCategories = categoriesData.filter((c) => c.slug !== 'all');
  console.log(`📁 Seeding ${actualCategories.length} categories...`);

  for (const cat of actualCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description || null,
        isActive: true,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description || null,
        isActive: true,
      },
    });
  }

  // 3. Seed Products
  console.log(`🧵 Seeding ${collectionsData.length} products...`);
  for (const item of collectionsData) {
    const numPrice = parsePriceToNumber(item.price);
    const stock = typeof item.stock === 'number' ? Math.max(0, Math.floor(item.stock)) : 5;
    const images = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.image ? [item.image] : ['/images/hero/hero-main.jpg']);

    await prisma.product.upsert({
      where: { slug: item.slug || item.id },
      update: {
        sku: item.sku || `NURA-${(item.slug || 'ITEM').toUpperCase()}`,
        name: item.name || 'Karya Tenun Nura',
        tagline: item.tagline || null,
        description: item.description || null,
        story: item.story || null,
        material: item.material || null,
        price: numPrice,
        stock: stock,
        images: images,
        sizes: Array.isArray(item.sizes) ? item.sizes : ['S', 'M', 'L', 'XL'],
        care: Array.isArray(item.care) ? item.care : [],
        colors: Array.isArray(item.colors) ? item.colors : [],
        isActive: item.isActive !== false,
        isVisible: item.isVisible !== false,
        featured: Boolean(item.featured),
        signature: Boolean(item.signature),
        archPosition: typeof item.archPosition === 'number' ? item.archPosition : (item.archIndex || 0),
        categorySlug: item.category || 'outer',
      },
      create: {
        sku: item.sku || `NURA-${(item.slug || 'ITEM').toUpperCase()}`,
        slug: item.slug || item.id,
        name: item.name || 'Karya Tenun Nura',
        tagline: item.tagline || null,
        description: item.description || null,
        story: item.story || null,
        material: item.material || null,
        price: numPrice,
        stock: stock,
        images: images,
        sizes: Array.isArray(item.sizes) ? item.sizes : ['S', 'M', 'L', 'XL'],
        care: Array.isArray(item.care) ? item.care : [],
        colors: Array.isArray(item.colors) ? item.colors : [],
        isActive: item.isActive !== false,
        isVisible: item.isVisible !== false,
        featured: Boolean(item.featured),
        signature: Boolean(item.signature),
        archPosition: typeof item.archPosition === 'number' ? item.archPosition : (item.archIndex || 0),
        categorySlug: item.category || 'outer',
      },
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
