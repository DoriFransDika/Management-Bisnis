'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Percent,
  Sparkles,
  TrendingUp,
  DollarSign,
  ChefHat,
  RefreshCw,
  Heart,
  Plus,
  Check,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';
import { QuickBakeModal } from '@/components/dashboard/QuickBakeModal';
import { formatRupiah } from '@/lib/utils';

interface PresetRecipe {
  name: string;
  yieldPcs: number;
  ingredientCost: number;
  packagingCost: number;
  utilityCost: number;
  laborCost: number;
  targetMarginPercent: number;
}

const PRESETS: PresetRecipe[] = [
  {
    name: 'Roti Manis Cokelat Lumer',
    yieldPcs: 25,
    ingredientCost: 75000,
    packagingCost: 7500,
    utilityCost: 6000,
    laborCost: 10000,
    targetMarginPercent: 55,
  },
  {
    name: 'Roti Sisir Mentega Spesial',
    yieldPcs: 20,
    ingredientCost: 70000,
    packagingCost: 8000,
    utilityCost: 6000,
    laborCost: 10000,
    targetMarginPercent: 55,
  },
  {
    name: 'Roti Sobek Keju Susu',
    yieldPcs: 8,
    ingredientCost: 78000,
    packagingCost: 12000,
    utilityCost: 6000,
    laborCost: 8000,
    targetMarginPercent: 55,
  },
  {
    name: 'Donat Kampung Salju',
    yieldPcs: 30,
    ingredientCost: 45000,
    packagingCost: 6000,
    utilityCost: 5000,
    laborCost: 8000,
    targetMarginPercent: 60,
  },
];

