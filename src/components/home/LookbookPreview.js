import Link from 'next/link';
import styles from './LookbookPreview.module.css';

const lookbookImages = [
  '/images/lookbook/lookbook-1.jpg',
  '/images/lookbook/lookbook-2.jpg',
  '/images/lookbook/lookbook-3.jpg',
  '/images/lookbook/lookbook-4.jpg',
];

export default function LookbookPreview() {
  return (
    <section className={styles.lookbook} aria-labelledby="lb-title">
      <div className={styles.lookbook__inner}>
        <div className={styles.lookbook__header}>
          <span className={styles.lookbook__label}>Editorial Campaign</span>
          <h2 id="lb-title" className={styles.lookbook__title}>
            The Modern Heritage Lookbook
          </h2>
        </div>

        <div className={styles.lookbook__grid}>
          {lookbookImages.map((src, index) => (
            <div key={index} className={styles.lookbook__item}>
              <img src={src} alt={`Lookbook Editorial Visual ${index + 1}`} loading="lazy" />
            </div>
          ))}
        </div>

        <div className={styles.lookbook__action}>
          <Link href="/lookbook" className="btn btn--secondary">
            Explore Full Lookbook
          </Link>
        </div>
      </div>
    </section>
  );
}
