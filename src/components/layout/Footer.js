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
            <h3 className={styles['footer__brand-title']}>Warisan tenun,<br />dirancang untuk masa kini.</h3>
            <p className={styles['footer__brand-desc']}>
              Tenun ikat dari Jepara, dibuat dengan penuh cinta untuk menghadirkan warisan tradisi dalam gaya modern.
            </p>
            <div className={styles.footer__socials} aria-label="Media sosial">
              <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
              <a href={waUrl} target="_blank" rel="noreferrer">WhatsApp</a>
              <a href={shopeeUrl} target="_blank" rel="noreferrer">Shopee</a>
            </div>
          </div>

          <div className={styles.footer__newsletter}>
            <h4 className={styles['footer__col-title']}>Tetap Terhubung</h4>
            <p className={styles['footer__newsletter-copy']}>
              Dapatkan info koleksi terbaru, kisah wastra, dan penawaran eksklusif dari Tenun Ikat Nura.
            </p>
            <form className={styles.footer__subscribe}>
              <label className={styles.footer__srOnly} htmlFor="footer-email">Alamat email Anda</label>
              <input id="footer-email" type="email" placeholder="Alamat email Anda" />
              <button type="button">Langganan</button>
            </form>
          </div>

          <div className={styles.footer__column}>
            <h4 className={styles['footer__col-title']}>Navigasi</h4>
            <ul className={styles.footer__links}>
              <li><Link href="/">Beranda</Link></li>
              <li><Link href="/collections">Koleksi</Link></li>
              <li><Link href="/contact">Kontak</Link></li>
            </ul>
          </div>

          <div className={styles.footer__column}>
            <h4 className={styles['footer__col-title']}>Kontak</h4>
            <address className={styles.footer__contact}>
              <p>{siteData.contact.address || 'Jepara, Jawa Tengah, Indonesia'}</p>
              <a href={`mailto:${email}`}>{email}</a>
              <a href={waUrl} target="_blank" rel="noreferrer">{waDisplay}</a>
            </address>
          </div>
        </div>

        <div className={styles.footer__bottom}>
          <p>&copy; {new Date().getFullYear()} Tenun Ikat Nura. Hak cipta dilindungi.</p>
          <p>Warisan Tenun <span aria-hidden="true">·</span> Mahakarya Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
