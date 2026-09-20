'use client';

import Link from 'next/link';
import styles from './ExploreCollectionsSection.module.css';

const categories = [
  { number: '01', name: 'Dress', slug: 'dress', label: 'Gaun & Tunic' },
  { number: '02', name: 'Blazer', slug: 'outer', label: 'Structured Blazer' },
  { number: '03', name: 'Couple Set', slug: 'couple', label: 'Sarimbit Pasangan' },
  { number: '04', name: 'Kimono', slug: 'outer', label: 'Resortwear Kimono' },
  { number: '05', name: 'Kemeja', slug: 'men', label: 'Menswear Shirt' },
  { number: '06', name: 'Outerwear', slug: 'outer', label: 'Statement Outer' },
];

export default function ExploreCollectionsSection() {
  return (
    <section className={styles.section} aria-labelledby="explore-title">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Kategori Pilihan</span>
          <h2 id="explore-title" className={styles.title}>
            Curated Edit
          </h2>
          <p className={styles.desc}>
            Modern silhouettes shaped by the beauty of Indonesian woven heritage.
          </p>
        </div>

        <div className={styles.rail} role="list" aria-label="Collection categories">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/collections?category=${cat.slug}`}
              className={styles.card}
              role="listitem"
            >
              <span className={styles.cardNumber}>{cat.number}</span>
              <div className={styles.cardText}>
                <span className={styles.cardName}>{cat.name}</span>
                <span className={styles.cardLabel}>{cat.label}</span>
              </div>
              <span className={styles.cardArrow} aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
