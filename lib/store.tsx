'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Category,
  RawMaterial,
  FinishedProduct,
  Transaction,
  ActivityNotification,
  BusinessSummary
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_RAW_MATERIALS,
  INITIAL_FINISHED_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS
} from './mock-data';

interface UserSession {
  email: string;
  name: string;
  role: string;
  isAuthenticated: boolean;
}

interface StoreContextType {
  user: UserSession;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  categories: Category[];
  rawMaterials: RawMaterial[];
  finishedProducts: FinishedProduct[];
  transactions: Transaction[];
  notifications: ActivityNotification[];
  summary: BusinessSummary;
  // Category CRUD
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updated: Partial<Category>) => void;
  deleteCategory: (id: string) => { success: boolean; message: string };
  // Business logic actions
  produceProduct: (productId: string, batches: number) => { success: boolean; message: string };
  addRawMaterialStock: (materialId: string, amount: number, totalCost: number) => void;
  recordSale: (productId: string, qty: number, paymentMethod: 'Tunai' | 'QRIS / Transfer', customPrice?: number) => { success: boolean; message: string };
  // Item CRUD & Quick Actions
  addNewMaterial: (material: Omit<RawMaterial, 'id' | 'updatedAt'>) => void;
  updateMaterial: (id: string, updated: Partial<RawMaterial>) => void;
  deleteMaterial: (id: string) => void;
  quickAdjustMaterialStock: (id: string, delta: number) => void;
  addNewProduct: (product: Omit<FinishedProduct, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<FinishedProduct>) => void;
  deleteProduct: (id: string) => void;
  quickAdjustProductStock: (id: string, delta: number) => void;
  addTransaction: (trx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  markNotificationRead: (id: string) => void;
  resetAllData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'dapurmamak_user',
  CATEGORIES: 'dapurmamak_categories',
  MATERIALS: 'dapurmamak_materials',
  PRODUCTS: 'dapurmamak_products',
  TRANSACTIONS: 'dapurmamak_transactions',
  NOTIFICATIONS: 'dapurmamak_notifications',
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>({
    email: '',
    name: 'Mamak Chef & Owner',
    role: 'Owner',
    isAuthenticated: false,
  });

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(INITIAL_RAW_MATERIALS);
  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>(INITIAL_FINISHED_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<ActivityNotification[]>(INITIAL_NOTIFICATIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (storedCats) setCategories(JSON.parse(storedCats));

      const storedMats = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      if (storedMats) setRawMaterials(JSON.parse(storedMats));

      const storedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (storedProds) setFinishedProducts(JSON.parse(storedProds));

      const storedTrx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (storedTrx) setTransactions(JSON.parse(storedTrx));

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    } catch (e) {
      console.error('Error reading localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) { console.error(e); }
  }, [categories, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(rawMaterials));
    } catch (e) { console.error(e); }
  }, [rawMaterials, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(finishedProducts));
    } catch (e) { console.error(e); }
  }, [finishedProducts, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) { console.error(e); }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) { console.error(e); }
  }, [notifications, isLoaded]);

  // Auth methods
  const login = (email: string, pass: string): boolean => {
    if (
      email.trim().toLowerCase() === 'dapurmamak@gmail.com' &&
      pass.trim() === 'bismillah laku'
    ) {
      const session: UserSession = {
        email: 'dapurmamak@gmail.com',
        name: 'Mamak Chef & Owner',
        role: 'Owner Utama',
        isAuthenticated: true,
      };
      setUser(session);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session));
      return true;
    }
    return false;
  };

  const logout = () => {
    const session: UserSession = {
      email: '',
      name: '',
      role: '',
      isAuthenticated: false,
    };
    setUser(session);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  // Reset to default
  const resetAllData = () => {
    setCategories(INITIAL_CATEGORIES);
    setRawMaterials(INITIAL_RAW_MATERIALS);
    setFinishedProducts(INITIAL_FINISHED_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.MATERIALS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  };

  // CATEGORY CRUD
  const addCategory = (cat: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newCat = { ...c, ...updated };
          // If name changed, sync display name in materials and products
          if (updated.name && updated.name !== c.name) {
            setRawMaterials((mats) =>
              mats.map((m) => (m.categoryId === id ? { ...m, category: updated.name! } : m))
            );
            setFinishedProducts((prods) =>
              prods.map((p) => (p.categoryId === id ? { ...p, category: updated.name! } : p))
            );
          }
          return newCat;
        }
        return c;
      })
    );
  };

  const deleteCategory = (id: string): { success: boolean; message: string } => {
    // Check if category is used
    const usedInMat = rawMaterials.some((m) => m.categoryId === id);
    const usedInProd = finishedProducts.some((p) => p.categoryId === id);
    if (usedInMat || usedInProd) {
      return {
        success: false,
        message: 'Kategori ini masih digunakan oleh bahan baku atau produk jadi. Pindahkan item terlebih dahulu!',
      };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return { success: true, message: 'Kategori berhasil dihapus!' };
  };

  // Logika Produksi Roti
  const produceProduct = (productId: string, batches: number): { success: boolean; message: string } => {
    if (batches <= 0) {
      return { success: false, message: 'Jumlah batch harus lebih dari 0!' };
    }

    const product = finishedProducts.find((p) => p.id === productId);
    if (!product) {
      return { success: false, message: 'Produk roti tidak ditemukan!' };
    }

    for (const item of product.recipe) {
      const mat = rawMaterials.find((m) => m.id === item.materialId);
      const needed = item.amount * batches;
      if (!mat) {
        return { success: false, message: `Bahan baku id ${item.materialId} tidak ditemukan di sistem!` };
      }
      if (mat.stock < needed) {
        return {
          success: false,
          message: `Stok ${mat.name} tidak cukup! Butuh ${needed} ${item.unit}, tersisa ${mat.stock} ${mat.unit}.`,
        };
      }
    }

    const updatedMaterials = rawMaterials.map((mat) => {
      const recipeItem = product.recipe.find((r) => r.materialId === mat.id);
      if (recipeItem) {
        const consumed = recipeItem.amount * batches;
        const newStock = Math.max(0, Number((mat.stock - consumed).toFixed(2)));
        return {
          ...mat,
          stock: newStock,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
      return mat;
    });

    const addedOutput = batches * product.batchYield;
    const updatedProducts = finishedProducts.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          stock: p.stock + addedOutput,
        };
      }
      return p;
    });

    setRawMaterials(updatedMaterials);
    setFinishedProducts(updatedProducts);

    const newNotif: ActivityNotification = {
      id: `notif-${Date.now()}`,
      type: 'production',
      title: `Baking Selesai: +${addedOutput} ${product.unit} ${product.name}`,
      message: `Berhasil memproduksi ${batches} batch (${addedOutput} ${product.unit}). Bahan dapur telah dipotong otomatis.`,
      time: 'Baru saja',
      severity: 'success',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return {
      success: true,
      message: `Sukses! Berhasil memanggang ${addedOutput} ${product.unit} ${product.name}. Etalase bertambah!`,
    };
  };

  const addRawMaterialStock = (materialId: string, amount: number, totalCost: number) => {
    const mat = rawMaterials.find((m) => m.id === materialId);
    if (!mat) return;

    const newStock = Number((mat.stock + amount).toFixed(2));
    const newCostPerUnit = amount > 0 && totalCost > 0 ? Math.round(totalCost / amount) : mat.costPerUnit;

    setRawMaterials((prev) =>
      prev.map((m) => (m.id === materialId ? { ...m, stock: newStock, costPerUnit: newCostPerUnit, updatedAt: new Date().toISOString().split('T')[0] } : m))
    );

    if (totalCost > 0) {
      const newTrx: Transaction = {
        id: `trx-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: 'Belanja Bahan Baku',
        amount: totalCost,
        description: `Belanja Restock ${mat.name} (+${amount} ${mat.unit})`,
        paymentMethod: 'Tunai',
      };
      setTransactions((prev) => [newTrx, ...prev]);
    }

    const newNotif: ActivityNotification = {
      id: `notif-${Date.now()}`,
      type: 'expense',
      title: `Restock Bahan: ${mat.name}`,
      message: `Stok bertambah +${amount} ${mat.unit}. Total belanja Rp ${totalCost.toLocaleString('id-ID')}.`,
      time: 'Baru saja',
      severity: 'info',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const recordSale = (
    productId: string,
    qty: number,
    paymentMethod: 'Tunai' | 'QRIS / Transfer',
    customPrice?: number
  ): { success: boolean; message: string } => {
    const prod = finishedProducts.find((p) => p.id === productId);
    if (!prod) return { success: false, message: 'Produk tidak ditemukan!' };
    if (prod.stock < qty) {
      return { success: false, message: `Stok etalase tidak cukup! Hanya tersedia ${prod.stock} ${prod.unit}.` };
    }

    const price = customPrice || prod.sellingPrice;
    const totalRevenue = price * qty;

    setFinishedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock - qty } : p))
    );

    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: 'Penjualan Toko',
      amount: totalRevenue,
      description: `Penjualan ${qty} ${prod.unit} ${prod.name}`,
      paymentMethod,
    };
    setTransactions((prev) => [newTrx, ...prev]);

    const newNotif: ActivityNotification = {
      id: `notif-${Date.now()}`,
      type: 'sale',
      title: `Penjualan Kasir: Rp ${totalRevenue.toLocaleString('id-ID')}`,
      message: `${qty}x ${prod.name} terjual via ${paymentMethod}.`,
      time: 'Baru saja',
      severity: 'success',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return {
      success: true,
      message: `Penjualan ${qty} ${prod.unit} berhasil dicatat! Pemasukan +Rp ${totalRevenue.toLocaleString('id-ID')}.`,
    };
  };

  const addNewMaterial = (mat: Omit<RawMaterial, 'id' | 'updatedAt'>) => {
    const newEntry: RawMaterial = {
      ...mat,
      id: `mat-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setRawMaterials((prev) => [newEntry, ...prev]);
  };

  const updateMaterial = (id: string, updated: Partial<RawMaterial>) => {
    setRawMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated, updatedAt: new Date().toISOString().split('T')[0] } : m))
    );
  };

  const deleteMaterial = (id: string) => {
    setRawMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const quickAdjustMaterialStock = (id: string, delta: number) => {
    setRawMaterials((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newStock = Math.max(0, Number((m.stock + delta).toFixed(2)));
          return {
            ...m,
            stock: newStock,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return m;
      })
    );
  };

  const addNewProduct = (prod: Omit<FinishedProduct, 'id'>) => {
    const newEntry: FinishedProduct = {
      ...prod,
      id: `prod-${Date.now()}`,
    };
    setFinishedProducts((prev) => [newEntry, ...prev]);
  };

  const updateProduct = (id: string, updated: Partial<FinishedProduct>) => {
    setFinishedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setFinishedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const quickAdjustProductStock = (id: string, delta: number) => {
    setFinishedProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
  };

  const addTransaction = (trx: Omit<Transaction, 'id'>) => {
    const newEntry: Transaction = {
      ...trx,
      id: `trx-${Date.now()}`,
    };
    setTransactions((prev) => [newEntry, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const readyProductsCount = finishedProducts.reduce((sum, p) => sum + p.stock, 0);

  const lowStockMaterials = rawMaterials.filter((m) => m.stock <= m.minStock).length;
  const lowStockProducts = finishedProducts.filter((p) => p.stock <= p.minStock).length;
  const lowStockItemsCount = lowStockMaterials + lowStockProducts;

  const summary: BusinessSummary = {
    totalIncome,
    totalExpense,
    netProfit,
    readyProductsCount,
    lowStockItemsCount,
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        login,
        logout,
        categories,
        rawMaterials,
        finishedProducts,
        transactions,
        notifications,
        summary,
        addCategory,
        updateCategory,
        deleteCategory,
        produceProduct,
        addRawMaterialStock,
        recordSale,
        addNewMaterial,
        updateMaterial,
        deleteMaterial,
        quickAdjustMaterialStock,
        addNewProduct,
        updateProduct,
        deleteProduct,
        quickAdjustProductStock,
        addTransaction,
        deleteTransaction,
        markNotificationRead,
        resetAllData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
