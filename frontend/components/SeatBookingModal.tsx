'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Clock, Users, Phone, ExternalLink, X, CheckCircle, Flame } from 'lucide-react';
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
  const [guests, setGuests] = useState('2');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure portal only mounts client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize date to today's YYYY-MM-DD
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
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
  const restPhone = restaurant?.phone || '36 44 74 56';
  const cleanPhone = String(restPhone).replace(/\s+/g, '');
  const baseUrl = restaurant?.seatBookingUrl || 'https://cafeemil.dk/book-bord';
  const notice = bookingNotice || `Ring gerne direkte på ${restPhone}.`;

  const handleProceedSeatBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      guests,
      date,
      time,
      source: 'cafeemil-web',
    });
    const targetUrl = baseUrl.includes('?')
      ? `${baseUrl}&${params.toString()}`
      : `${baseUrl}?${params.toString()}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

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
        <div className="p-6 overflow-y-auto no-scrollbar">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-white">Videresender til SeatBooking</h4>
              <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                Vi har åbnet SeatBooking med dine valg ({guests} personer, den {date} kl. {time}). Bekræft din reservation i det åbnede vindue.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-full border border-white/15 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Juster valg
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-extrabold text-xs uppercase shadow-md shadow-red-600/30 transition-colors"
                >
                  Luk vindue
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProceedSeatBooking} className="space-y-4">
              <p className="text-xs text-zinc-300 leading-relaxed">
                Vælg antal gæster, dato og tid. Du viderestilles direkte til vores SeatBooking-system for omgående bekræftelse.
              </p>

              {/* Guest Count */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Antal gæster</span>
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-[#100D0E] text-white focus:outline-none focus:border-emil-red text-xs font-semibold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '11-20 (Selskab)', '20+ (Større arrangement)'].map((opt) => (
                    <option key={opt} value={opt} className="bg-[#181416] text-white">
                      {typeof opt === 'number' ? `${opt} ${opt === 1 ? 'person' : 'personer'}` : opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Dato</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl border border-white/15 bg-[#100D0E] text-white focus:outline-none focus:border-emil-red text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Tidspunkt</span>
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl border border-white/15 bg-[#100D0E] text-white focus:outline-none focus:border-emil-red text-xs font-semibold"
                  >
                    {[
                      '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
                      '14:00', '14:30', '15:00', '16:00', '17:00', '17:30', '18:00',
                      '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
                    ].map((t) => (
                      <option key={t} value={t} className="bg-[#181416] text-white">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weekend Notice */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300 flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white mb-0.5">Fredag/Lørdag &amp; større grupper:</p>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">{notice}</p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Fortsæt til SeatBooking</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Phone fallback */}
              <div className="text-center pt-2 border-t border-white/10">
                <p className="text-[11px] text-zinc-400">
                  Foretrækker du telefonisk reservation?{' '}
                  <a
                    href={`tel:${cleanPhone}`}
                    className="font-bold text-zinc-200 hover:text-white hover:underline transition-colors ml-1"
                  >
                    Ring på {restPhone}
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
