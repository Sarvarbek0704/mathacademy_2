"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useGetAnnouncementsQuery } from "@/features/announcements/announcementsApi"
import { useGetEventsQuery } from "@/features/events/eventsApi"
import { formatDate } from "@/lib/utils"
import { Megaphone, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardRecentActivity() {
  const { data: announcements, isLoading: announcementsLoading } = useGetAnnouncementsQuery({ limit: 5 })
  const { data: events, isLoading: eventsLoading } = useGetEventsQuery({ limit: 5 })

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Recent Announcements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">{"So'nggi e'lonlar"}</CardTitle>
          <Link href="/announcements">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              Barchasi <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {announcementsLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-1 h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(announcements?.data || []).slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</span>
                      <Badge variant={a.isPublished ? "default" : "secondary"} className="h-5 text-[10px]">
                        {a.isPublished ? "Chop etilgan" : "Qoralama"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {(!announcements?.data || announcements.data.length === 0) && (
                <p className="py-4 text-center text-sm text-muted-foreground">{"E'lonlar yo'q"}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Yaqinlashayotgan tadbirlar</CardTitle>
          <Link href="/events">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              Barchasi <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-1 h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(events?.data || []).slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-foreground">{e.title}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatDate(e.startDate)}</span>
                      {e.location && (
                        <span className="text-xs text-muted-foreground">{e.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!events?.data || events.data.length === 0) && (
                <p className="py-4 text-center text-sm text-muted-foreground">Tadbirlar yo'q</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
