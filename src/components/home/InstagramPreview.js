import styles from './InstagramPreview.module.css';

const instaPhotos = [
  '/images/instagram/insta-1.jpg',
  '/images/instagram/insta-2.jpg',
  '/images/instagram/insta-3.jpg',
  '/images/instagram/insta-4.jpg',
  '/images/instagram/insta-5.jpg',
  '/images/instagram/insta-6.jpg',
];

export default function InstagramPreview() {
  return (
    <section className={styles.insta} aria-labelledby="insta-title">
      <div className={styles.insta__inner}>
        <div className={styles.insta__header}>
          <span className={styles.insta__label}>Follow Our Journey</span>
          <h2 id="insta-title" className={styles.insta__title}>
            @Tenun_ikat_nura
          </h2>
        </div>

        <div className={styles.insta__grid}>
          {instaPhotos.map((src, idx) => (
            <a
              key={idx}
              href="https://instagram.com/Tenun_ikat_nura"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.insta__item}
            >
              <img src={src} alt={`Tenun Ikat Nura Instagram Journal ${idx + 1}`} loading="lazy" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
