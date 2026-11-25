import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ScrollText, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { auditApi } from '../../api/audit.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { AuditLog } from '../../types';

const ACTION_OPTS = [
  { value: '', label: 'All Actions' },
  ...['login','logout','create_asset','update_asset','delete_asset','assign_asset','return_asset',
      'create_user','update_user','delete_user','create_maintenance','update_maintenance','change_role']
    .map((a) => ({ value: a, label: a.replace(/_/g, ' ') }))
];

const ACTION_COLORS: Record<string, string> = {
  login: 'green', logout: 'slate',
  create_asset: 'blue', update_asset: 'cyan', delete_asset: 'red',
  assign_asset: 'purple', return_asset: 'amber',
  create_user: 'blue', update_user: 'cyan', delete_user: 'red', change_role: 'purple',
  create_maintenance: 'amber', update_maintenance: 'amber',
};

export const AuditLogsPage: React.FC = () => {
  const [action, setAction] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', { action, page }],
    queryFn:  () => auditApi.list({ action: action || undefined, page, limit: 30 }).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });

  const columns = [
    {
      key: 'action', header: 'Action',
      render: (r: AuditLog) => (
        <Badge variant={(ACTION_COLORS[r.action] ?? 'slate') as 'green' | 'slate' | 'blue' | 'cyan' | 'red' | 'purple' | 'amber'}>
          {r.action.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    { key: 'user',   header: 'User',        render: (r: AuditLog) => <span className="text-slate-300 text-sm">{r.user_name ?? <span className="text-slate-600">System</span>}</span> },
    { key: 'entity', header: 'Entity',      render: (r: AuditLog) => <span className="text-slate-500 text-xs capitalize">{r.entity_type ?? '—'}</span> },
    { key: 'ip',     header: 'IP Address',  render: (r: AuditLog) => <span className="font-mono text-slate-500 text-xs">{r.ip_address ?? '—'}</span> },
    { key: 'time',   header: 'Time',        render: (r: AuditLog) => <span className="text-slate-500 text-xs">{format(new Date(r.created_at), 'MMM d, yyyy HH:mm:ss')}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="Immutable record of all system events" />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex items-center gap-3"
      >
        <Filter className="w-4 h-4 text-slate-500" />
        <Select options={ACTION_OPTS} value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="w-52"
        />
        <span className="text-xs text-slate-500 ml-auto">
          {data ? `${data.total.toLocaleString()} total events` : ''}
        </span>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable columns={columns} data={data?.logs ?? []} keyField="id" loading={isLoading}
          emptyText="No audit events found" emptyIcon={<ScrollText className="w-12 h-12" />}
        />
      </motion.div>

      {/* Pagination */}
      {(data?.pages ?? 0) > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-500">Page {page} of {data?.pages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} icon={<ChevronLeft className="w-3 h-3" />} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

