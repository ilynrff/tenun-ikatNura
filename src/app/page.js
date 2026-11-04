import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import ExploreCollectionsSection from '@/components/home/ExploreCollectionsSection';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import Craftsmanship from '@/components/home/Craftsmanship';
import FashionVisualBreak from '@/components/home/FashionVisualBreak';
import BrandIntro from '@/components/home/BrandIntro';
import Footer from '@/components/layout/Footer';
import { getProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Tenun Ikat Nura — Keindahan Tenun, Warisan Nusantara',
  description: 'Brand fashion heritage Indonesia yang menghadirkan koleksi pakaian tenun berkualitas dengan desain modern, elegan, dan autentik.',
};

export default async function HomePage() {
  const [archProducts, featuredProducts] = await Promise.all([
    getProducts({ archOnly: true }),
    getProducts({ featured: true }),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero archProducts={archProducts} />
        <ExploreCollectionsSection />
        <FeaturedCollection featuredProducts={featuredProducts} />
        <Craftsmanship />
        <FashionVisualBreak />
        <BrandIntro />
      </main>
      <Footer />
    </>
  );
}
