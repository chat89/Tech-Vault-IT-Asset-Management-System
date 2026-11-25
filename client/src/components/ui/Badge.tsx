import clsx from 'clsx';
import type { AssetStatus, MaintenanceStatus } from '../../types';

type BadgeVariant = 'green' | 'blue' | 'amber' | 'red' | 'slate' | 'purple' | 'cyan';

const variants: Record<BadgeVariant, string> = {
  green:  'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  blue:   'bg-blue-500/15    text-blue-400    ring-1 ring-blue-500/30',
  amber:  'bg-amber-500/15   text-amber-400   ring-1 ring-amber-500/30',
  red:    'bg-red-500/15     text-red-400     ring-1 ring-red-500/30',
  slate:  'bg-slate-500/15   text-slate-400   ring-1 ring-slate-500/30',
  purple: 'bg-purple-500/15  text-purple-400  ring-1 ring-purple-500/30',
  cyan:   'bg-cyan-500/15    text-cyan-400    ring-1 ring-cyan-500/30',
};

interface BadgeProps { variant?: BadgeVariant; children: React.ReactNode; className?: string; dot?: boolean; }

export const Badge: React.FC<BadgeProps> = ({ variant = 'slate', children, className, dot }) => (
  <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
    {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', {
      'bg-emerald-400': variant === 'green',
      'bg-blue-400':    variant === 'blue',
      'bg-amber-400':   variant === 'amber',
      'bg-red-400':     variant === 'red',
      'bg-slate-400':   variant === 'slate',
      'bg-purple-400':  variant === 'purple',
      'bg-cyan-400':    variant === 'cyan',
    })} />}
    {children}
  </span>
);

// ─── Domain-specific badges ───────────────────────────────

const statusVariant: Record<AssetStatus, BadgeVariant> = {
  available:         'green',
  assigned:          'blue',
  under_maintenance: 'amber',
  retired:           'slate',
  disposed:          'red',
};

const statusLabel: Record<AssetStatus, string> = {
  available:         'Available',
  assigned:          'Assigned',
  under_maintenance: 'Maintenance',
  retired:           'Retired',
  disposed:          'Disposed',
};

export const AssetStatusBadge: React.FC<{ status: AssetStatus }> = ({ status }) => (
  <Badge variant={statusVariant[status]} dot>{statusLabel[status]}</Badge>
);

const mStatusVariant: Record<MaintenanceStatus, BadgeVariant> = {
  scheduled:   'blue',
  in_progress: 'amber',
  completed:   'green',
  cancelled:   'red',
};

export const MaintenanceStatusBadge: React.FC<{ status: MaintenanceStatus }> = ({ status }) => (
  <Badge variant={mStatusVariant[status]} dot>{status.replace('_', ' ')}</Badge>
);

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const v: BadgeVariant = role === 'super_admin' ? 'purple' : role === 'it_admin' ? 'cyan' : 'slate';
  const label = role === 'super_admin' ? 'Super Admin' : role === 'it_admin' ? 'IT Admin' : 'Employee';
  return <Badge variant={v}>{label}</Badge>;
};

const reqStatusVariant: Record<string, BadgeVariant> = {
  pending:   'amber',
  approved:  'blue',
  rejected:  'red',
  fulfilled: 'green',
  cancelled: 'slate',
};

export const RequestStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <Badge variant={reqStatusVariant[status] || 'slate'} dot>{status.toUpperCase()}</Badge>
);

const priorityVariant: Record<string, BadgeVariant> = {
  low:    'slate',
  medium: 'blue',
  high:   'amber',
  urgent: 'red',
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => (
  <Badge variant={priorityVariant[priority] || 'slate'}>{priority.toUpperCase()}</Badge>
);

