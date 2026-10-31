import { Controller, Get, StreamableFile } from '@nestjs/common';
import { ResourcesService } from './resources.service.js';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';

@Controller('/resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get('test.mp3')
  async streamExample(): Promise<StreamableFile> {
    const filePath = this.resourcesService.getExampleFilePath();
    const { size } = await stat(filePath);
    const stream = createReadStream(filePath);

    return new StreamableFile(stream, {
      type: 'audio/mpeg',
      length: size
    });
  }
}
