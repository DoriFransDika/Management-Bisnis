'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { WEEKLY_SALES_DATA } from '@/lib/mock-data';
import { formatRupiah } from '@/lib/utils';

export function SalesChart() {
  const [mounted, setMounted] = useState(false);
  const [metric, setMetric] = useState<'sales' | 'profit' | 'breadCount'>('sales');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-72 rounded-3xl bg-white border border-[#EFE4DA] animate-pulse flex items-center justify-center text-xs text-[#8D6E63]">
        Memuat Grafik Penjualan Dapoer Mamak...
      </div>
    );
  }

  const totalWeeklySales = WEEKLY_SALES_DATA.reduce((sum, d) => sum + d.sales, 0);
  const totalWeeklyProfit = WEEKLY_SALES_DATA.reduce((sum, d) => sum + d.profit, 0);

  return (
    <div className="p-6 md:p-7 rounded-3xl bg-white border-2 border-[#EFE4DA] text-[#3E2723] shadow-lg shadow-[#3E2723]/5 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFF3E0]/60 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EFE4DA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-[#FFB300]/20 text-[#3E2723] border border-[#FFB300]/40">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </span>
            <h3 className="text-base font-black text-[#3E2723]">Tren Penjualan & Laba Mingguan</h3>
          </div>
          <p className="text-xs text-[#6D4C41] font-medium mt-1">
            Total 7 hari: <strong className="text-[#D81B60]">{formatRupiah(totalWeeklySales)}</strong> • Laba:{' '}
            <strong className="text-[#2E7D32]">{formatRupiah(totalWeeklyProfit)}</strong>
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F2] rounded-2xl border border-[#EFE4DA] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetric('sales')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
              metric === 'sales'
                ? 'bg-[#FFB300] text-[#3E2723] shadow-xs'
                : 'text-[#6D4C41] hover:text-[#3E2723]'
            }`}
          >
            Omset
          </button>
          <button
            type="button"
            onClick={() => setMetric('profit')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
              metric === 'profit'
                ? 'bg-[#2E7D32] text-white shadow-xs'
                : 'text-[#6D4C41] hover:text-[#3E2723]'
            }`}
          >
            Laba Bersih
          </button>
          <button
            type="button"
            onClick={() => setMetric('breadCount')}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
              metric === 'breadCount'
                ? 'bg-[#EC407A] text-white shadow-xs'
                : 'text-[#6D4C41] hover:text-[#3E2723]'
            }`}
          >
            Pcs Roti
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-4">
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
            <XAxis
              dataKey="day"
              stroke="#8D6E63"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#EFE4DA' }}
            />
            <YAxis
              stroke="#8D6E63"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) =>
                metric === 'breadCount'
                  ? `${val} pcs`
                  : `${(val / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border-2 border-[#FFB300]/50 p-4 rounded-3xl shadow-xl shadow-[#3E2723]/15 text-xs space-y-1">
                      <p className="font-black text-[#3E2723] border-b border-[#EFE4DA] pb-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FFB300]" />
                        <span>{label}</span>
                      </p>
                      <p className="text-[#3E2723]">
                        Penjualan: <strong className="text-[#E65100]">{formatRupiah(data.sales)}</strong>
                      </p>
                      <p className="text-[#3E2723]">
                        Pengeluaran: <strong className="text-[#C2185B]">{formatRupiah(data.expenses)}</strong>
                      </p>
                      <p className="text-[#3E2723]">
                        Laba Bersih: <strong className="text-[#2E7D32]">{formatRupiah(data.profit)}</strong>
                      </p>
                      <p className="text-[#8D6E63] text-[11px] pt-1 border-t border-[#EFE4DA]">
                        Roti Terjual: <span className="text-[#3E2723] font-black">{data.breadCount} pcs</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {metric === 'sales' && (
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#FFB300"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salesGrad)"
              />
            )}
            {metric === 'profit' && (
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#2E7D32"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#profitGrad)"
              />
            )}
            {metric === 'breadCount' && (
              <Area
                type="monotone"
                dataKey="breadCount"
                stroke="#EC407A"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#breadGrad)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
