import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { useCrud } from '@/hooks/useCrud';

export default function GuardianEvents() {
  const { data, loading } = useCrud({ endpoint: '/guardian/events' });
  const columns: Column<any>[] = [
    { key: 'title', title: 'Nomi', render: (i) => <span className="font-medium">{i.title || i.name || '-'}</span> },
    { key: 'type', title: 'Turi', render: (i) => i.type || '-' },
    { key: 'date', title: 'Sana', render: (i) => i.date ? new Date(i.date).toLocaleDateString('uz') : '-' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Tadbirlar" description="Akademiya tadbirlari" />
      <DataTable columns={columns} data={data} loading={loading} emptyMessage="Tadbirlar yo'q" />
    </div>
  );
}
