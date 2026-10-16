'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ShoppingBag, Boxes, Calendar, PackageCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatRupiah, formatNumber, getCategoryUnitGroup, UNIT_GROUP_CONFIG, UnitGroupType } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Warm Bakery Curated Palette (Wood Brown, Warm Amber, Honey, Dusty Berry, Soft Matcha)
const WARM_BAKERY_COLORS = [
  '#E65100', // Cinnamon / Caramel
  '#FFB300', // Honey Gold
  '#D81B60', // Dusty Berry Rose
  '#5D4037', // Roasted Crust / Wood Brown
  '#2E7D32', // Pandan / Matcha Green
  '#F57C00', // Golden Warm Amber
  '#8E24AA', // Sweet Taro / Plum
  '#0288D1', // Vanilla Butter Blue
  '#8D6E63', // Soft Mocha
  '#C2185B', // Deep Strawberry Rose
  '#4E342E', // Dark Chocolate
  '#795548', // Toasted Wheat
];

type ChartType = 'sales' | 'materials' | 'products';
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'all';
type InventoryDimension = 'all' | 'weight' | 'volume' | 'count';

export function SalesChart() {
  const [mounted, setMounted] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('sales');
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [inventoryDimension, setInventoryDimension] = useState<InventoryDimension>('all');

  const { finishedProducts, rawMaterials, transactions, categories } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // -------------------------------------------------------------
  // 1. DATA SLICE FOR SALES (PENJUALAN) DARI SUPABASE TRANSAKSI
  // -------------------------------------------------------------
  const salesPieData = useMemo(() => {
    if (chartType !== 'sales') return [];

    // Filter only income transactions
    const incomeTransactions = transactions.filter((t) => t.type === 'income');

    // Filter by time range
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const filtered = incomeTransactions.filter((trx) => {
      if (timeRange === 'all') return true;
      if (timeRange === 'daily') return trx.date === todayStr;

      try {
        const trxDate = new Date(trx.date);
        const diffDays = (now.getTime() - trxDate.getTime()) / (1000 * 3600 * 24);
        if (timeRange === 'weekly') return diffDays <= 7;
        if (timeRange === 'monthly') return diffDays <= 30;
      } catch {
        return true;
      }
      return true;
    });

    // Group sales by matched Product Name or Transaction Category
    const map = new Map<string, { value: number; count: number; category: string }>();

    filtered.forEach((trx) => {
      const matchedProd = finishedProducts.find((p) =>
        trx.description.toLowerCase().includes(p.name.toLowerCase())
      );

      const label = matchedProd ? matchedProd.name : trx.category || 'Penjualan Reguler';
      const cat = matchedProd ? matchedProd.category : 'Penjualan Toko';

      const current = map.get(label) || { value: 0, count: 0, category: cat };
      current.value += trx.amount;
      current.count += 1;
      map.set(label, current);
    });

    if (map.size === 0 && filtered.length === 0 && incomeTransactions.length > 0 && timeRange !== 'daily') {
      incomeTransactions.forEach((trx) => {
        const matchedProd = finishedProducts.find((p) =>
          trx.description.toLowerCase().includes(p.name.toLowerCase())
        );
        const label = matchedProd ? matchedProd.name : trx.category;
        const cat = matchedProd ? matchedProd.category : 'Penjualan Toko';

        const current = map.get(label) || { value: 0, count: 0, category: cat };
        current.value += trx.amount;
        current.count += 1;
        map.set(label, current);
      });
    }

    const items = Array.from(map.entries())
      .map(([name, data], idx) => ({
        id: `sales-${idx}`,
        name,
        category: data.category,
        value: data.value,
        count: data.count,
        unitDisplay: 'Rp',
        color: WARM_BAKERY_COLORS[idx % WARM_BAKERY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    return items;
  }, [chartType, transactions, timeRange, finishedProducts]);

  // -------------------------------------------------------------
  // 2. DATA SLICE FOR BAHAN BAKU (READY SAJA, STOK > 0)
  // -------------------------------------------------------------
  const materialsPieData = useMemo(() => {
    if (chartType !== 'materials') return [];

    // Filter HANYA bahan baku yang READY (stok > 0), batalkan yang habis
    const readyMaterials = rawMaterials.filter((m) => Number(m.stock) > 0);

    const categoryMap = new Map<
      string,
      { totalStock: number; totalCostValue: number; itemCount: number; unitGroup: UnitGroupType; unitDisplay: string }
    >();

    readyMaterials.forEach((m) => {
      const catName = m.category || 'Bahan Baku Lainnya';
      const catObj = categories.find(
        (c) => c.id === m.categoryId || c.name.toLowerCase().trim() === catName.toLowerCase().trim()
      );
      const group = getCategoryUnitGroup(catObj);
      const groupConfig = UNIT_GROUP_CONFIG[group];
      const baseUnit = group === 'count' ? (m.unit || 'pcs') : groupConfig.baseUnit;

      if (inventoryDimension !== 'all' && group !== inventoryDimension) {
        return;
      }

      const current = categoryMap.get(catName) || {
        totalStock: 0,
        totalCostValue: 0,
        itemCount: 0,
        unitGroup: group,
        unitDisplay: baseUnit,
      };

      current.totalStock += Number(m.stock) || 0;
      current.totalCostValue += Math.round((Number(m.stock) || 0) * (Number(m.costPerUnit) || 0));
      current.itemCount += 1;
      categoryMap.set(catName, current);
    });

    const items = Array.from(categoryMap.entries())
      .map(([catName, data], idx) => ({
        id: `mat-cat-${idx}`,
        name: catName,
        category: `Grup ${UNIT_GROUP_CONFIG[data.unitGroup].label}`,
        value: Number(data.totalStock.toFixed(2)),
        totalValueRp: data.totalCostValue,
        itemCount: data.itemCount,
        unitDisplay: data.unitDisplay,
        color: WARM_BAKERY_COLORS[idx % WARM_BAKERY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    return items;
  }, [chartType, rawMaterials, categories, inventoryDimension]);

  // -------------------------------------------------------------
  // 3. DATA SLICE FOR PRODUK JADI (READY SAJA, STOK > 0)
  // -------------------------------------------------------------
  const productsPieData = useMemo(() => {
    if (chartType !== 'products') return [];

    // Filter HANYA produk jadi yang READY (stok > 0), batalkan yang habis
    const readyProducts = finishedProducts.filter((p) => Number(p.stock) > 0);

    const items = readyProducts
      .map((p, idx) => ({
        id: `prod-${p.id}`,
        name: p.name,
        category: p.category,
        value: Number(p.stock) || 0,
        unitDisplay: p.unit || 'pcs',
        color: WARM_BAKERY_COLORS[idx % WARM_BAKERY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    return items;
  }, [chartType, finishedProducts]);

  // Active chart data
  const activePieData =
    chartType === 'sales'
      ? salesPieData
      : chartType === 'materials'
      ? materialsPieData
      : productsPieData;

  const totalValuation = activePieData.reduce((sum, item) => sum + item.value, 0);

  if (!mounted) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-[#EFE4DA] h-72 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#FFB300] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#EFE4DA] shadow-xs sm:shadow-md shadow-[#3E2723]/5 space-y-3">
      {/* Header with Title and 3 Tab Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#EFE4DA]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
            {chartType === 'sales' ? (
              <ShoppingBag className="w-4 h-4 text-[#E65100]" />
            ) : chartType === 'materials' ? (
              <Boxes className="w-4 h-4 text-[#FFB300]" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#2E7D32]" />
            )}
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#3E2723]">
              {chartType === 'sales'
                ? 'Proporsi Penjualan Toko'
                : chartType === 'materials'
                ? 'Proporsi Bahan Baku Ready'
                : 'Proporsi Stok Produk Ready'}
            </h3>
            <p className="text-[10px] text-[#8D6E63] font-medium hidden sm:block">
              {chartType === 'sales'
                ? 'Distribusi omset penjualan terkelompok per varian produk'
                : chartType === 'materials'
                ? 'Hanya menampilkan persediaan bahan baku dapur yang ready (stok > 0)'
                : 'Hanya menampilkan persediaan produk jadi ready siap jual (stok > 0)'}
            </p>
          </div>
        </div>

        {/* 3 Tab Filter Buttons: 1. Penjualan | 2. Bahan Baku | 3. Produk */}
        <div className="flex items-center p-0.5 bg-[#FAF7F2] rounded-xl border border-[#EFE4DA] self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setChartType('sales')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all',
              chartType === 'sales'
                ? 'bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] shadow-xs'
                : 'text-[#6D4C41] hover:text-[#3E2723]'
            )}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Penjualan</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('materials')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all',
              chartType === 'materials'
                ? 'bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] shadow-xs'
                : 'text-[#6D4C41] hover:text-[#3E2723]'
            )}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Bahan Baku</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('products')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all',
              chartType === 'products'
                ? 'bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] shadow-xs'
                : 'text-[#6D4C41] hover:text-[#3E2723]'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Produk</span>
          </button>
        </div>
      </div>

      {/* Sub Filters for Sales & Materials */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {chartType === 'sales' ? (
          <div className="flex items-center gap-1 overflow-x-auto w-full">
            <span className="text-[10px] font-bold text-[#8D6E63] uppercase tracking-wider mr-1 hidden sm:inline flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#E65100]" /> Rentang:
            </span>
            <button
              type="button"
              onClick={() => setTimeRange('daily')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all shrink-0',
                timeRange === 'daily'
                  ? 'bg-[#3E2723] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#6D4C41] border border-[#EFE4DA] hover:bg-[#FFF3E0]'
              )}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('weekly')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all shrink-0',
                timeRange === 'weekly'
                  ? 'bg-[#3E2723] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#6D4C41] border border-[#EFE4DA] hover:bg-[#FFF3E0]'
              )}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('monthly')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all shrink-0',
                timeRange === 'monthly'
                  ? 'bg-[#3E2723] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#6D4C41] border border-[#EFE4DA] hover:bg-[#FFF3E0]'
              )}
            >
              30 Hari
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all shrink-0',
                timeRange === 'all'
                  ? 'bg-[#3E2723] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#6D4C41] border border-[#EFE4DA] hover:bg-[#FFF3E0]'
              )}
            >
              Semua Riwayat
            </button>
          </div>
        ) : chartType === 'materials' ? (
          <div className="flex items-center gap-1 overflow-x-auto w-full">
            <span className="text-[10px] font-bold text-[#8D6E63] uppercase tracking-wider mr-1 hidden sm:inline flex items-center gap-1">
              <PackageCheck className="w-3 h-3 text-[#2E7D32]" /> Dimensi:
            </span>
            <button
              type="button"
              onClick={() => setInventoryDimension('all')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all shrink-0',
                inventoryDimension === 'all'
                  ? 'bg-[#3E2723] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#6D4C41] border border-[#EFE4DA] hover:bg-[#FFF3E0]'
              )}
            >
              Semua Grup
            </button>
            <button
              type="button"
              onClick={() => setInventoryDimension('weight')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all shrink-0',
                inventoryDimension === 'weight'
                  ? 'bg-[#3E2723] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#6D4C41] border border-[#EFE4DA] hover:bg-[#FFF3E0]'
              )}
            >
              Berat (kg)
            </button>
            <button
              type="button"
              onClick={() => setInventoryDimension('volume')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all shrink-0',
                inventoryDimension === 'volume'
                  ? 'bg-[#3E2723] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#6D4C41] border border-[#EFE4DA] hover:bg-[#FFF3E0]'
              )}
            >
              Volume (L)
            </button>
            <button
              type="button"
              onClick={() => setInventoryDimension('count')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all shrink-0',
                inventoryDimension === 'count'
                  ? 'bg-[#3E2723] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-[#6D4C41] border border-[#EFE4DA] hover:bg-[#FFF3E0]'
              )}
            >
              Unit / Pcs
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-[#8D6E63] font-medium">
            <span>Menampilkan seluruh stok etalase produk jadi yang tersedia.</span>
          </div>
        )}
      </div>

      {/* Donut Chart Content Area */}
      {activePieData.length === 0 || totalValuation === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <p className="font-black text-sm text-[#3E2723]">Belum Ada Data Barang Ready</p>
          <p className="text-xs text-[#8D6E63] max-w-xs">
            {chartType === 'sales'
              ? 'Belum ada transaksi penjualan pada rentang waktu yang dipilih.'
              : chartType === 'materials'
              ? 'Tidak ada bahan baku yang berstatus ready (stok > 0).'
              : 'Tidak ada produk jadi yang berstatus ready (stok > 0).'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 items-center">
          {/* Donut Canvas with Center Badge */}
          <div className="md:col-span-5 h-52 sm:h-60 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {activePieData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const pct = totalValuation > 0 ? ((data.value / totalValuation) * 100).toFixed(1) : '0';
                      return (
                        <div className="bg-white/95 backdrop-blur-md border-1.5 border-[#FFB300] p-2.5 rounded-2xl shadow-xl text-[11px] space-y-1">
                          <p className="font-black text-[#3E2723]">{data.name}</p>
                          <p className="text-[10px] text-[#8D6E63]">{data.category}</p>
                          {chartType === 'sales' ? (
                            <p className="text-[#E65100] font-black text-xs">
                              {formatRupiah(data.value)} <span className="text-[10px] text-[#3E2723]">({pct}%)</span>
                            </p>
                          ) : (
                            <p className="text-[#2E7D32] font-black text-xs">
                              {formatNumber(data.value)} {data.unitDisplay} <span className="text-[10px] text-[#3E2723]">({pct}%)</span>
                            </p>
                          )}
                          {'itemCount' in data && (
                            <p className="text-[10px] text-[#8D6E63] font-bold">
                              {data.itemCount} jenis bahan di kategori ini
                            </p>
                          )}
                          {'count' in data && (
                            <p className="text-[10px] text-[#8D6E63]">
                              {data.count} transaksi tercatat
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label for Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[9px] font-bold text-[#8D6E63] uppercase tracking-wider">
                {chartType === 'sales' ? 'Total Omset' : 'Total Stok Ready'}
              </span>
              <span className="text-xs sm:text-sm font-black text-[#3E2723] leading-tight truncate max-w-[130px]">
                {chartType === 'sales'
                  ? formatRupiah(totalValuation)
                  : `${formatNumber(totalValuation)} ${
                      chartType === 'products'
                        ? 'pcs'
                        : inventoryDimension === 'weight'
                        ? 'kg'
                        : inventoryDimension === 'volume'
                        ? 'L'
                        : inventoryDimension === 'count'
                        ? 'pcs'
                        : 'unit'
                    }`}
              </span>
              <span className="text-[8.5px] text-[#D81B60] font-black mt-0.5">
                {activePieData.length} {chartType === 'sales' ? 'Varian Terjual' : chartType === 'materials' ? 'Kategori Bahan Ready' : 'Produk Ready'}
              </span>
            </div>
          </div>

          {/* Compact Legend & Share List (Mobile-Optimized) */}
          <div className="md:col-span-7 space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {activePieData.map((item) => {
              const pct = totalValuation > 0 ? ((item.value / totalValuation) * 100).toFixed(0) : '0';
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-stone-50/90 border border-[#EFE4DA]/80 text-[11px] hover:border-[#FFB300] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-[#3E2723] truncate leading-tight">{item.name}</p>
                      <p className="text-[9.5px] text-[#8D6E63] truncate">
                        {'itemCount' in item ? `${item.itemCount} varian bahan dapur ready` : item.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-right">
                    <span className="text-[11px] font-mono font-bold text-[#3E2723]">
                      {chartType === 'sales' ? formatRupiah(item.value) : `${formatNumber(item.value)} ${item.unitDisplay}`}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded-md text-[9.5px] font-black text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
