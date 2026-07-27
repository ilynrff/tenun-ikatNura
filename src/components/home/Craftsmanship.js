import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Craftsmanship.module.css';

const steps = [
  {
    number: '01',
    title: 'Design',
    description: 'Setiap koleksi dimulai dari konsep desain yang menggabungkan motif tradisional dengan siluet modern.',
    image: '/images/craftsmanship/design.jpg',
    alt: 'Proses desain motif tenun ikat',
  },
  {
    number: '02',
    title: 'Fabric Selection',
    description: 'Pemilihan kain tenun ikat terbaik yang telah melalui proses seleksi ketat untuk memastikan kualitas.',
    image: '/images/craftsmanship/fabric.jpg',
    alt: 'Seleksi kain tenun ikat berkualitas',
  },
  {
    number: '03',
    title: 'Cutting',
    description: 'Pemotongan kain dilakukan dengan presisi tinggi untuk memastikan motif tenun tetap terjaga keindahannya.',
    image: '/images/craftsmanship/cutting.jpg',
    alt: 'Proses pemotongan kain tenun dengan presisi',
  },
  {
    number: '04',
    title: 'Sewing',
    description: 'Dijahit oleh penjahit berpengalaman dengan perhatian pada setiap detail jahitan.',
    image: '/images/craftsmanship/sewing.jpg',
    alt: 'Proses menjahit koleksi tenun ikat',
  },
  {
    number: '05',
    title: 'Finishing',
    description: 'Proses finishing meliputi pengepresan, pengecekan jahitan, dan penyempurnaan detail akhir.',
    image: '/images/craftsmanship/finishing.jpg',
    alt: 'Proses finishing dan detail akhir',
  },
  {
    number: '06',
    title: 'Quality Control',
    description: 'Setiap piece melewati quality control ketat sebelum sampai ke tangan Anda.',
    image: '/images/craftsmanship/quality.jpg',
    alt: 'Pemeriksaan kualitas akhir',
  },
];

export default function Craftsmanship() {
  return (
    <section className={styles.craft} aria-labelledby="craft-title">
      <div className={styles.craft__inner}>
        <ScrollReveal>
          <div className={styles.craft__header}>
            <span className={styles.craft__label}>Craftsmanship</span>
            <h2 id="craft-title" className={styles.craft__title}>
              Made with Care,<br />Crafted with Precision
            </h2>
            <p className={styles.craft__subtitle}>
              Dari desain hingga quality control, setiap langkah dilakukan dengan ketelitian 
              dan kecintaan terhadap seni tenun.
            </p>
          </div>
        </ScrollReveal>

        <div className={styles.craft__timeline}>
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} delay={index < 4 ? index + 1 : 4}>
              <div className={styles.craft__step}>
                <div className={styles['craft__step-image']}>
                  <img
                    src={step.image}
                    alt={step.alt}
                    loading="lazy"
                  />
                </div>
                <div className={styles['craft__step-text']}>
                  <span className={styles['craft__step-number']}>{step.number}</span>
                  <h3 className={styles['craft__step-title']}>{step.title}</h3>
                  <p className={styles['craft__step-desc']}>{step.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
