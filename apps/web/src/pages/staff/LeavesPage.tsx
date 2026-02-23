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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2 } from 'lucide-react';

export default function LeavesPage() {
  const { data, loading, total, page, totalPages, setSearch, setPage, create, remove } = useCrud({ endpoint: '/staff/leaves' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState({ studentId: '', reason: '', startDate: '', endDate: '' });
  const columns: Column<any>[] = [
    { key: 'student', title: "O'quvchi", render: (i) => i.student?.firstName ? `${i.student.firstName} ${i.student.lastName}` : '-' },
    { key: 'reason', title: 'Sabab', render: (i) => <span className="max-w-xs truncate block">{i.reason}</span> },
    { key: 'status', title: 'Holat', render: (i) => <StatusBadge status={i.status || 'PENDING'} /> },
    { key: 'startDate', title: 'Boshlanishi', render: (i) => i.startDate ? new Date(i.startDate).toLocaleDateString('uz') : '-' },
    { key: 'endDate', title: 'Tugashi', render: (i) => i.endDate ? new Date(i.endDate).toLocaleDateString('uz') : '-' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Ta'til so'rovlari" description="O'quvchilar uchun ta'til so'rovlari" action={{ label: "Yangi so'rov", onClick: () => { setForm({ studentId: '', reason: '', startDate: '', endDate: '' }); setModalOpen(true); } }} />
      <DataTable columns={columns} data={data} loading={loading} searchable onSearch={setSearch} pagination={{ page, totalPages, total, onPageChange: setPage }}
        actions={(item) => (<div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => { setDeleting(item); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)} />
      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Yangi ta'til so'rovi">
        <div className="space-y-4">
          <div className="space-y-2"><Label>O'quvchi ID</Label><Input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Boshlanishi</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="space-y-2"><Label>Tugashi</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Sabab</Label><Textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4"><Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button><Button onClick={async () => { await create(form); setModalOpen(false); }}>Yaratish</Button></div>
      </FormModal>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="O'chirish" description="Bu so'rovni o'chirishga ishonchingiz komilmi?" confirmText="O'chirish" variant="destructive" onConfirm={async () => { if (deleting) { await remove(deleting.id); setDeleteOpen(false); } }} />
    </div>
  );
}
