import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './OurStoryPreview.module.css';

export default function OurStoryPreview() {
  return (
    <section className={styles.story} aria-labelledby="story-title">
      <div className={styles.story__inner}>
        <ScrollReveal>
          <div className={styles['story__image-wrapper']}>
            <img
              src="/images/story/our-story.jpg"
              alt="Pengrajin tenun ikat sedang menenun kain tradisional"
              className={styles.story__image}
              loading="lazy"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={2}>
          <div className={styles.story__content}>
            <span className={styles.story__label}>Our Story</span>
            <h2 id="story-title" className={styles.story__title}>
              A Heritage Worth<br />Preserving
            </h2>
            <blockquote className={styles.story__quote}>
              &ldquo;Setiap helai kain tenun menyimpan cerita tentang budaya, 
              keahlian tangan, dan keindahan Nusantara.&rdquo;
            </blockquote>
            <p className={styles.story__text}>
              Tenun Ikat Nura hadir dengan satu misi: membawa keindahan tenun ikat 
              ke dalam kehidupan modern tanpa kehilangan esensi budayanya. 
              Dari tangan pengrajin terampil hingga desain kontemporer, 
              setiap koleksi kami adalah perpaduan antara tradisi dan inovasi.
            </p>
            <div className={styles.story__cta}>
              <Link href="/our-story" className="btn btn--secondary">
                Read Full Story
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
