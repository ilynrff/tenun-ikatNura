'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CTABanner from '@/components/layout/CTABanner';
import ScrollReveal from '@/components/ui/ScrollReveal';
import collectionsData from '@/data/collections.json';
import categoriesData from '@/data/categories.json';
import styles from './CollectionsPage.module.css';
import Link from 'next/link';

export default function CollectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';
  const [visibleCount, setVisibleCount] = useState(6);

  // Reset pagination on category change
  useEffect(() => {
    setVisibleCount(6);
  }, [activeCategory]);

  const handleCategorySelect = (categorySlug) => {
    if (categorySlug === 'all') {
      router.push('/collections');
    } else {
      router.push(`/collections?category=${categorySlug}`);
    }
  };

  const filteredPieces = activeCategory === 'all'
    ? collectionsData
    : collectionsData.filter(item => item.category === activeCategory);

  const visiblePieces = filteredPieces.slice(0, visibleCount);

  return (
    <>
      <Navbar />
      <main className={styles.collectionsPage}>
        {/* Editorial Hero */}
        <section className={styles.hero}>
          <ScrollReveal>
            <div className={styles.hero__inner}>
              <span className={styles.hero__label}>Katalog</span>
              <h1 className={styles.hero__title}>Collections</h1>
              <p className={styles.hero__desc}>
                Discover timeless pieces inspired by Indonesian heritage and crafted for modern living.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Luxury Tab Navigation */}
        <nav className={styles.filterNav} aria-label="Filter by category">
          <div className={styles.filterNav__inner}>
            <button
              onClick={() => handleCategorySelect('all')}
              className={`${styles.filterNav__tab} ${activeCategory === 'all' ? styles['filterNav__tab--active'] : ''}`}
            >
              All Pieces
            </button>
            {categoriesData.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`${styles.filterNav__tab} ${activeCategory === cat.slug ? styles['filterNav__tab--active'] : ''}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Introduction */}
        <section className={styles.intro}>
          <ScrollReveal>
            <p className={styles.intro__text}>
              &ldquo;Every collection is designed to celebrate Indonesian craftsmanship while embracing contemporary fashion.&rdquo;
            </p>
          </ScrollReveal>
        </section>

        {/* Grid Catalog */}
        <section className={styles.catalogSection}>
          <div className="container">
            {filteredPieces.length === 0 ? (
              <div className={styles.empty}>No pieces found in this collection.</div>
            ) : (
              <>
                <div className={styles.grid}>
                  {visiblePieces.map((item, index) => (
                    <ScrollReveal key={item.id} delay={Math.min((index % 3) + 1, 3)}>
                      <Link href={`/collections/${item.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                        <div style={{
                          position: 'relative',
                          aspectRatio: '4/5',
                          overflow: 'hidden',
                          marginBottom: 'var(--space-lg)',
                          backgroundColor: 'var(--cream)'
                        }}>
                          <img
                            src={item.images[0]}
                            alt={`${item.name} - ${item.categoryLabel}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform var(--duration-slow) var(--ease-out)'
                            }}
                            className="img-hover-zoom"
                          />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <h3 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'var(--text-xl)',
                            color: 'var(--dark-brown)',
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                          }}>{item.name}</h3>
                          <span style={{
                            fontFamily: 'var(--font-accent)',
                            fontSize: 'var(--text-xs)',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: 'var(--gold-muted)'
                          }}>{item.categoryLabel}</span>
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>

                {/* Load More Button */}
                {filteredPieces.length > visibleCount && (
                  <ScrollReveal>
                    <div className={styles.loadMoreContainer}>
                      <button
                        onClick={() => setVisibleCount(prev => prev + 6)}
                        className="btn btn--secondary"
                      >
                        Load More
                      </button>
                    </div>
                  </ScrollReveal>
                )}
              </>
            )}
          </div>
        </section>

        <CTABanner
          title="Interested in Our Collection?"
          subtitle="Let's find the perfect piece for your special occasion."
        />
      </main>
      <Footer />
    </>
  );
}
