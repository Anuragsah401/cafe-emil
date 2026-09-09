'use client';

import React from 'react';
import { Utensils, Layers, Image as ImageIcon, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CmsData } from '@/lib/cms';

interface AdminStatsProps {
  data: CmsData;
  storageStatus: {
    backendOnline: boolean;
    supabaseConnected: boolean;
    backendUrl: string;
    readyForProduction: boolean;
  } | null;
  onSelectTab: (tab: any) => void;
}

export default function AdminStats({ data, storageStatus, onSelectTab }: AdminStatsProps) {
  const totalItems = data.menuItems?.length || 0;
  const itemsWithImages = data.menuItems?.filter((m) => Boolean(m.image && m.image.trim().length > 0)).length || 0;
  const totalCategories = data.menuCategories?.length || 0;
  const totalGallery = data.gallery?.length || 0;
  const isConnected = Boolean(storageStatus?.supabaseConnected);

  const stats = [
    {
      id: 'menu',
      label: 'Menukort Retter',
      value: totalItems,
      subtext: `${itemsWithImages} med foto (${Math.round((itemsWithImages / (totalItems || 1)) * 100)}%)`,
      icon: Utensils,
      color: 'from-red-500/20 to-amber-500/10 border-red-500/30 text-red-400',
      iconBg: 'bg-red-500/20 text-red-400',
      onClick: () => onSelectTab('menu'),
    },
    {
      id: 'sections',
      label: 'Kategorier',
      value: totalCategories,
      subtext: 'Brunch, Burgere, Pizza m.fl.',
      icon: Layers,
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-400',
      onClick: () => onSelectTab('sections'),
    },
    {
      id: 'gallery',
      label: 'Galleri Billeder',
      value: totalGallery,
      subtext: 'Mad, terrasse og stemning',
      icon: ImageIcon,
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
      iconBg: 'bg-blue-500/20 text-blue-400',
      onClick: () => onSelectTab('gallery'),
    },
    {
      id: 'status',
      label: 'Database & Cloud',
      value: isConnected ? 'Online' : 'Fallback',
      subtext: isConnected ? 'Supabase PostgreSQL forbundet' : 'Lokal backend aktiv',
      icon: isConnected ? Sparkles : AlertTriangle,
      color: isConnected
        ? 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400'
        : 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
      iconBg: isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400',
      onClick: () => onSelectTab('general'),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <button
            key={stat.id}
            type="button"
            onClick={stat.onClick}
            className={`group text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${stat.color} bg-[#181415]/80 backdrop-blur-xl border transition-all duration-300 hover:scale-[1.02] hover:border-white/30 shadow-lg relative overflow-hidden`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200 transition-colors">
                {stat.label}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {stat.value}
              </span>
              {stat.id === 'status' && isConnected && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
            </div>

            <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-1 truncate">
              {stat.subtext}
            </p>
          </button>
        );
      })}
    </div>
  );
}
