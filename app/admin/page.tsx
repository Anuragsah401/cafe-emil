'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Clock,
  Utensils,
  Search,
  Save,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  Shield,
  Layers,
  FileText
} from 'lucide-react';
import { CmsData, MenuItem, MenuCategory, ScheduleDay } from '@/lib/cms';

export default function AdminDashboardPage() {
  const [data, setData] = useState<CmsData | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'menu' | 'seo' | 'content'>('general');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Menu management state
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('alle');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNewItemModal, setIsNewItemModal] = useState(false);

  useEffect(() => {
    fetch('/api/cms')
      .then((res) => res.json())
      .then((cms) => setData(cms))
      .catch((err) => {
        console.error('Failed to load CMS data:', err);
      });
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveMessage({ type: 'success', text: 'Ændringerne er gemt med succes i CMS-databasen!' });
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Kunne ikke gemme ændringer. Prøv igen.' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  if (!data) {
    return (
      <div className="pt-32 pb-24 text-center min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="space-y-3">
          <div className="w-8 h-8 border-2 border-amberGold-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-espresso-800 uppercase tracking-wider">
            Indlæser Café Emil CMS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-200 shadow-sm mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-amberGold-700">
                Café Emil Kontrolpanel
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-espresso-950 mt-1">
              Restaurant CMS &amp; Administration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-full bg-espresso-950 text-cream-50 hover:bg-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amberGold-400" />
              <span>{saving ? 'Gemmer...' : 'Gem alle ændringer'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
        {saveMessage && (
          <div
            className={`p-4 rounded-2xl mb-6 text-xs font-semibold flex items-center gap-2 ${
              saveMessage.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          {[
            { id: 'general', label: 'Stamdata & Kontakt', icon: Settings },
            { id: 'hours', label: 'Åbningstider & Køkken', icon: Clock },
            { id: 'menu', label: 'Menukort & Retter', icon: Utensils },
            { id: 'seo', label: 'SEO & Metadata', icon: Search },
            { id: 'content', label: 'Tekster & Sektioner', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-espresso-950 text-amberGold-400 shadow-sm'
                    : 'bg-white text-espresso-800 hover:bg-cream-200/80 border border-cream-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            TAB 1: GENERAL INFO & CONTACT
            ======================================================== */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-espresso-950 border-b border-cream-200 pb-3">
              Generelle restaurantoplysninger
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                  Restaurant Navn
                </label>
                <input
                  type="text"
                  value={data.restaurant.name}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, name: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-amberGold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={data.restaurant.tagline}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, tagline: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-amberGold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                  Telefon
                </label>
                <input
                  type="text"
                  value={data.restaurant.phone}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, phone: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-amberGold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={data.restaurant.email}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, email: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-amberGold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                  Gadeadresse
                </label>
                <input
                  type="text"
                  value={data.restaurant.streetAddress}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, streetAddress: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-amberGold-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                    Postnr.
                  </label>
                  <input
                    type="text"
                    value={data.restaurant.postalCode}
                    onChange={(e) =>
                      setData({
                        ...data,
                        restaurant: { ...data.restaurant, postalCode: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-amberGold-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                    By
                  </label>
                  <input
                    type="text"
                    value={data.restaurant.city}
                    onChange={(e) =>
                      setData({
                        ...data,
                        restaurant: { ...data.restaurant, city: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-amberGold-400"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1 flex items-center justify-between">
                  <span>SeatBooking URL (Konfigurerbar bordbestillingslink)</span>
                  <span className="text-amberGold-600 lowercase font-normal">
                    bruges på /book-bord og i modaler
                  </span>
                </label>
                <input
                  type="text"
                  value={data.restaurant.seatBookingUrl}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, seatBookingUrl: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-amberGold-400 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                  Indendørs Kapacitet (personer)
                </label>
                <input
                  type="number"
                  value={data.restaurant.indoorCapacity}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, indoorCapacity: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-amberGold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                  Terrasse Kapacitet (pladser)
                </label>
                <input
                  type="number"
                  value={data.restaurant.outdoorCapacity}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, outdoorCapacity: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-amberGold-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: OPENING HOURS & KITCHEN CLOSING
            ======================================================== */}
        {activeTab === 'hours' && (
          <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-sm space-y-8">
            <div>
              <h2 className="font-serif text-xl font-bold text-espresso-950 border-b border-cream-200 pb-3">
                Ugentlige Åbningstider &amp; Køkkentider
              </h2>
              <p className="text-xs text-espresso-800/70 mt-1">
                Alle ændringer her opdateres øjeblikkeligt i sidens footer, tidssektion og Restaurant JSON-LD schema.
              </p>
            </div>

            <div className="space-y-4">
              {data.openingHours.schedule.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200 items-center"
                >
                  <div className="sm:col-span-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-espresso-800 mb-1">
                      Dage
                    </label>
                    <input
                      type="text"
                      value={item.days}
                      onChange={(e) => {
                        const newSchedule = [...data.openingHours.schedule];
                        newSchedule[index].days = e.target.value;
                        setData({
                          ...data,
                          openingHours: { ...data.openingHours, schedule: newSchedule },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-cream-300 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-espresso-800 mb-1">
                      Åbner
                    </label>
                    <input
                      type="text"
                      value={item.open}
                      onChange={(e) => {
                        const newSchedule = [...data.openingHours.schedule];
                        newSchedule[index].open = e.target.value;
                        setData({
                          ...data,
                          openingHours: { ...data.openingHours, schedule: newSchedule },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-cream-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-espresso-800 mb-1">
                      Lukker
                    </label>
                    <input
                      type="text"
                      value={item.close}
                      onChange={(e) => {
                        const newSchedule = [...data.openingHours.schedule];
                        newSchedule[index].close = e.target.value;
                        setData({
                          ...data,
                          openingHours: { ...data.openingHours, schedule: newSchedule },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-cream-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-espresso-800 mb-1">
                      Køkkenet lukker
                    </label>
                    <input
                      type="text"
                      value={item.kitchenClose}
                      onChange={(e) => {
                        const newSchedule = [...data.openingHours.schedule];
                        newSchedule[index].kitchenClose = e.target.value;
                        setData({
                          ...data,
                          openingHours: { ...data.openingHours, schedule: newSchedule },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-cream-300 text-xs font-semibold text-amberGold-700"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Brunch & Weekend Notice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cream-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                  Brunch Serveringstid
                </label>
                <input
                  type="text"
                  value={data.openingHours.brunchHours}
                  onChange={(e) =>
                    setData({
                      ...data,
                      openingHours: { ...data.openingHours, brunchHours: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-espresso-800 mb-1">
                  Weekend / Fredag &amp; Lørdag booking besked
                </label>
                <input
                  type="text"
                  value={data.openingHours.weekendBookingNotice}
                  onChange={(e) =>
                    setData({
                      ...data,
                      openingHours: { ...data.openingHours, weekendBookingNotice: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: MENU ITEMS & CATEGORIES
            ======================================================== */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-espresso-950">
                  Menukort ({data.menuItems.length} retter)
                </h2>
                <p className="text-xs text-espresso-800/70 mt-0.5">
                  Tilføj eller rediger retter, priser og beskrivelser.
                </p>
              </div>

              <button
                onClick={() => {
                  const newItem: MenuItem = {
                    id: `dish-${Date.now()}`,
                    categoryId: 'burgere',
                    name: 'Ny Ret',
                    price: 149,
                    description: 'Beskrivelse af retten...',
                    tags: ['Nyhed'],
                  };
                  setData({ ...data, menuItems: [newItem, ...data.menuItems] });
                }}
                className="px-4 py-2 rounded-full bg-amberGold-500 text-espresso-950 font-bold text-xs uppercase tracking-wider hover:bg-amberGold-400 flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tilføj ny ret</span>
              </button>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-espresso-400" />
                <input
                  type="text"
                  placeholder="Filtrer retter..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-cream-300 text-xs bg-white"
              >
                <option value="alle">Alle kategorier</option>
                {data.menuCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cream-200 text-espresso-700 uppercase tracking-wider">
                    <th className="pb-3 font-bold">Navn</th>
                    <th className="pb-3 font-bold">Kategori</th>
                    <th className="pb-3 font-bold">Pris (DKK)</th>
                    <th className="pb-3 font-bold">Beskrivelse</th>
                    <th className="pb-3 font-bold text-right">Handlinger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {data.menuItems
                    .filter((item) => {
                      const matchesCategory =
                        selectedCategoryFilter === 'alle' ||
                        item.categoryId === selectedCategoryFilter;
                      const matchesQuery =
                        menuSearch === '' ||
                        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                        item.description.toLowerCase().includes(menuSearch.toLowerCase());
                      return matchesCategory && matchesQuery;
                    })
                    .map((item, idx) => (
                      <tr key={item.id} className="hover:bg-cream-50/80">
                        <td className="py-3 pr-3 font-bold text-espresso-950">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...data.menuItems];
                              const target = updated.find((i) => i.id === item.id);
                              if (target) target.name = e.target.value;
                              setData({ ...data, menuItems: updated });
                            }}
                            className="px-2 py-1 rounded border border-transparent hover:border-cream-300 focus:border-amberGold-400 text-xs font-bold w-full"
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <select
                            value={item.categoryId}
                            onChange={(e) => {
                              const updated = [...data.menuItems];
                              const target = updated.find((i) => i.id === item.id);
                              if (target) target.categoryId = e.target.value;
                              setData({ ...data, menuItems: updated });
                            }}
                            className="px-2 py-1 rounded border border-cream-200 text-xs bg-white"
                          >
                            {data.menuCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => {
                                const updated = [...data.menuItems];
                                const target = updated.find((i) => i.id === item.id);
                                if (target) target.price = parseInt(e.target.value) || 0;
                                setData({ ...data, menuItems: updated });
                              }}
                              className="w-20 px-2 py-1 rounded border border-cream-200 font-mono text-xs font-bold text-right"
                            />
                            <span>,-</span>
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...data.menuItems];
                              const target = updated.find((i) => i.id === item.id);
                              if (target) target.description = e.target.value;
                              setData({ ...data, menuItems: updated });
                            }}
                            className="px-2 py-1 rounded border border-transparent hover:border-cream-300 focus:border-amberGold-400 text-xs w-full"
                          />
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Er du sikker på, at du vil slette "${item.name}"?`)) {
                                setData({
                                  ...data,
                                  menuItems: data.menuItems.filter((i) => i.id !== item.id),
                                });
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Slet ret"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: SEO & METADATA
            ======================================================== */}
        {activeTab === 'seo' && (
          <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-sm space-y-8">
            <div>
              <h2 className="font-serif text-xl font-bold text-espresso-950 border-b border-cream-200 pb-3">
                SEO Meta Tags for Hver Side
              </h2>
              <p className="text-xs text-espresso-800/70 mt-1">
                Styr sidetitler og metabeskrivelser så Café Emil fastholder og udbygger sin synlighed i lokale Google-søgninger i Valby.
              </p>
            </div>

            <div className="space-y-6">
              {Object.entries(data.seo).map(([path, seoInfo]) => (
                <div key={path} className="p-6 rounded-2xl bg-cream-50 border border-cream-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-cream-200 pb-2">
                    <span className="font-mono text-xs font-bold text-espresso-950">
                      Rute: {path}
                    </span>
                    <a
                      href={path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amberGold-600 hover:underline flex items-center gap-1"
                    >
                      <span>Besøg side</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-espresso-800 mb-1">
                      SEO Titel (Title Tag)
                    </label>
                    <input
                      type="text"
                      value={seoInfo.title}
                      onChange={(e) => {
                        const newSeo = { ...data.seo };
                        newSeo[path].title = e.target.value;
                        setData({ ...data, seo: newSeo });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-espresso-800 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      rows={2}
                      value={seoInfo.description}
                      onChange={(e) => {
                        const newSeo = { ...data.seo };
                        newSeo[path].description = e.target.value;
                        setData({ ...data, seo: newSeo });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: CONTENT SECTIONS
            ======================================================== */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-sm space-y-8">
            <div>
              <h2 className="font-serif text-xl font-bold text-espresso-950 border-b border-cream-200 pb-3">
                Forsidetekster &amp; Brand Storytelling
              </h2>
            </div>

            {/* Hero */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amberGold-700">
                01 — Hero Sektion
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-espresso-800 mb-1">
                    Overskrift (Titel)
                  </label>
                  <input
                    type="text"
                    value={data.sections.hero.title}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          hero: { ...data.sections.hero, title: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-espresso-800 mb-1">
                    Badge tekst
                  </label>
                  <input
                    type="text"
                    value={data.sections.hero.badge}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          hero: { ...data.sections.hero, badge: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-espresso-800 mb-1">
                    Underoverskrift / Introtekst
                  </label>
                  <textarea
                    rows={3}
                    value={data.sections.hero.subtitle}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          hero: { ...data.sections.hero, subtitle: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Board games */}
            <div className="space-y-4 pt-6 border-t border-cream-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amberGold-700">
                07 — Brætspil &amp; Hygge Sektion
              </h3>
              <div>
                <label className="block text-[11px] font-bold uppercase text-espresso-800 mb-1">
                  Overskrift
                </label>
                <input
                  type="text"
                  value={data.sections.boardGames.title}
                  onChange={(e) =>
                    setData({
                      ...data,
                      sections: {
                        ...data.sections,
                        boardGames: { ...data.sections.boardGames, title: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-espresso-800 mb-1">
                  Beskrivelse
                </label>
                <textarea
                  rows={3}
                  value={data.sections.boardGames.description}
                  onChange={(e) =>
                    setData({
                      ...data,
                      sections: {
                        ...data.sections,
                        boardGames: { ...data.sections.boardGames, description: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

