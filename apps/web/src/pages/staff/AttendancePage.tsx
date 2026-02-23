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
import { Pencil } from 'lucide-react';

export default function AttendancePage() {
  const { data, loading, total, page, totalPages, setSearch, setPage, create } = useCrud({ endpoint: '/staff/attendance/sessions' });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: 'CLASS', date: '', groupId: '' });

  const columns: Column<any>[] = [
    { key: 'date', title: 'Sana', render: (i) => i.date ? new Date(i.date).toLocaleDateString('uz') : '-' },
    { key: 'type', title: 'Turi', render: (i) => <StatusBadge status="ACTIVE" label={i.type === 'CLASS' ? 'Dars' : i.type === 'STUDY_HALL' ? 'O\'qish zali' : 'Tadbir'} /> },
    { key: 'group', title: 'Guruh', render: (i) => i.group?.name || '-' },
    { key: 'present', title: 'Kelgan', render: (i) => <span className="text-success font-medium">{i.presentCount ?? '-'}</span> },
    { key: 'absent', title: 'Kelmagan', render: (i) => <span className="text-destructive font-medium">{i.absentCount ?? '-'}</span> },
    { key: 'late', title: 'Kechikkan', render: (i) => <span className="text-warning font-medium">{i.lateCount ?? '-'}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Davomat" description="Davomat sessiyalari va belgilash" action={{ label: 'Yangi sessiya', onClick: () => { setForm({ type: 'CLASS', date: '', groupId: '' }); setModalOpen(true); } }} />
      <DataTable columns={columns} data={data} loading={loading} searchable onSearch={setSearch}
        pagination={{ page, totalPages, total, onPageChange: setPage }} />
      <FormModal open={modalOpen} onOpenChange={setModalOpen} title="Yangi davomat sessiyasi">
        <div className="space-y-4">
          <div className="space-y-2"><Label>Sana</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div className="space-y-2"><Label>Turi</Label>
            <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CLASS">Dars</SelectItem>
                <SelectItem value="STUDY_HALL">O'qish zali</SelectItem>
                <SelectItem value="EVENT">Tadbir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
          <Button onClick={async () => { await create(form); setModalOpen(false); }}>Yaratish</Button>
        </div>
      </FormModal>
    </div>
  );
}
