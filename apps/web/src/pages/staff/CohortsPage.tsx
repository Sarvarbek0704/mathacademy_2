import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SlideOver } from '@/components/shared/SlideOver';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useCrud } from '@/hooks/useCrud';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  Trash2,
  Edit2,
  Plus,
  Search,
  Loader2,
  Calendar,
  GraduationCap,
  Users,
  Award,
  ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CohortsPage() {
  const { data, loading, setSearch, create, remove, update } = useCrud({
    endpoint: '/staff/cohorts',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [form, setForm] = useState({ label: '', graduationYear: new Date().getFullYear() });

  // Cohort students
  const { data: cohortStudentsRes, isLoading: loadingStudents, refetch: refetchStudents } = useQuery({
    queryKey: ['staff', 'students', 'by-cohort', selectedCohort?.id],
    queryFn: async () =>
      (await api.get(`/staff/students?cohortId=${selectedCohort.id}&limit=200`)).data,
    enabled: !!selectedCohort && detailOpen,
  });
  const cohortStudents: any[] = cohortStudentsRes?.data || [];

  // All students for assignment
  const { data: allStudentsRes } = useQuery({
    queryKey: ['staff', 'students', 'all-for-cohort'],
    queryFn: async () => (await api.get('/staff/students?limit=200')).data,
    enabled: detailOpen,
  });
  const allStudents: any[] = allStudentsRes?.data || [];
  const unassignedStudents = allStudents.filter(
    (s) => !cohortStudents.some((cs) => cs.id === s.id),
  );

  const handleAssignStudent = useCallback(async () => {
    if (!assignStudentId || !selectedCohort) return;
    setAssigning(true);
    try {
      await api.post(`/staff/students/${assignStudentId}/cohort`, {
        cohortLabel: selectedCohort.label,
      });
      toast.success("O'quvchi kohortaga qo'shildi");
      setAssignStudentId('');
      refetchStudents();
    } catch {
      toast.error("Qo'shishda xato");
    } finally {
      setAssigning(false);
    }
  }, [assignStudentId, selectedCohort, refetchStudents]);

  const openDetail = (cohort: any) => {
    setSelectedCohort(cohort);
    setAssignStudentId('');
    setDetailOpen(true);
  };

  const handleCreateOrUpdate = async () => {
    if (!form.label.trim()) return;
    if (!form.graduationYear || form.graduationYear < 2000 || form.graduationYear > 2100) return;
    const payload = { label: form.label.trim(), graduationYear: parseInt(String(form.graduationYear), 10) };
    if (isEditing) await update(selectedCohort.id, payload);
    else await create(payload);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kohortalar"
        description="Bitiruvchilar oqimi va yillik talabalar guruhlari"
        action={{
          label: "Kohorta qo'shish",
          icon: <Plus className="h-4 w-4" />,
          onClick: () => {
            setForm({ label: '', graduationYear: new Date().getFullYear() });
            setIsEditing(false);
            setModalOpen(true);
          },
        }}
      />

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kohortalardan qidirish..."
            className="pl-10"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">Hali kohortalar qo'shilmagan</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2"
            onClick={() => { setForm({ label: '', graduationYear: new Date().getFullYear() }); setIsEditing(false); setModalOpen(true); }}
          >
            <Plus className="h-4 w-4" /> Kohorta qo'shish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((cohort: any) => (
            <Card
              key={cohort.id}
              className="group hover:border-primary/50 transition-all overflow-hidden flex flex-col h-full shadow-sm border-l-4 border-l-blue-500 cursor-pointer"
              onClick={() => openDetail(cohort)}
            >
              <CardHeader className="p-5">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedCohort(cohort);
                        setForm({ label: cohort.label, graduationYear: cohort.graduationYear || new Date().getFullYear() });
                        setIsEditing(true);
                        setModalOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => { setSelectedCohort(cohort); setDeleteOpen(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-4 text-lg">{cohort.label}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1 font-semibold text-blue-600">
                  <Calendar className="h-3.5 w-3.5" /> {cohort.graduationYear}-yil bitiruvchilari
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4 flex-1">
                <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                      Bitiruvchilar
                    </span>
                    <span className="text-sm font-semibold">{cohort.studentsCount ?? cohort.studentCount ?? 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                      Yil
                    </span>
                    <span className="text-sm font-semibold">{cohort.graduationYear}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Award className="h-4 w-4 text-amber-500" />
                  Bitiruvchilar oqimi
                </div>
                <div className="text-[11px] text-primary flex items-center gap-1 font-medium">
                  Batafsil <ChevronRight className="h-3 w-3" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      <SlideOver
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={selectedCohort ? `${selectedCohort.label} — ${selectedCohort.graduationYear}` : 'Kohorta'}
        size="md"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-2xl font-bold">{cohortStudents.length}</p>
              <p className="text-xs text-muted-foreground">Bitiruvchilar</p>
            </div>
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{selectedCohort?.graduationYear}</p>
              <p className="text-xs text-muted-foreground">Bitiruv yili</p>
            </div>
          </div>

          {/* Assign student */}
          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <p className="text-sm font-semibold">O'quvchi qo'shish</p>
            <div className="flex gap-2">
              <select
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={assignStudentId}
                onChange={(e) => setAssignStudentId(e.target.value)}
              >
                <option value="">O'quvchini tanlang...</option>
                {unassignedStudents.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName || s.full_name}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={!assignStudentId || assigning}
                onClick={handleAssignStudent}
              >
                {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Students list */}
          <div className="space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" /> Bitiruvchilar ro'yxati
            </p>
            {loadingStudents ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
              </div>
            ) : cohortStudents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                Hali o'quvchilar qo'shilmagan
              </p>
            ) : (
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {cohortStudents.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border"
                  >
                    <div>
                      <p className="text-sm font-medium">{s.fullName || s.full_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.group?.name || 'Guruhsiz'} • {s.status}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {s.admissionYear || '—'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SlideOver>

      {/* Form SlideOver */}
      <SlideOver
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={isEditing ? 'Kohortani tahrirlash' : "Yangi kohorta qo'shish"}
        size="sm"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="label">Kohorta nomi *</Label>
            <Input
              id="label"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Masalan: Generation Alpha"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Bitiruv yili *</Label>
            <Input
              id="year"
              value={form.graduationYear}
              onChange={(e) => setForm({ ...form, graduationYear: parseInt(e.target.value, 10) })}
              placeholder="Masalan: 2025"
              type="number"
              min="2000"
              max="2100"
            />
          </div>
          <div className="flex flex-col-reverse justify-end gap-2 mt-8 sm:flex-row pt-4 border-t">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleCreateOrUpdate}>
              {isEditing ? 'Saqlash' : 'Yaratish'}
            </Button>
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="O'chirish"
        description="Ushbu kohortani o'chirishga ishonchingiz komilmi?"
        confirmText="O'chirish"
        variant="destructive"
        onConfirm={async () => {
          await remove(selectedCohort.id);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
