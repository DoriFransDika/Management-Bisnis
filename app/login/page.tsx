'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  KeyRound,
  Heart
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [email, setEmail] = useState('dapurmamak@gmail.com');
  const [password, setPassword] = useState('bismillah laku');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const ok = login(email, password);
      if (ok) {
        router.push('/dashboard');
      } else {
        setErrorMsg('Email atau Password salah! Gunakan kredensial resmi Dapoer Mamak.');
        setIsLoading(false);
      }
    }, 350);
  };

  const handleInstantLogin = () => {
    setEmail('dapurmamak@gmail.com');
    setPassword('bismillah laku');
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      login('dapurmamak@gmail.com', 'bismillah laku');
      router.push('/dashboard');
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-fixed bg-no-repeat text-[#3E2723] flex flex-col justify-center items-center p-4 selection:bg-[#FFB300]/30 selection:text-[#3E2723] relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#FCE4EC]/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#FFF3E0]/50 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card with Logo */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md border-2 border-[#EFE4DA] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#3E2723]/10 relative z-10">
        {/* Brand Header with Store Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md shadow-[#3E2723]/15 border-2 border-[#FFB300] bg-white p-1 mb-3">
            <Image
              src="/logo.jpeg"
              alt="Logo Dapoer Mamak"
              width={80}
              height={80}
              className="w-full h-full object-contain rounded-xl"
              priority
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#3E2723] tracking-tight">
            Dapoer Mamak
          </h1>
          <p className="text-xs text-[#8D6E63] mt-0.5 font-bold">
            Snack & Healthy Drink • Cooking With Love
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#6D4C41] mb-1.5">
              Email Pengelola
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dapurmamak@gmail.com"
                className="w-full bg-white/90 border border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#3E2723] font-bold placeholder-[#A1887F] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#6D4C41] mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/90 border border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-[#3E2723] font-bold placeholder-[#A1887F] focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8D6E63] hover:text-[#3E2723]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Golden Ribbon Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-3xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] font-black text-xs sm:text-sm shadow-md shadow-[#FFB300]/30 hover:brightness-105 active:scale-98 transition-all"
          >
            {isLoading ? (
              <span>Membuka Dapur Mamak...</span>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Instant Access Helper */}
        <div className="mt-5 pt-5 border-t border-[#EFE4DA]">
          <button
            type="button"
            onClick={handleInstantLogin}
            className="w-full py-2.5 px-3 rounded-2xl bg-[#FFF3E0] hover:bg-[#FFE0B2] border border-[#FFD54F] text-[#3E2723] text-xs font-black flex items-center justify-center gap-2 transition-all group shadow-xs"
          >
            <KeyRound className="w-4 h-4 text-[#FFB300] group-hover:rotate-12 transition-transform stroke-[2.5]" />
            <span>1-Klik Masuk Otomatis (Demo Mamak)</span>
          </button>

          <div className="mt-3 bg-white/80 p-3 rounded-2xl border border-[#EFE4DA] text-[11px] text-[#6D4C41] space-y-0.5">
            <p>
              Email:{' '}
              <code className="text-[#3E2723] font-mono font-black">dapurmamak@gmail.com</code>
            </p>
            <p>
              Sandi:{' '}
              <code className="text-[#3E2723] font-mono font-black">bismillah laku</code>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-xs text-[#8D6E63] hover:text-[#3E2723] transition-colors font-bold"
          >
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
