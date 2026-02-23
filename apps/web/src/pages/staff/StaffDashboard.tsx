import { useEffect, useState } from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GraduationCap, Users, UserCheck, AlertTriangle, DollarSign,
  Trophy, TrendingUp, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import api from '@/lib/api';

const COLORS = ['hsl(160,60%,40%)', 'hsl(210,90%,52%)', 'hsl(38,92%,50%)', 'hsl(280,60%,50%)', 'hsl(0,72%,51%)'];

const attendanceData = [
  { day: 'Dush', present: 94, absent: 4, late: 2 },
  { day: 'Sesh', present: 91, absent: 6, late: 3 },
  { day: 'Chor', present: 96, absent: 3, late: 1 },
  { day: 'Pay', present: 93, absent: 5, late: 2 },
  { day: 'Jum', present: 89, absent: 8, late: 3 },
];

const gradeDistribution = [
  { name: "A'lo", value: 35 },
  { name: "Yaxshi", value: 40 },
  { name: "Qoniqarli", value: 18 },
  { name: "Qoniqarsiz", value: 7 },
];

const monthlyTrend = [
  { month: 'Sen', students: 120, attendance: 94 },
  { month: 'Okt', students: 125, attendance: 92 },
  { month: 'Noy', students: 128, attendance: 90 },
  { month: 'Dek', students: 128, attendance: 88 },
  { month: 'Yan', students: 130, attendance: 93 },
  { month: 'Fev', students: 132, attendance: 95 },
];

const riskData = [
  { name: 'Yashil', value: 78, color: 'hsl(152,60%,40%)' },
  { name: 'Sariq', value: 15, color: 'hsl(38,92%,50%)' },
  { name: 'Qizil', value: 7, color: 'hsl(0,72%,51%)' },
];

const revenueData = [
  { month: 'Sen', kurs: 45000, ovqat: 12000, yotoq: 8000 },
  { month: 'Okt', kurs: 46000, ovqat: 13000, yotoq: 8500 },
  { month: 'Noy', kurs: 44000, ovqat: 11000, yotoq: 8000 },
  { month: 'Dek', kurs: 47000, ovqat: 14000, yotoq: 9000 },
  { month: 'Yan', kurs: 48000, ovqat: 12500, yotoq: 8500 },
  { month: 'Fev', kurs: 50000, ovqat: 13500, yotoq: 9500 },
];

export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Akademiya umumiy ko'rinishi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Jami o'quvchilar" value="132" icon={<GraduationCap className="h-5 w-5" />}
          color="primary" trend={{ value: 5.2, label: "o'tgan oyga nisbatan" }} />
        <StatCard title="Xodimlar" value="24" icon={<Users className="h-5 w-5" />}
          color="info" description="8 ta o'qituvchi" />
        <StatCard title="Bugungi davomat" value="95%" icon={<UserCheck className="h-5 w-5" />}
          color="success" trend={{ value: 2.1, label: "o'tgan haftaga" }} />
        <StatCard title="Risk zonasida" value="7" icon={<AlertTriangle className="h-5 w-5" />}
          color="destructive" description="Qizil zonada" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="To'lanmagan hisob" value="₿ 12.5M" icon={<DollarSign className="h-5 w-5" />}
          color="warning" description="18 ta hisob-faktura" />
        <StatCard title="Faol tadbirlar" value="3" icon={<Trophy className="h-5 w-5" />}
          color="accent" description="Bu hafta" />
        <StatCard title="O'rtacha ball" value="78.5" icon={<TrendingUp className="h-5 w-5" />}
          color="primary" trend={{ value: 3.4, label: "o'tgan testga" }} />
        <StatCard title="Qoidabuzarliklar" value="4" icon={<Clock className="h-5 w-5" />}
          color="destructive" description="Bu oy" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Haftalik davomat</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                <Legend />
                <Bar dataKey="present" name="Kelgan" fill="hsl(152,60%,40%)" radius={[4,4,0,0]} />
                <Bar dataKey="absent" name="Kelmagan" fill="hsl(0,72%,51%)" radius={[4,4,0,0]} />
                <Bar dataKey="late" name="Kechikkan" fill="hsl(38,92%,50%)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Baholar taqsimoti</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={gradeDistribution} cx="50%" cy="50%" outerRadius={100} innerRadius={55}
                  dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false} fontSize={12}>
                  {gradeDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Oylik trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="students" name="O'quvchilar" stroke="hsl(210,90%,52%)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="attendance" name="Davomat %" stroke="hsl(152,60%,40%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Risk darajalari</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`} fontSize={12}>
                  {riskData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Moliyaviy ko'rsatkichlar (ming so'm)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="kurs" name="Kurs to'lovi" stackId="1" stroke="hsl(220,65%,28%)" fill="hsl(220,65%,28%)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="ovqat" name="Ovqat" stackId="1" stroke="hsl(160,60%,40%)" fill="hsl(160,60%,40%)" fillOpacity={0.6} />
              <Area type="monotone" dataKey="yotoq" name="Yotoqxona" stackId="1" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%)" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
