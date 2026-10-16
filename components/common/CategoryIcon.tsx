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
  CircleDot,
  Scale,
  Droplets,
  Apple,
  Nut,
  Citrus,
  Cherry,
  FlaskConical,
  Container,
  CakeSlice,
  Donut,
  Pizza,
  Sandwich,
  CupSoda,
  GlassWater,
  IceCream,
  Candy,
  Popcorn,
  Soup,
} from 'lucide-react';

export const MATERIAL_CATEGORY_ICONS = [
  { name: 'Wheat', label: 'Tepung / Gandum', icon: Wheat },
  { name: 'Egg', label: 'Telur Ayam / Bebek', icon: Egg },
  { name: 'Milk', label: 'Susu & Mentega Cair', icon: Milk },
  { name: 'Droplets', label: 'Minyak & Cairan', icon: Droplets },
  { name: 'Flame', label: 'Ragi & Pengembang', icon: Flame },
  { name: 'Sparkles', label: 'Gula & Pemanis', icon: Sparkles },
  { name: 'Layers', label: 'Mentega Lembaran / Cokelat Batang', icon: Layers },
  { name: 'Nut', label: 'Kacang & Selai', icon: Nut },
  { name: 'Apple', label: 'Buah & Kismis', icon: Apple },
  { name: 'Citrus', label: 'Lemon & Jeruk', icon: Citrus },
  { name: 'Cherry', label: 'Ceri & Selai Buah', icon: Cherry },
  { name: 'FlaskConical', label: 'Perisa, Pasta & Pewarna', icon: FlaskConical },
  { name: 'Package', label: 'Kemasan, Dus & Mika', icon: Package },
  { name: 'Boxes', label: 'Gudang & Karung Bahan', icon: Boxes },
  { name: 'Container', label: 'Toples & Wadah Bahan', icon: Container },
  { name: 'Scale', label: 'Timbangan & Takaran', icon: Scale },
];

export const PRODUCT_CATEGORY_ICONS = [
  { name: 'Croissant', label: 'Roti & Croissant', icon: Croissant },
  { name: 'Cake', label: 'Cake & Tart', icon: Cake },
  { name: 'CakeSlice', label: 'Potongan Bolu & Cake Slice', icon: CakeSlice },
  { name: 'Cookie', label: 'Kue Kering & Cookies', icon: Cookie },
  { name: 'Donut', label: 'Donat Manis', icon: Donut },
  { name: 'Pizza', label: 'Pizza & Roti Savory', icon: Pizza },
  { name: 'Sandwich', label: 'Sandwich & Burger', icon: Sandwich },
  { name: 'Coffee', label: 'Kopi & Minuman Hangat', icon: Coffee },
  { name: 'CupSoda', label: 'Minuman Dingin, Es & Boba', icon: CupSoda },
  { name: 'GlassWater', label: 'Jus Buah & Minuman Segar', icon: GlassWater },
  { name: 'IceCream', label: 'Es Krim & Dessert Dingin', icon: IceCream },
  { name: 'Candy', label: 'Permen & Manisan', icon: Candy },
  { name: 'Popcorn', label: 'Camilan & Popcorn', icon: Popcorn },
  { name: 'Soup', label: 'Sup, Puding & Dessert', icon: Soup },
  { name: 'UtensilsCrossed', label: 'Makanan Siap Santap', icon: UtensilsCrossed },
  { name: 'ShoppingBag', label: 'Paket Roti & Oleh-oleh', icon: ShoppingBag },
];

// Gabungan semua ikon untuk rendering CategoryIcon & backward-compatibility
export const AVAILABLE_CATEGORY_ICONS = [
  ...MATERIAL_CATEGORY_ICONS,
  ...PRODUCT_CATEGORY_ICONS.filter(
    (prod) => !MATERIAL_CATEGORY_ICONS.some((mat) => mat.name === prod.name)
  ),
  { name: 'Heart', label: 'Resep Favorit', icon: Heart },
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
