import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { useCrud } from '@/hooks/useCrud';

export default function GuardianCertificates() {
  const { data, loading } = useCrud({ endpoint: '/guardian/certificates' });
  const columns: Column<any>[] = [
    { key: 'type', title: 'Turi', render: (i) => i.type || '-' },
    { key: 'name', title: 'Nomi', render: (i) => <span className="font-medium">{i.name || i.title || '-'}</span> },
    { key: 'score', title: 'Natija', render: (i) => i.score || '-' },
    { key: 'date', title: 'Sana', render: (i) => i.date ? new Date(i.date).toLocaleDateString('uz') : '-' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Sertifikatlar" description="IELTS, SAT va boshqa sertifikatlar" />
      <DataTable columns={columns} data={data} loading={loading} emptyMessage="Sertifikatlar yo'q" />
    </div>
  );
}
