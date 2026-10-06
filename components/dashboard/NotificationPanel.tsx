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

export function NotificationPanel() {
  const { rawMaterials, finishedProducts, notifications } = useStore();

  const lowMaterials = rawMaterials.filter((m) => m.stock <= m.minStock);
  const lowProducts = finishedProducts.filter((p) => p.stock <= p.minStock);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Critical Stock Warning Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-1.5 sm:border-2 border-[#F8BBD0] text-[#3E2723] shadow-sm sm:shadow-lg shadow-[#3E2723]/5 relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 sm:pb-3.5 border-b border-[#EFE4DA]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#FCE4EC] text-[#D81B60] border border-[#F8BBD0]">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </span>
            <h3 className="font-black text-xs sm:text-sm text-[#3E2723]">Peringatan Stok Menipis</h3>
          </div>
          <span className="text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 rounded-full bg-[#FCE4EC] text-[#D81B60] border border-[#F8BBD0]">
            {lowMaterials.length + lowProducts.length} Kritis
          </span>
        </div>

        <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
          {/* Low Raw Materials */}
          {lowMaterials.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#8D6E63]">
                Bahan Perlu Restock:
              </p>
              {lowMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#FCE4EC]/70 to-[#FFF3E0]/70 border border-[#F8BBD0] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#D81B60] animate-pulse shrink-0" />
                    <div className="min-w-0">
                      <p className="font-black text-[#3E2723] text-xs truncate">{mat.name}</p>
                      <p className="text-[10px] sm:text-[11px] text-[#6D4C41]">
                        Min: {mat.minStock} {mat.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[#D81B60]">
                      {mat.stock} {mat.unit}
                    </span>
                    <p className="text-[9px] sm:text-[10px] text-[#8D6E63] font-bold">Tersisa</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Low Ready Products */}
          {lowProducts.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2 pt-1">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#8D6E63]">
                Etalase Hampir Habis:
              </p>
              {lowProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#FFF8E1] border border-[#FFE082] flex items-center justify-between text-xs gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-black text-[#3E2723] text-xs truncate">{prod.name}</p>
                    <p className="text-[10px] sm:text-[11px] text-[#6D4C41]">
                      Sisa {prod.stock} {prod.unit}
                    </p>
                  </div>
                  <span className="text-xs font-black text-[#E65100]">
                    {prod.stock} {prod.unit}
                  </span>
                </div>
              ))}
            </div>
          )}

          {lowMaterials.length === 0 && lowProducts.length === 0 && (
            <div className="p-3 sm:p-4 text-center text-xs text-[#8D6E63]">
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
        className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-1.5 sm:border-2 border-[#EFE4DA] text-[#3E2723] shadow-sm sm:shadow-lg shadow-[#3E2723]/5"
      >
        <div className="flex items-center justify-between pb-3 sm:pb-3.5 border-b border-[#EFE4DA]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#FFF3E0] text-[#FFB300] border border-[#FFE0B2]">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3E2723]" />
            </span>
            <h3 className="font-black text-xs sm:text-sm text-[#3E2723]">Aktivitas Dapur Terbaru</h3>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#8D6E63]">Hari Ini</span>
        </div>

        <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
          {notifications.slice(0, 5).map((item) => (
            <div key={item.id} className="flex gap-2.5 text-xs">
              <div className="flex flex-col items-center">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1 ${
                    item.severity === 'warning'
                      ? 'bg-[#D81B60] ring-4 ring-[#FCE4EC]'
                      : item.severity === 'success'
                      ? 'bg-[#2E7D32] ring-4 ring-[#E8F5E9]'
                      : 'bg-[#FFB300] ring-4 ring-[#FFF8E1]'
                  }`}
                />
                <span className="w-0.5 flex-1 bg-[#EFE4DA] my-1" />
              </div>
              <div className="flex-1 pb-1.5 min-w-0">
                <p className="font-black text-[#3E2723] text-xs truncate">{item.title}</p>
                <p className="text-[10px] sm:text-[11px] text-[#5D4037] mt-0.5 leading-relaxed">{item.message}</p>
                <span className="text-[9px] sm:text-[10px] text-[#A1887F] font-mono mt-0.5 block">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
