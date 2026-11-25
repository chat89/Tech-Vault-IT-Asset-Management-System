import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Users, Pencil, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { usersApi } from '../../api/users.api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { DataTable } from '../../components/ui/DataTable';
import { Badge, RoleBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import type { User, Role } from '../../types';

export const UsersPage: React.FC = () => {
  const { user: me, isRole } = useAuth();
  const qc = useQueryClient();
  const [formOpen,  setFormOpen]  = useState(false);
  const [editing,   setEditing]   = useState<User | null>(null);
  const [deactUser, setDeactUser] = useState<User | null>(null);

  const blankForm = { full_name: '', email: '', password: '', role_id: '' };
  const [form, setForm] = useState(blankForm);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn:  () => usersApi.list().then((r) => r.data.data.users),
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn:  () => usersApi.roles().then((r) => r.data.data.roles),
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ full_name: u.full_name, email: u.email, password: '', role_id: u.role_id });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      if (editing) {
        const payload: Partial<User & { password?: string }> = { full_name: form.full_name, email: form.email, role_id: form.role_id };
        if (form.password) payload.password = form.password;
        return usersApi.update(editing.id, payload);
      }
      return usersApi.create({ full_name: form.full_name, email: form.email, password: form.password, role_id: form.role_id });
    },
    onSuccess: () => { toast.success(editing ? 'User updated' : 'User created'); qc.invalidateQueries({ queryKey: ['users'] }); setFormOpen(false); setEditing(null); setForm(blankForm); },
    onError:   (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => { toast.success('User deactivated'); qc.invalidateQueries({ queryKey: ['users'] }); setDeactUser(null); },
    onError:   (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  });

  const roleOptions = (roles ?? []).map((r: Role) => ({ value: r.id, label: r.label }));

  const columns = [
    {
      key: 'name', header: 'User',
      render: (r: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {r.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white text-sm">{r.full_name}</p>
            <p className="text-slate-500 text-xs">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role',   header: 'Role',        render: (r: User) => <RoleBadge role={r.role_name} /> },
    { key: 'status', header: 'Status',      render: (r: User) => r.is_active ? <Badge variant="green" dot>Active</Badge> : <Badge variant="red" dot>Inactive</Badge> },
    { key: 'login',  header: 'Last Login',  render: (r: User) => <span className="text-slate-500 text-xs">{r.last_login_at ? format(new Date(r.last_login_at), 'MMM d, yyyy HH:mm') : 'Never'}</span> },
    { key: 'joined', header: 'Joined',      render: (r: User) => <span className="text-slate-500 text-xs">{format(new Date(r.created_at), 'MMM d, yyyy')}</span> },
    {
      key: 'act', header: '',
      render: (r: User) => r.id === me?.id ? null : (
        <div className="flex items-center gap-2 justify-end">
          {isRole('super_admin') && (
            <>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(r)}
                className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
              ><Pencil className="w-3.5 h-3.5" /></motion.button>
              {r.is_active && (
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setDeactUser(r)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                ><UserX className="w-3.5 h-3.5" /></motion.button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" subtitle={`${users?.length ?? 0} registered users`}
        actions={isRole('super_admin') && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => { setEditing(null); setForm(blankForm); setFormOpen(true); }}>New User</Button>
        )}
      />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DataTable columns={columns} data={users ?? []} keyField="id" loading={isLoading}
          emptyText="No users found" emptyIcon={<Users className="w-12 h-12" />}
        />
      </motion.div>

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditing(null); }} title={editing ? 'Edit User' : 'New User'} size="md"
        footer={<><Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button><Button loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>{editing ? 'Save' : 'Create'}</Button></>}
      >
        <div className="space-y-4">
          <Input label="Full Name *" value={form.full_name} onChange={set('full_name')} placeholder="John Doe" />
          <Input label="Email *" value={form.email} onChange={set('email')} type="email" placeholder="john@company.com" />
          <Input label={editing ? 'New Password (leave blank to keep current)' : 'Password *'} value={form.password} onChange={set('password')} type="password" placeholder="••••••••" />
          <Select label="Role *" value={form.role_id} onChange={set('role_id')} options={roleOptions} placeholder="Select role" />
        </div>
      </Modal>

      {/* Deactivate confirm */}
      <Modal open={!!deactUser} onClose={() => setDeactUser(null)} title="Deactivate User" size="sm"
        footer={<><Button variant="ghost" onClick={() => setDeactUser(null)}>Cancel</Button><Button variant="danger" loading={deactivateMutation.isPending} onClick={() => deactUser && deactivateMutation.mutate(deactUser.id)}>Deactivate</Button></>}
      >
        <p className="text-slate-400 text-sm">Deactivate <span className="text-white font-semibold">{deactUser?.full_name}</span>? They will no longer be able to log in.</p>
      </Modal>
    </div>
  );
};

