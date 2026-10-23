import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { uploadSchema } from '@people/contracts';
import type { AuthRequest } from '../auth/auth-request.type.js';
import { SessionGuard } from '../auth/session.guard.js';
import { parse } from '../validation.js';
import { RecordingsService } from './recordings.service.js';

@Controller('api/recordings')
@UseGuards(SessionGuard)
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Get()
  list(@Req() request: AuthRequest) {
    const offset = parse(
      z.coerce.number().int().min(0).max(1000000).default(0),
      request.query.offset,
    );
    return this.recordingsService.list(request.user.id, offset);
  }

  @Post('upload')
  upload(@Req() request: AuthRequest, @Body() body: unknown) {
    return this.recordingsService.initiate(request.user.id, parse(uploadSchema, body));
  }

  @Post(':id/complete')
  complete(@Req() request: AuthRequest, @Param('id') id: string) {
    return this.recordingsService.complete(request.user.id, id);
  }

  @Get(':id/playback')
  playback(@Req() request: AuthRequest, @Param('id') id: string) {
    return this.recordingsService.playback(request.user.id, id);
  }

  @Delete(':id')
  remove(@Req() request: AuthRequest, @Param('id') id: string) {
    return this.recordingsService.remove(request.user.id, id);
  }
}
