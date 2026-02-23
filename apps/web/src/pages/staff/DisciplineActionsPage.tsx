import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { FormModal } from '@/components/shared/FormModal';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useCrud } from '@/hooks/useCrud';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function DisciplineActionsPage() {
  const { data, loading, total, page, totalPages, setSearch, setPage, create } = useCrud({ endpoint: '/staff/discipline/actions' });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ violationId: '', type: 'WARNING', notes: '' });

  const columns: Column<any>[] = [
    { key: 'student', title: "O'quvchi", render: (i) => i.violation?.student?.firstName ? `${i.violation.student.firstName} ${i.violation.student.lastName}` : '-' },
    { key: 'type', title: 'Jazo turi', render: (i) => <StatusBadge status={i.type === 'WARNING' ? 'YELLOW' : i.type === 'EXPELLED' ? 'RED' : 'YELLOW'} label={i.type} /> },
    { key: 'issuedBy', title: "Beruvchi", render: (i) => i.issuedBy?.fullName || '-' },
    { key: 'createdAt', title: 'Sana', render: (i) => i.createdAt ? new Date(i.createdAt).toLocaleDateString('uz') : '-' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Jazolar" description="Intizomiy choralar" action={{ label: 'Yangi jazo', onClick: () => { setForm({ violationId: '', type: 'WARNING', notes: '' }); setModalOpen(true); } }} />
      <DataTable columns={columns} data={data} loading={loading} searchable onSearch={setSearch}
        pagination={{ page, totalPages, total, onPageChange: setPage }} />
      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Yangi intizomiy chora">
        <div className="space-y-4">
          <div className="space-y-2"><Label>Qoidabuzarlik ID</Label><Input value={form.violationId} onChange={e => setForm({ ...form, violationId: e.target.value })} /></div>
          <div className="space-y-2"><Label>Turi</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WARNING">Ogohlantirish</SelectItem>
                <SelectItem value="RESTRICTION">Cheklash</SelectItem>
                <SelectItem value="FINAL_NOTICE">Oxirgi ogohlantirish</SelectItem>
                <SelectItem value="EXPELLED">Chetlatish</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Izoh</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
          <Button onClick={async () => { await create(form); setModalOpen(false); }}>Yaratish</Button>
        </div>
      </FormModal>
    </div>
  );
}
