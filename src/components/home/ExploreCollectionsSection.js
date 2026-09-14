'use client';

import Link from 'next/link';
import styles from './ExploreCollectionsSection.module.css';

const categories = [
  { name: 'Dress', slug: 'dress', label: 'Gaun & Tunic' },
  { name: 'Blazer', slug: 'outer', label: 'Structured Blazer' },
  { name: 'Couple Set', slug: 'couple', label: 'Sarimbit Pasangan' },
  { name: 'Kimono', slug: 'outer', label: 'Resortwear Kimono' },
  { name: 'Kemeja', slug: 'men', label: 'Menswear Shirt' },
  { name: 'Outerwear', slug: 'outer', label: 'Statement Outer' },
];

export default function ExploreCollectionsSection() {
  return (
    <section className={styles.section} aria-labelledby="explore-title">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>Kategori Pilihan</span>
          <h2 id="explore-title" className={styles.title}>
            Explore Collections
          </h2>
          <div className={styles.divider} />
          <p className={styles.desc}>
            Discover contemporary pieces crafted from the beauty of Indonesian woven heritage.
          </p>
        </div>

        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/collections?category=${cat.slug}`}
              className={styles.card}
            >
              <span className={styles.cardName}>{cat.name}</span>
              <span className={styles.cardLabel}>{cat.label}</span>
              <span className={styles.cardArrow}>&rarr;</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
