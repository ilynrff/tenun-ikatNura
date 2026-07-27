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

  // Get 4 related pieces of same category or general collections (excluding current)
  const relatedPieces = collectionsData
    .filter(item => item.id !== piece.id)
    .sort((a, b) => (a.category === piece.category ? -1 : 1))
    .slice(0, 4);

  // Care instructions mappings
  const careInstructions = {
    handwash: { icon: '🧺', text: 'Hand Wash' },
    'no-bleach': { icon: '🚫', text: 'No Bleach' },
    'iron-low': { icon: '💨', text: 'Iron Low' },
    'dry-natural': { icon: '🍃', text: 'Dry Naturally' },
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
                    <p className={styles.info__tagline}>{piece.tagline}</p>
                  </div>

                  <p className={styles.info__desc}>{piece.description}</p>

                  <div className={styles.info__divider} />

                  {/* Piece Details */}
                  <div className={styles.info__meta}>
                    <span className={styles['info__meta-label']}>Material:</span>
                    <span className={styles['info__meta-value']}>{piece.material.composition} ({piece.material.type})</span>

                    <span className={styles['info__meta-label']}>Sizes:</span>
                    <span className={styles['info__meta-value']}>{piece.sizes.join(', ')}</span>

                    {piece.colors && (
                      <>
                        <span className={styles['info__meta-label']}>Colors:</span>
                        <span className={styles['info__meta-value']}>{piece.colors.join(', ')}</span>
                      </>
                    )}
                  </div>

                  <div className={styles.info__divider} />

                  {/* Action Buttons */}
                  <div className={styles.info__actions}>
                    <a
                      href={`https://wa.me/${siteData.contact.whatsapp}?text=Halo,%20saya%20tertarik%20tanya%20detail%20koleksi%20"${piece.name}"`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--whatsapp"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Order via WhatsApp
                    </a>
                    <a
                      href={siteData.contact.shopeeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--shopee"
                    >
                      Buy on Shopee
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
                <h2 className={styles.detailBlock__title}>The Story behind the Piece</h2>
                <p style={{ fontStyle: 'italic', fontSize: 'var(--text-md)', color: 'var(--warm-brown)' }}>
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
                <h3 className={styles.detailBlock__title}>Size Guide (cm)</h3>
                <table className={styles.sizeTable}>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Chest</th>
                      <th>Waist</th>
                      <th>Length</th>
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
                <h3 className={styles.detailBlock__title}>Care Instructions</h3>
                <p style={{ fontSize: 'var(--text-sm)' }}>
                  Pakaian tenun ikat memerlukan perawatan khusus untuk menjaga serat kain dan keindahan warnanya yang alami.
                </p>
                <div className={styles.careGrid}>
                  {piece.care.map(item => {
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
            <h2 className={styles.related__title}>You May Also Like</h2>
            <div className={styles.related__grid}>
              {relatedPieces.map((item, index) => (
                <ScrollReveal key={item.id} delay={index + 1}>
                  <Link href={`/collections/${item.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{
                      aspectRatio: '4/5',
                      overflow: 'hidden',
                      marginBottom: 'var(--space-md)',
                      backgroundColor: 'var(--cream)'
                    }}>
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
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
          title="Interested in this Piece?"
          subtitle="Hubungi admin kami untuk custom ukuran atau pemesanan langsung."
        />
      </main>
      <Footer />
    </>
  );
}
