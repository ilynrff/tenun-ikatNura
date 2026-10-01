import ProductDetailPage from '@/components/product/ProductDetailPage';
import { getProductBySlug, getProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: 'Koleksi Tidak Ditemukan — Tenun Ikat Nura',
      description: 'Detail piece, cerita budaya, panduan ukuran, dan cara perawatan koleksi Tenun Ikat Nura.',
    };
  }
  return {
    title: `${product.name} — Tenun Ikat Nura`,
    description: product.description || product.tagline || 'Detail piece, cerita budaya, panduan ukuran, dan cara perawatan koleksi Tenun Ikat Nura.',
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getProducts({ includeInactive: false, includeHidden: false }),
  ]);

  return <ProductDetailPage product={product} relatedProducts={allProducts} />;
}
