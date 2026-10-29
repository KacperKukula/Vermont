import { Injectable, Logger, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { databaseSettings } from './database-settings.js';
import { config } from '../config.js';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly settings = databaseSettings(config);
  private databasePool?: pg.Pool;
  private prismaClient?: PrismaClient;

  constructor() {
    if (!this.settings) {
      new Logger(DatabaseService.name).warn('Baza danych jest niedostępna: konfiguracja DATABASE_URL jest niepełna lub nieprawidłowa.');
    }
  }

  get pool(): pg.Pool {
    if (!this.settings) {
      throw new ServiceUnavailableException('Baza danych jest niedostępna. Skontaktuj się z administratorem.');
    }
    return this.databasePool ??= new pg.Pool({ ...this.settings, max: 10 });
  }

  get client(): PrismaClient {
    return this.prismaClient ??= new PrismaClient({ adapter: new PrismaPg(this.pool) });
  }

  async onModuleDestroy() {
    try {
      await this.prismaClient?.$disconnect();
    } finally {
      await this.databasePool?.end();
    }
  }
}
