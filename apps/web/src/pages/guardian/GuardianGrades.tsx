import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { useCrud } from '@/hooks/useCrud';

export default function GuardianGrades() {
  const { data, loading } = useCrud({ endpoint: '/guardian/grades' });
  const columns: Column<any>[] = [
    { key: 'subject', title: 'Fan', render: (i) => <span className="font-medium">{i.subject?.name || i.subjectName || '-'}</span> },
    { key: 'assessmentTitle', title: 'Test nomi', render: (i) => i.assessment?.title || i.assessmentTitle || '-' },
    { key: 'score', title: 'Ball', render: (i) => <span className="font-bold">{i.score ?? '-'}</span> },
    { key: 'maxScore', title: 'Max', render: (i) => i.maxScore || i.assessment?.maxScore || '-' },
    { key: 'date', title: 'Sana', render: (i) => i.date ? new Date(i.date).toLocaleDateString('uz') : '-' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Baholar" description="Farzandingizning test natijalari" />
      <DataTable columns={columns} data={data} loading={loading} emptyMessage="Hali baholar yo'q" />
    </div>
  );
}
