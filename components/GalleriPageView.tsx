'use client';

import React, { useState } from 'react';
import { CmsData } from '@/lib/cms';
import { Camera, Calendar } from 'lucide-react';
import Link from 'next/link';

interface GalleriPageViewProps {
  cms: CmsData;
}

export default function GalleriPageView({ cms }: GalleriPageViewProps) {
  const [filter, setFilter] = useState('alle');

  const categories = [
    { id: 'alle', label: 'Alle billeder' },
    { id: 'interior', label: 'Indendørs & Hygge' },
    { id: 'terrace', label: 'Udendørs terrasse' },
    { id: 'food', label: 'Mad & Retter' },
    { id: 'drinks', label: 'Kaffe & Drikke' },
  ];

  const filteredImages = filter === 'alle'
    ? cms.gallery
    : cms.gallery.filter((item) => item.category === filter);

  return (
    <div className="pt-32 pb-24 bg-yumix-bg text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yumix-card border border-white/15 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Café Emil Fotogalleri</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Stemningen hos Café Emil
          </h1>

          <p className="text-base sm:text-lg text-yumix-muted leading-relaxed">
            Få et kig indenfor i vores hyggelige café i Valby. Se vores møre kødretter, friskbagte pizzaer, solrige terrasse og den varme stemning.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === cat.id
                    ? 'bg-emil-red text-white shadow-lg shadow-red-600/30'
                    : 'bg-yumix-card text-yumix-muted hover:text-white border border-white/10 hover:border-emil-red/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-3xl bg-yumix-card border border-white/10 shadow-xl aspect-4/3"
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-sm font-bold text-white tracking-wide">
                  {img.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Bar */}
        <div className="bg-yumix-card text-white rounded-3xl p-8 sm:p-12 border border-white/10 text-center space-y-4 max-w-4xl mx-auto shadow-2xl">
          <h2 className="text-3xl font-black text-white">
            Oplev stemningen i virkeligheden
          </h2>
          <p className="text-xs sm:text-sm text-yumix-muted max-w-xl mx-auto">
            Besøg os på Annexstræde 3 i Valby, eller book et bord online i dag.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link
              href="/book-bord"
              className="px-8 py-3.5 rounded-full bg-emil-red text-white font-extrabold text-xs uppercase tracking-wider hover:bg-emil-redHover transition-all flex items-center gap-2 shadow-lg shadow-red-600/30"
            >
              <Calendar className="w-4 h-4" />
              <span>Book bord nu</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
