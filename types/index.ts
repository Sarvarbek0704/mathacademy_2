// Auth
export interface LoginRequest {
  username?: string
  studentId?: string
  password: string
}

export interface AuthUser {
  id: string
  username?: string
  fullName: string
  email?: string
  phone?: string
  role?: string
  type: "STAFF" | "GUARDIAN"
  tenantId: string
}

export interface AuthResponse {
  accessToken: string
  user: AuthUser
}

export interface Session {
  id: string
  userAgent: string
  ip: string
  createdAt: string
  lastActiveAt: string
}

// Paginated
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Student
export interface Student {
  id: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: string
  status: string
  email?: string
  phone?: string
  address?: string
  enrollmentDate?: string
  currentGroupId?: string
  currentGroup?: Group
  cohortId?: string
  cohort?: Cohort
  trackId?: string
  track?: Track
  guardianName?: string
  guardianPhone?: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface StudentStatistics {
  total: number
  active: number
  inactive: number
  graduated: number
  expelled: number
  suspended: number
  byGender: Record<string, number>
  byGroup: { groupId: string; groupName: string; count: number }[]
  byCohort: { cohortId: string; cohortName: string; count: number }[]
}

// Group
export interface Group {
  id: string
  name: string
  description?: string
  campusId?: string
  campus?: Campus
  academicYearId?: string
  academicYear?: AcademicYear
  tenantId: string
  _count?: { members: number }
  createdAt: string
  updatedAt: string
}

// Subject
export interface Subject {
  id: string
  name: string
  code?: string
  description?: string
  teacherId?: string
  teacher?: User
  groupId?: string
  group?: Group
  tenantId: string
  createdAt: string
  updatedAt: string
}

// User
export interface User {
  id: string
  username: string
  fullName: string
  email?: string
  phone?: string
  isActive: boolean
  tenantId: string
  roles?: Role[]
  createdAt: string
  updatedAt: string
}

// Attendance
export interface AttendanceSession {
  id: string
  date: string
  subjectId?: string
  subject?: Subject
  groupId?: string
  group?: Group
  createdById?: string
  createdBy?: User
  tenantId: string
  _count?: { marks: number }
  createdAt: string
}

export interface AttendanceMark {
  id: string
  sessionId: string
  studentId: string
  student?: Student
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  note?: string
}

export interface AttendanceStatistics {
  totalSessions: number
  averageAttendance: number
  byStatus: Record<string, number>
  byGroup: { groupId: string; groupName: string; rate: number }[]
}

// Assessment
export interface Assessment {
  id: string
  name: string
  type?: string
  subjectId?: string
  subject?: Subject
  groupId?: string
  group?: Group
  maxScore?: number
  date?: string
  tenantId: string
  _count?: { scores: number }
  createdAt: string
  updatedAt: string
}

export interface AssessmentScore {
  id: string
  assessmentId: string
  studentId: string
  student?: Student
  score: number
  comment?: string
}

export interface AssessmentStatistics {
  totalAssessments: number
  averageScore: number
  bySubject: { subjectId: string; subjectName: string; avgScore: number }[]
}

// Billing
export interface Invoice {
  id: string
  studentId: string
  student?: Student
  amount: number
  dueDate: string
  status: string
  description?: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  invoiceId: string
  invoice?: Invoice
  amount: number
  method?: string
  note?: string
  paidAt: string
  createdAt: string
}

export interface BillingDashboard {
  totalInvoiced: number
  totalPaid: number
  totalOverdue: number
  totalPending: number
  recentPayments: Payment[]
  overdueInvoices: Invoice[]
}

// Discipline
export interface Violation {
  id: string
  studentId: string
  student?: Student
  type: string
  description: string
  severity?: string
  date: string
  reportedById?: string
  reportedBy?: User
  tenantId: string
  createdAt: string
}

export interface DisciplineAction {
  id: string
  violationId: string
  violation?: Violation
  actionType: string
  description?: string
  startDate?: string
  endDate?: string
  status?: string
  tenantId: string
  createdAt: string
}

// Timetable
export interface TimetableSlot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  subjectId?: string
  subject?: Subject
  groupId?: string
  group?: Group
  teacherId?: string
  teacher?: User
  room?: string
  tenantId: string
}

