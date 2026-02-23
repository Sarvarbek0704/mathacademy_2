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

export default function AssessmentsPage() {
  const { data, loading, total, page, totalPages, setSearch, setPage, create, update, remove } = useCrud({ endpoint: '/staff/assessments' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState({ title: '', type: 'WEEKLY_TEST', maxScore: '100', weight: '1', date: '' });

  const typeLabels: Record<string, string> = { WEEKLY_TEST: 'Haftalik test', BLOCK_TEST: 'Blok test', WRITTEN: 'Yozma', CONTROL: 'Nazorat', MOCK: 'Sinov' };

  const columns: Column<any>[] = [
    { key: 'title', title: 'Nomi', render: (i) => <span className="font-medium">{i.title}</span> },
    { key: 'type', title: 'Turi', render: (i) => <StatusBadge status="ACTIVE" label={typeLabels[i.type] || i.type} /> },
    { key: 'maxScore', title: 'Max ball', render: (i) => i.maxScore || i.max_score || '-' },
    { key: 'weight', title: 'Vazni', render: (i) => `x${i.weight || 1}` },
    { key: 'date', title: 'Sana', render: (i) => i.date ? new Date(i.date).toLocaleDateString('uz') : '-' },
  ];

  const openCreate = () => { setEditing(null); setForm({ title: '', type: 'WEEKLY_TEST', maxScore: '100', weight: '1', date: '' }); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <PageHeader title="Testlar va baholash" description="Barcha baholash turlari" action={{ label: 'Yangi test', onClick: openCreate }} />
      <DataTable columns={columns} data={data} loading={loading} searchable onSearch={setSearch}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
        actions={(item) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => { setEditing(item); setForm({ title: item.title, type: item.type, maxScore: String(item.maxScore || 100), weight: String(item.weight || 1), date: item.date?.split('T')[0] || '' }); setModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { setDeleting(item); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )} />
      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Tahrirlash' : 'Yangi test'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2"><Label>Nomi</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Turi</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY_TEST">Haftalik test</SelectItem>
                <SelectItem value="BLOCK_TEST">Blok test</SelectItem>
                <SelectItem value="WRITTEN">Yozma</SelectItem>
                <SelectItem value="CONTROL">Nazorat</SelectItem>
                <SelectItem value="MOCK">Sinov</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Sana</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div className="space-y-2"><Label>Max ball</Label><Input type="number" value={form.maxScore} onChange={e => setForm({ ...form, maxScore: e.target.value })} /></div>
          <div className="space-y-2"><Label>Vazn (koeffitsient)</Label><Input type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
          <Button onClick={async () => { if (editing) await update(editing.id, form); else await create(form); setModalOpen(false); }}>{editing ? 'Saqlash' : 'Yaratish'}</Button>
        </div>
      </FormModal>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="O'chirish" description={`"${deleting?.title}" ni o'chirishga ishonchingiz komilmi?`}
        confirmText="O'chirish" variant="destructive" onConfirm={async () => { if (deleting) { await remove(deleting.id); setDeleteOpen(false); } }} />
    </div>
  );
}
