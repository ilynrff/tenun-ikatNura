const fs = require('fs');

const imgPath = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\9d62c293-8c52-493b-ab1e-5ac1196f647c\\artisan_weaving_editorial_1785768418024.png';
const base64Str = fs.readFileSync(imgPath).toString('base64');
const dataUri = `data:image/png;base64,${base64Str}`;

const brandIntroJs = `'use client';

import styles from './BrandIntro.module.css';

const artisanImageSrc = "${dataUri}";

export default function BrandIntro() {
  return (
    <section className={styles.intro} aria-labelledby="identity-title">
      <div className={styles.intro__inner}>
        {/* Left Column: Editorial Typography & Brand Introduction */}
        <div className={styles.intro__content}>
          <span className={styles.intro__eyebrow}>OUR IDENTITY</span>
          
          <h2 id="identity-title" className={styles.intro__title}>
            Where Tradition<br />Meets Elegance
          </h2>

          {/* Minimal Subtle Gold Line Ornament */}
          <div className={styles.intro__divider} aria-hidden="true" />

          {/* Mobile Image Placement */}
          <div className={styles['intro__mobile-image-wrapper']}>
            <img
              src={artisanImageSrc}
              alt="Indonesian master artisan weaving traditional Ikat fabric on an antique wooden loom"
              className={styles.intro__image}
              loading="eager"
            />
          </div>

          <p className={styles.intro__body}>
            Tenun Ikat Nura lahir dari kecintaan mendalam terhadap warisan budaya Indonesia. 
            Kami percaya bahwa keindahan tenun ikat tidak hanya layak dilestarikan, 
            tetapi juga pantas dihadirkan dalam desain yang modern dan elegan — 
            untuk Anda yang menghargai kualitas, keunikan, dan cerita di balik setiap helai kain.
          </p>
        </div>

        {/* Right Column: Desktop Large Editorial Photography */}
        <div className={styles['intro__desktop-image-wrapper']}>
          <img
            src={artisanImageSrc}
            alt="Indonesian master artisan weaving traditional Ikat fabric on an antique wooden loom"
            className={styles.intro__image}
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync('c:\\projects\\tenun ikat Nura\\src\\components\\home\\BrandIntro.js', brandIntroJs);
console.log('BrandIntro.js updated with embedded Base64 Data URI successfully!');
