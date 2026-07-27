import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footer__inner}>
        <div className={styles.footer__top}>
          <div>
            <h3 className={styles['footer__brand-title']}>Tenun Ikat Nura</h3>
            <p className={styles['footer__brand-desc']}>
              Indonesian Luxury Woven Fashion House. Merayakan warisan tenun Nusantara dalam estetika desain modern dan elegan.
            </p>
          </div>

          <div>
            <h4 className={styles['footer__col-title']}>Navigation</h4>
            <ul className={styles.footer__links}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/collections">Collections</Link></li>
              <li><Link href="/our-story">Our Story</Link></li>
              <li><Link href="/lookbook">Lookbook</Link></li>
              <li><Link href="/journal">Journal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles['footer__col-title']}>Legal & Info</h4>
            <ul className={styles.footer__links}>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/care">Care Instructions</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles['footer__col-title']}>Boutique & Connect</h4>
            <ul className={styles.footer__links}>
              <li>WhatsApp: +62 858-0010-0254</li>
              <li>Shopee: tenun_ikat_nura</li>
              <li>Instagram: @Tenun_ikat_nura</li>
              <li>Jepara, Jawa Tengah, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className={styles.footer__bottom}>
          <p>&copy; {new Date().getFullYear()} Tenun Ikat Nura. All rights reserved.</p>
          <p>Handcrafted Heritage Woven Fashion</p>
        </div>
      </div>
    </footer>
  );
}
