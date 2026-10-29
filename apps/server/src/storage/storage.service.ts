import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config.js';
import { z } from 'zod';

const storageConfigSchema = z.object({
  R2_ENDPOINT: z.string().url(),
  R2_BUCKET: z.string().trim().min(1),
  R2_ACCESS_KEY_ID: z.string().trim().min(1),
  R2_SECRET_ACCESS_KEY: z.string().trim().min(1),
});

@Injectable()
export class StorageService {
  private readonly settings = storageConfigSchema.safeParse(config);
  private storageClient?: S3Client;

  constructor() {
    if (!this.settings.success) {
      new Logger(StorageService.name).warn('Magazyn plików jest niedostępny: konfiguracja R2 jest niepełna lub nieprawidłowa. Pozostałe moduły mogą działać.');
    }
  }

  private get client(): S3Client {
    if (!this.settings.success) {
      throw new ServiceUnavailableException('Magazyn plików jest niedostępny. Skontaktuj się z administratorem.');
    }
    const settings = this.settings.data;
    return this.storageClient ??= new S3Client({
      region: 'auto',
      endpoint: settings.R2_ENDPOINT,
      credentials: {
        accessKeyId: settings.R2_ACCESS_KEY_ID,
        secretAccessKey: settings.R2_SECRET_ACCESS_KEY,
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  upload(key: string) {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: config.R2_BUCKET,
        Key: key,
        ContentType: 'audio/mpeg',
        IfNoneMatch: '*',
      }),
      { expiresIn: 600, signableHeaders: new Set(['content-type', 'if-none-match']) },
    );
  }
  playback(key: string) {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: config.R2_BUCKET,
        Key: key,
        ResponseContentType: 'audio/mpeg',
      }),
      { expiresIn: 3600 },
    );
  }
  head(key: string) {
    return this.client.send(new HeadObjectCommand({ Bucket: config.R2_BUCKET, Key: key }));
  }
  async prefix(key: string): Promise<Uint8Array> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: config.R2_BUCKET, Key: key, Range: 'bytes=0-4095' }),
    );
    return response.Body ? await response.Body.transformToByteArray() : new Uint8Array();
  }
  remove(key: string) {
    return this.client.send(new DeleteObjectCommand({ Bucket: config.R2_BUCKET, Key: key }));
  }
}
