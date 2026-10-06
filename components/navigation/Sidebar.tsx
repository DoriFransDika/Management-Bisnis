'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Tags,
  Wallet,
  Calculator,
  LogOut,
  Sparkles,
  Heart,
  ChevronRight
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, summary } = useStore();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Manajemen Stok',
      href: '/stok',
      icon: Boxes,
      badge: summary.lowStockItemsCount > 0 ? `${summary.lowStockItemsCount} Alert` : null,
      badgeColor: 'bg-rose-100 text-rose-700 border border-rose-200',
    },
    {
      label: 'Kelola Kategori',
      href: '/kategori',
      icon: Tags,
      badge: 'Baru',
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200',
    },
    {
      label: 'Keuangan Toko',
      href: '/keuangan',
      icon: Wallet,
      badge: null,
    },
    {
      label: 'Kalkulator',
      href: '/kalkulator',
      icon: Calculator,
      badge: null,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white/92 backdrop-blur-md border-r border-[#EFE4DA] text-[#3E2723] select-none shrink-0 h-screen sticky top-0 shadow-[4px_0_30px_rgba(62,39,35,0.03)] z-30">
      {/* Brand Header with Store Logo */}
      <div className="p-5 border-b border-[#EFE4DA] flex items-center gap-3 bg-gradient-to-b from-[#FFFDF9] to-white">
        <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-md shadow-[#3E2723]/10 border-2 border-[#FFB300]/40 bg-white p-0.5 shrink-0 transition-transform duration-300 hover:scale-105">
          <Image
            src="/logo.jpeg"
            alt="Logo Dapur Mamak"
            width={48}
            height={48}
            className="w-full h-full object-contain rounded-xl"
            priority
          />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <h1 className="font-black text-[#3E2723] text-lg tracking-tight">Dapoer Mamak</h1>
          </div>
          <p className="text-[11px] text-[#8D6E63] font-bold tracking-tight">Cooking With Love</p>
        </div>
      </div>

      {/* User Badge Profile */}
      <div className="p-3.5 mx-4 my-3 rounded-3xl bg-gradient-to-r from-[#FCE4EC]/50 to-[#FFF3E0]/60 border border-[#EFE4DA] flex items-center gap-3 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-[#FFB300] border border-[#FFB300]/60 flex items-center justify-center text-[#3E2723] font-black text-sm shadow-xs">
          DM
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-xs font-black text-[#3E2723] truncate">{user.name || 'Mamak Chef & Owner'}</p>
          <p className="text-[11px] text-[#D81B60] font-bold truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Dapur Aktif • Mamak
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-4 py-1 space-y-1.5 overflow-y-auto">
        <p className="text-[11px] font-black uppercase tracking-wider text-[#A1887F] px-3 py-1">
          Menu Toko Roti
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] shadow-md shadow-[#FFB300]/30 font-black'
                  : 'text-[#6D4C41] hover:text-[#3E2723] hover:bg-[#FFF3E0]/70'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-[#3E2723]' : 'text-[#8D6E63] group-hover:text-[#3E2723]'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-black px-2 py-0.5 rounded-full',
                    isActive ? 'bg-[#3E2723] text-white' : item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Warm Bakery Banner */}
      <div className="p-4 mx-4 mb-3 rounded-3xl bg-gradient-to-br from-[#FCE4EC] via-[#FFF3E0] to-white border border-[#F8BBD0] text-[#3E2723] shadow-xs">
        <div className="flex items-center gap-2 text-[#D81B60] text-xs font-black mb-1">
          <Heart className="w-3.5 h-3.5 fill-[#D81B60]" />
          <span>Etalase Roti Hangat</span>
        </div>
        <p className="text-xs text-[#5D4037] leading-relaxed font-medium">
          Tersedia <strong className="text-[#3E2723] font-black">{summary.readyProductsCount} pcs</strong> produk siap saji untuk etalase hari ini.
        </p>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-[#EFE4DA]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-[#8D6E63] hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}
