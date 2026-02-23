import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useCrud } from '@/hooks/useCrud';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2 } from 'lucide-react';

export default function AcademicYearsPage() {
  const { data, loading, total, page, totalPages, setSearch, setPage, create, update, remove } = useCrud({ endpoint: '/academic-years' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', isCurrent: false });

  const columns: Column<any>[] = [
    { key: 'name', title: 'Nomi', render: (i) => <span className="font-medium">{i.name}</span> },
    { key: 'startDate', title: 'Boshlanishi', render: (i) => i.startDate ? new Date(i.startDate).toLocaleDateString('uz') : '-' },
    { key: 'endDate', title: 'Tugashi', render: (i) => i.endDate ? new Date(i.endDate).toLocaleDateString('uz') : '-' },
    { key: 'isCurrent', title: 'Joriy', render: (i) => i.isCurrent ? <StatusBadge status="ACTIVE" label="Joriy" /> : <StatusBadge status="CLOSED" label="Tugagan" /> },
  ];

  const openCreate = () => { setEditing(null); setForm({ name: '', startDate: '', endDate: '', isCurrent: false }); setModalOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ name: item.name, startDate: item.startDate?.split('T')[0] || '', endDate: item.endDate?.split('T')[0] || '', isCurrent: item.isCurrent }); setModalOpen(true); };

  const handleSubmit = async () => {
    if (editing) await update(editing.id, form); else await create(form);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="O'quv yillari" description="Akademik yillar boshqaruvi" action={{ label: "Yangi o'quv yili", onClick: openCreate }} />
      <DataTable columns={columns} data={data} loading={loading} searchable onSearch={setSearch}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
        actions={(item) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { setDeleting(item); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )} />
      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Tahrirlash' : "Yangi o'quv yili"}>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Nomi</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="2024-2025" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Boshlanish sanasi</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="space-y-2"><Label>Tugash sanasi</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
          <Button onClick={handleSubmit}>{editing ? 'Saqlash' : 'Yaratish'}</Button>
        </div>
      </FormModal>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="O'chirish" description={`"${deleting?.name}" ni o'chirishga ishonchingiz komilmi?`}
        confirmText="O'chirish" variant="destructive" onConfirm={async () => { if (deleting) { await remove(deleting.id); setDeleteOpen(false); } }} />
    </div>
  );
}
