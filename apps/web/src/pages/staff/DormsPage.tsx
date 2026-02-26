import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SlideOver } from '@/components/shared/SlideOver';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useCrud } from '@/hooks/useCrud';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BedDouble,
  Plus,
  Trash2,
  Edit2,
  Users,
  Home,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function DormsPage() {
  const { data, loading, create, remove, update } = useCrud({ endpoint: '/staff/dorms' });
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    isActive: true,
    campusId: '',
  });

  const { data: campusesRes } = useQuery({
    queryKey: ['staff', 'campuses', 'list'],
    queryFn: async () => (await api.get('/staff/campuses?limit=200')).data,
  });
  const campuses = campusesRes?.data || [];

  const handleCreateOrUpdate = async () => {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      campusId: form.campusId || undefined,
      isActive: form.isActive,
    };

    if (isEditing) {
      await update(selectedDorm.id, payload);
    } else {
      await create(payload);
    }
    setModalOpen(false);
  };

  const openCreate = () => {
    setForm({ name: '', description: '', isActive: true, campusId: '' });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (dorm: any) => {
    setSelectedDorm(dorm);
    setForm({
      name: dorm.name || '',
      description: dorm.description || '',
      isActive: dorm.isActive ?? true,
      campusId: dorm.campusId ? String(dorm.campusId) : '',
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yotoqxonalar boshqaruvi"
        description="Talabalar turar joylari va xonalar sig'imi"
        action={{
          label: "Yotoqxona qo'shish",
          icon: <Plus className="h-4 w-4" />,
          onClick: openCreate,
        }}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((dorm: any) => {
            const occupancy = dorm.roomsCount || 0;
            const capacity = Math.max(dorm.roomsCount || 1, 1);
            const percent = Math.min(Math.round((occupancy / capacity) * 100), 100);

            return (
              <Card
                key={dorm.id}
                className="hover:border-primary/50 transition-all overflow-hidden"
              >
                <CardHeader className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BedDouble className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(dorm)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          setSelectedDorm(dorm);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="mt-4 text-lg">{dorm.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <MapPin className="h-3 w-3" /> {dorm.description || 'Tavsif kiritilmagan'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> Xonalar soni
                      </span>
                      <span>{dorm.roomsCount || 0}</span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge
                      variant={dorm.isActive ? 'success' : 'secondary'}
                      className="text-[10px] h-5"
                    >
                      {dorm.isActive ? 'Faol' : 'Nofaol'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground italic">
                      {dorm.campusName || dorm.campus?.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form SlideOver */}
      <SlideOver
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={isEditing ? 'Yotoqxonani tahrirlash' : "Yangi yotoqxona qo'shish"}
        size="sm"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Nomi</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Masalan: 1-sonli Yotoqxona"
            />
          </div>

          <div className="space-y-2">
            <Label>Tavsif</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Masalan: B-blok, 2-qavat"
            />
          </div>

          <div className="space-y-2">
            <Label>Kampus</Label>
            <Select value={form.campusId} onValueChange={(v) => setForm({ ...form, campusId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Kampusni tanlang" />
              </SelectTrigger>
              <SelectContent>
                {campuses.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Holati</Label>
            <Select
              value={form.isActive ? 'ACTIVE' : 'INACTIVE'}
              onValueChange={(v) => setForm({ ...form, isActive: v === 'ACTIVE' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Faol</SelectItem>
                <SelectItem value="INACTIVE">Nofaol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Yotoqxona qo'shilgandan so'ng, o'quvchilarni ushbu yotoqxonaga Talabalar sahifasidan
              biriktirishingiz mumkin.
            </p>
          </div>

          <div className="flex flex-col-reverse justify-end gap-2 mt-8 sm:flex-row pt-4 border-t">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setModalOpen(false)}
            >
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
        description="Ushbu yotoqxonani o'chirishga ishonchingiz komilmi? Undagi o'quvchilar biriktiruvi ham o'chirilishi mumkin."
        confirmText="O'chirish"
        variant="destructive"
        onConfirm={async () => {
          await remove(selectedDorm.id);
          setDeleteOpen(false);
        }}
      />
    </div>
  );
}
