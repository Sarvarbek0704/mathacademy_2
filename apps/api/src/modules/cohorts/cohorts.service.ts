import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogger } from '../../common/utils/audit.util';
import { rethrowServiceError } from '../../common/utils/service-error.util';

import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';
import { ListCohortsQueryDto } from './dto/list-cohorts.query.dto';

function toBigInt(value: unknown, field = 'id'): bigint {
  const s = String(value ?? '').trim();
  if (!/^\d+$/.test(s) || s === '0')
    throw new BadRequestException(`INVALID_${field.toUpperCase()}`);
  return BigInt(s);
}

@Injectable()
export class CohortsService {
  private readonly auditLogger: AuditLogger;

  constructor(private readonly prisma: PrismaService) {
    this.auditLogger = new AuditLogger(prisma);
  }

  async create(args: {
    tenantId: string;
    userId: string;
    dto: CreateCohortDto;
    ipAddress?: string;
  }) {
    try {
      const tenant_id = toBigInt(args.tenantId, 'tenantId');
      const created_by_user_id = args.userId
        ? toBigInt(args.userId, 'userId')
        : null;

      // Check if cohort already exists for this tenant
      const existing = await this.prisma.cohorts.findFirst({
        where: { tenant_id, label: args.dto.label.trim() },
      });
      if (existing) throw new BadRequestException('COHORT_ALREADY_EXISTS');

      const cohort = await this.prisma.cohorts.create({
        data: {
          tenant_id,
          label: args.dto.label.trim(),
          graduation_year: args.dto.graduationYear,
        },
      });

      await this.auditLogger.log({
        tenantId: tenant_id,
        actorType: 'STAFF',
        actorUserId: created_by_user_id,
        action: 'CREATE',
        entityType: 'cohorts',
        entityId: cohort.id,
        afterData: { id: cohort.id.toString(), label: cohort.label },
        ipAddress: args.ipAddress,
      });

      return {
        id: cohort.id.toString(),
        label: cohort.label,
        graduationYear: cohort.graduation_year,
        createdAt: cohort.created_at,
      };
    } catch (error) {
      rethrowServiceError(error);
    }
  }

