import { PageHeader } from '@/components/shared/PageHeader';
import { useCrud } from '@/hooks/useCrud';
import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function GuardianNotifications() {
  const { data, loading } = useCrud({ endpoint: '/guardian/notifications' });
  return (
    <div className="space-y-6">
      <PageHeader title="Bildirishnomalar" description="Sizga yuborilgan xabarlar" />
      {loading ? <p className="text-muted-foreground">Yuklanmoqda...</p> :
        data.length === 0 ? <p className="text-muted-foreground">Bildirishnomalar yo'q</p> :
        <div className="space-y-3">
          {data.map((n: any, i: number) => (
            <Card key={n.id || i}>
              <CardContent className="flex items-start gap-3 p-4">
                <Bell className="h-5 w-5 text-info mt-0.5 shrink-0" />
                <div><p className="font-medium">{n.title || 'Bildirishnoma'}</p><p className="text-sm text-muted-foreground">{n.body || n.message || ''}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleDateString('uz') : ''}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>}
    </div>
  );
}
