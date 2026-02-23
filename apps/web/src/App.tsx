import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

import StaffLogin from "./pages/staff/StaffLogin";
import GuardianLogin from "./pages/guardian/GuardianLogin";
import { StaffLayout } from "./components/layout/StaffLayout";
import { GuardianLayout } from "./components/layout/GuardianLayout";

import StaffDashboard from "./pages/staff/StaffDashboard";
import StudentsPage from "./pages/staff/StudentsPage";
import UsersPage from "./pages/staff/UsersPage";
import AcademicYearsPage from "./pages/staff/AcademicYearsPage";
import GroupsPage from "./pages/staff/GroupsPage";
import AssessmentsPage from "./pages/staff/AssessmentsPage";
import AttendancePage from "./pages/staff/AttendancePage";
import RankingPage from "./pages/staff/RankingPage";
import RiskPage from "./pages/staff/RiskPage";
import ViolationsPage from "./pages/staff/ViolationsPage";
import DisciplineActionsPage from "./pages/staff/DisciplineActionsPage";
import LeavesPage from "./pages/staff/LeavesPage";
import PaymentsPage from "./pages/staff/PaymentsPage";
import InvoicesPage from "./pages/staff/InvoicesPage";
import SimpleCrudPage from "./pages/staff/SimpleCrudPage";

