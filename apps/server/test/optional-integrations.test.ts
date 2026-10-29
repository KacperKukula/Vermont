import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { ServiceUnavailableException } from '@nestjs/common';
import { config } from '../src/config.ts';
import { StorageService } from '../src/storage/storage.service.ts';
import { DatabaseService } from '../src/database/database.service.ts';

const isUnavailable = (error: unknown) => error instanceof ServiceUnavailableException && error.getStatus() === 503;

Deno.test('missing or invalid storage configuration only disables storage operations', async () => {
  const original = { ...config };
  try {
    for (const endpoint of [undefined, '', 'invalid-url', 'https://example.com']) {
      Object.assign(config, { R2_ENDPOINT: endpoint, R2_BUCKET: '', R2_ACCESS_KEY_ID: '', R2_SECRET_ACCESS_KEY: '' });
      const storage = new StorageService();
      assert.throws(() => storage.upload('test.mp3'), isUnavailable);
      assert.throws(() => storage.playback('test.mp3'), isUnavailable);
      assert.throws(() => storage.head('test.mp3'), isUnavailable);
      assert.throws(() => storage.remove('test.mp3'), isUnavailable);
      await assert.rejects(() => storage.prefix('test.mp3'), isUnavailable);
    }
  } finally {
    Object.assign(config, original);
  }
});

Deno.test('missing or invalid database configuration does not prevent construction or shutdown', async () => {
  const original = config.DATABASE_URL;
  try {
    for (const url of [undefined, '', 'invalid-url', 'https://example.com']) {
      config.DATABASE_URL = url;
      const database = new DatabaseService();
      assert.throws(() => database.pool, isUnavailable);
      assert.throws(() => database.client, isUnavailable);
      await database.onModuleDestroy();
    }
  } finally {
    config.DATABASE_URL = original;
  }
});
