'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ShoppingBag,
  Boxes,
  ArrowRight,
  TrendingUp,
  Receipt,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { NotificationPanel } from '@/components/dashboard/NotificationPanel';
import { QuickBakeModal } from '@/components/dashboard/QuickBakeModal';
import { QuickSaleModal } from '@/components/dashboard/QuickSaleModal';
import { QuickRestockModal } from '@/components/dashboard/QuickRestockModal';
import { formatRupiah } from '@/lib/utils';

export default function DashboardPage() {
  const { transactions } = useStore();

  const [isBakeModalOpen, setIsBakeModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-fixed bg-no-repeat text-[#3E2723] flex flex-col md:flex-row font-sans">
      {/* Sidebar for Tablet / Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
        {/* Header */}
        <Header onOpenQuickBake={() => setIsBakeModalOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Welcome Banner with Store Logo & Quick Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-6 sm:p-7 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-[#EFE4DA] shadow-lg shadow-[#3E2723]/5 relative overflow-hidden"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md shadow-[#3E2723]/10 border-2 border-[#FFB300] bg-white p-1 shrink-0">
                <Image
                  src="/logo.jpeg"
                  alt="Logo Dapoer Mamak"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain rounded-xl"
                  priority
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#D81B60] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 bg-[#FCE4EC] px-3 py-0.5 rounded-full border border-[#F8BBD0]">
                    <Heart className="w-3.5 h-3.5 fill-[#D81B60]" /> Selamat Bertugas, Mamak!
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#3E2723] tracking-tight mt-1">
                  Pusat Kendali Dapoer Mamak
                </h2>
                <p className="text-xs sm:text-sm text-[#6D4C41] mt-0.5 max-w-xl font-medium">
                  Pantau stok adonan roti, pesanan kasir, dan keuntungan bersih dalam genggaman layar sentuh.
                </p>
              </div>
            </div>

            {/* Action Bar Pills with Golden Ribbon Button */}
            <div className="flex flex-wrap items-center gap-2.5 relative z-10 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsBakeModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-xs font-black shadow-md shadow-[#FFB300]/30 hover:brightness-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 fill-[#3E2723]" />
                <span>Baking Roti</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSaleModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-black active:scale-95 transition-all shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-[#2E7D32]" />
                <span>Kasir Jual</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRestockModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#FFF3E0] hover:bg-[#FFE0B2] border border-[#FFD54F] text-[#3E2723] text-xs font-black active:scale-95 transition-all shadow-xs"
              >
                <Boxes className="w-4 h-4 text-[#E65100]" />
                <span>Belanja Bahan</span>
              </button>
            </div>
          </motion.div>

          {/* Bagian Atas: 4 Kotak Metrik Utama (Focus Layout) */}
          <SummaryCards />

          {/* Bagian Tengah & Kanan: Grid Grafik & Panel Notifikasi */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Center Area: Sales Chart & Recent Transactions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Grafik Penjualan Recharts */}
              <SalesChart />

              {/* Mutasi Keuangan Kasir & Dapur */}
              <div className="p-6 md:p-7 rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#EFE4DA] shadow-lg shadow-[#3E2723]/5">
                <div className="flex items-center justify-between pb-4 border-b border-[#EFE4DA]">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-2xl bg-[#FFF3E0] text-[#3E2723] border border-[#FFE0B2]">
                      <Receipt className="w-4 h-4" />
                    </span>
                    <h3 className="font-black text-base text-[#3E2723]">Mutasi Keuangan Terkini</h3>
                  </div>
                  <Link
                    href="/keuangan"
                    className="text-xs font-black text-[#D81B60] hover:text-[#AD1457] flex items-center gap-1 group"
                  >
                    <span>Buku Kas Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="mt-4 space-y-2.5">
                  {transactions.slice(0, 5).map((trx) => (
                    <div
                      key={trx.id}
                      className="p-4 rounded-2xl bg-white/80 border border-[#EFE4DA] flex items-center justify-between gap-3 text-xs hover:border-[#FFB300] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-3 h-3 rounded-full shrink-0 ${
                            trx.type === 'income' ? 'bg-[#2E7D32]' : 'bg-[#C2185B]'
                          }`}
                        />
                        <div>
                          <p className="font-black text-[#3E2723]">{trx.description}</p>
                          <p className="text-[11px] text-[#8D6E63] mt-0.5 font-medium">
                            {trx.date} • {trx.category} • <span className="text-[#3E2723] font-bold">{trx.paymentMethod}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`font-black text-sm ${
                            trx.type === 'income' ? 'text-[#2E7D32]' : 'text-[#C2185B]'
                          }`}
                        >
                          {trx.type === 'income' ? '+' : '-'} {formatRupiah(trx.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bagian Samping/Kanan: Panel Notifikasi Real-Time */}
            <div className="lg:col-span-1">
              <NotificationPanel onOpenQuickBake={() => setIsBakeModalOpen(true)} />
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile (HP) */}
      <BottomNav />

      {/* Action Modals */}
      <QuickBakeModal isOpen={isBakeModalOpen} onClose={() => setIsBakeModalOpen(false)} />
      <QuickSaleModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} />
      <QuickRestockModal isOpen={isRestockModalOpen} onClose={() => setIsRestockModalOpen(false)} />
    </div>
  );
}
