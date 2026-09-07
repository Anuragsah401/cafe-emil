import React from 'react';
import type { Metadata } from 'next';
import { getCmsData } from '@/lib/cms';
import MenuBrowser from '@/components/MenuBrowser';
import { Utensils, Clock, AlertCircle } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const cms = getCmsData();
  const seo = cms.seo['/menu'] || {
    title: 'Menukort | Café Emil i Valby',
    description: 'Se vores fulde menukort med brunch, burgere, pasta, steaks, pizza og drikkevarer.',
    keywords: 'menukort, Café Emil, brunch Valby, burgere Valby',
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `${cms.restaurant.websiteUrl}/menu`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${cms.restaurant.websiteUrl}/menu`,
    },
  };
}

export default function MenuPage() {
  const cms = getCmsData();

  return (
    <div className="pt-32 pb-24 bg-yumix-bg text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yumix-card border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>Café Emil Menukort</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Vores Menukort i Valby
          </h1>

          <p className="text-sm sm:text-base text-yumix-muted leading-relaxed font-normal">
            Vores menuer er sammensat med fokus på kvalitet, friskhed og kreativitet, så vi kan imødekomme enhver smag og anledning. Alle retter tilberedes på bestilling med de fineste råvarer.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-yumix-muted">
            <span className="flex items-center gap-1.5 bg-yumix-card px-4 py-2 rounded-full border border-white/10">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              Brunch alle dage kl. 10:00 – 14:00
            </span>
            <span className="flex items-center gap-1.5 bg-yumix-card px-4 py-2 rounded-full border border-white/10">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
              Efterspørg tjeneren for allergener
            </span>
          </div>
        </div>

        {/* Crawlable HTML Menu & Interactive Filter */}
        <MenuBrowser
          categories={cms.menuCategories}
          items={cms.menuItems}
          initialCategory="alle"
        />

        {/* Allergen & Dietary Information Footer */}
        <div className="mt-20 p-8 rounded-3xl bg-yumix-card border border-white/10 shadow-xl max-w-4xl mx-auto text-center space-y-3">
          <h3 className="text-lg font-bold text-white">
            Allergener &amp; Særlige Hensyn
          </h3>
          <p className="text-xs sm:text-sm text-yumix-muted leading-relaxed">
            Har du allergi over for gluten, laktose, nødder eller andre fødevarer? Informer venligst vores personale ved bordbestilling eller ankomst, så tilpasser vores køkken gerne retten til dig.
          </p>
          <div className="pt-2">
            <a
              href={`tel:${cms.restaurant.phone.replace(/\s+/g, '')}`}
              className="text-xs font-semibold text-zinc-300 hover:text-white hover:underline transition-colors"
            >
              Ring til os på {cms.restaurant.phone} ved spørgsmål
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
