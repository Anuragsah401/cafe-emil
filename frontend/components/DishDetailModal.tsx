'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Star, 
  Flame, 
  Clock, 
  Calendar, 
  Phone, 
  Sparkles, 
  Utensils, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { MenuItem } from '@/lib/cms';

interface DishDetailModalProps {
  dish: MenuItem | null;
  categoryName?: string;
  isOpen: boolean;
  onClose: () => void;
  onBookTable?: () => void;
  restaurantPhone?: string;
}

export default function DishDetailModal({
  dish,
  categoryName,
  isOpen,
  onClose,
  onBookTable,
  restaurantPhone = '36 44 74 41',
}: DishDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle open / close lifecycle transitions with smooth spring easing
  useEffect(() => {
    let animTimer: NodeJS.Timeout;
    if (isOpen) {
      setIsRendered(true);
      // Double RAF / small timeout to ensure DOM registers initial style before transitioning
      animTimer = setTimeout(() => {
        setIsAnimatedIn(true);
      }, 20);
    } else {
      setIsAnimatedIn(false);
      animTimer = setTimeout(() => {
        setIsRendered(false);
      }, 280);
    }
    return () => clearTimeout(animTimer);
  }, [isOpen]);

  // Lock background scroll when modal is rendered
  useEffect(() => {
    if (!isRendered) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isRendered]);

  const handleClose = () => {
    setIsAnimatedIn(false);
    setTimeout(() => {
      onClose();
    }, 240);
  };

  // Handle ESC key to smoothly close
  useEffect(() => {
    if (!isRendered) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered]);

  if (!isRendered || !mounted || !dish) return null;

  const cleanPhone = restaurantPhone.replace(/\s+/g, '');
  const hasImage = Boolean(dish.image && dish.image.trim().length > 0);
  const displayImage = hasImage 
    ? dish.image 
    : 'https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg';

  const modalContent = (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto transition-all duration-300 ease-out ${
        isAnimatedIn
          ? 'bg-black/80 backdrop-blur-md opacity-100'
          : 'bg-black/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
      role="presentation"
    >
      <div
        className={`relative w-full max-w-xl bg-gradient-to-b from-[#1c1517] via-[#161012] to-[#110d0e] rounded-3xl shadow-2xl border border-white/20 overflow-hidden text-white my-auto flex flex-col max-h-[92vh] transition-all duration-350 ease-spring transform will-change-transform ${
          isAnimatedIn
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4 sm:translate-y-6'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-detail-heading"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Image Header */}
        <div className="relative w-full h-56 sm:h-72 bg-black/60 overflow-hidden shrink-0">
          <img
            src={displayImage}
            alt={dish.name}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              isAnimatedIn ? 'scale-100' : 'scale-108'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1517] via-transparent to-black/60" />

          {/* Close Button Top Right */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-90 hover:rotate-90 duration-200 cursor-pointer shadow-lg z-10"
            aria-label="Luk"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Pill Top Left */}
          {categoryName && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 border border-white/15 flex items-center gap-1.5 shadow-lg">
              <Utensils className="w-3 h-3 text-amber-400" />
              <span>{categoryName}</span>
            </div>
          )}

          {/* Price Pill Bottom Right */}
          <div className="absolute bottom-4 right-4 bg-gradient-to-r from-red-600 to-emil-red px-4 py-1.5 rounded-full text-sm sm:text-base font-black font-mono text-white shadow-xl shadow-red-600/40 border border-red-400/40 flex items-baseline gap-1">
            <span>{dish.price},-</span>
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-white/80">DKK</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 no-scrollbar">
          {/* Title & Ratings */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="dish-detail-heading" className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {dish.name}
              </h2>
            </div>

            {/* Badges / Tags */}
            {dish.tags && dish.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {dish.tags.map((tag) => {
                  const isSpicy = tag.toLowerCase().includes('spicy');
                  const isFav = tag.toLowerCase().includes('favorit') || tag.toLowerCase().includes('populær') || tag.toLowerCase().includes('bestseller');
                  const isTime = tag.toLowerCase().includes('serveres') || tag.toLowerCase().includes('10-14');

                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border ${
                        isSpicy
                          ? 'bg-red-500/15 text-red-300 border-red-500/30'
                          : isFav
                          ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                          : isTime
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : 'bg-white/10 text-zinc-200 border-white/15'
                      }`}
                    >
                      {isSpicy && <Flame className="w-3 h-3 text-red-400" />}
                      {isFav && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                      {isTime && <Clock className="w-3 h-3 text-blue-400" />}
                      <span>{tag}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full Dish Description */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-zinc-400">
              Beskrivelse &amp; Ingredienser
            </h3>
            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-normal bg-white/[0.03] p-4 rounded-2xl border border-white/10">
              {dish.description || 'Frisk og velsmagende ret tilberedt af Café Emils dygtige kokke med nøje udvalgte råvarer.'}
            </p>
          </div>

          {/* Quality & Allergen Notices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white mb-0.5">Frisklavet på bestilling</p>
                <p className="text-[11px] text-zinc-300">Tilberedt med kærlighed og råvarer af højeste kvalitet.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white mb-0.5">Allergener &amp; ønsker</p>
                <p className="text-[11px] text-zinc-300">Har du særlige ønsker eller allergi? Spørg vores personale.</p>
              </div>
            </div>
          </div>

          {/* Actions & Buttons */}
          <div className="pt-3 border-t border-white/10 space-y-2.5">
            {/* Primary Action: Book Table */}
            <button
              type="button"
              onClick={() => {
                handleClose();
                if (onBookTable) {
                  setTimeout(() => {
                    onBookTable();
                  }, 240);
                }
              }}
              className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Calendar className="w-4 h-4" />
              <span>Book bord og nyd {dish.name}</span>
            </button>

            {/* Quick Call for Takeaway */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
              <span>Ønsker du takeaway?</span>
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1.5 font-bold text-zinc-200 hover:text-white hover:underline transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-red-400" />
                <span>Ring på {restaurantPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

