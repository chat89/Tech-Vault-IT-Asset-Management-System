import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Inbox, CheckCircle2, XCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { requestsApi } from '../../api/requests.api';
import { categoriesApi } from '../../api/categories.api';
import { assetsApi } from '../../api/assets.api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { RequestStatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import type { AssetRequest, RequestPriority, RequestStatus } from '../../types';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low — General Hardware Refresh' },
  { value: 'medium', label: 'Medium — Standard Workstation Requirement' },
  { value: 'high', label: 'High — Project Blocker / Defective Unit' },
  { value: 'urgent', label: 'Urgent — Executive / Mission Critical' },
];

/** SoD tooltip shown when admin tries to self-review */
const SodWarningTooltip: React.FC<{ show: boolean }> = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 z-50"
      >
        <div className="bg-amber-900/95 border border-amber-600/60 rounded-xl p-3 shadow-2xl">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-300 mb-0.5">SoD Policy Violation</p>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                You cannot approve, reject, or fulfill a requisition you submitted. Another administrator must review it.
              </p>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-amber-600/60" />
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/** Action button with SoD lock */
const SodActionButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  colorClass: string;
  isSodLocked: boolean;
}> = ({ label, icon, onClick, colorClass, isSodLocked }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={isSodLocked ? undefined : onClick}
        onMouseEnter={() => isSodLocked && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        disabled={isSodLocked}
        className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
          isSodLocked
            ? 'bg-amber-500/10 text-amber-500/50 cursor-not-allowed border border-amber-500/20'
            : `${colorClass} cursor-pointer`
        }`}
        title={isSodLocked ? 'SoD Policy: Cannot self-review' : label}
      >
        {isSodLocked ? <ShieldAlert className="w-3.5 h-3.5 text-amber-500/50" /> : icon}
        {label}
      </button>
      <SodWarningTooltip show={hovered} />
    </div>
  );
};

export const RequestsPage: React.FC = () => {
  const { isRole, user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = isRole('super_admin', 'it_admin');

  const [formOpen, setFormOpen] = useState(false);
  const [reviewing, setReviewing] = useState<AssetRequest | null>(null);
  const [adminAction, setAdminAction] = useState<RequestStatus>('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [allocatedAssetId, setAllocatedAssetId] = useState('');

  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [assetType, setAssetType] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('medium');
  const [reason, setReason] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['asset-requests'],
    queryFn: () => requestsApi.list().then((r) => r.data.data.requests),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data.data.categories),
  });

  const { data: availableAssets } = useQuery({
    queryKey: ['available-assets-for-req'],
    queryFn: () => assetsApi.list({ status: 'available', limit: 100 }).then((r) => r.data.data.assets),
    enabled: !!reviewing && isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      requestsApi.create({
        category_id: categoryId || undefined,
        asset_type: assetType,
        priority,
        reason,
      }),
    onSuccess: () => {
      toast.success('Asset requisition submitted successfully');
      qc.invalidateQueries({ queryKey: ['asset-requests'] });
      setFormOpen(false);
      setAssetType('');
      setReason('');
      setCategoryId('');
    },
    onError: (e: unknown) =>
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to submit request'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: () =>
      requestsApi.updateStatus(reviewing!.id, {
        status: adminAction,
        admin_notes: adminNotes || undefined,
        asset_id: allocatedAssetId || undefined,
      }),
    onSuccess: () => {
      toast.success(`Request ${adminAction} successfully`);
      qc.invalidateQueries({ queryKey: ['asset-requests'] });
      qc.invalidateQueries({ queryKey: ['assets'] });
      setReviewing(null);
      setAdminNotes('');
      setAllocatedAssetId('');
    },
    onError: (e: unknown) =>
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update request'),
  });

  const openReviewModal = (req: AssetRequest, action: RequestStatus) => {
    setReviewing(req);
    setAdminAction(action);
    setAdminNotes(req.admin_notes || '');
    setAllocatedAssetId(req.asset_id || '');
  };

  const columns = [
    {
      key: 'type',
      header: 'Requested Item',
      render: (r: AssetRequest) => (
        <div>
          <p className="font-semibold text-white text-sm">{r.asset_type}</p>
          <p className="text-xs text-indigo-400">{r.category_name || 'General Hardware'}</p>
        </div>
      ),
    },
    {
      key: 'requester',
      header: 'Requester',
      render: (r: AssetRequest) => (
        <div>
          <p className="font-medium text-slate-200 text-sm">{r.requester_name}</p>
          <p className="text-xs text-slate-500">{r.requester_email}</p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (r: AssetRequest) => <PriorityBadge priority={r.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: AssetRequest) => <RequestStatusBadge status={r.status} />,
    },
    {
      key: 'reason',
      header: 'Business Justification',
      render: (r: AssetRequest) => (
        <span className="text-slate-300 text-xs line-clamp-2 max-w-xs" title={r.reason}>
          {r.reason}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Submitted',
      render: (r: AssetRequest) => (
        <span className="text-slate-400 text-xs">{format(new Date(r.created_at), 'MMM d, yyyy')}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (r: AssetRequest) => {
        // SoD: admin is blocked from self-reviewing their own requisitions
        const isSodLocked = isAdmin && r.user_id === user?.id;
        return (
          <div className="flex items-center gap-1.5 justify-end">
            {isAdmin && r.status === 'pending' && (
              <>
                <SodActionButton
                  label="Approve"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => openReviewModal(r, 'approved')}
                  colorClass="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  isSodLocked={isSodLocked}
                />
                <SodActionButton
                  label="Reject"
                  icon={<XCircle className="w-3.5 h-3.5" />}
                  onClick={() => openReviewModal(r, 'rejected')}
                  colorClass="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  isSodLocked={isSodLocked}
                />
              </>
            )}
            {isAdmin && r.status === 'approved' && (
              <SodActionButton
                label="Fulfill"
                icon={<ShieldCheck className="w-3.5 h-3.5" />}
                onClick={() => openReviewModal(r, 'fulfilled')}
                colorClass="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                isSodLocked={isSodLocked}
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? 'Asset Requisition Center' : 'My Asset Requests'}
        subtitle={
          isAdmin
            ? 'Review, approve, and allocate enterprise equipment for personnel'
            : 'Track your hardware requisitions and submit new equipment requests'
        }
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setFormOpen(true)}>
            Request Asset
          </Button>
        }
      />

      {/* SoD Policy Notice (admin view) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl"
        >
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-300/80">
            <span className="font-semibold text-amber-300">Segregation of Duties (SoD) Policy active.</span>{' '}
            Administrators cannot approve, reject, or fulfill requisitions they submitted themselves.
            Locked actions are highlighted with <span className="text-amber-400">⚠</span>.
          </p>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable
          columns={columns}
          data={requests ?? []}
          keyField="id"
          loading={isLoading}
          emptyText="No asset requests recorded"
          emptyIcon={<Inbox className="w-12 h-12" />}
        />
      </motion.div>

      {/* New Request Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Submit Asset Requisition"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!assetType || !reason}
              loading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              Submit Requisition
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Required Item / Model *"
            placeholder="e.g. MacBook Pro 16 or Dell 4K Monitor"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
          />
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select hardware category"
          />
          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value as RequestPriority)}
            options={PRIORITY_OPTIONS}
          />
          <Textarea
            label="Business Reason / Justification *"
            placeholder="Describe why this hardware is required for your project or operational responsibilities..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>
      </Modal>

      {/* Review & Transition Status Modal */}
      <Modal
        open={!!reviewing}
        onClose={() => setReviewing(null)}
        title={`${adminAction.toUpperCase()} Asset Requisition`}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setReviewing(null)}>
              Cancel
            </Button>
            <Button
              variant={adminAction === 'rejected' ? 'danger' : 'primary'}
              loading={updateStatusMutation.isPending}
              onClick={() => updateStatusMutation.mutate()}
            >
              Confirm {adminAction}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <p className="text-xs text-slate-400">Request Item: <span className="text-white font-medium">{reviewing?.asset_type}</span></p>
            <p className="text-xs text-slate-400">Requester: <span className="text-white font-medium">{reviewing?.requester_name} ({reviewing?.requester_email})</span></p>
            <p className="text-xs text-slate-400">Reason: <span className="text-slate-200">{reviewing?.reason}</span></p>
          </div>

          {adminAction === 'fulfilled' && (
            <Select
              label="Allocate Available Asset"
              value={allocatedAssetId}
              onChange={(e) => setAllocatedAssetId(e.target.value)}
              options={(availableAssets ?? []).map((a) => ({ value: a.id, label: `${a.asset_tag} — ${a.name} (${a.location || 'Storage'})` }))}
              placeholder="Select asset from inventory"
            />
          )}

          <Textarea
            label="Administrative Notes / Decision Rationale"
            placeholder="Provide optional explanation or procurement timeline details..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
