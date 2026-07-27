import Link from 'next/link';
import collections from '@/data/collections.json';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './FeaturedCollection.module.css';

export default function FeaturedCollection() {
  const featured = collections.filter(c => c.featured).slice(0, 6);

  return (
    <section className={styles.featured} aria-labelledby="featured-title">
      <div className={styles.featured__inner}>
        <ScrollReveal>
          <div className={styles.featured__header}>
            <span className={styles.featured__label}>Featured Pieces</span>
            <h2 id="featured-title" className={styles.featured__title}>
              Our Collections
            </h2>
            <p className={styles.featured__subtitle}>
              Koleksi pilihan yang menggabungkan keindahan tenun ikat dengan desain kontemporer.
            </p>
          </div>
        </ScrollReveal>

        <div className={styles.featured__grid}>
          {featured.map((item, index) => (
            <ScrollReveal key={item.id} delay={Math.min(index + 1, 4)}>
              <Link href={`/collections/${item.slug}`} className={styles.card}>
                <div className={styles['card__image-wrapper']}>
                  <img
                    src={item.images[0]}
                    alt={`${item.name} - ${item.categoryLabel}`}
                    className={styles.card__image}
                    loading="lazy"
                  />
                  <div className={styles.card__overlay}>
                    <span className={styles.card__view}>View Details</span>
                  </div>
                </div>
                <div className={styles.card__info}>
                  <h3 className={styles.card__name}>{item.name}</h3>
                  <span className={styles.card__category}>{item.categoryLabel}</span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className={styles.featured__cta}>
            <Link href="/collections" className="btn btn--secondary">
              View All Collections
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
