'use client';

import { useState } from 'react';
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
  const pathname = usePathname();

  return (
    <header className={styles.navbar} role="banner">
      <div className={styles.navbar__logo}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <span className={styles['navbar__logo-icon']}>N</span>
          <span className={styles['navbar__logo-text']}>
            <span className={styles['navbar__logo-brand']}>Tenun Ikat</span>
            <span className={styles['navbar__logo-name']}>NURA</span>
          </span>
        </Link>
      </div>

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

      <Link href="/collections" className={styles.navbar__cta}>
        Discover Collection
      </Link>
    </header>
  );
}
