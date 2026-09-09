'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Utensils,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
  Users,
  Dices,
  Coffee,
  Check,
  ChevronRight,
  Star,
  Plus,
  HelpCircle,
  ChevronDown,
  Compass,
  Flame,
  Award
} from 'lucide-react';
import { CmsData } from '@/lib/cms';
import SeatBookingModal from './SeatBookingModal';

interface HomePageViewProps {
  cms: CmsData;
}

export default function HomePageView({ cms }: HomePageViewProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('brunch');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { restaurant, openingHours, sections, menuCategories, menuItems, gallery, faqs: cmsFaqs, testimonials: cmsTestimonials } = cms;

  // Selected dishes for preview
  const previewDishes = menuItems
    .filter((item) => item.categoryId === selectedCategoryTab)
    .slice(0, 6);

  const faqs = cmsFaqs && cmsFaqs.length > 0 ? cmsFaqs : [
    {
      id: 'faq-1',
      q: 'Hvornår serverer I brunch?',
      a: 'Vi serverer vores populære Klassiske Brunch og Maidens Brunch alle ugens 7 dage fra kl. 10:00 til 14:00. Begge serveres inklusiv et lille glas juice for kun 149 kr.',
    },
    {
      id: 'faq-2',
      q: 'Kan man booke bord på forhånd?',
      a: 'Ja, du kan nemt booke bord online via vores SeatBooking-integration her på siden, eller ringe direkte på 36 44 74 41. Ved selskaber over 8 personer samt fredag/lørdag aften anbefales det at booke i god tid.',
    },
  ];

  const testimonials = cmsTestimonials && cmsTestimonials.length > 0 ? cmsTestimonials : [
    {
      id: 'test-1',
      name: 'Camilla Lindegaard',
      role: 'Lokal gæst fra Valby',
      rating: 5,
      quote: 'Valbys bedste brunch uden tvivl! Deres Maidens Brunch med de tyrkiske oste og sucuk er simpelthen enestående. Hyggelig atmosfære og super sød betjening hver gang.',
    },
    {
      id: 'test-2',
      name: 'Henrik Vestergaard',
      role: 'Firma-arrangement',
      rating: 5,
      quote: 'Vi holdt vores afdelingsmiddag hos Café Emil med 45 personer. Maden, ribeye bøfferne og servicen var helt i top. Kan varmt anbefales til selskaber!',
    },
  ];

  return (
    <div className="w-full bg-yumix-bg text-yumix-text overflow-hidden">
      {/* ========================================================
          01 — HERO SECTION (With Authentic Café Emil Video Background)
          ======================================================== */}
      <section className="relative min-h-[92vh] pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
        {/* ================= BACKGROUND VIDEO LAYER ================= */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          {/* High-res Poster Fallback */}
          <img
            src={sections.hero.videoBackground?.posterImage || "https://cafeemil.dk/wp-content/uploads/2024/12/forside-cafeemil.jpg"}
            alt="Café Emil atmosfære og mad"
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-700"
          />

          {/* Scaled YouTube Background Video (Official Cafe Emil Footage) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[67.5vw] min-h-[120%] min-w-[213vh] pointer-events-none transition-opacity duration-700 opacity-90 sm:opacity-95">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${sections.hero.videoBackground?.youtubeId || 'MHUuvjLxTrg'}?autoplay=1&mute=1&controls=0&loop=1&playlist=${sections.hero.videoBackground?.youtubeId || 'MHUuvjLxTrg'}&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&disablekb=1&fs=0&start=${sections.hero.videoBackground?.startTime || 0}&end=${sections.hero.videoBackground?.endTime || 39}`}
              title="Café Emil Stemning & Mad"
              className="w-full h-full object-cover pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

          {/* Cinematic Vignettes & Gradients */}
          {/* Top shadow for seamless floating navbar integration */}
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#100D0E] via-[#100D0E]/60 to-transparent" />

          {/* Bottom fade into content */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-yumix-bg via-yumix-bg/75 to-transparent" />

          {/* Directional contrast scrim: dark behind text on left, open and clear on center/right */}
          <div className="absolute inset-0 transition-opacity duration-500 bg-gradient-to-r from-[#100D0E]/80 via-[#100D0E]/40 to-transparent sm:to-black/20" />
        </div>

        {/* Subtle Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-[350px] h-[350px] bg-red-950/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yumix-card/90 backdrop-blur-md border border-white/15 shadow-inner text-amber-300 text-xs font-bold uppercase tracking-widest">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Valby’s Hyggeligste Café &amp; Spisested</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              Forkæl dine smagsløg, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300 drop-shadow-[0_2px_12px_rgba(215,42,22,0.3)]">
                nyd ægte caféhygge
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-white/90 leading-relaxed font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
              Hos Café Emil på Annexstræde 3 i Valby kombinerer vi friskbrygget kaffe, berømt brunch, saftige gourmetburgere, sprøde pizzaer og håndrørte cocktails med brætspil og social stemning.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/menu"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-extrabold text-sm uppercase tracking-wider active:scale-95 transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 group"
              >
                <span>Udforsk Menukortet</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-yumix-card hover:bg-yumix-cardHover text-white border border-white/15 font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2.5 shadow-lg"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Book bord online</span>
              </button>
            </div>

            {/* Social Proof Bar */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-xs text-zinc-300 border-t border-white/10 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
              <div className="flex items-center -space-x-2">
                {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                ].map((avatar, i) => (
                  <img
                    key={i}
                    src={avatar}
                    alt="Gæst"
                    className="w-8 h-8 rounded-full border-2 border-yumix-bg object-cover"
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-white">4.9 / 5</span>
                <span>(500+ anmeldelser fra gæster)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Glass Highlight Card (Revealing Background Video) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-sm rounded-3xl bg-black/35 backdrop-blur-md border border-white/15 p-6 space-y-4 shadow-2xl">
              {/* Header inside glass frame */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="w-2.5 h-2.5 rounded-full bg-emil-red animate-pulse" />
                  <span>Oplev Stemningen</span>
                </div>
                <span className="text-[11px] font-semibold text-amber-300/90 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  Valby
                </span>
              </div>

              {/* Floating Menu Highlight Badges */}
              <div className="space-y-2.5">
                <div className="bg-[#141011]/85 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-xl flex items-center gap-3 transform hover:translate-x-1 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-emil-red/20 text-emil-red flex items-center justify-center font-bold text-base shrink-0">
                    🔥
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Mest Populære Burger</div>
                    <div className="text-xs font-bold text-white truncate">Big Ben Gourmet • 172,-</div>
                  </div>
                </div>

                <div className="bg-[#141011]/85 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-xl flex items-center gap-3 transform hover:translate-x-1 transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base shrink-0">
                    ☀️
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Brunch Alle Dage 10–14</div>
                    <div className="text-xs font-bold text-white truncate">Klassisk Brunch • 149,-</div>
                  </div>
                </div>
              </div>

              {/* Footer inside glass card */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  130 pladser inde
                </span>
                <span className="text-amber-400 font-semibold">80 på terrassen</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          02 — DISCOVER OUR FOOD CATEGORY (Yumix Category Strip)
          ======================================================== */}
      <section className="py-16 bg-yumix-card border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
                Udforsk Kategorier
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
                Find præcis det du har lyst til
              </h2>
            </div>
            <Link
              href="/menu"
              className="text-xs font-bold text-zinc-300 hover:text-white hover:underline flex items-center gap-1 self-start md:self-auto transition-colors"
            >
              <span>Se alle kategorier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Category Chips Grid */}
          <div className="fade-up grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
            {[
              { id: 'brunch', name: 'Brunch', icon: '🍳', count: '10-14' },
              { id: 'burgere', name: 'Burgere', icon: '🍔', count: '180g okse' },
              { id: 'sandwich', name: 'Sandwich', icon: '🥪', count: 'M. fritter' },
              { id: 'grillen', name: 'Grillen', icon: '🥩', count: 'Steaks' },
              { id: 'pizza', name: 'Pizza', icon: '🍕', count: 'Stenovn' },
              { id: 'salater', name: 'Salater', icon: '🥗', count: 'Friske' },
              { id: 'pasta', name: 'Pasta', icon: '🍝', count: 'Hjemmelavet' },
              { id: 'desserter', name: 'Desserter', icon: '🍰', count: 'Kager' },
              { id: 'drikkevarer', name: 'Drikke', icon: '🍸', count: 'Cocktails' },
            ].map((cat) => {
              const isSelected = selectedCategoryTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryTab(cat.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center text-center group cursor-pointer ${
                    isSelected
                      ? 'bg-emil-red text-white border-emil-red shadow-lg shadow-red-600/30 scale-105'
                      : 'bg-yumix-bg text-white border-white/10 hover:border-emil-red/40 hover:bg-white/5'
                  }`}
                >
                  <span className="text-2xl mb-1.5">{cat.icon}</span>
                  <span className="text-xs font-bold tracking-tight">{cat.name}</span>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? 'text-white/80 font-semibold' : 'text-yumix-muted'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          03 — POPULAR DISHES (Yumix "Find Your Best Delicious Flavor")
          ======================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="fade-up flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
                Menukort Højdepunkter
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
                Populære Retter hos Café Emil
              </h2>
              <p className="text-xs sm:text-sm text-yumix-muted mt-1 max-w-xl">
                Hver ret er tilberedt med kærlighed og råvarer i særklasse. Se udvalgte retter nedenfor.
              </p>
            </div>
            <Link
              href="/menu"
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-emil-red text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition-colors self-start md:self-auto shrink-0"
            >
              Se hele menukortet ({menuItems.length} retter) →
            </Link>
          </div>

          {/* Dishes Grid */}
          <div className="fade-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewDishes.map((dish) => (
              <div
                key={dish.id}
                className="animate-fade-in bg-yumix-card rounded-3xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Photo container */}
                  <div className="w-full h-48 rounded-2xl overflow-hidden relative mb-4 bg-black/40 border border-white/5">
                    <img
                      src={dish.image || 'https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg'}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 flex items-center gap-1 border border-white/10">
                      <Star className="w-3 h-3 fill-current text-amber-400" />
                      <span>4.9</span>
                    </div>

                    {dish.tags && dish.tags[0] && (
                      <div className="absolute top-3 left-3 bg-emil-red text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                        {dish.tags[0]}
                      </div>
                    )}
                  </div>

                  {/* Title and details */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-yumix-muted leading-relaxed line-clamp-2">
                      {dish.description}
                    </p>
                  </div>
                </div>

                {/* Price and CTA row */}
                <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-yumix-muted uppercase block">Pris</span>
                    <span className="text-xl font-mono font-black text-white">
                      {dish.price},- <span className="text-xs text-zinc-400">DKK</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-emil-red hover:text-white text-white font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Book bord</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link
              href={`/menu/${selectedCategoryTab}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white hover:underline transition-colors"
            >
              <span>Se alle retter i kategorien &ldquo;{selectedCategoryTab}&rdquo;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          04 — STORY & EXPERIENCE (Yumix "More Than Just Food")
          ======================================================== */}
      <section className="py-24 bg-yumix-card border-y border-white/10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="fade-up lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{sections.intro.eyebrow}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              Mere end bare mad – <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">
                Det er en Valby-fortælling
              </span>
            </h2>

            <p className="text-sm sm:text-base text-yumix-muted leading-relaxed font-normal">
              Hos Café Emil på Annexstræde 3 har vi skabt et samlingspunkt i hjertet af Valby. Her kan du sætte dig til rette til en rolig formiddagskaffe, fejre store begivenheder med op til 130 gæster indendørs, eller nyde de lange sommeraftener på vores solrige terrasse med 80 siddepladser.
            </p>

            {/* 4 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { title: 'Friske Råvarer', desc: 'Alt laves fra bunden med sæsonens bedste råvarer.' },
                { title: 'Solrig Terrasse', desc: '80 udendørs pladser til lune sommerdage og forfriskende drinks.' },
                { title: 'Selskaber & Fester', desc: 'Kapacitet op til 130 personer indenfor til store og små arrangementer.' },
                { title: 'Brætspil & Hygge', desc: 'Stort udvalg af brætspil til hyggelige stunder med venner og familie.' },
              ].map((item, idx) => (
                <div key={idx} className={`fade-up delay-${idx + 1} p-4 rounded-2xl bg-yumix-bg border border-white/10`}>
                  <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-yumix-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Numeric Counters */}
            <div className="fade-up delay-4 grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-white">130+</div>
                <div className="text-xs text-yumix-muted mt-0.5">Siddepladser inde</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-white">80</div>
                <div className="text-xs text-yumix-muted mt-0.5">Terrassepladser</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-white">100%</div>
                <div className="text-xs text-yumix-muted mt-0.5">Caféhygge i Valby</div>
              </div>
            </div>
          </div>

          {/* Right Image Composition */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg"
                alt="Café Emil interiør"
                className="fade-up delay-1 w-full h-56 object-cover rounded-3xl border border-white/10"
              />
              <img
                src="https://cafeemil.dk/wp-content/uploads/2024/12/cafe-emil-pizza-1024x1024.jpg"
                alt="Café Emil pizza"
                className="fade-up delay-2 w-full h-72 object-cover rounded-3xl border border-white/10"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://cafeemil.dk/wp-content/uploads/2024/12/selskaber-cafeemil.jpg"
                alt="Café Emil terrasse"
                className="fade-up delay-3 w-full h-72 object-cover rounded-3xl border border-white/10"
              />
              <img
                src="https://cafeemil.dk/wp-content/uploads/2024/12/kaffe-1024x768.jpg"
                alt="Café Emil kaffe"
                className="fade-up delay-4 w-full h-56 object-cover rounded-3xl border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          05 — BRUNCH HIGHLIGHT BANNER
          ======================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="fade-up max-w-7xl mx-auto rounded-4xl bg-gradient-to-r from-red-950/70 via-yumix-card to-yumix-card border border-emil-red/30 p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-bold uppercase tracking-wider">
                ☀️ Serveres alle ugens dage: 10:00 – 14:00
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                Start dagen med Valby’s mest populære brunch
              </h2>
              <p className="text-sm text-yumix-muted leading-relaxed max-w-xl">
                Vælg mellem den klassiske cafébrunch med røræg, bacon, pandekager og frugt – eller vores berømte Maidens Brunch med krydret sucuk, oliven og tyrkiske oste. Inkluderer et lille glas juice efter eget valg.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <span className="text-2xl font-mono font-black text-white">
                  Kun 149,- <span className="text-xs text-zinc-300 font-sans">DKK inkl. juice</span>
                </span>
                <Link
                  href="/brunch"
                  className="px-6 py-3 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-red-600/25"
                >
                  Se brunch menu
                </Link>
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-colors"
                >
                  Book brunchbord
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <img
                src="https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg"
                alt="Brunch på Café Emil"
                className="w-full h-72 object-cover rounded-3xl border-2 border-white/10 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          06 — PRIVATE EVENTS & SELSKABER
          ======================================================== */}
      <section className="py-20 bg-yumix-card border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="fade-up max-w-3xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Selskaber &amp; Fester
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
              Hold dit næste selskab hos Café Emil
            </h2>
            <p className="text-xs sm:text-sm text-yumix-muted mt-2">
              Leder du efter de perfekte rammer til fødselsdag, konfirmation, reception eller firmafest i Valby?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="fade-up delay-1 bg-yumix-bg rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300/90">
                    Indendørs Lokaler
                  </span>
                  <span className="font-mono text-xl font-bold text-white">Op til 130 gæster</span>
                </div>
                <h3 className="text-xl font-bold text-white">Hyggelige &amp; fleksible rammer</h3>
                <p className="text-xs text-yumix-muted leading-relaxed">
                  Vores lyse lokaler kan tilpasses både mindre intime middage og store selskaber. Vi tilpasser gerne menuen præcis efter jeres ønsker.
                </p>
              </div>
              <img
                src="https://cafeemil.dk/wp-content/uploads/2024/12/emil.jpg"
                alt="Indendørs selskab Café Emil"
                className="w-full h-48 object-cover rounded-2xl border border-white/10"
              />
            </div>

            <div className="fade-up delay-2 bg-yumix-bg rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300/90">
                    Solrig Terrasse
                  </span>
                  <span className="font-mono text-xl font-bold text-white">80 siddepladser</span>
                </div>
                <h3 className="text-xl font-bold text-white">Sommerfest &amp; Velkomstdrinks</h3>
                <p className="text-xs text-yumix-muted leading-relaxed">
                  Vores store terrasse i hjertet af Valby er det perfekte sted at samle gæsterne til kold velkomstdrink, snacks og grillstemning i solen.
                </p>
              </div>
              <img
                src="https://cafeemil.dk/wp-content/uploads/2024/12/selskaber-cafeemil.jpg"
                alt="Terrasse selskab Café Emil"
                className="w-full h-48 object-cover rounded-2xl border border-white/10"
              />
            </div>
          </div>

          <div className="fade-up delay-3 text-center pt-2">
            <Link
              href="/selskaber"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emil-red text-white font-extrabold text-xs uppercase tracking-wider hover:bg-emil-redHover transition-colors shadow-lg shadow-red-600/25"
            >
              <span>Send en forespørgsel på selskab</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          07 — BOARD GAMES & HYGGE
          ======================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="fade-up max-w-4xl mx-auto space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 text-white mx-auto flex items-center justify-center">
            <Dices className="w-7 h-7" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
            Spil, Hygge &amp; Godt Selskab
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Valby’s hyggeligste brætspilscafé
          </h2>
          <p className="text-sm sm:text-base text-yumix-muted leading-relaxed max-w-2xl mx-auto">
            Glem skærmene for en stund. Hos Café Emil finder du et stort udvalg af klassiske og nye brætspil, som du frit kan benytte under dit besøg. Nyd en kold fadøl eller en håndrørt cocktail over et godt parti backgammon.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="px-4 py-2 rounded-full bg-yumix-card border border-white/10 text-xs text-white">
              🎲 Backgammon &amp; Skak
            </span>
            <span className="px-4 py-2 rounded-full bg-yumix-card border border-white/10 text-xs text-white">
              🃏 Kortspil &amp; Quizspil
            </span>
            <span className="px-4 py-2 rounded-full bg-yumix-card border border-white/10 text-xs text-white">
              🏆 Børne- og familiespil
            </span>
            <span className="px-4 py-2 rounded-full bg-yumix-card border border-white/10 text-xs text-white">
              🍺 Specialøl &amp; Cocktails til spillet
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          08 — TESTIMONIALS (Yumix "Here's What Our Foodies Are Raving About")
          ======================================================== */}
      <section className="py-24 bg-yumix-card border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="fade-up text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Gæsternes Anmeldelser
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Hvad vores gæster siger
            </h2>
            <p className="text-xs text-yumix-muted">
              Ægte anmeldelser fra vores glade gæster i Valby og København.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`fade-up delay-${idx + 1} bg-yumix-bg rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6 shadow-xl`}
              >
                <div className="space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.name}</h4>
                    <p className="text-[11px] text-yumix-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          09 — FAQ ACCORDION
          ======================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="fade-up max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Ofte Stillede Spørgsmål
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Alt du behøver at vide før dit besøg
            </h2>
          </div>

          <div className="fade-up space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-yumix-card rounded-2xl border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-amber-300 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-yumix-muted leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          10 — OPENING HOURS & LOCATION CARD
          ======================================================== */}
      <section className="py-20 bg-yumix-card border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hours Box */}
          <div className="fade-up delay-1 lg:col-span-6 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Tider &amp; Adresse
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Åbningstider på Annexstræde 3
            </h2>

            <div className="space-y-3 text-xs sm:text-sm">
              {openingHours.schedule.map((item) => (
                <div
                  key={item.id}
                  className="bg-yumix-bg p-4 rounded-2xl border border-white/10 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white block">{item.days}</span>
                    <span className="text-[11px] text-yumix-muted">Køkkenet lukker kl. {item.kitchenClose}</span>
                  </div>
                  <span className="font-mono font-bold text-white text-sm">
                    {item.open} – {item.close}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300">
              ☀️ <strong>Brunch:</strong> Alle ugens 7 dage: 10:00 – 14:00 • 📞 <strong>Fredag &amp; Lørdag:</strong> {openingHours.weekendBookingNotice}
            </div>
          </div>

          {/* Map Embed */}
          <div className="fade-up delay-2 lg:col-span-6 h-80 sm:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <iframe
              title="Café Emil placering i Valby"
              src="https://maps.google.com/maps?q=Annexstræde%203,%202500%20Valby,%20Denmark&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          11 — FINAL BOOKING CTA BANNER
          ======================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="fade-up max-w-4xl mx-auto rounded-4xl bg-gradient-to-b from-red-950/40 via-yumix-card to-black border border-emil-red/30 p-10 sm:p-16 space-y-6 relative shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-emil-red/20 text-emil-red mx-auto flex items-center justify-center font-bold">
            🔥
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Skal vi gemme et bord til dig?
          </h2>

          <p className="text-sm sm:text-base text-yumix-muted max-w-xl mx-auto leading-relaxed">
            Hvad enten du planlægger en hyggelig brunch, frokost med kollegaerne eller en festlig aften i Valby – vi glæder os til at byde dig velkommen.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-extrabold text-sm uppercase tracking-wider active:scale-95 transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book bord online</span>
            </button>

            <a
              href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-zinc-300" />
              <span>Ring: {restaurant.phone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* SeatBooking Modal */}
      <SeatBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        restaurant={restaurant}
        bookingNotice={openingHours.weekendBookingNotice}
      />
    </div>
  );
}