  async list(args: { tenantId: string; query: ListCohortsQueryDto }) {
    try {
      const tenant_id = toBigInt(args.tenantId, 'tenantId');
      const page = args.query.page ?? 1;
      const limit = Math.min(args.query.limit ?? 20, 200);
      const skip = (page - 1) * limit;

      const where: Prisma.cohortsWhereInput = { tenant_id };
      if (args.query.q) {
        where.label = { contains: args.query.q, mode: 'insensitive' };
      }
      if (args.query.graduationYear) {
        where.graduation_year = args.query.graduationYear;
      }

      const orderBy: Prisma.cohortsOrderByWithRelationInput = {};
      if (args.query.sortBy === 'label') {
        orderBy.label = args.query.sortDir ?? 'desc';
      } else if (args.query.sortBy === 'graduationYear') {
        orderBy.graduation_year = args.query.sortDir ?? 'desc';
      } else if (args.query.sortBy === 'id') {
        orderBy.id = args.query.sortDir ?? 'desc';
      } else {
        (orderBy as any).created_at = args.query.sortDir ?? 'desc';
      }

      const [total, items] = await this.prisma.$transaction([
        this.prisma.cohorts.count({ where }),
        this.prisma.cohorts.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            _count: { select: { student_cohort: true } },
          },
        }),
      ]);

      return {
        data: items.map((c) => ({
          id: c.id.toString(),
          label: c.label,
          graduationYear: c.graduation_year,
          createdAt: c.created_at,
          studentsCount: c._count.student_cohort,
        })),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      rethrowServiceError(error);
    }
  }

  async getById(args: { tenantId: string; cohortId: string }) {
    try {
      const tenant_id = toBigInt(args.tenantId, 'tenantId');
      const cohort_id = toBigInt(args.cohortId, 'cohortId');

      const cohort = await this.prisma.cohorts.findFirst({
        where: { id: cohort_id, tenant_id },
        include: {
          _count: { select: { student_cohort: true } },
        },
      });
      if (!cohort) throw new NotFoundException('COHORT_NOT_FOUND');

      return {
        id: cohort.id.toString(),
        label: cohort.label,
        graduationYear: cohort.graduation_year,
        createdAt: cohort.created_at,
        studentsCount: cohort._count.student_cohort,
      };
    } catch (error) {
      rethrowServiceError(error);
    }
  }

  async update(args: {
    tenantId: string;
    cohortId: string;
    userId: string;
    dto: UpdateCohortDto;
    ipAddress?: string;
  }) {
    try {
      const tenant_id = toBigInt(args.tenantId, 'tenantId');
      const cohort_id = toBigInt(args.cohortId, 'cohortId');
      const updated_by_user_id = args.userId
        ? toBigInt(args.userId, 'userId')
        : null;

      const cohort = await this.prisma.cohorts.findFirst({
        where: { id: cohort_id, tenant_id },
      });
      if (!cohort) throw new NotFoundException('COHORT_NOT_FOUND');

      if (args.dto.label && args.dto.label.trim() !== cohort.label) {
        const existing = await this.prisma.cohorts.findFirst({
          where: { tenant_id, label: args.dto.label.trim() },
        });
        if (existing)
          throw new BadRequestException('COHORT_LABEL_ALREADY_EXISTS');
      }

      const updateData: Prisma.cohortsUpdateInput = {};
      if (args.dto.label) updateData.label = args.dto.label.trim();
      if (args.dto.graduationYear !== undefined)
        updateData.graduation_year = args.dto.graduationYear;

      const updated = await this.prisma.cohorts.update({
        where: { id: cohort_id },
        data: updateData,
      });

      await this.auditLogger.log({
        tenantId: tenant_id,
        actorType: 'STAFF',
        actorUserId: updated_by_user_id,
        action: 'UPDATE',
        entityType: 'cohorts',
        entityId: cohort_id,
        beforeData: { id: cohort.id.toString(), label: cohort.label },
        afterData: { id: updated.id.toString(), label: updated.label },
        ipAddress: args.ipAddress,
      });

      return {
        id: updated.id.toString(),
        label: updated.label,
        graduationYear: updated.graduation_year,
      };
    } catch (error) {
      rethrowServiceError(error);
    }
  }

  async getDetail(args: { tenantId: string; cohortId: string }) {
    try {
      const tenant_id = toBigInt(args.tenantId, 'tenantId');
      const cohort_id = toBigInt(args.cohortId, 'cohortId');

      const cohort = await this.prisma.cohorts.findFirst({
        where: { id: cohort_id, tenant_id },
      });
      if (!cohort) throw new NotFoundException('COHORT_NOT_FOUND');

      const assignments = await this.prisma.student_cohort.findMany({
        where: { cohort_id, students: { tenant_id } },
        include: {
          students: {
            include: {
              groups: { select: { id: true, name: true, grade: true } },
              student_outcomes: {
                select: {
                  outcome_status: true,
                  institution_name: true,
                  faculty_or_program: true,
                  decision_date: true,
                },
              },
              student_risk_scores: {
                orderBy: { calculated_at: 'desc' },
                take: 1,
                select: { level: true, score: true },
              },
            },
          },
        },
        orderBy: { assigned_at: 'asc' },
      });

      const students = assignments.map((a) => {
        const s = a.students;
        return {
          id: s.id.toString(),
          fullName: s.full_name,
          status: s.status,
          gender: s.gender,
          admissionDate: s.admission_date,
          expectedGraduationYear: s.expected_graduation_year,
          groupId: s.current_group_id?.toString() || null,
          groupName: s.groups?.name || null,
          groupGrade: s.groups?.grade || null,
          assignedAt: a.assigned_at,
          outcome: s.student_outcomes
            ? {
                status: s.student_outcomes.outcome_status,
                institutionName: s.student_outcomes.institution_name,
                facultyOrProgram: s.student_outcomes.faculty_or_program,
                decisionDate: s.student_outcomes.decision_date,
              }
            : null,
          riskLevel: s.student_risk_scores[0]?.level || null,
        };
      });

      const byStatus: Record<string, number> = {};
      const byGroupMap = new Map<string, { id: string; name: string; grade: number | null; count: number }>();

      for (const s of students) {
        byStatus[s.status] = (byStatus[s.status] || 0) + 1;
        if (s.groupId) {
          if (!byGroupMap.has(s.groupId)) {
            byGroupMap.set(s.groupId, { id: s.groupId, name: s.groupName || '—', grade: s.groupGrade, count: 0 });
          }
          byGroupMap.get(s.groupId)!.count++;
        }
      }

      return {
        id: cohort.id.toString(),
        label: cohort.label,
        graduationYear: cohort.graduation_year,
        createdAt: cohort.created_at,
        stats: {
          total: students.length,
          byStatus,
          byGroup: Array.from(byGroupMap.values()),
        },
        students,
      };
    } catch (error) {
      rethrowServiceError(error);
    }
  }

  async getResults(args: { tenantId: string; cohortId: string }) {
    try {
      const tenant_id = toBigInt(args.tenantId, 'tenantId');
      const cohort_id = toBigInt(args.cohortId, 'cohortId');

      const cohort = await this.prisma.cohorts.findFirst({
        where: { id: cohort_id, tenant_id },
      });
      if (!cohort) throw new NotFoundException('COHORT_NOT_FOUND');

      const assignments = await this.prisma.student_cohort.findMany({
        where: { cohort_id, students: { tenant_id } },
        include: {
          students: {
            select: {
              id: true,
              full_name: true,
              current_group_id: true,
              groups: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (assignments.length === 0) {
        return { assessments: [], students: [], subjectStats: [] };
      }

      const studentIds = assignments.map((a) => a.student_id);
      const groupIds = [
        ...new Set(
          assignments
            .map((a) => a.students.current_group_id)
            .filter((id): id is bigint => id !== null),
        ),
      ];

      if (groupIds.length === 0) {
        return {
          assessments: [],
          students: assignments.map((a) => ({
            id: a.students.id.toString(),
            fullName: a.students.full_name,
            groupId: null,
            groupName: null,
            scores: {},
            totalScored: 0,
            totalMax: 0,
            percentage: 0,
          })),
          subjectStats: [],
        };
      }

      const assessments = await this.prisma.assessments.findMany({
        where: { tenant_id, group_id: { in: groupIds } },
        include: { subjects: { select: { id: true, name: true } } },
        orderBy: { held_at: 'asc' },
      });

      if (assessments.length === 0) {
        return {
          assessments: [],
          students: assignments.map((a) => ({
            id: a.students.id.toString(),
            fullName: a.students.full_name,
            groupId: a.students.current_group_id?.toString() || null,
            groupName: a.students.groups?.name || null,
            scores: {},
            totalScored: 0,
            totalMax: 0,
            percentage: 0,
          })),
          subjectStats: [],
        };
      }

      const assessmentIds = assessments.map((a) => a.id);
      const scores = await this.prisma.assessment_scores.findMany({
        where: { assessment_id: { in: assessmentIds }, student_id: { in: studentIds } },
      });

      const scoreMap = new Map<string, number>();
      for (const s of scores) {
        scoreMap.set(`${s.assessment_id}_${s.student_id}`, parseFloat(s.score.toString()));
      }

      const studentResults = assignments.map((a) => {
        const student = a.students;
        const studentGroupId = student.current_group_id;
        const relevant = studentGroupId
          ? assessments.filter((ass) => ass.group_id === studentGroupId)
          : assessments;

        let totalScored = 0;
        let totalMax = 0;
        const scoresByAss: Record<string, number | null> = {};

        for (const ass of relevant) {
          const score = scoreMap.get(`${ass.id}_${student.id}`) ?? null;
          scoresByAss[ass.id.toString()] = score;
          if (score !== null) totalScored += score;
          totalMax += parseFloat(ass.max_score.toString());
        }

        return {
          id: student.id.toString(),
          fullName: student.full_name,
          groupId: student.current_group_id?.toString() || null,
          groupName: student.groups?.name || null,
          scores: scoresByAss,
          totalScored: Math.round(totalScored * 10) / 10,
          totalMax: Math.round(totalMax * 10) / 10,
          percentage: totalMax > 0 ? Math.round((totalScored / totalMax) * 1000) / 10 : 0,
        };
      });

      studentResults.sort((a, b) => b.percentage - a.percentage);

      const subjectMap = new Map<string, { id: string; name: string; scored: number; maxTotal: number; entries: number; assessmentCount: number }>();
      for (const ass of assessments) {
        const sid = ass.subject_id.toString();
        if (!subjectMap.has(sid)) {
          subjectMap.set(sid, { id: sid, name: ass.subjects.name, scored: 0, maxTotal: 0, entries: 0, assessmentCount: 0 });
        }
        const sub = subjectMap.get(sid)!;
        sub.assessmentCount++;
        const maxScore = parseFloat(ass.max_score.toString());
        for (const a of assignments) {
          if (!a.students.current_group_id || a.students.current_group_id === ass.group_id) {
            const score = scoreMap.get(`${ass.id}_${a.student_id}`);
            if (score !== undefined) {
              sub.scored += score;
              sub.maxTotal += maxScore;
              sub.entries++;
            }
          }
        }
      }

      const subjectStats = Array.from(subjectMap.values()).map((s) => ({
        subjectId: s.id,
        subjectName: s.name,
        assessmentCount: s.assessmentCount,
        avgScore: s.entries > 0 ? Math.round((s.scored / s.entries) * 10) / 10 : 0,
        avgPercentage: s.maxTotal > 0 ? Math.round((s.scored / s.maxTotal) * 1000) / 10 : 0,
      }));

      return {
        assessments: assessments.map((a) => ({
          id: a.id.toString(),
          title: a.title,
          type: a.type,
          subjectId: a.subject_id.toString(),
          subjectName: a.subjects.name,
          groupId: a.group_id.toString(),
          maxScore: parseFloat(a.max_score.toString()),
          heldAt: a.held_at,
        })),
        students: studentResults,
        subjectStats,
      };
    } catch (error) {
      rethrowServiceError(error);
    }
  }

  async removeStudent(args: {
    tenantId: string;
    cohortId: string;
    studentId: string;
    userId: string;
    ipAddress?: string;
  }) {
    try {
      const tenant_id = toBigInt(args.tenantId, 'tenantId');
      const cohort_id = toBigInt(args.cohortId, 'cohortId');
      const student_id = toBigInt(args.studentId, 'studentId');
      const actor_user_id = args.userId ? toBigInt(args.userId, 'userId') : null;

      const cohort = await this.prisma.cohorts.findFirst({ where: { id: cohort_id, tenant_id } });
      if (!cohort) throw new NotFoundException('COHORT_NOT_FOUND');

      const student = await this.prisma.students.findFirst({ where: { id: student_id, tenant_id } });
      if (!student) throw new NotFoundException('STUDENT_NOT_FOUND');

      const assignment = await this.prisma.student_cohort.findFirst({ where: { student_id, cohort_id } });
      if (!assignment) throw new NotFoundException('STUDENT_NOT_IN_COHORT');

      await this.prisma.student_cohort.delete({ where: { student_id } });

      await this.auditLogger.log({
        tenantId: tenant_id,
        actorType: 'STAFF',
        actorUserId: actor_user_id,
        action: 'DELETE',
        entityType: 'student_cohort',
        entityId: student_id,
        beforeData: {
          studentId: student_id.toString(),
          cohortId: cohort_id.toString(),
          cohortLabel: cohort.label,
          studentName: student.full_name,
        },
        ipAddress: args.ipAddress,
      });

      return { ok: true };
    } catch (error) {
      rethrowServiceError(error);
    }
  }

  async delete(args: {
    tenantId: string;
    cohortId: string;
    userId: string;
    ipAddress?: string;
  }) {
    try {
      const tenant_id = toBigInt(args.tenantId, 'tenantId');
      const cohort_id = toBigInt(args.cohortId, 'cohortId');
      const deleted_by_user_id = args.userId
        ? toBigInt(args.userId, 'userId')
        : null;

      const cohort = await this.prisma.cohorts.findFirst({
        where: { id: cohort_id, tenant_id },
        include: {
          _count: { select: { student_cohort: true } },
        },
      });
      if (!cohort) throw new NotFoundException('COHORT_NOT_FOUND');

      if (cohort._count.student_cohort > 0) {
        throw new BadRequestException('COHORT_HAS_STUDENTS');
      }

      await this.prisma.cohorts.delete({ where: { id: cohort_id } });

      await this.auditLogger.log({
        tenantId: tenant_id,
        actorType: 'STAFF',
        actorUserId: deleted_by_user_id,
        action: 'DELETE',
        entityType: 'cohorts',
        entityId: cohort_id,
        beforeData: { id: cohort.id.toString(), label: cohort.label },
        ipAddress: args.ipAddress,
      });

      return { ok: true };
    } catch (error) {
      rethrowServiceError(error);
    }
  }
}
