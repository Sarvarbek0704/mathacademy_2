import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, Matches } from 'class-validator';

export class SetGroupSubjectsDto {
  @ApiProperty({ example: ['1', '2', '3'], description: 'subjects.id[]' })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @Matches(/^\d+$/, {
    each: true,
    message: 'Each subjectId must be numeric string',
  })
  subjectIds!: string[];
}
