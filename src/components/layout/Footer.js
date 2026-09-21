import Link from 'next/link';
import siteData from '@/data/site.json';
import styles from './Footer.module.css';

export default function Footer() {
  const waDisplay = siteData.contact.whatsappDisplay || '0812-5278-3496';
  const waUrl = `https://wa.me/${siteData.contact.whatsapp || '6281252783496'}`;
  const instagramUrl = siteData.contact.instagramUrl || 'https://instagram.com/Tenun_ikat_nura';
  const shopeeUrl = siteData.contact.shopeeUrl || 'https://shopee.co.id/tenun_ikat_nura';
  const email = siteData.contact.email;

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footer__inner}>
        <div className={styles.footer__top}>
          <div className={styles.footer__brand}>
            <p className={styles.footer__eyebrow}>Tenun Ikat Nura</p>
            <h3 className={styles['footer__brand-title']}>Woven heritage,<br />designed for today.</h3>
            <p className={styles['footer__brand-desc']}>
              Tenun ikat dari Jepara, dibuat dengan penuh cinta untuk menghadirkan warisan tradisi dalam gaya modern.
            </p>
            <div className={styles.footer__socials} aria-label="Social media">
              <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
              <a href={waUrl} target="_blank" rel="noreferrer">WhatsApp</a>
              <a href={shopeeUrl} target="_blank" rel="noreferrer">Shopee</a>
            </div>
          </div>

          <div className={styles.footer__newsletter}>
            <h4 className={styles['footer__col-title']}>Stay connected</h4>
            <p className={styles['footer__newsletter-copy']}>
              Discover new collections, stories, and updates from Tenun Ikat Nura.
            </p>
            <form className={styles.footer__subscribe}>
              <label className={styles.footer__srOnly} htmlFor="footer-email">Your email address</label>
              <input id="footer-email" type="email" placeholder="Your email address" />
              <button type="button">Subscribe</button>
            </form>
          </div>

          <div className={styles.footer__column}>
            <h4 className={styles['footer__col-title']}>Navigation</h4>
            <ul className={styles.footer__links}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/collections">Collections</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className={styles.footer__column}>
            <h4 className={styles['footer__col-title']}>Contact</h4>
            <address className={styles.footer__contact}>
              <p>{siteData.contact.address || 'Jepara, Jawa Tengah, Indonesia'}</p>
              <a href={`mailto:${email}`}>{email}</a>
              <a href={waUrl} target="_blank" rel="noreferrer">{waDisplay}</a>
            </address>
          </div>
        </div>

        <div className={styles.footer__bottom}>
          <p>&copy; {new Date().getFullYear()} Tenun Ikat Nura. All rights reserved.</p>
          <p>Tenun Heritage <span aria-hidden="true">·</span> Crafted in Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
