import fs from 'fs';
import path from 'path';
import styles from './InstagramPreview.module.css';

function getLocalUri(srcFile) {
  try {
    const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c';
    const p = path.join(brainDir, srcFile);
    if (fs.existsSync(p)) {
      const b64 = fs.readFileSync(p).toString('base64');
      return `data:image/png;base64,${b64}`;
    }
  } catch (e) {}
  return '';
}

const instaPhotos = [
  getLocalUri('artisan_weaving_editorial_1785768418024.png') || '/images/instagram/insta-1.jpg',
  getLocalUri('candramawa_scarf_1785769481897.png') || '/images/instagram/insta-2.jpg',
  getLocalUri('surya_kencana_shirt_1785769494701.png') || '/images/instagram/insta-3.jpg',
  getLocalUri('ratna_dress_1785769455505.png') || '/images/instagram/insta-4.jpg',
  getLocalUri('swarna_bumi_kimono_1785769510401.png') || '/images/instagram/insta-5.jpg',
  getLocalUri('nusa_indah_outer_1785769443953.png') || '/images/instagram/insta-6.jpg',
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
