import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Recording, UploadInput } from '@vermont/contracts';
import type { Asset as AssetModel } from '../generated/prisma/client.js';
import { DatabaseService } from '../database/database.service.js';
import { StorageService } from '../storage/storage.service.js';
import { config } from '../config.js';
import { parse } from '../validation.js';
import { looksLikeMp3 } from '../mp3.js';

const serialize = (row: AssetModel): Recording => ({
  id: row.id,
  title: row.title,
  originalFilename: row.originalFilename,
  sizeBytes: Number(row.sizeBytes),
  createdAt: row.createdAt.toISOString(),
});

@Injectable()
export class RecordingsService {
  constructor(private readonly db: DatabaseService, private readonly storage: StorageService) {}

  async list(userId: string, offset = 0): Promise<Recording[]> {
    const recordings = await this.db.client.asset.findMany({
      where: { userId, status: 'ready' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 100,
      skip: offset,
    });
    return recordings.map(serialize);
  }

  private async owned(userId: string, id: string): Promise<AssetModel> {
    parse(z.string().uuid(), id);
    const recording = await this.db.client.asset.findFirst({ where: { id, userId } });
    if (!recording) throw new NotFoundException('Recording not found');
    return recording;
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
    await this.db.client.asset.create({
      data: {
        id,
        userId,
        title: input.title,
        originalFilename: input.filename,
        objectKey: key,
        sizeBytes: BigInt(input.sizeBytes),
      },
    });
    return { id, uploadUrl };
  }

  async complete(userId: string, id: string) {
    const row = await this.owned(userId, id);
    if (row.status === 'ready') return serialize(row);
    let metadata;
    try {
      metadata = await this.storage.head(row.objectKey);
    } catch (error) {
      if (
        (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404
      ) throw new BadRequestException('Plik nie został jeszcze przesłany');
      throw error;
    }
    if (
      metadata.ContentLength !== Number(row.sizeBytes) || metadata.ContentType !== 'audio/mpeg' ||
      !looksLikeMp3(await this.storage.prefix(row.objectKey))
    ) {
      await this.storage.remove(row.objectKey);
      await this.db.client.asset.deleteMany({ where: { id, userId } });
      throw new BadRequestException('Nieprawidłowy plik MP3 lub rozmiar');
    }
    await this.db.client.asset.updateMany({
      where: { id, userId },
      data: { status: 'ready' },
    });
    return serialize(row);
  }

  async playback(userId: string, id: string) {
    const row = await this.owned(userId, id);
    if (row.status !== 'ready') throw new NotFoundException('Nagranie nie jest gotowe');
    return { url: await this.storage.playback(row.objectKey), expiresIn: 3600 };
  }

  async remove(userId: string, id: string) {
    const row = await this.owned(userId, id);
    await this.storage.remove(row.objectKey);
    await this.db.client.asset.deleteMany({ where: { id, userId } });
    return { ok: true };
  }
}
