import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/perms.decorator';
import { PermissionsGuard } from '../../common/guards/perms.guard';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupListQuery } from './dto/group-list.query';
import { SetGroupSubjectsDto } from './dto/set-group-subjects.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CloneGroupDto } from './dto/clone-group.dto';
import { GroupsService } from './groups.service';
import type { Request } from 'express';

type RequestWithUser = Request & {
  user?: {
    tenantId?: string | number | bigint;
    userId?: string | number | bigint;
  };
};

@ApiTags('Staff - Groups')
@ApiBearerAuth('access-token')
@UseGuards(PermissionsGuard)
@Controller('staff/groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  private tenantId(req: RequestWithUser): string {
    const t = req.user?.tenantId;
    const s = String(t ?? '').trim();
    if (!s) throw new UnauthorizedException('TENANT_REQUIRED');
    return s;
  }

  private actorUserId(req: RequestWithUser): string | undefined {
    const u = req.user?.userId;
    const s = String(u ?? '').trim();
    return s ? s : undefined;
  }

  @RequirePermissions('groups.read')
  @Get()
  @ApiOperation({ summary: 'Groups list (filter + pagination)' })
  @ApiOkResponse({
    schema: {
      example: {
        total: 2,
        limit: 50,
        offset: 0,
        items: [
          {
            id: '1',
            name: '10-A',
            grade: 10,
            academic_year_id: '1',
            campus_id: null,
            track_id: null,
            curator_user_id: null,
            created_at: '2026-02-10T10:00:00.000Z',
            _count: { students: 25, group_subjects: 6 },
          },
        ],
      },
    },
  })
  list(@Req() req: RequestWithUser, @Query() q: GroupListQuery) {
    return this.groups.list(this.tenantId(req), q);
  }

  @RequirePermissions('groups.read')
  @Get('stats')
  @ApiOperation({
    summary: 'Dashboard uchun umumiy stats (diagrammalar uchun)',
  })
  stats(
    @Req() req: RequestWithUser,
    @Query('academicYearId') academicYearId?: string,
    @Query('campusId') campusId?: string,
  ) {
    return this.groups.stats(this.tenantId(req), { academicYearId, campusId });
  }

  @RequirePermissions('groups.read')
  @Get(':id')
  @ApiOperation({ summary: 'Group detail (subjects + basic relations)' })
  detail(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.groups.detail(this.tenantId(req), id);
  }

  @RequirePermissions('groups.read')
  @Get(':id/overview')
  @ApiOperation({
    summary: 'Group overview (students status + attendance summary)',
  })
  overview(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.groups.overview(this.tenantId(req), id);
  }

  @RequirePermissions('groups.write')
  @Post()
  @ApiOperation({ summary: 'Create group' })
  create(@Req() req: RequestWithUser, @Body() dto: CreateGroupDto) {
    return this.groups.create(this.tenantId(req), this.actorUserId(req), dto);
  }

  @RequirePermissions('groups.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update group' })
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groups.update(
      this.tenantId(req),
      this.actorUserId(req),
      id,
      dto,
    );
  }

  @RequirePermissions('groups.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete group (dependency bo‘lsa o‘chirmaydi)' })
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.groups.remove(this.tenantId(req), this.actorUserId(req), id);
  }

  @RequirePermissions('groups.write')
  @Post(':id/subjects')
  @ApiOperation({ summary: 'Replace group subjects (set exactly)' })
  setSubjects(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: SetGroupSubjectsDto,
  ) {
    return this.groups.setSubjects(
      this.tenantId(req),
      this.actorUserId(req),
      id,
      dto,
    );
  }

  @RequirePermissions('groups.write')
  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone group (optional: copy subjects)' })
  clone(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: CloneGroupDto,
  ) {
    return this.groups.clone(
      this.tenantId(req),
      this.actorUserId(req),
      id,
      dto,
    );
  }
}
