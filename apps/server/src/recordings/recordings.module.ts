import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { RecordingsController } from './recordings.controller.js';
import { RecordingsService } from './recordings.service.js';

@Module({
  imports: [AuthModule, DatabaseModule, StorageModule],
  controllers: [RecordingsController],
  providers: [RecordingsService],
  exports: [RecordingsService],
})
export class RecordingsModule {}
