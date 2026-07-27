import Link from 'next/link';
import styles from './SignatureCollection.module.css';

export default function SignatureCollection() {
  return (
    <section className={styles.signature} aria-labelledby="sig-title">
      <div className={styles.signature__inner}>
        <div className={styles['signature__image-wrapper']}>
          <img
            src="/images/collections/signature-piece.jpg"
            alt="Signature Piece Masterpiece Tenun Ikat Nura"
            className={styles.signature__image}
            loading="lazy"
          />
        </div>

        <div className={styles.signature__content}>
          <span className={styles.signature__label}>Masterpiece Highlight</span>
          <h2 id="sig-title" className={styles.signature__title}>
            The Royal Ikat Outerwear
          </h2>
          <p className={styles.signature__desc}>
            Ditenun secara terbatas menggunakan benang sutra alam dan pewarna nabati rumit, 
            koleksi Signature ini membutuhkan waktu pembuatan lebih dari 90 hari pengerjaan tangan terampil. 
            Simbol kemewahan yang tak lekang oleh waktu.
          </p>
          <div>
            <Link href="/collections/nusa-indah-outer" className="btn btn--primary">
              Discover Signature Piece
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
