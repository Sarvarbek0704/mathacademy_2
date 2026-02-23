import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useCrud } from '@/hooks/useCrud';

export default function InvoicesPage() {
  const { data, loading, total, page, totalPages, setSearch, setPage } = useCrud({ endpoint: '/staff/billing/invoices' });
  const columns: Column<any>[] = [
    { key: 'student', title: "O'quvchi", render: (i) => i.student?.firstName ? `${i.student.firstName} ${i.student.lastName}` : '-' },
    { key: 'amount', title: 'Summa', render: (i) => <span className="font-bold">{Number(i.amount || 0).toLocaleString()} so'm</span> },
    { key: 'type', title: 'Turi', render: (i) => i.type || '-' },
    { key: 'status', title: 'Holat', render: (i) => <StatusBadge status={i.status || 'UNPAID'} /> },
    { key: 'dueDate', title: 'Muddat', render: (i) => i.dueDate ? new Date(i.dueDate).toLocaleDateString('uz') : '-' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Hisob-fakturalar" description="To'lov majburiyatlari" />
      <DataTable columns={columns} data={data} loading={loading} searchable onSearch={setSearch} pagination={{ page, totalPages, total, onPageChange: setPage }} />
    </div>
  );
}
