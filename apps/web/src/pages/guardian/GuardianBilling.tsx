import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useCrud } from '@/hooks/useCrud';

export default function GuardianBilling() {
  const { data, loading } = useCrud({ endpoint: '/guardian/billing/invoices' });
  const columns: Column<any>[] = [
    { key: 'type', title: 'Turi', render: (i) => i.type || '-' },
    { key: 'amount', title: 'Summa', render: (i) => <span className="font-bold">{Number(i.amount || 0).toLocaleString()} so'm</span> },
    { key: 'status', title: 'Holat', render: (i) => <StatusBadge status={i.status || 'UNPAID'} /> },
    { key: 'dueDate', title: 'Muddat', render: (i) => i.dueDate ? new Date(i.dueDate).toLocaleDateString('uz') : '-' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="To'lovlar" description="Hisob-fakturalar va to'lovlar" />
      <DataTable columns={columns} data={data} loading={loading} emptyMessage="Hisob-fakturalar yo'q" />
    </div>
  );
}
