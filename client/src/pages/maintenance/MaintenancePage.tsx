import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Wrench, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { maintenanceApi } from '../../api/maintenance.api';
import { assetsApi } from '../../api/assets.api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { MaintenanceStatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import type { MaintenanceRecord, MaintenanceType, MaintenanceStatus } from '../../types';

const TYPE_OPTS   = ['preventive','corrective','inspection','upgrade','other'].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
const STATUS_OPTS = ['scheduled','in_progress','completed','cancelled'].map((v) => ({ value: v, label: v.replace('_', ' ') }));

interface MaintenanceFormState {
  asset_id: string;
  maintenance_type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  scheduled_date: string;
  cost: string;
  performed_by: string;
  notes: string;
}

export const MaintenancePage: React.FC = () => {
  const { hasPermission } = useAuth();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing,  setEditing]  = useState<MaintenanceRecord | null>(null);
  const [deleting, setDeleting] = useState<MaintenanceRecord | null>(null);

  const blankForm: MaintenanceFormState = { asset_id: '', maintenance_type: 'corrective', status: 'scheduled', description: '', scheduled_date: '', cost: '', performed_by: '', notes: '' };
  const [form, setForm] = useState<MaintenanceFormState>(blankForm);

  const { data: records, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn:  () => maintenanceApi.list().then((r) => r.data.data.records),
  });

  const { data: assets } = useQuery({
    queryKey: ['all-assets'],
    queryFn:  () => assetsApi.list({ limit: 500 }).then((r) => r.data.data.assets),
    enabled:  formOpen,
  });

  const set = (k: keyof MaintenanceFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value as never }));

  const openEdit = (r: MaintenanceRecord) => {
    setEditing(r);
    setForm({ asset_id: r.asset_id, maintenance_type: r.maintenance_type, status: r.status, description: r.description, scheduled_date: r.scheduled_date.slice(0,10), cost: r.cost ? String(r.cost) : '', performed_by: r.performed_by ?? '', notes: r.notes ?? '' });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const p: Partial<MaintenanceRecord> = { ...form, cost: form.cost ? Number(form.cost) : null, performed_by: form.performed_by || null, notes: form.notes || null };
      return editing ? maintenanceApi.update(editing.id, p) : maintenanceApi.create(p);
    },
    onSuccess: () => { toast.success(editing ? 'Updated' : 'Created'); qc.invalidateQueries({ queryKey: ['maintenance'] }); setFormOpen(false); setEditing(null); setForm(blankForm); },
    onError:   (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => maintenanceApi.delete(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['maintenance'] }); setDeleting(null); },
    onError:   (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  });

  const columns = [
    { key: 'asset',  header: 'Asset',       render: (r: MaintenanceRecord) => <div><p className="font-medium text-white text-sm">{r.asset_name}</p><p className="font-mono text-indigo-400 text-xs">{r.asset_tag}</p></div> },
    { key: 'type',   header: 'Type',         render: (r: MaintenanceRecord) => <span className="text-slate-400 capitalize">{r.maintenance_type}</span> },
    { key: 'status', header: 'Status',       render: (r: MaintenanceRecord) => <MaintenanceStatusBadge status={r.status} /> },
    { key: 'sched',  header: 'Scheduled',    render: (r: MaintenanceRecord) => <span className="text-slate-400 text-xs">{format(new Date(r.scheduled_date), 'MMM d, yyyy')}</span> },
    { key: 'tech',   header: 'Technician',   render: (r: MaintenanceRecord) => <span className="text-slate-400 text-xs">{r.performed_by ?? '—'}</span> },
    { key: 'cost',   header: 'Cost',         render: (r: MaintenanceRecord) => <span className="text-slate-400 text-xs">{r.cost ? `\$${Number(r.cost).toLocaleString()}` : '—'}</span> },
    {
      key: 'act', header: '',
      render: (r: MaintenanceRecord) => (
        <div className="flex items-center gap-2 justify-end">
          {hasPermission('manage_maintenance') && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(r)}
              className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            ><Pencil className="w-3.5 h-3.5" /></motion.button>
          )}
          {hasPermission('delete_asset') && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setDeleting(r)}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            ><Trash2 className="w-3.5 h-3.5" /></motion.button>
          )}
        </div>
      ),
    },
  ];

  const assetOptions = (assets ?? []).map((a) => ({ value: a.id, label: `${a.asset_tag} — ${a.name}` }));

  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance" subtitle="Schedule and track asset maintenance"
        actions={hasPermission('manage_maintenance') && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditing(null); setForm(blankForm); setFormOpen(true); }}>New Record</Button>
        )}
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable columns={columns} data={records ?? []} keyField="id" loading={isLoading}
          emptyText="No maintenance records" emptyIcon={<Wrench className="w-12 h-12" />}
        />
      </motion.div>

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? 'Edit Record' : 'New Maintenance Record'} size="lg"
        footer={<><Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button><Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>{editing ? 'Save' : 'Create'}</Button></>}
      >
        <div className="grid grid-cols-2 gap-4">
          <Select label="Asset *" value={form.asset_id} onChange={set('asset_id')} options={assetOptions} placeholder="Select asset" className="col-span-2" />
          <Select label="Type" value={form.maintenance_type} onChange={set('maintenance_type')} options={TYPE_OPTS} />
          <Select label="Status" value={form.status} onChange={set('status')} options={STATUS_OPTS} />
          <Input  label="Scheduled Date *" value={form.scheduled_date} onChange={set('scheduled_date')} type="date" />
          <Input  label="Cost (\$)" value={form.cost} onChange={set('cost')} type="number" min="0" />
          <Input  label="Technician / Vendor" value={form.performed_by} onChange={set('performed_by')} placeholder="Name or company" className="col-span-2" />
          <Textarea label="Description *" value={form.description} onChange={set('description')} placeholder="What maintenance is needed?" className="col-span-2" />
          <Textarea label="Notes" value={form.notes} onChange={set('notes')} placeholder="Additional notes…" className="col-span-2" />
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Record" size="sm"
        footer={<><Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleting && deleteMutation.mutate(deleting.id)}>Delete</Button></>}
      >
        <p className="text-slate-400 text-sm">Delete maintenance record for <span className="text-white font-semibold">{deleting?.asset_name}</span>?</p>
      </Modal>
    </div>
  );
};

