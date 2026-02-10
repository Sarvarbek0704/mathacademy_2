// src/main.ts - to'g'rilangan
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

declare global {
  var __bigint_json_patch_applied__: boolean | undefined;
}

function patchBigIntJson() {
  if (global.__bigint_json_patch_applied__) return;
  global.__bigint_json_patch_applied__ = true;
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}

function parseOrigins(v?: string): string[] {
  return String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  patchBigIntJson();

  const app = await NestFactory.create(AppModule, {});
  const globalPrefix = 'api';
  const port = Number(process.env.PORT) || 4000;

  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser());

  // OSON YECHIM: process.env dan bevosita olamiz
  const frontendPort = Number(process.env.WEB_PORT) || 3000;
  const allowList = [
    `http://localhost:${frontendPort}`,
    `http://127.0.0.1:${frontendPort}`,
    `http://localhost:${port}`, // Swagger uchun
    `http://127.0.0.1:${port}`,
    ...parseOrigins(process.env.WEB_ORIGINS),
  ];

  app.enableCors({
    origin: allowList,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      validationError: { target: false, value: false },
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mathacademy Digital Campus API')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);
}

bootstrap();
