import React from 'react';
import { getCmsData } from '@/lib/cms';
import HomePageView from '@/components/HomePageView';

export default function HomePage() {
  const cms = getCmsData();
  return <HomePageView cms={cms} />;
}

