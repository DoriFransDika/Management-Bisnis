'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Boxes, Croissant, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Category, RawMaterial, FinishedProduct } from '@/types';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRupiah } from '@/lib/utils';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'material' | 'product';
  itemToEdit?: RawMaterial | FinishedProduct | null;
}

export function ItemModal({ isOpen, onClose, mode, itemToEdit }: ItemModalProps) {
  const { categories, rawMaterials, addNewMaterial, updateMaterial, addNewProduct, updateProduct } = useStore();

  const isMaterial = mode === 'material';
  const isEditing = Boolean(itemToEdit);

  const availableCategories = categories.filter((c) =>
    isMaterial ? c.type === 'material' : c.type === 'product'
  );

  // Common fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState<number | string>(10);
  const [minStock, setMinStock] = useState<number | string>(5);
  // Units with strict typing
  const [materialUnit, setMaterialUnit] = useState<RawMaterial['unit']>('kg');
  const [productUnit, setProductUnit] = useState<FinishedProduct['unit']>('pcs');

  // Material specific
  const [costPerUnit, setCostPerUnit] = useState<number | string>(15000);

  // Product specific
  const [sellingPrice, setSellingPrice] = useState<number | string>(12000);
  const [costPrice, setCostPrice] = useState<number | string>(6500);
  const [batchYield, setBatchYield] = useState<number | string>(20);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategoryId(itemToEdit.categoryId);
      setStock(itemToEdit.stock);
      setMinStock(itemToEdit.minStock);

      if ('costPerUnit' in itemToEdit) {
        setMaterialUnit(itemToEdit.unit as RawMaterial['unit']);
        setCostPerUnit(itemToEdit.costPerUnit);
      }
      if ('sellingPrice' in itemToEdit) {
        setProductUnit(itemToEdit.unit as FinishedProduct['unit']);
        setSellingPrice(itemToEdit.sellingPrice);
        setCostPrice(itemToEdit.costPrice);
        setBatchYield(itemToEdit.batchYield);
      }
    } else {
      setName('');
      setCategoryId(availableCategories[0]?.id || '');
      setStock(isMaterial ? 10 : 20);
      setMinStock(isMaterial ? 5 : 5);
      setMaterialUnit('kg');
      setProductUnit('pcs');
      setCostPerUnit(15000);
      setSellingPrice(10000);
      setCostPrice(5000);
      setBatchYield(20);
    }
  }, [itemToEdit, isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const catObj = categories.find((c) => c.id === categoryId) || availableCategories[0];
    const categoryName = catObj ? catObj.name : (isMaterial ? 'Tepung & Gandum' : 'Roti Manis');

    if (isMaterial) {
      if (isEditing && itemToEdit) {
        updateMaterial(itemToEdit.id, {
          name: name.trim(),
          category: categoryName,
          categoryId: catObj?.id || categoryId,
          stock: Number(stock),
          minStock: Number(minStock),
          unit: materialUnit,
          costPerUnit: Number(costPerUnit),
        });
      } else {
        addNewMaterial({
          name: name.trim(),
          category: categoryName,
          categoryId: catObj?.id || categoryId,
          stock: Number(stock),
          minStock: Number(minStock),
          unit: materialUnit,
          costPerUnit: Number(costPerUnit),
        });
      }
    } else {
      if (isEditing && itemToEdit) {
        updateProduct(itemToEdit.id, {
          name: name.trim(),
          category: categoryName,
          categoryId: catObj?.id || categoryId,
          stock: Number(stock),
          minStock: Number(minStock),
          unit: productUnit,
          sellingPrice: Number(sellingPrice),
          costPrice: Number(costPrice),
          batchYield: Number(batchYield),
        });
      } else {
        addNewProduct({
          name: name.trim(),
          category: categoryName,
          categoryId: catObj?.id || categoryId,
          stock: Number(stock),
          minStock: Number(minStock),
          unit: productUnit,
          sellingPrice: Number(sellingPrice),
          costPrice: Number(costPrice),
          batchYield: Number(batchYield),
          recipe: rawMaterials.slice(0, 3).map((m) => ({
            materialId: m.id,
            amount: 1,
            unit: m.unit,
          })),
        });
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white/95 backdrop-blur-md border-2 border-[#EFE4DA] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#EFE4DA] flex items-center justify-between bg-gradient-to-r from-[#FFFDF9] to-[#FFF3E0]/40">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#FFB300] text-[#3E2723] shadow-xs">
              {isMaterial ? <Boxes className="w-5 h-5" /> : <Croissant className="w-5 h-5" />}
            </span>
            <div>
              <h3 className="font-black text-lg text-[#3E2723]">
                {isEditing ? 'Ubah Rincian Item' : isMaterial ? 'Tambah Bahan Baku Baru' : 'Tambah Varian Roti Baru'}
              </h3>
              <p className="text-xs text-[#8D6E63] font-medium">
                {isMaterial ? 'Simpan ke inventaris dapur toko' : 'Tambah ke daftar etalase roti Dapoer Mamak'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8D6E63] hover:text-[#3E2723] hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Nama Item */}
          <div>
            <label className="block text-xs font-black text-[#3E2723] mb-1.5">
              Nama {isMaterial ? 'Bahan Baku' : 'Varian Roti'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isMaterial ? 'Contoh: Tepung Cakra Kembar' : 'Contoh: Roti Sisir Pandan Keju'}
              className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none placeholder-[#A1887F]"
            />
          </div>

          {/* Kategori Dropdown / Badges */}
          <div>
            <label className="block text-xs font-black text-[#3E2723] mb-1.5">
              Kategori Terpilih
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableCategories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={`p-2.5 rounded-2xl border text-xs font-black flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-[#FFB300] bg-[#FFECB3]/60 text-[#3E2723] shadow-xs'
                        : 'border-[#EFE4DA] bg-white text-[#6D4C41] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <CategoryIcon name={c.iconName} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stok Awal & Batas Minimal */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-[#3E2723] mb-1">
                {isEditing ? 'Stok Sekarang' : 'Stok Awal'}
              </label>
              <input
                type="number"
                min="0"
                step={isMaterial ? '0.1' : '1'}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#3E2723] mb-1">
                Batas Kritis
              </label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#3E2723] mb-1">
                Satuan
              </label>
              {isMaterial ? (
                <select
                  value={materialUnit}
                  onChange={(e) => setMaterialUnit(e.target.value as RawMaterial['unit'])}
                  className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="gr">gr</option>
                  <option value="butir">butir</option>
                  <option value="liter">liter</option>
                  <option value="ml">ml</option>
                  <option value="pack">pack</option>
                  <option value="pcs">pcs</option>
                </select>
              ) : (
                <select
                  value={productUnit}
                  onChange={(e) => setProductUnit(e.target.value as FinishedProduct['unit'])}
                  className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                >
                  <option value="pcs">pcs</option>
                  <option value="box">box</option>
                  <option value="loyang">loyang</option>
                </select>
              )}
            </div>
          </div>

          {/* Pricing fields */}
          {isMaterial ? (
            <div>
              <label className="block text-xs font-black text-[#3E2723] mb-1.5">
                Estimasi Harga Beli per {materialUnit} (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none"
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-black text-[#3E2723] mb-1">
                  Harga Jual (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#3E2723] mb-1">
                  HPP per Pcs (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#3E2723] mb-1">
                  Hasil / Batch
                </label>
                <input
                  type="number"
                  min="1"
                  value={batchYield}
                  onChange={(e) => setBatchYield(e.target.value)}
                  className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-[#EFE4DA] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-[#EFE4DA] text-xs font-black text-[#8D6E63] hover:bg-stone-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] text-xs font-black shadow-md shadow-[#FFB300]/30 hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Tambahkan Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
