'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Plus,
  Sparkles,
  ShoppingBag,
  AlertTriangle,
  Search,
  CheckCircle2,
  Tags,
  Minus,
  Edit2,
  Trash2,
  X,
  Check,
  PackagePlus,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';
import { QuickBakeModal } from '@/components/dashboard/QuickBakeModal';
import { QuickSaleModal } from '@/components/dashboard/QuickSaleModal';
import { QuickRestockModal } from '@/components/dashboard/QuickRestockModal';
import { ItemModal } from '@/components/stok/ItemModal';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { CategoryManageModal } from '@/components/kategori/CategoryManageModal';
import { formatRupiah } from '@/lib/utils';
import { RawMaterial, FinishedProduct } from '@/types';

export default function StockPage() {
  const {
    rawMaterials,
    finishedProducts,
    categories,
    quickAdjustMaterialStock,
    quickAdjustProductStock,
    deleteMaterial,
    deleteProduct,
    recordSale,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'materials' | 'products'>('materials');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isBakeOpen, setIsBakeOpen] = useState(false);
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCatManageOpen, setIsCatManageOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<RawMaterial | FinishedProduct | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const relevantCategories = categories.filter((c) =>
    activeTab === 'materials' ? c.type === 'material' : c.type === 'product'
  );

  // Filter Materials
  const filteredMaterials = rawMaterials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryId === 'all' || m.categoryId === selectedCategoryId;
    const isLow = m.stock <= m.minStock;
    const matchesStatus =
      stockStatusFilter === 'all' ? true : stockStatusFilter === 'low' ? isLow : !isLow;

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Filter Products
  const filteredProducts = finishedProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
    const isLow = p.stock <= p.minStock;
    const matchesStatus =
      stockStatusFilter === 'all' ? true : stockStatusFilter === 'low' ? isLow : !isLow;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEdit = (item: RawMaterial | FinishedProduct) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = (id: string, name: string, type: 'material' | 'product') => {
    if (confirm(`Yakin ingin menghapus ${name}? Data tidak dapat dikembalikan.`)) {
      if (type === 'material') {
        deleteMaterial(id);
      } else {
        deleteProduct(id);
      }
      showToast(`${name} berhasil dihapus.`);
    }
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
          {/* Top Title & Tab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#EFE4DA] shadow-sm sm:shadow-lg shadow-[#3E2723]/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#FFF3E0] text-[#3E2723] border border-[#FFE0B2]">
                  <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFB300]" />
                </span>
                <h2 className="text-base sm:text-2xl font-black text-[#3E2723] tracking-tight">
                  Manajemen Stok Interaktif
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8D6E63] mt-1 font-medium">
                Pembaruan stok real-time, tombol cepat 1-sentuh, tambah item baru & pemantauan otomatis.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="justify-center px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-xs sm:shadow-md shadow-[#FFB300]/25 hover:brightness-105 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span className="truncate">{activeTab === 'materials' ? '+ Bahan' : '+ Varian Roti'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCatManageOpen(true)}
                className="justify-center px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#FFF8E1] hover:bg-[#FFECB3] border border-[#FFE082] text-[#3E2723] text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                title="Kelola & Atur Kategori"
              >
                <Tags className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB300]" />
                <span className="truncate">Kategori</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRestockOpen(true)}
                className="justify-center px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#FFF3E0] hover:bg-[#FFE0B2] border border-[#FFD54F] text-[#3E2723] text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
              >
                <PackagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E65100]" />
                <span className="truncate">Belanja</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBakeOpen(true)}
                className="justify-center px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#FCE4EC] hover:bg-[#F8BBD0] border border-[#F48FB1] text-[#D81B60] text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 fill-[#D81B60]" />
                <span className="truncate">Bake</span>
              </button>
            </div>
          </div>

          {/* Tab Selector & Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Main Tab */}
              <div className="flex items-center p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-[#EFE4DA] shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('materials');
                    setSelectedCategoryId('all');
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'materials'
                      ? 'bg-[#FFB300] text-[#3E2723] shadow-xs'
                      : 'text-[#8D6E63] hover:text-[#3E2723]'
                  }`}
                >
                  Bahan Baku ({rawMaterials.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('products');
                    setSelectedCategoryId('all');
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'products'
                      ? 'bg-[#FFB300] text-[#3E2723] shadow-xs'
                      : 'text-[#8D6E63] hover:text-[#3E2723]'
                  }`}
                >
                  Roti Siap Jual ({finishedProducts.length})
                </button>
              </div>

              {/* Status Filter & Search Input */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
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
                    Semua
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
                    placeholder="Cari nama bahan / roti..."
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
              {relevantCategories.map((cat) => {
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

          {/* TAB 1: BAHAN BAKU (Minimalis & Cepat) */}
          {activeTab === 'materials' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {filteredMaterials.map((mat) => {
                const isLow = mat.stock <= mat.minStock;
                const catObj = categories.find((c) => c.id === mat.categoryId);

                return (
                  <motion.div
                    key={mat.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-2.5 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border transition-all flex flex-col justify-between ${
                      isLow
                        ? 'border-[#F48FB1] bg-gradient-to-b from-white to-[#FCE4EC]/30 shadow-xs'
                        : 'border-[#EFE4DA] shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 truncate max-w-[65%] ${
                            catObj ? `${catObj.bgColor} ${catObj.textColor}` : 'bg-stone-100 text-[#3E2723]'
                          }`}
                        >
                          {catObj && <CategoryIcon name={catObj.iconName} className="w-3 h-3 shrink-0" />}
                          <span className="truncate">{mat.category}</span>
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {isLow ? (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#FCE4EC] text-[#D81B60] border border-[#F8BBD0]">
                              Kritis
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                              Aman
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(mat)}
                            className="p-1 text-[#8D6E63] hover:text-[#3E2723]"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Nama Bahan */}
                      <h3 className="font-black text-[#3E2723] text-xs sm:text-sm mt-2 truncate">
                        {mat.name}
                      </h3>

                      {/* Sisa Stok */}
                      <div className="mt-1">
                        <p className={`text-base sm:text-xl font-black ${isLow ? 'text-[#D81B60]' : 'text-[#3E2723]'}`}>
                          {mat.stock}{' '}
                          <span className="text-xs font-normal text-[#8D6E63]">{mat.unit}</span>
                        </p>
                      </div>
                    </div>

                    {/* Single Quick Action: Kurangi 1 Saat Terpakai */}
                    <div className="mt-2.5 pt-2 border-t border-[#EFE4DA]/80">
                      <button
                        type="button"
                        onClick={() => {
                          quickAdjustMaterialStock(mat.id, -1);
                          showToast(`Stok ${mat.name} dikurangi 1 ${mat.unit}`);
                        }}
                        className="w-full py-1.5 px-2 rounded-xl bg-white border border-[#EFE4DA] hover:bg-rose-50 text-[#D81B60] text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>Kurangi 1 {mat.unit}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* TAB 2: PRODUK ROTI (Minimalis & Cepat) */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {filteredProducts.map((prod) => {
                const isLow = prod.stock <= prod.minStock;
                const catObj = categories.find((c) => c.id === prod.categoryId);

                return (
                  <motion.div
                    key={prod.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-2.5 sm:p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border transition-all flex flex-col justify-between ${
                      isLow
                        ? 'border-[#FFE082] bg-gradient-to-b from-white to-[#FFF8E1]/40 shadow-xs'
                        : 'border-[#EFE4DA] shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 truncate max-w-[65%] ${
                            catObj ? `${catObj.bgColor} ${catObj.textColor}` : 'bg-stone-100 text-[#3E2723]'
                          }`}
                        >
                          {catObj && <CategoryIcon name={catObj.iconName} className="w-3 h-3 shrink-0" />}
                          <span className="truncate">{prod.category}</span>
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {isLow ? (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100] border border-[#FFE082]">
                              Kritis
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                              Aman
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prod)}
                            className="p-1 text-[#8D6E63] hover:text-[#3E2723]"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Nama Produk Roti */}
                      <h3 className="font-black text-[#3E2723] text-xs sm:text-sm mt-2 truncate">
                        {prod.name}
                      </h3>

                      {/* Sisa Stok */}
                      <div className="mt-1 flex items-baseline justify-between">
                        <p className={`text-base sm:text-xl font-black ${isLow ? 'text-[#D81B60]' : 'text-[#3E2723]'}`}>
                          {prod.stock}{' '}
                          <span className="text-xs font-normal text-[#8D6E63]">{prod.unit}</span>
                        </p>
                        <p className="text-[11px] font-black text-[#E65100]">
                          {formatRupiah(prod.sellingPrice)}
                        </p>
                      </div>
                    </div>

                    {/* Single Quick Action: Kurangi / Jual 1 */}
                    <div className="mt-2.5 pt-2 border-t border-[#EFE4DA]/80">
                      <button
                        type="button"
                        disabled={prod.stock <= 0}
                        onClick={() => {
                          const res = recordSale(prod.id, 1, 'Tunai');
                          if (res.success) {
                            showToast(`Terjual 1 ${prod.name}! (+${formatRupiah(prod.sellingPrice)})`);
                          } else {
                            showToast(res.message);
                          }
                        }}
                        className="w-full py-1.5 px-2 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-[11px] sm:text-xs font-black flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all disabled:opacity-40"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>Kurangi / Jual 1</span>
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
      <QuickBakeModal isOpen={isBakeOpen} onClose={() => setIsBakeOpen(false)} />
      <QuickSaleModal isOpen={isSaleOpen} onClose={() => setIsSaleOpen(false)} />
      <QuickRestockModal isOpen={isRestockOpen} onClose={() => setIsRestockOpen(false)} />
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        mode={activeTab === 'materials' ? 'material' : 'product'}
        itemToEdit={itemToEdit}
      />
      <CategoryManageModal
        isOpen={isCatManageOpen}
        onClose={() => setIsCatManageOpen(false)}
        initialType={activeTab === 'materials' ? 'material' : 'product'}
      />
    </div>
  );
}
