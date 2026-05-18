import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SlideOver } from '@/components/shared/SlideOver';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  XCircle,
  Clock,
  UserCircle2,
  Plus,
  Loader2,
  CalendarDays,
  Search,
  Users,
  AlertCircle,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';

const STATUS_TABS = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'PENDING', label: 'Kutayotgan' },
  { value: 'APPROVED', label: 'Tasdiqlangan' },
  { value: 'REJECTED', label: "Rad etilgan" },
  { value: 'CLOSED', label: 'Yopilgan' },
];

const REQUESTED_BY_LABELS: Record<string, string> = {
  STUDENT_VERBAL: "O'quvchi og'zaki",
  GUARDIAN_CALL: "Ota-ona qo'ng'irog'i",
  OTHER: 'Boshqa',
};

function durationDays(start: string, end: string): number {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
}

export default function LeavesPage() {
  const queryClient = useQueryClient();

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  // UI state
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject' | 'close' | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Form
  const [form, setForm] = useState({
    studentId: '',
    reason: '',
    startAt: dayjs().format('YYYY-MM-DDTHH:mm'),
    endAt: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
    requestedBy: 'STUDENT_VERBAL',
    notes: '',
  });

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['staff', 'leaves', 'stats'],
    queryFn: async () => (await api.get('/staff/leaves/stats')).data,
  });

  // Groups
  const { data: groupsData } = useQuery({
    queryKey: ['staff', 'groups', 'for_leaves'],
    queryFn: async () => (await api.get('/staff/groups?limit=100')).data?.data || [],
  });
  const groups = groupsData || [];

  // Students
  const { data: studentsData } = useQuery({
    queryKey: ['staff', 'students', 'for_leaves'],
    queryFn: async () => (await api.get('/staff/students?limit=200')).data?.data || [],
  });
  const students = studentsData || [];

  // Leaves list
  const buildParams = () => {
    const p = new URLSearchParams({ page: String(page), limit: '20' });
    if (statusFilter !== 'ALL') p.set('status', statusFilter);
    if (groupFilter) p.set('groupId', groupFilter);
    if (fromDate) p.set('from', fromDate);
    if (toDate) p.set('to', toDate);
    if (search) p.set('search', search);
    return p.toString();
  };

  const { data: leavesRes, isLoading } = useQuery({
    queryKey: ['staff', 'leaves', 'list', page, statusFilter, groupFilter, fromDate, toDate, search],
    queryFn: async () => (await api.get(`/staff/leaves?${buildParams()}`)).data,
  });

  const leaves = leavesRes?.data || [];
  const meta = leavesRes?.meta;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['staff', 'leaves'] });
  };

  // Create
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/staff/leaves', data),
    onSuccess: () => {
      invalidate();
      toast.success("So'rov muvaffaqiyatli yaratildi");
      setCreateOpen(false);
      setForm({
        studentId: '',
        reason: '',
        startAt: dayjs().format('YYYY-MM-DDTHH:mm'),
        endAt: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
        requestedBy: 'STUDENT_VERBAL',
        notes: '',
      });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Yaratishda xatolik"),
  });

  // Decision
  const decisionMutation = useMutation({
    mutationFn: ({ id, type, notes }: { id: string; type: string; notes: string }) =>
      api.post(`/staff/leaves/${id}/${type}`, { notes }),
    onSuccess: () => {
      invalidate();
      toast.success('Amal muvaffaqiyatli bajarildi');
      setDecisionType(null);
      setDecisionNotes('');
      setDetailOpen(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Xatolik yuz berdi'),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/staff/leaves/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("So'rov o'chirildi");
      setDetailOpen(false);
      setDeleteConfirm(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "O'chirishda xatolik"),
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const statCards = [
    {
      label: 'Kutayotgan',
      value: stats?.pending ?? 0,
      icon: Clock,
      cls: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      active: statusFilter === 'PENDING',
      filter: 'PENDING',
    },
    {
      label: 'Tasdiqlangan',
      value: stats?.approved ?? 0,
      icon: CheckCircle2,
      cls: 'text-green-600 bg-green-50 border-green-200',
      active: statusFilter === 'APPROVED',
      filter: 'APPROVED',
    },
    {
      label: "Rad etilgan",
      value: stats?.rejected ?? 0,
      icon: XCircle,
      cls: 'text-red-600 bg-red-50 border-red-200',
      active: statusFilter === 'REJECTED',
      filter: 'REJECTED',
    },
    {
      label: "Bugun maktabda yo'q",
      value: stats?.activeToday ?? 0,
      icon: Users,
      cls: 'text-blue-600 bg-blue-50 border-blue-200',
      active: false,
      filter: null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ta'til boshqaruvi"
        description="O'quvchilarning chiqib-kelishi va ta'til so'rovlarini boshqarish"
        action={{
          label: "Yangi so'rov",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => setCreateOpen(true),
        }}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s) => (
          <button
            key={s.label}
            className={cn(
              'rounded-xl border p-4 text-left transition-all',
              s.cls,
              s.filter ? 'cursor-pointer hover:opacity-90' : 'cursor-default',
              s.active && 'ring-2 ring-offset-1',
            )}
            onClick={() => {
              if (s.filter) {
                setStatusFilter((prev) => (prev === s.filter ? 'ALL' : s.filter!));
                setPage(1);
              }
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="h-4 w-4 shrink-0" />
              <span className="text-xs font-medium">{s.label}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </button>
        ))}
      </div>

      {/* Table card */}
      <Card>
        <CardContent className="p-0">
          {/* Status tabs */}
          <div className="flex gap-1 p-4 pb-0 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  statusFilter === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-3 p-4 pb-2 border-b">
            <div className="flex-1 min-w-[200px] flex gap-2">
              <Input
                placeholder="O'quvchi ismi bo'yicha qidiring..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={groupFilter} onValueChange={(v) => { setGroupFilter(v === 'ALL' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Guruh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Barcha guruhlar</SelectItem>
                {groups.map((g: any) => (
                  <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                className="w-36"
              />
              <span className="text-muted-foreground text-sm">–</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                className="w-36"
              />
            </div>

            {(search || groupFilter || fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch(''); setSearchInput(''); setGroupFilter('');
                  setFromDate(''); setToDate(''); setPage(1);
                }}
              >
                Filterni tozalash
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
              </div>
            ) : leaves.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
                So'rovlar topilmadi
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3 text-left font-medium">O'quvchi</th>
                    <th className="px-4 py-3 text-left font-medium">Sabab</th>
                    <th className="px-4 py-3 text-left font-medium">Muddat</th>
                    <th className="px-4 py-3 text-left font-medium">Holat</th>
                    <th className="px-4 py-3 text-left font-medium">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave: any) => (
                    <tr
                      key={leave.id}
                      className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedLeave(leave);
                        setDetailOpen(true);
                        setDecisionType(null);
                        setDecisionNotes('');
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{leave.studentName}</div>
                        <div className="text-[11px] text-muted-foreground">{leave.groupName || 'Guruhsiz'}</div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="truncate text-xs">{leave.reason}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {REQUESTED_BY_LABELS[leave.requestedBy] || leave.requestedBy}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 text-primary" />
                            {dayjs(leave.startAt).format('DD.MM.YY HH:mm')}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                            <span className="h-3 w-3 text-center">→</span>
                            {dayjs(leave.endAt).format('DD.MM.YY HH:mm')}
                          </div>
                          <Badge variant="outline" className="text-[9px] h-4 mt-0.5">
                            {durationDays(leave.startAt, leave.endAt)} kun
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={leave.status} />
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {leave.status === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Tasdiqlash"
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  setDecisionType('approve');
                                  setDetailOpen(true);
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                title="Rad etish"
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  setDecisionType('reject');
                                  setDetailOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {leave.status === 'APPROVED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs gap-1"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setDecisionType('close');
                                setDetailOpen(true);
                              }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Qaytdi
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-muted-foreground">
                {meta.total} ta so'rov, {meta.page}-sahifa / {meta.totalPages}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail SlideOver */}
      <SlideOver
        open={detailOpen}
        onOpenChange={(o) => {
          setDetailOpen(o);
          if (!o) { setDecisionType(null); setDecisionNotes(''); }
        }}
        title={
          decisionType === 'approve'
            ? "So'rovni tasdiqlash"
            : decisionType === 'reject'
              ? "So'rovni rad etish"
              : decisionType === 'close'
                ? "So'rovni yopish"
                : "Ta'til so'rovi"
        }
        size="sm"
      >
        {selectedLeave && (
          <div className="space-y-5 pt-4">
            {/* Student & status */}
            <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-xl border">
              <UserCircle2 className="h-10 w-10 text-primary opacity-60 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{selectedLeave.studentName}</p>
                <p className="text-xs text-muted-foreground">{selectedLeave.groupName || 'Guruhsiz'}</p>
              </div>
              <StatusBadge status={selectedLeave.status} />
            </div>

            {/* Leave details */}
            <div className="rounded-xl border divide-y">
              <div className="grid grid-cols-2 divide-x">
                <div className="p-3 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Ketish</p>
                  <p className="text-sm font-medium">
                    {dayjs(selectedLeave.startAt).format('DD.MM.YYYY')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dayjs(selectedLeave.startAt).format('HH:mm')}
                  </p>
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Kelish</p>
                  <p className="text-sm font-medium">
                    {dayjs(selectedLeave.endAt).format('DD.MM.YYYY')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dayjs(selectedLeave.endAt).format('HH:mm')}
                  </p>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Davomiyligi</span>
                <Badge variant="secondary">
                  {durationDays(selectedLeave.startAt, selectedLeave.endAt)} kun
                </Badge>
              </div>
              <div className="p-3 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Kim orqali</p>
                <p className="text-sm">{REQUESTED_BY_LABELS[selectedLeave.requestedBy] || selectedLeave.requestedBy}</p>
              </div>
              <div className="p-3 space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Sabab</p>
                <p className="text-sm">{selectedLeave.reason}</p>
              </div>
              {selectedLeave.notes && (
                <div className="p-3 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Izoh</p>
                  <p className="text-sm text-muted-foreground">{selectedLeave.notes}</p>
                </div>
              )}
              {selectedLeave.approvedBy && (
                <div className="p-3 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    {selectedLeave.status === 'REJECTED' ? 'Rad etgan' : 'Tasdiqlagan'}
                  </p>
                  <p className="text-sm">{selectedLeave.approvedBy.name}</p>
                  {selectedLeave.approvedAt && (
                    <p className="text-xs text-muted-foreground">
                      {dayjs(selectedLeave.approvedAt).format('DD.MM.YYYY HH:mm')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Decision form */}
            {decisionType && (
              <div className="space-y-3">
                <div
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border text-sm',
                    decisionType === 'approve'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : decisionType === 'reject'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-blue-50 border-blue-200 text-blue-700',
                  )}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {decisionType === 'approve'
                    ? "So'rovni tasdiqlaysizmi?"
                    : decisionType === 'reject'
                      ? "So'rovni rad etasizmi?"
                      : "O'quvchi qaytganligini tasdiqlaysizmi?"}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Izoh (ixtiyoriy)</Label>
                  <Textarea
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Sabab yoki qo'shimcha ko'rsatmalar..."
                    className="min-h-[80px] text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setDecisionType(null); setDecisionNotes(''); }}
                  >
                    Bekor
                  </Button>
                  <Button
                    className={cn(
                      'flex-1 gap-2',
                      decisionType === 'approve' && 'bg-green-600 hover:bg-green-700',
                      decisionType === 'reject' && 'bg-destructive hover:bg-destructive/90',
                    )}
                    disabled={decisionMutation.isPending}
                    onClick={() =>
                      decisionMutation.mutate({
                        id: selectedLeave.id,
                        type: decisionType,
                        notes: decisionNotes,
                      })
                    }
                  >
                    {decisionMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {decisionType === 'approve' ? 'Tasdiqlash' : decisionType === 'reject' ? 'Rad etish' : 'Yopish'}
                  </Button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!decisionType && (
              <div className="flex flex-col gap-2 pt-2 border-t">
                {selectedLeave.status === 'PENDING' && (
                  <>
                    <Button
                      className="w-full gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => setDecisionType('approve')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Tasdiqlash
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => setDecisionType('reject')}
                    >
                      <XCircle className="h-4 w-4" />
                      Rad etish
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      O'chirish
                    </Button>
                  </>
                )}
                {selectedLeave.status === 'APPROVED' && (
                  <Button className="w-full gap-2" onClick={() => setDecisionType('close')}>
                    <CheckCircle2 className="h-4 w-4" />
                    O'quvchi qaytdi (Yopish)
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </SlideOver>

      {/* Create SlideOver */}
      <SlideOver
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Yangi ta'til so'rovi"
        size="sm"
      >
        <div className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label>O'quvchi *</Label>
            <Select value={form.studentId} onValueChange={(v) => setForm({ ...form, studentId: v })}>
              <SelectTrigger><SelectValue placeholder="O'quvchini tanlang" /></SelectTrigger>
              <SelectContent>
                {students.map((s: any) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.fullName || s.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ketish vaqti *</Label>
              <Input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Kelish vaqti *</Label>
              <Input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kim orqali</Label>
            <Select value={form.requestedBy} onValueChange={(v) => setForm({ ...form, requestedBy: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(REQUESTED_BY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sabab *</Label>
            <Textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Ketish sababi..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Qo'shimcha izoh</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Ixtiyoriy..."
              rows={2}
            />
          </div>

          <div className="flex flex-col-reverse justify-end gap-2 pt-4 border-t sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setCreateOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={createMutation.isPending || !form.studentId || !form.reason}
              onClick={() =>
                createMutation.mutate({
                  ...form,
                  startAt: new Date(form.startAt).toISOString(),
                  endAt: new Date(form.endAt).toISOString(),
                })
              }
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              So'rov yaratish
            </Button>
          </div>
        </div>
      </SlideOver>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title="So'rovni o'chirish"
        description="Ushbu ta'til so'rovini o'chirishga ishonchingiz komilmi? Bu amalni qaytarib bo'lmaydi."
        confirmText="O'chirish"
        variant="destructive"
        onConfirm={() => selectedLeave && deleteMutation.mutate(selectedLeave.id)}
      />
    </div>
  );
}
