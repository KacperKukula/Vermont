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

  async apiToken(token: string): Promise<User> {
    const apiToken = await this.databaseService.client.apiToken.findUnique({
      where: { tokenHash: tokenHash(token) },
      select: { user: { select: { id: true, email: true } } },
    });
    if (!apiToken) {
      throw new UnauthorizedException();
    }
    return apiToken.user;
  }

  async issueToken(userId: string) {
    const token = newToken();
    await this.databaseService.client.$transaction(async (transaction) => {
      // Serialize rotations so concurrent requests leave only one token per user.
      await transaction.$queryRaw`SELECT id FROM users WHERE id = ${userId}::uuid FOR UPDATE`;
      await transaction.apiToken.deleteMany({ where: { userId } });
      await transaction.apiToken.create({ data: { tokenHash: tokenHash(token), userId } });
    });
    return { token };
  }

  async revokeToken(userId: string) {
    await this.databaseService.client.apiToken.deleteMany({ where: { userId } });
    return { ok: true };
  }
}
