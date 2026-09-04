'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CTABanner from '@/components/layout/CTABanner';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ProductModal from './ProductModal';
import collectionsData from '@/data/collections.json';
import categoriesData from '@/data/categories.json';
import styles from './CollectionsPage.module.css';

export default function CollectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(9);

  // Reset pagination on category change
  useEffect(() => {
    setVisibleCount(9);
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
        {/* Luxury Editorial Katalog Hero */}
        <section className={styles.hero}>
          <ScrollReveal>
            <div className={styles.hero__inner}>
              <span className={styles.hero__label}>Katalog Karya Tenun</span>
              <h1 className={styles.hero__title}>Editorial Collections</h1>
              <div className={styles.hero__divider} />
              <p className={styles.hero__desc}>
                Jelajahi keindahan mahakarya tenun ikat otentik Nusantara. 
                Setiap helai kain ditenun secara terbatas dengan dedikasi pengrajin terampil untuk keanggunan gaya modern Anda.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Modern & Stylish Filter Navigation Bar */}
        <nav className={styles.filterNav} aria-label="Filter by category">
          <div className={styles.filterNav__inner}>
            {categoriesData.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`${styles.filterNav__tab} ${
                  activeCategory === cat.slug ? styles['filterNav__tab--active'] : ''
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </nav>

        {/* Catalog Grid Section */}
        <section className={styles.catalogSection}>
          <div className={styles.catalogContainer}>
            {filteredPieces.length === 0 ? (
              <div className={styles.empty}>
                <p>Tidak ada koleksi dalam kategori ini saat ini.</p>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {visiblePieces.map((item, index) => (
                    <ScrollReveal key={item.id || item.sku} delay={Math.min((index % 3) + 1, 3)}>
                      <div
                        className={styles.card}
                        onClick={() => setSelectedProduct(item)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Lihat detail ${item.name}`}
                      >
                        {/* Image & SKU Badge Container */}
                        <div className={styles.card__imageWrapper}>
                          <img
                            src={item.images ? item.images[0] : '/images/hero/hero-main.jpg'}
                            alt={`${item.name} - ${item.categoryLabel}`}
                            className={styles.card__image}
                            loading="lazy"
                          />
                          {/* SKU Badge */}
                          <span className={styles.card__skuBadge}>
                            {item.sku || 'NURA-ITEM'}
                          </span>
                          
                          {/* Quick View Overlay Button */}
                          <div className={styles.card__overlay}>
                            <button
                              className={styles.card__quickBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(item);
                              }}
                            >
                              Quick Preview &amp; Order &rarr;
                            </button>
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className={styles.card__info}>
                          <div className={styles.card__metaRow}>
                            <span className={styles.card__category}>{item.categoryLabel}</span>
                            <span className={styles.card__skuCode}>KODE: {item.sku}</span>
                          </div>
                          <h3 className={styles.card__name}>{item.name}</h3>
                          <p className={styles.card__material}>
                            {item.material?.type || item.tagline}
                          </p>
                          <div className={styles.card__footer}>
                            <span className={styles.card__price}>{item.price || 'Custom Order'}</span>
                            <span className={styles.card__actionLink}>Pesan &rarr;</span>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>

                {/* Load More Button */}
                {filteredPieces.length > visibleCount && (
                  <ScrollReveal>
                    <div className={styles.loadMoreContainer}>
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 6)}
                        className={styles.loadMoreBtn}
                      >
                        Tampilkan Lebih Banyak
                      </button>
                    </div>
                  </ScrollReveal>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <CTABanner
          title="Ingin Custom Order / Konsultasi?"
          subtitle="Hubungi tim artisan kami untuk pemesanan seragam, busana pesta, maupun sarimbit tenun custom."
        />
      </main>

      <Footer />

      {/* Quick Preview Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
