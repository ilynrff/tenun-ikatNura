'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollReveal from '@/components/ui/ScrollReveal';
import siteData from '@/data/site.json';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  const [formState, setFormState] = useState('idle');
  const waNumber = siteData.contact.whatsapp || '6281252783496';
  const waDisplay = siteData.contact.whatsappDisplay || '0812-5278-3496';
  const address = siteData.contact.address || 'Jepara, Jawa Tengah, Indonesia';

  const waMessage = `Halo Admin Tenun Ikat Nura, saya ingin menanyakan informasi seputar koleksi busana tenun ikat. Terima kasih!`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  function handleSubmit(event) {
    event.preventDefault();
    setFormState('success');
    event.currentTarget.reset();
  }

  return (
    <>
      <Navbar />
      <main className={styles.contactPage}>
        <section className={styles.contactHero}>
          <div className={styles.heroInner}>
            <ScrollReveal>
              <div className={styles.contentWrapper}>
                <span className={styles.eyebrow}>CONTACT</span>
                <h1 className={styles.title}>Let&apos;s Connect</h1>
                <p className={styles.subtitle}>
                  Have a question, a special request, or simply want to know more about our woven heritage? We&apos;d love to hear from you.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className={styles.contactSection}>
          <div className={styles.container}>
            <div className={styles.contactGrid}>
              <ScrollReveal>
                <div className={styles.contactDetails}>
                  <span className={styles.sectionLabel}>GET IN TOUCH</span>
                  <h2 className={styles.sectionTitle}>A conversation begins with a simple hello.</h2>
                  <p className={styles.sectionCopy}>Reach out for collection inquiries, collaborations, or anything you&apos;d like to know about our woven heritage.</p>

                  <div className={styles.detailList}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailIcon} aria-hidden="true">⌖</span>
                      <div><span className={styles.detailLabel}>LOCATION</span><p>{address}</p></div>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailIcon} aria-hidden="true">@</span>
                      <div><span className={styles.detailLabel}>EMAIL</span><a href={`mailto:${siteData.contact.email}`}>{siteData.contact.email}</a></div>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailIcon} aria-hidden="true">↗</span>
                      <div><span className={styles.detailLabel}>WHATSAPP</span><a href={waLink} target="_blank" rel="noopener noreferrer">{waDisplay}</a></div>
                    </div>
                  </div>

                  <div className={styles.socialBlock}>
                    <span className={styles.detailLabel}>FOLLOW OUR JOURNEY</span>
                    <div className={styles.socialLinks}>
                      <a href={siteData.contact.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
                      <a href={siteData.contact.shopeeUrl} target="_blank" rel="noopener noreferrer">Shopee</a>
                      <a href={waLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal>
                <div className={styles.formPanel}>
                  <span className={styles.sectionLabel}>SEND US A MESSAGE</span>
                  <p className={styles.formIntro}>Tell us how we can help.</p>
                  <form className={styles.contactForm} onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                      <label>Name<input name="name" required placeholder="Your name" /></label>
                      <label>Email<input name="email" type="email" required placeholder="Your email address" /></label>
                    </div>
                    <div className={styles.formRow}>
                      <label>WhatsApp / Phone<input name="phone" required placeholder="Your WhatsApp number" /></label>
                      <label>Subject<input name="subject" required placeholder="What is this about?" /></label>
                    </div>
                    <label>Message<textarea name="message" required placeholder="Tell us how we can help..." rows="5" /></label>
                    <button className={styles.submitButton} type="submit">SEND MESSAGE <span aria-hidden="true">↗</span></button>
                    {formState === 'success' && <p className={styles.formSuccess} role="status">Thank you. Your message is ready to be followed up by our team.</p>}
                  </form>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className={styles.locationSection}>
          <div className={styles.container}>
            <div className={styles.locationHeader}>
              <span className={styles.sectionLabel}>VISIT US</span>
              <h2 className={styles.sectionTitle}>Rooted in Jepara.</h2>
              <p className={styles.sectionCopy}>Find us in the heart of Central Java, where craft and culture continue to shape every piece.</p>
            </div>
            <iframe
              className={styles.map}
              title="Location of Tenun Ikat Nura in Jepara, Jawa Tengah"
              src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
              loading="lazy"
            />
            <a className={styles.mapLink} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer">Open location in maps ↗</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
