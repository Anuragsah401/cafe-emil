'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Calendar, Sparkles } from 'lucide-react';
import { RestaurantInfo } from '@/lib/cms';
import SeatBookingModal from './SeatBookingModal';

interface NavbarProps {
  restaurant: RestaurantInfo;
}

export default function Navbar({ restaurant }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Core streamlined navigation links for desktop
  const desktopNavLinks = [
    { href: '/menu', label: 'Menukort' },
    { href: '/brunch', label: 'Brunch' },
    { href: '/selskaber', label: 'Selskaber' },
    { href: '/om-os', label: 'Om os' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  // Full navigation links for mobile drawer
  const allNavLinks = [
    { href: '/', label: 'Forside' },
    { href: '/menu', label: 'Menukort' },
    { href: '/brunch', label: 'Brunch' },
    { href: '/selskaber', label: 'Selskaber' },
    { href: '/om-os', label: 'Om Café Emil' },
    { href: '/galleri', label: 'Galleri' },
    { href: '/takeaway', label: 'Takeaway' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  // Do not display website public navbar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-40 flex justify-center px-4 sm:px-6 pointer-events-none">
        <div className="w-full max-w-4xl bg-[#141011]/85 backdrop-blur-xl border border-white/10 rounded-full px-4 sm:px-6 py-2 flex items-center justify-between shadow-2xl shadow-black/50 pointer-events-auto transition-all">
          {/* Brand Logo - clean and uncluttered */}
          <Link href="/" className="flex items-center group py-0.5" aria-label="Café Emil Forside">
            <img
              src={restaurant.logoUrl || "/images/cafeemil-logo.png"}
              alt="Café Emil"
              className="h-7 sm:h-8 w-auto object-contain drop-shadow-[0_2px_8px_rgba(215,42,22,0.35)] group-hover:scale-105 transition-transform duration-200"
            />
          </Link>

          {/* Desktop Navigation Links - streamlined and quiet */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-medium tracking-wide">
            {desktopNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                    isActive
                      ? 'bg-white/10 text-white font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-4 sm:px-5 py-2 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book bord</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Åbn menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isOpen && (
          <div className="md:hidden fixed top-20 left-4 right-4 max-w-sm mx-auto bg-[#161213]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-1">
              {allNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-emil-red/20 text-white font-bold border border-emil-red/40'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emil-red" />}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsBookingOpen(true);
                }}
                className="w-full py-3 rounded-full bg-emil-red text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
              >
                <Calendar className="w-4 h-4" />
                <span>Book bord online</span>
              </button>

              <a
                href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
                className="w-full py-2.5 rounded-full bg-white/5 text-neutral-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>Ring: {restaurant.phone}</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* SeatBooking Modal */}
      <SeatBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        restaurant={restaurant}
      />
    </>
  );
}