export default function CalculatorPage() {
  const { addNewProduct, rawMaterials, categories } = useStore();

  const [isBakeOpen, setIsBakeOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [recipeName, setRecipeName] = useState('Roti Manis Cokelat Lumer');
  const [yieldPcs, setYieldPcs] = useState(25);
  const [ingredientCost, setIngredientCost] = useState(75000);
  const [packagingCost, setPackagingCost] = useState(7500);
  const [utilityCost, setUtilityCost] = useState(6000);
  const [laborCost, setLaborCost] = useState(10000);
  const [marginPercent, setMarginPercent] = useState(55);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApplyPreset = (p: PresetRecipe) => {
    setRecipeName(p.name);
    setYieldPcs(p.yieldPcs);
    setIngredientCost(p.ingredientCost);
    setPackagingCost(p.packagingCost);
    setUtilityCost(p.utilityCost);
    setLaborCost(p.laborCost);
    setMarginPercent(p.targetMarginPercent);
    showToast(`Preset "${p.name}" diterapkan!`);
  };

  const totalBatchCost = ingredientCost + packagingCost + utilityCost + laborCost;
  const hppPerPcs = yieldPcs > 0 ? Math.round(totalBatchCost / yieldPcs) : 0;

  const rawSellingPrice = hppPerPcs * (1 + marginPercent / 100);
  const recommendedSellingPrice = Math.ceil(rawSellingPrice / 500) * 500;

  const profitPerPcs = recommendedSellingPrice - hppPerPcs;
  const actualMarginPercent = recommendedSellingPrice > 0 ? Math.round((profitPerPcs / recommendedSellingPrice) * 100) : 0;
  const totalBatchRevenue = recommendedSellingPrice * yieldPcs;
  const totalBatchProfit = totalBatchRevenue - totalBatchCost;

  const handleSaveToCatalog = () => {
    const defaultProductCat = categories.find((c) => c.type === 'product') || categories[0];
    addNewProduct({
      name: recipeName.trim(),
      category: defaultProductCat ? defaultProductCat.name : 'Roti Manis',
      categoryId: defaultProductCat ? defaultProductCat.id : 'cat-2',
      stock: yieldPcs,
      minStock: 5,
      unit: 'pcs',
      sellingPrice: recommendedSellingPrice,
      costPrice: hppPerPcs,
      batchYield: yieldPcs,
      recipe: rawMaterials.slice(0, 3).map((m) => ({
        materialId: m.id,
        amount: 1,
        unit: m.unit,
      })),
    });

    showToast(`"${recipeName}" berhasil disimpan ke daftar produk etalase!`);
  };

  return (
    <div className="min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-fixed bg-no-repeat text-[#3E2723] flex flex-col md:flex-row font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
        <Header onOpenQuickBake={() => setIsBakeOpen(true)} />

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#3E2723] text-white text-xs font-black shadow-xl border border-[#FFB300]"
            >
              <Check className="w-4 h-4 text-[#FFB300]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-2.5 sm:p-4 lg:p-5 space-y-2 sm:space-y-3 max-w-7xl w-full mx-auto">
          {/* Top Banner - Compact */}
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white/92 backdrop-blur-md border border-[#EFE4DA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#FFF3E0] text-[#3E2723] border border-[#FFE0B2]">
                <Calculator className="w-4 h-4 text-[#FFB300]" />
              </span>
              <h2 className="text-xs sm:text-base font-black text-[#3E2723] tracking-tight">
                Kalkulator HPP & Laba Roti
              </h2>
            </div>

            {/* Quick Presets Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <span className="text-[10px] font-black text-[#8D6E63] uppercase shrink-0 hidden md:inline">Resep:</span>
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-black transition-all flex items-center gap-1 border shrink-0 ${
                    recipeName === p.name
                      ? 'bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] border-[#FFB300] shadow-xs'
                      : 'bg-white/90 backdrop-blur-sm text-[#6D4C41] border-[#EFE4DA] hover:border-[#FFB300]'
                  }`}
                >
                  <ChefHat className="w-3 h-3" />
                  <span className="truncate max-w-[110px] sm:max-w-none">{p.name}</span>
                </button>
              ))}
              <button
                onClick={() => handleApplyPreset(PRESETS[0])}
                className="p-1 rounded-lg bg-white/80 hover:bg-[#FFF3E0] text-[#8D6E63] hover:text-[#3E2723] border border-[#EFE4DA] shrink-0"
                title="Reset Resep"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Form and Calculations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3">
            {/* Input Card (7 Columns) */}
            <div className="lg:col-span-7 p-2.5 sm:p-4 rounded-2xl bg-white/92 backdrop-blur-md border border-[#EFE4DA] shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#EFE4DA]">
                <h3 className="font-black text-xs text-[#3E2723]">
                  Biaya 1 Batch Produksi
                </h3>
                <span className="text-[10px] font-black text-[#8D6E63]">
                  Total: <strong className="text-[#3E2723]">{formatRupiah(totalBatchCost)}</strong>
                </span>
              </div>

              {/* Recipe Name & Yield side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-xs font-black text-[#3E2723] mb-1">Nama Resep Roti</label>
                  <input
                    type="text"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EFE4DA] focus:border-[#FFB300] rounded-xl px-3 py-1.5 text-xs text-[#3E2723] font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-black text-[#3E2723] mb-1 truncate">
                    Hasil Jadi (Pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={yieldPcs}
                    onChange={(e) => setYieldPcs(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EFE4DA] focus:border-[#FFB300] rounded-xl px-3 py-1.5 text-xs text-[#3E2723] font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Cost Inputs 4-Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-black text-[#6D4C41] mb-1 truncate">
                    Bahan Baku (Rp)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={ingredientCost}
                    onChange={(e) => setIngredientCost(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EFE4DA] focus:border-[#FFB300] rounded-xl px-2.5 py-1.5 text-xs text-[#3E2723] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6D4C41] mb-1 truncate">
                    Kemasan (Rp)
                  </label>
                  <input
                    type="number"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EFE4DA] focus:border-[#FFB300] rounded-xl px-2.5 py-1.5 text-xs text-[#3E2723] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6D4C41] mb-1 truncate">
                    Gas / Listrik (Rp)
                  </label>
                  <input
                    type="number"
                    value={utilityCost}
                    onChange={(e) => setUtilityCost(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EFE4DA] focus:border-[#FFB300] rounded-xl px-2.5 py-1.5 text-xs text-[#3E2723] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#6D4C41] mb-1 truncate">
                    Tenaga / Upah (Rp)
                  </label>
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EFE4DA] focus:border-[#FFB300] rounded-xl px-2.5 py-1.5 text-xs text-[#3E2723] font-bold"
                  />
                </div>
              </div>

              {/* Margin Slider */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-black uppercase text-[#6D4C41]">
                    Target Margin Keuntungan
                  </label>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-50 text-[#D81B60] border border-rose-200">
                    {marginPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="150"
                  step="5"
                  value={marginPercent}
                  onChange={(e) => setMarginPercent(Number(e.target.value))}
                  className="w-full accent-[#FFB300] cursor-pointer h-2 bg-[#EFE4DA] rounded-lg"
                />
                <div className="flex justify-between text-[9px] text-[#8D6E63] font-bold mt-0.5">
                  <span>20% Grosir</span>
                  <span>55% Standar Retail</span>
                  <span>100%+ Spesial</span>
                </div>
              </div>
            </div>

            {/* Results Card (5 Columns) */}
            <div className="lg:col-span-5 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/95 via-[#FFF8E1]/90 to-[#FFF3E0]/90 backdrop-blur-md border border-[#FFE082] shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#FFECB3] text-[#3E2723] border border-[#FFD54F]">
                    Hasil Kalkulasi HPP & Jual
                  </span>
                  <span className="text-[10px] font-bold text-[#8D6E63]">
                    {yieldPcs} pcs / batch
                  </span>
                </div>

                {/* HPP & Rekomendasi Harga Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-white/80 border border-[#EFE4DA]">
                    <p className="text-[10px] text-[#8D6E63] font-bold">HPP Modal / Pcs</p>
                    <p className="text-base sm:text-lg font-black text-[#3E2723] mt-0.5 truncate">
                      {formatRupiah(hppPerPcs)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#FFB300] shadow-xs">
                    <p className="text-[10px] text-[#E65100] font-black">Rekomendasi Jual</p>
                    <p className="text-base sm:text-lg font-black text-[#E65100] mt-0.5 truncate">
                      {formatRupiah(recommendedSellingPrice)}
                    </p>
                  </div>
                </div>

                {/* Profit Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-white/70 border border-[#EFE4DA]">
                    <p className="text-[9px] text-[#8D6E63] font-bold truncate">Laba / Pcs ({actualMarginPercent}%)</p>
                    <p className="text-xs sm:text-sm font-black text-[#2E7D32] truncate">
                      +{formatRupiah(profitPerPcs)}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70 border border-[#EFE4DA]">
                    <p className="text-[9px] text-[#8D6E63] font-bold truncate">Laba 1 Batch</p>
                    <p className="text-xs sm:text-sm font-black text-[#2E7D32] truncate">
                      +{formatRupiah(totalBatchProfit)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSaveToCatalog}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-xs font-black shadow-xs hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Simpan ke Etalase Produk Toko</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
      <QuickBakeModal isOpen={isBakeOpen} onClose={() => setIsBakeOpen(false)} />
    </div>
  );
}
