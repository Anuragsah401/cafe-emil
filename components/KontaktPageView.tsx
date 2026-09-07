'use client';

import React, { useState } from 'react';
import { CmsData } from '@/lib/cms';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

interface KontaktPageViewProps {
  cms: CmsData;
}

export default function KontaktPageView({ cms }: KontaktPageViewProps) {
  const { restaurant, openingHours } = cms;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-32 pb-24 bg-yumix-bg text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yumix-card border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Vi glæder os til at høre fra dig</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Kontakt Café Emil i Valby
          </h1>

          <p className="text-base sm:text-lg text-yumix-muted leading-relaxed">
            Har du spørgsmål til menukortet, ønsker du at arrangere et selskab, eller vil du bestille bord? Tag fat i os – vi står altid klar til at hjælpe.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Location */}
          <div className="bg-yumix-card p-8 rounded-3xl border border-white/10 shadow-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Adresse</h2>
            <p className="text-sm text-yumix-muted">
              {restaurant.name}<br />
              {restaurant.streetAddress}<br />
              {restaurant.postalCode} {restaurant.city}
            </p>
            <div className="pt-2">
              <a
                href={restaurant.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-zinc-300 hover:text-white hover:underline transition-colors"
              >
                Åbn i Google Maps →
              </a>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-yumix-card p-8 rounded-3xl border border-white/10 shadow-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Telefon</h2>
            <p className="text-sm text-yumix-muted">
              Ring til os for bordbestilling eller spørgsmål:
            </p>
            <div className="pt-2">
              <a
                href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
                className="text-xl font-mono font-bold text-white hover:text-amber-300 transition-colors"
              >
                {restaurant.phone}
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="bg-yumix-card p-8 rounded-3xl border border-white/10 shadow-xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">E-mail</h2>
            <p className="text-sm text-yumix-muted">
              Send os en mail vedrørende selskaber eller forespørgsler:
            </p>
            <div className="pt-2">
              <a
                href={`mailto:${restaurant.email}`}
                className="text-sm font-semibold text-zinc-200 hover:text-white hover:underline transition-colors"
              >
                {restaurant.email}
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form & Opening Hours Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          {/* Form */}
          <div className="lg:col-span-7 bg-yumix-card p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Send en besked
            </h2>
            <p className="text-xs sm:text-sm text-yumix-muted mb-8">
              Vi besvarer som regel alle henvendelser inden for 24 timer.
            </p>

            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emil-red/20 text-emil-red rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Tak for din besked!
                </h3>
                <p className="text-sm text-yumix-muted max-w-md mx-auto">
                  Vi vender tilbage hurtigst muligt.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2 rounded-full border border-white/15 text-xs font-semibold hover:bg-white/5"
                >
                  Send en ny besked
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1">
                      Navn *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Dit fulde navn"
                      className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-yumix-bg text-white text-xs focus:outline-none focus:border-emil-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1">
                      Telefonnummer *
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="36 44 74 41"
                      className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-yumix-bg text-white text-xs focus:outline-none focus:border-emil-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="din@mail.dk"
                      className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-yumix-bg text-white text-xs focus:outline-none focus:border-emil-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1">
                      Emne
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Fx Bordbestilling, Selskab"
                      className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-yumix-bg text-white text-xs focus:outline-none focus:border-emil-red"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1">
                    Besked *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Hvad kan vi hjælpe dig med?"
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-yumix-bg text-white text-xs focus:outline-none focus:border-emil-red"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Send besked</span>
                </button>
              </form>
            )}
          </div>

          {/* Hours Card */}
          <div className="lg:col-span-5 bg-yumix-card text-white p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-amber-400/90 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>Åbningstider &amp; Køkken</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Hvornår kan du besøge os?
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                {openingHours.schedule.map((slot) => (
                  <div key={slot.id} className="border-b border-white/10 pb-3">
                    <div className="flex justify-between font-bold text-white">
                      <span>{slot.days}</span>
                      <span className="font-mono text-white">{slot.open} – {slot.close}</span>
                    </div>
                    <div className="text-xs text-yumix-muted mt-1">
                      Køkkenet lukker kl. {slot.kitchenClose}
                    </div>
                  </div>
                ))}

                <div className="pt-2 text-amber-300 text-xs font-medium">
                  ☀️ Brunch alle ugens 7 dage: 10:00 – 14:00
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 text-xs text-yumix-muted leading-relaxed">
              <strong>Offentlig transport:</strong> Beliggende kun 300 meter fra Valby Station (S-tog &amp; tog). Busserne 1A og 4A standser lige i nærheden.
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <iframe
            title="Google Maps placering Café Emil"
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
    </div>
  );
}
