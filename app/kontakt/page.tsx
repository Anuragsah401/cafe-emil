import React from 'react';
import type { Metadata } from 'next';
import { getServerCmsData } from '@/lib/cms-server';
import KontaktPageView from '@/components/KontaktPageView';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getServerCmsData();
  const seo = cms.seo['/kontakt'] || {
    title: 'Kontakt Café Emil | Find Vej, Åbningstider & Telefon | Valby',
    description: 'Find Café Emil på Annexstræde 3, 2500 Valby. Se vores åbningstider og ring på 36 44 74 41.',
    keywords: 'kontakt Café Emil, adresse Café Emil, åbningstider Valby',
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `${cms.restaurant.websiteUrl}/kontakt`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${cms.restaurant.websiteUrl}/kontakt`,
    },
  };
}

export default async function KontaktPage() {
  const cms = await getServerCmsData();
  return <KontaktPageView cms={cms} />;
}
