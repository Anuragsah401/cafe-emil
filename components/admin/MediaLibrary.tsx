'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  RefreshCw,
  Search,
} from 'lucide-react';

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
}

interface MediaLibraryProps {
  onSelectImage?: (url: string) => void;
}

export default function MediaLibrary({ onSelectImage }: MediaLibraryProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/upload');
      if (!res.ok) {
        throw new Error('Kunne ikke hente filer');
      }
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err.message || 'Fejl ved indlæsning af filer');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    setError(null);

    const uploads = Array.from(fileList);
    let successCount = 0;

    for (const file of uploads) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          successCount++;
        }
      } catch (err) {
        console.error('Upload error for file', file.name, err);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    await fetchFiles();
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Er du sikker på, at du vil slette billedet "${filename}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Kunne ikke slette billedet');
      }

      setFiles((prev) => prev.filter((f) => f.name !== filename));
    } catch (err: any) {
      alert(err.message || 'Fejl under sletning');
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <span>Mediearkiv & Billeder ({files.length})</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Upload, administrer og genbrug billeder til retter, galleri og sektioner.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchFiles}
            disabled={isLoading}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
            title="Opdater liste"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-full bg-emil-red hover:bg-emil-redHover text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-red-600/25 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploader...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload Billeder</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden file input for multi-upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
        className="hidden"
        onChange={(e) => handleUploadFiles(e.target.files)}
      />

      {/* Upload Drag & Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleUploadFiles(e.dataTransfer.files);
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className="border-2 border-dashed border-white/15 hover:border-amber-400/50 bg-white/5 hover:bg-white/[0.07] rounded-2xl p-6 text-center cursor-pointer transition-all"
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-amber-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">
              Vælg filer eller træk & slip flere billeder her
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Billederne gemmes i webserverens /public/uploads/ mappe og er klar med det samme.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søg blandt uploadede billeder..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Files Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Indlæser billedarkiv...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="py-16 text-center space-y-2 bg-white/5 rounded-2xl border border-white/10">
          <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-xs text-zinc-400">
            {search ? 'Ingen billeder matcher din søgning' : 'Der er endnu ikke uploadet nogen billeder.'}
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            Upload dit første billede nu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.name}
              className="group relative rounded-xl bg-black/40 border border-white/10 overflow-hidden flex flex-col hover:border-amber-400/40 transition-all shadow-md"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-square bg-zinc-950/80 overflow-hidden">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as any).src = '/images/cafeemil-logo.png';
                  }}
                />

                {/* Overlay actions on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopy(file.url)}
                    className="p-2 rounded-full bg-white/20 hover:bg-amber-400 text-white hover:text-black transition-colors"
                    title="Kopier URL til udklipsholder"
                  >
                    {copiedUrl === file.url ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-colors"
                    title="Åbn billede i fuld størrelse"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(file.name)}
                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-colors"
                    title="Slet billede"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info footer */}
              <div className="p-2.5 space-y-1 bg-white/[0.02]">
                <p className="text-[11px] font-medium text-white truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>{formatSize(file.size)}</span>
                  <button
                    onClick={() => handleCopy(file.url)}
                    className="text-amber-400/80 hover:text-amber-300 flex items-center gap-0.5"
                  >
                    {copiedUrl === file.url ? 'Kopieret!' : 'Kopier'}
                  </button>
                </div>
              </div>

              {/* Optional Choose Button if modal usage */}
              {onSelectImage && (
                <button
                  onClick={() => onSelectImage(file.url)}
                  className="w-full py-1.5 bg-amber-400 text-black font-bold text-[10px] uppercase hover:bg-amber-300 transition-colors"
                >
                  Vælg dette
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
