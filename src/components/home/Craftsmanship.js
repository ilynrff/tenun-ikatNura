import styles from './Craftsmanship.module.css';

const steps = [
  {
    num: '01',
    title: 'Visual Concept',
    desc: 'Pengembangan filosofi motif dan sketsa awal sesuai estetika modern.',
    img: '/images/story/craft-1.jpg',
  },
  {
    num: '02',
    title: 'Yarn Selection',
    desc: 'Pemilihan benang katun dan sutra alam berkualitas terbaik.',
    img: '/images/story/craft-2.jpg',
  },
  {
    num: '03',
    title: 'Hand Tying',
    desc: 'Pengikatan benang secara manual membentuk ragam hias motif.',
    img: '/images/story/craft-3.jpg',
  },
  {
    num: '04',
    title: 'Natural Dyeing',
    desc: 'Pewarnaan tradisional menggunakan bahan-bahan alami Nusantara.',
    img: '/images/story/craft-4.jpg',
  },
  {
    num: '05',
    title: 'Hand Weaving',
    desc: 'Penenunan teliti dengan Alat Weave Bukan Mesin (ATBM).',
    img: '/images/story/craft-5.jpg',
  },
  {
    num: '06',
    title: 'Quality Finishing',
    desc: 'Pemeriksaan standar mutu tinggi dan pengemasan istimewa.',
    img: '/images/story/craft-6.jpg',
  },
];

export default function Craftsmanship() {
  return (
    <section className={styles.craft} aria-labelledby="craft-title">
      <div className={styles.craft__inner}>
        <div className={styles.craft__header}>
          <span className={styles.craft__label}>The Artisan Process</span>
          <h2 id="craft-title" className={styles.craft__title}>
            Mastery in Every Thread
          </h2>
          <p className={styles.craft__subtitle}>
            Enam tahapan pengerjaan tangan penuh dedikasi untuk menciptakan busana tenun kelas mahakarya.
          </p>
        </div>

        <div className={styles.craft__timeline}>
          {steps.map((step) => (
            <div key={step.num} className={styles.craft__step}>
              <div className={styles['craft__step-image']}>
                <img src={step.img} alt={step.title} loading="lazy" />
              </div>
              <span className={styles['craft__step-number']}>{step.num}</span>
              <h3 className={styles['craft__step-title']}>{step.title}</h3>
              <p className={styles['craft__step-desc']}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
