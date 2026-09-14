'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollReveal from '@/components/ui/ScrollReveal';
import siteData from '@/data/site.json';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  const waNumber = siteData.contact.whatsapp || '6281252783496';
  const waDisplay = siteData.contact.whatsappDisplay || '0812-5278-3496';

  const waMessage = `Halo Admin Tenun Ikat Nura, saya ingin menanyakan informasi seputar koleksi busana tenun ikat. Terima kasih!`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    <>
      <Navbar />
      <main className={styles.contactPage}>
        <section className={styles.contactHero}>
          <div className={styles.container}>
            <ScrollReveal>
              <div className={styles.contentWrapper}>
                <span className={styles.eyebrow}>CONTACT</span>
                <h1 className={styles.title}>Let&apos;s Connect</h1>
                <div className={styles.divider} />
                <p className={styles.subtitle}>
                  Have a question about our collection or interested in a particular piece? We&apos;d love to hear from you.
                </p>

                {/* Primary WhatsApp CTA Button */}
                <div className={styles.ctaWrapper}>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.waBtn}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l.999 1.59-1.048 3.834 3.792-.996z"/>
                    </svg>
                    <span>WHATSAPP US</span>
                  </a>
                </div>

                {/* Simple Contact Information Grid */}
                <div className={styles.infoGrid}>
                  <div className={styles.infoCard}>
                    <span className={styles.infoLabel}>WHATSAPP</span>
                    <strong className={styles.infoValue}>{waDisplay}</strong>
                  </div>

                  <div className={styles.infoCard}>
                    <span className={styles.infoLabel}>INSTAGRAM</span>
                    <a
                      href={siteData.contact.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.infoLink}
                    >
                      @{siteData.contact.instagram}
                    </a>
                  </div>

                  <div className={styles.infoCard}>
                    <span className={styles.infoLabel}>SHOPEE</span>
                    <a
                      href={siteData.contact.shopeeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.infoLink}
                    >
                      {siteData.contact.shopee}
                    </a>
                  </div>

                  <div className={styles.infoCard}>
                    <span className={styles.infoLabel}>LOCATION</span>
                    <strong className={styles.infoValue}>Jepara, Jawa Tengah, Indonesia</strong>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
