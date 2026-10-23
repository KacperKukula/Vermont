import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { User } from '@people/contracts';
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

    const result = await this.databaseService.pool.query<User>(
      'SELECT u.id, u.email FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.token_hash = $1 AND s.expires_at > now()',
      [tokenHash(token)],
    );
    if (!result.rows[0]) {
      throw new UnauthorizedException();
    }

    return result.rows[0];
  }

  async createSession(userId: string): Promise<string> {
    const token = newToken();
    await this.databaseService.pool.query('DELETE FROM sessions WHERE expires_at <= now()');
    await this.databaseService.pool.query(
      'INSERT INTO sessions(token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
      [tokenHash(token), userId, new Date(Date.now() + SESSION_LIFETIME)],
    );
    return token;
  }

  async logout(token: string | undefined): Promise<void> {
    if (token) {
      await this.databaseService.pool.query('DELETE FROM sessions WHERE token_hash = $1', [
        tokenHash(token),
      ]);
    }
  }

  async apiToken(token: string): Promise<User> {
    const result = await this.databaseService.pool.query<User>(
      'SELECT u.id, u.email FROM users u JOIN api_tokens t ON t.user_id = u.id WHERE t.token_hash = $1',
      [tokenHash(token)],
    );
    if (!result.rows[0]) {
      throw new UnauthorizedException();
    }
    return result.rows[0];
  }

  async issueToken(userId: string) {
    const token = newToken();
    const client = await this.databaseService.pool.connect();

    try {
      await client.query('BEGIN');
      await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [userId]);
      await client.query('DELETE FROM api_tokens WHERE user_id = $1', [userId]);
      await client.query('INSERT INTO api_tokens(token_hash, user_id) VALUES ($1, $2)', [
        tokenHash(token),
        userId,
      ]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return { token };
  }

  async revokeToken(userId: string) {
    await this.databaseService.pool.query('DELETE FROM api_tokens WHERE user_id = $1', [userId]);
    return { ok: true };
  }
}
