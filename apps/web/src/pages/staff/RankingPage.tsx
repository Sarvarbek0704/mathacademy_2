import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Loader2, RefreshCw, Calendar, Users, Eye, PlusCircle, Trophy, Percent,
} from 'lucide-react';
import { toast } from 'sonner';

function pctColor(pct: number) {
  if (pct >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 60) return 'text-blue-600 dark:text-blue-400';
  if (pct >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function rankMedal(rank: number) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return <span className="text-muted-foreground text-sm font-mono">{rank}</span>;
}

export default function RankingPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('live');
  const [groupId, setGroupId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  );
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewingSnapshot, setViewingSnapshot] = useState<any>(null);

  const { data: groupsRes } = useQuery({
    queryKey: ['staff', 'groups', 'list'],
    queryFn: async () => (await api.get('/staff/groups?limit=100')).data,
  });

  useEffect(() => {
    const firstGroup = groupsRes?.data?.[0];
    if (firstGroup && !groupId) setGroupId(firstGroup.id);
  }, [groupsRes]);

  const { data: liveRes, isLoading: isLiveLoading, refetch: refetchLive } = useQuery({
    queryKey: ['staff', 'ranking', 'live', groupId, dateFrom, dateTo],
    queryFn: async () =>
      (await api.get(`/staff/ranking/live?groupId=${groupId}&from=${dateFrom}&to=${dateTo}`)).data,
    enabled: !!groupId && activeTab === 'live',
  });

  const { data: snapshotsRes, isLoading: isSnapshotsLoading } = useQuery({
    queryKey: ['staff', 'ranking', 'snapshots', groupId],
    queryFn: async () => (await api.get(`/staff/ranking/snapshots?groupId=${groupId}`)).data,
    enabled: !!groupId && activeTab === 'snapshots',
  });

  const { data: snapshotRowsRes, isLoading: isRowsLoading } = useQuery({
    queryKey: ['staff', 'ranking', 'snapshots', viewingSnapshot?.id, 'rows'],
    queryFn: async () =>
      (await api.get(`/staff/ranking/snapshots/${viewingSnapshot.id}`)).data,
    enabled: !!viewingSnapshot,
  });

  const createSnapshotMutation = useMutation({
    mutationFn: async () =>
      (await api.post('/staff/ranking/snapshots', {
        groupId,
        periodType: 'MONTH',
        periodStart: dateFrom,
        periodEnd: dateTo,
      })).data,
    onSuccess: () => {
      toast.success('Snapshot muvaffaqiyatli yaratildi');
      queryClient.invalidateQueries({ queryKey: ['staff', 'ranking', 'snapshots', groupId] });
    },
  });

  const liveData: any[] = liveRes?.data || [];
  const liveAssessments: any[] = liveRes?.assessments || [];
  const snapshotData: any[] = snapshotsRes?.data || [];
  const snapshotRows: any[] = snapshotRowsRes?.rows || [];

  const groups = groupsRes?.data || [];

  // Chart data (top 10 by percentage)
  const chartData = liveData.slice(0, 10).map((r: any) => ({
    name: r.studentName?.split(' ')[0] || r.studentName,
    value: r.percentage ?? 0,
  }));

  const avgPct =
    liveData.length > 0
      ? liveData.reduce((acc: number, r: any) => acc + (r.percentage ?? 0), 0) / liveData.length
      : 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Header + filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader
          title="Akademik Reyting"
          description="Har bir test natijasi alohida ko'rsatiladi"
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Guruh</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Guruhni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g: any) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Dan</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-36" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Gacha</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 w-36" />
          </div>
          <Button variant="outline" size="icon" className="mt-5 h-9 w-9" onClick={() => refetchLive()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary opacity-70" />
            <div>
              <p className="text-xs text-muted-foreground">O'quvchilar</p>
              <p className="text-2xl font-bold">{liveData.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-500 opacity-70" />
            <div>
              <p className="text-xs text-muted-foreground">Testlar</p>
              <p className="text-2xl font-bold">{liveAssessments.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Percent className="h-8 w-8 text-emerald-500 opacity-70" />
            <div>
              <p className="text-xs text-muted-foreground">O'rtacha %</p>
              <p className="text-2xl font-bold">{avgPct.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-500 opacity-70" />
            <div>
              <p className="text-xs text-muted-foreground">Eng yuqori</p>
              <p className="text-2xl font-bold">
                {liveData[0]?.percentage != null ? `${liveData[0].percentage.toFixed(1)}%` : '—'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="live"
        className="w-full"
        onValueChange={(v) => { setActiveTab(v); setViewingSnapshot(null); }}
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-2 max-w-xs">
            <TabsTrigger value="live">Jonli reyting</TabsTrigger>
            <TabsTrigger value="snapshots">Snapshotlar</TabsTrigger>
          </TabsList>
          {activeTab === 'live' && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => createSnapshotMutation.mutate()}
              disabled={createSnapshotMutation.isPending}
            >
              <PlusCircle className="h-4 w-4" />
              Snapshot saqlash
            </Button>
          )}
        </div>

        <TabsContent value="live" className="space-y-6">
          {/* Bar chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Top 10 — Foiz bo'yicha</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} unit="%" hide />
                    <YAxis type="category" dataKey="name" width={80} axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip
                      formatter={(v: any) => [`${v}%`, 'Foiz']}
                      cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                      {chartData.map((_: any, i: number) => (
                        <Cell key={i} fill={i < 3 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.4)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Per-assessment matrix table */}
          {isLiveLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
            </div>
          ) : liveData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-lg border-2 border-dashed text-muted-foreground">
              <Users className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">
                {liveAssessments.length === 0
                  ? "Bu davrda hech qanday test o'tkazilmagan"
                  : "O'quvchilar topilmadi"}
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground w-8">#</th>
                      <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground min-w-[160px]">
                        O'quvchi
                      </th>
                      {liveAssessments.map((a: any) => (
                        <th key={a.id} className="text-center px-3 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground min-w-[100px]">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="line-clamp-1 max-w-[90px]">{a.title}</span>
                            {a.subjectName && (
                              <span className="text-[9px] text-muted-foreground/70 font-normal">{a.subjectName}</span>
                            )}
                            <span className="text-[9px] text-muted-foreground/60 font-normal">
                              {new Date(a.heldAt).toLocaleDateString('uz')} • /{a.maxScore}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="text-center px-3 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground min-w-[80px]">
                        Jami %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveData.map((row: any, idx: number) => (
                      <tr key={row.studentId} className={`border-b hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}>
                        <td className="px-4 py-3 text-center">
                          {typeof rankMedal(row.rank) === 'string'
                            ? <span className="text-base">{rankMedal(row.rank)}</span>
                            : rankMedal(row.rank)}
                        </td>
                        <td className="px-4 py-3 font-semibold">{row.studentName}</td>
                        {liveAssessments.map((a: any) => {
                          const score = row.scores?.[a.id];
                          const pct = score != null ? (score / a.maxScore) * 100 : null;
                          return (
                            <td key={a.id} className="px-3 py-3 text-center">
                              {score != null ? (
                                <div className="flex flex-col items-center">
                                  <span className={`font-bold font-mono ${pct != null ? pctColor(pct) : ''}`}>
                                    {score}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {pct != null ? `${pct.toFixed(0)}%` : ''}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/40">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-center">
                          <Badge
                            variant="outline"
                            className={`font-mono font-bold ${pctColor(row.percentage ?? 0)}`}
                          >
                            {(row.percentage ?? 0).toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="snapshots">
          {viewingSnapshot ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
                <div>
                  <h3 className="font-bold">{viewingSnapshot.groupName} — Snapshot</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(viewingSnapshot.periodStart).toLocaleDateString('uz')} —{' '}
                    {new Date(viewingSnapshot.periodEnd).toLocaleDateString('uz')}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setViewingSnapshot(null)}>
                  Ro'yxatga qaytish
                </Button>
              </div>
              {isRowsLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                </div>
              ) : (
                <Card>
                  <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground w-8">#</th>
                          <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">O'quvchi</th>
                          <th className="text-center px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Jami ball</th>
                          <th className="text-center px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {snapshotRows.map((row: any, idx: number) => (
                          <tr key={row.studentId} className={`border-b hover:bg-muted/20 ${idx % 2 === 0 ? '' : 'bg-muted/5'}`}>
                            <td className="px-4 py-3 text-center font-bold">{row.rank}</td>
                            <td className="px-4 py-3 font-semibold">{row.studentName}</td>
                            <td className="px-4 py-3 text-center font-mono font-bold">{Number(row.totalScore).toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              <StatusBadge status={row.riskLevel || 'GREEN'} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                {isSnapshotsLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                  </div>
                ) : snapshotData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Calendar className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">Hali snapshotlar yo'q</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Davr</th>
                        <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Turi</th>
                        <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">O'quvchilar</th>
                        <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Yaratilgan</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {snapshotData.map((snap: any) => (
                        <tr key={snap.id} className="border-b hover:bg-muted/20">
                          <td className="px-4 py-3">
                            {new Date(snap.periodStart).toLocaleDateString('uz')} —{' '}
                            {new Date(snap.periodEnd).toLocaleDateString('uz')}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline">{snap.periodType}</Badge>
                          </td>
                          <td className="px-4 py-3 font-bold">{snap.rowsCount}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {new Date(snap.generatedAt).toLocaleString('uz')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => setViewingSnapshot(snap)} className="gap-2">
                              <Eye className="h-4 w-4" />
                              Ko'rish
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
