import Link from 'next/link';
import siteData from '@/data/site.json';
import styles from './Footer.module.css';

export default function Footer() {
  const waDisplay = siteData.contact.whatsappDisplay || '0812-5278-3496';
  const waUrl = `https://wa.me/${siteData.contact.whatsapp || '6281252783496'}`;
  const instagramUrl = siteData.contact.instagramUrl || 'https://instagram.com/Tenun_ikat_nura';
  const shopeeUrl = siteData.contact.shopeeUrl || 'https://shopee.co.id/tenun_ikat_nura';

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footer__inner}>
        <div className={styles.footer__top}>
          <div className={styles.footer__brand}>
            <h3 className={styles['footer__brand-title']}>Tenun Ikat Nura</h3>
            <p className={styles['footer__brand-desc']}>
              Indonesian Luxury Woven Fashion House. Merayakan warisan tenun Nusantara dalam estetika desain modern dan elegan.
            </p>
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
            <h4 className={styles['footer__col-title']}>Boutique &amp; Connect</h4>
            <ul className={styles.footer__links}>
              <li><a href={waUrl} target="_blank" rel="noreferrer">WhatsApp: {waDisplay}</a></li>
              <li><a href={shopeeUrl} target="_blank" rel="noreferrer">Shopee: Tenun Ikat Nura</a></li>
              <li><a href={instagramUrl} target="_blank" rel="noreferrer">Instagram: @Tenun_ikat_nura</a></li>
              <li>{siteData.contact.address || 'Jepara, Jawa Tengah, Indonesia'}</li>
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
