'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

const pillars = [
  {
    title: 'Handcrafted',
    desc: 'Made by skilled artisans with dedication and care.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v12M6 12h12" />
      </svg>
    ),
  },
  {
    title: 'Authentic',
    desc: 'Preserving the beauty of Indonesian woven heritage.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 3L2 12h3v8h14v-8h3L12 3z" />
      </svg>
    ),
  },
  {
    title: 'Quality Material',
    desc: 'Premium natural fibers for comfort and long lasting.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0 0 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        <path d="M12 6a6 6 0 0 0-6 6c0 3.31 2.69 6 6 6s6-2.69 6-6a6 6 0 0 0-6-6z" />
      </svg>
    ),
  },
  {
    title: 'Made in Indonesia',
    desc: 'Proudly created to support local craftsmanship.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M2 12h20M12 2v20" />
      </svg>
    ),
  },
];

export default function Hero() {
  const bgRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (bgRef.current) {
        const scrolled = window.scrollY;
        bgRef.current.style.transform = `translateY(${scrolled * 0.08}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.heroContainer}>
      <section className={styles.hero} aria-label="Hero campaign">
        {/* Soft background batik watermark */}
        <div className={styles.hero__batik} aria-hidden="true" />

        {/* Left Column */}
        <div className={styles.hero__left}>
          {/* BOLDER & LARGER Label with extended gold lines */}
          <div className={styles.hero__brand}>
            <span className={styles['hero__brand-label']}>BAJU TENUN</span>
          </div>

          {/* BOLDER Headline */}
          <h1 className={styles.hero__title}>
            Woven Heritage,<br />Designed for Today.
          </h1>

          {/* Ornate Gold Filigree Divider */}
          <div className={styles.hero__divider} aria-hidden="true" />

          {/* Subtitle */}
          <p className={styles.hero__subtitle}>
            Celebrating Indonesian craftsmanship through timeless fashion pieces, woven with tradition and designed for the modern world.
          </p>

          {/* Actions with darker rich gold Explore Collections button */}
          <div className={styles.hero__actions}>
            <Link href="/collections" className={styles['hero__btn-primary']}>
              Explore Collections &nbsp; &rarr;
            </Link>
            <Link href="/our-story" className={styles['hero__btn-secondary']}>
              Our Story &nbsp; &rarr;
            </Link>
          </div>

          {/* Scroll indicator centered in left section */}
          <div className={styles.hero__scroll}>
            <span className={styles['hero__scroll-text']}>Scroll</span>
            <span className={styles['hero__scroll-arrow']}>↓</span>
          </div>
        </div>

        {/* Right Column: Full-height visual showcase */}
        <div className={styles.hero__right}>
          <div className={styles['hero__image-wrapper']}>
            <img
              ref={bgRef}
              src="/images/hero/hero-main.jpg"
              alt="Premium Woven Fabrics on Rustic Wooden Table"
              className={styles['hero__bg-image']}
              loading="eager"
            />
            <div className={styles['hero__right-overlay']} />
          </div>
        </div>
      </section>

      {/* Bottom Bar: 4 Value Pillars */}
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
