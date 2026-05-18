import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { SubjectRole } from '@prisma/client';

export class AddTrackSubjectDto {
  @ApiProperty()
  @IsString()
  subjectId!: string;

  @ApiPropertyOptional({ enum: SubjectRole, default: 'MANDATORY' })
  @IsOptional()
  @IsEnum(SubjectRole)
  role?: SubjectRole;
}
