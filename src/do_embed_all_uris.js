const fs = require('fs');

const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c';

function getDataUri(srcFile) {
  const p = `${brainDir}\\${srcFile}`;
  if (fs.existsSync(p)) {
    const base64 = fs.readFileSync(p).toString('base64');
    return `data:image/png;base64,${base64}`;
  }
  return '';
}

const imgNusaIndah = getDataUri('nusa_indah_outer_1785769443953.png');
const imgRatnaDress = getDataUri('ratna_dress_1785769455505.png');
const imgMajapahitBlazer = getDataUri('majapahit_blazer_1785769467603.png');
const imgCandramawaScarf = getDataUri('candramawa_scarf_1785769481897.png');
const imgSuryaShirt = getDataUri('surya_kencana_shirt_1785769494701.png');
const imgSwarnaKimono = getDataUri('swarna_bumi_kimono_1785769510401.png');
const imgArtisanStory = getDataUri('artisan_weaving_editorial_1785768418024.png');

// 1. FeaturedCollection.js
const fcJs = `'use client';

import Link from 'next/link';
import styles from './FeaturedCollection.module.css';

const collections = [
  {
    slug: 'nusa-indah-outer',
    title: 'Nusa Indah Outer',
    category: 'Outerwear',
    material: 'Tenun Ikat NTT & Sutra Alam',
    image: "${imgNusaIndah}",
  },
  {
    slug: 'ratna-mutumanikam-dress',
    title: 'Ratna Dress',
    category: 'Womenswear',
    material: 'Tenun Ikat Jepara & Rayon Premium',
    image: "${imgRatnaDress}",
  },
  {
    slug: 'majapahit-heritage-blazer',
    title: 'Majapahit Blazer',
    category: 'Structured Blazer',
    material: 'Tenun Ikat Troso & Katun Halus',
    image: "${imgMajapahitBlazer}",
  },
  {
    slug: 'candramawa-silk-scarf',
    title: 'Candramawa Scarf',
    category: 'Accessories',
    material: '100% Sutra Tenun Asli',
    image: "${imgCandramawaScarf}",
  },
  {
    slug: 'surya-kencana-shirt',
    title: 'Surya Kencana Shirt',
    category: 'Menswear',
    material: 'Tenun Ikat Toraja & Katun',
    image: "${imgSuryaShirt}",
  },
  {
    slug: 'swarna-bumi-kimono',
    title: 'Swarna Bumi Kimono',
    category: 'Resortwear',
    material: 'Tenun Ikat Bali & Linen Natural',
    image: "${imgSwarnaKimono}",
  },
];

export default function FeaturedCollection() {
  return (
    <section className={styles.featured} aria-labelledby="featured-title">
      <div className={styles.featured__inner}>
        <div className={styles.featured__header}>
          <div className={styles['featured__title-area']}>
            <span className={styles.featured__label}>Curated Pieces</span>
            <h2 id="featured-title" className={styles.featured__title}>
              Featured Collections
            </h2>
          </div>
          <Link href="/collections" className="btn btn--secondary">
            View All Collections
          </Link>
        </div>

        <div className={styles.featured__grid}>
          {collections.map((item) => (
            <Link key={item.slug} href={\`/collections/\${item.slug}\`} className={styles.card}>
              <div className={styles['card__image-wrapper']}>
                <img src={item.image} alt={item.title} className={styles.card__image} loading="eager" />
              </div>
              <span className={styles.card__category}>{item.category}</span>
              <h3 className={styles.card__name}>{item.title}</h3>
              <div className={styles.card__footer}>
                <span className={styles.card__desc}>{item.material}</span>
                <span className={styles.card__link}>Explore &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync('c:\\projects\\tenun ikat Nura\\src\\components\\home\\FeaturedCollection.js', fcJs);

// 2. SignatureCollection.js
const sigJs = `'use client';

import Link from 'next/link';
import styles from './SignatureCollection.module.css';

const sigImg = "${imgNusaIndah}";

export default function SignatureCollection() {
  return (
    <section className={styles.signature} aria-labelledby="sig-title">
      <div className={styles.signature__inner}>
        <div className={styles['signature__image-wrapper']}>
          <img
            src={sigImg}
            alt="Signature Piece Masterpiece Tenun Ikat Nura"
            className={styles.signature__image}
            loading="eager"
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
`;

fs.writeFileSync('c:\\projects\\tenun ikat Nura\\src\\components\\home\\SignatureCollection.js', sigJs);

// 3. LookbookPreview.js
const lbJs = `'use client';

import Link from 'next/link';
import styles from './LookbookPreview.module.css';

const lookbookImages = [
  "${imgNusaIndah}",
  "${imgRatnaDress}",
  "${imgSwarnaKimono}",
  "${imgMajapahitBlazer}",
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
              <img src={src} alt={\`Lookbook Editorial Visual \${index + 1}\`} loading="eager" />
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
`;

fs.writeFileSync('c:\\projects\\tenun ikat Nura\\src\\components\\home\\LookbookPreview.js', lbJs);

// 4. OurStoryPreview.js
const storyJs = `'use client';

import Link from 'next/link';
import styles from './OurStoryPreview.module.css';

const storyImg = "${imgArtisanStory}";

export default function OurStoryPreview() {
  return (
    <section className={styles.story} aria-labelledby="story-title">
      <div className={styles.story__inner}>
        <div className={styles['story__image-wrapper']}>
          <img
            src={storyImg}
            alt="Pengrajin tenun ikat sedang menenun kain tradisional"
            className={styles.story__image}
            loading="eager"
          />
        </div>

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
      </div>
    </section>
  );
}
`;

fs.writeFileSync('c:\\projects\\tenun ikat Nura\\src\\components\\home\\OurStoryPreview.js', storyJs);

console.log('Finished updating all components with Data URIs!');
