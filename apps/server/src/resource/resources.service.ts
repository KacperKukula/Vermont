import { Injectable } from '@nestjs/common';
import { fileURLToPath } from 'node:url';

@Injectable()
export class ResourcesService {
  getExampleFilePath(): string {
    return fileURLToPath(new URL('../../assets/example.mp3', import.meta.url));
  }
}
