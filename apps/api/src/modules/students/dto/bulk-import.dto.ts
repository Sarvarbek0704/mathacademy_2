// apps/api/src/modules/students/dto/bulk-import.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { CreateStudentDto } from './create-student.dto';

export class BulkImportStudentsDto {
  @ApiProperty({
    type: [CreateStudentDto],
    description: 'Array of students to import (max 100 at once)',
    maxItems: 100,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  students!: CreateStudentDto[];
}
