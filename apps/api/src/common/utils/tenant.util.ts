import { ForbiddenException } from '@nestjs/common';
import { RequestUser } from '../auth/jwt-request.util';
import { parseBigIntId } from './bigint.util';

export function getUserTenantId(user: RequestUser): bigint {
  try {
    return parseBigIntId(user?.tenantId, 'tenant_id');
  } catch {
    throw new ForbiddenException('INVALID_TENANT');
  }
}

export function ensureTenantId(
  user: RequestUser,
  tenantId?: bigint | string | number,
): bigint {
  const userTenantId = getUserTenantId(user);

  if (tenantId === null || tenantId === undefined || tenantId === ('' as any)) {
    return userTenantId;
  }

  const requestedTenantId = parseBigIntId(tenantId, 'tenant_id');
  if (requestedTenantId !== userTenantId) {
    throw new ForbiddenException('TENANT_MISMATCH');
  }
  return requestedTenantId;
}

export function withTenantCondition<T extends Record<string, any>>(
  user: RequestUser,
  where: T = {} as T,
): T & { tenant_id: bigint } {
  const userTenantId = getUserTenantId(user);

  if (where.tenant_id !== undefined && where.tenant_id !== null) {
    const requested = parseBigIntId(where.tenant_id, 'tenant_id');
    if (requested !== userTenantId)
      throw new ForbiddenException('TENANT_MISMATCH');
    return where as any;
  }

  return { ...(where as any), tenant_id: userTenantId };
}
