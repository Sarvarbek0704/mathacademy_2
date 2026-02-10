import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PERMS_KEY } from '../decorators/perms.decorator';
import { ensureUser } from '../auth/jwt-request.util';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = await ensureUser(req, this.jwt, this.prisma);

    const roles = Array.isArray(user?.roles) ? user.roles : [];
    if (roles.includes('SUPERADMIN')) return true;

    const perms = Array.isArray(user?.permissions) ? user.permissions : [];
    const ok = required.every((p) => perms.includes(p));
    if (!ok) throw new ForbiddenException('FORBIDDEN_PERMISSION');
    return true;
  }
}
