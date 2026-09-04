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
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

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
