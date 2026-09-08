'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Clock, ShieldCheck, ArrowUpRight, Heart, Flame } from 'lucide-react';
import { CmsData } from '@/lib/cms';

interface FooterProps {
  cms: CmsData;
}

export default function Footer({ cms }: FooterProps) {
  const pathname = usePathname();
  const { restaurant, openingHours } = cms;

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#090C10] text-white pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-16 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block group">
              <img
                src={restaurant.logoUrl || "/images/cafeemil-logo.png"}
                alt="Café Emil"
                className="h-9 w-auto object-contain drop-shadow-[0_2px_8px_rgba(215,42,22,0.35)] group-hover:scale-105 transition-transform"
              />
              <span className="text-[11px] text-neutral-400 tracking-widest uppercase font-medium block mt-2">
                Annexstræde 3, 2500 Valby
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-yumix-muted leading-relaxed max-w-sm">
              {restaurant.tagline}. Dit lokale mødested i hjertet af Valby med fokus på god mad, frisk kaffe, brætspil og uforglemmelige stunder på terrassen.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={restaurant.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-emil-red hover:text-white flex items-center justify-center text-xs font-bold transition-colors border border-white/10"
                aria-label="Facebook"
              >
                FB
              </a>
              <a
                href={restaurant.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-emil-red hover:text-white flex items-center justify-center text-xs font-bold transition-colors border border-white/10"
                aria-label="Instagram"
              >
                IG
              </a>
              <a
                href={restaurant.smileyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-colors"
                title="Fødevarestyrelsens kontrolrapport"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                <span>Smiley Rapport</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-yumix-muted">
              <li><Link href="/" className="hover:text-white transition-colors">Forside</Link></li>
              <li><Link href="/menu" className="hover:text-white transition-colors">Menukort</Link></li>
              <li><Link href="/brunch" className="hover:text-white transition-colors">Brunch</Link></li>
              <li><Link href="/selskaber" className="hover:text-white transition-colors">Selskaber</Link></li>
              <li><Link href="/om-os" className="hover:text-white transition-colors">Om Café Emil</Link></li>
              <li><Link href="/galleri" className="hover:text-white transition-colors">Galleri</Link></li>
              <li><Link href="/takeaway" className="hover:text-white transition-colors">Takeaway</Link></li>
              <li><Link href="/book-bord" className="text-zinc-200 font-bold hover:text-white hover:underline transition-colors">Book bord online</Link></li>
            </ul>
          </div>

          {/* Hours */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Åbningstider</span>
            </h4>
            <ul className="space-y-2 text-xs text-yumix-muted">
              {openingHours.schedule.map((item) => (
                <li key={item.id} className="border-b border-white/5 pb-2">
                  <div className="flex justify-between font-bold text-white">
                    <span>{item.days}</span>
                    <span className="font-mono text-white">{item.open} – {item.close}</span>
                  </div>
                  <div className="text-[11px] text-yumix-muted/80 mt-0.5">
                    Køkkenet lukker kl. {item.kitchenClose}
                  </div>
                </li>
              ))}
              <li className="pt-1 text-amber-300 font-medium text-xs">
                ☀️ {openingHours.brunchHours}
              </li>
            </ul>
          </div>

          {/* Location & Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>Find os i Valby</span>
            </h4>
            <div className="space-y-2 text-xs text-yumix-muted">
              <p>
                <strong className="text-white block">{restaurant.name}</strong>
                {restaurant.streetAddress}<br />
                {restaurant.postalCode} {restaurant.city} (300m fra Valby St.)
              </p>
              <p className="pt-1">
                Tlf: <a href={`tel:${restaurant.phone.replace(/\s+/g, '')}`} className="text-white font-mono font-bold hover:text-amber-300 transition-colors">{restaurant.phone}</a>
              </p>
              <p>
                Email: <a href={`mailto:${restaurant.email}`} className="text-white hover:text-amber-300 transition-colors">{restaurant.email}</a>
              </p>
              <div className="pt-2">
                <a
                  href={restaurant.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-300 hover:text-white hover:underline font-medium text-xs transition-colors"
                >
                  <span>Åbn i Google Maps</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-yumix-muted gap-4">
          <p>© {new Date().getFullYear()} {restaurant.name}. Alle rettigheder forbeholdes.</p>
          <div className="flex items-center gap-4">
            <span>Annexstræde 3, 2500 Valby</span>
            <span>•</span>
            <Link href="/admin" className="hover:text-white transition-colors">Admin CMS</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
