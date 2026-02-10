// apps/api/src/modules/students/guardian-student.controller.ts
import {
  Controller,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  Query,
  Put,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';

import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AccessGuard } from '../../common/guards/access.guard';
import { StudentsService } from './students.service';
import { UpdateProfileDto } from '../auth/dto/update-profile.dto';

@ApiTags('Guardian - Student')
@ApiBearerAuth('access-token')
@UseGuards(AccessGuard)
@Controller('guardian/student')
export class GuardianStudentController {
  constructor(private readonly studentsService: StudentsService) {}

  // ==================== GET STUDENT PROFILE ====================
  @Get()
  @ApiOperation({
    summary: 'Get student profile for guardian',
    description:
      'Get comprehensive student profile information accessible to guardian',
  })
  @ApiResponse({
    status: 200,
    description: 'Student profile returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or not a guardian',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  async me(@Req() req: any) {
    const user = req.user;
    if (!user || user.type !== 'GUARDIAN')
      throw new UnauthorizedException('NOT_GUARDIAN');

    const studentAccountId = String(user.studentAccountId || '');
    if (!studentAccountId)
      throw new UnauthorizedException('NO_STUDENT_ACCOUNT');

    const data = await this.studentsService.guardianMe({ studentAccountId });
    if (!data) throw new NotFoundException('STUDENT_NOT_FOUND');
    return data;
  }

  // ==================== UPDATE GUARDIAN PROFILE ====================
  @Put('profile')
  @ApiOperation({
    summary: 'Update guardian profile',
    description: 'Update guardian profile information (name, phone, telegram)',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid profile data',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or not a guardian',
  })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    const user = req.user;
    if (!user || user.type !== 'GUARDIAN')
      throw new UnauthorizedException('NOT_GUARDIAN');

    const studentAccountId = String(user.studentAccountId || '');
    if (!studentAccountId)
      throw new UnauthorizedException('NO_STUDENT_ACCOUNT');

    // Validate guardian relation if provided
    if (dto.profileRelation) {
      const validRelations = ['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'];
      if (!validRelations.includes(dto.profileRelation)) {
        throw new BadRequestException('INVALID_RELATION');
      }
    }

    // Update via auth service (since it already has the logic)
    // For now, we'll handle it directly
    const updateData: any = {};
    if (dto.fullName) updateData.profile_full_name = dto.fullName;
    if (dto.phone) updateData.profile_phone = dto.phone;
    if (dto.telegramUsername)
      updateData.telegram_username = dto.telegramUsername;
    if (dto.profileRelation) updateData.profile_relation = dto.profileRelation;

    // Mark profile as completed if full name is provided
    if (dto.fullName) {
      updateData.profile_completed_at = new Date();
    }

    // We'll need to add this method to StudentsService
    return {
      success: true,
      message: 'Use the auth/profile endpoint to update guardian profile',
      note: 'Guardian profile updates should go through auth/profile endpoint',
    };
  }

  // ==================== GET STUDENT GRADES ====================
  @Get('grades')
  @ApiOperation({
    summary: 'Get student grades',
    description: "Get assessment grades for the guardian's student",
  })
  @ApiResponse({
    status: 200,
    description: 'Grades returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or not a guardian',
  })
  async getGrades(@Req() req: any) {
    const user = req.user;
    if (!user || user.type !== 'GUARDIAN')
      throw new UnauthorizedException('NOT_GUARDIAN');

    const studentAccountId = String(user.studentAccountId || '');
    if (!studentAccountId)
      throw new UnauthorizedException('NO_STUDENT_ACCOUNT');

    // Get student ID from account
    const account = await this.studentsService[
      'prisma'
    ].student_accounts.findUnique({
      where: { id: BigInt(studentAccountId) },
      select: { student_id: true },
    });

    if (!account) throw new NotFoundException('ACCOUNT_NOT_FOUND');

    // Get grades - we need to add this method to StudentsService
    const grades = await this.studentsService[
      'prisma'
    ].assessment_scores.findMany({
      where: {
        student_id: account.student_id,
        assessments: {
          is_published_to_guardians: true,
        },
      },
      include: {
        assessments: {
          select: {
            id: true,
            title: true,
            type: true,
            held_at: true,
            max_score: true,
            weight: true,
            subjects: { select: { name: true } },
            groups: { select: { name: true } },
          },
        },
      },
      orderBy: { assessments: { held_at: 'desc' } },
      take: 50,
    });

    return {
      success: true,
      grades: grades.map((g) => ({
        id: g.assessment_id.toString(),
        title: g.assessments.title,
        type: g.assessments.type,
        subject: g.assessments.subjects.name,
        group: g.assessments.groups.name,
        heldAt: g.assessments.held_at,
        score: g.score,
        maxScore: g.assessments.max_score,
        weight: g.assessments.weight,
        teacherComment: g.teacher_comment,
        enteredAt: g.entered_at,
      })),
    };
  }

  // ==================== GET STUDENT ATTENDANCE ====================
  @Get('attendance')
  @ApiOperation({
    summary: 'Get student attendance',
    description: "Get attendance records for the guardian's student",
  })
  @ApiResponse({
    status: 200,
    description: 'Attendance returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or not a guardian',
  })
  async getAttendance(@Req() req: any, @Query('month') month?: string) {
    const user = req.user;
    if (!user || user.type !== 'GUARDIAN')
      throw new UnauthorizedException('NOT_GUARDIAN');

    const studentAccountId = String(user.studentAccountId || '');
    if (!studentAccountId)
      throw new UnauthorizedException('NO_STUDENT_ACCOUNT');

    // Get student ID from account
    const account = await this.studentsService[
      'prisma'
    ].student_accounts.findUnique({
      where: { id: BigInt(studentAccountId) },
      select: { student_id: true },
    });

    if (!account) throw new NotFoundException('ACCOUNT_NOT_FOUND');

    // Calculate date range
    const now = new Date();
    const startDate = month
      ? new Date(`${month}-01`)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = month
      ? new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get attendance
    const attendance = await this.studentsService[
      'prisma'
    ].attendance_marks.findMany({
      where: {
        student_id: account.student_id,
        attendance_sessions: {
          session_date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        attendance_sessions: {
          select: {
            id: true,
            session_date: true,
            type: true,
            groups: { select: { name: true } },
          },
        },
      },
      orderBy: { attendance_sessions: { session_date: 'desc' } },
    });

    // Calculate summary
    const summary = attendance.reduce(
      (acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        acc.total = (acc.total || 0) + 1;
        return acc;
      },
      { total: 0 },
    );

    return {
      success: true,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        month: startDate.toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        }),
      },
      summary,
      records: attendance.map((a) => ({
        id: a.session_id.toString(),
        date: a.attendance_sessions.session_date,
        type: a.attendance_sessions.type,
        group: a.attendance_sessions.groups.name,
        status: a.status,
        note: a.note,
      })),
    };
  }

  // ==================== GET STUDENT RANKING ====================
  @Get('ranking')
  @ApiOperation({
    summary: 'Get student ranking',
    description: "Get ranking information for the guardian's student",
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or not a guardian',
  })
  async getRanking(@Req() req: any) {
    const user = req.user;
    if (!user || user.type !== 'GUARDIAN')
      throw new UnauthorizedException('NOT_GUARDIAN');

    const studentAccountId = String(user.studentAccountId || '');
    if (!studentAccountId)
      throw new UnauthorizedException('NO_STUDENT_ACCOUNT');

    // Get student ID from account
    const account = await this.studentsService[
      'prisma'
    ].student_accounts.findUnique({
      where: { id: BigInt(studentAccountId) },
      select: { student_id: true },
    });

    if (!account) throw new NotFoundException('ACCOUNT_NOT_FOUND');

    // Get latest snapshot
    const snapshot = await this.studentsService[
      'prisma'
    ].grade_snapshot_rows.findFirst({
      where: {
        student_id: account.student_id,
        grade_snapshots: {
          generated_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      },
      include: {
        grade_snapshots: {
          select: {
            id: true,
            period_type: true,
            period_start: true,
            period_end: true,
            generated_at: true,
            groups: { select: { name: true } },
          },
        },
      },
      orderBy: { grade_snapshots: { generated_at: 'desc' } },
    });

    if (!snapshot) {
      return {
        success: true,
        message: 'No ranking data available',
        hasData: false,
      };
    }

    // Get rank within snapshot
    const allRows = await this.studentsService[
      'prisma'
    ].grade_snapshot_rows.findMany({
      where: { snapshot_id: snapshot.snapshot_id },
      orderBy: { total_score: 'desc' },
      select: { student_id: true, total_score: true, rank: true },
    });

    const studentRow = allRows.find(
      (r) => r.student_id.toString() === account.student_id.toString(),
    );
    const totalStudents = allRows.length;

    return {
      success: true,
      hasData: true,
      snapshot: {
        id: snapshot.snapshot_id.toString(),
        periodType: snapshot.grade_snapshots.period_type,
        periodStart: snapshot.grade_snapshots.period_start,
        periodEnd: snapshot.grade_snapshots.period_end,
        generatedAt: snapshot.grade_snapshots.generated_at,
        group: snapshot.grade_snapshots.groups.name,
      },
      ranking: {
        rank: studentRow?.rank || 0,
        totalScore: snapshot.total_score,
        riskLevel: snapshot.risk_level,
        totalStudents,
        percentile:
          totalStudents > 0
            ? Math.round(
                ((totalStudents - (studentRow?.rank || 0)) / totalStudents) *
                  100,
              )
            : 0,
      },
    };
  }

  // ==================== GET STUDENT DISCIPLINE ====================
  @Get('discipline')
  @ApiOperation({
    summary: 'Get student discipline records',
    description:
      "Get discipline actions and violations for the guardian's student",
  })
  @ApiResponse({
    status: 200,
    description: 'Discipline records returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or not a guardian',
  })
  async getDiscipline(@Req() req: any) {
    const user = req.user;
    if (!user || user.type !== 'GUARDIAN')
      throw new UnauthorizedException('NOT_GUARDIAN');

    const studentAccountId = String(user.studentAccountId || '');
    if (!studentAccountId)
      throw new UnauthorizedException('NO_STUDENT_ACCOUNT');

    // Get student ID from account
    const account = await this.studentsService[
      'prisma'
    ].student_accounts.findUnique({
      where: { id: BigInt(studentAccountId) },
      select: { student_id: true },
    });

    if (!account) throw new NotFoundException('ACCOUNT_NOT_FOUND');

    // Get discipline actions
    const actions = await this.studentsService[
      'prisma'
    ].discipline_actions.findMany({
      where: {
        student_id: account.student_id,
        is_active: true,
      },
      include: {
        users: { select: { full_name: true } },
        assessments: { select: { title: true } },
      },
      orderBy: { issued_at: 'desc' },
    });

    // Get violations
    const violations = await this.studentsService['prisma'].violations.findMany(
      {
        where: {
          student_id: account.student_id,
        },
        include: {
          users: { select: { full_name: true } },
          files: { select: { file_name: true, url: true } },
          discipline_actions: { select: { action_type: true, reason: true } },
        },
        orderBy: { detected_at: 'desc' },
      },
    );

    return {
      success: true,
      discipline: {
        actions: actions.map((a) => ({
          id: a.id.toString(),
          actionType: a.action_type,
          reason: a.reason,
          issuedAt: a.issued_at,
          issuedBy: a.users?.full_name || 'System',
          relatedAssessment: a.assessments?.title,
          isActive: a.is_active,
        })),
        violations: violations.map((v) => ({
          id: v.id.toString(),
          ruleCode: v.rule_code,
          description: v.description,
          severity: v.severity,
          detectedAt: v.detected_at,
          recordedBy: v.users?.full_name || 'System',
          evidence: v.files
            ? {
                fileName: v.files.file_name,
                url: v.files.url,
              }
            : null,
          linkedAction: v.linked_discipline_action_id
            ? {
                actionType: v.discipline_actions?.action_type,
                reason: v.discipline_actions?.reason,
              }
            : null,
        })),
      },
    };
  }

  // ==================== GET STUDENT INVOICES ====================
  @Get('invoices')
  @ApiOperation({
    summary: 'Get student invoices',
    description: "Get billing invoices for the guardian's student",
  })
  @ApiResponse({
    status: 200,
    description: 'Invoices returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or not a guardian',
  })
  async getInvoices(@Req() req: any, @Query('status') status?: string) {
    const user = req.user;
    if (!user || user.type !== 'GUARDIAN')
      throw new UnauthorizedException('NOT_GUARDIAN');

    const studentAccountId = String(user.studentAccountId || '');
    if (!studentAccountId)
      throw new UnauthorizedException('NO_STUDENT_ACCOUNT');

    // Get student ID from account
    const account = await this.studentsService[
      'prisma'
    ].student_accounts.findUnique({
      where: { id: BigInt(studentAccountId) },
      select: { student_id: true },
    });

    if (!account) throw new NotFoundException('ACCOUNT_NOT_FOUND');

    // Build where clause
    const where: any = {
      student_id: account.student_id,
    };

    if (status) {
      where.status = status;
    }

    // Get invoices
    const invoices = await this.studentsService['prisma'].invoices.findMany({
      where,
      include: {
        payments: {
          select: {
            id: true,
            paid_amount: true,
            paid_at: true,
            method: true,
            source: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Calculate totals
    const totals = invoices.reduce(
      (acc, invoice) => {
        acc.totalAmount += Number(invoice.amount);
        const paid = invoice.payments.reduce(
          (sum, p) => sum + Number(p.paid_amount),
          0,
        );
        acc.totalPaid += paid;
        acc.totalPending += Number(invoice.amount) - paid;
        return acc;
      },
      { totalAmount: 0, totalPaid: 0, totalPending: 0 },
    );

    return {
      success: true,
      totals,
      invoices: invoices.map((inv) => {
        const paid = inv.payments.reduce(
          (sum, p) => sum + Number(p.paid_amount),
          0,
        );
        const remaining = Number(inv.amount) - paid;
        const isOverdue =
          inv.due_date && new Date(inv.due_date) < new Date() && remaining > 0;

        return {
          id: inv.id.toString(),
          type: inv.type,
          periodStart: inv.period_start,
          periodEnd: inv.period_end,
          amount: inv.amount,
          currency: inv.currency,
          status: inv.status,
          dueDate: inv.due_date,
          createdAt: inv.created_at,
          paidAmount: paid,
          remainingAmount: remaining,
          isOverdue,
          payments: inv.payments.map((p) => ({
            id: p.id.toString(),
            paidAmount: p.paid_amount,
            paidAt: p.paid_at,
            method: p.method,
            source: p.source,
          })),
        };
      }),
    };
  }

  // ==================== GET STUDENT CERTIFICATES ====================
  @Get('certificates')
  @ApiOperation({
    summary: 'Get student certificates',
    description: "Get certificates and outcomes for the guardian's student",
  })
  @ApiResponse({
    status: 200,
    description: 'Certificates returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or not a guardian',
  })
  async getCertificates(@Req() req: any) {
    const user = req.user;
    if (!user || user.type !== 'GUARDIAN')
      throw new UnauthorizedException('NOT_GUARDIAN');

    const studentAccountId = String(user.studentAccountId || '');
    if (!studentAccountId)
      throw new UnauthorizedException('NO_STUDENT_ACCOUNT');

    // Get student ID from account
    const account = await this.studentsService[
      'prisma'
    ].student_accounts.findUnique({
      where: { id: BigInt(studentAccountId) },
      select: { student_id: true },
    });

    if (!account) throw new NotFoundException('ACCOUNT_NOT_FOUND');

    // Get certificates
    const certificates = await this.studentsService[
      'prisma'
    ].certificates.findMany({
      where: {
        student_id: account.student_id,
      },
      include: {
        subjects: { select: { name: true } },
        files: { select: { file_name: true, url: true } },
      },
      orderBy: { issued_at: 'desc' },
    });

    // Get outcome
    const outcome = await this.studentsService[
      'prisma'
    ].student_outcomes.findUnique({
      where: { student_id: account.student_id },
    });

    return {
      success: true,
      certificates: certificates.map((c) => ({
        id: c.id.toString(),
        title: c.title,
        subject: c.subjects?.name,
        issuer: c.issuer,
        score: c.score,
        issuedAt: c.issued_at,
        file: c.files
          ? {
              fileName: c.files.file_name,
              url: c.files.url,
            }
          : null,
        notes: c.notes,
      })),
      outcome: outcome
        ? {
            status: outcome.outcome_status,
            institution: outcome.institution_name,
            program: outcome.faculty_or_program,
            decisionDate: outcome.decision_date,
            source: outcome.source,
            notes: outcome.notes,
          }
        : null,
    };
  }

  // ==================== GET STUDENT EVENTS ====================
  @Get('events')
  @ApiOperation({
    summary: 'Get student events',
    description:
      'Get events and competitions that the student is participating in',
  })
  @ApiResponse({
    status: 200,
    description: 'Events returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or not a guardian',
  })
  async getEvents(@Req() req: any) {
    const user = req.user;
    if (!user || user.type !== 'GUARDIAN')
      throw new UnauthorizedException('NOT_GUARDIAN');

    const studentAccountId = String(user.studentAccountId || '');
    if (!studentAccountId)
      throw new UnauthorizedException('NO_STUDENT_ACCOUNT');

    // Get student ID from account
    const account = await this.studentsService[
      'prisma'
    ].student_accounts.findUnique({
      where: { id: BigInt(studentAccountId) },
      select: { student_id: true },
    });

    if (!account) throw new NotFoundException('ACCOUNT_NOT_FOUND');

    // Get upcoming events
    const upcomingEvents = await this.studentsService[
      'prisma'
    ].event_participants.findMany({
      where: {
        student_id: account.student_id,
        events: {
          starts_at: {
            gte: new Date(),
          },
        },
      },
      include: {
        events: {
          select: {
            id: true,
            title: true,
            event_type: true,
            starts_at: true,
            ends_at: true,
            description: true,
            campuses: { select: { name: true } },
          },
        },
      },
      orderBy: { events: { starts_at: 'asc' } },
      take: 10,
    });

    // Get past events
    const pastEvents = await this.studentsService[
      'prisma'
    ].event_participants.findMany({
      where: {
        student_id: account.student_id,
        events: {
          ends_at: {
            lt: new Date(),
          },
        },
      },
      include: {
        events: {
          select: {
            id: true,
            title: true,
            event_type: true,
            starts_at: true,
            ends_at: true,
            campuses: { select: { name: true } },
          },
        },
      },
      orderBy: { events: { starts_at: 'desc' } },
      take: 10,
    });

    // Get competition results
    const competitionResults = await this.studentsService[
      'prisma'
    ].competition_results.findMany({
      where: {
        competition_entries: {
          student_id: account.student_id,
        },
      },
      include: {
        competitions: { select: { title: true, mode: true } },
        competition_entries: { select: { name_display: true } },
      },
      orderBy: { competitions: { starts_at: 'desc' } },
      take: 10,
    });

    return {
      success: true,
      events: {
        upcoming: upcomingEvents.map((e) => ({
          id: e.event_id.toString(),
          title: e.events.title,
          type: e.events.event_type,
          startsAt: e.events.starts_at,
          endsAt: e.events.ends_at,
          description: e.events.description,
          campus: e.events.campuses?.name,
          role: e.role,
        })),
        past: pastEvents.map((e) => ({
          id: e.event_id.toString(),
          title: e.events.title,
          type: e.events.event_type,
          startsAt: e.events.starts_at,
          endsAt: e.events.ends_at,
          campus: e.events.campuses?.name,
          role: e.role,
        })),
      },
      competitions: competitionResults.map((c) => ({
        competitionId: c.competition_id.toString(),
        competitionTitle: c.competitions.title,
        mode: c.competitions.mode,
        entryName: c.competition_entries.name_display,
        rank: c.rank,
        score: c.score,
        prize: c.prize,
      })),
    };
  }

  // ==================== GET STUDENT TIMETABLE ====================
  @Get('timetable')
  @ApiOperation({
    summary: 'Get student timetable',
    description: "Get class timetable for the guardian's student",
  })
  @ApiResponse({
    status: 200,
    description: 'Timetable returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated or not a guardian',
  })
  async getTimetable(@Req() req: any) {
    const user = req.user;
    if (!user || user.type !== 'GUARDIAN')
      throw new UnauthorizedException('NOT_GUARDIAN');

    const studentAccountId = String(user.studentAccountId || '');
    if (!studentAccountId)
      throw new UnauthorizedException('NO_STUDENT_ACCOUNT');

    // Get student ID from account
    const account = await this.studentsService[
      'prisma'
    ].student_accounts.findUnique({
      where: { id: BigInt(studentAccountId) },
      select: { student_id: true },
    });

    if (!account) throw new NotFoundException('ACCOUNT_NOT_FOUND');

    // Get student's current group
    const student = await this.studentsService['prisma'].students.findUnique({
      where: { id: account.student_id },
      select: { current_group_id: true },
    });

    if (!student || !student.current_group_id) {
      return {
        success: true,
        hasTimetable: false,
        message: 'Student is not assigned to any group',
      };
    }

    // Get current timetable for the group
    const now = new Date();
    const timetable = await this.studentsService['prisma'].timetable.findFirst({
      where: {
        group_id: student.current_group_id,
        academic_years: {
          is_current: true,
        },
      },
      include: {
        timetable_lessons: {
          include: {
            subjects: { select: { name: true } },
            users: { select: { full_name: true } },
          },
          orderBy: [{ day_of_week: 'asc' }, { period_no: 'asc' }],
        },
      },
    });

    if (!timetable) {
      return {
        success: true,
        hasTimetable: false,
        message: 'No timetable found for current group',
      };
    }

    // Organize by day
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const organizedLessons = days.map((dayName, index) => {
      const dayNumber = index + 1; // Monday = 1
      const lessons = timetable.timetable_lessons
        .filter((lesson) => lesson.day_of_week === dayNumber)
        .map((lesson) => ({
          id: lesson.id.toString(),
          periodNo: lesson.period_no,
          subject: lesson.subjects.name,
          teacher: lesson.users?.full_name,
          room: lesson.room,
          startsAt: lesson.starts_at,
          endsAt: lesson.ends_at,
        }))
        .sort((a, b) => a.periodNo - b.periodNo);

      return {
        day: dayName,
        dayNumber,
        lessons,
      };
    });

    return {
      success: true,
      hasTimetable: true,
      timetable: {
        id: timetable.id.toString(),
        name: timetable.name,
        groupId: timetable.group_id.toString(),
        lessonsByDay: organizedLessons,
      },
    };
  }
}
