import React from 'react';
import type { Metadata } from 'next';
import { getServerCmsData } from '@/lib/cms-server';
import SelskaberPageView from '@/components/SelskaberPageView';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getServerCmsData();
  const seo = cms.seo['/selskaber'] || {
    title: 'Selskaber & Private Events i Valby | Op til 130 pers. | Café Emil',
    description: 'Hold dit arrangement hos Café Emil i Valby. Op til 130 indendørs og 80 på terrassen.',
    keywords: 'selskaber Valby, festlokale Valby, konfirmation Valby',
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `${cms.restaurant.websiteUrl}/selskaber`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${cms.restaurant.websiteUrl}/selskaber`,
      images: [{ url: 'https://cafeemil.dk/wp-content/uploads/2024/12/selskaber-cafeemil.jpg' }],
    },
  };
}

export default async function SelskaberPage() {
  const cms = await getServerCmsData();
  return <SelskaberPageView cms={cms} />;
}
