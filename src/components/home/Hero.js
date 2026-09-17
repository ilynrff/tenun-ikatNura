'use client';

import Link from 'next/link';
import styles from './Hero.module.css';

const archLookbook = [
  {
    title: 'Nusa Indah Outer',
    category: 'Outerwear',
    price: 'Rp 650.000',
    image: '/images/collections/nusa-indah-1.jpg',
    featured: false,
  },
  {
    title: 'Majapahit Blazer',
    category: 'Heritage Blazer',
    price: 'Rp 890.000',
    image: '/images/collections/majapahit-blazer-1.jpg',
    featured: false,
  },
  {
    title: 'Ratna Tenun Dress',
    category: 'Couture Dress',
    price: 'Rp 780.000',
    image: '/images/collections/ratna-dress-1.jpg',
    featured: true, // Center Elevated Card
  },
  {
    title: 'Swarna Bumi Kimono',
    category: 'Kimono Outer',
    price: 'Rp 720.000',
    image: '/images/collections/swarna-kimono-1.jpg',
    featured: false,
  },
  {
    title: 'Surya Kencana Shirt',
    category: 'Men Collection',
    price: 'Rp 580.000',
    image: '/images/collections/surya-shirt-1.jpg',
    featured: false,
  },
];

export default function Hero() {
  return (
    <section className={styles.heroContainer} aria-label="Hero campaign">
      {/* Centered Flaire-inspired Header Content */}
      <div className={styles.heroContent}>
        <div className={styles.badgePill}>
          <span style={{ color: 'var(--heritage-gold, #A37928)' }}>✦</span>
          WARISAN NUSANTARA • EDITION 2026
        </div>

        <h1 className={styles.title}>
          Woven Heritage,<br />Designed for Today.
        </h1>

        <p className={styles.subtitle}>
          Celebrating Indonesian craftsmanship through timeless fashion pieces, woven with tradition and designed for the modern world.
        </p>

        <Link href="/collections" className={styles.ctaPill}>
          <span>EXPLORE COLLECTIONS</span>
          <span className={styles.ctaArrowCircle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>

      {/* 5 Arch-Window (Kubah Lengkung) Lookbook Cards Gallery */}
      <div className={styles.archGallery}>
        {archLookbook.map((item, index) => (
          <Link
            key={index}
            href="/collections"
            className={`${styles.archCard} ${item.featured ? styles.archCardFeatured : ''}`}
          >
            <img
              src={item.image}
              alt={item.title}
              className={styles.archImage}
              loading={index < 3 ? 'eager' : 'lazy'}
            />
            <div className={styles.archOverlay}>
              <span className={styles.archCategory}>{item.category}</span>
              <h3 className={styles.archTitle}>{item.title}</h3>
              <span className={styles.archPrice}>{item.price}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
