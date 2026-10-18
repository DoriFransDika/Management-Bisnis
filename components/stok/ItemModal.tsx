'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Boxes, Croissant, AlertTriangle, Lock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Category, RawMaterial, FinishedProduct } from '@/types';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import {
  formatRupiah,
  getCategoryUnitGroup,
  UNIT_GROUP_CONFIG,
  UnitGroupType,
  getCategoryMinStock,
  getItemMinStock
} from '@/lib/utils';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'material' | 'product';
  itemToEdit?: RawMaterial | FinishedProduct | null;
  onSuccess?: (msg: string) => void;
}

export function ItemModal({ isOpen, onClose, mode, itemToEdit, onSuccess }: ItemModalProps) {
  const { categories, rawMaterials, finishedProducts, addNewMaterial, updateMaterial, updateProduct, addReadyProductStock } = useStore();

  const isMaterial = mode === 'material';
  const isEditing = Boolean(itemToEdit);

  const availableCategories = categories.filter((c) =>
    isMaterial ? c.type === 'material' : c.type === 'product'
  );

  // Common fields
  const [name, setName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState<number | string>(1);
  const [minStock, setMinStock] = useState<number | string>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Satuan input dinamis sesuai grup kategori (bahan baku). Produk ready dikunci "pcs".
  const [inputUnit, setInputUnit] = useState<string>('kg');

  // Material specific: Total harga beli untuk pencatatan otomatis keuangan
  const [totalCost, setTotalCost] = useState<number | string>('');

  const currentCategory = categories.find((c) => c.id === categoryId) || availableCategories[0];
  const unitGroup: UnitGroupType = isMaterial ? getCategoryUnitGroup(currentCategory) : 'count';
  const groupConfig = UNIT_GROUP_CONFIG[unitGroup];
  const availableUnits = groupConfig.units;

  useEffect(() => {
    setErrorMsg(null);
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategoryId(itemToEdit.categoryId);
      setStock(itemToEdit.stock);
      const effectiveMin = getItemMinStock(itemToEdit, categories, isMaterial ? 1 : 5);
      setMinStock(effectiveMin);

      if ('costPerUnit' in itemToEdit) {
        const cat = categories.find((c) => c.id === itemToEdit.categoryId);
        const grp = getCategoryUnitGroup(cat);
        const validUnits = UNIT_GROUP_CONFIG[grp].units;
        const matched = validUnits.find((u) => u.id === itemToEdit.unit);
        setInputUnit(matched ? matched.id : validUnits[0].id);
        setTotalCost(Math.round(itemToEdit.costPerUnit * itemToEdit.stock) || '');
      }
    } else {
      const initialCat = availableCategories[0];
      const initialGroup = isMaterial ? getCategoryUnitGroup(initialCat) : 'count';
      setName('');
      setCategoryId(initialCat?.id || '');
      setStock(isMaterial ? 1 : '');
      const catMin = getCategoryMinStock(initialCat, isMaterial ? 1 : 5);
      setMinStock(catMin);
      setInputUnit(UNIT_GROUP_CONFIG[initialGroup].units[0].id);
      setTotalCost('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemToEdit, isOpen, mode]);

  const nameTrimmed = name.trim().toLowerCase();

  // Saran nama merek / produk yang sudah pernah diinput (opsional untuk dipilih)
  const suggestions = React.useMemo(() => {
    if (!nameTrimmed || isEditing) return [];
    if (isMaterial) {
      return rawMaterials
        .filter((m) => m.name.toLowerCase().includes(nameTrimmed))
        .slice(0, 6);
    } else {
      return finishedProducts
        .filter((p) => p.name.toLowerCase().includes(nameTrimmed))
        .slice(0, 6);
    }
  }, [isMaterial, nameTrimmed, isEditing, rawMaterials, finishedProducts]);

  // Deteksi kecocokan nama persis untuk menginformasikan akumulasi stok di database
  const matchedExisting = React.useMemo(() => {
    if (!nameTrimmed || isEditing) return null;
    if (isMaterial) {
      return rawMaterials.find(
        (m) => m.name.toLowerCase().trim() === nameTrimmed
      ) || null;
    } else {
      return finishedProducts.find(
        (p) => p.name.toLowerCase().trim() === nameTrimmed
      ) || null;
    }
  }, [isMaterial, nameTrimmed, isEditing, rawMaterials, finishedProducts]);

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
    if (newCat) {
      const catMin = getCategoryMinStock(newCat, isMaterial ? 1 : 5);
      setMinStock(catMin);
      if (isMaterial) {
        const newGroup = getCategoryUnitGroup(newCat);
        const newUnits = UNIT_GROUP_CONFIG[newGroup].units;
        setInputUnit(newUnits[0].id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg(null);
    const catObj = availableCategories.find((c) => c.id === categoryId) || availableCategories[0];
    const categoryName = catObj ? catObj.name : (isMaterial ? 'Tepung & Gandum' : 'Roti Manis');
    const targetCatMin = getCategoryMinStock(catObj, isMaterial ? 1 : 5);

    if (isMaterial) {
      if (!name.trim()) {
        setErrorMsg('Nama merek atau jenis bahan baku wajib diisi (contoh: Tepung Segitiga Biru).');
        return;
      }
      const parsedStock = Number(stock);
      if (isNaN(parsedStock) || parsedStock <= 0) {
        setErrorMsg('Jumlah stok bahan harus angka lebih dari 0.');
        return;
      }

      const parsedTotalCost = Number(totalCost) || 0;
      const calculatedCostPerUnit = finalStock > 0 ? Math.round(parsedTotalCost / finalStock) : 0;

      if (isEditing && itemToEdit) {
        updateMaterial(itemToEdit.id, {
          name: name.trim(),
          category: categoryName,
          categoryId: catObj?.id || categoryId,
          stock: finalStock,
          minStock: targetCatMin,
          unit: savedUnit,
          costPerUnit: calculatedCostPerUnit,
        });
        onSuccess?.(`Bahan baku ${name.trim()} berhasil diperbarui.`);
      } else {
        const res = addNewMaterial(
          {
            name: name.trim(),
            category: categoryName,
            categoryId: catObj?.id || categoryId,
            stock: finalStock,
            minStock: targetCatMin,
            unit: savedUnit,
            costPerUnit: calculatedCostPerUnit,
          },
          parsedTotalCost
        );
        onSuccess?.(res?.message || `Bahan baku ${name.trim()} berhasil ditambahkan.`);
      }
    } else {
      // ===== PRODUK READY: satuan dikunci "pcs", batas kritis otomatis mengikuti kategori =====
      const qty = Number(stock);
      if (!catObj) {
        setErrorMsg('Belum ada kategori produk. Buat dulu di menu Kelola Kategori.');
        return;
      }
      if (!name.trim()) {
        setErrorMsg('Nama produk wajib diisi.');
        return;
      }
      if (!Number.isInteger(qty) || qty < (isEditing ? 0 : 1)) {
        setErrorMsg(isEditing ? 'Jumlah stok harus angka bulat ≥ 0.' : 'Jumlah stok harus angka bulat minimal 1 pcs.');
        return;
      }

      if (isEditing && itemToEdit) {
        const duplicate = finishedProducts.find(
          (p) =>
            p.id !== itemToEdit.id &&
            p.categoryId === catObj.id &&
            p.name.toLowerCase().trim() === name.trim().toLowerCase()
        );
        if (duplicate) {
          setErrorMsg(`Produk "${duplicate.name}" sudah ada di kategori ${catObj.name}.`);
          return;
        }
        updateProduct(itemToEdit.id, {
          name: name.trim(),
          category: catObj.name,
          categoryId: catObj.id,
          stock: qty,
          minStock: targetCatMin,
          unit: 'pcs',
        });
        onSuccess?.(`Produk ${name.trim()} berhasil diperbarui.`);
      } else {
        const res = addReadyProductStock({
          categoryId: catObj.id,
          name,
          stock: qty,
          minStock: targetCatMin,
        });
        if (!res.success) {
          setErrorMsg(res.message);
          return;
        }
        onSuccess?.(res.message);
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
                {isEditing
                  ? isMaterial ? 'Ubah Rincian Bahan' : 'Ubah Produk Ready'
                  : isMaterial ? 'Tambah Stok Bahan Baku' : 'Input Stok Produk Ready'}
              </h3>
              <p className="text-xs text-[#8D6E63] font-medium">
                {isMaterial ? 'Catat belanja bahan dapur & simpan pengeluaran kas' : 'Stok keluar otomatis saat transaksi di Keuangan Toko'}
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
              Pilihan Kategori {isMaterial ? 'Bahan Baku' : 'Produk'}
            </label>
            {availableCategories.length === 0 ? (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-900">
                Belum ada kategori {isMaterial ? 'bahan baku' : 'produk'}. Tambahkan dulu lewat menu{' '}
                <strong>Kelola Kategori</strong>.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-[#FAF7F2] rounded-2xl border border-[#EFE4DA]">
                {availableCategories.map((c) => {
                  const isSelected = categoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCategory(c.id)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${isSelected
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
            )}
          </div>

          {/* Nama Merek / Barang */}
          <div className="relative">
            <label className="block text-xs font-black text-[#3E2723] mb-1.5 flex items-center justify-between">
              <span>{isMaterial ? 'Nama Merek / Bahan' : 'Nama Produk'} <span className="text-rose-600">*</span></span>
              {isMaterial ? (
                <span className="text-[10px] text-[#8D6E63] font-medium">Misal: Cakra Kembar, Segitiga Biru, Gulaku</span>
              ) : (
                <span className="text-[10px] text-[#8D6E63] font-medium">Misal: Donat Kentang, Roti Coklat Keju</span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder={isMaterial ? 'Contoh: Tepung Segitiga Biru, Ragi Saf-Instant' : 'Contoh: Roti Coklat Keju, Donat Kentang'}
                className="w-full bg-[#FAF7F2] border-2 border-[#EFE4DA] focus:border-[#FFB300] rounded-2xl px-4 py-2.5 text-xs text-[#3E2723] font-bold focus:outline-none placeholder-[#A1887F]"
              />

              {/* Suggestions Dropdown for existing items (both material and ready product) */}
              {showSuggestions && suggestions.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowSuggestions(false)}
                  />
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-[#FFD54F] rounded-2xl shadow-xl z-30 overflow-hidden divide-y divide-[#EFE4DA] animate-in fade-in zoom-in-95 duration-100 max-h-56 overflow-y-auto">
                    <div className="px-3 py-1.5 bg-[#FFF8E1] text-[10px] font-black text-[#8D6E63] flex items-center justify-between">
                      <span>PILIH SARAN {isMaterial ? 'MEREK' : 'PRODUK'} (OPSIONAL)</span>
                      <span className="text-[#BCAAA4]">Klik untuk pilih</span>
                    </div>
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setName(item.name);
                          if (item.categoryId) setCategoryId(item.categoryId);
                          if (isMaterial && 'unit' in item && item.unit) {
                            setInputUnit(item.unit);
                          }
                          setShowSuggestions(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-[#FFF3E0] flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-black text-[#3E2723] group-hover:text-[#E65100]">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-[#8D6E63]">
                            Kategori: {item.category}
                          </p>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Stok: {item.stock} {'unit' in item ? item.unit : 'pcs'}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Indikator Ramah jika nama yang dimasukkan sama persis */}
            {matchedExisting && (
              <div className="mt-2 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-sm">✨</span>
                  <span>
                    {isMaterial
                      ? `Merek sudah ada (${matchedExisting.name}). Jumlah akan diakumulasikan ke stok aktif.`
                      : `Produk sudah ada (${matchedExisting.name}). Jumlah akan diakumulasikan ke stok aktif.`}
                  </span>
                </div>
                <span className="font-black text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-lg shrink-0 text-[10px]">
                  Sisa: {matchedExisting.stock} {'unit' in matchedExisting ? matchedExisting.unit : 'pcs'}
                </span>
              </div>
            )}
          </div>

          {/* Stok Awal & Satuan */}
          {isMaterial ? (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#3E2723] mb-1">
                    Jumlah Stok
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
                </div>
              </div>

              {/* Konversi Pintar Gram -> Kg / Ml -> Liter */}
              <div className="flex items-center justify-between text-[10px] text-[#8D6E63] font-semibold px-1">
                <span>Basis Satuan: <strong className="text-[#3E2723]">{groupConfig.label} ({groupConfig.desc})</strong></span>
                <span className="bg-[#FFF3E0] text-[#E65100] px-2 py-0.5 rounded-full font-bold border border-[#FFE0B2]">
                  Pilihan: {inputUnit}
                </span>
              </div>
            </div>
          ) : (
            /* Produk Ready: Jumlah + satuan "pcs" terkunci (Batas warning otomatis terkunci di 5 pcs) */
            <div className="space-y-1.5">
              <div>
                <label htmlFor="ready-product-qty" className="block text-xs font-black text-[#3E2723] mb-1">
                  {isEditing ? 'Jumlah Stok Saat Ini' : 'Jumlah Stok Masuk'}
                </label>
                <div className="flex items-stretch rounded-2xl border-2 border-[#EFE4DA] focus-within:border-[#FFB300] bg-[#FAF7F2] overflow-hidden">
                  <input
                    id="ready-product-qty"
                    type="number"
                    inputMode="numeric"
                    min={isEditing ? 0 : 1}
                    step="1"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    className="flex-1 min-w-0 bg-transparent px-3 py-2 text-xs text-[#3E2723] font-bold focus:outline-none"
                  />
                  <span
                    className="px-3 flex items-center gap-1 bg-[#3E2723] text-[#FFB300] text-[11px] font-black select-none"
                    title="Satuan produk ready dikunci pcs"
                  >
                    <Lock className="w-3 h-3" />
                    pcs
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[#8D6E63] font-medium">
                {isEditing
                  ? '💡 Ubah angka stok jika ingin mengoreksi jumlah fisik di etalase.'
                  : '💡 Jika produk dengan nama & kategori yang sama sudah ada, stok akan ditambahkan ke produk tersebut.'}
              </p>
            </div>
          )}

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

          {/* Pesan Validasi */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
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
