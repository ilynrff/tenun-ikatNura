import styles from './BrandIntro.module.css';

export default function BrandIntro() {
  return (
    <section className={styles.intro} aria-labelledby="intro-title">
      <div className={styles.intro__inner}>
        <div className={styles.intro__content}>
          <span className={styles.intro__label}>Our Identity</span>
          <h2 id="intro-title" className={styles.intro__title}>
            Where Tradition<br />Meets Elegance
          </h2>
          <div className={styles.intro__divider} />
          <p className={styles.intro__text}>
            Tenun Ikat Nura lahir dari kecintaan mendalam terhadap warisan budaya Indonesia. 
            Kami percaya bahwa keindahan tenun ikat tidak hanya layak dilestarikan, 
            tetapi juga pantas dihadirkan dalam desain yang modern dan elegan — 
            untuk Anda yang menghargai kualitas, keunikan, dan cerita di balik setiap helai kain.
          </p>
        </div>

        <div className={styles['intro__image-wrapper']}>
          <img
            src="/images/story/brand-intro.jpg"
            alt="Proses pembuatan tenun ikat oleh pengrajin terampil"
            className={styles.intro__image}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
