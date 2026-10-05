'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { useStore } from '@/lib/store';
import { WEEKLY_SALES_DATA } from '@/lib/mock-data';
import { formatRupiah, formatNumber } from '@/lib/utils';

const DONUT_COLORS = ['#E65100', '#FFB300', '#D81B60', '#2E7D32', '#8E24AA', '#0288D1', '#5D4037'];

export function SalesChart() {
  const [mounted, setMounted] = useState(false);
  const [chartMode, setChartMode] = useState<'donut' | 'trend'>('donut');
  const [metric, setMetric] = useState<'sales' | 'profit' | 'breadCount'>('sales');
  const { finishedProducts } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-72 rounded-2xl bg-white border border-[#EFE4DA] animate-pulse flex items-center justify-center text-xs text-[#8D6E63]">
        Memuat Grafik Performa Penjualan...
      </div>
    );
  }

  // Calculate Product Sales Distribution for Donut Chart
  const productShareData = finishedProducts.map((p, idx) => {
    // Estimated valuation based on ready stock + batch yield
    const totalValue = (p.stock + p.batchYield) * p.sellingPrice;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      value: totalValue,
      stock: p.stock,
      price: p.sellingPrice,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
    };
  });

  const totalProductValuation = productShareData.reduce((sum, item) => sum + item.value, 0);

  const totalWeeklySales = WEEKLY_SALES_DATA.reduce((sum, d) => sum + d.sales, 0);
  const totalWeeklyProfit = WEEKLY_SALES_DATA.reduce((sum, d) => sum + d.profit, 0);

  return (
    <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border-1.5 border-[#EFE4DA] text-[#3E2723] shadow-xs sm:shadow-sm relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#FFF3E0]/60 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Simple Mode Toggle */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#EFE4DA]">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded-lg bg-[#FFF3E0] text-[#3E2723] border border-[#FFE0B2]">
            {chartMode === 'donut' ? (
              <PieIcon className="w-3.5 h-3.5 text-[#E65100]" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-[#2E7D32]" />
            )}
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-[#3E2723]">
              {chartMode === 'donut' ? 'Penjualan per Produk' : 'Tren Omset Mingguan'}
            </h3>
          </div>
        </div>

        {/* Simple Toggle Switch */}
        <div className="flex items-center p-0.5 bg-[#FAF7F2] rounded-xl border border-[#EFE4DA]">
          <button
            type="button"
            onClick={() => setChartMode('donut')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all ${
              chartMode === 'donut'
                ? 'bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-[#3E2723] shadow-xs'
                : 'text-[#6D4C41] hover:text-[#3E2723]'
            }`}
          >
            Donut
          </button>
          <button
            type="button"
            onClick={() => setChartMode('trend')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all ${
              chartMode === 'trend'
                ? 'bg-[#3E2723] text-white shadow-xs'
                : 'text-[#6D4C41] hover:text-[#3E2723]'
            }`}
          >
            Tren
          </button>
        </div>
      </div>

      {/* VIEW 1: DONUT / PIE CHART */}
      {chartMode === 'donut' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 items-center">
          {/* Donut Canvas with center label */}
          <div className="md:col-span-6 h-48 sm:h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {productShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const pct = ((data.value / totalProductValuation) * 100).toFixed(1);
                      return (
                        <div className="bg-white border-1.5 border-[#FFB300] p-2.5 rounded-xl shadow-lg text-[11px] space-y-0.5">
                          <p className="font-black text-[#3E2723]">{data.name}</p>
                          <p className="text-[#6D4C41]">Kategori: {data.category}</p>
                          <p className="text-[#E65100] font-black">
                            Nilai: {formatRupiah(data.value)} ({pct}%)
                          </p>
                          <p className="text-[10px] text-[#8D6E63]">Stok: {data.stock} pcs</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[9px] font-bold text-[#8D6E63] uppercase">Produk Aktif</span>
              <span className="text-sm font-black text-[#3E2723]">{finishedProducts.length} Varian</span>
              <span className="text-[8.5px] text-[#2E7D32] font-black">Dapoer Mamak</span>
            </div>
          </div>

          {/* Compact Legend & Share List */}
          <div className="md:col-span-6 space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {productShareData.map((item) => {
              const pct = totalProductValuation > 0 ? ((item.value / totalProductValuation) * 100).toFixed(0) : '0';
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-stone-50/80 border border-[#EFE4DA]/80 text-[11px]"
                >
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-[#3E2723] truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-right">
                    <span className="text-[10px] font-mono font-bold text-[#8D6E63]">
                      {formatRupiah(item.value)}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9.5px] font-black text-white shrink-0"
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

      {/* VIEW 2: LINE / AREA CHART */}
      {chartMode === 'trend' && (
        <div>
          {/* Sub-Metric selector */}
          <div className="flex justify-end pt-2 pb-1">
            <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#FAF7F2] rounded-lg border border-[#EFE4DA]">
              <button
                type="button"
                onClick={() => setMetric('sales')}
                className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                  metric === 'sales' ? 'bg-[#FFB300] text-[#3E2723]' : 'text-[#6D4C41]'
                }`}
              >
                Omset
              </button>
              <button
                type="button"
                onClick={() => setMetric('profit')}
                className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                  metric === 'profit' ? 'bg-[#2E7D32] text-white' : 'text-[#6D4C41]'
                }`}
              >
                Laba
              </button>
              <button
                type="button"
                onClick={() => setMetric('breadCount')}
                className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                  metric === 'breadCount' ? 'bg-[#EC407A] text-white' : 'text-[#6D4C41]'
                }`}
              >
                Pcs
              </button>
            </div>
          </div>

          <div className="h-52 sm:h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_SALES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB300" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#FFB300" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="breadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC407A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EC407A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE4DA" vertical={false} />
                <XAxis dataKey="day" stroke="#8D6E63" fontSize={10} tickLine={false} axisLine={{ stroke: '#EFE4DA' }} />
                <YAxis
                  stroke="#8D6E63"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    metric === 'breadCount' ? `${val} pcs` : `${(val / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white border-1.5 border-[#FFB300]/50 p-2.5 rounded-xl shadow-lg text-[11px] space-y-0.5">
                          <p className="font-black text-[#3E2723] border-b border-[#EFE4DA] pb-0.5">{label}</p>
                          <p className="text-[#3E2723]">Omset: <strong className="text-[#E65100]">{formatRupiah(data.sales)}</strong></p>
                          <p className="text-[#3E2723]">Laba: <strong className="text-[#2E7D32]">{formatRupiah(data.profit)}</strong></p>
                          <p className="text-[#8D6E63]">Roti: {data.breadCount} pcs</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {metric === 'sales' && (
                  <Area type="monotone" dataKey="sales" stroke="#FFB300" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                )}
                {metric === 'profit' && (
                  <Area type="monotone" dataKey="profit" stroke="#2E7D32" strokeWidth={2.5} fillOpacity={1} fill="url(#profitGrad)" />
                )}
                {metric === 'breadCount' && (
                  <Area type="monotone" dataKey="breadCount" stroke="#EC407A" strokeWidth={2.5} fillOpacity={1} fill="url(#breadGrad)" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
