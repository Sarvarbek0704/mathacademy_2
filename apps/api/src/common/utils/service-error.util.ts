import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function rethrowServiceError(e: unknown): never {
  if (e instanceof HttpException) throw e;

  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2025') throw new NotFoundException('NOT_FOUND');

    if (e.code === 'P2002') throw new ConflictException('ALREADY_EXISTS');

    if (e.code === 'P2003')
      throw new BadRequestException('FOREIGN_KEY_CONSTRAINT');

    throw new InternalServerErrorException('DB_ERROR');
  }

  if (e instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException('INVALID_DB_QUERY');
  }

  throw new InternalServerErrorException('INTERNAL');
}
