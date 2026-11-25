import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, ClipboardList, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { assignmentsApi } from '../../api/assignments.api';
import { assetsApi } from '../../api/assets.api';
import { usersApi } from '../../api/users.api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import type { Assignment } from '../../types';

export const AssignmentsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const qc = useQueryClient();
  const [activeOnly,    setActiveOnly]    = useState(true);
  const [assignOpen,    setAssignOpen]    = useState(false);
  const [returning,     setReturning]     = useState<Assignment | null>(null);
  const [assetId,       setAssetId]       = useState('');
  const [assignedTo,    setAssignedTo]    = useState('');

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['assignments', activeOnly],
    queryFn:  () => assignmentsApi.list(activeOnly).then((r) => r.data.data.assignments),
  });

  const { data: availableAssets } = useQuery({
    queryKey: ['assets', { status: 'available' }],
    queryFn:  () => assetsApi.list({ status: 'available', limit: 200 }).then((r) => r.data.data.assets),
    enabled:  assignOpen,
  });

  const { data: employees } = useQuery({
    queryKey: ['users'],
    queryFn:  () => usersApi.list().then((r) => r.data.data.users.filter((u) => u.is_active)),
    enabled:  assignOpen,
  });

  const assignMutation = useMutation({
    mutationFn: () => assignmentsApi.assign({ asset_id: assetId, assigned_to: assignedTo }),
    onSuccess: () => { toast.success('Asset assigned'); qc.invalidateQueries({ queryKey: ['assignments'] }); qc.invalidateQueries({ queryKey: ['assets'] }); setAssignOpen(false); setAssetId(''); setAssignedTo(''); },
    onError:   (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  });

  const returnMutation = useMutation({
    mutationFn: (id: string) => assignmentsApi.return(id, {}),
    onSuccess: () => { toast.success('Asset returned'); qc.invalidateQueries({ queryKey: ['assignments'] }); qc.invalidateQueries({ queryKey: ['assets'] }); setReturning(null); },
    onError:   (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  });

  const columns = [
    { key: 'tag',   header: 'Asset',      render: (r: Assignment) => <div><p className="font-medium text-white text-sm">{r.asset_name}</p><p className="font-mono text-indigo-400 text-xs">{r.asset_tag}</p></div> },
    { key: 'to',    header: 'Assigned To', render: (r: Assignment) => <span className="text-slate-300">{r.assigned_to_name}</span> },
    { key: 'by',    header: 'Assigned By', render: (r: Assignment) => <span className="text-slate-500 text-xs">{r.assigned_by_name}</span> },
    { key: 'date',  header: 'Date',        render: (r: Assignment) => <span className="text-slate-400 text-xs">{format(new Date(r.assigned_at), 'MMM d, yyyy')}</span> },
    { key: 'stat',  header: 'Status',      render: (r: Assignment) => r.returned_at ? <Badge variant="slate" dot>Returned</Badge> : <Badge variant="green" dot>Active</Badge> },
    {
      key: 'act', header: '',
      render: (r: Assignment) => !r.returned_at && hasPermission('assign_asset') ? (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setReturning(r)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Return
        </motion.button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        subtitle="Asset assignment history and active assignments"
        actions={
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
              />
              Active only
            </label>
            {hasPermission('assign_asset') && (
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAssignOpen(true)}>Assign Asset</Button>
            )}
          </div>
        }
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable columns={columns} data={assignments ?? []} keyField="id" loading={isLoading}
          emptyText="No assignments found" emptyIcon={<ClipboardList className="w-12 h-12" />}
        />
      </motion.div>

      {/* Assign Modal */}
      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Asset" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button disabled={!assetId || !assignedTo} loading={assignMutation.isPending} onClick={() => assignMutation.mutate()}>
              Assign
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Select Asset *" value={assetId} onChange={(e) => setAssetId(e.target.value)}
            options={(availableAssets ?? []).map((a) => ({ value: a.id, label: `${a.asset_tag} — ${a.name}` }))}
            placeholder="Choose an available asset"
          />
          <Select label="Assign To *" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
            options={(employees ?? []).map((u) => ({ value: u.id, label: u.full_name }))}
            placeholder="Select employee"
          />
        </div>
      </Modal>

      {/* Return Confirmation */}
      <Modal open={!!returning} onClose={() => setReturning(null)} title="Return Asset" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReturning(null)}>Cancel</Button>
            <Button variant="secondary" loading={returnMutation.isPending} onClick={() => returning && returnMutation.mutate(returning.id)}>
              Confirm Return
            </Button>
          </>
        }
      >
        <p className="text-slate-400 text-sm">
          Mark <span className="text-white font-semibold">{returning?.asset_name}</span> as returned from{' '}
          <span className="text-white font-semibold">{returning?.assigned_to_name}</span>?
        </p>
      </Modal>
    </div>
  );
};

