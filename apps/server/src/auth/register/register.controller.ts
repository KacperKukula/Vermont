import { Body, Controller, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { credentialsSchema } from '@people/contracts';
import { parse } from '../../validation.js';
import { AuthService } from '../auth.service.js';
import { RegisterService } from './register.service.js';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, SESSION_LIFETIME } from '../session.constants.js';

@Controller('api/auth')
export class RegisterController {
  constructor(
    private readonly registerService: RegisterService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const user = await this.registerService.register(parse(credentialsSchema, body));
    const token = await this.authService.createSession(user.id);
    response.cookie(SESSION_COOKIE_NAME, token, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: SESSION_LIFETIME,
    });
    return user;
  }
}
