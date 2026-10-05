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

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#EFE4DA] shadow-lg shadow-[#3E2723]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-[#FFF3E0] text-[#3E2723] border border-[#FFE0B2]">
                  <Calculator className="w-5 h-5 text-[#FFB300]" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#3E2723] tracking-tight">
                  Kalkulator HPP & Simulasi Laba Toko
                </h2>
              </div>
              <p className="text-xs text-[#8D6E63] mt-1 font-medium">
                Hitung modal akurat per pcs roti, biaya gas & kemasan, serta tentukan harga jual berpenghasilan optimal.
              </p>
            </div>

            <button
              onClick={() => handleApplyPreset(PRESETS[0])}
              className="px-4 py-2.5 rounded-2xl bg-white/80 hover:bg-[#FFF3E0] text-[#3E2723] text-xs font-black flex items-center gap-1.5 self-start sm:self-auto border border-[#EFE4DA] shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#FFB300]" />
              <span>Reset Standar</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-[#6D4C41]">
              Pilih Resep Baku Toko Roti:
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                    recipeName === p.name
                      ? 'bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] border-[#FFB300] shadow-xs'
                      : 'bg-white/90 backdrop-blur-sm text-[#6D4C41] border-[#EFE4DA] hover:border-[#FFB300]'
                  }`}
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form and Calculations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Card (7 Columns) */}
            <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#EFE4DA] shadow-lg shadow-[#3E2723]/5 space-y-4">
              <h3 className="font-black text-base text-[#3E2723] pb-2 border-b border-[#EFE4DA]">
                Komponen Biaya 1 Batch Adonan
              </h3>

              <div>
                <label className="block text-xs font-black text-[#3E2723] mb-1">Nama Resep Roti</label>
                <input
                  type="text"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#3E2723] mb-1">
                    Hasil Jadi per Batch (Pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={yieldPcs}
                    onChange={(e) => setYieldPcs(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#3E2723] mb-1">
                    Biaya Bahan Baku (Rp)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={ingredientCost}
                    onChange={(e) => setIngredientCost(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-[#6D4C41] mb-1">
                    Plastik/Kemasan (Rp)
                  </label>
                  <input
                    type="number"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EFE4DA] focus:border-[#FFB300] rounded-xl px-3 py-2 text-xs text-[#3E2723] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#6D4C41] mb-1">
                    Gas LPG & Listrik (Rp)
                  </label>
                  <input
                    type="number"
                    value={utilityCost}
                    onChange={(e) => setUtilityCost(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EFE4DA] focus:border-[#FFB300] rounded-xl px-3 py-2 text-xs text-[#3E2723] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#6D4C41] mb-1">
                    Upah / Tenaga (Rp)
                  </label>
                  <input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EFE4DA] focus:border-[#FFB300] rounded-xl px-3 py-2 text-xs text-[#3E2723] font-bold"
                  />
                </div>
              </div>

              {/* Margin Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase text-[#6D4C41]">
                    Target Margin Keuntungan
                  </label>
                  <span className="text-sm font-black text-[#D81B60]">{marginPercent}%</span>
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
                <div className="flex justify-between text-[10px] text-[#8D6E63] mt-1 font-bold">
                  <span>20% (Katering Grosir)</span>
                  <span>50% (Standar Retail)</span>
                  <span>100%+ (Hampers Premium)</span>
                </div>
              </div>
            </div>

            {/* Results Card (5 Columns) */}
            <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-white/95 via-[#FFF8E1]/90 to-[#FFF3E0]/90 backdrop-blur-md border-2 border-[#FFE082] shadow-xl shadow-[#3E2723]/10 space-y-5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-black px-3 py-1 rounded-full bg-[#FFECB3] text-[#3E2723] border border-[#FFD54F]">
                  Hasil Simulasi Bisnis Mamak
                </span>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs text-[#8D6E63] font-bold">HPP (Modal Bersih per Pcs):</p>
                    <p className="text-2xl font-black text-[#3E2723]">
                      {formatRupiah(hppPerPcs)}{' '}
                      <span className="text-xs text-[#8D6E63] font-normal">/ pcs</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-3xl bg-white/90 backdrop-blur-sm border-2 border-[#FFB300]/60 shadow-xs">
                    <p className="text-xs text-[#E65100] font-black">Rekomendasi Harga Jual Pasar:</p>
                    <p className="text-3xl font-black text-[#3E2723] mt-1">
                      {formatRupiah(recommendedSellingPrice)}
                    </p>
                    <p className="text-[11px] text-[#6D4C41] mt-1">
                      Dibulatkan otomatis untuk kemudahan kasir & uang kembalian.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-white/90 border border-[#EFE4DA]">
                      <p className="text-[11px] text-[#8D6E63] font-bold">Laba Bersih / Pcs</p>
                      <p className="text-base font-black text-[#2E7D32]">
                        +{formatRupiah(profitPerPcs)}
                      </p>
                      <p className="text-[10px] text-[#2E7D32] font-black">Margin real {actualMarginPercent}%</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/90 border border-[#EFE4DA]">
                      <p className="text-[11px] text-[#8D6E63] font-bold">Total Laba 1 Batch</p>
                      <p className="text-base font-black text-[#2E7D32]">
                        +{formatRupiah(totalBatchProfit)}
                      </p>
                      <p className="text-[10px] text-[#8D6E63] font-bold">Omset: {formatRupiah(totalBatchRevenue)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Save directly to Products */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveToCatalog}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-xs font-black shadow-md shadow-[#FFB300]/30 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Simpan ke Etalase Produk Toko</span>
                </button>

                <div className="p-3.5 rounded-2xl bg-white/90 border border-[#FFE082] text-xs text-[#3E2723] space-y-1">
                  <p className="font-black text-[#E65100] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFB300]" />
                    Tips Sukses Mamak:
                  </p>
                  <p className="text-[11px] text-[#6D4C41] leading-relaxed">
                    Jika pesanan snack box jumlah besar (&gt;100 pcs), Mamak dapat menurunkan margin ke 30-35% untuk memenangkan pesanan tanpa merugi.
                  </p>
                </div>
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
