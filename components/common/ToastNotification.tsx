'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';

export interface ToastData {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[92%] sm:w-auto sm:max-w-md pointer-events-auto"
        >
          <div
            className={`flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl border-2 backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'bg-[#1C3829]/95 border-emerald-400 text-white'
                : toast.type === 'error'
                ? 'bg-[#3D1418]/95 border-rose-500 text-white'
                : 'bg-[#2E1C14]/95 border-[#FFB300] text-white'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                toast.type === 'success'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : toast.type === 'error'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-[#FFB300] text-[#3E2723] shadow-xs'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Info className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-stone-300">
                {toast.type === 'success'
                  ? 'Proses Berhasil'
                  : toast.type === 'error'
                  ? 'Pemberitahuan / Gagal'
                  : 'Informasi'}
              </p>
              <p className="text-xs font-bold leading-snug line-clamp-2">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
