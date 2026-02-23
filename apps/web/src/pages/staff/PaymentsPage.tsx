import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useCrud } from '@/hooks/useCrud';
import { StatCard } from '@/components/shared/StatCard';
import { Receipt, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const paymentStats = [
  { name: "To'langan", value: 65, color: 'hsl(152,60%,40%)' },
  { name: "To'lanmagan", value: 25, color: 'hsl(0,72%,51%)' },
  { name: 'Qisman', value: 10, color: 'hsl(38,92%,50%)' },
];

export default function PaymentsPage() {
  const { data, loading, total, page, totalPages, setSearch, setPage } = useCrud({ endpoint: '/staff/billing/payments' });
  const columns: Column<any>[] = [
    { key: 'student', title: "O'quvchi", render: (i) => i.student?.firstName ? `${i.student.firstName} ${i.student.lastName}` : i.studentName || '-' },
    { key: 'amount', title: 'Summa', render: (i) => <span className="font-bold">{Number(i.amount || 0).toLocaleString()} so'm</span> },
    { key: 'type', title: 'Turi', render: (i) => i.type || '-' },
    { key: 'status', title: 'Holat', render: (i) => <StatusBadge status={i.status || 'PAID'} /> },
    { key: 'date', title: 'Sana', render: (i) => i.createdAt ? new Date(i.createdAt).toLocaleDateString('uz') : '-' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="To'lovlar" description="Barcha to'lovlar tarixi" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Jami to'lovlar" value="₿ 125M" icon={<DollarSign className="h-5 w-5" />} color="success" />
        <StatCard title="Kutilayotgan" value="₿ 18M" icon={<Receipt className="h-5 w-5" />} color="warning" />
        <StatCard title="Muddati o'tgan" value="₿ 5M" icon={<AlertTriangle className="h-5 w-5" />} color="destructive" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable columns={columns} data={data} loading={loading} searchable onSearch={setSearch} pagination={{ page, totalPages, total, onPageChange: setPage }} />
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">To'lov holati</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={paymentStats} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} fontSize={11}>
                {paymentStats.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
