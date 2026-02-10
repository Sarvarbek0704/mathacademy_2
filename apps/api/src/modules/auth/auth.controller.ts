// src/modules/auth/auth.controller.ts - MUKAMMAL VERSIYA
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Delete,
  Req,
  Res,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { StaffLoginDto } from './dto/staff-login.dto';
import { GuardianLoginDto } from './dto/guardian-login.dto';
import { GuardianChangePasswordDto } from './dto/guardian-change-password.dto';
import { StaffChangePasswordDto } from './dto/staff-change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { AccessGuard } from '../../common/guards/access.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/perms.guard';
import { RequireRoles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/perms.decorator';
import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Post('staff/login')
  @ApiOperation({
    summary: 'Staff login',
    description: 'Authenticate staff users with username/password',
  })
  @ApiOkResponse({
    description: 'Successful login',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        staff: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            fullName: { type: 'string', example: 'Director (Superadmin)' },
            username: { type: 'string', example: 'admin' },
          },
        },
        roles: {
          type: 'array',
          items: { type: 'string' },
          example: ['SUPERADMIN'],
        },
        permissions: {
          type: 'array',
          items: { type: 'string' },
          example: ['students.read', 'students.write'],
        },
        tenantId: { type: 'string', example: '1' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or account locked',
    schema: {
      example: {
        statusCode: 401,
        message: 'INVALID_CREDENTIALS',
        error: 'Unauthorized',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: {
        statusCode: 400,
        message: ['tenantSlug must be a slug...'],
        error: 'Bad Request',
      },
    },
  })
  staffLogin(
    @Body() dto: StaffLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.staffLogin(dto, req, res);
  }

  @Post('guardian/login')
  @ApiOperation({
    summary: 'Guardian login',
    description: 'Authenticate guardian accounts with student ID and password',
  })
  @ApiOkResponse({
    description: 'Successful login',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        mustChangePassword: { type: 'boolean', example: true },
        studentId: { type: 'string', example: '123' },
        studentAccountId: { type: 'string', example: '456' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or account locked',
    schema: {
      example: {
        statusCode: 401,
        message: 'INVALID_CREDENTIALS',
        error: 'Unauthorized',
      },
    },
  })
  guardianLogin(
    @Body() dto: GuardianLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.guardianLogin(dto, req, res);
  }

  @HttpCode(200)
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token cookie',
  })
  @ApiOkResponse({
    description: 'New access token issued',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
    schema: {
      example: {
        statusCode: 401,
        message: 'NO_REFRESH_TOKEN',
        error: 'Unauthorized',
      },
    },
  })
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.auth.refresh(req, res);
  }

  @HttpCode(200)
  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidate current session and clear refresh token cookie',
  })
  @ApiOkResponse({
    description: 'Successfully logged out',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
      },
    },
  })
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.auth.logout(req, res);
  }

  // ==================== AUTHENTICATED ENDPOINTS ====================

  @ApiBearerAuth('access-token')
  @UseGuards(AccessGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Get detailed information about currently authenticated user',
  })
  @ApiOkResponse({
    description: 'Current user profile',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        user: {
          type: 'object',
          properties: {
            tenantId: { type: 'string', example: '1' },
            type: { type: 'string', example: 'STAFF' },
            userId: { type: 'string', example: '1' },
            roles: {
              type: 'array',
              items: { type: 'string' },
              example: ['SUPERADMIN'],
            },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              example: ['students.read'],
            },
            profile: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Not authenticated',
    schema: {
      example: {
        statusCode: 401,
        message: 'NO_ACCESS_TOKEN',
        error: 'Unauthorized',
      },
    },
  })
  me(@Req() req: Request) {
    return this.auth.me(req);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AccessGuard)
  @Post('staff/change-password')
  @ApiOperation({
    summary: 'Change staff password',
    description: 'Change password for currently authenticated staff user',
  })
  @ApiOkResponse({
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid password data',
    schema: {
      example: {
        statusCode: 400,
        message: 'NEW_PASSWORD_SAME_AS_OLD',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid old password or not staff user',
    schema: {
      example: {
        statusCode: 401,
        message: 'INVALID_OLD_PASSWORD',
        error: 'Unauthorized',
      },
    },
  })
  staffChangePassword(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: StaffChangePasswordDto,
  ) {
    return this.auth.staffChangePassword(req, res, dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AccessGuard)
  @Post('guardian/change-password')
  @ApiOperation({
    summary: 'Change guardian password',
    description: 'Change password for currently authenticated guardian user',
  })
  @ApiOkResponse({
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        mustChangePassword: { type: 'boolean', example: false },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid password data',
    schema: {
      example: {
        statusCode: 400,
        message: 'NEW_PASSWORD_SAME_AS_OLD',
        error: 'Bad Request',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid old password or not guardian user',
    schema: {
      example: {
        statusCode: 401,
        message: 'INVALID_OLD_PASSWORD',
        error: 'Unauthorized',
      },
    },
  })
  guardianChangePassword(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: GuardianChangePasswordDto,
  ) {
    return this.auth.guardianChangePassword(req, res, dto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AccessGuard)
  @Put('profile')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update profile information for current user',
  })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        user: { type: 'object' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid profile data',
    schema: {
      example: {
        statusCode: 400,
        message: 'USERNAME_ALREADY_EXISTS',
        error: 'Bad Request',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Cannot update other user profile',
    schema: {
      example: {
        statusCode: 403,
        message: 'CANNOT_UPDATE_OTHER_PROFILE',
        error: 'Forbidden',
      },
    },
  })
  updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = (req as any).user;
    if (user.type === 'STAFF') {
      return this.auth.updateStaffProfile(BigInt(user.userId), dto, user);
    } else {
      return this.auth.updateGuardianProfile(
        BigInt(user.studentAccountId),
        dto,
        user,
      );
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AccessGuard)
  @Get('sessions')
  @ApiOperation({
    summary: 'Get active sessions',
    description: 'Get list of active sessions for current user',
  })
  @ApiOkResponse({
    description: 'List of active sessions',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        sessions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '1' },
              deviceInfo: { type: 'string', example: 'Mozilla/5.0...' },
              ipAddress: { type: 'string', example: '192.168.1.1' },
              createdAt: {
                type: 'string',
                example: '2024-01-01T00:00:00.000Z',
              },
              expiresAt: {
                type: 'string',
                example: '2024-01-31T00:00:00.000Z',
              },
              revokedAt: {
                type: 'string',
                example: '2024-01-15T00:00:00.000Z',
              },
            },
          },
        },
      },
    },
  })
  getSessions(@Req() req: Request) {
    const user = (req as any).user;
    return this.auth.getActiveSessions(user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AccessGuard)
  @Delete('sessions/:sessionId')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Revoke specific session',
    description: 'Revoke a specific session by ID',
  })
  @ApiNoContentResponse({
    description: 'Session revoked successfully',
  })
  @ApiNotFoundResponse({
    description: 'Session not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'SESSION_NOT_FOUND',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Cannot revoke this session',
    schema: {
      example: {
        statusCode: 403,
        message: 'CANNOT_REVOKE_SESSION',
        error: 'Forbidden',
      },
    },
  })
  revokeSession(
    @Req() req: Request,
    @Param('sessionId', ParseBigIntPipe) sessionId: bigint,
  ) {
    const user = (req as any).user;
    return this.auth.revokeSession(sessionId, user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AccessGuard)
  @Delete('sessions')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Revoke all sessions',
    description: 'Revoke all active sessions for current user',
  })
  @ApiOkResponse({
    description: 'All sessions revoked',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        revoked: { type: 'number', example: 3 },
      },
    },
  })
  revokeAllSessions(@Req() req: Request) {
    const user = (req as any).user;
    return this.auth.revokeAllSessions(user);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @ApiBearerAuth('access-token')
  @UseGuards(AccessGuard, RolesGuard)
  @RequireRoles('SUPERADMIN', 'ADMIN')
  @Post('admin/reset-staff-password/:userId')
  @ApiOperation({
    summary: 'Reset staff password (Admin only)',
    description:
      'Reset password for staff user. Generates random password if not provided',
  })
  @ApiOkResponse({
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        newPassword: { type: 'string', example: 'RandomPass123!' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'USER_NOT_FOUND',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    schema: {
      example: {
        statusCode: 403,
        message: 'INSUFFICIENT_PERMISSIONS',
        error: 'Forbidden',
      },
    },
  })
  resetStaffPassword(
    @Req() req: Request,
    @Param('userId', ParseBigIntPipe) userId: bigint,
    @Body() dto: ResetPasswordDto,
  ) {
    const actor = (req as any).user;
    return this.auth.resetStaffPassword(userId, dto, actor);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AccessGuard, RolesGuard)
  @RequireRoles('SUPERADMIN', 'ADMIN')
  @Post('admin/reset-guardian-password/:studentAccountId')
  @ApiOperation({
    summary: 'Reset guardian password (Admin only)',
    description:
      'Reset password for guardian account. Generates random password if not provided',
  })
  @ApiOkResponse({
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        newPassword: { type: 'string', example: 'RandomPass123!' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Account not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'ACCOUNT_NOT_FOUND',
        error: 'Not Found',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions',
    schema: {
      example: {
        statusCode: 403,
        message: 'INSUFFICIENT_PERMISSIONS',
        error: 'Forbidden',
      },
    },
  })
  resetGuardianPassword(
    @Req() req: Request,
    @Param('studentAccountId', ParseBigIntPipe) studentAccountId: bigint,
    @Body() dto: ResetPasswordDto,
  ) {
    const actor = (req as any).user;
    return this.auth.resetGuardianPassword(studentAccountId, dto, actor);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AccessGuard, RolesGuard)
  @RequireRoles('SUPERADMIN', 'ADMIN')
  @Put('admin/update-guardian-profile/:studentAccountId')
  @ApiOperation({
    summary: 'Update guardian profile (Admin only)',
    description: 'Update profile information for guardian account',
  })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        account: { type: 'object' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Account not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'ACCOUNT_NOT_FOUND',
        error: 'Not Found',
      },
    },
  })
  updateGuardianProfileAdmin(
    @Req() req: Request,
    @Param('studentAccountId', ParseBigIntPipe) studentAccountId: bigint,
    @Body() dto: UpdateProfileDto,
  ) {
    const actor = (req as any).user;
    return this.auth.updateGuardianProfile(studentAccountId, dto, actor);
  }

  // ==================== TEST ENDPOINTS ====================

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @RequireRoles('SUPERADMIN')
  @Get('only-superadmin')
  @ApiOperation({
    summary: 'Superadmin test endpoint',
    description: 'Only accessible by SUPERADMIN role',
  })
  @ApiOkResponse({
    description: 'Access granted',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Superadmin access granted' },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Insufficient role',
    schema: {
      example: {
        statusCode: 403,
        message: 'FORBIDDEN_ROLE',
        error: 'Forbidden',
      },
    },
  })
  onlySuperadmin() {
    return { ok: true, message: 'Superadmin access granted' };
  }

  @ApiBearerAuth('access-token')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('students.read')
  @Get('perm-test')
  @ApiOperation({
    summary: 'Permission test endpoint',
    description: 'Only accessible with students.read permission',
  })
  @ApiOkResponse({
    description: 'Access granted',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Permission access granted' },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permission',
    schema: {
      example: {
        statusCode: 403,
        message: 'FORBIDDEN_PERMISSION',
        error: 'Forbidden',
      },
    },
  })
  permTest() {
    return { ok: true, message: 'Permission access granted' };
  }
}
