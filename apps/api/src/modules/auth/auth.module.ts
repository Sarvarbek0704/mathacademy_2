// src/modules/auth/auth.module.ts - Soddalashtirilgan versiya
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    // Cache - soddalashtirilgan
    CacheModule.register({
      ttl: 300000, // 5 minutes in milliseconds
      max: 100,
    }),
    // JWT - asl versiyaga qaytamiz
    JwtModule.register({
      global: true,
      secret:
        process.env.JWT_ACCESS_SECRET || 'default-secret-change-in-production',
      signOptions: {
        expiresIn: '15m', // String emas, StringValue sifatida
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
