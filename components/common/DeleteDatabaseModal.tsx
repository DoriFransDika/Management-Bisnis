'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, X, Loader2, Lock, Mail, Eye, EyeOff, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseService, supabase } from '@/lib/supabase';

interface DeleteDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemCountText: string;
  warningNote?: string;
  confirmButtonText?: string;
  requireAuth?: boolean;
}

export function DeleteDatabaseModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemCountText,
  warningNote = 'Seluruh data di database Supabase dan penyimpanan lokal akan dihapus permanen dan tidak dapat dipulihkan lagi.',
  confirmButtonText = 'Verifikasi & Hapus Semua Data',
  requireAuth = true,
}: DeleteDatabaseModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset inputs whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setErrorMsg('');
      setShowPassword(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isProcessing) return;
    setErrorMsg('');
    setEmail('');
    setPassword('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (requireAuth) {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanEmail || !cleanPass) {
        setErrorMsg('Harap masukkan email dan kata sandi akun pengelola untuk verifikasi.');
        return;
      }

      setIsProcessing(true);

      try {
        // 1. Verifikasi kredensial ke database tabel users
        const dbCheck = await supabaseService.verifyUser(cleanEmail, cleanPass);
        let isValid = dbCheck.success;

        // 2. Jika belum valid, coba verifikasi dengan Supabase Auth
        if (!isValid) {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass,
          });
          if (!authError && authData.user) {
            isValid = true;
          }
        }

        if (!isValid) {
          setErrorMsg('Email atau kata sandi verifikasi tidak cocok. Penghapusan database ditolak demi keamanan!');
          setIsProcessing(false);
          return;
        }

        // 3. Kredensial terverifikasi, eksekusi penghapusan database
        await onConfirm();
        handleClose();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memverifikasi akun.';
        setErrorMsg(msg);
        setIsProcessing(false);
      }
    } else {
      setIsProcessing(true);
      try {
        await onConfirm();
        handleClose();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-rose-200 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 border-b border-rose-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#3E2723]">{title}</h3>
                <p className="text-[11px] text-rose-700 font-bold">{itemCountText}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="p-1.5 rounded-xl text-[#8D6E63] hover:text-[#3E2723] hover:bg-white/80 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Body Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="text-xs text-[#5D4037] leading-relaxed">
                {description}
              </p>

              {/* Warning Alert */}
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-rose-900 leading-relaxed">
                  <strong className="font-black block text-rose-950 mb-0.5">PERINGATAN PENGHAPUSAN PERMANEN:</strong>
                  {warningNote}
                </div>
              </div>

              {/* Security Verification Section */}
              {requireAuth && (
                <div className="p-4 rounded-2xl bg-[#FFF9F6] border border-[#F2D7D0] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-[#8C2A1E]">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>Verifikasi Keamanan Wajib Pengelola</span>
                  </div>
                  <p className="text-[11px] text-[#6D4C41]">
                    Demi keamanan data sistem, masukkan email akun pengelola dan kata sandi Anda untuk mengonfirmasi penghapusan database:
                  </p>

                  {/* Input Email */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#6D4C41] mb-1">
                      Email Pengelola
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#A1887F] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        disabled={isProcessing}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="contoh: akun@gmail.com"
                        className="w-full bg-white border border-[#EFE4DA] focus:border-rose-400 rounded-xl pl-9 pr-3 py-2 text-xs text-[#3E2723] font-bold placeholder-[#BCAAA4] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Input Password */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#6D4C41] mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#A1887F] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        disabled={isProcessing}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="••••••••••••"
                        className="w-full bg-white border border-[#EFE4DA] focus:border-rose-400 rounded-xl pl-9 pr-10 py-2 text-xs text-[#3E2723] font-bold placeholder-[#BCAAA4] focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D6E63] hover:text-[#3E2723]"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-5 bg-[#FAF7F2] border-t border-[#EFE4DA] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#8D6E63] hover:text-[#3E2723] hover:bg-white border border-[#EFE4DA] transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isProcessing || (requireAuth && (!email.trim() || !password.trim()))}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi & Menghapus Database...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{confirmButtonText}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
