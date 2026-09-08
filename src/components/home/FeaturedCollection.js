import Link from 'next/link';
import styles from './FeaturedCollection.module.css';

const collections = [
  {
    slug: 'nusa-indah-outer',
    title: 'Nusa Indah Outer',
    category: 'Outerwear',
    material: 'Tenun Ikat NTT & Sutra Alam',
    image: '/images/collections/nusa-indah-1.jpg',
  },
  {
    slug: 'ratna-mutumanikam-dress',
    title: 'Ratna Dress',
    category: 'Womenswear',
    material: 'Tenun Ikat Jepara & Rayon Premium',
    image: '/images/collections/ratna-dress-1.jpg',
  },
  {
    slug: 'majapahit-heritage-blazer',
    title: 'Majapahit Blazer',
    category: 'Structured Blazer',
    material: 'Tenun Ikat Troso & Katun Halus',
    image: '/images/collections/majapahit-blazer-1.jpg',
  },
  {
    slug: 'candramawa-silk-scarf',
    title: 'Candramawa Scarf',
    category: 'Accessories',
    material: '100% Sutra Tenun Asli',
    image: '/images/collections/candramawa-scarf-1.jpg',
  },
  {
    slug: 'surya-kencana-shirt',
    title: 'Surya Kencana Shirt',
    category: 'Menswear',
    material: 'Tenun Ikat Toraja & Katun',
    image: '/images/collections/surya-shirt-1.jpg',
  },
  {
    slug: 'swarna-bumi-kimono',
    title: 'Swarna Bumi Kimono',
    category: 'Resortwear',
    material: 'Tenun Ikat Bali & Linen Natural',
    image: '/images/collections/swarna-kimono-1.jpg',
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
