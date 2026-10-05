'use client';

import React from 'react';
import {
  Wheat,
  Croissant,
  Cake,
  Egg,
  Milk,
  Package,
  Sparkles,
  Flame,
  Boxes,
  Coffee,
  Heart,
  Layers,
  Cookie,
  UtensilsCrossed,
  ShoppingBag,
  Tag,
  CircleDot
} from 'lucide-react';

export const AVAILABLE_CATEGORY_ICONS = [
  { name: 'Wheat', label: 'Tepung / Gandum', icon: Wheat },
  { name: 'Croissant', label: 'Roti & Pastry', icon: Croissant },
  { name: 'Cookie', label: 'Biskuit / Kue Kering', icon: Cookie },
  { name: 'Cake', label: 'Cake / Bolu', icon: Cake },
  { name: 'Egg', label: 'Telur Ayam', icon: Egg },
  { name: 'Milk', label: 'Susu & Mentega', icon: Milk },
  { name: 'Flame', label: 'Oven & Panggang', icon: Flame },
  { name: 'Coffee', label: 'Kopi / Minuman', icon: Coffee },
  { name: 'Package', label: 'Kemasan / Box', icon: Package },
  { name: 'Boxes', label: 'Gudang Bahan', icon: Boxes },
  { name: 'Heart', label: 'Resep Favorit', icon: Heart },
  { name: 'Sparkles', label: 'Premium / Spesial', icon: Sparkles },
  { name: 'ShoppingBag', label: 'Etalase Toko', icon: ShoppingBag },
  { name: 'Tag', label: 'Kategori Umum', icon: Tag },
];

export const CATEGORY_COLOR_PRESETS = [
  { id: 'pink', name: 'Dusty Pink', bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200' },
  { id: 'peach', name: 'Peach Pastel', bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
  { id: 'cream', name: 'Krem Madu', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  { id: 'matcha', name: 'Matcha / Mint', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'taro', name: 'Taro / Lilac', bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  { id: 'chocolate', name: 'Cokelat Hangat', bg: 'bg-stone-200', text: 'text-[#4A3B32]', border: 'border-stone-300' },
];

export function CategoryIcon({
  name,
  className = 'w-4 h-4',
}: {
  name: string;
  className?: string;
}) {
  const found = AVAILABLE_CATEGORY_ICONS.find((i) => i.name.toLowerCase() === name.toLowerCase());
  if (found) {
    const IconComp = found.icon;
    return <IconComp className={className} />;
  }
  return <Tag className={className} />;
}
