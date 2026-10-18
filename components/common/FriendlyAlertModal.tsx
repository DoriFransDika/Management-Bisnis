'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type AlertType = 'warning' | 'danger' | 'info' | 'success';

interface FriendlyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: AlertType;
  actionText?: string;
  onAction?: () => void;
  secondaryText?: string;
  onSecondary?: () => void;
}

export function FriendlyAlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'warning',
  actionText = 'Saya Mengerti',
  onAction,
  secondaryText,
  onSecondary,
}: FriendlyAlertModalProps) {
  if (!isOpen) return null;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  const getTheme = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertCircle className="w-6 h-6 text-rose-600 stroke-[2.5]" />,
          bgIcon: 'bg-rose-100 border-rose-200',
          borderModal: 'border-rose-200',
          btnAction: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30',
          headerBg: 'from-rose-50 to-orange-50',
          textColor: 'text-rose-950',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 stroke-[2.5]" />,
          bgIcon: 'bg-emerald-100 border-emerald-200',
          borderModal: 'border-emerald-200',
          btnAction: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30',
          headerBg: 'from-emerald-50 to-teal-50',
          textColor: 'text-emerald-950',
        };
      case 'info':
        return {
          icon: <Info className="w-6 h-6 text-blue-600 stroke-[2.5]" />,
          bgIcon: 'bg-blue-100 border-blue-200',
          borderModal: 'border-blue-200',
          btnAction: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30',
          headerBg: 'from-blue-50 to-indigo-50',
          textColor: 'text-blue-950',
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 stroke-[2.5]" />,
          bgIcon: 'bg-amber-100 border-amber-200',
          borderModal: 'border-amber-200',
          btnAction: 'bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] shadow-[#FFB300]/30 hover:brightness-105',
          headerBg: 'from-amber-50 to-orange-50',
          textColor: 'text-[#3E2723]',
        };
    }
  };

  const theme = getTheme();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 ${theme.borderModal} overflow-hidden`}
        >
          {/* Header */}
          <div className={`p-5 bg-gradient-to-r ${theme.headerBg} border-b border-[#EFE4DA] flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl ${theme.bgIcon} border flex items-center justify-center shrink-0 shadow-xs`}>
                {theme.icon}
              </div>
              <div>
                <h3 className={`text-base font-black ${theme.textColor}`}>
                  {title}
                </h3>
                <p className="text-[11px] text-[#8D6E63] font-medium">
                  Pemberitahuan Sistem Dapur Mamak
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#8D6E63] hover:text-[#3E2723] hover:bg-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-3">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE4DA] text-xs leading-relaxed text-[#5D4037] font-medium">
              {message}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-white border-t border-[#EFE4DA] flex items-center justify-end gap-2.5">
            {secondaryText && (
              <button
                type="button"
                onClick={onSecondary || onClose}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#8D6E63] hover:text-[#3E2723] hover:bg-[#FAF7F2] border border-[#EFE4DA] transition-all"
              >
                {secondaryText}
              </button>
            )}
            <button
              type="button"
              onClick={handleAction}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black shadow-md active:scale-95 transition-all ${theme.btnAction}`}
            >
              {actionText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
