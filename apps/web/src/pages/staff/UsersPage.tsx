import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useCrud } from '@/hooks/useCrud';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pencil, Trash2 } from 'lucide-react';

export default function UsersPage() {
  const { data, loading, total, page, totalPages, setSearch, setPage, create, update, remove } = useCrud({ endpoint: '/staff/users' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState({ username: '', fullName: '', password: '' });

  const columns: Column<any>[] = [
    {
      key: 'user', title: 'Foydalanuvchi',
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-info/10 text-info text-xs font-bold">
              {(item.fullName || item.full_name || item.username || '?')[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.fullName || item.full_name}</p>
            <p className="text-xs text-muted-foreground">@{item.username}</p>
          </div>
        </div>
      ),
    },
    { key: 'roles', title: 'Rollar', render: (item) => (item.roles || []).join(', ') || '-' },
    { key: 'createdAt', title: 'Yaratilgan', render: (item) => item.createdAt ? new Date(item.createdAt).toLocaleDateString('uz') : '-' },
  ];

  const openCreate = () => { setEditing(null); setForm({ username: '', fullName: '', password: '' }); setModalOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ username: item.username, fullName: item.fullName || item.full_name || '', password: '' }); setModalOpen(true); };

  const handleSubmit = async () => {
    const body: any = { username: form.username, fullName: form.fullName };
    if (form.password) body.password = form.password;
    if (editing) await update(editing.id, body);
    else await create({ ...body, password: form.password || 'changeme123' });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Foydalanuvchilar" description="Xodimlar boshqaruvi (faqat Superadmin)"
        action={{ label: 'Yangi foydalanuvchi', onClick: openCreate }} />
      <DataTable columns={columns} data={data} loading={loading} searchable onSearch={setSearch}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
        actions={(item) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { setDeleting(item); setDeleteOpen(true); }}>
              <Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )} />
      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Tahrirlash' : 'Yangi foydalanuvchi'}>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Ism</Label><Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
          <div className="space-y-2"><Label>Username</Label><Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
          <div className="space-y-2"><Label>Parol {editing && '(bo\'sh qoldirsa o\'zgarmaydi)'}</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
          <Button onClick={handleSubmit}>{editing ? 'Saqlash' : 'Yaratish'}</Button>
        </div>
      </FormModal>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="O'chirish" description={`"${deleting?.fullName || deleting?.username}" ni o'chirishga ishonchingiz komilmi?`}
        confirmText="O'chirish" variant="destructive" onConfirm={async () => { if (deleting) { await remove(deleting.id); setDeleteOpen(false); } }} />
    </div>
  );
}
