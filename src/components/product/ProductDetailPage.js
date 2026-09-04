'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CTABanner from '@/components/layout/CTABanner';
import ScrollReveal from '@/components/ui/ScrollReveal';
import siteData from '@/data/site.json';
import collectionsData from '@/data/collections.json';
import styles from './ProductDetailPage.module.css';

export default function ProductDetailPage({ slug }) {
  const piece = collectionsData.find(item => item.slug === slug);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    piece && piece.sizes && piece.sizes.length > 0 ? piece.sizes[0] : 'S'
  );

  if (!piece) {
    return (
      <>
        <Navbar />
        <main className={styles.detailPage}>
          <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)' }}>Piece Not Found</h1>
            <p>Koleksi yang Anda cari tidak tersedia.</p>
            <Link href="/collections" className="btn btn--secondary" style={{ marginTop: '2rem' }}>
              Back to Collections
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Auto template message for WhatsApp containing Product Name & SKU
  const waNumber = siteData.contact.whatsapp || '6281234567890';
  const waMessage = `Halo Admin Tenun Ikat Nura,

Saya tertarik dan ingin memesan / menanyakan produk berikut:
📌 *Nama Produk*: ${piece.name}
🏷️ *Kode Produk*: ${piece.sku || 'NURA-ITEM'}
📏 *Ukuran Terpilih*: ${selectedSize}
🧵 *Material*: ${piece.material?.type || piece.categoryLabel}
💰 *Harga*: ${piece.price || 'Custom Order'}

Apakah produk ini masih tersedia atau bisa di-custom order? Terima kasih!`;

  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  // Related pieces
  const relatedPieces = collectionsData
    .filter(item => item.id !== piece.id)
    .sort((a, b) => (a.category === piece.category ? -1 : 1))
    .slice(0, 4);

  // Care instructions mappings
  const careInstructions = {
    handwash: { icon: '🧺', text: 'Hand Wash Only' },
    'no-bleach': { icon: '🚫', text: 'No Bleach' },
    'iron-low': { icon: '💨', text: 'Iron Low Heat' },
    'dry-natural': { icon: '🍃', text: 'Dry Naturally in Shade' },
  };

  return (
    <>
      <Navbar />
      <main className={styles.detailPage}>
        <section className={styles.productSection}>
          <div className="container">
            <div className={styles.productLayout}>
              {/* Product Gallery */}
              <ScrollReveal>
                <div className={styles.gallery}>
                  <div className={styles.gallery__main}>
                    <img
                      src={piece.images[activeImageIndex]}
                      alt={`${piece.name} - View ${activeImageIndex + 1}`}
                    />
                    <span className={styles.skuBadge}>KODE: {piece.sku}</span>
                  </div>
                  {piece.images.length > 1 && (
                    <div className={styles.gallery__thumbs}>
                      {piece.images.map((img, idx) => (
                        <button
                          key={idx}
                          className={`${styles.gallery__thumb} ${
                            activeImageIndex === idx ? styles['gallery__thumb--active'] : ''
                          }`}
                          onClick={() => setActiveImageIndex(idx)}
                        >
                          <img src={img} alt={`Thumbnail ${idx + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollReveal>

              {/* Product Information */}
              <ScrollReveal delay={2}>
                <div className={styles.info}>
                  <div>
                    <span className={styles.info__category}>{piece.categoryLabel}</span>
                    <h1 className={styles.info__name}>{piece.name}</h1>
                    
                    {/* SKU Highlight Banner */}
                    <div className={styles.skuBanner}>
                      <span>KODE PRODUK:</span>
                      <strong>{piece.sku}</strong>
                    </div>

                    <p className={styles.info__tagline}>{piece.tagline}</p>
                    <p className={styles.info__price}>{piece.price || 'Custom Order'}</p>
                  </div>

                  <p className={styles.info__desc}>{piece.description}</p>

                  <div className={styles.info__divider} />

                  {/* Piece Details */}
                  <div className={styles.info__meta}>
                    <span className={styles['info__meta-label']}>Material:</span>
                    <span className={styles['info__meta-value']}>{piece.material?.composition} ({piece.material?.type})</span>

                    <span className={styles['info__meta-label']}>Ukuran Tersedia:</span>
                    <div className={styles.sizeSelector}>
                      {piece.sizes.map((s) => (
                        <button
                          key={s}
                          className={`${styles.sizeBtn} ${selectedSize === s ? styles.sizeBtnActive : ''}`}
                          onClick={() => setSelectedSize(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.info__divider} />

                  {/* Action Buttons */}
                  <div className={styles.info__actions}>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--whatsapp"
                      style={{ width: '100%', justifyContent: 'center', height: '52px' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.999 1.59-1.048 3.834 3.792-.996z"/>
                      </svg>
                      Pesan via WhatsApp Admin
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Piece Story / Craftsmanship Detail */}
        <section className="section section--beige">
          <div className="container container--narrow">
            <ScrollReveal>
              <div className={styles.detailBlock}>
                <h2 className={styles.detailBlock__title}>Cerita &amp; Filosofi di Balik Karya</h2>
                <p style={{ fontStyle: 'italic', fontSize: 'var(--text-md)', color: 'var(--warm-brown)', lineHeight: '1.8' }}>
                  {piece.story}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Care Instructions & Size Guide */}
        <section className="section">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3xl)' }} className={styles.productLayout}>
              {/* Size Guide */}
              <ScrollReveal>
                <h3 className={styles.detailBlock__title}>Panduan Ukuran (cm)</h3>
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
                      <td>S</td>
                      <td>90-94</td>
                      <td>72-76</td>
                      <td>65</td>
                    </tr>
                    <tr>
                      <td>M</td>
                      <td>94-98</td>
                      <td>76-80</td>
                      <td>67</td>
                    </tr>
                    <tr>
                      <td>L</td>
                      <td>98-102</td>
                      <td>80-84</td>
                      <td>69</td>
                    </tr>
                    <tr>
                      <td>XL</td>
                      <td>102-106</td>
                      <td>84-88</td>
                      <td>70</td>
                    </tr>
                  </tbody>
                </table>
              </ScrollReveal>

              {/* Care Instructions */}
              <ScrollReveal delay={2}>
                <h3 className={styles.detailBlock__title}>Petunjuk Perawatan</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--warm-brown)', marginBottom: '1rem' }}>
                  Pakaian tenun ikat memerlukan perawatan khusus untuk menjaga serat kain dan keindahan warnanya yang alami.
                </p>
                <div className={styles.careGrid}>
                  {piece.care?.map(item => {
                    const care = careInstructions[item];
                    return care ? (
                      <div key={item} className={styles.careItem}>
                        <span className={styles.careItem__icon}>{care.icon}</span>
                        <span className={styles.careItem__text}>{care.text}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Related Pieces */}
        <section className={styles.related}>
          <div className="container">
            <h2 className={styles.related__title}>Koleksi Terkait</h2>
            <div className={styles.related__grid}>
              {relatedPieces.map((item, index) => (
                <ScrollReveal key={item.id} delay={index + 1}>
                  <Link href={`/collections/${item.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{
                      aspectRatio: '4/5',
                      overflow: 'hidden',
                      marginBottom: 'var(--space-md)',
                      backgroundColor: 'var(--cream)',
                      position: 'relative'
                    }}>
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: 'rgba(26,18,12,0.8)',
                        color: '#D4AF37',
                        fontSize: '10px',
                        padding: '3px 8px',
                        borderRadius: '2px'
                      }}>
                        {item.sku}
                      </span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'var(--text-lg)',
                        color: 'var(--dark-brown)',
                        fontWeight: '500'
                      }}>{item.name}</h4>
                      <span style={{
                        fontFamily: 'var(--font-accent)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--gold-muted)'
                      }}>{item.categoryLabel}</span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <CTABanner
          title="Tertarik dengan Mahakarya Ini?"
          subtitle="Hubungi admin kami untuk custom ukuran atau pemesanan langsung."
        />
      </main>
      <Footer />
    </>
  );
}
