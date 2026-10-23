import { Injectable, OnModuleDestroy } from '@nestjs/common';
import pg from 'pg';
import { config } from '../config.js';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly pool = new pg.Pool({ connectionString: config.DATABASE_URL, max: 10 });

  async onModuleDestroy() {
    await this.pool.end();
  }
}
