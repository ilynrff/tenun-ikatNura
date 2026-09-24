'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './FeaturedCollection.module.css';

const collections = [
  {
    slug: 'nusa-indah-outer',
    title: 'Nusa Indah Outer',
    category: 'Outerwear Tenun',
    material: 'Tenun Ikat NTT & Sutra Alam',
    image: '/images/collections/nusa-indah-1.jpg',
  },
  {
    slug: 'ratna-mutumanikam-dress',
    title: 'Ratna Dress',
    category: 'Gaun Tenun',
    material: 'Tenun Ikat Jepara & Rayon Premium',
    image: '/images/collections/ratna-dress-1.jpg',
  },
  {
    slug: 'majapahit-heritage-blazer',
    title: 'Majapahit Blazer',
    category: 'Blazer Berstruktur',
    material: 'Tenun Ikat Troso & Katun Halus',
    image: '/images/collections/majapahit-blazer-1.jpg',
  },
  {
    slug: 'candramawa-silk-scarf',
    title: 'Candramawa Scarf',
    category: 'Aksesoris Wastra',
    material: '100% Sutra Tenun Asli',
    image: '/images/collections/candramawa-scarf-1.jpg',
  },
  {
    slug: 'surya-kencana-shirt',
    title: 'Surya Kencana Shirt',
    category: 'Kemeja Pria',
    material: 'Tenun Ikat Toraja & Katun Halus',
    image: '/images/collections/surya-shirt-1.jpg',
  },
  {
    slug: 'swarna-bumi-kimono',
    title: 'Swarna Bumi Kimono',
    category: 'Kimono Tenun',
    material: 'Tenun Ikat Bali & Linen Natural',
    image: '/images/collections/swarna-kimono-1.jpg',
  },
];

export default function FeaturedCollection() {
  const trackRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const lastX = useRef(0);
  const singleSetWidthRef = useRef(0);

  // Triple set for seamless infinite loop buffer
  const visibleItems = [...collections, ...collections, ...collections];

  // Calculate single set width dynamically
  const updateMetrics = useCallback(() => {
    if (trackRef.current) {
      // Total width divided by 3 sets
      singleSetWidthRef.current = trackRef.current.scrollWidth / 3;
    }
  }, []);

  useEffect(() => {
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [updateMetrics]);

  // Smooth continuous auto-scroll using requestAnimationFrame
  useEffect(() => {
    let rafId;
    let lastTime = performance.now();

    const tick = (currentTime) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (!dragging && !isHovered) {
        const speed = 0.045; // Smooth slow editorial scroll speed (px/ms)
        const move = delta * speed;

        setOffset((prev) => {
          const setWidth = singleSetWidthRef.current || (trackRef.current ? trackRef.current.scrollWidth / 3 : 0);
          if (setWidth <= 0) return prev;
          
          let next = prev - move;
          // When offset moves past one full set to the left, wrap seamlessly
          if (next <= -setWidth * 2) {
            next += setWidth;
          }
          return next;
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [dragging, isHovered]);

  const moveTrack = (direction) => {
    const step = 320;
    setOffset((prev) => {
      const setWidth = singleSetWidthRef.current || (trackRef.current ? trackRef.current.scrollWidth / 3 : 0);
      if (setWidth <= 0) return prev;

      let next = prev + direction * step;
      if (next > 0) {
        next -= setWidth;
      } else if (next <= -setWidth * 2) {
        next += setWidth;
      }
      return next;
    });
  };

  const handlePointerDown = (event) => {
    setDragging(true);
    dragStartX.current = event.clientX;
    dragStartOffset.current = offset;
    lastX.current = event.clientX;
    updateMetrics();
  };

  const handlePointerMove = (event) => {
    if (!dragging) return;
    const delta = event.clientX - dragStartX.current;
    lastX.current = event.clientX;

    const setWidth = singleSetWidthRef.current || (trackRef.current ? trackRef.current.scrollWidth / 3 : 0);
    if (setWidth <= 0) return;

    let nextOffset = dragStartOffset.current + delta;
    if (nextOffset > 0) {
      nextOffset -= setWidth;
      dragStartOffset.current -= setWidth;
    } else if (nextOffset <= -setWidth * 2) {
      nextOffset += setWidth;
      dragStartOffset.current += setWidth;
    }

    setOffset(nextOffset);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  return (
    <section className={styles.featured} aria-labelledby="featured-title">
      <div className={styles.featured__inner}>
        <div className={styles.featured__header}>
          <div className={styles['featured__title-area']}>
            <span className={styles.featured__label}>PILIHAN TERPILIH</span>
            <h2 id="featured-title" className={styles.featured__title}>
              Koleksi Pilihan
            </h2>
          </div>

          <div className={styles.featured__controls} aria-label="Kontrol carousel">
            <button
              type="button"
              className={styles.featured__button}
              onClick={() => moveTrack(1)}
              aria-label="Produk sebelumnya"
            >
              ←
            </button>
            <button
              type="button"
              className={styles.featured__button}
              onClick={() => moveTrack(-1)}
              aria-label="Produk berikutnya"
            >
              →
            </button>
          </div>
        </div>

        <div
          className={styles.featured__rail}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            handlePointerUp();
            setIsHovered(false);
          }}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => setIsHovered(true)}
        >
          <div
            ref={trackRef}
            className={styles.featured__track}
            style={{
              transform: `translate3d(${offset}px, 0, 0)`,
              cursor: dragging ? 'grabbing' : 'grab',
            }}
          >
            {visibleItems.map((item, index) => (
              <Link
                key={`${item.slug}-${index}`}
                href={`/collections/${item.slug}`}
                className={styles.card}
                draggable={false}
              >
                <div className={styles['card__image-wrapper']}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.card__image}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
                <div className={styles.card__content}>
                  <span className={styles.card__category}>{item.category}</span>
                  <h3 className={styles.card__name}>{item.title}</h3>
                  <div className={styles.card__footer}>
                    <span className={styles.card__desc}>{item.material}</span>
                    <span className={styles.card__link}>Jelajahi →</span>
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
