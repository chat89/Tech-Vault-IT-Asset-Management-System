import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { assetsApi } from '../../api/assets.api';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { Asset, Category, AssetStatus } from '../../types';

const STATUS_OPTS = [
  { value: 'available',         label: 'Available' },
  { value: 'under_maintenance', label: 'Under Maintenance' },
  { value: 'retired',           label: 'Retired' },
  { value: 'disposed',          label: 'Disposed' },
];

interface AssetFormState {
  asset_tag: string;
  name: string;
  description: string;
  category_id: string;
  serial_number: string;
  model: string;
  manufacturer: string;
  purchase_date: string;
  purchase_cost: string;
  warranty_expiry: string;
  status: AssetStatus;
  location: string;
  notes: string;
}

interface Props {
  open:       boolean;
  onClose:    () => void;
  asset:      Asset | null;
  categories: Category[];
}

export const AssetFormModal: React.FC<Props> = ({ open, onClose, asset, categories }) => {
  const qc   = useQueryClient();
  const isEdit = !!asset;

  const [form, setForm] = useState<AssetFormState>({
    asset_tag: '', name: '', description: '', category_id: '',
    serial_number: '', model: '', manufacturer: '',
    purchase_date: '', purchase_cost: '', warranty_expiry: '',
    status: 'available', location: '', notes: '',
  });

  useEffect(() => {
    if (asset) {
      setForm({
        asset_tag:      asset.asset_tag      ?? '',
        name:           asset.name           ?? '',
        description:    asset.description    ?? '',
        category_id:    asset.category_id    ?? '',
        serial_number:  asset.serial_number  ?? '',
        model:          asset.model          ?? '',
        manufacturer:   asset.manufacturer   ?? '',
        purchase_date:  asset.purchase_date  ? asset.purchase_date.slice(0, 10) : '',
        purchase_cost:  asset.purchase_cost != null ? String(asset.purchase_cost) : '',
        warranty_expiry: asset.warranty_expiry ? asset.warranty_expiry.slice(0, 10) : '',
        status:         asset.status         ?? 'available',
        location:       asset.location       ?? '',
        notes:          asset.notes          ?? '',
      });
    } else {
      setForm({ asset_tag: '', name: '', description: '', category_id: '', serial_number: '', model: '', manufacturer: '', purchase_date: '', purchase_cost: '', warranty_expiry: '', status: 'available', location: '', notes: '' });
    }
  }, [asset, open]);

  const set = (k: keyof AssetFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value as never }));

  const mutation = useMutation({
    mutationFn: () => {
      const payload: Partial<Asset> = {
        ...form,
        category_id:   form.category_id   || null,
        purchase_cost: form.purchase_cost  ? Number(form.purchase_cost) : null,
        purchase_date: form.purchase_date  || null,
        warranty_expiry: form.warranty_expiry || null,
        serial_number:   form.serial_number   || null,
        model:           form.model           || null,
        manufacturer:    form.manufacturer    || null,
        location:        form.location        || null,
        description:     form.description     || null,
        notes:           form.notes           || null,
      };
      return isEdit ? assetsApi.update(asset!.id, payload) : assetsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Asset updated' : 'Asset created');
      qc.invalidateQueries({ queryKey: ['assets'] });
      onClose();
    },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save asset'),
  });

  const catOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Asset' : 'New Asset'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>
            {isEdit ? 'Save Changes' : 'Create Asset'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="Asset Tag *"    value={form.asset_tag}     onChange={set('asset_tag')}    placeholder="LPT-0001" required />
        <Input label="Name *"         value={form.name}          onChange={set('name')}          placeholder="Dell Latitude 5530" required />
        <Select label="Category"      value={form.category_id}   onChange={set('category_id')}   options={catOptions} placeholder="Select category" />
        <Select label="Status"        value={form.status}        onChange={set('status')}        options={STATUS_OPTS} />
        <Input label="Serial Number"  value={form.serial_number} onChange={set('serial_number')} placeholder="SN-XXXXXX" />
        <Input label="Model"          value={form.model}         onChange={set('model')}         placeholder="Latitude 5530" />
        <Input label="Manufacturer"   value={form.manufacturer}  onChange={set('manufacturer')}  placeholder="Dell" />
        <Input label="Location"       value={form.location}      onChange={set('location')}      placeholder="Office 3, Rack 2" />
        <Input label="Purchase Date"  value={form.purchase_date} onChange={set('purchase_date')} type="date" />
        <Input label="Purchase Cost (\$)" value={form.purchase_cost} onChange={set('purchase_cost')} type="number" min="0" placeholder="0.00" />
        <Input label="Warranty Expiry" value={form.warranty_expiry} onChange={set('warranty_expiry')} type="date" wrapperClassName="col-span-2" />
        <Textarea label="Description" value={form.description}   onChange={set('description')}   placeholder="Asset description…" className="col-span-2" />
        <Textarea label="Notes"       value={form.notes}         onChange={set('notes')}         placeholder="Additional notes…" className="col-span-2" />
      </div>
    </Modal>
  );
};

