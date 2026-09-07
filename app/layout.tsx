import type { Metadata } from 'next';
import './globals.css';
import { getCmsData } from '@/lib/cms';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileFloatingBar from '@/components/MobileFloatingBar';
import RestaurantJsonLd from '@/components/RestaurantJsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const cms = getCmsData();
  const homeSeo = cms.seo['/'] || {
    title: 'Café Emil | Café & Restaurant i Valby',
    description: 'Besøg Café Emil i Valby og nyd brunch, frokost, middag, drinks og hyggelig caféstemning.',
    keywords: 'Café Emil, café Valby, restaurant Valby, brunch Valby',
  };

  return {
    title: {
      default: homeSeo.title,
      template: `%s | ${cms.restaurant.name}`,
    },
    description: homeSeo.description,
    keywords: homeSeo.keywords,
    metadataBase: new URL(cms.restaurant.websiteUrl),
    alternates: {
      canonical: cms.restaurant.websiteUrl,
    },
    openGraph: {
      title: homeSeo.title,
      description: homeSeo.description,
      url: cms.restaurant.websiteUrl,
      siteName: cms.restaurant.name,
      locale: 'da_DK',
      type: 'website',
      images: [
        {
          url: 'https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg',
          width: 1200,
          height: 630,
          alt: 'Café Emil i Valby',
        },
      ],
    },
    icons: {
      icon: 'https://cafeemil.dk/wp-content/uploads/2024/12/cropped-favicon-cafeemil-32x32.jpg',
      apple: 'https://cafeemil.dk/wp-content/uploads/2024/12/cropped-favicon-cafeemil-180x180.jpg',
    },
  };
}

import SmoothScrollProvider from '@/components/SmoothScroll';
import AmbientSoundPlayer from '@/components/AmbientSoundPlayer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cms = getCmsData();

  return (
    <html lang="da" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <RestaurantJsonLd cms={cms} />
      </head>
      <body className="flex min-h-screen flex-col bg-yumix-bg text-yumix-text selection:bg-emil-red selection:text-white pb-16 md:pb-0">
        <SmoothScrollProvider>
          <Navbar restaurant={cms.restaurant} />
          <main className="flex-1">{children}</main>
          <Footer cms={cms} />
          <MobileFloatingBar restaurant={cms.restaurant} />
          <AmbientSoundPlayer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

