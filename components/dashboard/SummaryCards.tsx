'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Wallet, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { formatRupiah, formatNumber } from '@/lib/utils';

export function SummaryCards() {
  const { summary } = useStore();

  const cards = [
    {
      title: 'Uang Masuk',
      amount: formatRupiah(summary.totalIncome),
      subtext: '+18.4% kasir & katering',
      href: '/keuangan',
      icon: ArrowUpRight,
      bgGradient: 'from-white via-[#F1F8E9] to-white',
      borderColor: 'border-[#DCEDC8]',
      iconBg: 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]',
      badgeText: 'Pemasukan',
      badgeClass: 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]',
      accentColor: 'text-[#2E7D32]',
    },
    {
      title: 'Pengeluaran',
      amount: formatRupiah(summary.totalExpense),
      subtext: 'Belanja bahan & gas LPG',
      href: '/keuangan',
      icon: ArrowDownRight,
      bgGradient: 'from-white via-[#FCE4EC]/50 to-white',
      borderColor: 'border-[#F8BBD0]',
      iconBg: 'bg-[#FCE4EC] text-[#C2185B] border border-[#F8BBD0]',
      badgeText: 'Biaya Toko',
      badgeClass: 'bg-[#FCE4EC] text-[#C2185B] border border-[#F8BBD0]',
      accentColor: 'text-[#C2185B]',
    },
    {
      title: 'Keuntungan Bersih',
      amount: formatRupiah(summary.netProfit),
      subtext: 'Laba bersih sehat (~39%)',
      href: '/keuangan',
      icon: Wallet,
      bgGradient: 'from-white via-[#FFF3E0] to-[#FFF8E1]',
      borderColor: 'border-[#FFE082]',
      iconBg: 'bg-[#FFECB3] text-[#E65100] border border-[#FFD54F]',
      badgeText: 'Laba Bersih',
      badgeClass: 'bg-[#FFECB3] text-[#E65100] border border-[#FFD54F]',
      accentColor: 'text-[#E65100]',
      highlight: true,
    },
    {
      title: 'Stok Roti Siap Jual',
      amount: `${formatNumber(summary.readyProductsCount)} Pcs`,
      subtext: 'Etalase toko pagi & sore',
      href: '/stok',
      icon: ShoppingBag,
      bgGradient: 'from-white via-[#FCE4EC]/70 to-[#FFF3E0]/70',
      borderColor: 'border-[#F8BBD0]',
      iconBg: 'bg-[#F8BBD0] text-[#880E4F] border border-[#F48FB1]',
      badgeText: 'Siap Saji',
      badgeClass: 'bg-[#FCE4EC] text-[#880E4F] border border-[#F8BBD0]',
      accentColor: 'text-[#880E4F]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Link key={idx} href={card.href} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-3xl bg-gradient-to-br ${card.bgGradient} border-2 ${card.borderColor} text-[#3E2723] shadow-lg shadow-[#3E2723]/5 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#3E2723]/10`}
            >
              {/* Subtle glow orb */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#FFB300]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className={`text-[11px] font-black px-3 py-1 rounded-full ${card.badgeClass}`}>
                  {card.badgeText}
                </span>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.iconBg} shadow-xs group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#6D4C41]">
                  {card.title}
                </p>
                <h3 className="text-2xl sm:text-[26px] font-black tracking-tight text-[#3E2723] mt-1">
                  {card.amount}
                </h3>
                <p className="text-[11px] font-bold text-[#5D4037] mt-1.5 flex items-center gap-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${card.accentColor} bg-current`}></span>
                  {card.subtext}
                </p>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
