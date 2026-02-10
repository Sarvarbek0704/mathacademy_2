import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error?: string;
  code?: string;
  path?: string;
  timestamp: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const mapped = this.map(exception);

    const statusCode = mapped.getStatus();
    const response = mapped.getResponse();
    const { message, error, code } = this.extractHttpResponse(response, mapped);

    const body: ErrorBody = {
      statusCode,
      message,
      error,
      code,
      path: req?.originalUrl || req?.url,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(body);
  }

  private extractHttpResponse(
    response: string | object,
    ex: HttpException,
  ): { message: string | string[]; error?: string; code?: string } {
    if (typeof response === 'string') {
      return { message: response, error: ex.name };
    }
    const r = response as any;
    return {
      message: r?.message ?? ex.message ?? 'ERROR',
      error: r?.error ?? ex.name,
      code: r?.code,
    };
  }

  private map(exception: unknown): HttpException {
    if (exception instanceof HttpException) return exception;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return new ConflictException({
            message: 'ALREADY_EXISTS',
            code: 'ALREADY_EXISTS',
          });
        case 'P2003':
          return new BadRequestException({
            message: 'INVALID_REFERENCE',
            code: 'INVALID_REFERENCE',
          });
        case 'P2025':
          return new NotFoundException({
            message: 'NOT_FOUND',
            code: 'NOT_FOUND',
          });
        case 'P2000':
          return new BadRequestException({
            message: 'INVALID_DATA',
            code: 'INVALID_DATA',
          });
        default:
          return new InternalServerErrorException({
            message: 'DB_ERROR',
            code: 'DB_ERROR',
          });
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return new BadRequestException({
        message: 'INVALID_DATA',
        code: 'INVALID_DATA',
      });
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return new ServiceUnavailableException({
        message: 'DB_UNAVAILABLE',
        code: 'DB_UNAVAILABLE',
      });
    }

    return new InternalServerErrorException({
      message: 'INTERNAL',
      code: 'INTERNAL',
    });
  }
}
