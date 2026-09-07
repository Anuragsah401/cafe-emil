import React from 'react';
import type { Metadata } from 'next';
import { getCmsData } from '@/lib/cms';
import BookBordPageView from '@/components/BookBordPageView';

export async function generateMetadata(): Promise<Metadata> {
  const cms = getCmsData();
  const seo = cms.seo['/book-bord'] || {
    title: 'Book Bord online | Reserver dit bord hos Café Emil i Valby',
    description: 'Reserver bord online hos Café Emil via SeatBooking eller ring på 36 44 74 41.',
    keywords: 'book bord Café Emil, bordreservation Valby, Seatbooking Valby',
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `${cms.restaurant.websiteUrl}/book-bord`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${cms.restaurant.websiteUrl}/book-bord`,
    },
  };
}

export default function BookBordPage() {
  const cms = getCmsData();
  return <BookBordPageView cms={cms} />;
}

