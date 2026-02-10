import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ensureUser } from '../auth/jwt-request.util';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = await ensureUser(req, this.jwt, this.prisma);

    const roles = Array.isArray(user?.roles) ? user.roles : [];
    if (roles.includes('SUPERADMIN')) return true;

    const ok = required.some((r) => roles.includes(r));
    if (!ok) throw new ForbiddenException('FORBIDDEN_ROLE');
    return true;
  }
}
