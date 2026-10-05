export interface Category {
  id: string;
  name: string;
  type: 'material' | 'product'; // Bahan Baku vs Produk Jadi
  iconName: string; // 'Wheat' | 'Croissant' | 'Cake' | 'Egg' | 'Milk' | 'Package' | 'Sparkles' | 'Flame' | 'Boxes' | 'Coffee' | 'Heart'
  bgColor: string; // Tailwind class or hex
  textColor: string;
  description?: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  categoryId: string;
  category: string; // Nama kategori untuk display
  stock: number;
  unit: 'kg' | 'gr' | 'butir' | 'liter' | 'ml' | 'pack' | 'pcs';
  minStock: number;
  costPerUnit: number;
  updatedAt: string;
}

export interface RecipeIngredient {
  materialId: string;
  amount: number;
  unit: string;
}

export interface FinishedProduct {
  id: string;
  name: string;
  categoryId: string;
  category: string; // Nama kategori untuk display
  stock: number;
  unit: 'pcs' | 'box' | 'loyang';
  sellingPrice: number;
  costPrice: number;
  minStock: number;
  batchYield: number;
  recipe: RecipeIngredient[];
  imageUrl?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  paymentMethod: 'Tunai' | 'QRIS / Transfer';
}

export interface ProductionLog {
  id: string;
  date: string;
  productId: string;
  productName: string;
  batches: number;
  producedQty: number;
  totalHPP: number;
  status: 'completed' | 'draft';
  materialsUsed: {
    materialId: string;
    materialName: string;
    amount: number;
    unit: string;
  }[];
}

export interface BusinessSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  readyProductsCount: number;
  lowStockItemsCount: number;
}

export interface ActivityNotification {
  id: string;
  type: 'low_stock' | 'production' | 'sale' | 'expense';
  title: string;
  message: string;
  time: string;
  severity: 'warning' | 'success' | 'info';
}
