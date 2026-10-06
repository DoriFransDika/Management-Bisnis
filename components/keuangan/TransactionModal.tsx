'use client';

import React, { useState } from 'react';
import { Receipt, X, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const { categories, addTransaction } = useStore();

  const productCategories = categories.filter((c) => c.type === 'product');

  // Form State
  const [category, setCategory] = useState<string>('Penjualan Toko');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');

  // Quick Calculator helper
  const [calcUnitPrice, setCalcUnitPrice] = useState('');
  const [calcPcs, setCalcPcs] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = Number(amount);
    if (!finalAmount || finalAmount <= 0 || !description.trim()) return;

    const finalQuantity = quantity.trim() || (calcPcs ? `+${calcPcs} pcs` : undefined);

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category,
      amount: finalAmount,
      description: description.trim(),
      paymentMethod: 'Tunai',
      quantity: finalQuantity,
    });

    const formattedAmount = formatRupiah(finalAmount);

    setAmount('');
    setQuantity('');
    setCalcUnitPrice('');
    setCalcPcs('');
    setDescription('');
    onClose();

    if (onSuccess) {
      onSuccess(`Transaksi penjualan ${formattedAmount} berhasil dicatat!`);
    }
  };

  const calculatedTotal =
    calcUnitPrice && calcPcs ? Number(calcUnitPrice) * Number(calcPcs) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#EFE4DA] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-[#3E2723]/20 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#EFE4DA]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-blue-100 text-blue-700">
              <Receipt className="w-4 h-4" />
            </span>
            <h3 className="font-black text-[#3E2723] text-base">Catat Transaksi Penjualan</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#6D4C41] flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Catatan Aliran Data */}
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <span className="text-base shrink-0">💡</span>
          <span>
            <strong>Informasi Kas:</strong> Data ini otomatis masuk sebagai <strong>uang pemasukan (omset)</strong> ke buku kas toko.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Kategori Penjualan */}
          <div>
            <label className="block text-xs font-black text-[#3E2723] mb-1">
              Kategori Produk Penjualan
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-blue-500 rounded-2xl px-3 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none"
            >
              <option value="Penjualan Toko">Penjualan Toko (Umum)</option>
              {productCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              <option value="Pesanan Khusus / Katering">Pesanan Khusus / Katering</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-black text-[#3E2723] mb-1">
              Keterangan Transaksi <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pesanan 30 roti abon, penjualan kasir sore"
              className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-blue-500 rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none placeholder-[#A1887F]"
            />
          </div>

          {/* Jumlah / Kuantitas Barang (Opsional) */}
          <div>
            <label className="block text-xs font-black text-[#3E2723] mb-1">
              Jumlah / Kuantitas Barang <span className="text-[#8D6E63] font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Contoh: +40 pcs, 2 kg, 10 box"
              className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-blue-500 rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none placeholder-[#A1887F]"
            />
          </div>

          {/* Total Penjualan & Kalkulator Cepat */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-black text-[#3E2723] mb-1">
                Total Nominal Penjualan (Rp) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 150000"
                className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-blue-500 rounded-2xl px-4 py-2.5 text-sm text-[#3E2723] font-black focus:outline-none"
              />

              {/* Live Standard Rupiah Preview */}
              {amount && Number(amount) > 0 ? (
                <div className="mt-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 flex items-center justify-between">
                  <span className="text-[11px] text-blue-600 font-medium">Nominal Standar:</span>
                  <span className="font-black text-sm text-blue-700">{formatRupiah(Number(amount))}</span>
                </div>
              ) : null}
            </div>

            {/* Bantuan Hitung Cepat (Harga Satuan × Pcs) */}
            <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EFE4DA] space-y-1.5">
              <span className="text-[10px] font-bold text-[#8D6E63] uppercase tracking-wide block">
                Bantuan Hitung (Opsional: Harga × Pcs):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[#8D6E63] font-bold block">Harga Satuan (Rp)</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={calcUnitPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCalcUnitPrice(val);
                      if (val && calcPcs) {
                        const tot = Number(val) * Number(calcPcs);
                        if (tot > 0) setAmount(String(tot));
                      }
                    }}
                    placeholder="5000"
                    className="w-full bg-white border border-[#EFE4DA] focus:border-blue-400 rounded-xl px-2.5 py-1.5 text-xs text-[#3E2723] font-bold focus:outline-none mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#8D6E63] font-bold block">Jumlah (Pcs)</span>
                  <input
                    type="number"
                    min="0"
                    value={calcPcs}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCalcPcs(val);
                      if (val && calcUnitPrice) {
                        const tot = Number(calcUnitPrice) * Number(val);
                        if (tot > 0) setAmount(String(tot));
                      }
                    }}
                    placeholder="20"
                    className="w-full bg-white border border-[#EFE4DA] focus:border-blue-400 rounded-xl px-2.5 py-1.5 text-xs text-[#3E2723] font-bold focus:outline-none mt-0.5"
                  />
                </div>
              </div>
              {calculatedTotal > 0 && (
                <p className="text-[11px] text-blue-700 font-bold mt-1 text-right flex items-center justify-end gap-1">
                  <span>💡 Terhitung otomatis:</span>
                  <span className="font-black">{formatRupiah(calculatedTotal)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#EFE4DA] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-[#EFE4DA] text-xs font-black text-[#8D6E63] hover:bg-stone-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
