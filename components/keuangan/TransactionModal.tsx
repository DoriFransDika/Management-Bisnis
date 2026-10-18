'use client';

import React, { useState } from 'react';
import { Receipt, X, Check, ShoppingBag, ArrowUpRight, ArrowDownRight, CreditCard, Banknote } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const { categories, finishedProducts, recordProductSale, addTransaction } = useStore();

  const productCategories = categories.filter((c) => c.type === 'product');

  // Transaction Type: 'income' (Pemasukan) vs 'expense' (Pengeluaran)
  const [trxType, setTrxType] = useState<'income' | 'expense'>('income');

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [category, setCategory] = useState<string>('Penjualan Toko');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS / Transfer'>('Tunai');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Calculator helper
  const [calcUnitPrice, setCalcUnitPrice] = useState('');
  const [calcPcs, setCalcPcs] = useState('');

  if (!isOpen) return null;

  const selectedProduct = finishedProducts.find((p) => p.id === selectedProductId);
  const readyProducts = finishedProducts.filter((p) => p.stock > 0);
  const parsedQty = Number(calcPcs) || parseInt(quantity) || 0;
  const exceedsStock = Boolean(selectedProduct && parsedQty > selectedProduct.stock);

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    setErrorMsg(null);
    if (!prodId) {
      setCategory('Penjualan Toko');
      return;
    }

    const prod = finishedProducts.find((p) => p.id === prodId);
    if (prod) {
      setCategory(prod.category || 'Penjualan Toko');
      setDescription(`Penjualan ${prod.name}`);
      if (prod.sellingPrice > 0) {
        setCalcUnitPrice(String(prod.sellingPrice));
      }
    }
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setTrxType(newType);
    setSelectedProductId('');
    setErrorMsg(null);
    if (newType === 'income') {
      setCategory('Penjualan Toko');
      setDescription('');
    } else {
      setCategory('Operasional & Gas');
      setDescription('');
    }
  };

  const resetForm = () => {
    setTrxType('income');
    setSelectedProductId('');
    setCategory('Penjualan Toko');
    setAmount('');
    setQuantity('');
    setCalcUnitPrice('');
    setCalcPcs('');
    setDescription('');
    setPaymentMethod('Tunai');
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMsg('Nominal transaksi harus berupa angka lebih dari Rp 0.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Keterangan transaksi wajib diisi.');
      return;
    }

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const finalQuantity = quantity.trim() || (calcPcs ? `${calcPcs} ${selectedProduct?.unit || 'pcs'}` : undefined);

    if (trxType === 'income' && selectedProductId) {
      // Penjualan produk ready yang memotong stok otomatis
      if (parsedQty <= 0) {
        setErrorMsg(`Isi jumlah ${selectedProduct?.name} yang terjual.`);
        return;
      }

      const res = recordProductSale({
        productId: selectedProductId,
        qty: parsedQty,
        amount: parsedAmount,
        category,
        description: description.trim(),
        paymentMethod,
        quantityLabel: finalQuantity,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      resetForm();
      onClose();
      onSuccess?.(res.message);
    } else {
      // Transaksi umum (Pemasukan tanpa produk atau Pengeluaran operasional)
      addTransaction({
        date: today,
        type: trxType,
        category,
        amount: parsedAmount,
        description: description.trim(),
        paymentMethod,
        quantity: finalQuantity,
      });

      const successText = trxType === 'income'
        ? `Pemasukan kas ${formatRupiah(parsedAmount)} berhasil dicatat!`
        : `Pengeluaran kas ${formatRupiah(parsedAmount)} berhasil dicatat!`;

      resetForm();
      onClose();
      onSuccess?.(successText);
    }
  };

  const calculatedTotal =
    calcUnitPrice && calcPcs ? Number(calcUnitPrice) * Number(calcPcs) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#EFE4DA] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE4DA]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#FFF3E0] text-[#FFB300] border border-[#FFE0B2]">
              <Receipt className="w-5 h-5 text-[#3E2723]" />
            </span>
            <div>
              <h3 className="font-black text-[#3E2723] text-base">Catat Transaksi Keuangan</h3>
              <p className="text-[11px] text-[#8D6E63] font-medium">Buku Kas & Riwayat Mutasi Toko</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#6D4C41] flex items-center justify-center hover:bg-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Pemasukan vs Pengeluaran */}
        <div className="grid grid-cols-2 p-1 bg-[#FAF7F2] rounded-2xl border border-[#EFE4DA]">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              trxType === 'income'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'text-[#6D4C41] hover:text-[#2E7D32]'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            <span>Pemasukan (+)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              trxType === 'expense'
                ? 'bg-[#C2185B] text-white shadow-sm'
                : 'text-[#6D4C41] hover:text-[#C2185B]'
            }`}
          >
            <ArrowDownRight className="w-4 h-4 stroke-[3]" />
            <span>Pengeluaran (-)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Bagian Pemasukan: Opsi Pilih Produk Ready */}
          {trxType === 'income' && finishedProducts.length > 0 && (
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-2">
              <label className="block text-xs font-black text-[#2E7D32] flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>Pilih Produk Ready (Stok Terpotong Otomatis)</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-white border border-emerald-300 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
              >
                <option value="">-- Tanpa Produk (Pemasukan Umum / Katering) --</option>
                {readyProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.category} (Ready: {p.stock} {p.unit})
                  </option>
                ))}
              </select>

              {selectedProduct && (
                <div
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    exceedsStock
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <span>Sisa Stok Tersedia:</span>
                  <span className="font-black">
                    {selectedProduct.stock} {selectedProduct.unit}
                    {parsedQty > 0 && !exceedsStock && (
                      <span className="font-semibold"> → sisa {selectedProduct.stock - parsedQty}</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Kategori Transaksi */}
          <div>
            <label className="block text-xs font-black text-[#3E2723] mb-1">
              Kategori {trxType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </label>
            {trxType === 'income' ? (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={Boolean(selectedProductId)}
                className={`w-full border-2 rounded-2xl px-3 py-2.5 text-xs font-bold focus:outline-none transition-all ${
                  selectedProductId
                    ? 'bg-stone-100 border-[#EFE4DA] text-stone-600 cursor-not-allowed opacity-90'
                    : 'bg-[#FAF7F2] border-[#EFE4DA] focus:border-[#FFB300] text-[#3E2723]'
                }`}
              >
                <option value="Penjualan Toko">Penjualan Toko (Umum)</option>
                {productCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                <option value="Pesanan Khusus / Katering">Pesanan Khusus / Katering</option>
                <option value="Pemasukan Lainnya">Pemasukan Lainnya</option>
              </select>
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none"
              >
                <option value="Operasional & Gas">Operasional & Gas LPG</option>
                <option value="Belanja Bahan Baku">Belanja Bahan Baku Dapur</option>
                <option value="Kemasan & Plastik">Kemasan & Dus Roti</option>
                <option value="Listrik & Air">Listrik & Air Toko</option>
                <option value="Gaji & Upah">Gaji & Upah Karyawan</option>
                <option value="Peralatan & Perawatan">Peralatan & Perawatan Mesin</option>
                <option value="Pengeluaran Lainnya">Pengeluaran Lainnya</option>
              </select>
            )}
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
              placeholder={
                trxType === 'income'
                  ? 'Contoh: Penjualan Roti Manis kasir pagi, pesanan katering RT'
                  : 'Contoh: Beli 3 tabung gas LPG 3kg, beli plastik OPP'
              }
              className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none placeholder-[#A1887F]"
            />
          </div>

          {/* Jumlah / Kuantitas Barang */}
          <div>
            <label className="block text-xs font-black text-[#3E2723] mb-1">
              Jumlah / Kuantitas (Opsional)
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                setQuantity(val);
                const num = parseInt(val);
                if (!isNaN(num)) {
                  setCalcPcs(String(num));
                  if (calcUnitPrice) {
                    setAmount(String(num * Number(calcUnitPrice)));
                  }
                }
              }}
              placeholder={selectedProduct ? `Contoh: 10 ${selectedProduct.unit}` : 'Contoh: 5 tabung / 20 box'}
              className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none placeholder-[#A1887F]"
            />
          </div>

          {/* Kalkulator Cepat (Khusus Produk Terpilih) */}
          {selectedProduct && (
            <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#EFE4DA] space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-[#3E2723]">
                <span>Kalkulator Otomatis</span>
                {calculatedTotal > 0 && (
                  <span className="text-[#2E7D32]">{formatRupiah(calculatedTotal)}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#8D6E63] font-bold mb-0.5">
                    Harga Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    value={calcUnitPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCalcUnitPrice(val);
                      if (val && calcPcs) {
                        setAmount(String(Number(val) * Number(calcPcs)));
                      }
                    }}
                    placeholder="Contoh: 8500"
                    className="w-full bg-white border border-[#EFE4DA] rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#8D6E63] font-bold mb-0.5">
                    Jumlah ({selectedProduct.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={calcPcs}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCalcPcs(val);
                      setQuantity(val ? `${val} ${selectedProduct.unit}` : '');
                      if (val && calcUnitPrice) {
                        setAmount(String(Number(val) * Number(calcUnitPrice)));
                      }
                    }}
                    placeholder="Contoh: 5"
                    className="w-full bg-white border border-[#EFE4DA] rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Nominal Transaksi (Rp) */}
          <div>
            <label className="block text-xs font-black text-[#3E2723] mb-1">
              Total Nominal Transaksi (Rp) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#8D6E63]">
                Rp
              </span>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 150000"
                className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl pl-12 pr-4 py-2.5 text-xs text-[#3E2723] font-black focus:outline-none"
              />
            </div>
            {amount && Number(amount) > 0 && (
              <p className="mt-1 text-xs font-black text-[#E65100]">
                {formatRupiah(Number(amount))}
              </p>
            )}
          </div>

          {/* Metode Pembayaran */}
          <div>
            <label className="block text-xs font-black text-[#3E2723] mb-1">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Tunai')}
                className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'Tunai'
                    ? 'bg-[#3E2723] text-[#FFB300] border-[#3E2723] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#6D4C41] border-[#EFE4DA] hover:bg-[#FFF3E0]'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Tunai / Kas Toko</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS / Transfer')}
                className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  paymentMethod === 'QRIS / Transfer'
                    ? 'bg-[#3E2723] text-[#FFB300] border-[#3E2723] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#6D4C41] border-[#EFE4DA] hover:bg-[#FFF3E0]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>QRIS / Transfer</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EFE4DA]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#8D6E63] hover:text-[#3E2723] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={Boolean(exceedsStock)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all ${
                trxType === 'income'
                  ? 'bg-gradient-to-r from-[#2E7D32] to-[#388E3C] text-white shadow-emerald-700/20 hover:brightness-105 active:scale-95'
                  : 'bg-gradient-to-r from-[#C2185B] to-[#D81B60] text-white shadow-pink-700/20 hover:brightness-105 active:scale-95'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Simpan {trxType === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
