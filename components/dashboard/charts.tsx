"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts"
import type { StudentStatistics, AttendanceStatistics, AssessmentStatistics, BillingDashboard } from "@/types"

const COLORS = [
  "hsl(234, 89%, 63%)",
  "hsl(173, 80%, 40%)",
  "hsl(43, 96%, 56%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 65%, 60%)",
]

interface DashboardChartsProps {
  studentStats?: StudentStatistics
  attendanceStats?: AttendanceStatistics
  assessmentStats?: AssessmentStatistics
  billingDashboard?: BillingDashboard
  isLoading: boolean
}

export function DashboardCharts({
  studentStats,
  attendanceStats,
  assessmentStats,
  billingDashboard,
  isLoading,
}: DashboardChartsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const studentByGroupData = studentStats?.byGroup?.slice(0, 8).map((g) => ({
    name: g.groupName.length > 12 ? g.groupName.slice(0, 12) + "..." : g.groupName,
    count: g.count,
  })) || []

  const attendanceByGroupData = attendanceStats?.byGroup?.slice(0, 8).map((g) => ({
    name: g.groupName.length > 12 ? g.groupName.slice(0, 12) + "..." : g.groupName,
    rate: Math.round(g.rate),
  })) || []

  const assessmentBySubjectData = assessmentStats?.bySubject?.slice(0, 8).map((s) => ({
    name: s.subjectName.length > 12 ? s.subjectName.slice(0, 12) + "..." : s.subjectName,
    avgScore: Math.round(s.avgScore * 10) / 10,
  })) || []

  const billingStatusData = billingDashboard
    ? [
        { name: "To'langan", value: billingDashboard.totalPaid || 0 },
        { name: "Kutilmoqda", value: billingDashboard.totalPending || 0 },
        { name: "Muddati o'tgan", value: billingDashboard.totalOverdue || 0 },
      ].filter((d) => d.value > 0)
    : []

  const studentStatusData = studentStats
    ? [
        { name: "Faol", value: studentStats.active || 0 },
        { name: "Nofaol", value: studentStats.inactive || 0 },
        { name: "Bitirgan", value: studentStats.graduated || 0 },
        { name: "Chetlatilgan", value: studentStats.expelled || 0 },
      ].filter((d) => d.value > 0)
    : []

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Students by Group */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Guruhlar bo'yicha o'quvchilar</CardTitle>
        </CardHeader>
        <CardContent>
          {studentByGroupData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={studentByGroupData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="count" name="O'quvchilar" fill="hsl(234, 89%, 63%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              {"Ma'lumot mavjud emas"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance by Group */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Guruhlar bo'yicha davomat (%)</CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceByGroupData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={attendanceByGroupData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="rate" name="Davomat %" fill="hsl(173, 80%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              {"Ma'lumot mavjud emas"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment by Subject */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{"Fanlar bo'yicha o'rtacha baho"}</CardTitle>
        </CardHeader>
        <CardContent>
          {assessmentBySubjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={assessmentBySubjectData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  name="O'rtacha baho"
                  stroke="hsl(43, 96%, 56%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(43, 96%, 56%)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              {"Ma'lumot mavjud emas"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing & Student Status Pie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{"To'lov holati va o'quvchi statuslari"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-center text-xs font-medium text-muted-foreground">{"To'lov holati"}</p>
              {billingStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={billingStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {billingStatusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">
                  {"Ma'lumot yo'q"}
                </div>
              )}
            </div>
            <div>
              <p className="mb-2 text-center text-xs font-medium text-muted-foreground">{"O'quvchi statuslari"}</p>
              {studentStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={studentStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {studentStatusData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">
                  {"Ma'lumot yo'q"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
