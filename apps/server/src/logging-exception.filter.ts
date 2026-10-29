import { Catch, HttpException, HttpStatus, Logger, type HttpServer, type ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Request } from 'express';

@Catch()
export class LoggingExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(LoggingExceptionFilter.name);

  constructor(applicationRef: HttpServer, private readonly consoleLoggingEnabled: boolean) {
    super(applicationRef);
  }

  override handleUnknownError(exception: unknown, host: ArgumentsHost): void {
    // Normalize unknown errors before delegating so Nest does not log them twice.
    const isHttpError = this.isHttpError(exception);
    const httpException = isHttpError
      ? new HttpException({ statusCode: exception.statusCode, message: exception.message }, exception.statusCode)
      : new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);

    if (!isHttpError) {
      const request = host.switchToHttp().getRequest<Request>();
      const message = exception instanceof Error ? exception.message : String(exception);
      this.logException(
        `${request.method} ${request.path} → ${httpException.getStatus()}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    super.catch(httpException, host);
  }

  private logException(message: string, stack?: string): void {
    if (this.consoleLoggingEnabled) {
      this.logger.error(message, stack);
    }

    // TODO: Add file logging here, independently of development console logging.
  }
}
