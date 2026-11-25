import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor, CheckCircle, UserCheck, Wrench, TrendingUp,
  Activity, Package, BarChart2, Sparkles, LayoutDashboard, Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/dashboard.api';
import { StatCard } from '../../components/ui/StatCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { FinancialWidget } from '../../components/ui/FinancialWidget';
import { ProcurementForecastTab } from '../../components/dashboard/ProcurementForecastTab';

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#64748b','#ef4444'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-xl text-sm">
        <p className="text-slate-300">{label}</p>
        <p className="text-indigo-400 font-bold">{payload[0].value} assets</p>
      </div>
    );
  }
  return null;
};

export const DashboardPage: React.FC = () => {
  const { isRole, user } = useAuth();
  const isAdmin = isRole('super_admin', 'it_admin');

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = isAdmin && searchParams.get('tab') === 'forecasting' ? 'forecasting' : 'overview';

  const handleTabChange = (tab: 'overview' | 'forecasting') => {
    if (tab === 'forecasting') {
      setSearchParams({ tab: 'forecasting' });
    } else {
      setSearchParams({});
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn:  () => dashboardApi.stats().then((r) => r.data.data.stats),
    refetchInterval: 30_000,
  });

  const statCards = [
    { label: 'Total Assets',    value: data?.total_assets      ?? 0, icon: <Package   className="w-5 h-5" />, gradient: 'bg-gradient-to-br from-indigo-600 to-indigo-800',  sub: 'All registered assets',  delay: 0 },
    { label: 'Available',       value: data?.available_assets  ?? 0, icon: <CheckCircle className="w-5 h-5" />, gradient: 'bg-gradient-to-br from-emerald-600 to-emerald-800', sub: 'Ready to be assigned',   delay: 0.07 },
    { label: 'Assigned',        value: data?.assigned_assets   ?? 0, icon: <UserCheck  className="w-5 h-5" />, gradient: 'bg-gradient-to-br from-blue-600 to-blue-800',       sub: 'Currently in use',       delay: 0.14 },
    { label: 'In Maintenance',  value: data?.under_maintenance ?? 0, icon: <Wrench     className="w-5 h-5" />, gradient: 'bg-gradient-to-br from-amber-600 to-amber-800',     sub: 'Under service/repair',   delay: 0.21 },
    { label: 'Recent Assignments', value: data?.recent_assignments ?? 0, icon: <TrendingUp className="w-5 h-5" />, gradient: 'bg-gradient-to-br from-purple-600 to-purple-800', sub: 'Last 30 days',          delay: 0.28 },
    { label: 'Audit Events',    value: data?.recent_audit_events ?? 0, icon: <Activity  className="w-5 h-5" />, gradient: 'bg-gradient-to-br from-rose-600 to-rose-800',       sub: 'Last 7 days',            delay: 0.35 },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl font-bold text-white">Dashboard & Analytics</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Real-time asset telemetry, financial lifecycle, and procurement intelligence
          </p>
        </motion.div>

        {/* Tab switch buttons (admin only) */}
        {isAdmin && (
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto shadow-inner">
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'overview'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeTab === 'overview' && (
                <motion.div
                  layoutId="dashboardTab"
                  className="absolute inset-0 bg-indigo-600 rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" />
                System Overview
              </span>
            </button>

            <button
              onClick={() => handleTabChange('forecasting')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'forecasting'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeTab === 'forecasting' && (
                <motion.div
                  layoutId="dashboardTab"
                  className="absolute inset-0 bg-indigo-600 rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Procurement Forecast
              </span>
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                : statCards.map((s) => <StatCard key={s.label} {...s} />)
              }
            </div>

            {/* Financial Overview Widget (Admin only) or Employee Quickstart */}
            {isAdmin ? (
              <div className="grid grid-cols-1 gap-6">
                <FinancialWidget />
              </div>
            ) : (
              <div className="p-5 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">
                    Welcome back, {user?.full_name}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Need new workstation equipment, replacement peripherals, or test hardware?
                  </p>
                </div>
                <Link
                  to="/requests"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto shadow-md shadow-indigo-950/50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Request Hardware</span>
                </Link>
              </div>
            )}

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar chart — by category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Assets by Category</h3>
                </div>
                {isLoading ? (
                  <div className="h-48 animate-pulse bg-slate-800/60 rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data?.assets_by_category ?? []} barSize={28}>
                      <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                      <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#4338ca" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>

              {/* Pie chart — by status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Monitor className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">Status Distribution</h3>
                </div>
                {isLoading ? (
                  <div className="h-48 animate-pulse bg-slate-800/60 rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={data?.assets_by_status ?? []}
                        dataKey="count"
                        nameKey="status"
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {(data?.assets_by_status ?? []).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, String(n).replace('_', ' ')]} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }} />
                      <Legend formatter={(v) => <span className="text-xs text-slate-400">{String(v).replace('_', ' ')}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="forecasting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ProcurementForecastTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
