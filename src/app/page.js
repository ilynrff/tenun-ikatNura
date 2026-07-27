import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import BrandIntro from '@/components/home/BrandIntro';
import OurStoryPreview from '@/components/home/OurStoryPreview';
import Craftsmanship from '@/components/home/Craftsmanship';
import FeaturedCollection from '@/components/home/FeaturedCollection';
import SignatureCollection from '@/components/home/SignatureCollection';
import LookbookPreview from '@/components/home/LookbookPreview';
import Testimonials from '@/components/home/Testimonials';
import InstagramPreview from '@/components/home/InstagramPreview';
import CTABanner from '@/components/home/CTABanner';
import Footer from '@/components/layout/Footer';

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
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
