'use client';

import styles from './FashionVisualBreak.module.css';

export default function FashionVisualBreak() {
  return (
    <section className={styles.visualSection} aria-label="Seni Visual Tenun Ikat">
      <div className={styles.imageWrapper}>
        <img
          src="/images/collections/candramawa-scarf-1.jpg"
          alt="Detail Keindahan Kain Tenun Ikat Tradisional Indonesia"
          className={styles.image}
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <span className={styles.label}>SENI KAIN TENUN</span>
        <blockquote className={styles.quote}>
          &ldquo;Setiap helai benang merajut karakter dan ketulusan sang penenun.&rdquo;
        </blockquote>
      </div>
    </section>
  );
}
