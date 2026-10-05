'use client';

import React, { useState } from 'react';
import { ChefHat, X, Check, AlertTriangle, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';

interface QuickBakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickBakeModal({ isOpen, onClose }: QuickBakeModalProps) {
  const { finishedProducts, rawMaterials, produceProduct } = useStore();

  const [selectedProductId, setSelectedProductId] = useState(finishedProducts[0]?.id || '');
  const [batches, setBatches] = useState(1);
  const [resultMsg, setResultMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const currentProduct = finishedProducts.find((p) => p.id === selectedProductId) || finishedProducts[0];

  const ingredientStatus = currentProduct?.recipe.map((item) => {
    const mat = rawMaterials.find((m) => m.id === item.materialId);
    const needed = Number((item.amount * batches).toFixed(3));
    const currentStock = mat ? mat.stock : 0;
    const isSufficient = currentStock >= needed;

    return {
      materialId: item.materialId,
      name: mat ? mat.name : 'Bahan tidak diketahui',
      needed,
      unit: item.unit,
      currentStock,
      isSufficient,
      shortage: isSufficient ? 0 : Number((needed - currentStock).toFixed(3)),
    };
  }) || [];

  const allIngredientsAvailable = ingredientStatus.every((i) => i.isSufficient);
  const totalProducedItems = currentProduct ? batches * currentProduct.batchYield : 0;
  const totalHPP = currentProduct ? currentProduct.costPrice * totalProducedItems : 0;

  const handleExecute = () => {
    if (!currentProduct) return;
    const res = produceProduct(currentProduct.id, batches);
    setResultMsg({ success: res.success, text: res.message });
    if (res.success) {
      setTimeout(() => {
        setResultMsg(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#F0E6DE] rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_20px_60px_rgba(74,59,50,0.18)] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F0E6DE] flex items-center justify-between bg-gradient-to-r from-[#FFFDF9] to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E07A5F] to-[#D9777F] flex items-center justify-center text-white font-bold shadow-xs">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-[#4A3B32] text-base">Baking & Produksi Roti</h3>
              <p className="text-xs text-[#8C7A6B]">Pemotongan bahan otomatis sesuai takaran resep</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF0E6] hover:bg-rose-100 text-[#7D6B5D] hover:text-[#D9777F] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-[#FDFBF7]">
          {/* Status Message */}
          {resultMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                resultMsg.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {resultMsg.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{resultMsg.text}</span>
            </div>
          )}

          {/* Select Product */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#7D6B5D] mb-2">
              Pilih Resep Roti yang Dipanggang
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {finishedProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedProductId(p.id);
                    setResultMsg(null);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedProductId === p.id
                      ? 'bg-rose-50/80 border-[#D9777F] text-[#4A3B32] shadow-xs'
                      : 'bg-white border-[#F0E6DE] text-[#7D6B5D] hover:border-[#D9777F]/50'
                  }`}
                >
                  <p className="font-black text-xs text-[#4A3B32] truncate">{p.name}</p>
                  <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                    Hasil: <span className="text-[#D9777F] font-bold">{p.batchYield} {p.unit}</span> / batch
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Batches Selector */}
          <div className="bg-white p-4 rounded-2xl border border-[#F0E6DE] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#4A3B32]">Jumlah Batch Adonan</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBatches((b) => Math.max(1, b - 1))}
                  className="w-8 h-8 rounded-xl bg-[#FAF0E6] hover:bg-rose-100 text-[#4A3B32] font-black flex items-center justify-center border border-[#F0E6DE] text-base"
                >
                  -
                </button>
                <span className="w-12 text-center font-black text-[#D9777F] text-lg">
                  {batches}
                </span>
                <button
                  type="button"
                  onClick={() => setBatches((b) => b + 1)}
                  className="w-8 h-8 rounded-xl bg-[#FAF0E6] hover:bg-rose-100 text-[#4A3B32] font-black flex items-center justify-center border border-[#F0E6DE] text-base"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F0E6DE] text-xs">
              <div>
                <p className="text-[11px] text-[#8C7A6B]">Tambahan Roti Siap Jual</p>
                <p className="font-black text-[#D9777F] text-sm">
                  +{totalProducedItems} {currentProduct?.unit}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8C7A6B]">Total Modal HPP</p>
                <p className="font-black text-[#4A3B32] text-sm">
                  {formatRupiah(totalHPP)}
                </p>
              </div>
            </div>
          </div>

          {/* Ingredient Check Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#7D6B5D]">
                Kebutuhan Bahan Dapur ({ingredientStatus.length} item)
              </p>
              <span className="text-[11px] font-bold text-[#8C7A6B]">
                {allIngredientsAvailable ? '✅ Semua Stok Cukup' : '⚠️ Ada Bahan Kurang'}
              </span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {ingredientStatus.map((ing) => (
                <div
                  key={ing.materialId}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    ing.isSufficient
                      ? 'bg-white border-[#F0E6DE] text-[#4A3B32]'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  <div>
                    <p className="font-bold text-[#4A3B32]">{ing.name}</p>
                    <p className="text-[11px] text-[#8C7A6B]">
                      Tersisa: {ing.currentStock} {ing.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#D9777F]">
                      -{ing.needed} {ing.unit}
                    </span>
                    {!ing.isSufficient && (
                      <p className="text-[10px] text-rose-600 font-extrabold mt-0.5">
                        Kurang {ing.shortage} {ing.unit}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#F0E6DE] bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#8C7A6B] hover:text-[#4A3B32] hover:bg-[#FAF0E6]"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!allIngredientsAvailable}
            onClick={handleExecute}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-md ${
              allIngredientsAvailable
                ? 'bg-gradient-to-r from-[#E07A5F] via-[#D9777F] to-[#E88D96] text-white shadow-[#D9777F]/25 hover:brightness-105 active:scale-95'
                : 'bg-stone-200 text-[#A8988B] cursor-not-allowed border border-stone-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Eksekusi Baking ({totalProducedItems} {currentProduct?.unit})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
