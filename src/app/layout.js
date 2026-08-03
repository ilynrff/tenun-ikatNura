import './globals.css';
import siteData from '@/data/site.json';

export const metadata = {
  title: siteData.seo.title,
  description: siteData.seo.description,
  keywords: siteData.seo.keywords.join(', '),
  openGraph: {
    title: siteData.seo.title,
    description: siteData.seo.description,
    type: 'website',
    locale: 'id_ID',
    siteName: 'Tenun Ikat Nura',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteData.seo.title,
    description: siteData.seo.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Tenun Ikat Nura',
    'url': 'https://tenunikatnura.com',
    'logo': 'https://tenunikatnura.com/images/logo/logo-main.jpg',
    'sameAs': [
      'https://instagram.com/Tenun_ikat_nura',
      'https://shopee.co.id/tenun_ikat_nura'
    ],
    'description': siteData.brand.description,
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+62-858-0010-0254',
      'contactType': 'sales',
      'areaServed': 'ID',
      'availableLanguage': 'Indonesian'
    }
  };

  return (
    <html lang="id">
      <head>
        {/* Suppress transient extension / HMR removeChild DOM errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(e) {
                  if (e.message && e.message.includes('removeChild')) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              }
            `,
          }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
