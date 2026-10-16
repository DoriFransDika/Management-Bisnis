'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Edit2, Trash2, PackageX, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Category, FinishedProduct } from '@/types';
import { CategoryIcon } from '@/components/common/CategoryIcon';

export type ReadyStatusFilter = 'all' | 'available' | 'low' | 'out';

export function getReadyProductStatus(p: FinishedProduct): 'out' | 'low' | 'safe' {
  if (p.stock <= 0) return 'out';
  if (p.stock <= p.minStock) return 'low';
  return 'safe';
}

export function matchesReadyStatus(p: FinishedProduct, filter: ReadyStatusFilter): boolean {
  const s = getReadyProductStatus(p);
  if (filter === 'all') return true;
  if (filter === 'available') return s !== 'out';
  return s === filter;
}

interface ReadyProductListProps {
  products: FinishedProduct[];
  categories: Category[];
  onEdit: (p: FinishedProduct) => void;
  onDelete: (p: FinishedProduct) => void;
  onAdd: () => void;
}

const STATUS_STYLE = {
  out: {
    card: 'border-rose-300 bg-gradient-to-b from-white to-rose-50/60',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    stock: 'text-rose-600',
    label: 'Habis',
    Icon: PackageX,
  },
  low: {
    card: 'border-amber-300 bg-gradient-to-b from-white to-amber-50/60',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    stock: 'text-amber-700',
    label: 'Hampir Habis',
    Icon: AlertTriangle,
  },
  safe: {
    card: 'border-[#EFE4DA] bg-white/95',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    stock: 'text-[#2E7D32]',
    label: 'Tersedia',
    Icon: CheckCircle2,
  },
} as const;

export function ReadyProductList({ products, categories, onEdit, onDelete, onAdd }: ReadyProductListProps) {
  if (products.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/90 backdrop-blur-md border border-[#EFE4DA]">
        <Sparkles className="w-12 h-12 text-[#BCAAA4] mx-auto mb-3 opacity-60" />
        <h3 className="font-black text-[#3E2723] text-base">Belum ada produk ready yang cocok</h3>
        <p className="text-xs text-[#8D6E63] mt-1">
          Input stok produk ready baru atau sesuaikan filter kategori / status.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-xs font-black shadow-md shadow-[#FFB300]/25 active:scale-95 transition-all"
        >
          + Input Produk Ready
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
      <AnimatePresence initial={false}>
        {products.map((p) => {
          const status = getReadyProductStatus(p);
          const style = STATUS_STYLE[status];
          const cat = categories.find((c) => c.id === p.categoryId);

          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group p-3 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-md border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${style.card}`}
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <span
                    className={`text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-xl flex items-center gap-1 truncate max-w-[75%] ${cat ? `${cat.bgColor} ${cat.textColor}` : 'bg-stone-100 text-stone-600'
                      }`}
                  >
                    {cat && <CategoryIcon name={cat.iconName} className="w-3 h-3 shrink-0" />}
                    <span className="truncate">{cat?.name || p.category}</span>
                  </span>
                  <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      id={`edit-ready-${p.id}`}
                      onClick={() => onEdit(p)}
                      className="p-1 rounded-md text-[#8D6E63] hover:text-[#3E2723] hover:bg-stone-100"
                      title="Ubah Produk"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      id={`delete-ready-${p.id}`}
                      onClick={() => onDelete(p)}
                      className="p-1 rounded-md text-[#8D6E63] hover:text-rose-600 hover:bg-rose-50"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h3 className="font-black text-[#3E2723] text-sm sm:text-base mt-2 truncate" title={p.name}>
                  {p.name}
                </h3>

                <div className="mt-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4DA]">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#8D6E63] block">
                    Stok Saat Ini
                  </span>
                  <p className={`text-lg sm:text-2xl font-black mt-0.5 ${style.stock}`}>
                    {p.stock} <span className="text-xs font-semibold text-[#8D6E63]">pcs</span>
                  </p>
                  <span className="text-[9px] text-[#A1887F] font-semibold">Min. {p.minStock} pcs</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#EFE4DA]/80 flex items-center justify-between gap-1">
                <span
                  className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${style.badge}`}
                >
                  <style.Icon className="w-3 h-3" />
                  {style.label}
                </span>
                <span className="text-[9px] text-[#A1887F] font-medium text-right leading-tight">
                  Keluar via transaksi
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
