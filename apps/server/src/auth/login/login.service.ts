import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyPassword } from '../../password.js';
import type { Credentials, User } from '@people/contracts';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class LoginService {
  constructor(private readonly databaseService: DatabaseService) {}

  async login(input: Credentials): Promise<User> {
    const result = await this.databaseService.pool.query<User & { password_hash: string }>(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [input.email],
    );
    const user = result.rows[0];
    // Unknown accounts still follow the expensive password verification path.
    const dummy = `${'0'.repeat(32)}:${'0'.repeat(128)}`;
    const valid = await verifyPassword(input.password, user?.password_hash ?? dummy);

    if (!user || !valid) {
      throw new UnauthorizedException('Nieprawidłowy e-mail lub hasło');
    }

    return { id: user.id, email: user.email };
  }
}
