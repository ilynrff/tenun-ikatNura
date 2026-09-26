'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CTABanner from '@/components/layout/CTABanner';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import siteData from '@/data/site.json';
import collectionsData from '@/data/collections.json';
import styles from './ProductDetailPage.module.css';

export default function ProductDetailPage({ slug }) {
  const piece = collectionsData.find((item) => item.slug === slug);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    piece && piece.sizes && piece.sizes.length > 0 ? piece.sizes[0] : 'S'
  );
  const [selectedVariant, setSelectedVariant] = useState(
    piece && piece.variants && piece.variants.length > 0 ? piece.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('pengiriman');
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Gallery swipe / touch handling for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const mainCtaRef = useRef(null);

  // Sticky bottom bar observer for mobile
  useEffect(() => {
    const handleScroll = () => {
      if (mainCtaRef.current) {
        const rect = mainCtaRef.current.getBoundingClientRect();
        // Show sticky bar when user scrolls past main action buttons
        if (rect.bottom < 0) {
          setShowStickyBar(true);
        } else {
          setShowStickyBar(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!piece) {
    return (
      <>
        <Navbar />
        <main className={styles.detailPage}>
          <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--dark-brown)' }}>
              Koleksi Tidak Ditemukan
            </h1>
            <p style={{ color: 'var(--warm-brown)', marginTop: '1rem' }}>
              Maaf, busana tenun yang Anda cari tidak tersedia atau telah dipindahkan.
            </p>
            <Link
              href="/collections"
              className="btn btn--secondary"
              style={{ marginTop: '2rem', display: 'inline-block' }}
            >
              Kembali ke Koleksi
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isFavorited = isInWishlist(piece.id);
  const maxStock = piece.stock !== undefined ? piece.stock : 5;
  const isOutOfStock = maxStock === 0;

  const currentPrice = selectedVariant ? selectedVariant.price : piece.price;

  // WhatsApp template message
  const waNumber = siteData.contact.whatsapp || '6281252783496';
  const waMessage = `Halo Admin Tenun Ikat Nura,

Saya tertarik dengan karya busana tenun berikut:
📌 *Nama Produk*: ${piece.name}
🏷️ *Kode SKU*: ${piece.sku || 'NURA-ITEM'}
📏 *Ukuran*: ${selectedSize}
${selectedVariant ? `✨ *Varian*: ${selectedVariant.name}\n` : ''}💰 *Harga*: ${currentPrice || 'Sesuai Pesanan'}
🔢 *Jumlah*: ${quantity}

Apakah produk ini masih tersedia untuk dipesan? Terima kasih!`;

  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  // Cart actions
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const itemToAdd = {
      ...piece,
      price: currentPrice,
    };
    addToCart(itemToAdd, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
  };

  // Touch Swipe for mobile gallery
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeImageIndex < piece.images.length - 1) {
      setActiveImageIndex((prev) => prev + 1);
    }
    if (isRightSwipe && activeImageIndex > 0) {
      setActiveImageIndex((prev) => prev - 1);
    }
  };

  // Related pieces (same category first, excluding current)
  const relatedPieces = collectionsData
    .filter((item) => item.id !== piece.id)
    .sort((a, b) => (a.category === piece.category ? -1 : 1))
    .slice(0, 4);

  // Care instructions mappings
  const careInstructions = {
    handwash: { icon: '🧺', text: 'Cuci Tangan Saja (Hindari Mesin Cuci)' },
    'no-bleach': { icon: '🚫', text: 'Tanpa Pemutih Klorin' },
    'iron-low': { icon: '💨', text: 'Setrika Suhu Rendah / Dilapisi Kain' },
    'dry-natural': { icon: '🍃', text: 'Jemur di Tempat Teduh / Angin-anginkan' },
  };

  return (
    <>
      <Navbar />
      <main className={styles.detailPage}>
        {/* Breadcrumb Navigation */}
        <div className={styles.breadcrumbSection}>
          <div className={styles.container}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/" className={styles.breadcrumbLink}>
                Beranda
              </Link>
              <span className={styles.breadcrumbDivider}>/</span>
              <Link href="/collections" className={styles.breadcrumbLink}>
                Koleksi
              </Link>
              <span className={styles.breadcrumbDivider}>/</span>
              <Link
                href={`/collections?category=${piece.category}`}
                className={styles.breadcrumbLink}
              >
                {piece.categoryLabel}
              </Link>
              <span className={styles.breadcrumbDivider}>/</span>
              <span className={styles.breadcrumbCurrent}>{piece.name}</span>
            </nav>
          </div>
        </div>

        {/* Main Product Presentation */}
        <section className={styles.productSection}>
          <div className={styles.container}>
            <div className={styles.productLayout}>
              {/* Product Gallery (Swipeable on Mobile) */}
              <ScrollReveal>
                <div className={styles.gallery}>
                  <div
                    className={styles.gallery__main}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      src={piece.images[activeImageIndex] || '/images/hero/hero-main.jpg'}
                      alt={`${piece.name} - Tampilan ${activeImageIndex + 1}`}
                      className={styles.gallery__mainImage}
                    />
                    
                    {/* SKU Badge */}
                    <span className={styles.skuBadge}>KODE: {piece.sku}</span>

                    {/* Stock Status Badge */}
                    {isOutOfStock ? (
                      <span className={styles.stockBadgeOut}>Stok Habis</span>
                    ) : maxStock <= 3 ? (
                      <span className={styles.stockBadgeLow}>Tersisa {maxStock} Buah</span>
                    ) : null}

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(piece.id)}
                      className={`${styles.wishlistBtn} ${
                        isFavorited ? styles['wishlistBtn--active'] : ''
                      }`}
                      aria-label={
                        isFavorited
                          ? `Hapus ${piece.name} dari favorit`
                          : `Simpan ${piece.name} ke favorit`
                      }
                    >
                      <svg
                        width="20"
                        height="20"
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

                    {/* Mobile Swipe Indicators (Dots) */}
                    {piece.images.length > 1 && (
                      <div className={styles.mobileDots}>
                        {piece.images.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            className={`${styles.dot} ${
                              activeImageIndex === idx ? styles['dot--active'] : ''
                            }`}
                            aria-label={`Lihat foto ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Desktop Thumbnail Selector */}
                  {piece.images.length > 1 && (
                    <div className={styles.gallery__thumbs}>
                      {piece.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`${styles.gallery__thumb} ${
                            activeImageIndex === idx ? styles['gallery__thumb--active'] : ''
                          }`}
                          onClick={() => setActiveImageIndex(idx)}
                          aria-label={`Pilih foto ${idx + 1}`}
                        >
                          <img src={img} alt={`${piece.name} thumbnail ${idx + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Product Information & Purchase Actions */}
              <ScrollReveal delay={2}>
                <div className={styles.info}>
                  {/* Category & Title */}
                  <div className={styles.info__header}>
                    <span className={styles.info__category}>{piece.categoryLabel}</span>
                    <h1 className={styles.info__name}>{piece.name}</h1>
                    <p className={styles.info__tagline}>{piece.tagline}</p>
                    
                    {/* Price & Stock Indicator */}
                    <div className={styles.info__priceRow}>
                      <span className={styles.info__price}>
                        {currentPrice || 'Sesuai Pesanan'}
                      </span>
                      <span
                        className={`${styles.info__stockStatus} ${
                          isOutOfStock ? styles['info__stockStatus--out'] : styles['info__stockStatus--in']
                        }`}
                      >
                        {isOutOfStock ? '● Stok Habis' : '● Tersedia'}
                      </span>
                    </div>
                  </div>

                  <p className={styles.info__desc}>{piece.description}</p>

                  <div className={styles.info__divider} />

                  {/* Variant Selector (if product has variants) */}
                  {piece.variants && piece.variants.length > 0 && (
                    <div className={styles.optionSection}>
                      <label className={styles.optionLabel}>
                        Pilihan Varian: <strong>{selectedVariant ? selectedVariant.name : 'Standar'}</strong>
                      </label>
                      <div className={styles.variantGrid}>
                        {piece.variants.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            className={`${styles.variantBtn} ${
                              selectedVariant && selectedVariant.id === v.id
                                ? styles['variantBtn--active']
                                : ''
                            }`}
                            onClick={() => setSelectedVariant(v)}
                          >
                            <span>{v.name}</span>
                            <small>{v.price}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selector */}
                  {piece.sizes && piece.sizes.length > 0 && (
                    <div className={styles.optionSection}>
                      <div className={styles.sizeHeader}>
                        <label className={styles.optionLabel}>
                          Pilih Ukuran: <strong>{selectedSize}</strong>
                        </label>
                        <a href="#panduan-ukuran" className={styles.sizeGuideLink}>
                          Panduan Ukuran &darr;
                        </a>
                      </div>
                      <div className={styles.sizeGrid}>
                        {piece.sizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`${styles.sizeBtn} ${
                              selectedSize === s ? styles['sizeBtn--active'] : ''
                            }`}
                            onClick={() => setSelectedSize(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  {!isOutOfStock && (
                    <div className={styles.quantitySection}>
                      <label className={styles.optionLabel}>Jumlah:</label>
                      <div className={styles.quantityBox}>
                        <button
                          type="button"
                          className={styles.quantityBtn}
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          disabled={quantity <= 1}
                          aria-label="Kurangi jumlah"
                        >
                          −
                        </button>
                        <span className={styles.quantityValue}>{quantity}</span>
                        <button
                          type="button"
                          className={styles.quantityBtn}
                          onClick={() => setQuantity((prev) => Math.min(maxStock, prev + 1))}
                          disabled={quantity >= maxStock}
                          aria-label="Tambah jumlah"
                        >
                          +
                        </button>
                      </div>
                      <span className={styles.maxStockHint}>(Maks. {maxStock} pcs)</span>
                    </div>
                  )}

                  {/* Primary & Secondary Action Buttons */}
                  <div className={styles.actionBlock} ref={mainCtaRef}>
                    <div className={styles.mainButtonsRow}>
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`${styles.addToCartBtn} ${
                          isOutOfStock ? styles['btn--disabled'] : ''
                        }`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        <span>{isOutOfStock ? 'Produk Habis' : 'Tambah ke Keranjang'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={isOutOfStock}
                        className={`${styles.buyNowBtn} ${
                          isOutOfStock ? styles['btn--disabled'] : ''
                        }`}
                      >
                        Beli Sekarang
                      </button>
                    </div>

                    {/* WhatsApp Direct Chat Button */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappBtn}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.999 1.59-1.048 3.834 3.792-.996z" />
                      </svg>
                      <span>Chat via WhatsApp Admin</span>
                    </a>
                  </div>

                  {/* Information Accordion / Tabs: Pengiriman, Pembayaran, Keaslian */}
                  <div className={styles.infoTabsSection}>
                    <div className={styles.tabNav}>
                      <button
                        type="button"
                        className={`${styles.tabBtn} ${
                          activeTab === 'pengiriman' ? styles['tabBtn--active'] : ''
                        }`}
                        onClick={() => setActiveTab('pengiriman')}
                      >
                        Pengiriman
                      </button>
                      <button
                        type="button"
                        className={`${styles.tabBtn} ${
                          activeTab === 'pembayaran' ? styles['tabBtn--active'] : ''
                        }`}
                        onClick={() => setActiveTab('pembayaran')}
                      >
                        Pembayaran
                      </button>
                      <button
                        type="button"
                        className={`${styles.tabBtn} ${
                          activeTab === 'keaslian' ? styles['tabBtn--active'] : ''
                        }`}
                        onClick={() => setActiveTab('keaslian')}
                      >
                        Jaminan Kualitas
                      </button>
                    </div>

                    <div className={styles.tabContent}>
                      {activeTab === 'pengiriman' && (
                        <div className={styles.tabPane}>
                          <div className={styles.infoRow}>
                            <span className={styles.infoIcon}>📦</span>
                            <div>
                              <strong>Estimasi Pengiriman:</strong>
                              <p>3–7 hari kerja setelah konfirmasi pesanan.</p>
                            </div>
                          </div>
                          <div className={styles.infoRow}>
                            <span className={styles.infoIcon}>📍</span>
                            <div>
                              <strong>Dikirim Dari:</strong>
                              <p>Jepara, Jawa Tengah (Sentra Tenun Troso).</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'pembayaran' && (
                        <div className={styles.tabPane}>
                          <div className={styles.infoRow}>
                            <span className={styles.infoIcon}>💳</span>
                            <div>
                              <strong>Metode Pembayaran:</strong>
                              <p>Transfer Bank Manual (BCA / Mandiri / BNI / BRI).</p>
                            </div>
                          </div>
                          <div className={styles.infoRow}>
                            <span className={styles.infoIcon}>💬</span>
                            <div>
                              <strong>Konfirmasi Pesanan:</strong>
                              <p>Konfirmasi bukti transfer dikirimkan melalui WhatsApp Admin resmi.</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'keaslian' && (
                        <div className={styles.tabPane}>
                          <div className={styles.infoRow}>
                            <span className={styles.infoIcon}>✨</span>
                            <div>
                              <strong>100% Tenun Otentik:</strong>
                              <p>Ditenun dengan tangan oleh para pengrajin lokal berpengalaman menggunakan bahan katun dan sutra pilihan.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Philosophy & Craftsmanship Section */}
        {piece.story && (
          <section className={styles.storySection}>
            <div className={styles.containerNarrow}>
              <ScrollReveal>
                <div className={styles.storyBlock}>
                  <span className={styles.storySubtitle}>Filosofi &amp; Proses Karya</span>
                  <h2 className={styles.storyTitle}>Cerita di Balik Mahakarya</h2>
                  <p className={styles.storyText}>{piece.story}</p>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Specifications, Size Guide & Care Instructions */}
        <section className={styles.specSection} id="panduan-ukuran">
          <div className={styles.container}>
            <div className={styles.specGrid}>
              {/* Size Guide */}
              <ScrollReveal>
                <div className={styles.specCard}>
                  <h3 className={styles.specCardTitle}>Panduan Ukuran (cm)</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.sizeTable}>
                      <thead>
                        <tr>
                          <th>Ukuran</th>
                          <th>Lingkar Dada</th>
                          <th>Lingkar Pinggang</th>
                          <th>Panjang Baju</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>S</strong></td>
                          <td>90 - 94</td>
                          <td>72 - 76</td>
                          <td>65</td>
                        </tr>
                        <tr>
                          <td><strong>M</strong></td>
                          <td>94 - 98</td>
                          <td>76 - 80</td>
                          <td>67</td>
                        </tr>
                        <tr>
                          <td><strong>L</strong></td>
                          <td>98 - 102</td>
                          <td>80 - 84</td>
                          <td>69</td>
                        </tr>
                        <tr>
                          <td><strong>XL</strong></td>
                          <td>102 - 106</td>
                          <td>84 - 88</td>
                          <td>70</td>
                        </tr>
                        <tr>
                          <td><strong>XXL</strong></td>
                          <td>106 - 112</td>
                          <td>88 - 94</td>
                          <td>72</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className={styles.specFootnote}>
                    *Melayani custom size untuk kebutuhan seragam atau ukuran khusus.
                  </p>
                </div>
              </ScrollReveal>

              {/* Care Instructions & Material */}
              <ScrollReveal delay={2}>
                <div className={styles.specCard}>
                  <h3 className={styles.specCardTitle}>Petunjuk Perawatan &amp; Material</h3>
                  
                  {piece.material && (
                    <div className={styles.materialDetails}>
                      <p><strong>Bahan Utama:</strong> {piece.material.type}</p>
                      <p><strong>Komposisi:</strong> {piece.material.composition}</p>
                      <p><strong>Karakter:</strong> {piece.material.texture}</p>
                    </div>
                  )}

                  <div className={styles.careList}>
                    {piece.care?.map((careKey) => {
                      const care = careInstructions[careKey];
                      return care ? (
                        <div key={careKey} className={styles.careItem}>
                          <span className={styles.careIcon}>{care.icon}</span>
                          <span className={styles.careText}>{care.text}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Related Pieces Grid */}
        <section className={styles.relatedSection}>
          <div className={styles.container}>
            <div className={styles.relatedHeader}>
              <span className={styles.relatedSubtitle}>Eksplorasi Lainnya</span>
              <h2 className={styles.relatedTitle}>Koleksi Terkait</h2>
            </div>

            <div className={styles.relatedGrid}>
              {relatedPieces.map((item, index) => (
                <ScrollReveal key={item.id} delay={index + 1}>
                  <article className={styles.relatedCard}>
                    <Link
                      href={`/collections/${item.slug}`}
                      className={styles.relatedImageLink}
                    >
                      <img
                        src={item.images ? item.images[0] : '/images/hero/hero-main.jpg'}
                        alt={item.name}
                        className={styles.relatedImage}
                        loading="lazy"
                      />
                    </Link>

                    <div className={styles.relatedInfo}>
                      <span className={styles.relatedCategory}>{item.categoryLabel}</span>
                      <h4 className={styles.relatedName}>
                        <Link href={`/collections/${item.slug}`} className={styles.relatedNameLink}>
                          {item.name}
                        </Link>
                      </h4>
                      <span className={styles.relatedPrice}>{item.price}</span>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <CTABanner
          title="Tertarik dengan Mahakarya Ini?"
          subtitle="Hubungi admin Tenun Ikat Nura untuk konsultasi custom ukuran, warna, maupun pemesanan sarimbit."
        />

        {/* Mobile Sticky Bottom CTA Bar */}
        {showStickyBar && (
          <div className={styles.stickyBar}>
            <div className={styles.stickyBarInner}>
              <div className={styles.stickyBarInfo}>
                <span className={styles.stickyBarName}>{piece.name}</span>
                <span className={styles.stickyBarPrice}>{currentPrice}</span>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={styles.stickyBarBtn}
              >
                {isOutOfStock ? 'Habis' : 'Tambah ke Keranjang'}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
