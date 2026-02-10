// apps/api/src/modules/students/dto/assign-cohort.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class AssignCohortDto {
  @ApiProperty({
    example: 'Bitiruvchi-2025',
    description: 'Cohort label (must exist)',
  })
  @IsString()
  @MaxLength(128)
  cohortLabel!: string;

  @ApiPropertyOptional({
    example: 'Assigned to graduation cohort',
    description: 'Note about cohort assignment',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
