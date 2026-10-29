import { Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyPassword } from '../../password.js';
import type { Credentials, User } from '@vermont/contracts';
import { DatabaseService } from '../../database/database.service.js';

@Injectable()
export class LoginService {
  constructor(private readonly databaseService: DatabaseService) {}

  async login(input: Credentials): Promise<User> {
    const user = await this.databaseService.client.user.findUnique({
      where: { email: input.email },
      select: { id: true, email: true, passwordHash: true },
    });
    // Unknown accounts still follow the expensive password verification path.
    const dummy = `${'0'.repeat(32)}:${'0'.repeat(128)}`;
    const valid = await verifyPassword(input.password, user?.passwordHash ?? dummy);

    if (!user || !valid) {
      throw new UnauthorizedException('Nieprawidłowy e-mail lub hasło');
    }

    return { id: user.id, email: user.email };
  }
}
