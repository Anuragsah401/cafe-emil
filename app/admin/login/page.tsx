'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ugyldigt brugernavn eller adgangskode');
      }

      // Successful login
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Der opstod en fejl under login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#100D0E] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emil-red/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8 animate-page-enter">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <img
              src="/images/cafeemil-logo.png"
              alt="Café Emil Logo"
              className="h-16 w-auto mx-auto drop-shadow-[0_2px_10px_rgba(215,42,22,0.4)]"
            />
          </Link>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Administrator Login</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              Café Emil Kontrolpanel
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Log ind for at styre menukort, sektioner og hjemmesideindhold
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#181415]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                Brugernavn eller e-mail
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emil-red focus:bg-white/10 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                Adgangskode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Indtast din adgangskode"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emil-red focus:bg-white/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                  aria-label={showPassword ? 'Skjul adgangskode' : 'Vis adgangskode'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full bg-emil-red hover:bg-emil-redHover active:scale-98 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 pt-3 disabled:opacity-50"
            >
              <span>{loading ? 'Logger ind...' : 'Log ind på kontrolpanelet'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Notice */}
          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-zinc-400">
              Standard logindata: Brugernavn <code className="text-amber-300 font-mono">admin</code> &bull; Kode <code className="text-amber-300 font-mono">CafeEmil2025!</code>
            </p>
          </div>
        </div>

        {/* Back to website */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            &larr; Tilbage til Café Emil forside
          </Link>
        </div>
      </div>
    </div>
  );
}

