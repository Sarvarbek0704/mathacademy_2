import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useCrud } from '@/hooks/useCrud';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2 } from 'lucide-react';

export default function ViolationsPage() {
  const { data, loading, total, page, totalPages, setSearch, setPage, create, update, remove } = useCrud({ endpoint: '/staff/discipline/violations' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState({ studentId: '', description: '', date: '' });

  const columns: Column<any>[] = [
    { key: 'student', title: "O'quvchi", render: (i) => <span className="font-medium">{i.student?.firstName || ''} {i.student?.lastName || ''}</span> },
    { key: 'description', title: 'Tavsif', render: (i) => <span className="max-w-xs truncate block">{i.description}</span> },
    { key: 'date', title: 'Sana', render: (i) => i.date ? new Date(i.date).toLocaleDateString('uz') : '-' },
    { key: 'issuedBy', title: "Yozgan xodim", render: (i) => i.issuedBy?.fullName || '-' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Qoidabuzarliklar" description="Intizom buzilish holatlari" action={{ label: 'Yangi qoidabuzarlik', onClick: () => { setEditing(null); setForm({ studentId: '', description: '', date: '' }); setModalOpen(true); } }} />
      <DataTable columns={columns} data={data} loading={loading} searchable onSearch={setSearch}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
        actions={(item) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => { setEditing(item); setForm({ studentId: item.studentId || '', description: item.description || '', date: item.date?.split('T')[0] || '' }); setModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { setDeleting(item); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )} />
      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Tahrirlash' : 'Yangi qoidabuzarlik'}>
        <div className="space-y-4">
          <div className="space-y-2"><Label>O'quvchi ID</Label><Input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} /></div>
          <div className="space-y-2"><Label>Sana</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div className="space-y-2"><Label>Tavsif</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
          <Button onClick={async () => { if (editing) await update(editing.id, form); else await create(form); setModalOpen(false); }}>{editing ? 'Saqlash' : 'Yaratish'}</Button>
        </div>
      </FormModal>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="O'chirish" description="Bu qoidabuzarlikni o'chirishga ishonchingiz komilmi?"
        confirmText="O'chirish" variant="destructive" onConfirm={async () => { if (deleting) { await remove(deleting.id); setDeleteOpen(false); } }} />
    </div>
  );
}
