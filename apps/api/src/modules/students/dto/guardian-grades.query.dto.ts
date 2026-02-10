import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class GuardianGradesQueryDto {
  @ApiPropertyOptional({ example: 'MONTHLY' })
  @IsOptional()
  @IsIn(['WEEKLY', 'MONTHLY', 'TERM'])
  period?: string;

  @ApiPropertyOptional({ example: '2026-02' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Month must be in YYYY-MM format' })
  month?: string;

  @ApiPropertyOptional({ example: '2026-02-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-02-28' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class GuardianAttendanceQueryDto {
  @ApiPropertyOptional({ example: '2026-02-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-02-28' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ example: 'CLASS' })
  @IsOptional()
  @IsIn(['CLASS', 'STUDY_HALL', 'EVENT'])
  type?: string;
}

export class GuardianInvoicesQueryDto {
  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsIn(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(200)
  limit?: number = 20;
}
