'use client';

import Link from 'next/link';
import styles from './Hero.module.css';

const pillars = [
  {
    title: 'Handcrafted',
    desc: 'Made by skilled artisans with dedication and care.',
    icon: (
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="#8C6418" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 10v14M32 10v14" strokeWidth="2.2" />
        <path d="M14 13h20M14 23h20" strokeWidth="1.8" />
        <path d="M20 13v10M24 13v10M28 13v10" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
        <path d="M10 28c1 4 4 9 7 13M38 28c-1 4-4 9-7 13" strokeWidth="1.8" />
        <path d="M13 26c1 3 3 7 5 9M35 26c-1 3-3 7-5 9" strokeWidth="1.5" />
        <path d="M12 30c2 3 4 6 6 8M36 30c-2 3-4 6-6 8" strokeWidth="1.4" />
        <path d="M17 41c2 2 5 3 7 3s5-1 7-3" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    title: 'Authentic',
    desc: 'Preserving the beauty of Indonesian woven heritage.',
    icon: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" stroke="#8C6418" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 4L44 24L24 44L4 24Z" strokeWidth="2" />
        <path d="M24 10L38 24L24 38L10 24Z" strokeWidth="1.4" />
        <path d="M17 17l14 14M31 17L17 31" strokeWidth="1.4" />
        <path d="M21 13l14 14M27 13L13 27" strokeWidth="1.2" />
        <path d="M13 21l14 14M35 21L21 35" strokeWidth="1.2" />
        <path d="M24 1l2.5 3L24 7l-2.5-3Z" strokeWidth="1" fill="#8C6418" />
        <path d="M47 24l-3 2.5L41 24l3-2.5Z" strokeWidth="1" fill="#8C6418" />
        <path d="M24 47l-2.5-3L24 41l2.5 3Z" strokeWidth="1" fill="#8C6418" />
        <path d="M1 24l3-2.5L7 24l-3 2.5Z" strokeWidth="1" fill="#8C6418" />
      </svg>
    ),
  },
  {
    title: 'Quality Material',
    desc: 'Premium natural fibers for comfort and long lasting.',
    icon: (
      <svg width="42" height="42" viewBox="0 0 48 48" fill="none" stroke="#8C6418" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 36c-3-6-2-14 4-20 6-5 15-6 20-4 2 5 1 14-4 20-6 7-15 8-20 4z" strokeWidth="2" />
        <path d="M8 40c4-4 9-9 14-15 5-6 11-12 18-17" strokeWidth="2.2" />
        <path d="M18 27c4-1 8-2 13-1M23 21c4-2 9-3 14-2M28 15c3-2 7-3 10-2" strokeWidth="1.4" />
        <path d="M15 32c-1-3-2-7-1-10M20 25c-1-4-1-8 0-11M25 19c-1-3 0-6 1-8" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    title: 'Made in Indonesia',
    desc: 'Proudly created to support local craftsmanship.',
    icon: (
      <svg width="48" height="32" viewBox="0 0 54 32" fill="none" stroke="#8C6418" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12c2-3 5-5 8-7 2 1 3 4 2 7-2 3-5 5-7 7-2-1-3-4-3-7z" strokeWidth="1.5" />
        <path d="M11 22c3 0 6 1 8 1 3 0 6 1 8 1" strokeWidth="1.5" />
        <path d="M29 24c2 0 4 1 6 1 2 0 4-1 6-2" strokeWidth="1.5" />
        <path d="M19 11c0-3 2-5 4-6 3 2 4 4 3 6-2 3-4 4-7 2z" strokeWidth="1.5" />
        <path d="M30 14c2-2 3-1 2 1-1 1 0 3 2 3-2 2-3 3-4 2 0-2-1-4 0-6z" strokeWidth="1.5" />
        <path d="M43 12c3-2 6-1 8 0 1 3 0 6-2 8-3-1-5-4-6-8z" strokeWidth="1.5" />
        <circle cx="36" cy="13" r="0.8" fill="#8C6418" />
        <circle cx="39" cy="16" r="0.8" fill="#8C6418" />
        <circle cx="41" cy="12" r="0.8" fill="#8C6418" />
      </svg>
    ),
  },
];

export default function Hero() {
  return (
    <div className={styles.heroContainer}>
      <section className={styles.hero} aria-label="Hero campaign">
        <img
          src="/images/hero/user-batik-floral.png"
          alt="Traditional Batik Floral Motif"
          className={styles.hero__batik}
          aria-hidden="true"
        />

        <div className={styles.hero__left}>
          <div className={styles.hero__brand}>
            <span className={styles['hero__brand-label']}>BAJU TENUN</span>
          </div>

          <h1 className={styles.hero__title}>
            Woven Heritage,<br />Designed for Today.
          </h1>

          <div className={styles.hero__divider} aria-hidden="true" />

          <p className={styles.hero__subtitle}>
            Celebrating Indonesian craftsmanship through timeless fashion pieces, woven with tradition and designed for the modern world.
          </p>

          <div className={styles.hero__actions}>
            <Link href="/collections" className={styles['hero__btn-primary']}>
              Explore Collections &nbsp; &rarr;
            </Link>
            <Link href="/our-story" className={styles['hero__btn-secondary']}>
              Our Story &nbsp; &rarr;
            </Link>
          </div>

          <div className={styles.hero__scroll}>
            <span className={styles['hero__scroll-text']}>Scroll</span>
            <svg width="14" height="30" viewBox="0 0 14 30" fill="none" stroke="#A37928" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={styles['hero__scroll-arrow']}>
              <line x1="7" y1="2" x2="7" y2="25" />
              <path d="M2 20l5 6 5-6" />
            </svg>
          </div>
        </div>

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
