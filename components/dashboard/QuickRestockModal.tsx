'use client';

import React, { useState } from 'react';
import { Boxes, X, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';

interface QuickRestockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickRestockModal({ isOpen, onClose }: QuickRestockModalProps) {
  const { rawMaterials, addRawMaterialStock } = useStore();

  const [selectedMatId, setSelectedMatId] = useState(rawMaterials[0]?.id || '');
  const [amount, setAmount] = useState(5);
  const [cost, setCost] = useState(75000);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentMat = rawMaterials.find((m) => m.id === selectedMatId) || rawMaterials[0];

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMat || amount <= 0) return;

    addRawMaterialStock(currentMat.id, Number(amount), Number(cost));
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#F0E6DE] rounded-3xl w-full max-w-md overflow-hidden shadow-[0_20px_60px_rgba(74,59,50,0.18)] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0E6DE] flex items-center justify-between bg-gradient-to-r from-[#FFFDF9] to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-[#E07A5F] font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-[#4A3B32] text-base">Belanja Bahan Dapur</h3>
              <p className="text-xs text-[#8C7A6B]">Tambah stok bahan & catat pengeluaran</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF0E6] hover:bg-rose-100 text-[#7D6B5D] hover:text-[#D9777F] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleRestock} className="p-6 space-y-4 bg-[#FDFBF7]">
          {submitted && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Stok bahan berhasil ditambah & pengeluaran tercatat!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#7D6B5D] mb-1.5">
              Pilih Bahan Baku yang Dibeli
            </label>
            <select
              value={selectedMatId}
              onChange={(e) => setSelectedMatId(e.target.value)}
              className="w-full bg-white border border-[#F0E6DE] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#4A3B32] focus:outline-none focus:border-[#D9777F]"
            >
              {rawMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Tersisa: {m.stock} {m.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#7D6B5D] mb-1.5">
                Jumlah Beli ({currentMat?.unit})
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-white border border-[#F0E6DE] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#4A3B32] focus:outline-none focus:border-[#D9777F]"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-[#7D6B5D] mb-1.5">
                Total Biaya (Rp)
              </label>
              <input
                type="number"
                min="0"
                required
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full bg-white border border-[#F0E6DE] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#4A3B32] focus:outline-none focus:border-[#D9777F]"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6DE] text-xs space-y-1">
            <p className="text-[#7D6B5D]">
              Stok baru nantinya:{' '}
              <strong className="text-[#D9777F]">
                {(currentMat?.stock || 0) + Number(amount)} {currentMat?.unit}
              </strong>
            </p>
            <p className="text-[#8C7A6B]">
              Estimasi modal satuan:{' '}
              <strong className="text-[#4A3B32]">
                {amount > 0 ? formatRupiah(Math.round(cost / amount)) : '0'} / {currentMat?.unit}
              </strong>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#8C7A6B] hover:text-[#4A3B32]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-[#E07A5F] via-[#D9777F] to-[#E88D96] text-white shadow-md shadow-[#D9777F]/20 hover:brightness-105 active:scale-95"
            >
              Simpan Pembelian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
