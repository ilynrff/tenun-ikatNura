import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './LookbookPreview.module.css';

const lookbookImages = [
  { src: '/images/lookbook/lookbook-1.jpg', alt: 'Model mengenakan koleksi tenun ikat Nura' },
  { src: '/images/lookbook/lookbook-2.jpg', alt: 'Detail motif tenun ikat pada koleksi terbaru' },
  { src: '/images/lookbook/lookbook-3.jpg', alt: 'Koleksi tenun ikat Nura dalam suasana editorial' },
  { src: '/images/lookbook/lookbook-4.jpg', alt: 'Tampilan keseluruhan koleksi tenun ikat modern' },
];

export default function LookbookPreview() {
  return (
    <section className={styles.lookbook} aria-labelledby="lookbook-title">
      <div className={styles.lookbook__inner}>
        <ScrollReveal>
          <div className={styles.lookbook__header}>
            <span className={styles.lookbook__label}>Lookbook</span>
            <h2 id="lookbook-title" className={styles.lookbook__title}>
              Editorial Collection
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.lookbook__grid}>
            {lookbookImages.map((img, index) => (
              <div key={index} className={styles.lookbook__item}>
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.lookbook__cta}>
            <Link href="/lookbook" className="btn btn--secondary">
              View Full Lookbook
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
