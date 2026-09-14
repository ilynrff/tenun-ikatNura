'use client';

import styles from './FashionVisualBreak.module.css';

export default function FashionVisualBreak() {
  return (
    <section className={styles.visualSection} aria-label="Visual Art of Tenun">
      <div className={styles.imageWrapper}>
        <img
          src="/images/collections/candramawa-scarf-1.jpg"
          alt="Art of Tenun Ikat Indonesian Textile Detail"
          className={styles.image}
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <span className={styles.label}>THE ART OF TENUN</span>
        <blockquote className={styles.quote}>
          &ldquo;Every thread carries the character of its maker.&rdquo;
        </blockquote>
      </div>
    </section>
  );
}
