import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm"
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    INACTIVE: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    GRADUATED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    EXPELLED: "bg-red-500/10 text-red-500 border-red-500/20",
    SUSPENDED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    PAID: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    UNPAID: "bg-red-500/10 text-red-500 border-red-500/20",
    PARTIAL: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    OVERDUE: "bg-red-500/10 text-red-500 border-red-500/20",
    PRESENT: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    ABSENT: "bg-red-500/10 text-red-500 border-red-500/20",
    LATE: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    EXCUSED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    PUBLISHED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    DRAFT: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    CANCELLED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    UPCOMING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  }
  return colors[status] || "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
}
