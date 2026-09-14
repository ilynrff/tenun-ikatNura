'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import styles from './OurStoryPage.module.css';

const TOTAL_PAGES = 6;

export default function OurStoryPage() {
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed (0 to 5)
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next'); // 'next' or 'prev'
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  // Navigate to specific page with locked transition
  const goToPage = useCallback((targetPage, dir) => {
    if (isAnimating || targetPage === currentPage) return;
    if (targetPage < 0 || targetPage >= TOTAL_PAGES) return;

    setDirection(dir || (targetPage > currentPage ? 'next' : 'prev'));
    setIsAnimating(true);
    setCurrentPage(targetPage);

    // Lock navigation for 850ms to ensure smooth transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 850);
  }, [currentPage, isAnimating]);

  const nextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1) {
      goToPage(currentPage + 1, 'next');
    }
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1, 'prev');
    }
  }, [currentPage, goToPage]);

  // Handle Wheel Scroll
  useEffect(() => {
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) < 25) return; // ignore tiny trackpad jitters
      if (e.deltaY > 0) {
        nextPage();
      } else {
        prevPage();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [nextPage, prevPage]);

  // Handle Keyboard Arrows
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextPage();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage]);

  // Handle Mobile Touch Swipes
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;

    // Determine vertical or horizontal swipe
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > 40) nextPage();
      else if (deltaY < -40) prevPage();
    } else {
      if (deltaX > 40) nextPage();
      else if (deltaX < -40) prevPage();
    }
  };

  // Image assets
  const imgCover = '/images/hero/hero-main.jpg';
  const imgPhilosophy = '/images/story/brand-intro.jpg';
  const imgCraftsmanship = '/images/story/our-story.jpg';
  const imgPatience = '/images/collections/candramawa-scarf-1.jpg';
  const imgApproach = '/images/collections/ratna-dress-1.jpg';

  return (
    <>
      <Navbar />
      <main
        className={styles.storybookContainer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Storybook Progress & Page Indicator */}
        <div className={styles.topIndicator}>
          <span className={styles.brandTitle}>OUR STORY</span>
          <span className={styles.pageNumber}>
            0{currentPage + 1} / 0{TOTAL_PAGES}
          </span>
        </div>

        {/* Vertical Chapter Dots */}
        <div className={styles.verticalProgress} aria-label="Chapter progress">
          {Array.from({ length: TOTAL_PAGES }).map((_, idx) => (
            <button
              key={idx}
              className={`${styles.dot} ${currentPage === idx ? styles.activeDot : ''}`}
              onClick={() => goToPage(idx, idx > currentPage ? 'next' : 'prev')}
              aria-label={`Buka Bab 0${idx + 1}`}
            />
          ))}
        </div>

        {/* Floating Navigation Controls */}
        <div className={styles.navControls}>
          {currentPage > 0 && (
            <button
              onClick={prevPage}
              className={`${styles.navBtn} ${styles.prevBtn}`}
              aria-label="Previous story page"
            >
              &larr;
            </button>
          )}
          {currentPage < TOTAL_PAGES - 1 && (
            <button
              onClick={nextPage}
              className={`${styles.navBtn} ${styles.nextBtn}`}
              aria-label="Next story page"
            >
              &rarr;
            </button>
          )}
        </div>

        {/* SLIDE PAGES CONTAINER */}
        <div className={styles.storyViewport}>
          {/* ================= PAGE 01: COVER ================= */}
          <div
            className={`${styles.storyPage} ${
              currentPage === 0
                ? styles.pageActive
                : currentPage > 0
                ? styles.pagePrev
                : styles.pageNext
            }`}
          >
            <div className={styles.coverInner}>
              <span className={styles.eyebrow}>OUR STORY</span>
              <h1 className={styles.coverTitle}>
                A Heritage<br />Worth Preserving
              </h1>
              <div className={styles.goldLine} />
              <p className={styles.coverDesc}>
                &ldquo;Every thread carries a story — of culture, craftsmanship, and the enduring beauty of Indonesian woven heritage.&rdquo;
              </p>
              <div className={styles.scrollHint} onClick={nextPage}>
                <span>Scroll or press &rarr; to begin</span>
              </div>
            </div>
          </div>

          {/* ================= PAGE 02: WHERE IT BEGINS ================= */}
          <div
            className={`${styles.storyPage} ${
              currentPage === 1
                ? styles.pageActive
                : currentPage > 1
                ? styles.pagePrev
                : styles.pageNext
            }`}
          >
            <div className={styles.editorialSpread}>
              <div className={styles.spreadImageCol}>
                <div className={styles.imageFrame}>
                  <img
                    src={imgPhilosophy}
                    alt="Master Indonesian artisan weaving traditional Ikat fabric"
                    className={styles.spreadImage}
                  />
                </div>
              </div>
              <div className={styles.spreadTextCol}>
                <span className={styles.eyebrow}>THE ORIGIN</span>
                <h2 className={styles.pageTitle}>Where It Begins</h2>
                <div className={styles.goldLine} />
                <p className={styles.bodyText}>
                  Tenun Ikat Nura lahir dari kecintaan terhadap warisan budaya Indonesia. Kami percaya bahwa keindahan tenun ikat tidak hanya layak dilestarikan, tetapi juga pantas dihadirkan dalam kehidupan modern.
                </p>
                <p className={styles.bodyText}>
                  Setiap kain membawa karakter, proses, dan cerita yang berbeda.
                </p>
              </div>
            </div>
          </div>

          {/* ================= PAGE 03: THE HANDS BEHIND THE THREAD ================= */}
          <div
            className={`${styles.storyPage} ${
              currentPage === 2
                ? styles.pageActive
                : currentPage > 2
                ? styles.pagePrev
                : styles.pageNext
            }`}
          >
            <div className={styles.editorialSpreadReverse}>
              <div className={styles.spreadTextCol}>
                <span className={styles.eyebrow}>CRAFTSMANSHIP</span>
                <h2 className={styles.pageTitle}>The Hands Behind the Thread</h2>
                <div className={styles.goldLine} />
                <p className={styles.bodyText}>
                  Behind every piece lies a process that values patience, precision, and the hands of skilled artisans.
                </p>
                <p className={styles.bodyText}>
                  From preparing the yarn and forming the motif to dyeing and weaving, each stage requires careful attention.
                </p>
              </div>
              <div className={styles.spreadImageCol}>
                <div className={styles.imageFrame}>
                  <img
                    src={imgCraftsmanship}
                    alt="Close-up of artisan hands weaving woven thread"
                    className={styles.spreadImage}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= PAGE 04: THE ART OF PATIENCE ================= */}
          <div
            className={`${styles.storyPage} ${styles.darkThemePage} ${
              currentPage === 3
                ? styles.pageActive
                : currentPage > 3
                ? styles.pagePrev
                : styles.pageNext
            }`}
          >
            <div className={styles.fullBgImageWrapper}>
              <img
                src={imgPatience}
                alt="Intricate woven silk pattern background"
                className={styles.fullBgImage}
              />
              <div className={styles.bgOverlay} />
            </div>

            <div className={styles.experimentalContent}>
              <div className={styles.keywordsRow}>
                <span className={styles.keyword}>PATIENCE</span>
                <span className={styles.keywordDot}>&bull;</span>
                <span className={styles.keyword}>PRECISION</span>
                <span className={styles.keywordDot}>&bull;</span>
                <span className={styles.keyword}>HANDCRAFTED</span>
              </div>
              <div className={styles.dramaticQuote}>
                <p>Every thread requires patience.</p>
                <p>Every pattern requires precision.</p>
                <p>Every piece carries the character of the hands that made it.</p>
              </div>
            </div>
          </div>

          {/* ================= PAGE 05: TRADITION, REIMAGINED ================= */}
          <div
            className={`${styles.storyPage} ${
              currentPage === 4
                ? styles.pageActive
                : currentPage > 4
                ? styles.pagePrev
                : styles.pageNext
            }`}
          >
            <div className={styles.editorialSpread}>
              <div className={styles.spreadImageColDominant}>
                <div className={styles.imageFrameLarge}>
                  <img
                    src={imgApproach}
                    alt="Modern Indonesian Ikat woven contemporary fashion dress"
                    className={styles.spreadImage}
                  />
                </div>
              </div>
              <div className={styles.spreadTextCol}>
                <span className={styles.eyebrow}>THE NURA APPROACH</span>
                <h2 className={styles.pageTitle}>Tradition, Reimagined</h2>
                <div className={styles.goldLine} />
                <p className={styles.bodyText}>
                  Tenun Ikat Nura brings traditional woven heritage into contemporary silhouettes.
                </p>
                <p className={styles.bodyText}>
                  Through thoughtful cuts, refined materials, and contemporary styling, traditional craftsmanship becomes part of modern expression without losing its cultural character.
                </p>
              </div>
            </div>
          </div>

          {/* ================= PAGE 06: THE STORY CONTINUES ================= */}
          <div
            className={`${styles.storyPage} ${
              currentPage === 5
                ? styles.pageActive
                : currentPage > 5
                ? styles.pagePrev
                : styles.pageNext
            }`}
          >
            <div className={styles.coverInner}>
              <span className={styles.eyebrow}>HANDCRAFTED HERITAGE WOVEN FASHION</span>
              <h2 className={styles.coverTitle}>
                The Story Continues
              </h2>
              <div className={styles.goldLine} />
              <p className={styles.closingText}>
                Every piece carries a story.<br />
                Perhaps the next one is yours.
              </p>

              <div className={styles.ctaWrapper}>
                <Link href="/collections" className={styles.primaryCtaBtn}>
                  DISCOVER COLLECTION &nbsp; &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
