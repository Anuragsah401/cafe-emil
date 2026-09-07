'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CmsData } from '@/lib/cms';
import { Users, Phone, Mail, Calendar, CheckCircle2, Sparkles, Send, MapPin, Check } from 'lucide-react';

interface SelskaberPageViewProps {
  cms: CmsData;
}

export default function SelskaberPageView({ cms }: SelskaberPageViewProps) {
  const { sections, restaurant } = cms;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    guests: '',
    eventType: 'Fødselsdag',
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
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yumix-card border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fester &amp; Selskaber i Valby</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Hold dit selskab hos Café Emil
          </h1>

          <p className="text-base sm:text-lg text-yumix-muted leading-relaxed">
            {sections.selskaber.lead} {sections.selskaber.description}
          </p>
        </div>

        {/* Capacity & Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Indoor Card */}
          <div className="bg-yumix-card rounded-3xl p-8 border border-white/10 shadow-xl relative space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300/90">
                  Indendørs Lokaler
                </span>
                <span className="font-mono text-2xl font-bold text-white">
                  {sections.selskaber.capacities.indoor}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Hyggelige &amp; Lyse Rammer
              </h2>
              <p className="text-xs sm:text-sm text-yumix-muted leading-relaxed">
                Vores lokaler har behagelig akustik, dæmpet aftenbelysning og masser af charme. Uanset om I samles 15 eller 130 personer, kan vi tilpasse bordopstillingen så festen føles intim og nærværende.
              </p>
            </div>
            <img
              src="https://cafeemil.dk/wp-content/uploads/2024/12/emil.jpg"
              alt="Café Emil indendørs lokaler til selskaber"
              className="w-full h-56 object-cover rounded-2xl border border-white/10"
            />
          </div>

          {/* Terrace Card */}
          <div className="bg-yumix-card rounded-3xl p-8 border border-white/10 shadow-xl relative space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300/90">
                  Solrig Udendørs Terrasse
                </span>
                <span className="font-mono text-2xl font-bold text-white">
                  {sections.selskaber.capacities.terrace}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Terrassefest under åben himmel
              </h2>
              <p className="text-xs sm:text-sm text-yumix-muted leading-relaxed">
                I sommerhalvåret er vores store terrasse i Valby det oplagte valg til velkomstdrinks, sommerreceptioner, jubilæer og hyggelige frokoster i solen.
              </p>
            </div>
            <img
              src="https://cafeemil.dk/wp-content/uploads/2024/12/selskaber-cafeemil.jpg"
              alt="Café Emil solrig terrasse til selskab"
              className="w-full h-56 object-cover rounded-2xl border border-white/10"
            />
          </div>
        </div>

        {/* Benefits & Perks */}
        <div className="bg-yumix-card text-white rounded-3xl p-8 sm:p-12 mb-16 border border-white/10 shadow-2xl">
          <div className="max-w-3xl space-y-3 mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Hvorfor vælge os?
            </span>
            <h2 className="text-3xl font-black text-white">
              Fordele ved selskaber på Café Emil
            </h2>
            <p className="text-xs sm:text-sm text-yumix-muted leading-relaxed">
              Vi ved, hvor meget detaljerne betyder på en festdag. Derfor står vores erfarne køkken og tjenere klar til at hjælpe med planlægningen fra start til slut.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sections.selskaber.perks.map((perk, idx) => (
              <div key={idx} className="bg-yumix-card p-6 rounded-3xl border border-white/10 shadow-lg">
                <Check className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-xs text-white/90 leading-relaxed font-medium">{perk}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selskabs Inquiry Form */}
        <div className="max-w-3xl mx-auto bg-yumix-card rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
              Send forespørgsel
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Planlæg din fest hos Café Emil
            </h2>
            <p className="text-xs sm:text-sm text-yumix-muted">
              Udfyld formularen nedenfor, så vender vi hurtigt tilbage med et uforpligtende tilbud.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emil-red/20 text-emil-red rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Mange tak for din forespørgsel!
              </h3>
              <p className="text-xs sm:text-sm text-yumix-muted max-w-md mx-auto">
                Vi har modtaget dine detaljer og kontakter dig snarest muligt via telefon eller e-mail for at drøfte menu og dato.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-full border border-white/15 text-xs font-semibold hover:bg-white/5"
              >
                Send en ny forespørgsel
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1">
                    Dit navn *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Fx Sofie Hansen"
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
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Fx 36 44 74 41"
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-yumix-bg text-white text-xs focus:outline-none focus:border-emil-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1">
                    E-mailadresse *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="din@mail.dk"
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-yumix-bg text-white text-xs focus:outline-none focus:border-emil-red"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1">
                    Type arrangement
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-yumix-bg text-white text-xs focus:outline-none focus:border-emil-red"
                  >
                    <option value="Fødselsdag">Fødselsdag</option>
                    <option value="Konfirmation">Konfirmation</option>
                    <option value="Firmafest / Møde">Firmafest / Møde</option>
                    <option value="Jubilæum / Reception">Jubilæum / Reception</option>
                    <option value="Andet selskab">Andet selskab</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1">
                    Ønsket dato *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-yumix-bg text-white text-xs focus:outline-none focus:border-emil-red"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1">
                    Forventet antal gæster *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="150"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    placeholder="Fx 25"
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-yumix-bg text-white text-xs focus:outline-none focus:border-emil-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-yumix-muted mb-1">
                  Beskrivelse / Ønsker til menu og tidspunkt
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Fortæl os lidt om jeres ønsker..."
                  className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-yumix-bg text-white text-xs focus:outline-none focus:border-emil-red"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Indsend selskabsforespørgsel</span>
                </button>
              </div>

              <p className="text-center text-xs text-yumix-muted pt-2">
                Eller ring direkte på <a href={`tel:${restaurant.phone.replace(/\s+/g, '')}`} className="text-zinc-200 hover:text-white font-bold hover:underline transition-colors">{restaurant.phone}</a> for at tale med vores selskabskoordinator.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
