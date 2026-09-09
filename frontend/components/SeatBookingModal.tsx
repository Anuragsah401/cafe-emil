'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Phone, ExternalLink, X, Flame } from 'lucide-react';
import { RestaurantInfo } from '@/lib/cms';

interface SeatBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant?: RestaurantInfo;
  bookingNotice?: string;
}

export default function SeatBookingModal({
  isOpen,
  onClose,
  restaurant,
  bookingNotice,
}: SeatBookingModalProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure portal only mounts client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background body scroll while modal is active
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle Escape key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  // Defensive data fallbacks
  const restName = restaurant?.name || 'Café Emil';
  const restPhone = restaurant?.phone || '36 44 74 41';
  const cleanPhone = String(restPhone).replace(/\s+/g, '');
  const targetBookingUrl =
    restaurant?.seatBookingUrl && !restaurant.seatBookingUrl.includes('cafeemil.dk/book-bord')
      ? restaurant.seatBookingUrl
      : 'https://seatbooking.dk';
  const notice = bookingNotice || `Ring gerne direkte på ${restPhone}.`;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-lg bg-[#181416] rounded-3xl shadow-2xl border border-white/20 overflow-hidden text-white my-auto flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-heading"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#20191B] px-6 py-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-amber-400 font-extrabold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Bordreservation</span>
            </span>
            <h3 id="booking-modal-heading" className="text-xl font-bold text-white mt-0.5">
              Book bord hos {restName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Luk vindue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto no-scrollbar">
          {/* Main Card with Official Partner Text */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 text-center space-y-3.5 shadow-inner">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-red-600/25 to-emil-red/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-600/20">
              <Calendar className="w-7 h-7 text-red-400" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                Reserver bord via vores officielle bookingsystem partner{' '}
                <span className="text-red-400 font-extrabold underline decoration-red-500/40 underline-offset-4">
                  seatbooking.dk
                </span>
              </h4>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
                Reserve table using official booking engine/system partner{' '}
                <span className="font-semibold text-white">seatbooking.dk</span> for hurtig og direkte bekræftelse af dit bord.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div>
            <a
              href={targetBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Gå til seatbooking.dk</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Weekend & Groups Notice */}
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300 flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white mb-0.5">Fredag/Lørdag &amp; større grupper:</p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">{notice}</p>
            </div>
          </div>

          {/* Direct Phone Reservation */}
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-[11px] text-zinc-400">
              Foretrækker du telefonisk reservation?{' '}
              <a
                href={`tel:${cleanPhone}`}
                className="font-bold text-zinc-200 hover:text-white hover:underline transition-colors ml-1 inline-flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-red-400" />
                <span>Ring på {restPhone}</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
