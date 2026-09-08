'use client';

import React, { useState, useEffect } from 'react';
import { CmsData } from '@/lib/cms';
import { Calendar, Clock, Users, Phone, ExternalLink, CheckCircle2, MapPin, Flame } from 'lucide-react';

interface BookBordPageViewProps {
  cms: CmsData;
}

export default function BookBordPageView({ cms }: BookBordPageViewProps) {
  const [guests, setGuests] = useState('2');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  const restaurant = cms.restaurant;
  const weekendNotice = cms.openingHours.weekendBookingNotice;

  const handleLaunchBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = restaurant.seatBookingUrl || 'https://cafeemil.dk/book-bord';
    const params = new URLSearchParams({
      guests,
      date,
      time,
      source: 'cafeemil-web',
    });
    const targetUrl = baseUrl.includes('?') ? `${baseUrl}&${params.toString()}` : `${baseUrl}?${params.toString()}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <div className="pt-32 pb-24 bg-yumix-bg text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yumix-card border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Online Bordreservation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Reserver dit bord hos Café Emil
          </h1>

          <p className="text-sm sm:text-base text-yumix-muted leading-relaxed">
            Sikr dig og dit selskab en hyggelig plads til brunch, frokost, middag eller drinks. Vi integrerer direkte med vores online SeatBooking-system for hurtig bekræftelse.
          </p>
        </div>

        {/* Booking Card */}
        <div className="bg-yumix-card rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                SeatBooking Reservation åbnet
              </h2>
              <p className="text-sm text-yumix-muted max-w-md mx-auto">
                SeatBooking er åbnet i et nyt faneblad med dine valgte ønsker ({guests} personer, den {date} kl. {time}). Færdiggør din bekræftelse der.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-full border border-white/15 text-xs font-semibold hover:bg-white/5"
                >
                  Juster reservation
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLaunchBooking} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Guests */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1.5 flex items-center gap-1">
                    <Users className="w-4 h-4 text-zinc-400" />
                    Antal gæster
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 text-xs bg-yumix-bg text-white focus:outline-none focus:border-emil-red"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '11-20 (Selskab)', '20+ (Fest)'].map((opt) => (
                      <option key={opt} value={opt} className="bg-yumix-bg">
                        {typeof opt === 'number' ? `${opt} ${opt === 1 ? 'person' : 'personer'}` : opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1.5 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    Dato
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 text-xs bg-yumix-bg text-white focus:outline-none focus:border-emil-red"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1.5 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    Tidspunkt
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 text-xs bg-yumix-bg text-white focus:outline-none focus:border-emil-red"
                  >
                    {[
                      '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
                      '14:00', '14:30', '15:00', '16:00', '17:00', '17:30', '18:00',
                      '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
                    ].map((t) => (
                      <option key={t} value={t} className="bg-yumix-bg">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notice Box */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300 flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white mb-0.5">Fredag &amp; Lørdag samt større selskaber:</p>
                  <p className="text-zinc-300">{weekendNotice}</p>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-600/30"
              >
                <span>Fortsæt til SeatBooking</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Alternative Phone Reservation */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
            <p className="text-xs text-yumix-muted">
              Ønsker du at reservere over telefonen eller har du spørgsmål til allergener?
            </p>
            <a
              href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors border border-white/10"
            >
              <Phone className="w-3.5 h-3.5 text-zinc-300" />
              <span>Ring til caféen: {restaurant.phone}</span>
            </a>
          </div>
        </div>

        {/* Location Footer Bar */}
        <div className="mt-12 text-center text-xs text-yumix-muted flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4 text-zinc-400" />
          <span>{restaurant.name} • {restaurant.streetAddress}, {restaurant.postalCode} {restaurant.city}</span>
        </div>
      </div>
    </div>
  );
}
