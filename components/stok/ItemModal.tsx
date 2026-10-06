'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Boxes, Croissant, Plus, Trash2, ArrowRightLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Category, RawMaterial, FinishedProduct } from '@/types';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRupiah, getCategoryUnitGroup, UNIT_GROUP_CONFIG, UnitGroupType } from '@/lib/utils';

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
  const [stock, setStock] = useState<number | string>(1);
  const [minStock, setMinStock] = useState<number | string>(1);

  // Satuan input dinamis sesuai grup kategori
  const [inputUnit, setInputUnit] = useState<string>('kg');
  const [productUnit, setProductUnit] = useState<FinishedProduct['unit']>('pcs');

  // Material specific: Total harga beli untuk pencatatan otomatis keuangan
  const [totalCost, setTotalCost] = useState<number | string>('');

  // Product specific
  const [sellingPrice, setSellingPrice] = useState<number | string>(12000);
  const [costPrice, setCostPrice] = useState<number | string>(6500);
  const [batchYield, setBatchYield] = useState<number | string>(20);

  const currentCategory = categories.find((c) => c.id === categoryId) || availableCategories[0];
  const unitGroup: UnitGroupType = isMaterial ? getCategoryUnitGroup(currentCategory) : 'count';
  const groupConfig = UNIT_GROUP_CONFIG[unitGroup];
  const availableUnits = groupConfig.units;

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategoryId(itemToEdit.categoryId);
      setStock(itemToEdit.stock);
      setMinStock(itemToEdit.minStock);

      if ('costPerUnit' in itemToEdit) {
        const cat = categories.find((c) => c.id === itemToEdit.categoryId);
        const grp = getCategoryUnitGroup(cat);
        const validUnits = UNIT_GROUP_CONFIG[grp].units;
        const matched = validUnits.find((u) => u.id === itemToEdit.unit);
        setInputUnit(matched ? matched.id : validUnits[0].id);
        setTotalCost(Math.round(itemToEdit.costPerUnit * itemToEdit.stock) || '');
      }
      if ('sellingPrice' in itemToEdit) {
        setProductUnit(itemToEdit.unit as FinishedProduct['unit']);
        setSellingPrice(itemToEdit.sellingPrice);
        setCostPrice(itemToEdit.costPrice);
        setBatchYield(itemToEdit.batchYield);
      }
    } else {
      const initialCat = availableCategories[0];
      const initialGroup = isMaterial ? getCategoryUnitGroup(initialCat) : 'count';
      setName('');
      setCategoryId(initialCat?.id || '');
      setStock(isMaterial ? 1 : 20);
      setMinStock(isMaterial ? 1 : 5);
      setInputUnit(UNIT_GROUP_CONFIG[initialGroup].units[0].id);
      setProductUnit('pcs');
      setTotalCost('');
      setSellingPrice(10000);
      setCostPrice(5000);
      setBatchYield(20);
    }
  }, [itemToEdit, isOpen, mode]);

  if (!isOpen) return null;

  // Konversi Cerdas Sesuai Grup Satuan:
  // - Berat: gr -> kg (/ 1000)
  // - Volume: ml -> liter (/ 1000)
  // - Unit/Hitung: nilai tetap sesuai satuan pilihan
  const stockNum = Number(stock) || 0;
  const finalStock = stockNum;
  const savedUnit: RawMaterial['unit'] = (inputUnit as RawMaterial['unit']) || 'kg';

  const handleSelectCategory = (newCatId: string) => {
    setCategoryId(newCatId);
    const newCat = categories.find((c) => c.id === newCatId);
    const newGroup = isMaterial ? getCategoryUnitGroup(newCat) : 'count';
    const newUnits = UNIT_GROUP_CONFIG[newGroup].units;
    setInputUnit(newUnits[0].id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const catObj = categories.find((c) => c.id === categoryId) || availableCategories[0];
    const categoryName = catObj ? catObj.name : (isMaterial ? 'Tepung & Gandum' : 'Roti Manis');

    if (isMaterial) {
      const parsedTotalCost = Number(totalCost) || 0;
      const calculatedCostPerUnit = finalStock > 0 ? Math.round(parsedTotalCost / finalStock) : 0;

      if (isEditing && itemToEdit) {
        updateMaterial(itemToEdit.id, {
          name: name.trim() || categoryName,
          category: categoryName,
          categoryId: catObj?.id || categoryId,
          stock: finalStock,
          minStock: Number(minStock) || 1,
          unit: savedUnit,
          costPerUnit: calculatedCostPerUnit,
        });
      } else {
        addNewMaterial(
          {
            name: name.trim() || categoryName,
            category: categoryName,
            categoryId: catObj?.id || categoryId,
            stock: finalStock,
            minStock: Number(minStock) || 1,
            unit: savedUnit,
            costPerUnit: calculatedCostPerUnit,
          },
          parsedTotalCost
        );
      }
    } else {
      if (!name.trim()) return;
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
      <div className="bg-white border-2 border-[#EFE4DA] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#EFE4DA] flex items-center justify-between bg-gradient-to-r from-[#FFFDF9] to-[#FFF3E0]/40">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#FFB300] text-[#3E2723] shadow-xs">
              {isMaterial ? <Boxes className="w-5 h-5" /> : <Croissant className="w-5 h-5" />}
            </span>
            <div>
              <h3 className="font-black text-lg text-[#3E2723]">
                {isEditing ? 'Ubah Rincian Item' : isMaterial ? 'Tambah Stok Bahan Baku' : 'Tambah Varian Roti'}
              </h3>
              <p className="text-xs text-[#8D6E63] font-medium">
                {isMaterial ? 'Catat belanja bahan dapur & simpan pengeluaran kas' : 'Tambah ke daftar etalase Dapoer Mamak'}
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
          {/* Pilihan Kategori */}
          <div>
            <label className="block text-xs font-black text-[#3E2723] mb-1.5">
              Pilihan Kategori {isMaterial ? 'Bahan Baku' : 'Roti'}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-[#FAF7F2] rounded-2xl border border-[#EFE4DA]">
              {availableCategories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCategory(c.id)}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-[#FFB300] bg-[#FFECB3] text-[#3E2723] shadow-xs'
                        : 'border-[#EFE4DA] bg-white text-[#6D4C41] hover:bg-white/80'
                    }`}
                  >
                    <CategoryIcon name={c.iconName} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nama Merek / Barang */}
          <div>
            <label className="block text-xs font-black text-[#3E2723] mb-1.5">
              {isMaterial ? 'Nama Merek / Bahan (Opsional)' : 'Nama Varian Roti'}
            </label>
            <input
              type="text"
              required={!isMaterial}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isMaterial ? 'Contoh: Tepung Cakra Kembar, Ragi Saf-Instant' : 'Contoh: Roti Sisir Pandan Keju'}
              className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none placeholder-[#A1887F]"
            />
          </div>

          {/* Stok Awal & Satuan */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-[#3E2723] mb-1">
                  {isMaterial ? 'Jumlah Stok' : 'Jumlah Stok'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#3E2723] mb-1">
                  Satuan Ukuran
                </label>
                {isMaterial ? (
                  <select
                    value={inputUnit}
                    onChange={(e) => setInputUnit(e.target.value)}
                    className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                  >
                    {availableUnits.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.label}
                      </option>
                    ))}
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

            {/* Konversi Pintar Gram -> Kg / Ml -> Liter */}
            {isMaterial && (
              <div className="flex items-center justify-between text-[10px] text-[#8D6E63] font-semibold px-1">
                <span>Basis Satuan: <strong className="text-[#3E2723]">{groupConfig.label} ({groupConfig.desc})</strong></span>
                <span className="bg-[#FFF3E0] text-[#E65100] px-2 py-0.5 rounded-full font-bold border border-[#FFE0B2]">
                  Pilihan: {inputUnit}
                </span>
              </div>
            )}
          </div>

          {/* Kolom Total Biaya Belanja (Khusus Bahan Baku) */}
          {isMaterial && (
            <div>
              <label className="block text-xs font-black text-[#3E2723] mb-1">
                Total Harga Beli / Belanja (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder="Contoh: 35000 (Boleh kosong jika tidak dicatat kas)"
                className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none"
              />
              {/* Pratinjau Format Rupiah Standar */}
              {totalCost && Number(totalCost) > 0 ? (
                <div className="mt-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between">
                  <span className="text-[11px] text-amber-700 font-medium">Nominal Standar:</span>
                  <span className="font-black text-xs text-amber-900">{formatRupiah(Number(totalCost))}</span>
                </div>
              ) : null}
              <p className="text-[10px] text-[#8D6E63] mt-1 font-medium">
                💡 Total belanja ini otomatis dicatat sebagai pengeluaran kas toko ke database.
              </p>
            </div>
          )}

          {/* Kolom Khusus Produk Roti (jika mode produk) */}
          {!isMaterial && (
            <div className="grid grid-cols-2 gap-3 pt-1">
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
                  Estimasi Modal (Rp)
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
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#EFE4DA] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-[#EFE4DA] text-xs font-black text-[#8D6E63] hover:bg-stone-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FFB300] to-[#FFA000] hover:brightness-105 text-[#3E2723] text-xs font-black shadow-md shadow-[#FFB300]/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Tambahkan Stok'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
