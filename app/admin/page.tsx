'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  FileText,
  LogOut,
  Sparkles,
  Star,
  HelpCircle,
  Image as ImageIcon,
  Key,
  Video,
  Edit2,
  Check,
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  CmsData,
  MenuItem,
  MenuCategory,
  ScheduleDay,
  FaqItem,
  TestimonialItem,
  GalleryItem,
} from '@/lib/cms';

type AdminTab =
  | 'general'
  | 'hours'
  | 'menu'
  | 'sections'
  | 'testimonials'
  | 'faqs'
  | 'gallery'
  | 'seo'
  | 'security';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<CmsData | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Menu management state
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('alle');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNewItemModal, setIsNewItemModal] = useState(false);

  // Password change state
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdStatus, setPwdStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // 1. Authenticate check on mount
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return fetch('/api/cms');
      })
      .then((res) => res.json())
      .then((cms: CmsData) => {
        setData(cms);
        setLoading(false);
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [router]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  // Handle Save
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

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Save failed');
      }

      setSaveMessage({ type: 'success', text: 'Alle ændringer er gemt med succes og er live på hjemmesiden!' });
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Kunne ikke gemme ændringer. Kontroller forbindelsen og prøv igen.' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus(null);

    if (pwdNew !== pwdConfirm) {
      setPwdStatus({ type: 'error', text: 'De to nye adgangskoder matcher ikke hinanden' });
      return;
    }

    if (pwdNew.length < 8) {
      setPwdStatus({ type: 'error', text: 'Den nye adgangskode skal have mindst 8 tegn' });
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwdCurrent, newPassword: pwdNew }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Fejl ved skift af adgangskode');
      }

      setPwdStatus({ type: 'success', text: 'Adgangskoden er nu ændret med succes!' });
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
    } catch (err: any) {
      setPwdStatus({ type: 'error', text: err.message || 'Kunne ikke ændre adgangskode' });
    } finally {
      setPwdLoading(false);
    }
  };

  // Menu item CRUD helpers
  const handleSaveMenuItem = (item: MenuItem) => {
    if (!data) return;
    const existingIndex = data.menuItems.findIndex((m) => m.id === item.id);
    let updatedItems: MenuItem[];

    if (existingIndex >= 0) {
      updatedItems = [...data.menuItems];
      updatedItems[existingIndex] = item;
    } else {
      updatedItems = [item, ...data.menuItems];
    }

    setData({ ...data, menuItems: updatedItems });
    setEditingItem(null);
    setIsNewItemModal(false);
  };

  const handleDeleteMenuItem = (id: string) => {
    if (!data) return;
    if (confirm('Er du sikker på, at du vil slette denne ret fra menukortet?')) {
      const updated = data.menuItems.filter((m) => m.id !== id);
      setData({ ...data, menuItems: updated });
    }
  };

  // Loading Screen
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#100D0E] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-emil-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
            Indlæser Café Emil Kontrolpanel...
          </p>
        </div>
      </div>
    );
  }

  // Filtered menu items
  const filteredMenuItems = data.menuItems.filter((item) => {
    const matchesCategory =
      selectedCategoryFilter === 'alle' || item.categoryId === selectedCategoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#100D0E] text-zinc-100 pt-24 pb-20 selection:bg-emil-red selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ========================================================
            TOP HEADER BAR
            ======================================================== */}
        <header className="bg-[#181415]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" title="Gå til forsiden" className="shrink-0">
              <img
                src="/images/cafeemil-logo.png"
                alt="Café Emil"
                className="h-12 w-auto drop-shadow-[0_2px_8px_rgba(215,42,22,0.4)]"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                  Administrator Dashboard
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Café Emil CMS &amp; Indholdskontrol
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-2 transition-all"
            >
              <span>Se Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-emil-red hover:bg-emil-redHover active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl shadow-red-600/30 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Gemmer...' : 'Gem Alle Ændringer'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all"
              title="Log ud"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log ud</span>
            </button>
          </div>
        </header>

        {/* Global Save Feedback Toast */}
        {saveMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-page-enter shadow-2xl ${
              saveMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/30 text-red-300'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* ========================================================
            TAB NAVIGATION BAR (9 Modules)
            ======================================================== */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'general', label: 'Stamdata', icon: Settings },
            { id: 'hours', label: 'Åbningstider', icon: Clock },
            { id: 'menu', label: 'Menukort & Retter', icon: Utensils },
            { id: 'sections', label: 'Sektioner & Tekster', icon: Layers },
            { id: 'testimonials', label: 'Anmeldelser', icon: Star },
            { id: 'faqs', label: 'FAQ', icon: HelpCircle },
            { id: 'gallery', label: 'Galleri', icon: ImageIcon },
            { id: 'seo', label: 'SEO & Metadata', icon: Search },
            { id: 'security', label: 'Sikkerhed & Kode', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emil-red text-white shadow-lg shadow-red-600/30'
                    : 'bg-[#181415] text-zinc-400 hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ========================================================
            TAB 1: STAMDATA & KONTAKT
            ======================================================== */}
        {activeTab === 'general' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/15 shadow-2xl space-y-8 animate-page-enter">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Restaurantens Stamoplysninger &amp; Links</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Disse oplysninger bruges overalt på websitet, i sidefoden og i Google Local SEO.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Tagline / Slagord
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Telefon (Dansk format)
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Telefon (Internationalt format)
                </label>
                <input
                  type="text"
                  value={data.restaurant.phoneInternational}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, phoneInternational: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Adresse
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Postnummer &amp; By
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={data.restaurant.postalCode}
                    onChange={(e) =>
                      setData({
                        ...data,
                        restaurant: { ...data.restaurant, postalCode: e.target.value },
                      })
                    }
                    placeholder="2500"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                  />
                  <input
                    type="text"
                    value={data.restaurant.city}
                    onChange={(e) =>
                      setData({
                        ...data,
                        restaurant: { ...data.restaurant, city: e.target.value },
                      })
                    }
                    placeholder="Valby"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Kapacitet (Pladser)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-400">Indendørs</span>
                    <input
                      type="number"
                      value={data.restaurant.indoorCapacity}
                      onChange={(e) =>
                        setData({
                          ...data,
                          restaurant: { ...data.restaurant, indoorCapacity: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400">Terrasse</span>
                    <input
                      type="number"
                      value={data.restaurant.outdoorCapacity}
                      onChange={(e) =>
                        setData({
                          ...data,
                          restaurant: { ...data.restaurant, outdoorCapacity: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Online Bordbooking (SeatBooking) URL
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Fødevarestyrelsens Smiley URL
                </label>
                <input
                  type="text"
                  value={data.restaurant.smileyUrl}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, smileyUrl: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Google Maps URL
                </label>
                <input
                  type="text"
                  value={data.restaurant.googleMapsUrl}
                  onChange={(e) =>
                    setData({
                      ...data,
                      restaurant: { ...data.restaurant, googleMapsUrl: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: ÅBNINGSTIDER & KØKKEN
            ======================================================== */}
        {activeTab === 'hours' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/15 shadow-2xl space-y-8 animate-page-enter">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Åbningstider &amp; Køkkenlukketider</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Juster tider for caféen og køkkenet. Opdateringerne vises direkte på forside, kontakt og i bunden.
              </p>
            </div>

            <div className="space-y-4">
              {data.openingHours.schedule.map((slot, idx) => (
                <div key={slot.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-amber-300">Periode / Dage</label>
                    <input
                      type="text"
                      value={slot.days}
                      onChange={(e) => {
                        const updated = [...data.openingHours.schedule];
                        updated[idx].days = e.target.value;
                        setData({ ...data, openingHours: { ...data.openingHours, schedule: updated } });
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Åbner</label>
                    <input
                      type="text"
                      value={slot.open}
                      onChange={(e) => {
                        const updated = [...data.openingHours.schedule];
                        updated[idx].open = e.target.value;
                        setData({ ...data, openingHours: { ...data.openingHours, schedule: updated } });
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Lukker</label>
                    <input
                      type="text"
                      value={slot.close}
                      onChange={(e) => {
                        const updated = [...data.openingHours.schedule];
                        updated[idx].close = e.target.value;
                        setData({ ...data, openingHours: { ...data.openingHours, schedule: updated } });
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-amber-400">Køkken Lukker</label>
                    <input
                      type="text"
                      value={slot.kitchenClose}
                      onChange={(e) => {
                        const updated = [...data.openingHours.schedule];
                        updated[idx].kitchenClose = e.target.value;
                        setData({ ...data, openingHours: { ...data.openingHours, schedule: updated } });
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Brunch Tidspunkter Tekst
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Weekend Booking Besked
                </label>
                <textarea
                  rows={3}
                  value={data.openingHours.weekendBookingNotice}
                  onChange={(e) =>
                    setData({
                      ...data,
                      openingHours: { ...data.openingHours, weekendBookingNotice: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: MENUKORT & RETTER (Full CRUD)
            ======================================================== */}
        {activeTab === 'menu' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/15 shadow-2xl space-y-6 animate-page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-400" />
                  <span>Menukort &amp; Retter ({data.menuItems.length} i alt)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Opret, rediger priser, juster beskrivelser eller slet retter fra menukortet.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingItem({
                    id: `dish-${Date.now()}`,
                    name: '',
                    categoryId: data.menuCategories[0]?.id || 'burgere',
                    price: 149,
                    description: '',
                    tags: ['Nyhed'],
                    image: '',
                    isAvailable: true,
                  });
                  setIsNewItemModal(true);
                }}
                className="px-4 py-2.5 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-red-600/25 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tilføj Ny Ret</span>
              </button>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Søg i retter eller beskrivelse..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedCategoryFilter('alle')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategoryFilter === 'alle'
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                  }`}
                >
                  Alle ({data.menuItems.length})
                </button>
                {data.menuCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryFilter(c.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategoryFilter === c.id
                        ? 'bg-emil-red text-white'
                        : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Items Table / List */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredMenuItems.map((dish) => (
                <div
                  key={dish.id}
                  className="p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{dish.name}</span>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        {dish.price},- DKK
                      </span>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md">
                        {dish.categoryId}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                      {dish.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setEditingItem({ ...dish });
                        setIsNewItemModal(false);
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-xs flex items-center gap-1 transition-colors"
                      title="Rediger ret"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold">Rediger</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(dish.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors"
                      title="Slet ret"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal: Edit / Add Menu Item */}
            {editingItem && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#181415] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl animate-page-enter">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-base font-bold text-white">
                      {isNewItemModal ? 'Tilføj Ny Ret' : `Rediger: ${editingItem.name}`}
                    </h3>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase">Navn</label>
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-300 uppercase">Kategori</label>
                        <select
                          value={editingItem.categoryId}
                          onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-[#141011] border border-white/15 text-xs text-white"
                        >
                          {data.menuCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-300 uppercase">Pris (DKK)</label>
                        <input
                          type="number"
                          value={editingItem.price}
                          onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                          className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase">Beskrivelse</label>
                      <textarea
                        rows={3}
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase">Billede URL</label>
                      <input
                        type="text"
                        value={editingItem.image || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                        placeholder="https://..."
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-400 hover:text-white"
                    >
                      Annuller
                    </button>
                    <button
                      onClick={() => handleSaveMenuItem(editingItem)}
                      className="px-5 py-2 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      Gem Ret
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: FORSIDE & SEKTIONER
            ======================================================== */}
        {activeTab === 'sections' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/15 shadow-2xl space-y-10 animate-page-enter">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Forside &amp; Sektionsindhold</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Styr overskrifter, introtekster, videobaggrund og historier på tværs af hele hjemmesiden.
              </p>
            </div>

            {/* 1. HERO SECTION */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 text-amber-300">
                <Video className="w-4 h-4 text-amber-400" />
                <span>01 — Hero Sektion &amp; Videobaggrund</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Top Badge</label>
                  <input
                    type="text"
                    value={data.sections.hero.eyebrow}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          hero: { ...data.sections.hero, eyebrow: e.target.value },
                        },
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Hovedoverskrift</label>
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
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Undertekst / Beskrivelse</label>
                  <textarea
                    rows={2}
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
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">YouTube Video ID (Baggrundsvideo)</label>
                  <input
                    type="text"
                    value={data.sections.hero.videoBackground?.youtubeId || 'MHUuvjLxTrg'}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          hero: {
                            ...data.sections.hero,
                            videoBackground: {
                              ...(data.sections.hero.videoBackground || {
                                enabled: true,
                                videoUrl: 'https://youtu.be/MHUuvjLxTrg',
                                startTime: 0,
                                endTime: 39,
                                posterImage: 'https://cafeemil.dk/wp-content/uploads/2024/12/forside-cafeemil.jpg',
                              }),
                              youtubeId: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Plakat Billede Fallback URL</label>
                  <input
                    type="text"
                    value={data.sections.hero.videoBackground?.posterImage || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          hero: {
                            ...data.sections.hero,
                            videoBackground: {
                              ...(data.sections.hero.videoBackground || {
                                enabled: true,
                                youtubeId: 'MHUuvjLxTrg',
                                videoUrl: 'https://youtu.be/MHUuvjLxTrg',
                                startTime: 0,
                                endTime: 39,
                              }),
                              posterImage: e.target.value,
                            },
                          },
                        },
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. BRUNCH SEKTION */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 text-amber-300">
                <span>🍳 02 — Brunch Sektion</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Brunch Overskrift</label>
                  <input
                    type="text"
                    value={data.sections.brunch.title}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          brunch: { ...data.sections.brunch, title: e.target.value },
                        },
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Tidspunkter</label>
                  <input
                    type="text"
                    value={data.sections.brunch.hours}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          brunch: { ...data.sections.brunch, hours: e.target.value },
                        },
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Prisnotits</label>
                  <input
                    type="text"
                    value={data.sections.brunch.priceNote}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          brunch: { ...data.sections.brunch, priceNote: e.target.value },
                        },
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. SELSKABER SEKTION */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2 text-amber-300">
                <span>🥂 03 — Selskaber &amp; Private Fester</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Titel</label>
                  <input
                    type="text"
                    value={data.sections.selskaber.title}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          selskaber: { ...data.sections.selskaber, title: e.target.value },
                        },
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Under-overskrift (Lead)</label>
                  <input
                    type="text"
                    value={data.sections.selskaber.lead}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          selskaber: { ...data.sections.selskaber, lead: e.target.value },
                        },
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Beskrivelse</label>
                  <textarea
                    rows={2}
                    value={data.sections.selskaber.description}
                    onChange={(e) =>
                      setData({
                        ...data,
                        sections: {
                          ...data.sections,
                          selskaber: { ...data.sections.selskaber, description: e.target.value },
                        },
                      })
                    }
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* 4. OM OS & FILOSOFI */}
            {data.sections.omOs && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2 text-amber-300">
                  <span>📖 04 — Om Café Emil Historie</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-300 uppercase">Titel</label>
                    <input
                      type="text"
                      value={data.sections.omOs.title}
                      onChange={(e) =>
                        setData({
                          ...data,
                          sections: {
                            ...data.sections,
                            omOs: { ...data.sections.omOs, title: e.target.value },
                          },
                        })
                      }
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-300 uppercase">Afsnit 1</label>
                    <textarea
                      rows={2}
                      value={data.sections.omOs.storyP1}
                      onChange={(e) =>
                        setData({
                          ...data,
                          sections: {
                            ...data.sections,
                            omOs: { ...data.sections.omOs, storyP1: e.target.value },
                          },
                        })
                      }
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-300 uppercase">Afsnit 2</label>
                    <textarea
                      rows={2}
                      value={data.sections.omOs.storyP2}
                      onChange={(e) =>
                        setData({
                          ...data,
                          sections: {
                            ...data.sections,
                            omOs: { ...data.sections.omOs, storyP2: e.target.value },
                          },
                        })
                      }
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5: ANMELDELSER (Testimonials CRUD)
            ======================================================== */}
        {activeTab === 'testimonials' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/15 shadow-2xl space-y-6 animate-page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-current" />
                  <span>Kundeanmeldelser &amp; Citater ({data.testimonials?.length || 0})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Styr de anmeldelser, der vises på forsiden i sektionen &ldquo;Here’s What Our Foodies Are Raving About&rdquo;.
                </p>
              </div>

              <button
                onClick={() => {
                  const newTestimonial: TestimonialItem = {
                    id: `test-${Date.now()}`,
                    name: 'Ny Gæst',
                    role: 'Lokal gæst i Valby',
                    rating: 5,
                    quote: 'Fantastisk oplevelse og super god mad hos Café Emil!',
                  };
                  setData({
                    ...data,
                    testimonials: [newTestimonial, ...(data.testimonials || [])],
                  });
                }}
                className="px-4 py-2.5 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-red-600/25 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tilføj Anmeldelse</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.testimonials?.map((t, idx) => (
                <div key={t.id || idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-400">Navn</label>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => {
                            const updated = [...data.testimonials];
                            updated[idx].name = e.target.value;
                            setData({ ...data, testimonials: updated });
                          }}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-400">Rolle / Type</label>
                        <input
                          type="text"
                          value={t.role}
                          onChange={(e) => {
                            const updated = [...data.testimonials];
                            updated[idx].role = e.target.value;
                            setData({ ...data, testimonials: updated });
                          }}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-amber-400">Stjerner (1-5)</label>
                        <select
                          value={t.rating}
                          onChange={(e) => {
                            const updated = [...data.testimonials];
                            updated[idx].rating = parseInt(e.target.value) || 5;
                            setData({ ...data, testimonials: updated });
                          }}
                          className="w-full mt-1 px-3 py-1.5 rounded-lg bg-[#141011] border border-white/10 text-xs text-amber-400 font-bold"
                        >
                          {[5, 4, 3, 2, 1].map((stars) => (
                            <option key={stars} value={stars}>
                              {stars} ★★★★★ (af 5)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const updated = data.testimonials.filter((_, i) => i !== idx);
                        setData({ ...data, testimonials: updated });
                      }}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 self-end sm:self-auto"
                      title="Slet anmeldelse"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Gæstens Citat</label>
                    <textarea
                      rows={2}
                      value={t.quote}
                      onChange={(e) => {
                        const updated = [...data.testimonials];
                        updated[idx].quote = e.target.value;
                        setData({ ...data, testimonials: updated });
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: FAQ (Ofte Stillede Spørgsmål CRUD)
            ======================================================== */}
        {activeTab === 'faqs' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/15 shadow-2xl space-y-6 animate-page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <span>Ofte Stillede Spørgsmål (FAQ) ({data.faqs?.length || 0})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Rediger eller tilføj spørgsmål og svar, som vises i accordion-sektionen for gæster.
                </p>
              </div>

              <button
                onClick={() => {
                  const newFaq: FaqItem = {
                    id: `faq-${Date.now()}`,
                    q: 'Nyt spørgsmål?',
                    a: 'Svar på det nye spørgsmål her...',
                  };
                  setData({
                    ...data,
                    faqs: [...(data.faqs || []), newFaq],
                  });
                }}
                className="px-4 py-2.5 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-red-600/25 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tilføj Spørgsmål</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.faqs?.map((faq, idx) => (
                <div key={faq.id || idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase font-bold text-amber-300">Spørgsmål #{idx + 1}</label>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => {
                          const updated = [...data.faqs];
                          updated[idx].q = e.target.value;
                          setData({ ...data, faqs: updated });
                        }}
                        className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white font-bold"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const updated = data.faqs.filter((_, i) => i !== idx);
                        setData({ ...data, faqs: updated });
                      }}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 mt-4"
                      title="Slet FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Svar</label>
                    <textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => {
                        const updated = [...data.faqs];
                        updated[idx].a = e.target.value;
                        setData({ ...data, faqs: updated });
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 7: GALLERI
            ======================================================== */}
        {activeTab === 'gallery' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/15 shadow-2xl space-y-6 animate-page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>Galleri Billeder ({data.gallery.length})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Styr billederne i fotogalleriet på forside og på /galleri.
                </p>
              </div>

              <button
                onClick={() => {
                  const newItem: GalleryItem = {
                    id: `g-${Date.now()}`,
                    title: 'Nyt Billede',
                    category: 'food',
                    src: 'https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg',
                  };
                  setData({
                    ...data,
                    gallery: [newItem, ...data.gallery],
                  });
                }}
                className="px-4 py-2.5 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-red-600/25 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tilføj Billede</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.gallery.map((item, idx) => (
                <div key={item.id || idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="h-40 rounded-xl overflow-hidden bg-black/50 relative border border-white/10">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = '/images/cafeemil-logo.png';
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400">Billedtitel</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...data.gallery];
                          updated[idx].title = e.target.value;
                          setData({ ...data, gallery: updated });
                        }}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-400">Kategori</label>
                        <select
                          value={item.category}
                          onChange={(e) => {
                            const updated = [...data.gallery];
                            updated[idx].category = e.target.value;
                            setData({ ...data, gallery: updated });
                          }}
                          className="w-full mt-1 px-2 py-1.5 rounded-lg bg-[#141011] border border-white/10 text-xs text-white"
                        >
                          <option value="food">Mad (food)</option>
                          <option value="interior">Indendørs (interior)</option>
                          <option value="terrace">Terrasse (terrace)</option>
                          <option value="drinks">Drikke (drinks)</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            const updated = data.gallery.filter((_, i) => i !== idx);
                            setData({ ...data, gallery: updated });
                          }}
                          className="w-full py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Slet</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400">Billede URL</label>
                      <input
                        type="text"
                        value={item.src}
                        onChange={(e) => {
                          const updated = [...data.gallery];
                          updated[idx].src = e.target.value;
                          setData({ ...data, gallery: updated });
                        }}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[11px] text-zinc-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 8: SEO & METADATA
            ======================================================== */}
        {activeTab === 'seo' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/15 shadow-2xl space-y-8 animate-page-enter">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                <span>SEO &amp; Google Søgemaskineoptimering</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Juster sidetitler, metabeskrivelser og nøgleord for hver URL. Opdateres i browserens fane og i Google søgeresultater.
              </p>
            </div>

            <div className="space-y-6">
              {Object.entries(data.seo).map(([path, seo]) => (
                <div key={path} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      Rute: {path}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-300 uppercase">
                        Sidetitel (&lt;title&gt;)
                      </label>
                      <input
                        type="text"
                        value={seo.title}
                        onChange={(e) => {
                          setData({
                            ...data,
                            seo: {
                              ...data.seo,
                              [path]: { ...data.seo[path], title: e.target.value },
                            },
                          });
                        }}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-300 uppercase">
                        Metabeskrivelse (Google Snippet)
                      </label>
                      <textarea
                        rows={2}
                        value={seo.description}
                        onChange={(e) => {
                          setData({
                            ...data,
                            seo: {
                              ...data.seo,
                              [path]: { ...data.seo[path], description: e.target.value },
                            },
                          });
                        }}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-300 uppercase">
                        Søgeord / Keywords (komma-separeret)
                      </label>
                      <input
                        type="text"
                        value={seo.keywords}
                        onChange={(e) => {
                          setData({
                            ...data,
                            seo: {
                              ...data.seo,
                              [path]: { ...data.seo[path], keywords: e.target.value },
                            },
                          });
                        }}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 9: SIKKERHED & ADGANGSKODE
            ======================================================== */}
        {activeTab === 'security' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/15 shadow-2xl space-y-6 max-w-2xl animate-page-enter">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>Skift Administrator Adgangskode</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Her kan du opdatere den hemmelige adgangskode til kontrolpanelet.
              </p>
            </div>

            {pwdStatus && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
                  pwdStatus.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/15 border border-red-500/30 text-red-300'
                }`}
              >
                {pwdStatus.type === 'success' ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{pwdStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Nuværende Adgangskode
                </label>
                <input
                  type="password"
                  required
                  value={pwdCurrent}
                  onChange={(e) => setPwdCurrent(e.target.value)}
                  placeholder="Indtast nuværende kode (standard: CafeEmil2025!)"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Ny Adgangskode (min. 8 tegn)
                </label>
                <input
                  type="password"
                  required
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  placeholder="Vælg en stærk adgangskode"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Bekræft Ny Adgangskode
                </label>
                <input
                  type="password"
                  required
                  value={pwdConfirm}
                  onChange={(e) => setPwdConfirm(e.target.value)}
                  placeholder="Gentag ny adgangskode"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="px-6 py-3 rounded-full bg-emil-red hover:bg-emil-redHover active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl shadow-red-600/30 disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{pwdLoading ? 'Opdaterer...' : 'Opdater Adgangskode'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
