const fs = require('fs');

const srcPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c\\media__1785164682393.png';
const base64Data = fs.readFileSync(srcPath).toString('base64');
const dataUri = `data:image/png;base64,${base64Data}`;

const heroJsContent = `'use client';

import Link from 'next/link';
import styles from './Hero.module.css';

const batikFloralDataUri = "${dataUri}";

const pillars = [
  {
    title: 'Handcrafted',
    desc: 'Made by skilled artisans with dedication and care.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeDasharray="1 1.5" strokeWidth="0.9" />
        <path d="M7 3v18M17 3v18" strokeWidth="1.1" />
        <path d="M2 12c2.5-3 5-3 7 0s4.5 3 7 0 4.5-3 6 0" strokeWidth="1.3" />
        <path d="M5 16c1.5 1.5 3 1.5 4 0s2.5-1.5 4 0" strokeWidth="1.1" />
      </svg>
    ),
  },
  {
    title: 'Authentic',
    desc: 'Preserving the beauty of Indonesian woven heritage.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 12l10 10 10-10L12 2z" strokeWidth="1.2" />
        <path d="M12 6L6 12l6 6 6-6-6-6z" strokeWidth="0.9" strokeDasharray="2 1" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth="0.9" />
      </svg>
    ),
  },
  {
    title: 'Quality Material',
    desc: 'Premium natural fibers for comfort and long lasting.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22C12 22 20 18 20 10C20 5.5 16.5 2 12 2C7.5 2 4 5.5 4 10C4 18 12 22 12 22Z" />
        <path d="M12 22V8" strokeWidth="1.1" />
        <path d="M12 11C14 9.5 16.5 9.5 18 10.5" strokeWidth="1" />
        <path d="M12 15C10 13.5 7.5 13.5 6 14.5" strokeWidth="1" />
        <path d="M12 18C13.5 17 15.5 17 16.5 17.8" strokeWidth="0.9" />
      </svg>
    ),
  },
  {
    title: 'Made in Indonesia',
    desc: 'Proudly created to support local craftsmanship.',
    icon: (
      <svg width="32" height="30" viewBox="0 0 28 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 11C3 9 4.5 6 5.5 4.5C6.5 3 7.5 4 6.5 6.5C5.5 9 4 12 3 13.5C2 15 1 13 2 11Z" />
        <path d="M7 15.5C9 15 11.5 15.5 13.5 15C14.5 14.8 15.5 15.5 16.5 15" />
        <path d="M9.5 5C11 3.5 13.5 4 14.5 5.5C15 6.5 13.5 8.5 12 9C10.5 9.5 9 8 9.5 5Z" />
        <path d="M16 6.5C17 6 18 7 17.5 8.5C17 10 18.5 11 17.5 12C16.5 13 16 11 16.5 9.5" />
        <path d="M20 9.5C21.5 8.5 24 8 26 9.5C27 10.5 25.5 12.5 24 12.5C22.5 12.5 20.5 11 20 9.5Z" />
      </svg>
    ),
  },
];

export default function Hero() {
  return (
    <div className={styles.heroContainer}>
      <section className={styles.hero} aria-label="Hero campaign">
        {/* Exact user-provided batik floral image rendered via Base64 Data URI */}
        <div 
          className={styles.hero__batik} 
          style={{ backgroundImage: \`url(\${batikFloralDataUri})\` }}
          aria-hidden="true" 
        />

        {/* Left Column */}
        <div className={styles.hero__left}>
          {/* Refined BAJU TENUN Label */}
          <div className={styles.hero__brand}>
            <span className={styles['hero__brand-label']}>BAJU TENUN</span>
          </div>

          {/* Light & Refined Headline */}
          <h1 className={styles.hero__title}>
            Woven Heritage,<br />Designed for Today.
          </h1>

          {/* Understated Subtle Gold Divider */}
          <div className={styles.hero__divider} aria-hidden="true" />

          {/* Subtitle */}
          <p className={styles.hero__subtitle}>
            Celebrating Indonesian craftsmanship through timeless fashion pieces, woven with tradition and designed for the modern world.
          </p>

          {/* Refined Luxury CTA Actions */}
          <div className={styles.hero__actions}>
            <Link href="/collections" className={styles['hero__btn-primary']}>
              Explore Collections &nbsp; &rarr;
            </Link>
            <Link href="/our-story" className={styles['hero__btn-secondary']}>
              Our Story &nbsp; &rarr;
            </Link>
          </div>

          {/* Subtle Minimal Scroll Indicator */}
          <div className={styles.hero__scroll}>
            <span className={styles['hero__scroll-text']}>Scroll</span>
            <span className={styles['hero__scroll-arrow']}>↓</span>
          </div>
        </div>

        {/* Right Column: Full-height visual showcase */}
        <div className={styles.hero__right}>
          <div className={styles['hero__image-wrapper']}>
            <img
              src="/images/hero/hero-main.jpg"
              alt="Premium Woven Fabrics on Rustic Wooden Table"
              className={styles['hero__bg-image']}
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Refined Luxury 4 Value Pillars Bar */}
      <section className={styles.pillars} aria-label="Value Pillars">
        <div className={styles.pillars__inner}>
          {pillars.map((pillar) => (
            <div key={pillar.title} className={styles.pillar}>
              <div className={styles.pillar__icon}>{pillar.icon}</div>
              <div className={styles.pillar__content}>
                <h3 className={styles.pillar__title}>{pillar.title}</h3>
                <p className={styles.pillar__desc}>{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
`;

fs.writeFileSync('c:\\projects\\tenun ikat Nura\\src\\components\\home\\Hero.js', heroJsContent);
console.log('Successfully updated Hero.js with Base64 Data URI of exact user image!');
