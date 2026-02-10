import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

export type RequestUser = {
  tenantId?: string | number;
  roles?: string[];
  permissions?: string[];
  type?: 'STAFF' | 'GUARDIAN';
  sessionId?: string;
  userId?: string | number;
  studentAccountId?: string | number;
  studentId?: string | number;
  [k: string]: unknown;
};

function extractBearer(req: Request): string {
  const auth = String(req.headers?.authorization || '');
  if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return '';
}

function extractAccessToken(req: Request): string {
  const bearer = extractBearer(req);
  if (bearer) return bearer;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookies = (req as any).cookies || {};
  const cookieToken = String(cookies.access_token || '').trim();
  if (cookieToken) return cookieToken;

  const headerToken = String(req.headers['x-access-token'] || '').trim();
  if (headerToken) return headerToken;

  return '';
}

function safeBigIntFromDigits(v: unknown): bigint | null {
  const s = String(v ?? '').trim();
  if (!/^\d+$/.test(s) || s === '0') return null;
  try {
    const n = BigInt(s);
    return n > 0n ? n : null;
  } catch {
    return null;
  }
}

export async function ensureUser(
  req: Request,
  jwt: JwtService,
  prisma?: PrismaService,
): Promise<RequestUser> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = (req as any).user as RequestUser | undefined;
  if (existing) return existing;

  const token = extractAccessToken(req);
  if (!token) throw new UnauthorizedException('NO_ACCESS_TOKEN');

  const secret = String(process.env.JWT_ACCESS_SECRET || '').trim();
  if (!secret)
    throw new InternalServerErrorException('JWT_ACCESS_SECRET_MISSING');

  try {
    const payload = await jwt.verifyAsync<RequestUser>(token, { secret });

    if (!payload?.type) throw new UnauthorizedException('INVALID_ACCESS_TOKEN');

    // session tekshiruvi (revoked/expired)
    if (prisma && payload.sessionId) {
      const sid = safeBigIntFromDigits(payload.sessionId);
      if (!sid) throw new UnauthorizedException('INVALID_ACCESS_TOKEN');

      const session = await prisma.auth_sessions.findFirst({
        where: { id: sid, revoked_at: null, expires_at: { gt: new Date() } },
      });
      if (!session) throw new UnauthorizedException('SESSION_REVOKED');
    }

    (req as any).user = payload;
    return payload;
  } catch (e: any) {
    const name = String(e?.name || '');
    if (name === 'TokenExpiredError') {
      throw new UnauthorizedException('ACCESS_TOKEN_EXPIRED');
    }
    throw new UnauthorizedException('INVALID_ACCESS_TOKEN');
  }
}
