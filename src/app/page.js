import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import ExploreCollectionsSection from '@/components/home/ExploreCollectionsSection';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import Craftsmanship from '@/components/home/Craftsmanship';
import FashionVisualBreak from '@/components/home/FashionVisualBreak';
import BrandIntro from '@/components/home/BrandIntro';
import CTABanner from '@/components/layout/CTABanner';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Tenun Ikat Nura — Keindahan Tenun, Warisan Nusantara',
  description: 'Brand fashion heritage Indonesia yang menghadirkan koleksi pakaian tenun berkualitas dengan desain modern, elegan, dan autentik.',
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Explore Collections */}
        <ExploreCollectionsSection />

        {/* Section 3: Featured Products */}
        <FeaturedCollection />

        {/* Section 4: Why Tenun Ikat Nura (Craftsmanship & Value Points) */}
        <Craftsmanship />

        {/* Section 5: Textile / Fashion Visual */}
        <FashionVisualBreak />

        {/* Section 6: About Tenun Ikat Nura */}
        <BrandIntro />

        {/* Section 7: Final CTA */}
        <CTABanner
          title="Discover the Collection"
          subtitle="Explore pieces where Indonesian heritage meets contemporary elegance."
        />
      </main>

      {/* Section 8: Footer */}
      <Footer />
    </>
  );
}
