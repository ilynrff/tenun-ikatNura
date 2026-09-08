const fs = require('fs');

const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c';

function getDataUri(srcFile) {
  const p = `${brainDir}\\${srcFile}`;
  if (fs.existsSync(p)) {
    const b64 = fs.readFileSync(p).toString('base64');
    return `data:image/png;base64,${b64}`;
  }
  return '';
}

const imgPhilosophy = getDataUri('artisan_weaving_editorial_1785768418024.png');
const imgCraftsmanship = getDataUri('candramawa_scarf_1785769481897.png');
const imgApproach = getDataUri('ratna_dress_1785769455505.png');

const storyJs = `'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './OurStoryPage.module.css';

const imgPhilosophy = "${imgPhilosophy}" || '/images/story/brand-intro.jpg';
const imgCraftsmanship = "${imgCraftsmanship}" || '/images/story/our-story.jpg';
const imgApproach = "${imgApproach}" || '/images/collections/ratna-dress-1.jpg';

export default function OurStoryPage() {
  return (
    <>
      <Navbar />
      <main className={styles.storyPage}>
        {/* SECTION 1 — Editorial Page Hero */}
        <section className={styles.hero}>
          <ScrollReveal>
            <div className={styles.hero__inner}>
              <span className={styles.hero__eyebrow}>OUR STORY</span>
              <h1 className={styles.hero__title}>A Heritage Worth Preserving</h1>
              <div className={styles.hero__divider} />
              <p className={styles.hero__desc}>
                &ldquo;Every thread carries a story — of culture, craftsmanship, and the enduring beauty of Indonesian woven heritage.&rdquo;
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* SECTION 2 — Brand Story (OUR PHILOSOPHY) */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.gridTwoCol}>
              {/* LEFT: Image */}
              <ScrollReveal>
                <div className={styles.imageWrapper}>
                  <img
                    src={imgPhilosophy}
                    alt="Master Indonesian artisan weaving traditional Ikat textile"
                    className={styles.image}
                    loading="eager"
                  />
                </div>
              </ScrollReveal>

              {/* RIGHT: Text Content */}
              <ScrollReveal delay={2}>
                <div className={styles.textContent}>
                  <span className={styles.sectionEyebrow}>OUR PHILOSOPHY</span>
                  <h2 className={styles.sectionTitle}>Where Tradition Meets Elegance</h2>
                  <div className={styles.sectionDivider} />
                  <p className={styles.bodyParagraph}>
                    Tenun Ikat Nura lahir dari kecintaan terhadap warisan budaya Indonesia. Kami percaya bahwa keindahan tenun ikat tidak hanya layak dilestarikan, tetapi juga pantas dihadirkan dalam kehidupan modern.
                  </p>
                  <p className={styles.bodyParagraph}>
                    Setiap kain membawa karakter, proses, dan cerita yang berbeda. Melalui perpaduan antara teknik tradisional, material pilihan, dan pendekatan desain yang lebih kontemporer, Tenun Ikat Nura menghadirkan tenun sebagai bagian dari gaya hidup modern tanpa kehilangan akar budayanya.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* SECTION 3 — The Art of Weaving (CRAFTSMANSHIP) */}
        <section className={\`\${styles.section} \${styles.sectionBeige}\`}>
          <div className={styles.container}>
            <div className={styles.gridTwoColReverse}>
              {/* LEFT: Text Content */}
              <ScrollReveal>
                <div className={styles.textContent}>
                  <span className={styles.sectionEyebrow}>CRAFTSMANSHIP</span>
                  <h2 className={styles.sectionTitle}>The Art of Weaving</h2>
                  <div className={styles.sectionDivider} />
                  <p className={styles.bodyParagraph}>
                    Behind every Tenun Ikat Nura piece lies a process that values patience, precision, and the hands of skilled artisans.
                  </p>
                  <p className={styles.bodyParagraph}>
                    From preparing the yarn and forming the motif to dyeing and weaving, each stage requires careful attention. The traditional process gives every fabric its own character — subtle variations that make each piece unique.
                  </p>
                </div>
              </ScrollReveal>

              {/* RIGHT: Image */}
              <ScrollReveal delay={2}>
                <div className={styles.imageWrapper}>
                  <img
                    src={imgCraftsmanship}
                    alt="Pure natural silk Indonesian Ikat woven scarf detail"
                    className={styles.image}
                    loading="lazy"
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* SECTION 4 — Tradition Meets Modernity (THE NURA APPROACH) */}
        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.gridTwoCol}>
              {/* LEFT: Image */}
              <ScrollReveal>
                <div className={styles.imageWrapper}>
                  <img
                    src={imgApproach}
                    alt="Modern Indonesian Ikat woven contemporary fashion dress"
                    className={styles.image}
                    loading="lazy"
                  />
                </div>
              </ScrollReveal>

              {/* RIGHT: Text Content */}
              <ScrollReveal delay={2}>
                <div className={styles.textContent}>
                  <span className={styles.sectionEyebrow}>THE NURA APPROACH</span>
                  <h2 className={styles.sectionTitle}>Tradition Meets Modernity</h2>
                  <div className={styles.sectionDivider} />
                  <p className={styles.bodyParagraph}>
                    Tenun Ikat Nura brings traditional woven heritage into contemporary silhouettes. The goal is not to change the identity of tenun, but to allow its beauty to live naturally within modern wardrobes.
                  </p>
                  <p className={styles.bodyParagraph}>
                    Through thoughtful cuts, refined materials, and contemporary styling, traditional craftsmanship becomes something that can be appreciated not only as cultural heritage, but also as modern expression.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* SECTION 5 — Closing CTA */}
        <section className={styles.ctaSection}>
          <ScrollReveal>
            <div className={styles.ctaInner}>
              <h2 className={styles.ctaTitle}>Discover the Collection</h2>
              <p className={styles.ctaDesc}>
                Explore pieces where Indonesian heritage meets contemporary elegance.
              </p>
              <div>
                <Link href="/collections" className={styles.ctaBtn}>
                  DISCOVER COLLECTION &nbsp; &rarr;
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </>
  );
}
`;

fs.writeFileSync('c:\\projects\\tenun ikat Nura\\src\\components\\story\\OurStoryPage.js', storyJs);
console.log('Successfully updated OurStoryPage.js without Node.js fs import in client bundle!');
