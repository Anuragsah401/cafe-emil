'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Phone,
  Calendar,
  Utensils,
  Coffee,
  Wine,
  Info,
  Image as ImageIcon,
  ShoppingBag,
  MapPin,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { RestaurantInfo } from '@/lib/cms';
import SeatBookingModal from './SeatBookingModal';

interface NavbarProps {
  restaurant: RestaurantInfo;
}

export default function Navbar({ restaurant }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Core streamlined navigation links for desktop
  const desktopNavLinks = [
    { href: '/menu', label: 'Menukort' },
    { href: '/brunch', label: 'Brunch' },
    { href: '/selskaber', label: 'Selskaber' },
    { href: '/galleri', label: 'Galleri' },
    { href: '/om-os', label: 'Om os' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  // Rich navigation links for mobile drawer
  const mobileNavLinks = [
    {
      href: '/menu',
      label: 'Menukort',
      sub: 'Brunch, burgere, pasta & pizza',
      icon: Utensils,
    },
    {
      href: '/brunch',
      label: 'Brunch',
      sub: 'Serveres alle dage indtil 15:00',
      icon: Coffee,
    },
    {
      href: '/selskaber',
      label: 'Selskaber',
      sub: 'Fester & private selskaber',
      icon: Wine,
    },
    {
      href: '/om-os',
      label: 'Om Café Emil',
      sub: 'Vores historie & hyggelige rammer',
      icon: Info,
    },
    {
      href: '/galleri',
      label: 'Galleri',
      sub: 'Stemningsbilleder & madfotos',
      icon: ImageIcon,
    },
    {
      href: '/takeaway',
      label: 'Takeaway',
      sub: 'Bestil mad to-go',
      icon: ShoppingBag,
    },
    {
      href: '/kontakt',
      label: 'Kontakt & Find Vej',
      sub: `${restaurant.streetAddress || 'Valby Tingsted 4'}`,
      icon: MapPin,
    },
  ];

  // Do not display website public navbar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* ========================================================
          STICKY TOP FLOATING CAPSULE NAVBAR
          ======================================================== */}
      <header className="fixed top-3 sm:top-4 left-0 right-0 z-40 flex justify-center px-3 sm:px-6 pointer-events-none">
        <div className="w-full max-w-5xl bg-[#141011]/95 backdrop-blur-2xl border border-white/15 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-2xl shadow-black/80 pointer-events-auto transition-all">
          
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center group py-0.5 shrink-0 pr-2 lg:pr-3"
            aria-label="Café Emil Forside"
          >
            <img
              src={restaurant.logoUrl || '/images/cafeemil-logo.png'}
              alt="Café Emil"
              className="h-7 sm:h-8 w-auto object-contain drop-shadow-[0_2px_8px_rgba(215,42,22,0.35)] group-hover:scale-105 transition-transform duration-200"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-[13px] lg:text-sm font-semibold tracking-normal">
            {desktopNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative px-4 py-2 rounded-full transition-all duration-200 ease-out border font-bold ${
                    isActive
                      ? 'bg-white text-[#120F10] border-white shadow-lg shadow-white/20 hover:bg-zinc-100 hover:-translate-y-0.5'
                      : 'border-transparent text-zinc-200 hover:text-white hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_18px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:scale-95'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {!isActive && (
                    <span className="absolute inset-x-3.5 bottom-1.5 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: CTA + Mobile Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Book bord CTA Button (Desktop only - mobile uses drawer & bottom floating bar) */}
            <button
              onClick={() => setIsBookingOpen(true)}
              className="hidden md:flex px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-red-600/30 items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book bord</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                isOpen
                  ? 'bg-white/15 border-white/25 text-white shadow-inner'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
              }`}
              aria-label={isOpen ? 'Luk menu' : 'Åbn menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="w-4 h-4 transition-transform duration-200 rotate-90" />
              ) : (
                <Menu className="w-4 h-4 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          MOBILE MENU BACKDROP OVERLAY
          ======================================================== */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/75 backdrop-blur-md z-50 animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* ========================================================
          MOBILE MENU SLIDE-DOWN SHEET
          ======================================================== */}
      {isOpen && (
        <aside
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed top-[68px] left-3 right-3 z-50 max-w-md mx-auto bg-[#141011]/98 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl shadow-black/90 flex flex-col justify-between max-h-[calc(100vh-5.5rem)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-3 duration-200"
        >
          {/* Sheet Header Status Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-300">
                Café Emil • Valby
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Clock className="w-3 h-3" />
              <span>Åbent i dag</span>
            </span>
          </div>

          {/* Navigation Links (Scrollable if needed) */}
          <div className="overflow-y-auto pr-1 space-y-1.5 my-1 max-h-[46vh] no-scrollbar">
            {mobileNavLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-emil-red/20 border border-emil-red/40 text-white shadow-sm'
                      : 'hover:bg-white/5 border border-transparent text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-emil-red text-white shadow-md shadow-red-600/30'
                          : 'bg-white/5 text-zinc-400 group-hover:bg-white/10 group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold tracking-tight text-white group-hover:text-white">
                        {link.label}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {link.sub}
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isActive ? 'text-emil-red' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Bottom Actions Footer */}
          <div className="pt-3 border-t border-white/10 space-y-2 mt-2">
            {/* Primary CTA: Book Bord */}
            <button
              onClick={() => {
                setIsOpen(false);
                setIsBookingOpen(true);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-98 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Book bord online</span>
            </button>

            {/* Quick Contact Dual Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span className="truncate">Ring op</span>
              </a>

              <a
                href={restaurant.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span className="truncate">Find vej</span>
              </a>
            </div>
          </div>
        </aside>
      )}

      {/* SeatBooking Modal */}
      <SeatBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        restaurant={restaurant}
      />
    </>
  );
}
