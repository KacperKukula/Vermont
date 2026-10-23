import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service.js';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  getInfo() {
    return { name: 'Fala MP3 API', version: '0.1.0' };
  }

  async getHealth() {
    await this.databaseService.pool.query('SELECT 1');
    return { status: 'ok' };
  }
}
