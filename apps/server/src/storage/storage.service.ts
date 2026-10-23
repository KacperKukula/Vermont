import { Injectable } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config.js';

@Injectable()
export class StorageService {
  private readonly client = new S3Client({
    region: 'auto',
    endpoint: config.R2_ENDPOINT,
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });

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