import GuardianDashboard from "./pages/guardian/GuardianDashboard";
import GuardianStudent from "./pages/guardian/GuardianStudent";
import GuardianGrades from "./pages/guardian/GuardianGrades";
import GuardianAttendance from "./pages/guardian/GuardianAttendance";
import GuardianDiscipline from "./pages/guardian/GuardianDiscipline";
import GuardianBilling from "./pages/guardian/GuardianBilling";
import GuardianEvents from "./pages/guardian/GuardianEvents";
import GuardianNotifications from "./pages/guardian/GuardianNotifications";
import GuardianCertificates from "./pages/guardian/GuardianCertificates";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/staff/login" replace />} />
              <Route path="/staff/login" element={<StaffLogin />} />
              <Route path="/guardian/login" element={<GuardianLogin />} />

              <Route path="/staff" element={<StaffLayout />}>
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="students" element={<StudentsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="academic-years" element={<AcademicYearsPage />} />
                <Route path="groups" element={<GroupsPage />} />
                <Route path="assessments" element={<AssessmentsPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="ranking" element={<RankingPage />} />
                <Route path="risk" element={<RiskPage />} />
                <Route path="violations" element={<ViolationsPage />} />
                <Route path="discipline-actions" element={<DisciplineActionsPage />} />
                <Route path="leaves" element={<LeavesPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="tracks" element={<SimpleCrudPage endpoint="/staff/tracks" title="Yo'nalishlar" description="O'quvchi yo'nalishlari" fields={[{ key: 'name', label: 'Nomi' }, { key: 'description', label: 'Tavsif' }]} />} />
                <Route path="cohorts" element={<SimpleCrudPage endpoint="/staff/cohorts" title="Kohortalar" description="Bitiruvchilar guruhi" fields={[{ key: 'name', label: 'Nomi' }, { key: 'year', label: 'Yil' }]} />} />
                <Route path="subjects" element={<SimpleCrudPage endpoint="/staff/subjects" title="Fanlar" description="O'quv fanlari" fields={[{ key: 'name', label: 'Nomi' }, { key: 'code', label: 'Kodi' }]} />} />
                <Route path="timetable" element={<SimpleCrudPage endpoint="/staff/timetable" title="Dars jadvali" description="Haftalik dars jadvali" fields={[{ key: 'weekday', label: 'Kun' }, { key: 'startTime', label: 'Boshlanish' }, { key: 'endTime', label: 'Tugash' }]} />} />
                <Route path="events" element={<SimpleCrudPage endpoint="/staff/events" title="Tadbirlar" description="Akademiya tadbirlari" fields={[{ key: 'title', label: 'Nomi' }, { key: 'type', label: 'Turi' }, { key: 'date', label: 'Sana', type: 'date' }, { key: 'description', label: 'Tavsif', type: 'textarea' }]} />} />
                <Route path="competitions" element={<SimpleCrudPage endpoint="/staff/competitions" title="Musobaqalar" description="Musobaqalar boshqaruvi" fields={[{ key: 'name', label: 'Nomi' }, { key: 'mode', label: 'Rejim' }, { key: 'rules', label: 'Qoidalar', type: 'textarea' }]} />} />
                <Route path="awards" element={<SimpleCrudPage endpoint="/staff/awards" title="Mukofotlar" description="O'quvchi mukofotlari" fields={[{ key: 'type', label: 'Turi' }, { key: 'description', label: 'Tavsif' }]} />} />
                <Route path="certificates" element={<SimpleCrudPage endpoint="/staff/certificates" title="Sertifikatlar" description="IELTS, SAT sertifikatlar" fields={[{ key: 'type', label: 'Turi' }, { key: 'name', label: 'Nomi' }, { key: 'score', label: 'Ball' }]} />} />
                <Route path="roles" element={<SimpleCrudPage endpoint="/staff/rbac/roles" title="Rollar" description="Foydalanuvchi rollari" fields={[{ key: 'name', label: 'Nomi' }, { key: 'description', label: 'Tavsif' }]} />} />
                <Route path="announcements" element={<SimpleCrudPage endpoint="/staff/announcements" title="E'lonlar" description="Akademiya e'lonlari" fields={[{ key: 'title', label: 'Sarlavha' }, { key: 'content', label: 'Matn', type: 'textarea' }]} />} />
                <Route path="notifications" element={<SimpleCrudPage endpoint="/staff/notifications/templates" title="Bildirishnomalar" description="Xabar shablonlari" fields={[{ key: 'eventCode', label: 'Event kodi' }, { key: 'channel', label: 'Kanal' }, { key: 'template', label: 'Shablon', type: 'textarea' }]} />} />
                <Route path="displays" element={<SimpleCrudPage endpoint="/staff/displays" title="Monitorlar" description="Info panellar" fields={[{ key: 'name', label: 'Nomi' }, { key: 'location', label: 'Joylashuvi' }]} />} />
                <Route path="dorms" element={<SimpleCrudPage endpoint="/staff/dorms" title="Yotoqxonalar" description="Yotoqxonalar boshqaruvi" fields={[{ key: 'name', label: 'Nomi' }, { key: 'capacity', label: 'Sig\'imi' }]} />} />
                <Route path="campuses" element={<SimpleCrudPage endpoint="/campuses" title="Kampuslar" description="Akademiya kampuslari" fields={[{ key: 'name', label: 'Nomi' }, { key: 'address', label: 'Manzil' }]} />} />
                <Route path="meal-billing" element={<SimpleCrudPage endpoint="/staff/billing/meal-weeks" title="Ovqat billing" description="Haftalik ovqat hisobi" fields={[{ key: 'weekStart', label: 'Hafta boshlanishi', type: 'date' }, { key: 'weekEnd', label: 'Hafta tugashi', type: 'date' }]} />} />
                <Route path="dorm-billing" element={<SimpleCrudPage endpoint="/staff/billing/dorm-months" title="Yotoqxona billing" description="Oylik yotoqxona hisobi" fields={[{ key: 'month', label: 'Oy' }, { key: 'year', label: 'Yil' }]} />} />
                <Route path="files" element={<SimpleCrudPage endpoint="/staff/files" title="Fayllar" description="Yuklangan fayllar" fields={[{ key: 'name', label: 'Nomi' }, { key: 'type', label: 'Turi' }]} />} />
              </Route>

              <Route path="/guardian" element={<GuardianLayout />}>
                <Route path="dashboard" element={<GuardianDashboard />} />
                <Route path="student" element={<GuardianStudent />} />
                <Route path="grades" element={<GuardianGrades />} />
                <Route path="attendance" element={<GuardianAttendance />} />
                <Route path="discipline" element={<GuardianDiscipline />} />
                <Route path="billing" element={<GuardianBilling />} />
                <Route path="events" element={<GuardianEvents />} />
                <Route path="notifications" element={<GuardianNotifications />} />
                <Route path="certificates" element={<GuardianCertificates />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
