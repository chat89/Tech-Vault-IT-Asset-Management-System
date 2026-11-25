/**
 * components/ui/FinancialWidget.tsx
 * Dashboard widget for Financial Lifecycle & Depreciation Overview.
 * Shows total CapEx vs Current Book Value with animated progress bar.
 */
import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, BarChart2, ArrowDownRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../api/financial.api';
import { useAuth } from '../../context/AuthContext';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const FinancialWidget: React.FC = () => {
  const { isRole } = useAuth();
  const isAdmin = isRole('super_admin', 'it_admin');

  const { data, isLoading } = useQuery({
    queryKey: ['financial-overview'],
    queryFn: () => financialApi.overview().then((r) => r.data.data.overview),
    refetchInterval: 60_000,
    enabled: isAdmin,
  });

  const retainedPct = data
    ? Math.max(0, Math.min(100, (data.total_current_book_value / data.total_purchase_cost) * 100))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 col-span-1 lg:col-span-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Financial Overview</h3>
            <p className="text-xs text-slate-500">Total CapEx vs Current Book Value</p>
          </div>
        </div>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">
          {data?.asset_count ?? 0} assets tracked
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-8 animate-pulse bg-slate-800/60 rounded-lg" />
          <div className="h-4 animate-pulse bg-slate-800/60 rounded-lg w-3/4" />
          <div className="h-4 animate-pulse bg-slate-800/60 rounded-lg w-1/2" />
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* 3 KPI cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs text-slate-400">Total CapEx</span>
              </div>
              <span className="text-lg font-bold text-white">{fmt(data.total_purchase_cost)}</span>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-slate-400">Book Value</span>
              </div>
              <span className="text-lg font-bold text-emerald-400">{fmt(data.total_current_book_value)}</span>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs text-slate-400">Depreciation</span>
              </div>
              <span className="text-lg font-bold text-rose-400">{fmt(data.total_depreciation)}</span>
            </div>
          </div>

          {/* Animated value retention bar */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">Value Retained</span>
              <span className="text-white font-semibold">{retainedPct.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                initial={{ width: '0%' }}
                animate={{ width: `${retainedPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.7 }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span className="text-slate-500">Salvage</span>
              <span className="text-slate-500">{fmt(data.total_current_book_value)} remaining</span>
            </div>
          </div>

          {/* Depreciation badge */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-500 px-2">
              <span className="text-rose-400 font-semibold">{(100 - retainedPct).toFixed(1)}%</span> of total CapEx depreciated to date
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};
