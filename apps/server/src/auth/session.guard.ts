import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { AuthRequest } from './auth-request.type.js';
import { SESSION_COOKIE_NAME } from './session.constants.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    request.user = await this.authService.session(request.cookies?.[SESSION_COOKIE_NAME]);
    return true;
  }
}
