import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { User } from '@vermont/contracts';
import { DatabaseService } from '../database/database.service.js';
import { newToken, tokenHash } from '../password.js';
import { SESSION_LIFETIME } from './session.constants.js';

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async session(token: string | undefined): Promise<User> {
    if (!token) {
      throw new UnauthorizedException();
    }
    const session = await this.databaseService.client.session.findFirst({
      where: { tokenHash: tokenHash(token), expiresAt: { gt: new Date() } },
      select: { user: { select: { id: true, email: true } } },
    });
    if (!session) {
      throw new UnauthorizedException();
    }
    return session.user;
  }

  async createSession(userId: string): Promise<string> {
    const token = newToken();
    await this.databaseService.client.session.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
    await this.databaseService.client.session.create({
      data: {
        tokenHash: tokenHash(token),
        userId,
        expiresAt: new Date(Date.now() + SESSION_LIFETIME),
      },
    });
    return token;
  }

  async logout(token: string | undefined): Promise<void> {
    if (token) {
      await this.databaseService.client.session.deleteMany({
        where: { tokenHash: tokenHash(token) },
      });
    }
  }

}
