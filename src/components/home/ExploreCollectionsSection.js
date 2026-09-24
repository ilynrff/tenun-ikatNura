'use client';

import Link from 'next/link';
import styles from './ExploreCollectionsSection.module.css';

const categories = [
  {
    number: '01',
    name: 'GAUN',
    slug: 'dress',
    label: 'Gaun & Tunik',
    image: '/images/collections/ratna-dress-1.jpg',
    desc: 'Siluet feminin anggun berpadu motif tenun nusantara',
  },
  {
    number: '02',
    name: 'BLAZER',
    slug: 'outer',
    label: 'Blazer Berstruktur',
    image: '/images/collections/majapahit-blazer-1.jpg',
    desc: 'Potongan tegas dan presisi untuk tampilan formal berkelas',
  },
  {
    number: '03',
    name: 'SET PASANGAN',
    slug: 'couple',
    label: 'Busana Sarimbit',
    image: '/images/collections/signature-piece.jpg',
    desc: 'Harmoni busana serasi untuk momen istimewa bersama',
  },
  {
    number: '04',
    name: 'KIMONO',
    slug: 'outer',
    label: 'Kimono Modern',
    image: '/images/collections/swarna-kimono-1.jpg',
    desc: 'Luaran relaks berpotongan lebar dengan sentuhan tradisi',
  },
  {
    number: '05',
    name: 'KEMEJA',
    slug: 'men',
    label: 'Kemeja Pria',
    image: '/images/collections/surya-shirt-1.jpg',
    desc: 'Kemeja tenun pria berkarakter modern dan nyaman',
  },
  {
    number: '06',
    name: 'OUTER',
    slug: 'outer',
    label: 'Luaran Berkarakter',
    image: '/images/collections/nusa-indah-1.jpg',
    desc: 'Aksen statement busana wastra serbaguna untuk segala suasana',
  },
];

export default function ExploreCollectionsSection() {
  return (
    <section className={styles.section} aria-labelledby="explore-title">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>PILIHAN EKSKLUSIF</span>
          <h2 id="explore-title" className={styles.title}>
            Kategori Pilihan
          </h2>
          <p className={styles.desc}>
            Pilihan busana yang mempertemukan keindahan tenun Nusantara dengan siluet modern.
          </p>
        </div>

        <div className={styles.categoryGrid} role="list" aria-label="Kategori pilihan koleksi tenun">
          {categories.map((cat) => (
            <Link
              key={cat.number}
              href={`/collections?category=${cat.slug}`}
              className={styles.categoryCard}
              role="listitem"
            >
              <div className={styles.imageContainer}>
                <span className={styles.categoryNumber}>{cat.number}</span>
                <img
                  src={cat.image}
                  alt={`${cat.name} — ${cat.label}`}
                  className={styles.categoryImage}
                  loading="lazy"
                />
                <div className={styles.imageOverlay} />
              </div>

              <div className={styles.cardContent}>
                <div className={styles.titleRow}>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                  <span className={styles.arrowIcon} aria-hidden="true">→</span>
                </div>
                <span className={styles.categoryLabel}>{cat.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
