'use client';

import React, { useState } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  Boxes,
  Croissant,
  Sparkles,
  Layers,
  Heart,
  Search,
  X
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';
import { QuickBakeModal } from '@/components/dashboard/QuickBakeModal';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS, CATEGORY_COLOR_PRESETS } from '@/components/common/CategoryIcon';
import { Category } from '@/types';

export default function CategoryManagerPage() {
  const {
    categories,
    rawMaterials,
    finishedProducts,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'material' | 'product'>('material');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBakeOpen, setIsBakeOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'material' | 'product'>('material');
  const [iconName, setIconName] = useState('Wheat');
  const [selectedColorPreset, setSelectedColorPreset] = useState(CATEGORY_COLOR_PRESETS[0]);
  const [description, setDescription] = useState('');
  const [alertMsg, setAlertMsg] = useState<{ success: boolean; text: string } | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab);
    setIconName(activeTab === 'material' ? 'Wheat' : 'Croissant');
    setSelectedColorPreset(CATEGORY_COLOR_PRESETS[0]);
    setDescription('');
    setAlertMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setIconName(cat.iconName);
    const foundPreset = CATEGORY_COLOR_PRESETS.find((p) => p.bg === cat.bgColor) || CATEGORY_COLOR_PRESETS[0];
    setSelectedColorPreset(foundPreset);
    setDescription(cat.description || '');
    setAlertMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        type,
        iconName,
        bgColor: selectedColorPreset.bg,
        textColor: selectedColorPreset.text,
        description: description.trim(),
      });
      setAlertMsg({ success: true, text: 'Kategori berhasil diperbarui!' });
    } else {
      addCategory({
        name: name.trim(),
        type,
        iconName,
        bgColor: selectedColorPreset.bg,
        textColor: selectedColorPreset.text,
        description: description.trim(),
      });
      setAlertMsg({ success: true, text: 'Kategori baru berhasil ditambahkan!' });
    }

    setTimeout(() => {
      setIsModalOpen(false);
      setAlertMsg(null);
    }, 1000);
  };

  const handleDelete = (cat: Category) => {
    if (confirm(`Yakin ingin menghapus kategori "${cat.name}"?`)) {
      const res = deleteCategory(cat.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.type === activeTab &&
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-fixed bg-no-repeat text-[#3E2723] flex flex-col md:flex-row font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
        <Header onOpenQuickBake={() => setIsBakeOpen(true)} />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#EFE4DA] shadow-lg shadow-[#3E2723]/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-[#FFF3E0] text-[#3E2723] border border-[#FFE0B2]">
                  <Tags className="w-5 h-5 text-[#FFB300]" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#3E2723] tracking-tight">
                  Kelola Kategori Kustom
                </h2>
              </div>
              <p className="text-xs text-[#8D6E63] mt-1 font-medium">
                Kustomisasi logo ikon dan warna pastel untuk pengelompokan bahan baku serta etalase roti.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-xs font-black shadow-md shadow-[#FFB300]/30 hover:brightness-105 active:scale-95 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tambah Kategori Baru</span>
            </button>
          </div>

          {/* Tab & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-[#EFE4DA] shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('material')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'material'
                    ? 'bg-[#FFB300] text-[#3E2723] shadow-xs'
                    : 'text-[#8D6E63] hover:text-[#3E2723]'
                }`}
              >
                Bahan Baku ({categories.filter((c) => c.type === 'material').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('product')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'product'
                    ? 'bg-[#FFB300] text-[#3E2723] shadow-xs'
                    : 'text-[#8D6E63] hover:text-[#3E2723]'
                }`}
              >
                Produk Roti Jadi ({categories.filter((c) => c.type === 'product').length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama kategori..."
                className="w-full bg-white/90 backdrop-blur-md border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#3E2723] font-bold placeholder-[#A1887F] focus:outline-none"
              />
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredCategories.map((cat) => {
              const count =
                cat.type === 'material'
                  ? rawMaterials.filter((m) => m.categoryId === cat.id).length
                  : finishedProducts.filter((p) => p.categoryId === cat.id).length;

              return (
                <div
                  key={cat.id}
                  className="p-6 rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#EFE4DA] hover:border-[#FFB300] shadow-md shadow-[#3E2723]/5 hover:shadow-xl hover:shadow-[#3E2723]/10 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-13 h-13 rounded-2xl flex items-center justify-center ${cat.bgColor} ${cat.textColor} shadow-xs border border-black/5`}
                      >
                        <CategoryIcon name={cat.iconName} className="w-6 h-6 stroke-[2.5]" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="w-9 h-9 rounded-xl bg-white/80 hover:bg-[#FFF3E0] text-[#6D4C41] hover:text-[#3E2723] flex items-center justify-center transition-colors border border-[#EFE4DA]"
                          title="Edit Kategori"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="w-9 h-9 rounded-xl bg-white/80 hover:bg-rose-50 text-[#6D4C41] hover:text-rose-700 flex items-center justify-center transition-colors border border-[#EFE4DA]"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-black text-[#3E2723] text-base mt-4">{cat.name}</h3>
                    <p className="text-xs text-[#6D4C41] mt-1 leading-relaxed line-clamp-2 font-medium">
                      {cat.description || 'Kategori kustom Dapoer Mamak.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#EFE4DA] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#6D4C41]">
                      Terhubung: <strong className="text-[#3E2723] font-black">{count} item</strong>
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                      {cat.type === 'material' ? 'Bahan Baku' : 'Produk Jadi'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <BottomNav />
      <QuickBakeModal isOpen={isBakeOpen} onClose={() => setIsBakeOpen(false)} />

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-[#EFE4DA] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-[#3E2723]/20 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EFE4DA] flex items-center justify-between bg-gradient-to-r from-[#FFFDF9] to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF3E0] text-[#FFB300] flex items-center justify-center border border-[#FFE0B2]">
                  <Tags className="w-4 h-4 text-[#3E2723]" />
                </div>
                <h3 className="font-black text-[#3E2723] text-base">
                  {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#FFF3E0] text-[#6D4C41] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 bg-[#FAF7F2]">
              {alertMsg && (
                <div
                  className={`p-3 rounded-2xl text-xs font-black flex items-center gap-2 border ${
                    alertMsg.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{alertMsg.text}</span>
                </div>
              )}

              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-black uppercase text-[#6D4C41] mb-1.5">
                  Tipe Kategori
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('material')}
                    className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                      type === 'material'
                        ? 'bg-[#FFB300] border-[#FFB300] text-[#3E2723] shadow-xs'
                        : 'bg-white border-[#EFE4DA] text-[#8D6E63]'
                    }`}
                  >
                    Bahan Baku Dapur
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('product')}
                    className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                      type === 'product'
                        ? 'bg-[#FFB300] border-[#FFB300] text-[#3E2723] shadow-xs'
                        : 'bg-white border-[#EFE4DA] text-[#8D6E63]'
                    }`}
                  >
                    Produk Roti Jadi
                  </button>
                </div>
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-xs font-black uppercase text-[#6D4C41] mb-1.5">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Tepung & Gandum, Roti Sisir, Donat"
                  className="w-full bg-white border border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-black focus:outline-none"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-black uppercase text-[#6D4C41] mb-1.5">
                  Pilih Logo / Ikon Kategori
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2.5 bg-white rounded-2xl border border-[#EFE4DA]">
                  {AVAILABLE_CATEGORY_ICONS.map((item) => {
                    const isSelected = iconName === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIconName(item.name)}
                        className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#FFB300] text-[#3E2723] ring-2 ring-[#FFA000]'
                            : 'text-[#8D6E63] hover:bg-[#FAF7F2]'
                        }`}
                        title={item.label}
                      >
                        <CategoryIcon name={item.name} className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Preset Picker */}
              <div>
                <label className="block text-xs font-black uppercase text-[#6D4C41] mb-1.5">
                  Warna Latar Pastel (Gaya E-Wallet)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_COLOR_PRESETS.map((preset) => {
                    const isSelected = selectedColorPreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedColorPreset(preset)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-black transition-all ${preset.bg} ${preset.text} ${
                          isSelected ? 'ring-2 ring-[#FFB300] border-transparent' : 'border-[#EFE4DA]'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full bg-current" />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase text-[#6D4C41] mb-1.5">
                  Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Khusus adonan lembut dan roti manis"
                  className="w-full bg-white border border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] focus:outline-none"
                />
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE4DA] flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedColorPreset.bg} ${selectedColorPreset.text}`}
                >
                  <CategoryIcon name={iconName} className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#3E2723]">{name || 'Nama Kategori'}</p>
                  <p className="text-[11px] text-[#8D6E63] font-medium">
                    Pratinjau tampilan di dompet & etalase toko
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#8D6E63] hover:text-[#3E2723]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] shadow-md shadow-[#FFB300]/25"
                >
                  {editingCategory ? 'Simpan Perubahan' : 'Buat Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
