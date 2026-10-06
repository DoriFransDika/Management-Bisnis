'use client';

import React, { useState } from 'react';
import { ShoppingBag, X, Check, CreditCard, Banknote, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSaleModal({ isOpen, onClose }: QuickSaleModalProps) {
  const { finishedProducts, recordSale } = useStore();

  const [selectedProductId, setSelectedProductId] = useState(finishedProducts[0]?.id || '');
  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS / Transfer'>('QRIS / Transfer');
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const currentProduct = finishedProducts.find((p) => p.id === selectedProductId) || finishedProducts[0];
  const totalPrice = currentProduct ? currentProduct.sellingPrice * qty : 0;
  const isStockAvailable = currentProduct ? currentProduct.stock >= qty : false;

  const handleSale = () => {
    if (!currentProduct) return;
    const res = recordSale(currentProduct.id, qty, paymentMethod);
    setFeedback({ success: res.success, text: res.message });
    if (res.success) {
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#F0E6DE] rounded-3xl w-full max-w-md overflow-hidden shadow-[0_20px_60px_rgba(74,59,50,0.18)] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0E6DE] flex items-center justify-between bg-gradient-to-r from-[#FFFDF9] to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-[#4A3B32] text-base">Transaksi Penjualan</h3>
              <p className="text-xs text-[#8C7A6B]">Pencatatan kasir toko & pesanan roti</p>
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
        <div className="p-6 space-y-4 bg-[#FDFBF7]">
          {feedback && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
                feedback.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {feedback.success ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{feedback.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#7D6B5D] mb-1.5">
              Pilih Roti Terjual
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setFeedback(null);
              }}
              className="w-full bg-white border border-[#F0E6DE] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#4A3B32] focus:outline-none focus:border-[#D9777F]"
            >
              {finishedProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatRupiah(p.sellingPrice)} (Sisa: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Qty Selector */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#F0E6DE]">
            <div>
              <p className="text-xs font-bold text-[#4A3B32]">Jumlah Beli</p>
              <p className="text-[11px] text-[#8C7A6B]">
                Stok etalase: <strong className="text-[#D9777F]">{currentProduct?.stock} {currentProduct?.unit}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-[#4A3B32] font-black flex items-center justify-center border border-[#F0E6DE]"
              >
                -
              </button>
              <span className="w-10 text-center font-black text-[#4A3B32] text-base">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-[#FAF0E6] text-[#4A3B32] font-black flex items-center justify-center border border-[#F0E6DE]"
              >
                +
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#7D6B5D] mb-1.5">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS / Transfer')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  paymentMethod === 'QRIS / Transfer'
                    ? 'bg-rose-50 border-[#D9777F] text-[#D9777F]'
                    : 'bg-white border-[#F0E6DE] text-[#8C7A6B]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>QRIS / Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Tunai')}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  paymentMethod === 'Tunai'
                    ? 'bg-rose-50 border-[#D9777F] text-[#D9777F]'
                    : 'bg-white border-[#F0E6DE] text-[#8C7A6B]'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Uang Tunai</span>
              </button>
            </div>
          </div>

          {/* Total Price Display */}
          <div className="p-4 rounded-2xl bg-white border border-[#F0E6DE] flex items-center justify-between">
            <span className="text-xs text-[#8C7A6B]">Total Pembayaran:</span>
            <span className="text-lg font-black text-emerald-700">{formatRupiah(totalPrice)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F0E6DE] flex items-center justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#8C7A6B] hover:text-[#4A3B32]"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!isStockAvailable}
            onClick={handleSale}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
              isStockAvailable
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 hover:brightness-105 active:scale-95'
                : 'bg-stone-200 text-[#A8988B] cursor-not-allowed'
            }`}
          >
            {isStockAvailable ? 'Konfirmasi Penjualan' : 'Stok Roti Tidak Cukup'}
          </button>
        </div>
      </div>
    </div>
  );
}
