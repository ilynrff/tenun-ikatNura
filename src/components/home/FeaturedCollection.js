'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './FeaturedCollection.module.css';

const collections = [
  {
    slug: 'nusa-indah-outer',
    title: 'Nusa Indah Outer',
    category: 'Outerwear',
    material: 'Tenun Ikat NTT & Sutra Alam',
    image: '/images/collections/nusa-indah-1.jpg',
  },
  {
    slug: 'ratna-mutumanikam-dress',
    title: 'Ratna Dress',
    category: 'Womenswear',
    material: 'Tenun Ikat Jepara & Rayon Premium',
    image: '/images/collections/ratna-dress-1.jpg',
  },
  {
    slug: 'majapahit-heritage-blazer',
    title: 'Majapahit Blazer',
    category: 'Structured Blazer',
    material: 'Tenun Ikat Troso & Katun Halus',
    image: '/images/collections/majapahit-blazer-1.jpg',
  },
  {
    slug: 'candramawa-silk-scarf',
    title: 'Candramawa Scarf',
    category: 'Accessories',
    material: '100% Sutra Tenun Asli',
    image: '/images/collections/candramawa-scarf-1.jpg',
  },
  {
    slug: 'surya-kencana-shirt',
    title: 'Surya Kencana Shirt',
    category: 'Menswear',
    material: 'Tenun Ikat Toraja & Katun',
    image: '/images/collections/surya-shirt-1.jpg',
  },
  {
    slug: 'swarna-bumi-kimono',
    title: 'Swarna Bumi Kimono',
    category: 'Resortwear',
    material: 'Tenun Ikat Bali & Linen Natural',
    image: '/images/collections/swarna-kimono-1.jpg',
  },
];

export default function FeaturedCollection() {
  const trackRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartOffset, setDragStartOffset] = useState(0);

  const visibleItems = [...collections, ...collections];

  useEffect(() => {
    if (dragging) return undefined;

    let rafId;
    const tick = () => {
      setOffset((prev) => {
        const halfWidth = trackRef.current ? trackRef.current.scrollWidth / 2 : 0;
        const next = prev - 0.55;
        return next <= -halfWidth ? 0 : next;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [dragging]);

  const moveTrack = (direction) => {
    const distance = 260;
    setOffset((prev) => {
      const halfWidth = trackRef.current ? trackRef.current.scrollWidth / 2 : 0;
      const newOffset = prev + direction * distance;
      if (newOffset > 0) return -halfWidth + 40;
      if (newOffset < -halfWidth) return 0;
      return newOffset;
    });
  };

  const handlePointerDown = (event) => {
    setDragging(true);
    setDragStartX(event.clientX);
    setDragStartOffset(offset);
  };

  const handlePointerMove = (event) => {
    if (!dragging) return;
    const delta = event.clientX - dragStartX;
    const halfWidth = trackRef.current ? trackRef.current.scrollWidth / 2 : 0;
    const nextOffset = dragStartOffset + delta * 1.2;
    setOffset(nextOffset > 0 ? 0 : nextOffset < -halfWidth ? -halfWidth : nextOffset);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  return (
    <section className={styles.featured} aria-labelledby="featured-title">
      <div className={styles.featured__inner}>
        <div className={styles.featured__header}>
          <div className={styles['featured__title-area']}>
            <span className={styles.featured__label}>Curated Pieces</span>
            <h2 id="featured-title" className={styles.featured__title}>
              Featured Collections
            </h2>
          </div>

          <div className={styles.featured__controls} aria-label="Carousel controls">
            <button type="button" className={styles.featured__button} onClick={() => moveTrack(1)} aria-label="Previous products">
              ←
            </button>
            <button type="button" className={styles.featured__button} onClick={() => moveTrack(-1)} aria-label="Next products">
              →
            </button>
          </div>
        </div>

        <div
          className={styles.featured__rail}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerUp}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            ref={trackRef}
            className={styles.featured__track}
            style={{ transform: `translate3d(${offset}px, 0, 0)` }}
          >
            {visibleItems.map((item, index) => (
              <Link
                key={`${item.slug}-${index}`}
                href={`/collections/${item.slug}`}
                className={styles.card}
              >
                <div className={styles['card__image-wrapper']}>
                  <img src={item.image} alt={item.title} className={styles.card__image} loading="lazy" />
                </div>
                <div className={styles.card__content}>
                  <span className={styles.card__category}>{item.category}</span>
                  <h3 className={styles.card__name}>{item.title}</h3>
                  <div className={styles.card__footer}>
                    <span className={styles.card__desc}>{item.material}</span>
                    <span className={styles.card__link}>Explore →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
