import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { BadRequestException, InternalServerErrorException, Logger, type ArgumentsHost } from '@nestjs/common';
import { LoggingExceptionFilter } from '../src/logging-exception.filter.ts';

Deno.test('logging filter logs only unrecognized exceptions and preserves HTTP responses', () => {
  const logs: unknown[][] = [];
  const replies: { body: unknown; status: number }[] = [];
  Logger.overrideLogger({ log() {}, warn() {}, error(...args: unknown[]) { logs.push(args); } });
  const response = {};
  const adapter = {
    isHeadersSent: () => false,
    reply: (_response: unknown, body: unknown, status: number) => replies.push({ body, status }),
  };
  const filter = new LoggingExceptionFilter(adapter as never, true);
  const host = {
    switchToHttp: () => ({ getRequest: () => ({ method: 'POST', path: '/api/auth/login' }) }),
    getArgByIndex: () => response,
  } as unknown as ArgumentsHost;

  try {
    const error = new Error('Database connection failed');
    filter.catch(error, host);
    assert.equal(logs.length, 1);
    assert.match(String(logs[0][0]), /POST \/api\/auth\/login.*500.*Database connection failed/);
    assert.equal(logs[0][1], error.stack);
    assert.deepEqual(replies[0], { body: { statusCode: 500, message: 'Internal server error' }, status: 500 });

    const httpError = new InternalServerErrorException('Operation failed');
    filter.catch(httpError, host);
    assert.equal(logs.length, 1);
    assert.deepEqual(replies[1], { body: httpError.getResponse(), status: 500 });

    const badRequest = new BadRequestException('Invalid input');
    filter.catch(badRequest, host);
    assert.equal(logs.length, 1);
    assert.deepEqual(replies[2], { body: badRequest.getResponse(), status: 400 });

    filter.catch({ statusCode: 503, message: 'Service unavailable' }, host);
    assert.equal(logs.length, 1);
    assert.deepEqual(replies[3], { body: { statusCode: 503, message: 'Service unavailable' }, status: 503 });
    const quietFilter = new LoggingExceptionFilter(adapter as never, false);
    quietFilter.catch(error, host);
    assert.equal(logs.length, 1);
    assert.deepEqual(replies[4], replies[0]);
  } finally {
    Logger.overrideLogger(new Logger());
  }
});
