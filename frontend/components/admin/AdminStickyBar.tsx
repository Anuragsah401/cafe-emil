'use client';

import React from 'react';
import { Save, Loader2, Check, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface AdminStickyBarProps {
  saving: boolean;
  onSave: () => void;
  hasUnsavedChanges?: boolean;
  lastSaved?: Date | null;
}

export default function AdminStickyBar({
  saving,
  onSave,
  hasUnsavedChanges = false,
  lastSaved,
}: AdminStickyBarProps) {
  return (
    <aside
      aria-label="Admin handlinger"
      className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 z-40 flex items-center justify-between sm:justify-end gap-3 p-2 sm:p-2.5 rounded-full bg-[#181415]/95 backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.7)] animate-page-enter"
    >
      {/* Status Info */}
      <div className="flex items-center gap-2 pl-3 pr-2 text-xs">
        <span
          className={`w-2 h-2 rounded-full ${
            saving
              ? 'bg-amber-400 animate-ping'
              : hasUnsavedChanges
              ? 'bg-amber-400 animate-pulse'
              : 'bg-emerald-400'
          }`}
        />
        <span className="text-[11px] sm:text-xs font-semibold text-zinc-300 hidden xs:inline">
          {saving
            ? 'Gemmer i Supabase...'
            : hasUnsavedChanges
            ? 'Ugemte ændringer'
            : lastSaved
            ? `Gemt kl. ${lastSaved.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}`
            : 'Klar til redigering'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          target="_blank"
          className="px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold transition-all hidden sm:flex items-center gap-1.5"
          title="Åbn websitet i ny fane"
        >
          <span>Se Site</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-red-600 to-emil-red hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 active:scale-95 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Gemmer...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Gem Ændringer</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

