import ProductDetailPage from '@/components/product/ProductDetailPage';
import collectionsData from '@/data/collections.json';

export async function generateStaticParams() {
  return collectionsData.map((item) => ({
    slug: item.slug,
  }));
}

export const metadata = {
  title: 'Collection Detail — Tenun Ikat Nura',
  description: 'Detail piece, cerita budaya, panduan ukuran, dan cara perawatan koleksi Tenun Ikat Nura.',
};

export default async function Page({ params }) {
  const { slug } = await params;
  return <ProductDetailPage slug={slug} />;
}
