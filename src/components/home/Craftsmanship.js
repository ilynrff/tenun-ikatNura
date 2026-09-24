'use client';

import styles from './Craftsmanship.module.css';

const trustPoints = [
  {
    id: 1,
    title: '100% Buatan Tangan',
    desc: 'Ditenun langsung oleh pengrajin Jepara menggunakan alat tenun bukan mesin (ATBM) dengan ketelitian tinggi.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Kualitas Premium',
    desc: 'Bahan pilihan terbaik dari serat katun dan sutra alam berkualitas dengan standar jahitan rapi dan presisi.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
        <path d="M2 9h20" />
        <path d="M10 21l-4-12 6-6 6 6-4 12" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Pengrajin Lokal',
    desc: 'Mendukung ekonomi komunitas pengrajin lokal dan pelestarian regenerasi budaya wastra Indonesia.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Terpercaya',
    desc: 'Pilihan tepercaya penikmat wastra di seluruh Indonesia dengan jaminan 100% keaslian tenun Nusantara.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

export default function Craftsmanship() {
  return (
    <section className={styles.trustSection} aria-labelledby="trust-title">
      <div className={styles.trustInner}>
        <div className={styles.trustHeader}>
          <span className={styles.trustEyebrow}>NILAI & KOMITMEN</span>
          <h2 id="trust-title" className={styles.trustTitle}>
            Mengapa Tenun Ikat Nura
          </h2>
          <p className={styles.trustSubtitle}>
            Dedikasi kami dalam menghadirkan keindahan wastra Nusantara melalui karya busana yang bermakna, autentik, dan beretika.
          </p>
        </div>

        <div className={styles.trustGrid} role="list" aria-label="4 Nilai Kepercayaan Tenun Ikat Nura">
          {trustPoints.map((point) => (
            <div key={point.id} className={styles.trustItem} role="listitem">
              <div className={styles.iconCircle} aria-hidden="true">
                {point.icon}
              </div>
              <h3 className={styles.trustItemTitle}>{point.title}</h3>
              <p className={styles.trustItemDesc}>{point.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
