/**
 * components/ui/HealthBadge.tsx
 * Displays an animated health score indicator for MDM telemetry.
 */
import { motion } from 'framer-motion';
import { Activity, BatteryMedium, AlertTriangle } from 'lucide-react';

interface HealthBadgeProps {
  healthScore: number;
  batteryLevel?: number | null;
  diskStatus?: 'healthy' | 'warning' | 'critical';
  compact?: boolean;
}

const getHealthConfig = (score: number) => {
  if (score >= 70) return {
    label: 'Healthy',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    bar: 'bg-emerald-500',
    pulse: false,
  };
  if (score >= 40) return {
    label: 'Warning',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    bar: 'bg-amber-500',
    pulse: false,
  };
  return {
    label: 'Critical',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    bar: 'bg-rose-500',
    pulse: true,
  };
};

export const HealthBadge: React.FC<HealthBadgeProps> = ({
  healthScore,
  batteryLevel,
  diskStatus,
  compact = false,
}) => {
  const config = getHealthConfig(healthScore);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium border ${config.bg} ${config.border} ${config.color}`}>
        {config.pulse && (
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 bg-rose-500`} />
          </span>
        )}
        {!config.pulse && <Activity className="w-3 h-3" />}
        {healthScore}%
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1.5 p-2.5 rounded-xl border ${config.bg} ${config.border} min-w-[90px]`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
        {config.pulse && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
        )}
      </div>
      {/* Health bar */}
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${config.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${healthScore}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex items-center justify-between gap-1">
        <span className={`text-xs font-bold ${config.color}`}>{healthScore}%</span>
        {batteryLevel != null && (
          <div className="flex items-center gap-0.5 text-slate-400">
            <BatteryMedium className="w-3 h-3" />
            <span className="text-xs">{batteryLevel}%</span>
          </div>
        )}
        {diskStatus === 'critical' && (
          <AlertTriangle className="w-3 h-3 text-rose-400" />
        )}
      </div>
    </div>
  );
};

