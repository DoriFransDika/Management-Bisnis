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
  { id: 'peach', hex: '#FFE0B2', bg: 'bg-[#FFE0B2]', text: 'text-[#E65100]', border: 'border-[#FFCC80]' },
  { id: 'honey', hex: '#FFECB3', bg: 'bg-[#FFECB3]', text: 'text-[#F57F17]', border: 'border-[#FFE082]' },
  { id: 'cream', hex: '#FFF9C4', bg: 'bg-[#FFF9C4]', text: 'text-[#F57F17]', border: 'border-[#FFF59D]' },
  { id: 'mint', hex: '#C8E6C9', bg: 'bg-[#C8E6C9]', text: 'text-[#2E7D32]', border: 'border-[#A5D6A7]' },
  { id: 'teal', hex: '#B2DFDB', bg: 'bg-[#B2DFDB]', text: 'text-[#00695C]', border: 'border-[#80CBC4]' },
  { id: 'sky', hex: '#B3E5FC', bg: 'bg-[#B3E5FC]', text: 'text-[#0277BD]', border: 'border-[#81D4FA]' },
  { id: 'lavender', hex: '#D1C4E9', bg: 'bg-[#D1C4E9]', text: 'text-[#512DA8]', border: 'border-[#B39DDB]' },
  { id: 'taro', hex: '#E1BEE7', bg: 'bg-[#E1BEE7]', text: 'text-[#8E24AA]', border: 'border-[#CE93D8]' },
  { id: 'rose', hex: '#F8BBD0', bg: 'bg-[#F8BBD0]', text: 'text-[#C2185B]', border: 'border-[#F48FB1]' },
  { id: 'coral', hex: '#FFCCBC', bg: 'bg-[#FFCCBC]', text: 'text-[#D84315]', border: 'border-[#FFAB91]' },
  { id: 'sand', hex: '#D7CCC8', bg: 'bg-[#D7CCC8]', text: 'text-[#4E342E]', border: 'border-[#BCAAA4]' },
  { id: 'mocha', hex: '#CFD8DC', bg: 'bg-[#CFD8DC]', text: 'text-[#37474F]', border: 'border-[#B0BEC5]' },
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
