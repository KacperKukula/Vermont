import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { hashPassword } from '../../password.js';
import type { Credentials, User } from '@people/contracts';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class RegisterService {
  constructor(private readonly databaseService: DatabaseService) {}

  async register(input: Credentials): Promise<User> {
    const user = { id: randomUUID(), email: input.email };
    const password = await hashPassword(input.password);

    try {
      await this.databaseService.pool.query(
        'INSERT INTO users(id, email, password_hash) VALUES ($1, $2, $3)',
        [user.id, user.email, password],
      );
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('Ten adres e-mail jest już zajęty');
      }
      throw error;
    }

    return user;
  }
}
