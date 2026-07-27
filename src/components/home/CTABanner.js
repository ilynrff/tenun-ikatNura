import Link from 'next/link';
import styles from './CTABanner.module.css';

export default function CTABanner() {
  return (
    <section className={styles.cta} aria-labelledby="cta-title">
      <div className={styles.cta__inner}>
        <span className={styles.cta__label}>Bespoke & Consultations</span>
        <h2 id="cta-title" className={styles.cta__title}>
          Embrace Timeless Woven Luxury
        </h2>
        <p className={styles.cta__text}>
          Temukan busana tenun ikat eksklusif pilihan Anda atau konsultasikan pemesanan khusus (bespoke) bersama konsultan gaya kami.
        </p>
        <div className={styles.cta__actions}>
          <a
            href="https://wa.me/6285800100254"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
          >
            Personal Consultation &nbsp; &rarr;
          </a>
          <Link href="/collections" className="btn btn--secondary" style={{ color: '#F7F3EC', borderColor: '#DDD2C2' }}>
            Explore Collections &nbsp; &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
