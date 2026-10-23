import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Recording, UploadInput } from '@people/contracts';
import { DatabaseService } from '../database/database.service.js';
import { StorageService } from '../storage/storage.service.js';
import { config } from '../config.js';
import { parse } from '../validation.js';
import { looksLikeMp3 } from '../mp3.js';

interface Row {
  id: string;
  title: string;
  original_filename: string;
  size_bytes: string;
  created_at: Date;
  object_key: string;
  status: string;
}
const serialize = (row: Row): Recording => ({
  id: row.id,
  title: row.title,
  originalFilename: row.original_filename,
  sizeBytes: Number(row.size_bytes),
  createdAt: row.created_at.toISOString(),
});

@Injectable()
export class RecordingsService {
  constructor(private readonly db: DatabaseService, private readonly storage: StorageService) {}

  async list(userId: string, offset = 0): Promise<Recording[]> {
    const result = await this.db.pool.query<Row>(
      'SELECT * FROM recordings WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC, id DESC LIMIT 100 OFFSET $3',
      [userId, 'ready', offset],
    );
    return result.rows.map(serialize);
  }

  private async owned(userId: string, id: string): Promise<Row> {
    parse(z.string().uuid(), id);
    const result = await this.db.pool.query<Row>(
      'SELECT * FROM recordings WHERE id = $1 AND user_id = $2',
      [id, userId],
    );
    if (!result.rows[0]) throw new NotFoundException('Nie znaleziono nagrania');
    return result.rows[0];
  }

  async initiate(userId: string, input: UploadInput) {
    if (input.sizeBytes > config.MAX_UPLOAD_BYTES) {
      throw new BadRequestException(
        `Maksymalny rozmiar: ${Math.floor(config.MAX_UPLOAD_BYTES / 1024 / 1024)} MB`,
      );
    }
    const id = randomUUID();
    const key = `${userId}/${id}.mp3`;
    const uploadUrl = await this.storage.upload(key);
    await this.db.pool.query(
      'INSERT INTO recordings(id, user_id, title, original_filename, object_key, size_bytes) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, userId, input.title, input.filename, key, input.sizeBytes],
    );
    return { id, uploadUrl };
  }

  async complete(userId: string, id: string) {
    const row = await this.owned(userId, id);
    if (row.status === 'ready') return serialize(row);
    let metadata;
    try {
      metadata = await this.storage.head(row.object_key);
    } catch (error) {
      if (
        (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404
      ) throw new BadRequestException('Plik nie został jeszcze przesłany');
      throw error;
    }
    if (
      metadata.ContentLength !== Number(row.size_bytes) || metadata.ContentType !== 'audio/mpeg' ||
      !looksLikeMp3(await this.storage.prefix(row.object_key))
    ) {
      await this.storage.remove(row.object_key);
      await this.db.pool.query('DELETE FROM recordings WHERE id = $1 AND user_id = $2', [
        id,
        userId,
      ]);
      throw new BadRequestException('Nieprawidłowy plik MP3 lub rozmiar');
    }
    await this.db.pool.query('UPDATE recordings SET status = $1 WHERE id = $2 AND user_id = $3', [
      'ready',
      id,
      userId,
    ]);
    return serialize(row);
  }

  async playback(userId: string, id: string) {
    const row = await this.owned(userId, id);
    if (row.status !== 'ready') throw new NotFoundException('Nagranie nie jest gotowe');
    return { url: await this.storage.playback(row.object_key), expiresIn: 3600 };
  }

  async remove(userId: string, id: string) {
    const row = await this.owned(userId, id);
    await this.storage.remove(row.object_key);
    await this.db.pool.query('DELETE FROM recordings WHERE id = $1 AND user_id = $2', [id, userId]);
    return { ok: true };
  }
}
