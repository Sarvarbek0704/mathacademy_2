// src/modules/auth/dto/staff-change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class StaffChangePasswordDto {
  @ApiProperty({ example: 'oldpass123', description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  oldPassword!: string;

  @ApiProperty({ example: 'NewPass12345', description: 'New password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  newPassword!: string;
}
