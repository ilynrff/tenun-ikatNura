'use client';

import { useRef } from 'react';
import testimonials from '@/data/testimonials.json';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Testimonials.module.css';

export default function Testimonials() {
  const sliderRef = useRef(null);

  const renderStars = (count) => {
    return Array.from({ length: count }, (_, i) => (
      <span key={i}>★</span>
    ));
  };

  return (
    <section className={styles.testimonials} aria-labelledby="testimonials-title">
      <div className={styles.testimonials__inner}>
        <ScrollReveal>
          <div className={styles.testimonials__header}>
            <span className={styles.testimonials__label}>Testimonials</span>
            <h2 id="testimonials-title" className={styles.testimonials__title}>
              What Our Customers Say
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className={styles.testimonials__slider} ref={sliderRef}>
            {testimonials.map((item) => (
              <div key={item.id} className={styles.testimonials__card}>
                <span className={styles['testimonials__quote-icon']}>&ldquo;</span>
                <p className={styles.testimonials__review}>{item.review}</p>
                <div className={styles.testimonials__stars}>
                  {renderStars(item.rating)}
                </div>
                <div className={styles.testimonials__author}>
                  <span className={styles.testimonials__name}>{item.name}</span>
                  <span className={styles.testimonials__role}>{item.role}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
