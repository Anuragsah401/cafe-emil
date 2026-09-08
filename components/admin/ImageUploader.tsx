'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, Check, ExternalLink } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  description?: string;
  aspectRatio?: 'square' | 'video' | 'any';
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Billede',
  placeholder = 'Vælg eller upload billede...',
  description,
  aspectRatio = 'any',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload fejlede');
      }

      if (data.url) {
        onChange(data.url);
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Kunne ikke uploade filen. Prøv igen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset file input value so re-selecting same file triggers change
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const hasImage = Boolean(value && value.trim().length > 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] text-zinc-400 hover:text-amber-400 transition-colors"
        >
          {showUrlInput ? 'Skjul URL-felt' : 'Indtast URL manuelt'}
        </button>
      </div>

      {description && <p className="text-[11px] text-zinc-400">{description}</p>}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Preview and Upload Card */}
      {hasImage ? (
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row gap-4 items-center">
          {/* Thumbnail preview */}
          <div
            className={`relative w-28 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden bg-black/60 border border-white/10 flex-shrink-0 group`}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as any).src = '/images/cafeemil-logo.png';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-full bg-black/70 text-white hover:text-amber-400"
                title="Åbn billede i ny fane"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Info and Actions */}
          <div className="flex-1 min-w-0 w-full space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span className="truncate">{value.startsWith('/uploads/') ? 'Uploadet billede' : 'Billede valgt'}</span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400 truncate bg-black/40 px-2 py-1 rounded border border-white/5">
              {value}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                    <span>Uploader...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
                    <span>Skift billede</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Fjern</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state: Drop zone / Upload trigger */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-amber-400 bg-amber-400/5'
              : 'border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/[0.07]'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-white font-medium">Uploader billede til serveren...</p>
              <p className="text-[10px] text-zinc-400">Vent et øjeblik</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-amber-400 shadow-inner">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Klik for at vælge billede <span className="text-zinc-400 font-normal">eller træk & slip her</span>
                </p>
                <p className="text-[10px] text-zinc-400 mt-1">
                  JPG, PNG, WEBP, GIF, AVIF eller SVG (maks. 20MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual URL Input (collapsible fallback) */}
      {showUrlInput && (
        <div className="pt-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/50"
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
