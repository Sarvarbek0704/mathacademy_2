import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useCrud } from '@/hooks/useCrud';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockRankingChart = [
  { name: 'Ali V.', score: 95 }, { name: 'Bobur K.', score: 92 }, { name: 'Dilshod M.', score: 89 },
  { name: 'Eldor T.', score: 87 }, { name: 'Farrux N.', score: 85 }, { name: 'Gulnora S.', score: 83 },
  { name: 'Humoyun R.', score: 80 }, { name: 'Iroda A.', score: 78 },
];

export default function RankingPage() {
  const { data, loading, total, page, totalPages, setPage } = useCrud({ endpoint: '/staff/ranking/snapshots' });

  const columns: Column<any>[] = [
    { key: 'rank', title: '#', render: (item) => <span className="font-bold">{item.rank ?? '-'}</span> },
    { key: 'student', title: "O'quvchi", render: (i) => <span className="font-medium">{i.studentName || i.student?.firstName + ' ' + i.student?.lastName || '-'}</span> },
    { key: 'totalScore', title: 'Umumiy ball', render: (i) => <span className="font-bold">{i.totalScore ?? '-'}</span> },
    { key: 'riskLevel', title: 'Risk', render: (i) => <StatusBadge status={i.riskLevel || 'GREEN'} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reyting" description="O'quvchilar reytingi va snapshotlar" />

      <Card>
        <CardHeader><CardTitle className="text-base">Top 8 o'quvchi</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockRankingChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis type="category" dataKey="name" width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="hsl(160,60%,40%)" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={data} loading={loading}
        pagination={{ page, totalPages, total, onPageChange: setPage }} emptyMessage="Reyting ma'lumotlari topilmadi" />
    </div>
  );
}