// Events
export interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  status?: string
  tenantId: string
  _count?: { participants: number }
  createdAt: string
  updatedAt: string
}

// Announcements
export interface Announcement {
  id: string
  title: string
  content: string
  isPublished: boolean
  publishedAt?: string
  authorId?: string
  author?: User
  tenantId: string
  createdAt: string
  updatedAt: string
}

// Awards
export interface Award {
  id: string
  name: string
  description?: string
  category?: string
  tenantId: string
  recipients?: { id: string; studentId: string; student?: Student; awardedAt: string }[]
  createdAt: string
}

// Certificates
export interface Certificate {
  id: string
  name: string
  description?: string
  templateUrl?: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface CertificateOutcome {
  id: string
  studentId: string
  student?: Student
  certificateId: string
  certificate?: Certificate
  issuedAt: string
  tenantId: string
}

// Competitions
export interface Competition {
  id: string
  name: string
  description?: string
  date?: string
  location?: string
  status?: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

// Ranking
export interface RankingSnapshot {
  id: string
  name?: string
  generatedAt: string
  criteria?: string
  tenantId: string
  _count?: { rows: number }
}

export interface RankingRow {
  id: string
  snapshotId: string
  studentId: string
  student?: Student
  rank: number
  score: number
  details?: Record<string, unknown>
}

// Dorms
export interface Dorm {
  id: string
  name: string
  description?: string
  capacity?: number
  tenantId: string
  _count?: { rooms: number }
  createdAt: string
}

export interface DormRoom {
  id: string
  dormId: string
  roomNumber: string
  floor?: number
  capacity: number
  tenantId: string
  _count?: { assignments: number }
}

export interface DormAssignment {
  id: string
  roomId: string
  studentId: string
  student?: Student
  startDate: string
  endDate?: string
}

// Display
export interface Display {
  id: string
  name: string
  description?: string
  location?: string
  isActive: boolean
  tenantId: string
  createdAt: string
}

// Leaves
export interface Leave {
  id: string
  studentId: string
  student?: Student
  reason: string
  startDate: string
  endDate: string
  status: string
  approvedById?: string
  approvedBy?: User
  tenantId: string
  createdAt: string
}

// Notifications
export interface NotificationTemplate {
  id: string
  name: string
  channel: string
  subject?: string
  body: string
  tenantId: string
}

export interface Notification {
  id: string
  recipientId?: string
  channel: string
  subject?: string
  body: string
  status: string
  tenantId: string
  createdAt: string
}

// File
export interface FileRecord {
  id: string
  filename: string
  originalName: string
  mimeType?: string
  size?: number
  url?: string
  uploadedById?: string
  tenantId: string
  createdAt: string
}

// RBAC
export interface Role {
  id: string
  name: string
  description?: string
  tenantId: string
  permissions?: Permission[]
  createdAt: string
}

export interface Permission {
  id: string
  resource: string
  action: string
  tenantId: string
}

// Academic Year
export interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  tenantId: string
  createdAt: string
}

// Campus
export interface Campus {
  id: string
  name: string
  address?: string
  phone?: string
  tenantId: string
  createdAt: string
}

// Cohort
export interface Cohort {
  id: string
  name: string
  description?: string
  academicYearId?: string
  academicYear?: AcademicYear
  tenantId: string
  createdAt: string
}

// Track
export interface Track {
  id: string
  name: string
  description?: string
  tenantId: string
  createdAt: string
}

// Risk
export interface RiskStudent {
  studentId: string
  student: Student
  riskLevel: string
  factors: string[]
  score: number
}

// Tenant
export interface Tenant {
  id: string
  name: string
  slug: string
  settings?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}
