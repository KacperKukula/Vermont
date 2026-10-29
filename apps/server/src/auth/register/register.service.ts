import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { hashPassword } from '../../password.js';
import type { Credentials, User } from '@vermont/contracts';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class RegisterService {
  constructor(private readonly databaseService: DatabaseService) {}

  async register(input: Credentials): Promise<User> {
    const user = { id: randomUUID(), email: input.email };
    const password = await hashPassword(input.password);

    try {
      await this.databaseService.client.user.create({
        data: { ...user, passwordHash: password },
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('Ten adres e-mail jest już zajęty');
      }
      throw error;
    }

    return user;
  }
}
