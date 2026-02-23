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

interface SimplePageProps { endpoint: string; title: string; description: string; fields: { key: string; label: string; type?: string }[]; }

export default function SimpleCrudPage({ endpoint, title, description, fields }: SimplePageProps) {
  const { data, loading, total, page, totalPages, setSearch, setPage, create, update, remove } = useCrud({ endpoint });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const emptyForm = Object.fromEntries(fields.map(f => [f.key, '']));
  const [form, setForm] = useState<Record<string, string>>(emptyForm);

  const columns: Column<any>[] = fields.map(f => ({
    key: f.key, title: f.label,
    render: (item: any) => <span className={f.key === 'name' || f.key === 'title' ? 'font-medium' : ''}>{item[f.key] || '-'}</span>,
  }));

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setModalOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm(Object.fromEntries(fields.map(f => [f.key, item[f.key] || '']))); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} action={{ label: `Yangi qo'shish`, onClick: openCreate }} />
      <DataTable columns={columns} data={data} loading={loading} searchable onSearch={setSearch}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
        actions={(item) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { setDeleting(item); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )} />
      <FormModal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Tahrirlash' : `Yangi ${title.toLowerCase()}`}>
        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              {f.type === 'textarea' ? (
                <Textarea value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              ) : (
                <Input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
          <Button onClick={async () => { if (editing) await update(editing.id, form); else await create(form); setModalOpen(false); }}>{editing ? 'Saqlash' : 'Yaratish'}</Button>
        </div>
      </FormModal>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="O'chirish" description="Bu elementni o'chirishga ishonchingiz komilmi?"
        confirmText="O'chirish" variant="destructive" onConfirm={async () => { if (deleting) { await remove(deleting.id); setDeleteOpen(false); } }} />
    </div>
  );
}
