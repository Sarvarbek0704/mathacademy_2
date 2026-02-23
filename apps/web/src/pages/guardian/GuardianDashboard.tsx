import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, UserCheck, ClipboardList, Receipt, Trophy, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const attendanceWeek = [
  { day: 'Dush', pct: 96 }, { day: 'Sesh', pct: 92 }, { day: 'Chor', pct: 98 },
  { day: 'Pay', pct: 94 }, { day: 'Jum', pct: 90 },
];

const gradeData = [
  { name: "A'lo", value: 4 }, { name: 'Yaxshi', value: 6 },
  { name: "Qoniqarli", value: 2 }, { name: 'Qoniqarsiz', value: 1 },
];

const COLORS = ['hsl(152,60%,40%)', 'hsl(210,90%,52%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)'];

export default function GuardianDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bosh sahifa</h1>
        <p className="text-muted-foreground">Farzandingiz haqida umumiy ma'lumot</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Umumiy reyting" value="#12" icon={<TrendingUp className="h-5 w-5" />}
          color="primary" description="132 ta ichida" />
        <StatCard title="Davomat" value="94%" icon={<UserCheck className="h-5 w-5" />}
          color="success" trend={{ value: 1.5, label: "o'tgan haftaga" }} />
        <StatCard title="O'rtacha ball" value="82.3" icon={<ClipboardList className="h-5 w-5" />}
          color="info" trend={{ value: 4.2, label: "o'tgan oyga" }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="To'lanmagan" value="₿ 2.5M" icon={<Receipt className="h-5 w-5" />}
          color="warning" description="2 ta hisob" />
        <StatCard title="Mukofotlar" value="3" icon={<Trophy className="h-5 w-5" />}
          color="accent" description="Bu yil" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Haftalik davomat</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[80, 100]} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Bar dataKey="pct" name="Davomat %" fill="hsl(160,60%,40%)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Baholar taqsimoti</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={gradeData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} fontSize={12}>
                  {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
