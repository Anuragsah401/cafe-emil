'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Phone, Utensils, MapPin } from 'lucide-react';
import { RestaurantInfo } from '@/lib/cms';
import SeatBookingModal from './SeatBookingModal';

interface MobileFloatingBarProps {
  restaurant: RestaurantInfo;
}

export default function MobileFloatingBar({ restaurant }: MobileFloatingBarProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-yumix-card/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center justify-between shadow-2xl">
        {/* Ring op */}
        <a
          href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
          className="flex flex-col items-center gap-0.5 text-[10px] text-yumix-muted hover:text-white px-2 py-1"
        >
          <Phone className="w-4 h-4 text-zinc-300" />
          <span>Ring</span>
        </a>

        {/* Menu */}
        <Link
          href="/menu"
          className="flex flex-col items-center gap-0.5 text-[10px] text-yumix-muted hover:text-white px-2 py-1"
        >
          <Utensils className="w-4 h-4 text-zinc-300" />
          <span>Menu</span>
        </Link>

        {/* Book bord primary */}
        <button
          onClick={() => setIsBookingOpen(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emil-red text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 active:scale-95 transition-transform"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book bord</span>
        </button>

        {/* Find vej */}
        <a
          href={restaurant.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 text-[10px] text-yumix-muted hover:text-white px-2 py-1"
        >
          <MapPin className="w-4 h-4 text-zinc-300" />
          <span>Kort</span>
        </a>
      </div>

      <SeatBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        restaurant={restaurant}
      />
    </>
  );
}
