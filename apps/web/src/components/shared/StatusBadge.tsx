import { cn } from '@/lib/utils';

type Status = 'ACTIVE' | 'GRADUATED' | 'EXPELLED' | 'WITHDRAWN' |
  'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' |
  'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED' |
  'GREEN' | 'YELLOW' | 'RED' |
  'WARNING' | 'RESTRICTION' | 'FINAL_NOTICE' |
  'PAID' | 'UNPAID' | 'PARTIAL' |
  string;

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-success/10 text-success border-success/20',
  GRADUATED: 'bg-info/10 text-info border-info/20',
  EXPELLED: 'bg-destructive/10 text-destructive border-destructive/20',
  WITHDRAWN: 'bg-warning/10 text-warning border-warning/20',
  PRESENT: 'bg-success/10 text-success border-success/20',
  ABSENT: 'bg-destructive/10 text-destructive border-destructive/20',
  LATE: 'bg-warning/10 text-warning border-warning/20',
  EXCUSED: 'bg-info/10 text-info border-info/20',
  PENDING: 'bg-warning/10 text-warning border-warning/20',
  APPROVED: 'bg-success/10 text-success border-success/20',
  REJECTED: 'bg-destructive/10 text-destructive border-destructive/20',
  CLOSED: 'bg-muted text-muted-foreground border-border',
  GREEN: 'bg-success/10 text-success border-success/20',
  YELLOW: 'bg-warning/10 text-warning border-warning/20',
  RED: 'bg-destructive/10 text-destructive border-destructive/20',
  WARNING_ACTION: 'bg-warning/10 text-warning border-warning/20',
  RESTRICTION: 'bg-warning/10 text-warning border-warning/20',
  FINAL_NOTICE: 'bg-destructive/10 text-destructive border-destructive/20',
  PAID: 'bg-success/10 text-success border-success/20',
  UNPAID: 'bg-destructive/10 text-destructive border-destructive/20',
  PARTIAL: 'bg-warning/10 text-warning border-warning/20',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Faol', GRADUATED: 'Bitirgan', EXPELLED: 'Chetlatilgan', WITHDRAWN: 'Chiqib ketgan',
  PRESENT: 'Kelgan', ABSENT: 'Kelmagan', LATE: 'Kechikkan', EXCUSED: 'Sababli',
  PENDING: 'Kutilmoqda', APPROVED: 'Tasdiqlangan', REJECTED: 'Rad etilgan', CLOSED: 'Yopilgan',
  GREEN: 'Yashil', YELLOW: 'Sariq', RED: 'Qizil',
  PAID: "To'langan", UNPAID: "To'lanmagan", PARTIAL: 'Qisman',
};

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border',
      statusStyles[status] || 'bg-muted text-muted-foreground border-border'
    )}>
      {label || statusLabels[status] || status}
    </span>
  );
}
