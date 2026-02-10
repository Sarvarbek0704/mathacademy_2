// src/modules/auth/dto/update-profile.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  fullName?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Email address',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(128)
  email?: string;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'johndoe',
    description: 'Username (staff only)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, underscore and hyphen',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'father' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  profileRelation?: string;

  @ApiPropertyOptional({
    example: '@johndoe',
    description: 'Telegram username (guardian only)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^@[a-zA-Z0-9_]+$/, {
    message: 'Telegram username must start with @',
  })
  telegramUsername?: string;
}
