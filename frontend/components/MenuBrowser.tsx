'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Utensils, Star, Plus } from 'lucide-react';
import { MenuCategory, MenuItem } from '@/lib/cms';

interface MenuBrowserProps {
  categories: MenuCategory[];
  items: MenuItem[];
  initialCategory?: string;
  showCategoryNavLinks?: boolean;
}

export default function MenuBrowser({
  categories,
  items,
  initialCategory = 'alle',
  showCategoryNavLinks = true,
}: MenuBrowserProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategory === 'alle' || item.categoryId === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const groupedItems = useMemo(() => {
    if (activeCategory !== 'alle') {
      const cat = categories.find((c) => c.id === activeCategory);
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
      {/* Category Pills & Search Toolbar */}
      <div className="sticky top-20 z-20 bg-yumix-bg/95 backdrop-blur-xl py-4 border-b border-white/10 mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs Scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory('alle')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeCategory === 'alle'
                  ? 'bg-emil-red text-white shadow-lg shadow-red-600/30'
                  : 'bg-yumix-card text-yumix-muted hover:text-white border border-white/10 hover:border-emil-red/30'
              }`}
            >
              Alle retter ({items.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-emil-red text-white shadow-lg shadow-red-600/30'
                    : 'bg-yumix-card text-yumix-muted hover:text-white border border-white/10 hover:border-emil-red/30'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-yumix-muted" />
            <input
              type="text"
              placeholder="Søg i retter eller råvarer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full border border-white/10 bg-yumix-card text-xs text-white placeholder:text-yumix-muted focus:outline-none focus:border-emil-red transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-yumix-muted hover:text-white"
              >
                Ryd
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Crawlable Semantic HTML Menu List */}
      {groupedItems.length === 0 ? (
        <div className="text-center py-20 bg-yumix-card rounded-3xl border border-white/10 p-8 my-8">
          <Utensils className="w-10 h-10 mx-auto text-yumix-muted mb-3" />
          <h3 className="text-xl font-bold text-white">Ingen retter fundet</h3>
          <p className="text-xs text-yumix-muted mt-1">
            Prøv at søge efter noget andet eller nulstil dit kategorifilter.
          </p>
          <button
            onClick={() => {
              setActiveCategory('alle');
              setSearchQuery('');
            }}
            className="mt-4 px-5 py-2.5 rounded-full bg-emil-red text-white text-xs font-bold uppercase shadow-md shadow-red-600/20"
          >
            Nulstil filter
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {groupedItems.map(({ category, items: catItems }) => {
            if (!category) return null;
            return (
              <section key={category.id} id={category.slug} className="scroll-mt-36">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-4 mb-8 gap-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400/90">
                      Kategori
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
                      {category.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-yumix-muted mt-1 max-w-2xl">
                      {category.description}
                    </p>
                  </div>
                  {showCategoryNavLinks && (
                    <Link
                      href={`/menu/${category.slug}`}
                      className="text-xs text-zinc-300 hover:text-white hover:underline font-bold shrink-0 transition-colors"
                    >
                      Se kun {category.name} →
                    </Link>
                  )}
                </div>

                {/* Grid of Dishes (Yumix Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catItems.map((dish) => (
                    <article
                      key={dish.id}
                      className="group bg-yumix-card rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shadow-xl"
                    >
                      <div>
                        {/* Header: Name and Price */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                            {dish.name}
                          </h3>
                          <span className="font-mono text-base font-extrabold text-white whitespace-nowrap bg-white/10 px-3 py-1 rounded-full border border-white/15">
                            {dish.price},-
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-yumix-muted leading-relaxed line-clamp-3">
                          {dish.description}
                        </p>
                      </div>

                      {/* Badges / Tags */}
                      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {dish.tags && dish.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-white/5 text-white/80 border border-white/10"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <span className="text-[11px] font-mono text-yumix-muted font-semibold">
                          Valby
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
