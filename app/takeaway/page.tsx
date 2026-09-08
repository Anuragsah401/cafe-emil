import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerCmsData } from '@/lib/cms-server';
import { ShoppingBag, Phone, Utensils } from 'lucide-react';

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getServerCmsData();
  const seo = cms.seo['/takeaway'] || {
    title: 'Bestil Takeaway i Valby | Nyd maden derhjemme | Café Emil',
    description: 'Bestil lækker takeaway fra Café Emil i Valby. Burgere, pasta, sprøde pizzaer og grillretter. Ring på 36 44 74 41.',
    keywords: 'takeaway Valby, mad ud af huset Valby, hente mad Valby',
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `${cms.restaurant.websiteUrl}/takeaway`,
    },
  };
}

export default async function TakeawayPage() {
  const cms = await getServerCmsData();
  const { restaurant, sections } = cms;

  const popularTakeaways = cms.menuItems
    .filter((item) => ['burgere', 'pizza', 'pasta', 'sandwich'].includes(item.categoryId))
    .slice(0, 6);

  return (
    <div className="pt-32 pb-24 bg-yumix-bg text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yumix-card border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Tag Café Emil med hjem</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            {sections.takeaway.title}
          </h1>

          <p className="text-base sm:text-lg text-yumix-muted leading-relaxed">
            {sections.takeaway.description}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
              className="px-8 py-4 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-red-600/30"
            >
              <Phone className="w-4 h-4" />
              <span>Ring og bestil: {restaurant.phone}</span>
            </a>
            <Link
              href="/menu"
              className="px-8 py-4 rounded-full bg-yumix-card border border-white/15 text-white font-bold text-xs tracking-wide hover:bg-white/10 flex items-center gap-2"
            >
              <Utensils className="w-4 h-4 text-zinc-300" />
              <span>Se takeaway menukort</span>
            </Link>
          </div>
        </div>

        {/* How it works 3-steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-yumix-card p-8 rounded-3xl border border-white/10 shadow-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white font-black flex items-center justify-center mx-auto text-base">
              1
            </div>
            <h2 className="text-lg font-bold text-white">Vælg dine retter</h2>
            <p className="text-xs sm:text-sm text-yumix-muted">
              Gå på opdagelse i vores menukort med burgere, sprøde pizzaer, mættende pastaretter og salater.
            </p>
          </div>

          <div className="bg-yumix-card p-8 rounded-3xl border border-white/10 shadow-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white font-black flex items-center justify-center mx-auto text-base">
              2
            </div>
            <h2 className="text-lg font-bold text-white">Ring og bestil</h2>
            <p className="text-xs sm:text-sm text-yumix-muted">
              Ring direkte til caféen på <strong className="text-white">{restaurant.phone}</strong>. Vi bekræfter afhentningstidspunktet med det samme.
            </p>
          </div>

          <div className="bg-yumix-card p-8 rounded-3xl border border-white/10 shadow-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white font-black flex items-center justify-center mx-auto text-base">
              3
            </div>
            <h2 className="text-lg font-bold text-white">Hent frisklavet mad</h2>
            <p className="text-xs sm:text-sm text-yumix-muted">
              Afhent din frisklavede, varme mad på <strong className="text-white">Annexstræde 3 i Valby</strong> og nyd den derhjemme.
            </p>
          </div>
        </div>

        {/* Popular Takeaway Dishes */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Favoritter
            </span>
            <h2 className="text-3xl font-black text-white mt-1">
              Populære takeaway retter
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTakeaways.map((dish) => (
              <div
                key={dish.id}
                className="bg-yumix-card rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{dish.name}</h3>
                    <span className="font-mono font-black text-sm text-white bg-white/10 px-3 py-1 rounded-full border border-white/15">
                      {dish.price},-
                    </span>
                  </div>
                  <p className="text-xs text-yumix-muted leading-relaxed">
                    {dish.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Klar til afhentning
                  </span>
                  <a
                    href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
                    className="font-extrabold text-zinc-300 hover:text-white hover:underline transition-colors"
                  >
                    Ring og bestil →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location / Pickup Box */}
        <div className="bg-yumix-card text-white p-8 sm:p-12 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Afhentningsadresse
            </span>
            <h3 className="text-2xl font-black text-white">
              {restaurant.name} – {restaurant.streetAddress}
            </h3>
            <p className="text-xs text-yumix-muted">
              2500 Valby (300m fra Valby Station) • Telefon: {restaurant.phone}
            </p>
          </div>

          <a
            href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
            className="px-8 py-4 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-extrabold text-xs uppercase tracking-wider transition-colors shrink-0 shadow-lg shadow-red-600/30"
          >
            Ring nu: {restaurant.phone}
          </a>
        </div>
      </div>
    </div>
  );
}
