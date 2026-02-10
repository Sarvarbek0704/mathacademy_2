import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: '10-A' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 10, description: 'Faqat 10 yoki 11' })
  @Type(() => Number)
  @IsIn([10, 11], { message: 'grade must be 10 or 11' })
  grade!: number;

  @ApiProperty({ example: '1', description: 'academic_years.id' })
  @IsString()
  @Matches(/^\d+$/, { message: 'academicYearId must be numeric string' })
  academicYearId!: string;

  @ApiPropertyOptional({ example: '1', description: 'campuses.id' })
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'campusId must be numeric string' })
  campusId?: string;

  @ApiPropertyOptional({ example: '1', description: 'users.id (curator)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'curatorUserId must be numeric string' })
  curatorUserId?: string;

  @ApiPropertyOptional({ example: '1', description: 'student_tracks.id' })
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'trackId must be numeric string' })
  trackId?: string;
}
