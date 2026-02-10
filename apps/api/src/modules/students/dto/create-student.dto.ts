// apps/api/src/modules/students/dto/create-student.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  Max,
  MaxLength,
  Matches,
  IsEmail,
  IsIn,
  ValidateIf,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'John Doe', description: 'Student full name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  fullName!: string;

  @ApiPropertyOptional({
    example: 'MALE',
    description: 'Student gender',
    enum: ['MALE', 'FEMALE'],
  })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE'])
  gender?: 'MALE' | 'FEMALE';

  @ApiPropertyOptional({
    example: '2005-06-15',
    description: 'Birth date in YYYY-MM-DD format',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({
    example: 10,
    description: 'Admission grade (8, 9, 10, 11)',
    enum: [8, 9, 10, 11],
  })
  @IsNumber()
  @IsEnum([8, 9, 10, 11])
  admissionGrade!: number;

  @ApiProperty({
    example: '2023-09-01',
    description: 'Admission date in YYYY-MM-DD format',
  })
  @IsDateString()
  admissionDate!: string;

  @ApiProperty({
    example: 2025,
    description: 'Expected graduation year',
  })
  @IsNumber()
  @Min(2000)
  @Max(2100)
  expectedGraduationYear!: number;

  @ApiPropertyOptional({
    example: '1',
    description: 'Campus ID (optional)',
  })
  @IsOptional()
  campusId?: string;

  @ApiPropertyOptional({
    example: '1',
    description: 'Initial group ID (optional)',
  })
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional({
    example: 'Physics',
    description: "Track/yo'nalish name (optional)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  trackName?: string;

  @ApiPropertyOptional({
    example: 'DAY_ONLY',
    description: 'Living type code',
    enum: ['DAY_ONLY', 'WEEKDAYS_ONLY', 'FULL_BOARD'],
  })
  @IsOptional()
  @IsEnum(['DAY_ONLY', 'WEEKDAYS_ONLY', 'FULL_BOARD'])
  livingTypeCode?: string;

  @ApiPropertyOptional({
    example: 'Some notes about student',
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    example: 'Bitiruvchi-2025',
    description: 'Cohort label (optional)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  cohortLabel?: string;

  // Guardian account details (optional for initial setup)
  @ApiPropertyOptional({
    example: 'Father',
    description: 'Guardian relation',
    enum: ['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'],
  })
  @IsOptional()
  @IsEnum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'])
  guardianRelation?: string;

  @ApiPropertyOptional({
    example: 'John Doe Sr.',
    description: 'Guardian full name for profile',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  guardianFullName?: string;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: 'Guardian phone number',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid phone number format',
  })
  guardianPhone?: string;

  @ApiPropertyOptional({
    example: 'father@example.com',
    description: 'Guardian email',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(128)
  guardianEmail?: string;

  @ApiPropertyOptional({
    example: '@johndoe',
    description: 'Guardian telegram username (starts with @)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^@[a-zA-Z0-9_]+$/, {
    message: 'Telegram username must start with @',
  })
  guardianTelegramUsername?: string;
}
