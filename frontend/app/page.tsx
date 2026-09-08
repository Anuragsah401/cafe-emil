import React from 'react';
import { getServerCmsData } from '@/lib/cms-server';
import HomePageView from '@/components/HomePageView';

export const revalidate = 0;

export default async function HomePage() {
  const cms = await getServerCmsData();
  return <HomePageView cms={cms} />;
}
