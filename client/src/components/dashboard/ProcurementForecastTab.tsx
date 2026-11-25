/**
 * components/dashboard/ProcurementForecastTab.tsx
 * Smart Procurement Forecasting Tab with Stockout Runway,
 * Category Burn Rates, and Quick Batch Procurement Requisition.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Flame,
  Clock,
  ShoppingCart,
  CheckCircle2,
  TrendingUp,
  Package,
  Layers,
  Calendar,
  Sparkles,
  Info,
  Check,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { analyticsApi } from '../../api/analytics.api';
import { requestsApi } from '../../api/requests.api';
import { SkeletonCard } from '../ui/Skeleton';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { exportToCsv } from '../../utils/exportCsv';
import toast from 'react-hot-toast';
import type { ForecastingRiskLevel, CategoryForecast, RequestPriority } from '../../types';
import { format } from 'date-fns';

const RiskPill: React.FC<{ level: ForecastingRiskLevel; runwayDays: number | null }> = ({
  level,
  runwayDays,
}) => {
  if (level === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
        {runwayDays === 0 ? 'Stockout Imminent' : `${runwayDays}d Runway`}
      </span>
    );
  }
  if (level === 'WARNING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <AlertTriangle className="w-3 h-3" />
        {runwayDays}d Runway
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <CheckCircle2 className="w-3 h-3" />
      {runwayDays != null ? `${runwayDays}d Runway` : 'Well Stocked'}
    </span>
  );
};

export const ProcurementForecastTab: React.FC = () => {
  const qc = useQueryClient();
  const [filterRisk, setFilterRisk] = useState<'ALL' | ForecastingRiskLevel>('ALL');

  // Quick reorder modal state
  const [reorderingCategory, setReorderingCategory] = useState<CategoryForecast | null>(null);
  const [procureItem, setProcureItem] = useState('');
  const [procurePriority, setProcurePriority] = useState<RequestPriority>('high');
  const [procureReason, setProcureReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['procurement-forecast'],
    queryFn: () => analyticsApi.getForecasting().then((r) => r.data.data.forecast),
    refetchInterval: 30_000,
  });

  // Requisition creation mutation from forecast
  const reorderMutation = useMutation({
    mutationFn: () =>
      requestsApi.create({
        category_id: reorderingCategory?.category_id,
        asset_type: procureItem,
        priority: procurePriority,
        reason: procureReason,
      }),
    onSuccess: () => {
      toast.success(`Procurement requisition submitted for ${reorderingCategory?.category_name}`);
      qc.invalidateQueries({ queryKey: ['procurement-forecast'] });
      qc.invalidateQueries({ queryKey: ['asset-requests'] });
      setReorderingCategory(null);
    },
    onError: (e: unknown) => {
      toast.error(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed to submit procurement requisition'
      );
    },
  });

  const openReorderModal = (cat: CategoryForecast) => {
    setReorderingCategory(cat);
    setProcureItem(`${cat.category_name} Batch Restock (${cat.suggested_reorder_qty} units recommended)`);
    setProcurePriority(cat.risk_level === 'CRITICAL' ? 'urgent' : 'high');
    setProcureReason(
      `Automated procurement requisition initiated via Smart Forecasting Engine. Category "${cat.category_name}" has ${
        cat.runway_days === 0 ? 'zero runway (immediate stockout risk)' : `${cat.runway_days} days of runway left`
      }. Recommended 90-day buffer replenishment: ${cat.suggested_reorder_qty} units.`
    );
  };

  const categories = data?.categories ?? [];
  const filteredCategories =
    filterRisk === 'ALL'
      ? categories
      : categories.filter((c) => c.risk_level === filterRisk);

  const handleExportForecastCsv = () => {
    if (!categories.length) {
      toast.error('No forecast data available to export');
      return;
    }
    exportToCsv(
      'TechVault_Procurement_Forecast',
      categories,
      [
        { key: 'category_name', label: 'Category' },
        { key: 'risk_level', label: 'Risk Level' },
        { key: 'available_stock', label: 'Available Stock' },
        { key: 'assigned_stock', label: 'Assigned Stock' },
        { key: 'maintenance_stock', label: 'Maintenance Stock' },
        { key: 'pending_requests', label: 'Pending Requests' },
        { key: 'monthly_burn_rate', label: 'Monthly Burn Rate' },
        { key: 'daily_burn_rate', label: 'Daily Burn Rate' },
        { key: 'runway_days', label: 'Runway Days' },
        { key: 'suggested_reorder_qty', label: 'Suggested Reorder Units' },
      ]
    );
    toast.success('Procurement forecast CSV downloaded');
  };

  // Chart data comparing Available Stock vs Monthly Burn Rate vs Suggested Reorder
  const chartData = categories.map((c) => ({
    name: c.category_name,
    available: c.available_stock,
    burnRate: c.monthly_burn_rate,
    reorder: c.suggested_reorder_qty,
    runway: c.runway_days ?? 0,
    risk: c.risk_level,
  }));

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-rose-950/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Critical Stockouts</span>
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-rose-400">
                {data?.critical_categories_count ?? 0}
              </p>
              <p className="text-xs text-rose-300/70 mt-1">Categories with &le; 14d runway</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-amber-950/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Warning Runway</span>
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-amber-400">
                {data?.warning_categories_count ?? 0}
              </p>
              <p className="text-xs text-amber-300/70 mt-1">15 to 45 days stock remaining</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-emerald-950/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Stable Categories</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-emerald-400">
                {data?.healthy_categories_count ?? 0}
              </p>
              <p className="text-xs text-emerald-300/70 mt-1">&gt; 45 days healthy supply</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg shadow-indigo-950/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Suggested Reorder</span>
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-indigo-400">
                {data?.total_recommended_reorder_units ?? 0}
                <span className="text-sm font-normal text-slate-400 ml-1.5">units</span>
              </p>
              <p className="text-xs text-indigo-300/70 mt-1">90-day supply buffer target</p>
            </motion.div>
          </>
        )}
      </div>

      {/* Methodology Guide Alert */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-3">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-white">How TechVault Smart Runway Forecasting Works</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-indigo-400 font-medium">Monthly Burn Rate</span> is calculated from historical employee equipment allocations and onboarding velocity.
            <span className="text-emerald-400 font-medium ml-1">Runway</span> measures days remaining until unassigned inventory reaches zero (accounting for pending requisitions).
            Click any <span className="text-indigo-300 font-semibold">+ Reorder</span> pill in the matrix below to generate an automated procurement requisition.
          </p>
        </div>
      </div>

      {/* Chart Section: Stock vs Burn Rate vs Reorder */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">
                Category Inventory vs. Monthly Burn & Reorder Needs
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualizes currently unassigned inventory against consumption velocity
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Available
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Burn / Mo
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Recommended Reorder
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 animate-pulse bg-slate-800/60 rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barGap={4}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload?.length) {
                    const row = payload[0].payload as (typeof chartData)[0];
                    return (
                      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
                        <p className="font-bold text-white text-sm">{label}</p>
                        <p className="text-emerald-400 font-medium">Available: {row.available} units</p>
                        <p className="text-amber-400 font-medium">Burn Rate: {row.burnRate} / month</p>
                        <p className="text-indigo-400 font-medium">Suggested Reorder: {row.reorder} units</p>
                        <div className="pt-1 border-t border-slate-700">
                          <p className="text-slate-300">
                            Estimated Runway:{' '}
                            <span className="font-semibold text-white">
                              {row.runway === 0 ? 'Stockout Deficit' : `${row.runway} days`}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: 'rgba(99,102,241,0.06)' }}
              />
              <Bar dataKey="available" name="Available Stock" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="burnRate" name="Monthly Burn" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reorder" name="Suggested Reorder" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Filter Tabs and Category Risk Matrix Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white">Procurement Forecast Matrix</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live stockout runway calculations and 1-click batch reorder triggers
            </p>
          </div>

          {/* Filter Pills and Export Button */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportForecastCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              title="Export Procurement Forecast as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl">
              {(
                [
                  { id: 'ALL', label: 'All Categories' },
                  { id: 'CRITICAL', label: 'Critical' },
                  { id: 'WARNING', label: 'Warning' },
                  { id: 'HEALTHY', label: 'Healthy' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterRisk(t.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    filterRisk === t.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Breakdown</th>
                <th className="py-3 px-4">Pending Demand</th>
                <th className="py-3 px-4">Burn Velocity</th>
                <th className="py-3 px-4">Runway Status</th>
                <th className="py-3 px-4">Projected Stockout</th>
                <th className="py-3 px-4 text-right">Procurement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <AnimatePresence>
                {filteredCategories.map((c) => (
                  <motion.tr
                    key={c.category_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Category name */}
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{c.category_name}</span>
                      </div>
                    </td>

                    {/* Stock breakdown */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-medium">{c.available_stock} Avail</span>
                          <span className="text-slate-600">&bull;</span>
                          <span className="text-slate-400">{c.assigned_stock} Assigned</span>
                          {c.maintenance_stock > 0 && (
                            <>
                              <span className="text-slate-600">&bull;</span>
                              <span className="text-amber-400">{c.maintenance_stock} Maint</span>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">Total: {c.total_assets} units</p>
                      </div>
                    </td>

                    {/* Pending demand */}
                    <td className="py-3.5 px-4">
                      {c.pending_requests > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                          {c.pending_requests} pending
                        </span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>

                    {/* Monthly burn rate */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-white">{c.monthly_burn_rate}</span>
                        <span className="text-slate-400 ml-1">/ month</span>
                        <p className="text-[10px] text-slate-500">{c.daily_burn_rate} / day</p>
                      </div>
                    </td>

                    {/* Runway status */}
                    <td className="py-3.5 px-4">
                      <RiskPill level={c.risk_level} runwayDays={c.runway_days} />
                    </td>

                    {/* Projected stockout date */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {c.projected_stockout_date ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {c.runway_days === 0
                              ? 'Immediate / Deficit'
                              : format(new Date(c.projected_stockout_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600">&infin; Runway</span>
                      )}
                    </td>

                    {/* Reorder recommendation button */}
                    <td className="py-3.5 px-4 text-right">
                      {c.suggested_reorder_qty > 0 ? (
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => openReorderModal(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
                          title="Click to initiate quick procurement requisition"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>+ {c.suggested_reorder_qty} Reorder</span>
                        </motion.button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                          <Check className="w-3 h-3 text-emerald-500" />
                          Adequate
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Reorder Modal */}
      <Modal
        open={!!reorderingCategory}
        onClose={() => setReorderingCategory(null)}
        title="Quick Batch Procurement Requisition"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReorderingCategory(null)}>
              Cancel
            </Button>
            <Button
              loading={reorderMutation.isPending}
              disabled={!procureItem || !procureReason}
              onClick={() => reorderMutation.mutate()}
            >
              Confirm Requisition
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1">
            <p className="text-xs text-indigo-300">
              Target Category: <span className="font-bold text-white">{reorderingCategory?.category_name}</span>
            </p>
            <p className="text-xs text-slate-400">
              Current Available:{' '}
              <span className="text-emerald-400 font-semibold">{reorderingCategory?.available_stock} units</span>{' '}
              &bull; Monthly Burn Rate:{' '}
              <span className="text-amber-400 font-semibold">{reorderingCategory?.monthly_burn_rate} / mo</span>
            </p>
          </div>

          <Input
            label="Procurement Item / Batch Description *"
            value={procureItem}
            onChange={(e) => setProcureItem(e.target.value)}
          />

          <Select
            label="Urgency / Priority"
            value={procurePriority}
            onChange={(e) => setProcurePriority(e.target.value as RequestPriority)}
            options={[
              { value: 'urgent', label: 'Urgent — Immediate Stockout Risk' },
              { value: 'high', label: 'High — Low Runway Horizon' },
              { value: 'medium', label: 'Medium — Standard Refresh Buffer' },
              { value: 'low', label: 'Low — Long-term Procurement' },
            ]}
          />

          <Textarea
            label="Procurement Justification *"
            value={procureReason}
            onChange={(e) => setProcureReason(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
};
