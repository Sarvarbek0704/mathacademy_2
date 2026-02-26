import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, CalendarDays, MapPin } from 'lucide-react';

export default function GuardianEvents() {
  const { data: eventRes, isLoading } = useQuery({
    queryKey: ['guardian', 'student', 'events'],
    queryFn: async () => (await api.get('/guardian/events')).data,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const rawEvents = eventRes?.events;
  const events = (
    Array.isArray(rawEvents)
      ? rawEvents
      : Array.isArray(rawEvents?.upcoming)
        ? rawEvents.upcoming
        : []
  ).map((item: any) => ({
    id: String(item?.id ?? `${item?.title ?? 'event'}-${item?.startsAt ?? ''}`),
    title: String(item?.title ?? '-'),
    type: String(item?.eventType ?? item?.type ?? 'Tadbir'),
    startsAt: item?.startsAt ?? item?.date ?? null,
    location: item?.campusName ?? item?.campus ?? item?.location ?? null,
    description: item?.description ?? null,
  }));

  const columns: Column<any>[] = [
    {
      key: 'title',
      title: 'Tadbir nomi',
      render: (i) => <span className="font-bold">{i.title}</span>,
    },
    { key: 'type', title: 'Turi' },
    {
      key: 'startsAt',
      title: 'Sana',
      render: (i) => (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>
            {i.startsAt
              ? new Date(i.startsAt).toLocaleDateString('uz', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'location',
      title: 'Joylashuv',
      render: (i) => (
        <div className="flex items-center gap-2">
          {i.location && <MapPin className="h-4 w-4 text-muted-foreground" />}
          <span>{i.location || '-'}</span>
        </div>
      ),
    },
    { key: 'description', title: 'Tavsif', render: (i) => i.description || '-' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Tadbirlar" description="Akademiya va kampus doirasidagi tadbirlar" />

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={events}
          emptyMessage="Yaqin orada tadbirlar rejalashtirilmagan"
        />
      </div>
    </div>
  );
}
