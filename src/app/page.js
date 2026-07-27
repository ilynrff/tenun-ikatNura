import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CTABanner from '@/components/layout/CTABanner';
import Hero from '@/components/home/Hero';
import BrandIntro from '@/components/home/BrandIntro';
import OurStoryPreview from '@/components/home/OurStoryPreview';
import Craftsmanship from '@/components/home/Craftsmanship';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import SignatureCollection from '@/components/home/SignatureCollection';
import LookbookPreview from '@/components/home/LookbookPreview';
import Testimonials from '@/components/home/Testimonials';
import InstagramPreview from '@/components/home/InstagramPreview';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BrandIntro />
        <OurStoryPreview />
        <Craftsmanship />
        <FeaturedCollection />
        <SignatureCollection />
        <LookbookPreview />
        <Testimonials />
        <InstagramPreview />
        <CTABanner
          title="Interested in Our Collection?"
          subtitle="Experience Indonesian Heritage Fashion. Let's Talk."
        />
      </main>
      <Footer />
    </>
  );
}
