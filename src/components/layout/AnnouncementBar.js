'use client';

import styles from './AnnouncementBar.module.css';

const STATEMENT = 'TENUN IKAT NURA • WOVEN HERITAGE • HANDCRAFTED IN INDONESIA • DESIGNED FOR TODAY';

export default function AnnouncementBar() {
  // Duplicate array so marquee loops 100% seamlessly
  const items = Array(4).fill(STATEMENT);

  return (
    <div className={styles.announcementBar} role="region" aria-label="Brand Announcement">
      <div className={styles.marqueeTrack}>
        <div className={styles.marqueeContent}>
          {items.map((text, idx) => (
            <span key={`group1-${idx}`} className={styles.item}>
              {text}
            </span>
          ))}
        </div>
        <div className={styles.marqueeContent} aria-hidden="true">
          {items.map((text, idx) => (
            <span key={`group2-${idx}`} className={styles.item}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
