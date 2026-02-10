// src/modules/auth/dto/reset-password.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiPropertyOptional({
    example: 'NewPass12345',
    description:
      'Optional new password. If not provided, random password will be generated',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  newPassword?: string;
}
