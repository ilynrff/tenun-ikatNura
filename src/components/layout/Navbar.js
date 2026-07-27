'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/collections', label: 'Collections' },
  { href: '/our-story', label: 'Our Story' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <header className={styles.navbar} role="banner">
      <div className={styles.navbar__inner}>
        {/* Logo */}
        <Link href="/" className={styles.navbar__logo} aria-label="Tenun Ikat Nura - Home">
          <span className={styles['navbar__logo-icon']}>N</span>
          <span className={styles['navbar__logo-text']}>
            <span className={styles['navbar__logo-brand']}>Tenun Ikat</span>
            <span className={styles['navbar__logo-name']}>NURA</span>
          </span>
        </Link>

        {/* Navigation menu */}
        <nav className={styles.navbar__nav} aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navbar__link} ${
                pathname === link.href ? styles['navbar__link--active'] : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Discover Collection CTA */}
        <Link href="/collections" className={styles.navbar__cta}>
          Discover Collection
        </Link>

        {/* Mobile menu toggle */}
        <button
          className={styles.navbar__toggle}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle Navigation"
        >
          <span className={styles['navbar__toggle-line']} />
          <span className={styles['navbar__toggle-line']} />
          <span className={styles['navbar__toggle-line']} />
        </button>
      </div>
    </header>
  );
}
