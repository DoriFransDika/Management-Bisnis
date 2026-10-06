'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Search,
  CheckCircle2,
  Tags,
  Minus,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';
import { ItemModal } from '@/components/stok/ItemModal';
import { ReduceStockModal } from '@/components/stok/ReduceStockModal';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { CategoryManageModal } from '@/components/kategori/CategoryManageModal';
import { DeleteDatabaseModal } from '@/components/common/DeleteDatabaseModal';
import { ConfirmSyncDeleteModal } from '@/components/common/ConfirmSyncDeleteModal';
import { getCategoryDisplayUnit } from '@/lib/utils';
import { RawMaterial } from '@/types';

export default function StockPage() {
  const {
    rawMaterials,
    categories,
    deleteMaterialWithSync,
    clearStockData,
  } = useStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCatManageOpen, setIsCatManageOpen] = useState(false);
  const [isClearStockOpen, setIsClearStockOpen] = useState(false);
  const [isReduceOpen, setIsReduceOpen] = useState(false);
  const [reduceCategoryTarget, setReduceCategoryTarget] = useState<{ id?: string; name?: string } | null>(null);
  const [itemToEdit, setItemToEdit] = useState<RawMaterial | null>(null);
  const [materialToDeleteSync, setMaterialToDeleteSync] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingSync, setIsDeletingSync] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Akumulasi Stok Per Kategori Bahan Baku (Bahan Baku Dapur Eksklusif)
  const materialCategories = categories.filter((c) => c.type === 'material');
  const categoryStockList = materialCategories
    .map((cat) => {
      const matsInCat = rawMaterials.filter(
        (m) => m.categoryId === cat.id || m.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
      );
      const totalStock = matsInCat.reduce((sum, m) => sum + Number(m.stock || 0), 0);
      const minStock = matsInCat.length > 0 ? Math.min(...matsInCat.map((m) => m.minStock)) : 3;
      const isLow = totalStock <= minStock;
      const unit = getCategoryDisplayUnit(cat, matsInCat[0]?.unit);

      return {
        cat,
        totalStock: Number(totalStock.toFixed(2)),
        unit,
        minStock,
        isLow,
        itemCount: matsInCat.length,
      };
    })
    .filter((item) => {
      const matchesSearch = item.cat.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategoryId === 'all' || item.cat.id === selectedCategoryId;
      const matchesStatus =
        stockStatusFilter === 'all' ? true : stockStatusFilter === 'low' ? item.isLow : !item.isLow;
      return matchesSearch && matchesCat && matchesStatus;
    });

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleOpenReduceUniversal = () => {
    setReduceCategoryTarget(null);
    setIsReduceOpen(true);
  };

  const handleOpenReduceCategory = (categoryId: string, categoryName: string) => {
    setReduceCategoryTarget({ id: categoryId, name: categoryName });
    setIsReduceOpen(true);
  };

  const handleConfirmDeleteMaterialSync = async () => {
    if (!materialToDeleteSync) return;
    setIsDeletingSync(true);
    try {
      const res = await deleteMaterialWithSync(materialToDeleteSync.id, true);
      showToast(res.message);
      setMaterialToDeleteSync(null);
    } catch {
      showToast('Gagal menghapus bahan.');
    } finally {
      setIsDeletingSync(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-fixed bg-no-repeat text-[#3E2723] flex flex-col md:flex-row font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
        <Header />

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
          {/* Top Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#EFE4DA] shadow-sm sm:shadow-lg shadow-[#3E2723]/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#FFF3E0] text-[#3E2723] border border-[#FFE0B2]">
                  <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB300]" />
                </span>
                <h2 className="text-base sm:text-2xl font-black text-[#3E2723] tracking-tight">
                  Manajemen Stok Bahan Baku
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8D6E63] mt-1 font-medium">
                Pencatatan persediaan bahan baku dapur per kategori otomatis menyesuaikan satuan.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="justify-center px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] hover:brightness-105 text-[#3E2723] text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#FFB300]/25 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span className="truncate">Tambah Bahan</span>
              </button>
              <button
                type="button"
                onClick={handleOpenReduceUniversal}
                className="justify-center px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                title="Kurangi stok bahan dapur secara universal"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span className="truncate">Kurangi Stok</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCatManageOpen(true)}
                className="justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#FFF8E1] hover:bg-[#FFECB3] border border-[#FFE082] text-[#3E2723] text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                title="Kelola & Atur Kategori"
              >
                <Tags className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB300]" />
                <span className="truncate">Kategori</span>
              </button>
              <button
                type="button"
                onClick={() => setIsClearStockOpen(true)}
                className="col-span-2 sm:col-span-1 justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-stone-100 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-[#8D6E63] hover:text-rose-700 text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                title="Hapus Database Stok Bahan dari Supabase"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="truncate">Hapus Stok</span>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Status Filter */}
              <div className="flex items-center bg-white/90 backdrop-blur-md rounded-2xl border-2 border-[#EFE4DA] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStockStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-black transition-all ${
                    stockStatusFilter === 'all'
                      ? 'bg-[#3E2723] text-white'
                      : 'text-[#8D6E63] hover:text-[#3E2723]'
                  }`}
                >
                  Semua ({rawMaterials.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStockStatusFilter('low')}
                  className={`px-3 py-1.5 rounded-xl font-black transition-all flex items-center gap-1 ${
                    stockStatusFilter === 'low'
                      ? 'bg-[#D81B60] text-white'
                      : 'text-[#D81B60] hover:bg-rose-50'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Kritis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStockStatusFilter('safe')}
                  className={`px-3 py-1.5 rounded-xl font-black transition-all flex items-center gap-1 ${
                    stockStatusFilter === 'safe'
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Aman</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama bahan / kategori..."
                  className="w-full bg-white/90 backdrop-blur-md border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl pl-10 pr-9 py-2.5 text-xs text-[#3E2723] font-bold placeholder-[#A1887F] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D6E63] hover:text-[#3E2723]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sub-Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategoryId('all')}
                className={`px-4 py-2 rounded-2xl text-xs font-black shrink-0 transition-all border ${
                  selectedCategoryId === 'all'
                    ? 'bg-[#3E2723] text-white border-[#3E2723]'
                    : 'bg-white/90 backdrop-blur-sm text-[#6D4C41] border-[#EFE4DA] hover:border-[#FFB300]'
                }`}
              >
                Semua Kategori
              </button>
              {materialCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#FFECB3] text-[#3E2723] border-[#FFB300]'
                        : 'bg-white/90 backdrop-blur-sm text-[#6D4C41] border-[#EFE4DA] hover:border-[#FFB300]'
                    }`}
                  >
                    <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsCatManageOpen(true)}
                className="px-3.5 py-2 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 bg-[#FFF8E1] text-[#E65100] border border-[#FFE082] hover:bg-[#FFE082]"
                title="Kelola & Tambah Kategori"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Atur Kategori</span>
              </button>
            </div>
          </div>

          {/* BAHAN BAKU (Per Kategori Bersih & Akumulasi Stok dengan Satuan Dinamis) */}
          {categoryStockList.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/90 backdrop-blur-md border border-[#EFE4DA]">
              <Boxes className="w-12 h-12 text-[#BCAAA4] mx-auto mb-3 opacity-60" />
              <h3 className="font-black text-[#3E2723] text-base">Tidak ada persediaan bahan baku yang cocok</h3>
              <p className="text-xs text-[#8D6E63] mt-1">Coba ubah kata kunci pencarian atau filter kategori di atas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {categoryStockList.map((item) => {
                return (
                  <motion.div
                    key={item.cat.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border transition-all flex flex-col justify-between ${
                      item.isLow
                        ? 'border-[#F48FB1] bg-gradient-to-b from-white to-[#FCE4EC]/30 shadow-xs'
                        : 'border-[#EFE4DA] shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 truncate max-w-[70%] ${item.cat.bgColor} ${item.cat.textColor}`}
                        >
                          <CategoryIcon name={item.cat.iconName} className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.cat.name}</span>
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {item.isLow ? (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#FCE4EC] text-[#D81B60] border border-[#F8BBD0]">
                              Kritis
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                              Aman
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Nama Kategori */}
                      <h3 className="font-black text-[#3E2723] text-sm sm:text-base mt-2.5 truncate">
                        {item.cat.name}
                      </h3>
                      <p className="text-[10px] text-[#8D6E63] font-medium mt-0.5">
                        Kategori Bahan Dapur ({item.itemCount} item)
                      </p>

                      {/* Total Persediaan Stok (Satuan Dinamis Sesuai Kategori) */}
                      <div className="mt-2.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE4DA]">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#8D6E63] block">
                          Total Persediaan
                        </span>
                        <p className={`text-base sm:text-2xl font-black mt-0.5 ${item.isLow ? 'text-[#D81B60]' : 'text-[#3E2723]'}`}>
                          {item.totalStock}{' '}
                          <span className="text-xs font-semibold text-[#8D6E63]">{item.unit}</span>
                        </p>
                      </div>
                    </div>

                    {/* Tombol Kurangi Stok */}
                    <div className="mt-3 pt-2.5 border-t border-[#EFE4DA]/80">
                      <button
                        type="button"
                        onClick={() => handleOpenReduceCategory(item.cat.id, item.cat.name)}
                        className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Kurangi Stok</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <BottomNav />
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        mode="material"
        itemToEdit={itemToEdit}
      />
      <ReduceStockModal
        isOpen={isReduceOpen}
        onClose={() => setIsReduceOpen(false)}
        initialCategoryId={reduceCategoryTarget?.id}
        initialCategoryName={reduceCategoryTarget?.name}
      />
      <CategoryManageModal
        isOpen={isCatManageOpen}
        onClose={() => setIsCatManageOpen(false)}
        initialType="material"
      />
      <DeleteDatabaseModal
        isOpen={isClearStockOpen}
        onClose={() => setIsClearStockOpen(false)}
        onConfirm={async () => {
          const res = await clearStockData('all');
          showToast(res.message);
        }}
        title="Hapus Database Stok Bahan"
        itemCountText={`${rawMaterials.length} Bahan Baku`}
        description="Tindakan ini akan mengosongkan seluruh data persediaan bahan baku dapur dari database Supabase dan penyimpanan lokal."
        warningNote="Semua stok bahan akan dikosongkan permanen. Anda dapat menambahkan item baru sewaktu-waktu."
        confirmButtonText="Ya, Hapus Semua Stok dari Supabase"
      />
      {materialToDeleteSync && (
        <ConfirmSyncDeleteModal
          isOpen={Boolean(materialToDeleteSync)}
          onClose={() => setMaterialToDeleteSync(null)}
          onConfirm={handleConfirmDeleteMaterialSync}
          title="Hapus Bahan & Sinkronkan Keuangan"
          itemName={materialToDeleteSync.name}
          sourceModule="Stok"
          impactDescription="Menghapus bahan baku ini akan otomatis menghapus seluruh catatan belanja/pengeluaran kulakannya di Buku Kas Keuangan Toko dari database Supabase."
          isDeleting={isDeletingSync}
        />
      )}
    </div>
  );
}
