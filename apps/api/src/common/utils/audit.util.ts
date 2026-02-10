// apps/api/src/common/utils/audit.util.ts
import { PrismaService } from '../../prisma/prisma.service';

type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'RESET_PASSWORD'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'PAYMENT'
  | 'LOCK_ACCOUNT'
  | 'UNLOCK_ACCOUNT'
  | 'EXPORT'
  | 'IMPORT'
  | 'OTHER';

export type AuditActorType = 'STAFF' | 'GUARDIAN' | 'SYSTEM' | 'USER';

export class AuditLogger {
  constructor(private prisma: PrismaService) {}

  async log({
    tenantId,
    actorType,
    actorUserId,
    actorStudentAccountId,
    action,
    entityType,
    entityId,
    beforeData,
    afterData,
    ipAddress,
  }: {
    tenantId: bigint;
    actorType: 'STAFF' | 'GUARDIAN' | 'SYSTEM';
    actorUserId?: bigint | null;
    actorStudentAccountId?: bigint;
    action: AuditAction;
    entityType: string;
    entityId?: bigint;
    beforeData?: any;
    afterData?: any;
    ipAddress?: string;
  }) {
    try {
      await this.prisma.audit_logs.create({
        data: {
          tenant_id: tenantId,
          actor_type: actorType,
          actor_user_id: actorUserId,
          actor_student_account_id: actorStudentAccountId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          before_data: beforeData ? JSON.stringify(beforeData) : null,
          after_data: afterData ? JSON.stringify(afterData) : null,
          ip_address: ipAddress,
        },
      });
    } catch (error) {
      // Audit log xatosi asosiy operatsiyani buzmasin
      console.error('Audit logging failed:', error);
    }
  }

  // Convenience methods
  async logStaffAction(
    tenantId: bigint,
    userId: bigint,
    action: AuditAction,
    entityType: string,
    entityId?: bigint,
    changes?: { before?: any; after?: any },
    ipAddress?: string,
  ) {
    return this.log({
      tenantId,
      actorType: 'STAFF',
      actorUserId: userId,
      action,
      entityType,
      entityId,
      beforeData: changes?.before,
      afterData: changes?.after,
      ipAddress,
    });
  }

  async logLogin(
    tenantId: bigint,
    userId: bigint,
    accountType: 'STAFF' | 'GUARDIAN',
    ipAddress?: string,
  ) {
    return this.log({
      tenantId,
      actorType: accountType,
      actorUserId: accountType === 'STAFF' ? userId : undefined,
      actorStudentAccountId: accountType === 'GUARDIAN' ? userId : undefined,
      action: 'LOGIN',
      entityType: accountType === 'STAFF' ? 'users' : 'student_accounts',
      entityId: userId,
      ipAddress,
    });
  }
  async logCreate(args: Omit<Parameters<AuditLogger['log']>[0], 'action'>) {
    return this.log({ ...args, action: 'CREATE' });
  }

  async logUpdate(args: Omit<Parameters<AuditLogger['log']>[0], 'action'>) {
    return this.log({ ...args, action: 'UPDATE' });
  }

  async logDelete(args: Omit<Parameters<AuditLogger['log']>[0], 'action'>) {
    return this.log({ ...args, action: 'DELETE' });
  }
}
