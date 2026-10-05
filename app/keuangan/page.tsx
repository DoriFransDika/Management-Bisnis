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
  Filter,
  Calendar,
  Clock,
  Eye,
  Info
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
  const [selectedTrxForDetail, setSelectedTrxForDetail] = useState<Transaction | null>(null);
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

  // Group transactions by date for daily breakdown
  const groupedTransactions = React.useMemo(() => {
    const map = new Map<string, Transaction[]>();

    filteredTransactions.forEach((trx) => {
      const dateKey = trx.date || 'Hari Ini';
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(trx);
    });

    const groups: {
      dateKey: string;
      displayDate: string;
      items: Transaction[];
      totalIn: number;
      totalOut: number;
    }[] = [];

    // Sort dates descending
    const sortedKeys = Array.from(map.keys()).sort((a, b) => (b > a ? 1 : b < a ? -1 : 0));

    sortedKeys.forEach((key) => {
      const items = map.get(key)!;
      let displayDate = key;
      try {
        const d = new Date(key);
        if (!isNaN(d.getTime())) {
          displayDate = d.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        }
      } catch {}

      const totalIn = items
        .filter((i) => i.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);
      const totalOut = items
        .filter((i) => i.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

      groups.push({
        dateKey: key,
        displayDate,
        items,
        totalIn,
        totalOut,
      });
    });

    return groups;
  }, [filteredTransactions]);

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

        <main className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#EFE4DA] shadow-sm sm:shadow-lg shadow-[#3E2723]/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#FFF3E0] text-[#3E2723] border border-[#FFE0B2]">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB300]" />
                </span>
                <h2 className="text-base sm:text-2xl font-black text-[#3E2723] tracking-tight">
                  Buku Kas & Keuangan Toko
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8D6E63] mt-1 font-medium">
                Pencatatan mutasi kas masuk omset dan kas keluar belanja dapur real-time.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopySummary}
                className="justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-[#FFF3E0] border border-[#EFE4DA] text-[#3E2723] text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                title="Salin ringkasan ke WA"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E65100]" />
                <span className="truncate">Salin Laporan</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="justify-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-xs sm:shadow-md shadow-[#FFB300]/30 hover:brightness-105 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span className="truncate">Catat Kas Baru</span>
              </button>
            </div>
          </div>

          {/* Mini Financial Summary: Compact Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#C8E6C9] shadow-xs">
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#8D6E63] mb-1">
                <span className="font-bold truncate">Total Pemasukan</span>
                <span className="p-1 rounded-lg bg-[#E8F5E9] text-[#2E7D32] shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl font-black text-[#2E7D32] truncate">{formatRupiah(summary.totalIncome)}</p>
            </div>

            <div className="p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#F8BBD0] shadow-xs">
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#8D6E63] mb-1">
                <span className="font-bold truncate">Total Pengeluaran</span>
                <span className="p-1 rounded-lg bg-[#FCE4EC] text-[#C2185B] shrink-0">
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl font-black text-[#C2185B] truncate">{formatRupiah(summary.totalExpense)}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/95 to-[#FFF8E1]/90 backdrop-blur-md border-1.5 sm:border-2 border-[#FFE082] shadow-xs flex sm:flex-col justify-between items-center sm:items-stretch">
              <div className="flex items-center gap-1.5 sm:justify-between text-[10px] sm:text-xs text-[#8D6E63] sm:mb-1">
                <span className="p-1 rounded-lg bg-[#FFECB3] text-[#E65100] shrink-0">
                  <Wallet className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold">Laba Bersih</span>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl font-black text-[#E65100] truncate">{formatRupiah(summary.netProfit)}</p>
            </div>
          </div>

          {/* Transactions Table & Filters */}
          <div className="p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#EFE4DA] shadow-xs sm:shadow-md shadow-[#3E2723]/5 space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#EFE4DA]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#FFB300]" />
                <h3 className="font-black text-sm sm:text-base text-[#3E2723]">
                  Tabel Transaksi Harian ({filteredTransactions.length})
                </h3>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filter */}
                <div className="flex items-center p-1 bg-white/80 rounded-2xl border border-[#EFE4DA] text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`px-2.5 py-1 rounded-xl font-black transition-all ${
                      filterType === 'all' ? 'bg-[#3E2723] text-white shadow-xs' : 'text-[#6D4C41] hover:text-[#3E2723]'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('income')}
                    className={`px-2.5 py-1 rounded-xl font-black transition-all ${
                      filterType === 'income' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'text-[#6D4C41] hover:text-[#3E2723]'
                    }`}
                  >
                    Masuk (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('expense')}
                    className={`px-2.5 py-1 rounded-xl font-black transition-all ${
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
                    className={`px-2.5 py-1 rounded-xl font-black transition-all ${
                      paymentFilter === 'all' ? 'bg-[#FFB300] text-[#3E2723]' : 'text-[#8D6E63] hover:text-[#3E2723]'
                    }`}
                  >
                    Metode: Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('Tunai')}
                    className={`px-2 py-1 rounded-xl font-black transition-all ${
                      paymentFilter === 'Tunai' ? 'bg-[#FFB300] text-[#3E2723]' : 'text-[#8D6E63] hover:text-[#3E2723]'
                    }`}
                  >
                    Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentFilter('QRIS / Transfer')}
                    className={`px-2 py-1 rounded-xl font-black transition-all ${
                      paymentFilter === 'QRIS / Transfer' ? 'bg-[#FFB300] text-[#3E2723]' : 'text-[#8D6E63] hover:text-[#3E2723]'
                    }`}
                  >
                    QRIS
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-52">
                  <Search className="w-3.5 h-3.5 text-[#A1887F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari keterangan..."
                    className="w-full bg-white/90 border border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl pl-9 pr-8 py-1 text-xs text-[#3E2723] font-bold focus:outline-none placeholder-[#A1887F]"
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

            {/* Scrollable Container with Daily Grouped Table */}
            <div className="max-h-[520px] overflow-y-auto overflow-x-auto rounded-2xl border border-[#EFE4DA] bg-white/70 divide-y divide-[#EFE4DA] scroll-smooth shadow-inner">
              {groupedTransactions.length === 0 ? (
                <div className="text-center py-12 text-[#8D6E63] text-xs">
                  Tidak ada catatan mutasi transaksi yang cocok dengan filter saat ini.
                </div>
              ) : (
                groupedTransactions.map((group) => (
                  <div key={group.dateKey} className="relative">
                    {/* Sticky Day Header */}
                    <div className="sticky top-0 z-10 px-3.5 sm:px-4 py-2 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EFE4DA] flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#FFB300]" />
                        <span className="text-xs font-black text-[#3E2723]">{group.displayDate}</span>
                        <span className="text-[10px] text-[#8D6E63] font-bold">({group.items.length} transaksi)</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[10px] sm:text-xs font-black">
                        {group.totalIn > 0 && (
                          <span className="text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#C8E6C9]">
                            +{formatRupiah(group.totalIn)}
                          </span>
                        )}
                        {group.totalOut > 0 && (
                          <span className="text-[#C2185B] bg-[#FCE4EC] px-2 py-0.5 rounded-full border border-[#F8BBD0]">
                            -{formatRupiah(group.totalOut)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Minimalist Structured Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#EFE4DA]/80 text-[10px] uppercase font-black text-[#8D6E63] bg-white/50">
                            <th className="py-2 px-3">Keterangan</th>
                            <th className="py-2 px-2 text-center w-20">Jenis</th>
                            <th className="py-2 px-3 text-right">Nominal</th>
                            <th className="py-2 px-2 text-center w-14">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE4DA]/60">
                          {group.items.map((trx) => (
                            <tr
                              key={trx.id}
                              onClick={() => setSelectedTrxForDetail(trx)}
                              className="hover:bg-[#FFFDF9] transition-colors cursor-pointer"
                            >
                              <td className="py-2.5 px-3 min-w-0">
                                <p className="font-black text-[#3E2723] text-xs truncate max-w-[140px] sm:max-w-xs">{trx.description}</p>
                                <p className="text-[10px] text-[#8D6E63] font-medium truncate">
                                  {trx.category} • {trx.paymentMethod}
                                </p>
                              </td>
                              <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                {trx.type === 'income' ? (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32]">
                                    <ArrowUpRight className="w-2.5 h-2.5" />
                                    Masuk
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#FCE4EC] text-[#C2185B]">
                                    <ArrowDownRight className="w-2.5 h-2.5" />
                                    Keluar
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                <span
                                  className={`text-xs sm:text-sm font-black ${
                                    trx.type === 'income' ? 'text-[#2E7D32]' : 'text-[#C2185B]'
                                  }`}
                                >
                                  {trx.type === 'income' ? '+' : '-'} {formatRupiah(trx.amount)}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTrxForDetail(trx);
                                  }}
                                  className="px-2 py-1 rounded-lg text-[10px] font-black bg-white border border-[#EFE4DA] text-[#6D4C41] hover:text-[#3E2723] hover:border-[#FFB300] shadow-2xs"
                                >
                                  Lihat
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
      {/* Detail Transaction Modal */}
      {selectedTrxForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-[#EFE4DA] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE4DA]">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-[#FFF3E0] text-[#3E2723]">
                  <Receipt className="w-4 h-4 text-[#FFB300]" />
                </span>
                <h3 className="font-black text-[#3E2723] text-sm">Detail Transaksi</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrxForDetail(null)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] text-[#6D4C41] flex items-center justify-center hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nominal Display */}
            <div className="text-center p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE4DA]">
              <p className="text-[10px] uppercase font-bold text-[#8D6E63]">Nominal Mutasi</p>
              <h2
                className={`text-2xl font-black mt-1 ${
                  selectedTrxForDetail.type === 'income' ? 'text-[#2E7D32]' : 'text-[#C2185B]'
                }`}
              >
                {selectedTrxForDetail.type === 'income' ? '+' : '-'} {formatRupiah(selectedTrxForDetail.amount)}
              </h2>
              <span
                className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  selectedTrxForDetail.type === 'income'
                    ? 'bg-[#E8F5E9] text-[#2E7D32]'
                    : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                {selectedTrxForDetail.type === 'income' ? 'Uang Masuk / Penjualan' : 'Uang Keluar / Biaya'}
              </span>
            </div>

            {/* Detailed Key-Values */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#EFE4DA]/60">
                <span className="text-[#8D6E63] font-medium">Keterangan:</span>
                <span className="font-black text-[#3E2723] text-right max-w-[65%]">{selectedTrxForDetail.description}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFE4DA]/60">
                <span className="text-[#8D6E63] font-medium">Kategori:</span>
                <span className="font-bold text-[#E65100]">{selectedTrxForDetail.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFE4DA]/60">
                <span className="text-[#8D6E63] font-medium">Metode:</span>
                <span className="font-bold text-[#3E2723]">{selectedTrxForDetail.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EFE4DA]/60">
                <span className="text-[#8D6E63] font-medium">Tanggal:</span>
                <span className="font-bold text-[#3E2723]">{selectedTrxForDetail.date}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#EFE4DA] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  handleDeleteTrx(selectedTrxForDetail.id, selectedTrxForDetail.description);
                  setSelectedTrxForDetail(null);
                }}
                className="px-3 py-2 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 flex items-center gap-1 border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrxForDetail(null)}
                className="px-4 py-2 rounded-xl bg-[#3E2723] text-white text-xs font-black hover:bg-black"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
