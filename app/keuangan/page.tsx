'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Receipt,
  X,
  Search,
  Trash2,
  Share2,
  Check,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';
import { QuickBakeModal } from '@/components/dashboard/QuickBakeModal';
import { formatRupiah } from '@/lib/utils';
import { Transaction } from '@/types';

export default function FinancePage() {
  const { transactions, summary, addTransaction, deleteTransaction } = useStore();

  const [isBakeOpen, setIsBakeOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'Tunai' | 'QRIS / Transfer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<Transaction['category']>('Penjualan Toko');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'QRIS / Transfer'>('QRIS / Transfer');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesPayment = paymentFilter === 'all' || t.paymentMethod === paymentFilter;
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesPayment && matchesSearch;
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !description.trim()) return;

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type,
      category,
      amount: Number(amount),
      description: description.trim(),
      paymentMethod,
    });

    setAmount('');
    setDescription('');
    setShowAddModal(false);
    showToast(`Transaksi ${formatRupiah(Number(amount))} berhasil dicatat.`);
  };

  const handleDeleteTrx = (id: string, desc: string) => {
    if (confirm(`Hapus catatan transaksi: "${desc}"?`)) {
      deleteTransaction(id);
      showToast('Transaksi berhasil dihapus.');
    }
  };

  const handleCopySummary = () => {
    const text = `*Laporan Keuangan Dapoer Mamak*\n` +
      `📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}\n` +
      `📈 Pemasukan: ${formatRupiah(summary.totalIncome)}\n` +
      `📉 Pengeluaran: ${formatRupiah(summary.totalExpense)}\n` +
      `💰 Laba Bersih: ${formatRupiah(summary.netProfit)}\n` +
      `🥐 Total Stok Etalase: ${summary.readyProductsCount} pcs\n` +
      `Dibuat otomatis oleh Sistem Dapoer Mamak.`;

    navigator.clipboard.writeText(text);
    showToast('Ringkasan keuangan disalin ke clipboard!');
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
          {/* Top Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#EFE4DA] shadow-lg shadow-[#3E2723]/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-[#FFF3E0] text-[#3E2723] border border-[#FFE0B2]">
                  <Wallet className="w-5 h-5 text-[#FFB300]" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#3E2723] tracking-tight">
                  Buku Kas & Keuangan Toko
                </h2>
              </div>
              <p className="text-xs text-[#8D6E63] mt-1 font-medium">
                Pencatatan mutasi kas masuk omset dan kas keluar belanja dapur real-time.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-4 py-2.5 rounded-2xl bg-white/80 hover:bg-[#FFF3E0] border border-[#EFE4DA] text-[#3E2723] text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                title="Salin ringkasan ke WA"
              >
                <Share2 className="w-4 h-4 text-[#E65100]" />
                <span>Salin Laporan</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#FFB300]/30 hover:brightness-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Catat Kas Baru</span>
              </button>
            </div>
          </div>

          {/* Mini Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#C8E6C9] shadow-sm">
              <div className="flex items-center justify-between text-xs text-[#8D6E63] mb-2">
                <span className="font-bold">Total Pemasukan</span>
                <span className="p-1.5 rounded-xl bg-[#E8F5E9] text-[#2E7D32]">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </span>
              </div>
              <p className="text-2xl font-black text-[#2E7D32]">{formatRupiah(summary.totalIncome)}</p>
            </div>

            <div className="p-6 rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#F8BBD0] shadow-sm">
              <div className="flex items-center justify-between text-xs text-[#8D6E63] mb-2">
                <span className="font-bold">Total Pengeluaran</span>
                <span className="p-1.5 rounded-xl bg-[#FCE4EC] text-[#C2185B]">
                  <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                </span>
              </div>
              <p className="text-2xl font-black text-[#C2185B]">{formatRupiah(summary.totalExpense)}</p>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-white/95 to-[#FFF8E1]/90 backdrop-blur-md border-2 border-[#FFE082] shadow-sm">
              <div className="flex items-center justify-between text-xs text-[#8D6E63] mb-2">
                <span className="font-bold">Laba Bersih Tersimpan</span>
                <span className="p-1.5 rounded-xl bg-[#FFECB3] text-[#E65100]">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-black text-[#E65100]">{formatRupiah(summary.netProfit)}</p>
            </div>
          </div>

          {/* Transactions Table & Filters */}
          <div className="p-6 md:p-7 rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#EFE4DA] shadow-lg shadow-[#3E2723]/5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#EFE4DA]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#FFB300]" />
                <h3 className="font-black text-base text-[#3E2723]">
                  Mutasi Transaksi ({filteredTransactions.length})
                </h3>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filter */}
                <div className="flex items-center p-1 bg-white/80 rounded-2xl border border-[#EFE4DA] text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-xl font-black transition-all ${
                      filterType === 'all' ? 'bg-[#3E2723] text-white shadow-xs' : 'text-[#6D4C41] hover:text-[#3E2723]'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('income')}
                    className={`px-3 py-1.5 rounded-xl font-black transition-all ${
                      filterType === 'income' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'text-[#6D4C41] hover:text-[#3E2723]'
                    }`}
                  >
                    Masuk (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('expense')}
                    className={`px-3 py-1.5 rounded-xl font-black transition-all ${
                      filterType === 'expense' ? 'bg-[#FCE4EC] text-[#C2185B]' : 'text-[#6D4C41] hover:text-[#3E2723]'
                    }`}
                  >
                    Keluar (-)
                  </button>
                </div>

                {/* Payment Method Filter */}
                <div className="flex items-center p-1 bg-white/80 rounded-2xl border border-[#EFE4DA] text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('all')}
                    className={`px-2.5 py-1.5 rounded-xl font-black transition-all ${
                      paymentFilter === 'all' ? 'bg-[#FFB300] text-[#3E2723]' : 'text-[#8D6E63] hover:text-[#3E2723]'
                    }`}
                  >
                    Semua Metode
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('Tunai')}
                    className={`px-2.5 py-1.5 rounded-xl font-black transition-all ${
                      paymentFilter === 'Tunai' ? 'bg-[#FFB300] text-[#3E2723]' : 'text-[#8D6E63] hover:text-[#3E2723]'
                    }`}
                  >
                    Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('QRIS / Transfer')}
                    className={`px-2.5 py-1.5 rounded-xl font-black transition-all ${
                      paymentFilter === 'QRIS / Transfer' ? 'bg-[#FFB300] text-[#3E2723]' : 'text-[#8D6E63] hover:text-[#3E2723]'
                    }`}
                  >
                    QRIS
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-[#A1887F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari transaksi..."
                    className="w-full bg-white/90 border border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl pl-9 pr-8 py-1.5 text-xs text-[#3E2723] font-bold focus:outline-none placeholder-[#A1887F]"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D6E63]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2.5">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  Tidak ada catatan mutasi transaksi yang cocok dengan filter.
                </div>
              ) : (
                filteredTransactions.map((trx) => (
                  <div
                    key={trx.id}
                    className="p-4 rounded-2xl bg-white/80 border border-[#EFE4DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-[#FFB300] transition-all group"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          trx.type === 'income'
                            ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]'
                            : 'bg-[#FCE4EC] text-[#C2185B] border border-[#F8BBD0]'
                        }`}
                      >
                        {trx.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-sm text-[#3E2723]">{trx.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8D6E63] mt-1">
                          <span>{trx.date}</span>
                          <span>•</span>
                          <span className="text-[#3E2723] font-bold">{trx.category}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-full bg-white text-[#3E2723] border border-[#EFE4DA] font-bold">
                            {trx.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#EFE4DA]">
                      <div className="text-left sm:text-right">
                        <p
                          className={`text-base font-black ${
                            trx.type === 'income' ? 'text-[#2E7D32]' : 'text-[#C2185B]'
                          }`}
                        >
                          {trx.type === 'income' ? '+' : '-'} {formatRupiah(trx.amount)}
                        </p>
                        <p className="text-[10px] text-[#8D6E63] font-bold">Tercatat di sistem</p>
                      </div>

                      {/* Delete Action */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTrx(trx.id, trx.description)}
                        className="p-2 rounded-xl text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
      <QuickBakeModal isOpen={isBakeOpen} onClose={() => setIsBakeOpen(false)} />

      {/* Manual Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-[#EFE4DA] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-[#3E2723]/20 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE4DA]">
              <h3 className="font-black text-[#3E2723] text-base">Catat Transaksi Manual</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#6D4C41] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory('Penjualan Toko');
                  }}
                  className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                    type === 'income'
                      ? 'bg-[#E8F5E9] border-[#2E7D32] text-[#2E7D32]'
                      : 'bg-white border-[#EFE4DA] text-[#8D6E63]'
                  }`}
                >
                  Pemasukan (+)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    setCategory('Belanja Bahan Baku');
                  }}
                  className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                    type === 'expense'
                      ? 'bg-[#FCE4EC] border-[#C2185B] text-[#C2185B]'
                      : 'bg-white border-[#EFE4DA] text-[#8D6E63]'
                  }`}
                >
                  Pengeluaran (-)
                </button>
              </div>

              <div>
                <label className="block text-xs font-black text-[#3E2723] mb-1">
                  Nominal Transaksi (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Contoh: 150000"
                  className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#3E2723] mb-1">Keterangan</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Beli telur 5 kg, pesanan arisan 30 roti"
                  className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black text-[#3E2723] mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Transaction['category'])}
                    className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                  >
                    {type === 'income' ? (
                      <>
                        <option value="Penjualan Toko">Penjualan Toko</option>
                        <option value="Pesanan Khusus / Katering">Pesanan Khusus</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    ) : (
                      <>
                        <option value="Belanja Bahan Baku">Belanja Bahan</option>
                        <option value="Operasional Dapur">Operasional (Gas/Listrik)</option>
                        <option value="Kemasan & Packaging">Kemasan / Box</option>
                        <option value="Gaji Pegawai">Gaji Pegawai</option>
                        <option value="Lainnya">Lainnya</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#3E2723] mb-1">Metode Bayar</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'Tunai' | 'QRIS / Transfer')}
                    className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                  >
                    <option value="Tunai">Tunai Kas</option>
                    <option value="QRIS / Transfer">QRIS / Transfer</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFE4DA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-2xl border border-[#EFE4DA] text-xs font-black text-[#8D6E63]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-xs font-black shadow-md shadow-[#FFB300]/30 hover:brightness-105 active:scale-95 transition-all"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
