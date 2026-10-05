'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  Sparkles,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';

export function NotificationPanel({ onOpenQuickBake }: { onOpenQuickBake?: () => void }) {
  const { rawMaterials, finishedProducts, notifications } = useStore();

  const lowMaterials = rawMaterials.filter((m) => m.stock <= m.minStock);
  const lowProducts = finishedProducts.filter((p) => p.stock <= p.minStock);

  return (
    <div className="space-y-5">
      {/* Critical Stock Warning Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="p-6 rounded-3xl bg-white border-2 border-[#F8BBD0] text-[#3E2723] shadow-lg shadow-[#3E2723]/5 relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE4DA]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-[#FCE4EC] text-[#D81B60] border border-[#F8BBD0]">
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h3 className="font-black text-sm text-[#3E2723]">Peringatan Stok Menipis</h3>
          </div>
          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#FCE4EC] text-[#D81B60] border border-[#F8BBD0]">
            {lowMaterials.length + lowProducts.length} Kritis
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {/* Low Raw Materials */}
          {lowMaterials.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#8D6E63]">
                Bahan Dapur Perlu Restock:
              </p>
              {lowMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FCE4EC]/70 to-[#FFF3E0]/70 border border-[#F8BBD0] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D81B60] animate-pulse" />
                    <div>
                      <p className="font-black text-[#3E2723]">{mat.name}</p>
                      <p className="text-[11px] text-[#6D4C41]">
                        Batas aman: {mat.minStock} {mat.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-[#D81B60]">
                      {mat.stock} {mat.unit}
                    </span>
                    <p className="text-[10px] text-[#8D6E63] font-bold">Tersisa</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Low Ready Products */}
          {lowProducts.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-[#8D6E63]">
                Etalase Roti Hampir Habis:
              </p>
              {lowProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3.5 rounded-2xl bg-[#FFF8E1] border border-[#FFE082] flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-black text-[#3E2723]">{prod.name}</p>
                    <p className="text-[11px] text-[#6D4C41]">
                      Tersisa {prod.stock} {prod.unit} (Min: {prod.minStock})
                    </p>
                  </div>
                  {onOpenQuickBake && (
                    <button
                      onClick={onOpenQuickBake}
                      className="px-3.5 py-1.5 rounded-xl bg-[#FFB300] text-[#3E2723] text-[11px] font-black hover:bg-[#FFA000] active:scale-95 transition-all shadow-xs"
                    >
                      Bake
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {lowMaterials.length === 0 && lowProducts.length === 0 && (
            <div className="p-4 text-center text-xs text-[#8D6E63]">
              Semua bahan baku dan roti di etalase dalam batas aman.
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="p-6 rounded-3xl bg-white border-2 border-[#EFE4DA] text-[#3E2723] shadow-lg shadow-[#3E2723]/5"
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-[#EFE4DA]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-[#FFF3E0] text-[#FFB300] border border-[#FFE0B2]">
              <Clock className="w-4 h-4 text-[#3E2723]" />
            </span>
            <h3 className="font-black text-sm text-[#3E2723]">Aktivitas Dapur Terbaru</h3>
          </div>
          <span className="text-[11px] font-bold text-[#8D6E63]">Hari Ini</span>
        </div>

        <div className="mt-4 space-y-3">
          {notifications.slice(0, 5).map((item) => (
            <div key={item.id} className="flex gap-3 text-xs">
              <div className="flex flex-col items-center">
                <span
                  className={`w-3 h-3 rounded-full mt-1 ${
                    item.severity === 'warning'
                      ? 'bg-[#D81B60] ring-4 ring-[#FCE4EC]'
                      : item.severity === 'success'
                      ? 'bg-[#2E7D32] ring-4 ring-[#E8F5E9]'
                      : 'bg-[#FFB300] ring-4 ring-[#FFF8E1]'
                  }`}
                />
                <span className="w-0.5 flex-1 bg-[#EFE4DA] my-1" />
              </div>
              <div className="flex-1 pb-2">
                <p className="font-black text-[#3E2723]">{item.title}</p>
                <p className="text-[11px] text-[#5D4037] mt-0.5 leading-relaxed">{item.message}</p>
                <span className="text-[10px] text-[#A1887F] font-mono mt-1 block">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
