import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getCmsData } from '@/lib/cms';
import { Heart, Sparkles, Users, Coffee, Dices, Calendar } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const cms = getCmsData();
  const seo = cms.seo['/om-os'] || {
    title: 'Om Café Emil | Fortællingen om Smag, Hygge og Fællesskab i Valby',
    description: 'Lær Café Emil at kende. Et lokalt samlingspunkt på Annexstræde 3 i Valby.',
    keywords: 'om Café Emil, café Valby historie, brætspil Valby',
  };

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: `${cms.restaurant.websiteUrl}/om-os`,
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `${cms.restaurant.websiteUrl}/om-os`,
      images: [{ url: 'https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg' }],
    },
  };
}

export default function AboutPage() {
  const cms = getCmsData();
  const { restaurant, sections } = cms;

  return (
    <div className="pt-32 pb-24 bg-yumix-bg text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yumix-card border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Heart className="w-3.5 h-3.5 text-amber-400" />
            <span>Vores Historie &amp; Værdier</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Café Emil – Fortællingen om smag, hygge og fællesskab
          </h1>

          <p className="text-base sm:text-lg text-yumix-muted leading-relaxed">
            Hos Café Emil har vi skabt et sted i hjertet af Valby, hvor gæster kan samles om et veltillavet måltid, friskbrygget kaffe og hyggelige stunder i afslappede omgivelser.
          </p>
        </div>

        {/* Narrative & Story Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Grundlagt i Valby
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Et personligt og autentisk samlingspunkt
            </h2>
            <p className="text-sm sm:text-base text-yumix-muted leading-relaxed">
              Café Emil blev grundlagt ud fra en dyb passion for god mad og ønsket om at skabe et ægte lokalt samlingspunkt. Vi ønskede et sted, hvor man både kan dumpe ind til en hurtig formiddagskaffe, nyde en god frokost med kollegaerne, samle familien til brunch i weekenden, eller hænge ud med vennerne over cocktails og brætspil om aftenen.
            </p>
            <p className="text-sm sm:text-base text-yumix-muted leading-relaxed">
              Vores menukort afspejler sæsonens bedste råvarer kombineret med elskede caféklassikere: saftige gourmetburgere, frisk pasta, møre ribeye steaks, sprøde pizzaer og sprøde salater.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/menu"
                className="px-6 py-3 rounded-full bg-emil-red text-white font-extrabold text-xs uppercase tracking-wider hover:bg-emil-redHover transition-colors shadow-lg shadow-red-600/25"
              >
                Se menukortet
              </Link>
              <Link
                href="/book-bord"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors"
              >
                Book bord
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg"
                alt="Café Emil indretning i Valby"
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://cafeemil.dk/wp-content/uploads/2024/12/kaffe-1024x768.jpg"
                alt="Kaffe på Café Emil"
                className="w-full h-44 object-cover rounded-2xl border border-white/10"
              />
              <img
                src="https://cafeemil.dk/wp-content/uploads/2024/12/selskaber-cafeemil.jpg"
                alt="Terrasse Café Emil"
                className="w-full h-44 object-cover rounded-2xl border border-white/10"
              />
            </div>
          </div>
        </div>

        {/* 3 Core Values */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Vores Filosofi
            </span>
            <h2 className="text-3xl font-black text-white mt-1">
              De værdier der driver os
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-yumix-card p-8 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                1. Kvalitet først
              </h3>
              <p className="text-xs sm:text-sm text-yumix-muted leading-relaxed">
                Hver ret og hver kop kaffe tilberedes med friske, nøje udvalgte råvarer. Vi går aldrig på kompromis med smagen eller tilberedningen.
              </p>
            </div>

            <div className="bg-yumix-card p-8 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-4">
                <Coffee className="w-6 h-6 text-zinc-200" />
              </div>
              <h3 className="text-xl font-bold text-white">
                2. Ægte Hygge
              </h3>
              <p className="text-xs sm:text-sm text-yumix-muted leading-relaxed">
                Fra den varme belysning til det imødekommende smil ved døren – vi gør os umage for, at du føler dig velkommen og hjemme fra første øjeblik.
              </p>
            </div>

            <div className="bg-yumix-card p-8 rounded-3xl border border-white/10 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-zinc-200" />
              </div>
              <h3 className="text-xl font-bold text-white">
                3. Lokalt Fællesskab
              </h3>
              <p className="text-xs sm:text-sm text-yumix-muted leading-relaxed">
                Café Emil er et mødested for Valby. Vi elsker at se stamgæster, børnefamilier, studerende og vennegrupper mødes og dele gode øjeblikke.
              </p>
            </div>
          </div>
        </div>

        {/* Board Games Highlight Box */}
        <div className="bg-yumix-card text-white rounded-3xl p-8 sm:p-12 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-amber-400/90 text-xs font-extrabold uppercase tracking-wider">
              <Dices className="w-4 h-4 text-zinc-400" />
              <span>Brætspil &amp; Socialt samvær</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Spil, grin og nyd et godt glas
            </h3>
            <p className="text-xs sm:text-sm text-yumix-muted leading-relaxed">
              Vi elsker analog hygge. Derfor har vi altid et varieret udvalg af brætspil stående til fri afbenyttelse for caféens gæster. Nyd en kold fadøl eller en frisk cocktail, mens du udfordrer familien i klassiske spil.
            </p>
          </div>
          <div className="lg:col-span-4 text-center lg:text-right">
            <Link
              href="/book-bord"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emil-red text-white font-extrabold text-xs uppercase tracking-wider hover:bg-emil-redHover transition-colors shadow-lg shadow-red-600/30"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserver bord til spilaften</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
