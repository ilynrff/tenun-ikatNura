'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CTABanner from '@/components/layout/CTABanner';
import ScrollReveal from '@/components/ui/ScrollReveal';
import ProductModal from './ProductModal';
import { useWishlist } from '@/context/WishlistContext';
import collectionsData from '@/data/collections.json';
import categoriesData from '@/data/categories.json';
import styles from './CollectionsPage.module.css';

export default function CollectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const { isInWishlist, toggleWishlist } = useWishlist();

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(12);
  }, [activeCategory, searchQuery]);

  const handleCategorySelect = (categorySlug) => {
    if (categorySlug === 'all') {
      router.push('/collections', { scroll: false });
    } else {
      router.push(`/collections?category=${categorySlug}`, { scroll: false });
    }
  };

  // Filter products by category and search query
  const filteredPieces = useMemo(() => {
    return collectionsData.filter((item) => {
      // Category match
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;

      // Search match
      if (!matchesCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const nameMatch = item.name?.toLowerCase().includes(q);
      const skuMatch = item.sku?.toLowerCase().includes(q);
      const catMatch = item.categoryLabel?.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      const matMatch = item.material?.type?.toLowerCase().includes(q);

      return nameMatch || skuMatch || catMatch || descMatch || matMatch;
    });
  }, [activeCategory, searchQuery]);

  const visiblePieces = filteredPieces.slice(0, visibleCount);

  return (
    <>
      <Navbar />
      <main className={styles.collectionsPage}>
        {/* Header / Intro Section */}
        <section className={styles.hero}>
          <ScrollReveal>
            <div className={styles.hero__inner}>
              <span className={styles.hero__label}>Etalase Karya Tenun</span>
              <h1 className={styles.hero__title}>Koleksi</h1>
              <div className={styles.hero__divider} />
              <p className={styles.hero__desc}>
                Temukan pilihan busana tenun yang memadukan warisan Nusantara dengan siluet modern.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Search & Category Filter Section */}
        <section className={styles.controlSection}>
          <div className={styles.controlContainer}>
            {/* Search Bar */}
            <div className={styles.searchWrapper}>
              <div className={styles.searchBox}>
                <svg
                  className={styles.searchIcon}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk atau koleksi..."
                  className={styles.searchInput}
                  aria-label="Cari produk atau koleksi"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className={styles.clearBtn}
                    aria-label="Hapus pencarian"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal Scrollable Category Chips */}
            <nav className={styles.categoryNav} aria-label="Kategori Produk">
              <div className={styles.categoryTrack}>
                {categoriesData.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`${styles.categoryChip} ${
                        isActive ? styles['categoryChip--active'] : ''
                      }`}
                      aria-pressed={isActive}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </section>

        {/* Catalog Grid Section */}
        <section className={styles.catalogSection}>
          <div className={styles.catalogContainer}>
            {filteredPieces.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3 className={styles.emptyTitle}>Koleksi Tidak Ditemukan</h3>
                <p className={styles.emptyDesc}>
                  {searchQuery
                    ? `Tidak ada hasil untuk pencarian "${searchQuery}". Silakan coba kata kunci lain.`
                    : 'Belum ada produk dalam kategori yang dipilih saat ini.'}
                </p>
                {(searchQuery || activeCategory !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      handleCategorySelect('all');
                    }}
                    className={styles.resetBtn}
                  >
                    Lihat Semua Koleksi
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {visiblePieces.map((item, index) => {
                    const isFavorited = isInWishlist(item.id);
                    const isOutOfStock = item.stock === 0;

                    return (
                      <ScrollReveal
                        key={item.id || item.sku}
                        delay={Math.min((index % 4) + 1, 3)}
                      >
                        <article className={styles.card}>
                          {/* Image Container with Link */}
                          <div className={styles.card__imageWrapper}>
                            <Link
                              href={`/collections/${item.slug}`}
                              className={styles.card__imageLink}
                              aria-label={`Lihat detail ${item.name}`}
                            >
                              <img
                                src={item.images ? item.images[0] : '/images/hero/hero-main.jpg'}
                                alt={`${item.name} - ${item.categoryLabel}`}
                                className={styles.card__image}
                                loading="lazy"
                              />
                            </Link>

                            {/* Stock / Out of Stock Badge */}
                            {isOutOfStock ? (
                              <span className={styles.card__stockBadgeOut}>Habis</span>
                            ) : item.stock && item.stock <= 3 ? (
                              <span className={styles.card__stockBadgeLow}>Sisa {item.stock}</span>
                            ) : null}

                            {/* Wishlist Heart Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(item.id);
                              }}
                              className={`${styles.card__wishlistBtn} ${
                                isFavorited ? styles['card__wishlistBtn--active'] : ''
                              }`}
                              aria-label={
                                isFavorited
                                  ? `Hapus ${item.name} dari favorit`
                                  : `Tambahkan ${item.name} ke favorit`
                              }
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill={isFavorited ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                            </button>

                            {/* Desktop Quick Preview Button */}
                            <button
                              type="button"
                              className={styles.card__quickViewBtn}
                              onClick={() => setSelectedProduct(item)}
                              aria-label={`Pratinjau cepat ${item.name}`}
                            >
                              Pratinjau Cepat
                            </button>
                          </div>

                          {/* Card Meta Info */}
                          <div className={styles.card__info}>
                            <div className={styles.card__categoryRow}>
                              <span className={styles.card__category}>
                                {item.categoryLabel}
                              </span>
                            </div>

                            <h2 className={styles.card__name}>
                              <Link href={`/collections/${item.slug}`} className={styles.card__nameLink}>
                                {item.name}
                              </Link>
                            </h2>

                            <div className={styles.card__footer}>
                              <span className={styles.card__price}>
                                {item.price || 'Sesuai Pesanan'}
                              </span>
                            </div>
                          </div>
                        </article>
                      </ScrollReveal>
                    );
                  })}
                </div>

                {/* Load More Button */}
                {filteredPieces.length > visibleCount && (
                  <ScrollReveal>
                    <div className={styles.loadMoreContainer}>
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 8)}
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
          title="Ingin Pesanan Khusus atau Konsultasi?"
          subtitle="Hubungi tim artisan Tenun Ikat Nura untuk pemesanan seragam, busana pesta, maupun sarimbit tenun custom."
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
