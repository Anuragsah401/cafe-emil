import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerCmsData } from '@/lib/cms-server';
import MenuBrowser from '@/components/MenuBrowser';
import { ChevronLeft, Calendar } from 'lucide-react';

export const revalidate = 0;

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  const cms = await getServerCmsData();
  return cms.menuCategories.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const cms = await getServerCmsData();
  const cat = cms.menuCategories.find((c) => c.slug === params.category || c.id === params.category);

  if (!cat) {
    return { title: 'Kategori ikke fundet' };
  }

  const title = `${cat.name} i Valby | ${cat.h1} | Café Emil`;
  const description = `${cat.description} Udforsk vores udvalg af ${cat.name.toLowerCase()} hos Café Emil i Valby. Se priser og ingredienser her.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${cms.restaurant.websiteUrl}/menu/${cat.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${cms.restaurant.websiteUrl}/menu/${cat.slug}`,
    },
  };
}

export default async function CategoryMenuPage({ params }: CategoryPageProps) {
  const cms = await getServerCmsData();
  const cat = cms.menuCategories.find((c) => c.slug === params.category || c.id === params.category);

  if (!cat) {
    notFound();
  }

  const catItems = cms.menuItems.filter((i) => i.categoryId === cat.id);

  const categoryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MenuSection',
    name: cat.name,
    description: cat.description,
    hasMenuItem: catItems.map((item) => ({
      '@type': 'MenuItem',
      name: item.name,
      description: item.description,
      offers: {
        '@type': 'Offer',
        price: item.price,
        priceCurrency: 'DKK',
      },
    })),
  };

  return (
    <div className="pt-32 pb-24 bg-yumix-bg text-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:underline transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Tilbage til hele menukortet</span>
          </Link>
        </div>

        {/* Category Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-amber-400/90 bg-yumix-card border border-white/15 px-4 py-1.5 rounded-full">
            Kategori: {cat.name}
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white">
            {cat.h1}
          </h1>
          <p className="text-sm sm:text-base text-yumix-muted leading-relaxed">
            {cat.description}
          </p>
        </div>

        {/* Menu Browser pre-selected for this category */}
        <MenuBrowser
          categories={cms.menuCategories}
          items={cms.menuItems}
          initialCategory={cat.id}
          showCategoryNavLinks={false}
          restaurant={cms.restaurant}
        />

        {/* Call To Action Box */}
        <div className="mt-16 bg-yumix-card text-white rounded-3xl p-8 md:p-12 text-center space-y-4 max-w-4xl mx-auto border border-white/10 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Frister vores {cat.name.toLowerCase()}?
          </h2>
          <p className="text-xs sm:text-sm text-yumix-muted max-w-xl mx-auto">
            Kom forbi Café Emil på Annexstræde 3 i Valby, eller book et bord online så vi er klar til at byde dig velkommen.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book-bord"
              className="px-6 py-3 rounded-full bg-emil-red text-white font-extrabold text-xs uppercase tracking-wider hover:bg-emil-redHover transition-all flex items-center gap-2 shadow-lg shadow-red-600/30"
            >
              <Calendar className="w-4 h-4" />
              <span>Book bord nu</span>
            </Link>
            <a
              href={`tel:${cms.restaurant.phone.replace(/\s+/g, '')}`}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all border border-white/10"
            >
              Ring: {cms.restaurant.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
