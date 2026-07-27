import Link from 'next/link';
import siteData from '@/data/site.json';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footer__inner}>
        {/* Brand */}
        <div className={styles.footer__brand}>
          <div className={styles.footer__logo}>
            <span className={styles['footer__logo-icon']}>N</span>
            <span className={styles['footer__logo-text']}>
              <span className={styles['footer__logo-sub']}>Tenun Ikat</span>
              <span className={styles['footer__logo-name']}>NURA</span>
            </span>
          </div>
          <p className={styles.footer__tagline}>
            {siteData.brand.tagline}
          </p>
        </div>

        {/* Collections */}
        <div>
          <h4 className={styles['footer__section-title']}>Collections</h4>
          <div className={styles.footer__links}>
            <Link href="/collections?category=women" className={styles.footer__link}>Women</Link>
            <Link href="/collections?category=men" className={styles.footer__link}>Men</Link>
            <Link href="/collections?category=couple" className={styles.footer__link}>Couple</Link>
            <Link href="/collections?category=outer" className={styles.footer__link}>Outer</Link>
            <Link href="/collections?category=blouse" className={styles.footer__link}>Blouse</Link>
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className={styles['footer__section-title']}>Company</h4>
          <div className={styles.footer__links}>
            <Link href="/our-story" className={styles.footer__link}>Our Story</Link>
            <Link href="/lookbook" className={styles.footer__link}>Lookbook</Link>
            <Link href="/journal" className={styles.footer__link}>Journal</Link>
            <Link href="/contact" className={styles.footer__link}>Contact</Link>
          </div>
        </div>

        {/* Connect */}
        <div>
          <h4 className={styles['footer__section-title']}>Connect</h4>
          <div className={styles.footer__links}>
            <a
              href={siteData.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footer__link}
            >
              Instagram
            </a>
            <a
              href={`https://wa.me/${siteData.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footer__link}
            >
              WhatsApp
            </a>
            <a
              href={siteData.contact.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footer__link}
            >
              Shopee
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.footer__divider} />

        {/* Bottom */}
        <div className={styles.footer__bottom}>
          <p className={styles.footer__copyright}>
            © {currentYear} Tenun Ikat Nura. All rights reserved.
          </p>
          <div className={styles['footer__bottom-links']}>
            <span className={styles['footer__bottom-link']}>
              Keindahan Tenun, Warisan Nusantara
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
