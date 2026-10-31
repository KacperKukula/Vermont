import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import type { AuthRequest } from './auth-request.type.js';
import { SessionGuard } from './session.guard.js';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from './session.constants.js';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(SessionGuard)
  me(@Req() request: AuthRequest) {
    return request.user;
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(request.cookies?.[SESSION_COOKIE_NAME]);
    response.clearCookie(SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS);
    return { ok: true };
  }

}
