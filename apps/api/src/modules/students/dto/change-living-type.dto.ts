// apps/api/src/modules/students/dto/change-living-type.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChangeLivingTypeDto {
  @ApiProperty({
    example: 'DAY_ONLY',
    description: 'New living type code',
    enum: ['DAY_ONLY', 'WEEKDAYS_ONLY', 'FULL_BOARD'],
  })
  @IsEnum(['DAY_ONLY', 'WEEKDAYS_ONLY', 'FULL_BOARD'])
  livingTypeCode!: string;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Effective date (YYYY-MM-DD). Defaults to today.',
  })
  @IsOptional()
  @IsString()
  effectiveDate?: string;

  @ApiPropertyOptional({
    example: 'Changed due to schedule adjustment',
    description: 'Note about the change',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
