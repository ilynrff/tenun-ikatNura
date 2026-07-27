import siteData from '@/data/site.json';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './CTABanner.module.css';

export default function CTABanner({ 
  title = "Discover Our Collection", 
  subtitle = "Experience Indonesian Heritage Fashion." 
}) {
  return (
    <section className={styles.cta}>
      <ScrollReveal>
        <div className={styles.cta__inner}>
          <div className={styles.cta__ornament}>
            <span className={styles['cta__ornament-line']} />
            <span className={styles['cta__ornament-diamond']} />
            <span className={styles['cta__ornament-line']} />
          </div>

          <h2 className={styles.cta__title}>{title}</h2>
          <p className={styles.cta__subtitle}>{subtitle}</p>

          <div className={styles.cta__buttons}>
            <a
              href={`https://wa.me/${siteData.contact.whatsapp}?text=Halo,%20saya%20tertarik%20dengan%20koleksi%20Tenun%20Ikat%20Nura`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat WhatsApp
            </a>
            <a
              href={siteData.contact.shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--shopee"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
              View on Shopee
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
