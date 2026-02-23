import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useCrud } from '@/hooks/useCrud';
import { StatCard } from '@/components/shared/StatCard';
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function RiskPage() {
  const { data, loading, total, page, totalPages, setPage } = useCrud({ endpoint: '/staff/risk' });

  const columns: Column<any>[] = [
    { key: 'student', title: "O'quvchi", render: (i) => <span className="font-medium">{i.studentName || i.student?.firstName || '-'}</span> },
    { key: 'score', title: 'Ball (0-100)', render: (i) => <span className="font-bold">{i.score ?? '-'}</span> },
    { key: 'level', title: 'Daraja', render: (i) => <StatusBadge status={i.level || 'GREEN'} /> },
    { key: 'signals', title: 'Sabablar', render: (i) => {
      const signals = i.signals || [];
      return signals.length ? signals.join(', ') : '-';
    }},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Risk bahosi" description="O'quvchilarning risk ko'rsatkichlari" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Yashil zona" value="78%" icon={<ShieldCheck className="h-5 w-5" />} color="success" description="Xavfsiz" />
        <StatCard title="Sariq zona" value="15%" icon={<AlertTriangle className="h-5 w-5" />} color="warning" description="Ehtiyot" />
        <StatCard title="Qizil zona" value="7%" icon={<ShieldAlert className="h-5 w-5" />} color="destructive" description="Xavfli" />
      </div>
      <DataTable columns={columns} data={data} loading={loading}
        pagination={{ page, totalPages, total, onPageChange: setPage }} />
    </div>
  );
}
