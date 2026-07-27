import Link from 'next/link';
import collections from '@/data/collections.json';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './SignatureCollection.module.css';

export default function SignatureCollection() {
  const signature = collections.find(c => c.signature) || collections[0];

  return (
    <section className={styles.signature} aria-labelledby="signature-title">
      <div className={styles.signature__bg}>
        <img
          src={signature.images[0]}
          alt={`${signature.name} - Signature Collection`}
          loading="lazy"
        />
        <div className={styles.signature__overlay} />
      </div>

      <div className={styles.signature__content}>
        <ScrollReveal>
          <div className={styles.signature__inner}>
            <span className={styles.signature__label}>Signature Collection</span>
            <h2 id="signature-title" className={styles.signature__title}>
              {signature.name}
            </h2>
            <p className={styles.signature__tagline}>{signature.tagline}</p>
            <p className={styles.signature__desc}>
              {signature.description}
            </p>
            <Link href={`/collections/${signature.slug}`} className="btn btn--outline-light">
              Discover This Piece
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
