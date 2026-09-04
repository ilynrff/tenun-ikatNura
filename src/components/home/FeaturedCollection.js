import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import styles from './FeaturedCollection.module.css';

function getLocalUri(srcFile) {
  try {
    const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c';
    const p = path.join(brainDir, srcFile);
    if (fs.existsSync(p)) {
      const b64 = fs.readFileSync(p).toString('base64');
      return `data:image/png;base64,${b64}`;
    }
  } catch (e) {}
  return '';
}

const collections = [
  {
    slug: 'nusa-indah-outer',
    title: 'Nusa Indah Outer',
    category: 'Outerwear',
    material: 'Tenun Ikat NTT & Sutra Alam',
    image: getLocalUri('nusa_indah_outer_1785769443953.png') || '/images/collections/nusa-indah-1.jpg',
  },
  {
    slug: 'ratna-mutumanikam-dress',
    title: 'Ratna Dress',
    category: 'Womenswear',
    material: 'Tenun Ikat Jepara & Rayon Premium',
    image: getLocalUri('ratna_dress_1785769455505.png') || '/images/collections/ratna-dress-1.jpg',
  },
  {
    slug: 'majapahit-heritage-blazer',
    title: 'Majapahit Blazer',
    category: 'Structured Blazer',
    material: 'Tenun Ikat Troso & Katun Halus',
    image: getLocalUri('majapahit_blazer_1785769467603.png') || '/images/collections/majapahit-blazer-1.jpg',
  },
  {
    slug: 'candramawa-silk-scarf',
    title: 'Candramawa Scarf',
    category: 'Accessories',
    material: '100% Sutra Tenun Asli',
    image: getLocalUri('candramawa_scarf_1785769481897.png') || '/images/collections/candramawa-scarf-1.jpg',
  },
  {
    slug: 'surya-kencana-shirt',
    title: 'Surya Kencana Shirt',
    category: 'Menswear',
    material: 'Tenun Ikat Toraja & Katun',
    image: getLocalUri('surya_kencana_shirt_1785769494701.png') || '/images/collections/surya-shirt-1.jpg',
  },
  {
    slug: 'swarna-bumi-kimono',
    title: 'Swarna Bumi Kimono',
    category: 'Resortwear',
    material: 'Tenun Ikat Bali & Linen Natural',
    image: getLocalUri('swarna_bumi_kimono_1785769510401.png') || '/images/collections/swarna-kimono-1.jpg',
  },
];

export default function FeaturedCollection() {
  return (
    <section className={styles.featured} aria-labelledby="featured-title">
      <div className={styles.featured__inner}>
        <div className={styles.featured__header}>
          <div className={styles['featured__title-area']}>
            <span className={styles.featured__label}>Curated Pieces</span>
            <h2 id="featured-title" className={styles.featured__title}>
              Featured Collections
            </h2>
          </div>
          <Link href="/collections" className="btn btn--secondary">
            View All Collections
          </Link>
        </div>

        <div className={styles.featured__grid}>
          {collections.map((item) => (
            <Link key={item.slug} href={`/collections/${item.slug}`} className={styles.card}>
              <div className={styles['card__image-wrapper']}>
                <img src={item.image} alt={item.title} className={styles.card__image} loading="lazy" />
              </div>
              <span className={styles.card__category}>{item.category}</span>
              <h3 className={styles.card__name}>{item.title}</h3>
              <div className={styles.card__footer}>
                <span className={styles.card__desc}>{item.material}</span>
                <span className={styles.card__link}>Explore &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
