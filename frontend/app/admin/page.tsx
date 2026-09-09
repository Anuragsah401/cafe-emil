'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ExternalLink,
  Layers,
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
  UploadCloud,
  FolderOpen,
  Loader2,
  X,
  Eye,
  EyeOff,
  Filter,
  CheckCircle2,
  Globe,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import MediaLibrary from '@/components/admin/MediaLibrary';
import AdminStats from '@/components/admin/AdminStats';
import AdminStickyBar from '@/components/admin/AdminStickyBar';
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
  | 'media'
  | 'seo'
  | 'security';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<CmsData | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Menu management state
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('alle');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNewItemModal, setIsNewItemModal] = useState(false);

  // Gallery filter state
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState('alle');

  // Password change state
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwdStatus, setPwdStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Gallery bulk upload state
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);

  // Backend & Supabase status
  const [storageStatus, setStorageStatus] = useState<{
    backendOnline: boolean;
    supabaseConnected: boolean;
    backendUrl: string;
    readyForProduction: boolean;
  } | null>(null);
  const [showStorageGuide, setShowStorageGuide] = useState(false);

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

    // Check storage configuration
    fetch('/api/admin/storage-status')
      .then((res) => res.json())
      .then((status) => setStorageStatus(status))
      .catch(() => {});
  }, [router]);

  // 2. Global Keyboard Shortcut for Saving (Cmd+S / Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data]);

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

  // Helper to update CMS state and mark unsaved changes
  const updateData = (updater: (prev: CmsData) => CmsData) => {
    if (!data) return;
    setData(updater(data));
    setHasUnsavedChanges(true);
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
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Kunne ikke gemme ændringer');
      }

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setSaveMessage({ type: 'success', text: 'Alle ændringer er gemt med succes og er live på websitet!' });
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error?.message || 'Kunne ikke gemme ændringer. Kontroller forbindelsen og prøv igen.' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  // Handle Gallery Upload
  const handleGalleryUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !data) return;
    setIsGalleryUploading(true);
    const newItems: GalleryItem[] = [];

    for (const file of Array.from(fileList)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (res.ok && json.url) {
          const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          newItems.push({
            id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
            category: 'food',
            src: json.url,
          });
        }
      } catch (err) {
        console.error('Failed to upload gallery file:', err);
      }
    }

    if (newItems.length > 0) {
      updateData((prev) => ({
        ...prev,
        gallery: [...newItems, ...prev.gallery],
      }));
      setSaveMessage({ type: 'success', text: `${newItems.length} nye galleribilleder uploadet!` });
      setTimeout(() => setSaveMessage(null), 5000);
    }
    setIsGalleryUploading(false);
    if (galleryFileInputRef.current) {
      galleryFileInputRef.current.value = '';
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

      setPwdStatus({ type: 'success', text: 'Adgangskoden er nu opdateret!' });
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

    updateData((prev) => ({ ...prev, menuItems: updatedItems }));
    setEditingItem(null);
    setIsNewItemModal(false);
  };

  const handleDeleteMenuItem = (id: string) => {
    if (!data) return;
    if (confirm('Er du sikker på, at du vil slette denne ret fra menukortet?')) {
      const updated = data.menuItems.filter((m) => m.id !== id);
      updateData((prev) => ({ ...prev, menuItems: updated }));
    }
  };

  // Tabs definitions
  const tabs = [
    { id: 'general', label: 'Stamdata', icon: Settings, count: null },
    { id: 'hours', label: 'Åbningstider', icon: Clock, count: null },
    { id: 'menu', label: 'Menukort', icon: Utensils, count: data?.menuItems?.length || 0 },
    { id: 'sections', label: 'Sektioner', icon: Layers, count: null },
    { id: 'testimonials', label: 'Anmeldelser', icon: Star, count: data?.testimonials?.length || 0 },
    { id: 'faqs', label: 'FAQ', icon: HelpCircle, count: data?.faqs?.length || 0 },
    { id: 'gallery', label: 'Galleri', icon: ImageIcon, count: data?.gallery?.length || 0 },
    { id: 'media', label: 'Mediearkiv', icon: FolderOpen, count: null },
    { id: 'seo', label: 'SEO', icon: Globe, count: Object.keys(data?.seo || {}).length },
    { id: 'security', label: 'Sikkerhed', icon: Key, count: null },
  ];

  // Loading Screen
  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0D0B0C] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 border-3 border-emil-red border-t-transparent rounded-full animate-spin mx-auto drop-shadow-[0_0_15px_rgba(215,42,22,0.5)]" />
          <h2 className="text-base font-extrabold tracking-wide text-white">Café Emil Kontrolpanel</h2>
          <p className="text-xs text-zinc-400">Indlæser restaurantens data og cloud-forbindelse...</p>
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
      item.description.toLowerCase().includes(menuSearch.toLowerCase()) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(menuSearch.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // Filtered gallery items
  const filteredGalleryItems = data.gallery.filter((item) => {
    if (galleryCategoryFilter === 'alle') return true;
    return item.category === galleryCategoryFilter;
  });

  return (
    <div className="min-h-screen bg-[#0D0B0C] text-zinc-100 selection:bg-emil-red selection:text-white pb-32">
      
      {/* ========================================================
          STICKY TOP HEADER
          ======================================================== */}
      <header className="sticky top-0 z-30 bg-[#120F10]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xl transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" title="Gå til forsiden" className="shrink-0 group">
              <img
                src="/images/cafeemil-logo.png"
                alt="Café Emil"
                className="h-9 sm:h-10 w-auto drop-shadow-[0_2px_10px_rgba(215,42,22,0.4)] group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-amber-400 truncate">
                  CMS Kontrolpanel
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${
                    storageStatus?.supabaseConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {storageStatus?.supabaseConnected ? 'Cloud Forbundet' : 'Lokal Mode'}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-white truncate hidden xs:block">
                Café Emil Administration
              </h1>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="px-3 sm:px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all"
              title="Åbn websitet i ny fane"
            >
              <span>Se Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-red-600/30 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{saving ? 'Gemmer...' : 'Gem Ændringer'}</span>
              <span className="sm:hidden">{saving ? '...' : 'Gem'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-full bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Log ud som administrator"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Log ud</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================
          MAIN CONTENT CONTAINER
          ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Global Save Feedback Toast */}
        {saveMessage && (
          <div
            className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-page-enter shadow-2xl border ${
              saveMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                : 'bg-red-500/15 border-red-500/40 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {saveMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{saveMessage.text}</span>
            </div>
            <button
              onClick={() => setSaveMessage(null)}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Live Overview Stats */}
        <AdminStats
          data={data}
          storageStatus={storageStatus}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* Backend / Supabase Banner if disconnected */}
        {storageStatus && !storageStatus.supabaseConnected && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Lokal Fallback Mode</p>
                <p className="text-[11px] text-zinc-400">
                  Backend gemmer lokalt. Tilføj din SUPABASE_URL og nøgler i server/.env for cloud-database.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowStorageGuide(true)}
              className="px-3.5 py-1.5 rounded-full bg-amber-400 text-black font-extrabold text-[11px] uppercase tracking-wider hover:bg-amber-300 transition-colors shrink-0"
            >
              Guide (2 min)
            </button>
          </div>
        )}

        {/* ========================================================
            RESPONSIVE TAB SWITCHER
            ======================================================== */}
        <div className="space-y-3">
          {/* Mobile Select Dropdown (< sm) */}
          <div className="sm:hidden">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Vælg Sektion
            </label>
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as AdminTab)}
                className="w-full px-4 py-3 rounded-2xl bg-[#181415] border border-white/15 text-sm text-white font-bold appearance-none focus:outline-none focus:border-emil-red pr-10"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label} {tab.count !== null ? `(${tab.count})` : ''}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
            </div>
          </div>

          {/* Desktop & Tablet Pills (sm+) */}
          <nav
            aria-label="CMS sektioner"
            className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none border-b border-white/10"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`px-3.5 sm:px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-emil-red text-white shadow-lg shadow-red-600/30 scale-100'
                      : 'bg-[#181415] text-zinc-400 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-zinc-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ========================================================
            TAB 1: STAMDATA & KONTAKT
            ======================================================== */}
        {activeTab === 'general' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-8 animate-page-enter">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Restaurantens Stamoplysninger &amp; Links</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Disse oplysninger bruges overalt på websitet, i sidefoden og i Google Local SEO.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Restaurant Navn
                </label>
                <input
                  type="text"
                  value={data.restaurant.name}
                  onChange={(e) =>
                    updateData((prev) => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, name: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red transition-colors"
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
                    updateData((prev) => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, tagline: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Telefon (Dansk format)</span>
                </label>
                <input
                  type="text"
                  value={data.restaurant.phone}
                  onChange={(e) =>
                    updateData((prev) => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, phone: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Telefon (Internationalt format)</span>
                </label>
                <input
                  type="text"
                  value={data.restaurant.phoneInternational}
                  onChange={(e) =>
                    updateData((prev) => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, phoneInternational: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>E-mail</span>
                </label>
                <input
                  type="email"
                  value={data.restaurant.email}
                  onChange={(e) =>
                    updateData((prev) => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, email: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Adresse</span>
                </label>
                <input
                  type="text"
                  value={data.restaurant.streetAddress}
                  onChange={(e) =>
                    updateData((prev) => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, streetAddress: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red transition-colors"
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
                      updateData((prev) => ({
                        ...prev,
                        restaurant: { ...prev.restaurant, postalCode: e.target.value },
                      }))
                    }
                    placeholder="2500"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                  />
                  <input
                    type="text"
                    value={data.restaurant.city}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        restaurant: { ...prev.restaurant, city: e.target.value },
                      }))
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
                    <span className="text-[10px] text-zinc-400 font-semibold">Indendørs</span>
                    <input
                      type="number"
                      value={data.restaurant.indoorCapacity}
                      onChange={(e) =>
                        updateData((prev) => ({
                          ...prev,
                          restaurant: { ...prev.restaurant, indoorCapacity: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-semibold">Terrasse</span>
                    <input
                      type="number"
                      value={data.restaurant.outdoorCapacity}
                      onChange={(e) =>
                        updateData((prev) => ({
                          ...prev,
                          restaurant: { ...prev.restaurant, outdoorCapacity: parseInt(e.target.value) || 0 },
                        }))
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
                    updateData((prev) => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, seatBookingUrl: e.target.value },
                    }))
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
                    updateData((prev) => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, smileyUrl: e.target.value },
                    }))
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
                    updateData((prev) => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, googleMapsUrl: e.target.value },
                    }))
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
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-8 animate-page-enter">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Åbningstider &amp; Køkkenlukketider</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Juster tider for caféen og køkkenet. Vises direkte på forsiden, kontakt og i sidefoden.
              </p>
            </div>

            <div className="space-y-4">
              {data.openingHours.schedule.map((slot, idx) => (
                <div
                  key={slot.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 items-center hover:border-white/20 transition-colors"
                >
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-amber-300">Periode / Dage</label>
                    <input
                      type="text"
                      value={slot.days}
                      onChange={(e) => {
                        const updated = [...data.openingHours.schedule];
                        updated[idx].days = e.target.value;
                        updateData((prev) => ({
                          ...prev,
                          openingHours: { ...prev.openingHours, schedule: updated },
                        }));
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
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
                        updateData((prev) => ({
                          ...prev,
                          openingHours: { ...prev.openingHours, schedule: updated },
                        }));
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
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
                        updateData((prev) => ({
                          ...prev,
                          openingHours: { ...prev.openingHours, schedule: updated },
                        }));
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
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
                        updateData((prev) => ({
                          ...prev,
                          openingHours: { ...prev.openingHours, schedule: updated },
                        }));
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-4 border-t border-white/10">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Brunch Tidspunkter Tekst
                </label>
                <input
                  type="text"
                  value={data.openingHours.brunchHours}
                  onChange={(e) =>
                    updateData((prev) => ({
                      ...prev,
                      openingHours: { ...prev.openingHours, brunchHours: e.target.value },
                    }))
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
                    updateData((prev) => ({
                      ...prev,
                      openingHours: { ...prev.openingHours, weekendBookingNotice: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: MENUKORT & RETTER (Full Responsive CRUD)
            ======================================================== */}
        {activeTab === 'menu' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-6 animate-page-enter">
            
            {/* Header with Title & Add button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Menukort &amp; Retter ({data.menuItems.length} i alt)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Opret nye retter, opdater priser, tilføj fotos og juster beskrivelser.
                </p>
              </div>

              <button
                type="button"
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
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 self-start sm:self-auto active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tilføj Ny Ret</span>
              </button>
            </div>

            {/* Search & Category Filter Bar */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Søg efter ret, ingredienser eller tags (f.eks. Burger, Kaffe, Vegetar)..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emil-red transition-colors"
                />
                {menuSearch && (
                  <button
                    onClick={() => setMenuSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills with Item Counts */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('alle')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategoryFilter === 'alle'
                      ? 'bg-white text-black shadow-md'
                      : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                  }`}
                >
                  Alle ({data.menuItems.length})
                </button>
                {data.menuCategories.map((c) => {
                  const categoryCount = data.menuItems.filter((m) => m.categoryId === c.id).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(c.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        selectedCategoryFilter === c.id
                          ? 'bg-emil-red text-white shadow-md shadow-red-600/30'
                          : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] opacity-70">({categoryCount})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Items Responsive Grid / Cards */}
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl p-6">
                <Utensils className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Ingen retter fundet</p>
                <p className="text-xs text-zinc-400 mt-1">Prøv at ændre din søgning eller nulstil kategorifiltret.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-h-[700px] overflow-y-auto pr-1">
                {filteredMenuItems.map((dish) => (
                  <div
                    key={dish.id}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 flex items-start gap-3.5 transition-all duration-200 group"
                  >
                    {/* Food Photo / Placeholder */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {dish.image ? (
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Utensils className="w-6 h-6 text-zinc-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-white text-sm sm:text-base leading-snug truncate">
                          {dish.name}
                        </h4>
                        <span className="text-xs font-mono font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 shrink-0">
                          {dish.price},-
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md">
                          {data.menuCategories.find((c) => c.id === dish.categoryId)?.name || dish.categoryId}
                        </span>
                        {dish.tags &&
                          dish.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[9px] font-bold text-red-300 bg-red-500/10 border border-red-500/20 px-1.5 py-0.2 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>

                      <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem({ ...dish });
                            setIsNewItemModal(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Edit2 className="w-3 h-3 text-amber-400" />
                          <span>Rediger</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMenuItem(dish.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors"
                          title="Slet ret"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ====================================================
                RESPONSIVE MODAL: EDIT / ADD MENU ITEM
                ==================================================== */}
            {editingItem && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-page-enter">
                <div className="bg-[#181415] border border-white/20 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Modal Sticky Header */}
                  <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-amber-400" />
                      <h3 className="text-base font-black text-white">
                        {isNewItemModal ? 'Tilføj Ny Ret' : `Rediger: ${editingItem.name || 'Ret'}`}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modal Scrollable Body */}
                  <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase">Navn på ret</label>
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        placeholder="F.eks. Emil Gourmet Burger"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-zinc-300 uppercase">Kategori</label>
                        <select
                          value={editingItem.categoryId}
                          onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#141011] border border-white/15 text-xs text-white"
                        >
                          {data.menuCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-zinc-300 uppercase">Pris (DKK)</label>
                        <input
                          type="number"
                          value={editingItem.price}
                          onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase">Beskrivelse &amp; Ingredienser</label>
                      <textarea
                        rows={3}
                        value={editingItem.description}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        placeholder="Kort, lækker beskrivelse af retten..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-emil-red"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-zinc-300 uppercase">Fremhævede Tags (komma-adskilt)</label>
                      <input
                        type="text"
                        value={editingItem.tags ? editingItem.tags.join(', ') : ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                          })
                        }
                        placeholder="F.eks. Populær, Vegetar, Glutenfri"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white"
                      />
                    </div>

                    <div>
                      <ImageUploader
                        label="Ret Foto"
                        value={editingItem.image || ''}
                        onChange={(url) => setEditingItem({ ...editingItem, image: url })}
                        description="Upload et appetitvækkende foto af retten direkte fra computer eller mobil."
                      />
                    </div>
                  </div>

                  {/* Modal Sticky Footer */}
                  <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 shrink-0 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-4 py-2 rounded-full text-xs font-bold text-zinc-400 hover:text-white"
                    >
                      Annuller
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveMenuItem(editingItem)}
                      className="px-6 py-2.5 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/30 active:scale-95"
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
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-8 animate-page-enter">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400 shrink-0" />
                <span>Forside &amp; Sektionsindhold</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Styr overskrifter, introtekster, videobaggrund og historier på tværs af websitet.
              </p>
            </div>

            {/* 1. HERO SECTION */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 text-amber-300">
                <Video className="w-4 h-4 text-amber-400 shrink-0" />
                <span>01 — Hero Sektion &amp; Videobaggrund</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Top Badge (Eyebrow)</label>
                  <input
                    type="text"
                    value={data.sections.hero.eyebrow}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          hero: { ...prev.sections.hero, eyebrow: e.target.value },
                        },
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Hovedoverskrift</label>
                  <input
                    type="text"
                    value={data.sections.hero.title}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          hero: { ...prev.sections.hero, title: e.target.value },
                        },
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Undertekst</label>
                  <textarea
                    rows={2}
                    value={data.sections.hero.subtitle}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          hero: { ...prev.sections.hero, subtitle: e.target.value },
                        },
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">YouTube Video ID</label>
                  <input
                    type="text"
                    value={data.sections.hero.videoBackground?.youtubeId || 'MHUuvjLxTrg'}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          hero: {
                            ...prev.sections.hero,
                            videoBackground: {
                              ...(prev.sections.hero.videoBackground || {
                                enabled: true,
                                videoUrl: 'https://youtu.be/MHUuvjLxTrg',
                                startTime: 0,
                                endTime: 39,
                                posterImage: '',
                              }),
                              youtubeId: e.target.value,
                            },
                          },
                        },
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <ImageUploader
                    label="Baggrundsbillede Fallback"
                    value={data.sections.hero.videoBackground?.posterImage || ''}
                    onChange={(url) =>
                      updateData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          hero: {
                            ...prev.sections.hero,
                            videoBackground: {
                              ...(prev.sections.hero.videoBackground || {
                                enabled: true,
                                youtubeId: 'MHUuvjLxTrg',
                                videoUrl: 'https://youtu.be/MHUuvjLxTrg',
                                startTime: 0,
                                endTime: 39,
                              }),
                              posterImage: url,
                            },
                          },
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* 2. BRUNCH SEKTION */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 text-amber-300">
                <span>🍳 02 — Brunch Sektion</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Brunch Overskrift</label>
                  <input
                    type="text"
                    value={data.sections.brunch.title}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          brunch: { ...prev.sections.brunch, title: e.target.value },
                        },
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Tidspunkter</label>
                  <input
                    type="text"
                    value={data.sections.brunch.hours}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          brunch: { ...prev.sections.brunch, hours: e.target.value },
                        },
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Prisnotits</label>
                  <input
                    type="text"
                    value={data.sections.brunch.priceNote}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          brunch: { ...prev.sections.brunch, priceNote: e.target.value },
                        },
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. SELSKABER SEKTION */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 text-amber-300">
                <span>🥂 03 — Selskaber &amp; Private Fester</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Titel</label>
                  <input
                    type="text"
                    value={data.sections.selskaber.title}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          selskaber: { ...prev.sections.selskaber, title: e.target.value },
                        },
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Under-overskrift (Lead)</label>
                  <input
                    type="text"
                    value={data.sections.selskaber.lead}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          selskaber: { ...prev.sections.selskaber, lead: e.target.value },
                        },
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-300 uppercase">Beskrivelse</label>
                  <textarea
                    rows={2}
                    value={data.sections.selskaber.description}
                    onChange={(e) =>
                      updateData((prev) => ({
                        ...prev,
                        sections: {
                          ...prev.sections,
                          selskaber: { ...prev.sections.selskaber, description: e.target.value },
                        },
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: ANMELDELSER (Testimonials)
            ======================================================== */}
        {activeTab === 'testimonials' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-6 animate-page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-current shrink-0" />
                  <span>Kundeanmeldelser &amp; Citater ({data.testimonials?.length || 0})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Styr de anmeldelser, der fremhæves på forsiden.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newTestimonial: TestimonialItem = {
                    id: `test-${Date.now()}`,
                    name: 'Ny Gæst',
                    role: 'Lokal gæst i Valby',
                    rating: 5,
                    quote: 'Fantastisk oplevelse og super god mad hos Café Emil!',
                  };
                  updateData((prev) => ({
                    ...prev,
                    testimonials: [newTestimonial, ...prev.testimonials],
                  }));
                }}
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-red-600/30 self-start sm:self-auto active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tilføj Anmeldelse</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.testimonials.map((test, idx) => (
                <div
                  key={test.id}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Star Rating Picker */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            const updated = [...data.testimonials];
                            updated[idx].rating = star;
                            updateData((prev) => ({ ...prev, testimonials: updated }));
                          }}
                          className={`p-0.5 transition-transform hover:scale-110 ${
                            star <= test.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                          }`}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = data.testimonials.filter((_, i) => i !== idx);
                        updateData((prev) => ({ ...prev, testimonials: updated }));
                      }}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Slet anmeldelse"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400">Navn</label>
                      <input
                        type="text"
                        value={test.name}
                        onChange={(e) => {
                          const updated = [...data.testimonials];
                          updated[idx].name = e.target.value;
                          updateData((prev) => ({ ...prev, testimonials: updated }));
                        }}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-400">Rolle / Beskrivelse</label>
                      <input
                        type="text"
                        value={test.role}
                        onChange={(e) => {
                          const updated = [...data.testimonials];
                          updated[idx].role = e.target.value;
                          updateData((prev) => ({ ...prev, testimonials: updated }));
                        }}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400">Citat / Udtalelse</label>
                    <textarea
                      rows={3}
                      value={test.quote}
                      onChange={(e) => {
                        const updated = [...data.testimonials];
                        updated[idx].quote = e.target.value;
                        updateData((prev) => ({ ...prev, testimonials: updated }));
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: FAQ
            ======================================================== */}
        {activeTab === 'faqs' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-6 animate-page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Ofte Stillede Spørgsmål ({data.faqs?.length || 0})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  FAQ spørgsmål &amp; svar der vises til gæster.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newFaq: FaqItem = {
                    id: `faq-${Date.now()}`,
                    q: 'Nyt spørgsmål?',
                    a: 'Svar her...',
                  };
                  updateData((prev) => ({
                    ...prev,
                    faqs: [...prev.faqs, newFaq],
                  }));
                }}
                className="px-4 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-red-600/30 self-start sm:self-auto active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tilføj Spørgsmål</span>
              </button>
            </div>

            <div className="space-y-4">
              {data.faqs.map((faq, idx) => (
                <div
                  key={faq.id}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase font-bold text-amber-300">Spørgsmål</label>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => {
                          const updated = [...data.faqs];
                          updated[idx].q = e.target.value;
                          updateData((prev) => ({ ...prev, faqs: updated }));
                        }}
                        className="w-full mt-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = data.faqs.filter((_, i) => i !== idx);
                        updateData((prev) => ({ ...prev, faqs: updated }));
                      }}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 mt-5 shrink-0"
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
                        updateData((prev) => ({ ...prev, faqs: updated }));
                      }}
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
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
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-6 animate-page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Galleri &amp; Fotos ({data.gallery.length})</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Upload stemningsbilleder, madfotos og terrassebilleder til galleriet.
                </p>
              </div>

              {/* Hidden file input for multi-upload into gallery */}
              <input
                ref={galleryFileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
                className="hidden"
                onChange={(e) => handleGalleryUpload(e.target.files)}
              />

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isGalleryUploading}
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-red-600/30 active:scale-95 disabled:opacity-50"
                >
                  {isGalleryUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploader...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Fotos</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newItem: GalleryItem = {
                      id: `g-${Date.now()}`,
                      title: 'Nyt Billede',
                      category: 'food',
                      src: 'https://cafeemil.dk/wp-content/uploads/2024/12/332323.jpg',
                    };
                    updateData((prev) => ({
                      ...prev,
                      gallery: [newItem, ...prev.gallery],
                    }));
                  }}
                  className="px-3.5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleGalleryUpload(e.dataTransfer.files);
              }}
              onClick={() => !isGalleryUploading && galleryFileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-amber-400/50 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group"
            >
              <div className="flex flex-col items-center justify-center gap-2 text-xs text-zinc-400">
                <div className="w-10 h-10 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="font-bold text-white text-sm">Træk &amp; slip billeder her</p>
                <p className="text-[11px] text-zinc-400">eller klik for at vælge fra din computer eller mobil (JPG, PNG, WEBP)</p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['alle', 'food', 'drinks', 'interior', 'terrace'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setGalleryCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    galleryCategoryFilter === cat
                      ? 'bg-white text-black shadow-md'
                      : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                  }`}
                >
                  {cat === 'alle'
                    ? 'Alle'
                    : cat === 'food'
                    ? 'Mad'
                    : cat === 'drinks'
                    ? 'Drikke'
                    : cat === 'interior'
                    ? 'Indendørs'
                    : 'Terrasse'}
                </button>
              ))}
            </div>

            {/* Gallery Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGalleryItems.map((item, idx) => {
                const originalIndex = data.gallery.findIndex((g) => g.id === item.id);
                return (
                  <div
                    key={item.id || idx}
                    className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden space-y-3 p-3 group hover:border-white/25 transition-all"
                  >
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-black/40 relative">
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 text-[9px] uppercase font-bold text-white bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                        {item.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.gallery.filter((g) => g.id !== item.id);
                          updateData((prev) => ({ ...prev, gallery: updated }));
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Slet billede"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...data.gallery];
                          updated[originalIndex].title = e.target.value;
                          updateData((prev) => ({ ...prev, gallery: updated }));
                        }}
                        placeholder="Billedtitel..."
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                      />

                      <select
                        value={item.category}
                        onChange={(e) => {
                          const updated = [...data.gallery];
                          updated[originalIndex].category = e.target.value;
                          updateData((prev) => ({ ...prev, gallery: updated }));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#141011] border border-white/10 text-xs text-zinc-300"
                      >
                        <option value="food">Mad (food)</option>
                        <option value="drinks">Drikke (drinks)</option>
                        <option value="interior">Indendørs (interior)</option>
                        <option value="terrace">Terrasse (terrace)</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 8: MEDIEARKIV
            ======================================================== */}
        {activeTab === 'media' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-6 animate-page-enter">
            <MediaLibrary />
          </div>
        )}

        {/* ========================================================
            TAB 9: SEO & METADATA (With Google SERP Preview)
            ======================================================== */}
        {activeTab === 'seo' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-8 animate-page-enter">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400 shrink-0" />
                <span>SEO &amp; Google Søgemaskineoptimering</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Juster sidetitler og metabeskrivelser. Nedenfor kan du se, præcis hvordan Google viser siden til gæster.
              </p>
            </div>

            <div className="space-y-8">
              {Object.entries(data.seo).map(([path, seo]) => (
                <div
                  key={path}
                  className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                      Rute: {path}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      cafeemil.dk{path === '/' ? '' : path}
                    </span>
                  </div>

                  {/* Google Search Live Preview */}
                  <div className="p-4 rounded-xl bg-[#1F1F1F] border border-white/10 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-emerald-400 font-mono">https://cafeemil.dk{path === '/' ? '' : path}</span>
                    </div>
                    <h4 className="text-base font-semibold text-[#8AB4F8] hover:underline cursor-pointer truncate">
                      {seo.title || 'Café Emil | Valby'}
                    </h4>
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                      {seo.description || 'Besøg Café Emil i Valby og nyd brunch, burgere og hygge...'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-zinc-300 uppercase">
                          Sidetitel (&lt;title&gt;)
                        </label>
                        <span
                          className={`text-[10px] font-mono ${
                            (seo.title?.length || 0) > 60 ? 'text-amber-400' : 'text-zinc-500'
                          }`}
                        >
                          {seo.title?.length || 0} / 60 tegn
                        </span>
                      </div>
                      <input
                        type="text"
                        value={seo.title}
                        onChange={(e) => {
                          updateData((prev) => ({
                            ...prev,
                            seo: {
                              ...prev.seo,
                              [path]: { ...prev.seo[path], title: e.target.value },
                            },
                          }));
                        }}
                        className="w-full mt-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-zinc-300 uppercase">
                          Metabeskrivelse (Google Snippet)
                        </label>
                        <span
                          className={`text-[10px] font-mono ${
                            (seo.description?.length || 0) > 160 ? 'text-amber-400' : 'text-zinc-500'
                          }`}
                        >
                          {seo.description?.length || 0} / 160 tegn
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={seo.description}
                        onChange={(e) => {
                          updateData((prev) => ({
                            ...prev,
                            seo: {
                              ...prev.seo,
                              [path]: { ...prev.seo[path], description: e.target.value },
                            },
                          }));
                        }}
                        className="w-full mt-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-300 uppercase">
                        Søgeord / Keywords (komma-adskilt)
                      </label>
                      <input
                        type="text"
                        value={seo.keywords}
                        onChange={(e) => {
                          updateData((prev) => ({
                            ...prev,
                            seo: {
                              ...prev.seo,
                              [path]: { ...prev.seo[path], keywords: e.target.value },
                            },
                          }));
                        }}
                        className="w-full mt-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 10: SIKKERHED & ADGANGSKODE
            ======================================================== */}
        {activeTab === 'security' && (
          <div className="bg-[#181415]/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 border border-white/15 shadow-2xl space-y-6 max-w-xl animate-page-enter">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400 shrink-0" />
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
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={pwdCurrent}
                    onChange={(e) => setPwdCurrent(e.target.value)}
                    placeholder="Indtast nuværende kode..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-emil-red pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  Ny Adgangskode (min. 8 tegn)
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
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
                  type={showPasswords ? 'text' : 'password'}
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
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-red-600/30 active:scale-95 disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  <span>{pwdLoading ? 'Opdaterer...' : 'Opdater Adgangskode'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* ========================================================
          FLOATING STICKY ACTION BAR (Always Accessible)
          ======================================================== */}
      <AdminStickyBar
        saving={saving}
        onSave={handleSave}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSaved={lastSaved}
      />
    </div>
  );
}
