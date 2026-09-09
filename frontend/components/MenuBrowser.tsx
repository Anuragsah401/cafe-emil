'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  X, 
  Utensils, 
  Star, 
  Flame, 
  Clock, 
  Calendar, 
  Sparkles,
  ArrowRight,
  Coffee,
  Wine,
  Pizza,
  Compass
} from 'lucide-react';
import { MenuCategory, MenuItem, RestaurantInfo } from '@/lib/cms';
import SeatBookingModal from '@/components/SeatBookingModal';
import DishDetailModal from '@/components/DishDetailModal';

interface MenuBrowserProps {
  categories: MenuCategory[];
  items: MenuItem[];
  initialCategory?: string;
  showCategoryNavLinks?: boolean;
  restaurant?: RestaurantInfo;
}

// Normalizes text by stripping diacritics and converting to lowercase for fault-tolerant search
function normalizeText(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Category icon helper
function getCategoryIcon(slug?: string) {
  switch (slug) {
    case 'brunch':
      return Coffee;
    case 'burgere':
    case 'grillen':
      return Flame;
    case 'pizza':
      return Pizza;
    case 'varme-drikke':
      return Coffee;
    case 'kolde-drikke':
    case 'alkohol':
      return Wine;
    default:
      return Utensils;
  }
}

export default function MenuBrowser({
  categories,
  items,
  initialCategory = 'alle',
  showCategoryNavLinks = true,
  restaurant,
}: MenuBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);

  const isSearching = searchQuery.trim().length > 0;

  // Search filter across all items or selected category
  const filteredItems = useMemo(() => {
    if (!isSearching) {
      if (activeCategory === 'alle') return items;
      return items.filter((item) => item.categoryId === activeCategory);
    }

    const queryTokens = normalizeText(searchQuery).split(/\s+/).filter(Boolean);

    return items.filter((item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      const categoryName = category?.name || '';
      
      const itemContent = normalizeText(
        `${item.name} ${item.description || ''} ${categoryName} ${(item.tags || []).join(' ')} ${item.price}`
      );

      // All search terms must match somewhere in the item
      const matchesQuery = queryTokens.every((token) => itemContent.includes(token));

      if (!matchesQuery) return false;

      // If user selected a specific category while searching, filter to it; otherwise search all
      if (activeCategory !== 'alle') {
        return item.categoryId === activeCategory;
      }

      return true;
    });
  }, [items, categories, activeCategory, searchQuery, isSearching]);

  // Compute live item count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { alle: 0 };
    categories.forEach((c) => {
      counts[c.id] = 0;
    });

    const queryTokens = isSearching
      ? normalizeText(searchQuery).split(/\s+/).filter(Boolean)
      : [];

    items.forEach((item) => {
      if (isSearching) {
        const category = categories.find((c) => c.id === item.categoryId);
        const categoryName = category?.name || '';
        const itemContent = normalizeText(
          `${item.name} ${item.description || ''} ${categoryName} ${(item.tags || []).join(' ')} ${item.price}`
        );
        const matches = queryTokens.every((token) => itemContent.includes(token));
        if (matches) {
          counts.alle = (counts.alle || 0) + 1;
          if (item.categoryId) {
            counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
          }
        }
      } else {
        counts.alle = (counts.alle || 0) + 1;
        if (item.categoryId) {
          counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
        }
      }
    });

    return counts;
  }, [items, categories, searchQuery, isSearching]);

  // Group items by category for clear presentation
  const groupedItems = useMemo(() => {
    if (activeCategory !== 'alle') {
      const cat = categories.find((c) => c.id === activeCategory);
      if (!cat) return [];
      return [{ category: cat, items: filteredItems }];
    }

    return categories
      .map((cat) => ({
        category: cat,
        items: filteredItems.filter((i) => i.categoryId === cat.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, filteredItems, activeCategory]);

  return (
    <div className="w-full">
      {/* ========================================================
          STICKY FILTER & SEARCH TOOLBAR
          ======================================================== */}
      <div className="sticky top-20 z-30 bg-[#120D0E]/95 backdrop-blur-2xl py-4 border-y border-white/10 mb-10 shadow-2xl shadow-black/60 transition-all">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 max-w-7xl mx-auto px-1">
          
          {/* Category Tabs (Smooth Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 lg:pb-0 no-scrollbar">
            <button
              onClick={() => setActiveCategory('alle')}
              className={`group flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border cursor-pointer active:scale-95 ${
                activeCategory === 'alle'
                  ? 'bg-gradient-to-r from-red-600 to-emil-red text-white border-red-500/40 shadow-lg shadow-red-600/30'
                  : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white border-white/10 hover:border-white/20'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Alle retter</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeCategory === 'alle' ? 'bg-white/25 text-white' : 'bg-white/10 text-zinc-400'
              }`}>
                {categoryCounts.alle || 0}
              </span>
            </button>

            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              const count = categoryCounts[cat.id] || 0;
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`group flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 border cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-emil-red text-white border-red-500/40 shadow-lg shadow-red-600/30'
                      : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white border-white/10 hover:border-white/20'
                  } ${isSearching && count === 0 ? 'opacity-40' : 'opacity-100'}`}
                >
                  <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-white/10 text-zinc-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Intelligent Search Input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Søg ret, råvare eller kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 rounded-full border border-white/15 bg-white/[0.05] hover:bg-white/[0.08] focus:bg-[#181315] text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                aria-label="Ryd søgning"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Search Results Banner */}
        {isSearching && (
          <div className="max-w-7xl mx-auto px-1 pt-3 flex items-center justify-between text-xs text-zinc-300 border-t border-white/5 mt-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Fandt <strong className="text-white font-bold">{filteredItems.length}</strong> {filteredItems.length === 1 ? 'ret' : 'retter'} for &ldquo;<span className="text-amber-300">{searchQuery}</span>&rdquo;
                {activeCategory !== 'alle' && (
                  <span> i kategorien <strong className="text-white">{categories.find(c => c.id === activeCategory)?.name}</strong></span>
                )}
              </span>
            </div>

            {activeCategory !== 'alle' && (
              <button
                onClick={() => setActiveCategory('alle')}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold transition-colors"
              >
                Vis resultater fra alle kategorier ({categoryCounts.alle})
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          MENU ITEMS LIST
          ======================================================== */}
      {groupedItems.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-b from-[#181315] to-[#120D0E] rounded-3xl border border-white/10 p-8 my-8 max-w-2xl mx-auto shadow-2xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
            <Utensils className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ingen retter fundet</h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed mb-6">
            Vi fandt ingen retter der matchede din søgning {searchQuery && <span>&ldquo;{searchQuery}&rdquo;</span>}. Prøv at søge på en anden ingrediens eller nulstil filtrene.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setActiveCategory('alle');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              Nulstil søgning og filter
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          {groupedItems.map(({ category, items: catItems }) => {
            if (!category) return null;
            const CategoryIcon = getCategoryIcon(category.slug);

            return (
              <section key={category.id} id={category.slug} className="scroll-mt-36">
                {/* Category Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-4 mb-8 gap-3">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
                      <CategoryIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>{category.name}</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-400 font-normal">{catItems.length} {catItems.length === 1 ? 'ret' : 'retter'}</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                      {category.h1 || category.name}
                    </h2>
                    {category.description && (
                      <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {showCategoryNavLinks && (
                    <Link
                      href={`/menu/${category.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-zinc-300 hover:text-white font-bold shrink-0 transition-colors group"
                    >
                      <span>Se kun {category.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>

                {/* Grid of Dishes (Refined Glassmorphic Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catItems.map((dish) => {
                    const hasImage = Boolean(dish.image && dish.image.trim().length > 0);

                    return (
                      <article
                        key={dish.id}
                        onClick={() => setSelectedDish(dish)}
                        className="group relative bg-gradient-to-b from-[#1c1517] to-[#130e10] rounded-3xl p-5 sm:p-6 border border-white/10 hover:border-white/25 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-red-950/20 overflow-hidden cursor-pointer"
                      >
                        <div>
                          {/* Dish Image Container (if available) */}
                          {hasImage ? (
                            <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden mb-4 bg-black/40 border border-white/5 shadow-inner">
                              <img
                                src={dish.image}
                                alt={dish.name}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                              {/* Price Pill Overlaid on Photo */}
                              <div className="absolute top-3 right-3 bg-[#100D0E]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black font-mono text-amber-300 border border-amber-400/30 shadow-lg flex items-center gap-1">
                                <span>{dish.price},-</span>
                              </div>

                              {/* First Tag Overlaid on Photo */}
                              {dish.tags && dish.tags[0] && (
                                <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/15 flex items-center gap-1 shadow-md">
                                  {dish.tags[0].toLowerCase().includes('spicy') ? (
                                    <Flame className="w-3 h-3 text-red-400" />
                                  ) : dish.tags[0].toLowerCase().includes('favorit') || dish.tags[0].toLowerCase().includes('populær') ? (
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  ) : (
                                    <Sparkles className="w-3 h-3 text-amber-300" />
                                  )}
                                  <span>{dish.tags[0]}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Culinary Header when no photo */
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400/90 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                <CategoryIcon className="w-3 h-3 text-amber-400" />
                                <span>{category.name}</span>
                              </div>

                              <span className="font-mono text-xs font-black text-amber-300 bg-amber-400/10 border border-amber-400/25 px-3 py-1 rounded-full shadow-sm">
                                {dish.price},-
                              </span>
                            </div>
                          )}

                          {/* Dish Name & Price Header */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                              {dish.name}
                            </h3>
                            {hasImage && (
                              <span className="font-mono text-sm font-extrabold text-amber-300 shrink-0 hidden group-hover:inline">
                                {dish.price},-
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                            {dish.description}
                          </p>
                        </div>

                        {/* Footer: Tags & Book Bord Quick Action */}
                        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            {dish.tags && dish.tags.map((tag) => {
                              const isSpicy = tag.toLowerCase().includes('spicy');
                              const isFav = tag.toLowerCase().includes('favorit') || tag.toLowerCase().includes('populær') || tag.toLowerCase().includes('bestseller');
                              const isTime = tag.toLowerCase().includes('serveres') || tag.toLowerCase().includes('10-14');

                              return (
                                <span
                                  key={tag}
                                  className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${
                                    isSpicy
                                      ? 'bg-red-500/10 text-red-300 border-red-500/25'
                                      : isFav
                                      ? 'bg-amber-400/10 text-amber-300 border-amber-400/25'
                                      : isTime
                                      ? 'bg-blue-500/10 text-blue-300 border-blue-500/25'
                                      : 'bg-white/5 text-zinc-300 border-white/10'
                                  }`}
                                >
                                  {isSpicy && <Flame className="w-2.5 h-2.5 text-red-400" />}
                                  {isFav && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
                                  {isTime && <Clock className="w-2.5 h-2.5 text-blue-400" />}
                                  <span>{tag}</span>
                                </span>
                              );
                            })}
                          </div>

                          {/* Quick Book Bord Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsBookingOpen(true);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white py-1 px-2.5 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                            aria-label={`Book bord til ${dish.name}`}
                          >
                            <Calendar className="w-3 h-3 text-red-400" />
                            <span>Book</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Dish Detail Popup Modal */}
      <DishDetailModal
        dish={selectedDish}
        isOpen={Boolean(selectedDish)}
        onClose={() => setSelectedDish(null)}
        categoryName={categories.find(c => c.id === selectedDish?.categoryId || c.slug === selectedDish?.categoryId)?.name}
        onBookTable={() => setIsBookingOpen(true)}
        restaurantPhone={restaurant?.phone}
      />

      {/* SeatBooking Modal for Quick Table Reservations */}
      <SeatBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        restaurant={restaurant}
      />
    </div>
  );
}
