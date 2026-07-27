import styles from './Testimonials.module.css';

export default function Testimonials() {
  return (
    <section className={styles.testi} aria-label="Client Testimonial">
      <div className={styles.testi__inner}>
        <span className={styles.testi__label}>Collector Appreciations</span>
        <blockquote className={styles.testi__quote}>
          &ldquo;Kualitas tenun dan kerapian jahitannya luar biasa. 
          Sangat bangga bisa mengenakan busana yang kental akan budaya Indonesia dengan potongan yang modern dan berkelas.&rdquo;
        </blockquote>
        <p className={styles.testi__author}>— Anindya Putri</p>
        <p className={styles.testi__role}>Cultural Arts Enthusiast & Patron</p>
      </div>
    </section>
  );
}
