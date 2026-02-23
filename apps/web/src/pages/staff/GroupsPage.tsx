import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useCrud } from '@/hooks/useCrud';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2 } from 'lucide-react';

export default function GroupsPage() {
  const { data, loading, total, page, totalPages, setSearch, setPage, create, update, remove } = useCrud({ endpoint: '/staff/groups' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState({ name: '', grade: '10' });

  const columns: Column<any>[] = [
    { key: 'name', title: 'Guruh nomi', render: (i) => <span className="font-semibold">{i.name}</span> },
    { key: 'grade', title: 'Sinf' },
    { key: 'studentsCount', title: "O'quvchilar soni", render: (i) => i.studentsCount ?? i._count?.students ?? '-' },
    { key: 'academicYear', title: "O'quv yili", render: (i) => i.academicYear?.name || '-' },
  ];

  const openCreate = () => { setEditing(null); setForm({ name: '', grade: '10' }); setModalOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ name: item.name, grade: String(item.grade || '10') }); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <PageHeader title="Guruhlar" description="Sinflar va guruhlar boshqaruvi" action={{ label: 'Yangi guruh', onClick: openCreate }} />
      <DataTable columns={columns} data={data} loading={loading} searchable onSearch={setSearch}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
        actions={(item) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { setDeleting(item); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )} />
      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Tahrirlash' : 'Yangi guruh'}>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Nomi</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="10-A" /></div>
          <div className="space-y-2"><Label>Sinf</Label>
            <Select value={form.grade} onValueChange={v => setForm({ ...form, grade: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="11">11</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
          <Button onClick={async () => { if (editing) await update(editing.id, form); else await create(form); setModalOpen(false); }}>{editing ? 'Saqlash' : 'Yaratish'}</Button>
        </div>
      </FormModal>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="O'chirish" description={`"${deleting?.name}" ni o'chirishga ishonchingiz komilmi?`}
        confirmText="O'chirish" variant="destructive" onConfirm={async () => { if (deleting) { await remove(deleting.id); setDeleteOpen(false); } }} />
    </div>
  );
}
