import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useCrud } from '@/hooks/useCrud';

export default function GuardianAttendance() {
  const { data, loading } = useCrud({ endpoint: '/guardian/attendance' });
  const columns: Column<any>[] = [
    { key: 'date', title: 'Sana', render: (i) => i.date ? new Date(i.date).toLocaleDateString('uz') : '-' },
    { key: 'type', title: 'Turi', render: (i) => i.sessionType || i.type || '-' },
    { key: 'status', title: 'Holat', render: (i) => <StatusBadge status={i.mark || i.status || 'PRESENT'} /> },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Davomat" description="Farzandingizning davomat tarixi" />
      <DataTable columns={columns} data={data} loading={loading} />
    </div>
  );
}
