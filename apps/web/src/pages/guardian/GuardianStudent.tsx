import { useAuth, type GuardianUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader } from '@/components/shared/PageHeader';

export default function GuardianStudent() {
  const { user } = useAuth();
  const g = user as GuardianUser | null;
  return (
    <div className="space-y-6">
      <PageHeader title="O'quvchi profili" description="Farzandingiz haqida ma'lumot" />
      <Card>
        <CardContent className="p-6 flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {g?.studentFullName?.charAt(0) || 'S'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{g?.studentFullName || 'Student'}</h2>
            <p className="text-muted-foreground">ID: {g?.studentId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
