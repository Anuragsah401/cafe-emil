import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerCmsData } from '@/lib/cms-server';
import { Calendar, Clock, MapPin, Check, Sparkles, Phone } from 'lucide-react';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getServerCmsData();
  const seo = cms.seo['/brunch'] || {
    title: 'Brunch i Valby | Klassisk & Maidens Brunch | Café Emil',
    description: 'Nyd brunch hos Café Emil i Valby alle dage kl. 10:00–14:00. Klassisk og Maidens brunch for 149 kr. inkl. juice.',
    keywords: 'brunch Valby, weekendbrunch Valby, morgenmad Valby',
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `${cms.restaurant.websiteUrl}/brunch`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${cms.restaurant.websiteUrl}/brunch`,
      images: [{ url: 'https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg' }],
    },
  };
}

export default async function BrunchPage() {
  const cms = await getServerCmsData();

  return (
    <div className="pt-32 pb-24 bg-yumix-bg text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yumix-card border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Valby’s mest populære brunch</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Brunch i Valby hos Café Emil
          </h1>

          <p className="text-base sm:text-lg text-yumix-muted leading-relaxed">
            Start dagen med en uovertruffen brunchtallerken fyldt med friske råvarer, varme pandekager og friskpresset juice i hyggelige omgivelser.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-yumix-card border border-white/10 text-xs font-bold text-white shadow-sm">
              <Clock className="w-4 h-4 text-zinc-300" />
              {cms.openingHours.brunchHours}
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-yumix-card border border-white/10 text-xs font-bold text-white shadow-sm">
              <MapPin className="w-4 h-4 text-zinc-300" />
              {cms.restaurant.streetAddress}, {cms.restaurant.city}
            </span>
          </div>
        </div>

        {/* Brunch Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Classic Brunch */}
          <div className="bg-yumix-card rounded-3xl p-8 border border-white/10 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400/90">
                  Populær Klassiker
                </span>
                <span className="font-mono text-3xl font-black text-white">
                  149,- <span className="text-xs text-yumix-muted">DKK</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Klassisk Café Emil Brunch
              </h2>

              <p className="text-sm text-yumix-muted leading-relaxed">
                Vores traditionelle, overdådige brunch sammensat til perfektion:
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-yumix-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-white/90">Røræg serveret med sprød bacon og pølser</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-white/90">Klassiske oste og frisk frugt</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-white/90">Cremet yoghurt toppet med sprød müsli og sirup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-white/90">Lune pandekager, lækker kage, friskbagt brød &amp; smør</span>
                </li>
                <li className="flex items-center gap-2 font-medium text-amber-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Inkluderer et lille glas juice (appelsin, mango eller æble)</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/book-bord"
                className="w-full py-3.5 rounded-full bg-emil-red text-white hover:bg-emil-redHover font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/25"
              >
                <Calendar className="w-4 h-4" />
                <span>Book bord til Klassisk Brunch</span>
              </Link>
            </div>
          </div>

          {/* Maidens Brunch */}
          <div className="bg-yumix-card rounded-3xl p-8 border border-white/15 shadow-2xl relative flex flex-col justify-between space-y-6">
            <div className="absolute -top-3 right-6 bg-emil-red text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              Husets Specialitet
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400/90">
                  Med Middelhavs-twist
                </span>
                <span className="font-mono text-3xl font-black text-white">
                  149,- <span className="text-xs text-zinc-400">DKK</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Maidens Brunch
              </h2>

              <p className="text-sm text-yumix-muted leading-relaxed">
                Vores signaturbrunch inspireret af tyrkiske og sydeuropæiske smagsnoter:
              </p>

              <ul className="space-y-2.5 text-xs sm:text-sm text-yumix-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-white/90">Æg, kyllingepølser og krydret tyrkisk pepperoni (sucuk)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-white/90">Ægte tyrkisk hvid ost, faste oste og oliven</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-white/90">Frisk frugt og yoghurt med müsli &amp; sirup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-white/90">Pandekager, kage, brød og smør</span>
                </li>
                <li className="flex items-center gap-2 font-medium text-amber-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Inkluderer et lille glas juice (appelsin, mango eller æble)</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/book-bord"
                className="w-full py-3.5 rounded-full bg-emil-red text-white hover:bg-emil-redHover font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/25"
              >
                <Calendar className="w-4 h-4" />
                <span>Book bord til Maidens Brunch</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Atmosphere & Drinks Box */}
        <div className="bg-yumix-card text-white rounded-3xl p-8 sm:p-12 border border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center shadow-2xl">
          <div className="space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Drikkevarer til brunchen
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Gør brunchen fuldendt med god kaffe
            </h3>
            <p className="text-xs sm:text-sm text-yumix-muted leading-relaxed">
              Vi brygger frisk kaffe af højeste kvalitet. Nyd en cremet café latte, en intens espresso, eller vælg mellem vores mange økologiske te-varianter fra English Teashop Organic.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-zinc-300 font-medium">
              <span>☕ Barista Kaffe</span>
              <span>•</span>
              <span>🫖 Økologisk Te</span>
              <span>•</span>
              <span>🥤 Milkshakes &amp; Lemonader</span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img
              src="https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg"
              alt="Café Emil brunchbord"
              className="w-full h-64 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
