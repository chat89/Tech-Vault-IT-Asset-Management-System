import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Monitor, QrCode, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { assetsApi } from '../../api/assets.api';
import { categoriesApi } from '../../api/categories.api';
import { telemetryApi, type TelemetryRecord } from '../../api/telemetry.api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { AssetStatusBadge } from '../../components/ui/Badge';
import { HealthBadge } from '../../components/ui/HealthBadge';
import { AssetFormModal } from './AssetFormModal';
import { AssetQrModal } from '../../components/ui/AssetQrModal';
import { Modal } from '../../components/ui/Modal';
import { exportToCsv } from '../../utils/exportCsv';
import type { Asset } from '../../types';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'available', label: 'Available' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'under_maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
  { value: 'disposed', label: 'Disposed' },
];

export const AssetsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const qc = useQueryClient();

  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page,       setPage]       = useState(1);
  const [formOpen,   setFormOpen]   = useState(false);
  const [editing,    setEditing]    = useState<Asset | null>(null);
  const [deleting,   setDeleting]   = useState<Asset | null>(null);
  const [qrAsset,    setQrAsset]    = useState<Asset | null>(null);

  const handleExportCsv = () => {
    if (!data?.assets || !data.assets.length) {
      toast.error('No assets available to export');
      return;
    }
    exportToCsv(
      'TechVault_Asset_Register',
      data.assets,
      [
        { key: 'asset_tag', label: 'Asset Tag' },
        { key: 'name', label: 'Asset Name' },
        { key: 'category_name', label: 'Category' },
        { key: 'status', label: 'Status' },
        { key: 'serial_number', label: 'Serial Number' },
        { key: 'location', label: 'Location' },
        { key: 'purchase_cost', label: 'Purchase Cost (USD)' },
        { key: 'purchase_date', label: 'Purchase Date' },
      ]
    );
    toast.success('Asset register CSV downloaded');
  };

  const { data, isLoading } = useQuery({
    queryKey: ['assets', { search, status, categoryId, page }],
    queryFn:  () => assetsApi.list({ search: search || undefined, status: status || undefined, category_id: categoryId || undefined, page, limit: 15 }).then((r) => r.data.data),
    placeholderData: (prev) => prev,
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn:  () => categoriesApi.list().then((r) => r.data.data.categories),
  });

  // Fetch live telemetry (refetch every 60s)
  const { data: telemetryData } = useQuery({
    queryKey: ['telemetry'],
    queryFn:  () => telemetryApi.list().then((r) => r.data.data.telemetry),
    refetchInterval: 60_000,
  });

  // Build a lookup map: assetId → latest telemetry
  const telemetryMap = new Map<string, TelemetryRecord>(
    (telemetryData ?? []).map((t) => [t.asset_id, t])
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess:  () => { toast.success('Asset deleted'); qc.invalidateQueries({ queryKey: ['assets'] }); setDeleting(null); },
    onError:    (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete'),
  });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...(catData ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  const columns = [
    { key: 'tag',    header: 'Asset Tag', render: (r: Asset) => <span className="font-mono text-indigo-400 text-xs font-semibold">{r.asset_tag}</span> },
    { key: 'name',   header: 'Name',      render: (r: Asset) => <span className="font-medium text-white">{r.name}</span> },
    { key: 'cat',    header: 'Category',  render: (r: Asset) => <span className="text-slate-400">{r.category_name ?? '—'}</span> },
    { key: 'status', header: 'Status',    render: (r: Asset) => <AssetStatusBadge status={r.status} /> },
    {
      key: 'health',
      header: 'Health',
      render: (r: Asset) => {
        const t = telemetryMap.get(r.id);
        if (!t) return <span className="text-slate-600 text-xs">No data</span>;
        return (
          <HealthBadge
            healthScore={t.health_score}
            batteryLevel={t.battery_level}
            diskStatus={t.disk_status}
            compact
          />
        );
      },
    },
    { key: 'loc',    header: 'Location',  render: (r: Asset) => <span className="text-slate-400">{r.location ?? '—'}</span> },
    { key: 'date',   header: 'Added',     render: (r: Asset) => <span className="text-slate-500 text-xs">{format(new Date(r.created_at), 'MMM d, yyyy')}</span> },
    {
      key: 'actions', header: '',
      render: (r: Asset) => (
        <div className="flex items-center gap-2 justify-end">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); setQrAsset(r); }}
            className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
            title="View & Print QR Asset Tag"
          ><QrCode className="w-3.5 h-3.5" /></motion.button>
          {hasPermission('update_asset') && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setEditing(r); setFormOpen(true); }}
              className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
            ><Pencil className="w-3.5 h-3.5" /></motion.button>
          )}
          {hasPermission('delete_asset') && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setDeleting(r); }}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            ><Trash2 className="w-3.5 h-3.5" /></motion.button>
          )}
        </div>
      ),
    },
  ];

  const total = data?.total ?? 0;
  const pages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        subtitle={`${total} total assets`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
            {hasPermission('create_asset') && (
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditing(null); setFormOpen(true); }}>
                New Asset
              </Button>
            )}
          </div>
        }
      />

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Input
          placeholder="Search by name, tag or serial…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<Search className="w-4 h-4" />}
          wrapperClassName="flex-1"
        />
        <Select options={STATUS_OPTIONS} value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="sm:w-44"
        />
        <Select options={categoryOptions} value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="sm:w-44"
          placeholder="All Categories"
        />
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <DataTable columns={columns} data={data?.assets ?? []} keyField="id" loading={isLoading}
          emptyText="No assets found" emptyIcon={<Monitor className="w-12 h-12" />}
        />
      </motion.div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AssetFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        asset={editing}
        categories={catData ?? []}
      />

      {/* QR Code Tag Modal */}
      <AssetQrModal
        open={!!qrAsset}
        onClose={() => setQrAsset(null)}
        asset={qrAsset}
      />

      {/* Delete confirmation */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Asset" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleting && deleteMutation.mutate(deleting.id)}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-slate-400 text-sm">
          Are you sure you want to delete <span className="text-white font-semibold">{deleting?.name}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

