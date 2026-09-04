import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import styles from './LookbookPreview.module.css';

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

const lookbookImages = [
  getLocalUri('nusa_indah_outer_1785769443953.png') || '/images/lookbook/lookbook-1.jpg',
  getLocalUri('ratna_dress_1785769455505.png') || '/images/lookbook/lookbook-2.jpg',
  getLocalUri('swarna_bumi_kimono_1785769510401.png') || '/images/lookbook/lookbook-3.jpg',
  getLocalUri('majapahit_blazer_1785769467603.png') || '/images/lookbook/lookbook-4.jpg',
];

export default function LookbookPreview() {
  return (
    <section className={styles.lookbook} aria-labelledby="lb-title">
      <div className={styles.lookbook__inner}>
        <div className={styles.lookbook__header}>
          <span className={styles.lookbook__label}>Editorial Campaign</span>
          <h2 id="lb-title" className={styles.lookbook__title}>
            The Modern Heritage Lookbook
          </h2>
        </div>

        <div className={styles.lookbook__grid}>
          {lookbookImages.map((src, index) => (
            <div key={index} className={styles.lookbook__item}>
              <img src={src} alt={`Lookbook Editorial Visual ${index + 1}`} loading="lazy" />
            </div>
          ))}
        </div>

        <div className={styles.lookbook__action}>
          <Link href="/lookbook" className="btn btn--secondary">
            Explore Full Lookbook
          </Link>
        </div>
      </div>
    </section>
  );
}
