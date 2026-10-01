import { Suspense } from 'react';
import CollectionsPage from '@/components/collections/CollectionsPage';
import { getProducts } from '@/lib/products';
import { getAllCategories } from '@/lib/categories';

export const metadata = {
  title: 'Collections — Tenun Ikat Nura',
  description: 'Explore the full range of Indonesian heritage pieces, modern dresses, blouses, and couple sets by Tenun Ikat Nura.',
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  // Fetch dari PostgreSQL via service layer (dengan fallback ke JSON jika DB tidak tersedia)
  const [products, categories] = await Promise.all([
    getProducts({ includeInactive: false, includeHidden: false }),
    getAllCategories({ includeInactive: false, includeAllTab: true }),
  ]);

  return (
    <Suspense fallback={null}>
      <CollectionsPage initialProducts={products} initialCategories={categories} />
    </Suspense>
  );
}
