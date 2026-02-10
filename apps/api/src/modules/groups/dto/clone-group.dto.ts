import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CloneGroupDto {
  @ApiProperty({ example: '10-A (Copy)' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({
    example: '1',
    description: 'academic_years.id (default: source)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  academicYearId?: string;

  @ApiPropertyOptional({
    example: 10,
    enum: [10, 11],
    description: 'default: source',
  })
  @IsOptional()
  @Type(() => Number)
  @IsIn([10, 11])
  grade?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'subjects ham ko‘chsinmi',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  })
  copySubjects?: boolean;
}
