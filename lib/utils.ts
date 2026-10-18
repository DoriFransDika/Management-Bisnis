import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number | string): string {
  const num = typeof value === 'string' ? Number(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num) || num === 0) return 'Rp. 0,00';
  const isNegative = num < 0;
  const absNum = Math.abs(Math.round(num));
  const parts = absNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${isNegative ? '-' : ''}Rp. ${parts},00`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function cleanTrxDescription(desc: string): string {
  return (desc || '')
    .replace(/\s*\[ref:[^\]]+\]/g, '')
    .replace(/\s*\[prod:[^\]]+\]/g, '')
    .trim();
}

export function extractTrxMaterialRef(desc: string): string | null {
  const match = (desc || '').match(/\[ref:([^\]]+)\]/);
  return match ? match[1] : null;
}

/**
 * Tag referensi produk jadi pada transaksi penjualan: `[prod:<productId>:<qty>]`.
 * Dipakai untuk mengembalikan stok saat transaksi penjualan dihapus.
 */
export function buildTrxProductRef(productId: string, qty: number): string {
  return `[prod:${productId}:${qty}]`;
}

export function extractTrxProductRef(desc: string): { productId: string; qty: number } | null {
  const match = (desc || '').match(/\[prod:([^\]:]+):(\d+(?:\.\d+)?)\]/);
  if (!match) return null;
  return { productId: match[1], qty: Number(match[2]) };
}

export type UnitGroupType = 'weight' | 'volume' | 'count';

export const UNIT_GROUP_CONFIG = {
  weight: {
    label: 'Berat',
    desc: 'Default basis: gram / kg',
    baseUnit: 'kg',
    units: [
      { id: 'kg', label: 'kg (Kilogram)' },
      { id: 'gr', label: 'gram (gr)' },
    ],
  },
  volume: {
    label: 'Volume',
    desc: 'Default basis: Liter / ml',
    baseUnit: 'liter',
    units: [
      { id: 'liter', label: 'Liter (L)' },
      { id: 'ml', label: 'ml (Mililiter)' },
    ],
  },
  count: {
    label: 'Unit / Hitung',
    desc: 'Default basis: pcs / kaleng / botol / kotak',
    baseUnit: 'pcs',
    units: [
      { id: 'pcs', label: 'pcs' },
      { id: 'kaleng', label: 'kaleng' },
      { id: 'botol', label: 'botol' },
      { id: 'kotak', label: 'kotak' },
      { id: 'pack', label: 'pack' },
      { id: 'butir', label: 'butir' },
    ],
  },
} as const;

export function getCategoryUnitGroup(
  cat?: { unitGroup?: UnitGroupType; description?: string; name?: string } | null
): UnitGroupType {
  if (!cat) return 'weight';
  if (cat.unitGroup) return cat.unitGroup;
  const match = cat.description?.match(/\[unit:(weight|volume|count)\]/);
  if (match) return match[1] as UnitGroupType;
  const name = (cat.name || '').toLowerCase();
  if (
    name.includes('cair') ||
    name.includes('susu') ||
    name.includes('minyak') ||
    name.includes('air') ||
    name.includes('sirup') ||
    name.includes('volume')
  ) {
    return 'volume';
  }
  if (
    name.includes('telur') ||
    name.includes('kemasan') ||
    name.includes('pack') ||
    name.includes('kotak') ||
    name.includes('box') ||
    name.includes('topping') ||
    name.includes('cup') ||
    name.includes('kaleng') ||
    name.includes('botol') ||
    name.includes('unit')
  ) {
    return 'count';
  }
  return 'weight';
}

export function getCategoryMinStock(
  cat?: { minStock?: number; description?: string } | null
): number {
  if (!cat) return 5;
  if (cat.minStock !== undefined && !isNaN(Number(cat.minStock))) {
    return Number(cat.minStock);
  }
  const match = cat.description?.match(/\[min:([0-9.]+)\]/);
  if (match) return Number(match[1]);
  return 5;
}

export function cleanCategoryDescription(desc?: string): string {
  return (desc || '')
    .replace(/\s*\[unit:[^\]]+\]/g, '')
    .replace(/\s*\[min:[^\]]+\]/g, '')
    .trim();
}

export function getCategoryDisplayUnit(
  cat?: { unitGroup?: UnitGroupType; description?: string; name?: string } | null,
  materialUnit?: string
): string {
  if (materialUnit) return materialUnit;
  const grp = getCategoryUnitGroup(cat);
  if (grp === 'volume') return 'liter';
  if (grp === 'count') return 'pcs';
  return 'kg';
}

export function getTransactionQuantity(trx: {
  type?: 'income' | 'expense';
  description?: string;
  quantity?: string;
}): string {
  if (trx.quantity && trx.quantity.trim()) {
    return trx.quantity.trim();
  }
  const desc = trx.description || '';

  // 1. Ekstrak pola kurung eksplisit: e.g. (+40 pcs), (-2 kg), (+14 kg)
  const bracketMatch = desc.match(/\(([+-]?\d+(?:[.,]\d+)?\s*[a-zA-Z]+)\)/i);
  if (bracketMatch) {
    return bracketMatch[1].trim();
  }

  // 2. Ekstrak pola umum: e.g. "Penjualan 40 pcs", "Pesanan 50 Snack Box", "Refill 5 Tabung Gas", "Beli 2 kg"
  const unitRegex = /(?:penjualan|pesanan|beli|refill|potong|tambah|kurang)?\s*(\d+(?:[.,]\d+)?)\s*(pcs|kg|gr|gram|liter|l|ml|box|pack|butir|loyang|kaleng|botol|kotak|tabung|snack\s*box)/i;
  const match = desc.match(unitRegex);
  if (match) {
    const qty = match[1];
    const unit = match[2];
    const prefix = trx.type === 'income' ? '+' : '';
    return `${prefix}${qty} ${unit}`.trim();
  }

  return '-';
}

export function getTransactionItemName(
  trx: { description?: string; category?: string; type?: 'income' | 'expense' },
  products: { id?: string; name: string; category?: string }[] = [],
  materials: { id?: string; name: string; category?: string }[] = []
): string {
  const desc = trx.description || '';
  const cat = (trx.category || '').trim();

  // 1. Cek tag referensi produk jadi: [prod:<id>:<qty>]
  const prodRef = extractTrxProductRef(desc);
  if (prodRef) {
    const matched = products.find((p) => p.id === prodRef.productId);
    if (matched) return matched.name;
  }

  // 2. Cek tag referensi bahan baku: [ref:<id>]
  const matRef = extractTrxMaterialRef(desc);
  if (matRef) {
    const matched = materials.find((m) => m.id === matRef);
    if (matched) return matched.name;
  }

  // 3. Cek kecocokan nama produk jadi yang terdaftar
  const matchedProd = products.find(
    (p) => p.name && p.name.trim().length > 1 && desc.toLowerCase().includes(p.name.toLowerCase().trim())
  );
  if (matchedProd) return matchedProd.name;

  // 4. Cek kecocokan nama bahan baku yang terdaftar
  const matchedMat = materials.find(
    (m) => m.name && m.name.trim().length > 1 && desc.toLowerCase().includes(m.name.toLowerCase().trim())
  );
  if (matchedMat) return matchedMat.name;

  // 5. Cek kurung nama bahan baku spesifik, misal: "Belanja Bahan: Gula (gula abc) (+1 kg)" -> "gula abc"
  const bracketMatches = Array.from(desc.matchAll(/\(([^)]+)\)/g));
  for (const match of bracketMatches) {
    const inside = match[1].trim();
    if (!/^[+-]?\d/.test(inside)) {
      return inside;
    }
  }

  // 6. Jika kategori transaksi adalah kategori produk spesifik (bukan kategori umum pembukuan)
  const genericCategories = [
    'penjualan toko',
    'penjualan umum',
    'penjualan',
    'belanja bahan baku',
    'belanja',
    'operasional dapur',
    'biaya operasional',
    'pesanan khusus / katering',
    'lainnya',
    'item toko',
  ];
  if (cat && !genericCategories.includes(cat.toLowerCase())) {
    return cat;
  }

  // 7. Jika ada awalan aksi transaksi: "Penjualan <Nama Produk>" atau "Belanja <Nama Bahan>"
  const actionMatch = cleanTrxDescription(desc).match(
    /^(?:penjualan|pembelian|belanja|restock|kulakan|pesanan)\s+(.+)$/i
  );
  if (actionMatch && actionMatch[1].trim()) {
    return actionMatch[1].trim();
  }

  // 8. Fallback ke category jika ada
  if (cat && cat.toLowerCase() !== 'lainnya' && cat.toLowerCase() !== 'penjualan toko') {
    return cat;
  }

  return cat || 'Produk Toko';
}


