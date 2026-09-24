'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

const archLookbook = [
  {
    id: 1,
    title: 'Nusa Indah Outer',
    category: 'Outerwear Tenun',
    image: '/images/collections/nusa-indah-1.jpg',
    featured: false,
    description: 'Siluet luaran tenun ikat bermotif khas dengan sentuhan kontemporer yang anggun.'
  },
  {
    id: 2,
    title: 'Majapahit Blazer',
    category: 'Heritage Blazer',
    image: '/images/collections/majapahit-blazer-1.jpg',
    featured: false,
    description: 'Blazer berstruktur rapi dengan tenun Troso premium untuk tampilan formal editorial.'
  },
  {
    id: 3,
    title: 'Ratna Tenun Dress',
    category: 'Couture Dress',
    image: '/images/collections/ratna-dress-1.jpg',
    featured: true,
    description: 'Gaun feminin berpadu tenun ikat Jepara halus dalam potongan yang memikat.'
  },
  {
    id: 4,
    title: 'Swarna Bumi Kimono',
    category: 'Kimono Outer',
    image: '/images/collections/swarna-kimono-1.jpg',
    featured: false,
    description: 'Luaran berpotongan kimono modern dengan motif wastra berkarakter tegas.'
  },
  {
    id: 5,
    title: 'Surya Kencana Shirt',
    category: 'Koleksi Pria',
    image: '/images/collections/surya-shirt-1.jpg',
    featured: false,
    description: 'Kemeja pria elegan berbahan katun tenun ikat asli dengan kenyamanan maksimal.'
  },
];

export default function Hero() {
  const [activePreview, setActivePreview] = useState(null);

  const closePreview = useCallback(() => {
    setActivePreview(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closePreview();
      }
    };

    if (activePreview) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activePreview, closePreview]);

  return (
    <section className={styles.heroContainer} aria-label="Hero campaign">
      <div className={styles.heroContent}>
        <h1 className={styles.title}>
          WARISAN TENUN,<br />DIRANCANG UNTUK MASA KINI.
        </h1>

        <p className={styles.subtitle}>
          Merayakan keahlian pengrajin Indonesia melalui busana yang tak lekang oleh waktu, ditenun dengan tradisi dan dirancang untuk kehidupan modern.
        </p>

        <Link href="/collections" className={styles.ctaPill}>
          <span>JELAJAHI KOLEKSI</span>
          <span className={styles.ctaArrowCircle} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>

      <div className={styles.galleryWrapper}>
        <div className={styles.archGallery} role="region" aria-label="Galeri busana tenun">
          {archLookbook.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePreview(item)}
              className={`${styles.archCard} ${item.featured ? styles.archCardFeatured : ''}`}
              aria-label={`Lihat pratinjau ${item.title}`}
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
                <span className={styles.archActionHint}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  Pratinjau
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* LIGHTBOX / IMAGE PREVIEW MODAL */}
      {activePreview && (
        <div
          className={styles.lightbox}
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau ${activePreview.title}`}
        >
          <div className={styles.lightboxBackdrop} />
          
          <div
            className={styles.lightboxDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={closePreview}
              aria-label="Tutup pratinjau"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className={styles.lightboxImageWrapper}>
              <img
                src={activePreview.image}
                alt={activePreview.title}
                className={styles.lightboxImage}
              />
            </div>

            <div className={styles.lightboxInfo}>
              <span className={styles.lightboxCategory}>{activePreview.category}</span>
              <h3 className={styles.lightboxTitle}>{activePreview.title}</h3>
              <p className={styles.lightboxDesc}>{activePreview.description}</p>
              
              <Link
                href="/collections"
                className={styles.lightboxCta}
                onClick={closePreview}
              >
                <span>Lihat Koleksi Lengkap</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
