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
  X,
  Scale,
  Droplets,
  Package
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';
import {
  CategoryIcon,
  MATERIAL_CATEGORY_ICONS,
  PRODUCT_CATEGORY_ICONS,
  CATEGORY_COLOR_PRESETS
} from '@/components/common/CategoryIcon';
import { Category, UnitGroup } from '@/types';
import { getCategoryUnitGroup } from '@/lib/utils';

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'material' | 'product'>('material');
  const [unitGroup, setUnitGroup] = useState<UnitGroup>('weight');
  const [iconName, setIconName] = useState('Wheat');
  const [selectedColorPreset, setSelectedColorPreset] = useState(CATEGORY_COLOR_PRESETS[0]);
  const [alertMsg, setAlertMsg] = useState<{ success: boolean; text: string } | null>(null);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab);
    setUnitGroup('weight');
    setIconName(activeTab === 'material' ? 'Wheat' : 'Croissant');
    setSelectedColorPreset(CATEGORY_COLOR_PRESETS[0]);
    setAlertMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setUnitGroup(getCategoryUnitGroup(cat));
    setIconName(cat.iconName);
    const foundPreset = CATEGORY_COLOR_PRESETS.find((p) => p.bg === cat.bgColor) || CATEGORY_COLOR_PRESETS[0];
    setSelectedColorPreset(foundPreset);
    setAlertMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalDesc = type === 'material' ? `[unit:${unitGroup}]` : undefined;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        type,
        unitGroup: type === 'material' ? unitGroup : undefined,
        iconName,
        bgColor: selectedColorPreset.bg,
        textColor: selectedColorPreset.text,
        description: finalDesc,
      });
      setAlertMsg({ success: true, text: 'Kategori berhasil diperbarui!' });
    } else {
      addCategory({
        name: name.trim(),
        type,
        unitGroup: type === 'material' ? unitGroup : undefined,
        iconName,
        bgColor: selectedColorPreset.bg,
        textColor: selectedColorPreset.text,
        description: finalDesc,
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
        <Header />

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

          {/* Category Cards Grid (3-4 Kolom Kompak: Hanya Ikon & Nama) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {filteredCategories.map((cat) => {
              return (
                <div
                  key={cat.id}
                  className="p-2 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[#EFE4DA] hover:border-[#FFB300] shadow-2xs hover:shadow-xs transition-all flex flex-col items-center justify-between text-center relative group"
                >
                  {/* Subtle Action Buttons on Top Right */}
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1 rounded-md text-[#8D6E63] hover:text-[#3E2723] hover:bg-stone-100"
                      title="Edit Kategori"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1 rounded-md text-[#8D6E63] hover:text-rose-600 hover:bg-rose-50"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${cat.bgColor} ${cat.textColor} shadow-2xs border border-black/5 mt-2`}
                  >
                    <CategoryIcon name={cat.iconName} className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                  </div>

                  {/* Category Name */}
                  <div className="mt-2 w-full">
                    <h3 className="font-black text-[#3E2723] text-xs sm:text-sm truncate px-1">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <BottomNav />

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
                    onClick={() => {
                      setType('material');
                      if (!MATERIAL_CATEGORY_ICONS.some((i) => i.name.toLowerCase() === iconName.toLowerCase())) {
                        setIconName('Wheat');
                      }
                    }}
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
                    onClick={() => {
                      setType('product');
                      if (!PRODUCT_CATEGORY_ICONS.some((i) => i.name.toLowerCase() === iconName.toLowerCase())) {
                        setIconName('Croissant');
                      }
                    }}
                    className={`py-2.5 rounded-2xl text-xs font-black border transition-all ${
                      type === 'product'
                        ? 'bg-[#FFB300] border-[#FFB300] text-[#3E2723] shadow-xs'
                        : 'bg-white border-[#EFE4DA] text-[#8D6E63]'
                    }`}
                  >
                    Produk Roti
                  </button>
                </div>
              </div>

              {/* Jenis Satuan Kategori (Khusus Bahan Baku) */}
              {type === 'material' && (
                <div>
                  <label className="block text-xs font-black uppercase text-[#6D4C41] mb-1.5">
                    Jenis Satuan Kategori <span className="text-amber-700 font-normal lowercase">(basis satuan persediaan)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setUnitGroup('weight')}
                      className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        unitGroup === 'weight'
                          ? 'bg-[#FFF3E0] border-[#FFB300] ring-2 ring-[#FFB300] text-[#3E2723] shadow-xs'
                          : 'bg-white border-[#EFE4DA] text-[#6D4C41] hover:bg-[#FFFDF9]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        <Scale className="w-3.5 h-3.5 text-[#E65100]" />
                        <span>Berat</span>
                      </div>
                      <span className="text-[9.5px] text-[#8D6E63] mt-1 font-medium leading-tight">
                        Default basis: gram / kg
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUnitGroup('volume')}
                      className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        unitGroup === 'volume'
                          ? 'bg-[#FFF3E0] border-[#FFB300] ring-2 ring-[#FFB300] text-[#3E2723] shadow-xs'
                          : 'bg-white border-[#EFE4DA] text-[#6D4C41] hover:bg-[#FFFDF9]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        <Droplets className="w-3.5 h-3.5 text-blue-600" />
                        <span>Volume</span>
                      </div>
                      <span className="text-[9.5px] text-[#8D6E63] mt-1 font-medium leading-tight">
                        Default basis: Liter / ml
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUnitGroup('count')}
                      className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        unitGroup === 'count'
                          ? 'bg-[#FFF3E0] border-[#FFB300] ring-2 ring-[#FFB300] text-[#3E2723] shadow-xs'
                          : 'bg-white border-[#EFE4DA] text-[#6D4C41] hover:bg-[#FFFDF9]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        <Package className="w-3.5 h-3.5 text-amber-700" />
                        <span>Unit / Hitung</span>
                      </div>
                      <span className="text-[9.5px] text-[#8D6E63] mt-1 font-medium leading-tight">
                        Default basis: pcs / kaleng / botol / kotak
                      </span>
                    </button>
                  </div>
                </div>
              )}

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

              {/* Icon Picker (Khusus Bahan Baku atau Khusus Produk) */}
              <div>
                <label className="block text-xs font-black uppercase text-[#6D4C41] mb-1.5">
                  Pilih Logo / Ikon Kategori {type === 'material' ? '(Bahan Baku)' : '(Produk Jadi)'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-36 overflow-y-auto p-2.5 bg-white rounded-2xl border border-[#EFE4DA]">
                  {(type === 'material' ? MATERIAL_CATEGORY_ICONS : PRODUCT_CATEGORY_ICONS).map((item) => {
                    const isSelected = iconName.toLowerCase() === item.name.toLowerCase();
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

              {/* Color Preset Picker (E-Wallet Style Pastel Circles) */}
              <div>
                <label className="block text-xs font-black uppercase text-[#6D4C41] mb-1.5">
                  Warna Latar Pastel (Gaya Dompet Digital)
                </label>
                <div className="grid grid-cols-6 gap-2 p-2 bg-white rounded-2xl border border-[#EFE4DA]">
                  {CATEGORY_COLOR_PRESETS.map((preset) => {
                    const isSelected = selectedColorPreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedColorPreset(preset)}
                        className={`h-8 rounded-xl flex items-center justify-center transition-all ${preset.bg} ${
                          isSelected
                            ? 'ring-2 ring-offset-1 ring-[#3E2723] scale-105 shadow-xs border border-white'
                            : 'border border-black/5 hover:scale-105'
                        }`}
                        title={preset.id}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#3E2723] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
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
