import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useCrud } from '@/hooks/useCrud';

export default function GuardianDiscipline() {
  const { data, loading } = useCrud({ endpoint: '/guardian/discipline' });
  const columns: Column<any>[] = [
    { key: 'description', title: 'Tavsif', render: (i) => i.description || '-' },
    { key: 'type', title: 'Chora', render: (i) => i.actionType || i.type || '-' },
    { key: 'date', title: 'Sana', render: (i) => i.date ? new Date(i.date).toLocaleDateString('uz') : '-' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Intizom" description="Intizom holatlari" />
      <DataTable columns={columns} data={data} loading={loading} emptyMessage="Intizom holatlari yo'q" />
    </div>
  );
}
