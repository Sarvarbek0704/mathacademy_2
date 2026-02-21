"use client"

import { StatsCard } from "@/components/shared/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Layers, CalendarDays, DollarSign, TrendingUp, Award, Trophy, AlertTriangle } from "lucide-react"
import { DashboardCharts } from "@/components/dashboard/charts"
import { DashboardRecentActivity } from "@/components/dashboard/recent-activity"
import { useGetStudentStatsQuery } from "@/features/students/studentsApi"
import { useGetAttendanceStatsQuery } from "@/features/attendance/attendanceApi"
import { useGetAssessmentStatsQuery } from "@/features/assessments/assessmentsApi"
import { useGetBillingDashboardQuery } from "@/features/billing/billingApi"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

function StatsSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-16" />
            <Skeleton className="mt-1 h-3 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: studentStats, isLoading: studentsLoading } = useGetStudentStatsQuery()
  const { data: attendanceStats, isLoading: attendanceLoading } = useGetAttendanceStatsQuery()
  const { data: assessmentStats, isLoading: assessmentLoading } = useGetAssessmentStatsQuery()
  const { data: billingDashboard, isLoading: billingLoading } = useGetBillingDashboardQuery()

  const isLoading = studentsLoading || attendanceLoading || assessmentLoading || billingLoading

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Jami o'quvchilar"
              value={studentStats?.total ?? 0}
              description={`${studentStats?.active ?? 0} ta faol`}
              icon={Users}
              iconColor="text-blue-500"
            />
            <StatsCard
              title="Davomat"
              value={attendanceStats?.averageAttendance ? `${Math.round(attendanceStats.averageAttendance)}%` : "0%"}
              description={`${attendanceStats?.totalSessions ?? 0} ta sessiya`}
              icon={CalendarDays}
              iconColor="text-emerald-500"
            />
            <StatsCard
              title="O'rtacha baho"
              value={assessmentStats?.averageScore ? assessmentStats.averageScore.toFixed(1) : "0"}
              description={`${assessmentStats?.totalAssessments ?? 0} ta baholash`}
              icon={TrendingUp}
              iconColor="text-amber-500"
            />
            <StatsCard
              title="Umumiy tushumlar"
              value={billingDashboard?.totalPaid ? formatCurrency(billingDashboard.totalPaid) : "0 so'm"}
              description={billingDashboard?.totalOverdue ? `${formatCurrency(billingDashboard.totalOverdue)} muddati o'tgan` : "Barcha to'langan"}
              icon={DollarSign}
              iconColor="text-primary"
            />
          </>
        )}
      </div>

      {/* Second row of stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
            <StatsSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Guruhlar"
              value={studentStats?.byGroup?.length ?? 0}
              description="Faol guruhlar"
              icon={Layers}
              iconColor="text-violet-500"
            />
            <StatsCard
              title="Kohortalar"
              value={studentStats?.byCohort?.length ?? 0}
              description="Faol kohortalar"
              icon={Award}
              iconColor="text-cyan-500"
            />
            <StatsCard
              title="Muddati o'tgan"
              value={billingDashboard?.totalOverdue ? formatCurrency(billingDashboard.totalOverdue) : "0 so'm"}
              description="To'lanmagan"
              icon={AlertTriangle}
              iconColor="text-red-500"
            />
            <StatsCard
              title="Fanlar"
              value={assessmentStats?.bySubject?.length ?? 0}
              description="Baholangan fanlar"
              icon={Trophy}
              iconColor="text-orange-500"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <DashboardCharts
        studentStats={studentStats}
        attendanceStats={attendanceStats}
        assessmentStats={assessmentStats}
        billingDashboard={billingDashboard}
        isLoading={isLoading}
      />

      {/* Recent Activity */}
      <DashboardRecentActivity />
    </div>
  )
}
