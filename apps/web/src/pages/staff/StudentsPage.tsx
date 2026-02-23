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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function StudentsPage() {
  const { data, loading, total, page, totalPages, setSearch, setPage, create, update, remove } = useCrud({ endpoint: '/staff/students' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', studentId: '', grade: '10', status: 'ACTIVE', phoneGuardian: '' });

  const columns: Column<any>[] = [
    {
      key: 'name', title: "O'quvchi",
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {(item.firstName || item.first_name || '?')[0]}{(item.lastName || item.last_name || '?')[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.firstName || item.first_name} {item.lastName || item.last_name}</p>
            <p className="text-xs text-muted-foreground">{item.studentId || item.student_id}</p>
          </div>
        </div>
      ),
    },
    { key: 'grade', title: 'Sinf', render: (item) => <span className="font-medium">{item.grade || '-'}</span> },
    { key: 'group', title: 'Guruh', render: (item) => item.group?.name || item.groupName || '-' },
    { key: 'status', title: 'Status', render: (item) => <StatusBadge status={item.status || 'ACTIVE'} /> },
    { key: 'livingType', title: 'Yashash turi', render: (item) => item.livingType || item.living_type || '-' },
  ];

  const openCreate = () => {
    setEditing(null);
    setForm({ firstName: '', lastName: '', studentId: '', grade: '10', status: 'ACTIVE', phoneGuardian: '' });
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      firstName: item.firstName || item.first_name || '',
      lastName: item.lastName || item.last_name || '',
      studentId: item.studentId || item.student_id || '',
      grade: String(item.grade || '10'),
      status: item.status || 'ACTIVE',
      phoneGuardian: item.phoneGuardian || item.phone_guardian || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (editing) {
      await update(editing.id, form);
    } else {
      await create(form);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleting) {
      await remove(deleting.id);
      setDeleteOpen(false);
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="O'quvchilar" description="Barcha o'quvchilar ro'yxati"
        action={{ label: "Yangi o'quvchi", onClick: openCreate }} />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchable
        searchPlaceholder="Ism, familiya yoki ID bo'yicha qidirish..."
        onSearch={setSearch}
        pagination={{ page, totalPages, total, onPageChange: setPage }}
        actions={(item) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setDeleting(item); setDeleteOpen(true); }}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      <FormModal open={modalOpen} onOpenChange={setModalOpen}
        title={editing ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"}
        description="Barcha maydonlarni to'ldiring">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ism</Label>
            <Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Familiya</Label>
            <Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>O'quvchi ID</Label>
            <Input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Sinf</Label>
            <Select value={form.grade} onValueChange={v => setForm({ ...form, grade: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10-sinf</SelectItem>
                <SelectItem value="11">11-sinf</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Faol</SelectItem>
                <SelectItem value="GRADUATED">Bitirgan</SelectItem>
                <SelectItem value="EXPELLED">Chetlatilgan</SelectItem>
                <SelectItem value="WITHDRAWN">Chiqib ketgan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ota-ona telefoni</Label>
            <Input value={form.phoneGuardian} onChange={e => setForm({ ...form, phoneGuardian: e.target.value })} placeholder="+998..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
          <Button onClick={handleSubmit}>{editing ? 'Saqlash' : 'Yaratish'}</Button>
        </div>
      </FormModal>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen}
        title="O'quvchini o'chirish" description={`"${deleting?.firstName || ''} ${deleting?.lastName || ''}" ni o'chirishga ishonchingiz komilmi?`}
        confirmText="O'chirish" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}
