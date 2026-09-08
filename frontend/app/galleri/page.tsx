import React from 'react';
import type { Metadata } from 'next';
import { getServerCmsData } from '@/lib/cms-server';
import GalleriPageView from '@/components/GalleriPageView';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getServerCmsData();
  const seo = cms.seo['/galleri'] || {
    title: 'Galleri | Se Billeder af Mad, Stemning & Terrasse | Café Emil',
    description: 'Få et indblik i den hyggelige stemning hos Café Emil i Valby.',
    keywords: 'billeder Café Emil, terrasse Valby, atmosfære Valby',
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `${cms.restaurant.websiteUrl}/galleri`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${cms.restaurant.websiteUrl}/galleri`,
    },
  };
}

export default async function GalleriPage() {
  const cms = await getServerCmsData();
  return <GalleriPageView cms={cms} />;
}
