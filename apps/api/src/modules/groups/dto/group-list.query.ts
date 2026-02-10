import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class GroupListQuery {
  @ApiPropertyOptional({
    example: '10',
    description: 'Search: group name contains',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: '1', description: 'academic_years.id' })
  @IsOptional()
  @Matches(/^\d+$/)
  academicYearId?: string;

  @ApiPropertyOptional({ example: '1', description: 'campuses.id' })
  @IsOptional()
  @Matches(/^\d+$/)
  campusId?: string;

  @ApiPropertyOptional({ example: '1', description: 'student_tracks.id' })
  @IsOptional()
  @Matches(/^\d+$/)
  trackId?: string;

  @ApiPropertyOptional({ example: '1', description: 'users.id (curator)' })
  @IsOptional()
  @Matches(/^\d+$/)
  curatorUserId?: string;

  @ApiPropertyOptional({
    example: 10,
    description: '10 yoki 11',
    enum: [10, 11],
  })
  @IsOptional()
  @Type(() => Number)
  @IsIn([10, 11])
  grade?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'items ichida _count ham qaytsinmi',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  })
  includeCounts?: boolean;

  @ApiPropertyOptional({ example: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    example: 'created_at',
    enum: ['created_at', 'id', 'name', 'grade'],
  })
  @IsOptional()
  @IsIn(['created_at', 'id', 'name', 'grade'])
  sortBy?: 'created_at' | 'id' | 'name' | 'grade';

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}
