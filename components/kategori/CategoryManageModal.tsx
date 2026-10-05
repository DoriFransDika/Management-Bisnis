'use client';

import React, { useState } from 'react';
import { Tags, Plus, Edit2, Trash2, X, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS, CATEGORY_COLOR_PRESETS } from '@/components/common/CategoryIcon';
import { Category } from '@/types';

interface CategoryManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'material' | 'product';
}

export function CategoryManageModal({
  isOpen,
  onClose,
  initialType = 'material',
}: CategoryManageModalProps) {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();

  const [activeTab, setActiveTab] = useState<'material' | 'product'>(initialType);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'material' | 'product'>(initialType);
  const [iconName, setIconName] = useState('Wheat');
  const [selectedColorPreset, setSelectedColorPreset] = useState(CATEGORY_COLOR_PRESETS[0]);
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategories = categories.filter((c) => c.type === activeTab);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab);
    setIconName(activeTab === 'material' ? 'Wheat' : 'Croissant');
    setSelectedColorPreset(CATEGORY_COLOR_PRESETS[0]);
    setDescription('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setIconName(cat.iconName);
    const foundPreset = CATEGORY_COLOR_PRESETS.find((p) => p.bg === cat.bgColor) || CATEGORY_COLOR_PRESETS[0];
    setSelectedColorPreset(foundPreset);
    setDescription(cat.description || '');
    setIsFormOpen(true);
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
      setFeedback('Kategori berhasil diperbarui!');
    } else {
      addCategory({
        name: name.trim(),
        type,
        iconName,
        bgColor: selectedColorPreset.bg,
        textColor: selectedColorPreset.text,
        description: description.trim(),
      });
      setFeedback('Kategori baru berhasil ditambahkan!');
    }

    setIsFormOpen(false);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleDelete = (cat: Category) => {
    if (confirm(`Yakin ingin menghapus kategori "${cat.name}"?`)) {
      const res = deleteCategory(cat.id);
      if (!res.success) {
        alert(res.message);
      } else {
        setFeedback('Kategori berhasil dihapus.');
        setTimeout(() => setFeedback(null), 2500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border-2 border-[#EFE4DA] rounded-2xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#EFE4DA] flex items-center justify-between bg-gradient-to-r from-[#FFFDF9] to-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFF3E0] text-[#FFB300] flex items-center justify-center border border-[#FFE0B2]">
              <Tags className="w-4 h-4 text-[#3E2723]" />
            </div>
            <div>
              <h3 className="font-black text-[#3E2723] text-sm sm:text-base">
                Kelola Kategori Interaktif
              </h3>
              <p className="text-[10px] sm:text-xs text-[#8D6E63]">
                Atur ikon dompet digital dan warna pastel kategori toko
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF7F2] hover:bg-[#FFF3E0] text-[#6D4C41] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Tab & New Category Button */}
        <div className="p-3 sm:p-4 bg-stone-50/70 border-b border-[#EFE4DA] flex items-center justify-between gap-2">
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#EFE4DA] text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('material');
                setIsFormOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] ${
                activeTab === 'material' ? 'bg-[#FFB300] text-[#3E2723] shadow-xs' : 'text-[#8D6E63]'
              }`}
            >
              Bahan Baku
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('product');
                setIsFormOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] ${
                activeTab === 'product' ? 'bg-[#FFB300] text-[#3E2723] shadow-xs' : 'text-[#8D6E63]'
              }`}
            >
              Roti Jadi
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-xs font-black flex items-center gap-1 shadow-xs hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Kategori</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3.5 flex-1 bg-[#FAF7F2]">
          {/* Form Mode (Add or Edit) */}
          {isFormOpen ? (
            <form onSubmit={handleSave} className="p-3.5 sm:p-4 bg-white rounded-2xl border-1.5 border-[#FFB300] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#EFE4DA]">
                <span className="text-xs font-black text-[#3E2723] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB300]" />
                  {editingCategory ? 'Edit Kategori' : 'Buat Kategori Baru'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-[11px] text-[#8D6E63] hover:text-[#3E2723] font-bold"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3E2723] mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Selai & Isian Manis"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EFE4DA] focus:border-[#FFB300] rounded-xl px-3 py-1.5 text-xs text-[#3E2723] font-bold focus:outline-none"
                />
              </div>

              {/* Icon Selector (Digital Wallet Style) */}
              <div>
                <label className="block text-[11px] font-bold text-[#3E2723] mb-1">Ikon Dompet Digital / Toko</label>
                <div className="grid grid-cols-7 gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-[#FAF7F2] rounded-xl border border-[#EFE4DA]">
                  {AVAILABLE_CATEGORY_ICONS.map((iconItem) => {
                    const isSelected = iconName.toLowerCase() === iconItem.name.toLowerCase();
                    const IconComp = iconItem.icon;
                    return (
                      <button
                        key={iconItem.name}
                        type="button"
                        onClick={() => setIconName(iconItem.name)}
                        className={`p-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#FFB300] text-[#3E2723] shadow-xs scale-105'
                            : 'bg-white text-[#6D4C41] hover:bg-stone-100 border border-[#EFE4DA]'
                        }`}
                        title={iconItem.label}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Preset Selector */}
              <div>
                <label className="block text-[11px] font-bold text-[#3E2723] mb-1">Warna Badge Kategori</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {CATEGORY_COLOR_PRESETS.map((p) => {
                    const isSelected = selectedColorPreset.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedColorPreset(p)}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-black border transition-all text-center ${p.bg} ${p.text} ${
                          isSelected ? 'ring-2 ring-[#FFB300] font-black scale-105' : 'border-stone-200'
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3E2723] mb-1">Keterangan Singkat</label>
                <input
                  type="text"
                  placeholder="Catatan untuk kategori ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EFE4DA] focus:border-[#FFB300] rounded-xl px-3 py-1.5 text-xs text-[#3E2723] font-medium focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 text-[#6D4C41] text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-xs font-black shadow-xs"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          ) : (
            /* Category List View */
            <div className="space-y-2">
              {currentCategories.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#8D6E63]">
                  Belum ada kategori untuk tipe ini. Klik &quot;+ Kategori&quot; untuk menambahkan.
                </div>
              ) : (
                currentCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#EFE4DA] flex items-center justify-between gap-2.5 hover:border-[#FFB300] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cat.bgColor} ${cat.textColor} shrink-0 border border-black/5`}>
                        <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-xs text-[#3E2723] truncate">{cat.name}</p>
                        <p className="text-[10px] text-[#8D6E63] truncate">
                          {cat.description || 'Kategori aktif Dapoer Mamak'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#FFF3E0] text-[#6D4C41] hover:text-[#3E2723]"
                        title="Edit Kategori"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-[#6D4C41] hover:text-rose-600"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
