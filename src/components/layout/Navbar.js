'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: 'HOME' },
  { href: '/collections', label: 'COLLECTIONS' },
  { href: '/contact', label: 'CONTACT' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { totalItems, toggleCart } = useCart();
  const { toggleAccountDrawer } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles.headerWrapper}>
      {/* 1. ANNOUNCEMENT MARQUEE BAR */}
      <AnnouncementBar />

      {/* 2. FLOATING PILL NAVBAR */}
      <header
        className={`${styles.navbar} ${isScrolled ? styles['navbar--scrolled'] : ''}`}
        role="banner"
      >
        <div className={styles.navbar__logo}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <span className={styles['navbar__logo-icon']}>N</span>
            <span className={styles['navbar__logo-text']}>
              <span className={styles['navbar__logo-brand']}>Tenun Ikat</span>
              <span className={styles['navbar__logo-name']}>NURA</span>
            </span>
          </Link>
        </div>

        {/* Center Floating Pill Navigation Bar */}
        <nav className={styles.navbar__navPill} aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navbar__linkPill} ${
                  isActive ? styles.navbar__linkPillActive : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: CART PILL & ACCOUNT PILL */}
        <div className={styles.navbar__right}>
          {/* Cart Icon Pill */}
          <button
            onClick={toggleCart}
            className={styles.navbar__iconBtnPill}
            aria-label="Open shopping cart"
            title="Keranjang Belanja"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
          </button>

          {/* Account Icon Pill */}
          <button
            onClick={toggleAccountDrawer}
            className={styles.navbar__iconBtnPill}
            aria-label="Open account menu"
            title="Akun Saya"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={styles.navbar__toggle}
            aria-label="Toggle Navigation Menu"
          >
            <span className={styles['navbar__toggle-line']} />
            <span className={styles['navbar__toggle-line']} />
            <span className={styles['navbar__toggle-line']} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileNavList}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={styles.mobileNavLink}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
