import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { RecordingsService } from '../recordings/recordings.service.js';

@Injectable()
export class McpService {
  constructor(private readonly recordings: RecordingsService) {}

  async handle(userId: string, req: Request, res: Response) {
    const server = new McpServer({ name: 'people-mp3', version: '0.1.0' });
    server.registerTool(
      'list_recordings',
      {
        description:
          'List your uploaded MP3 recordings. Returns up to 100 recordings; use offset for pagination.',
        inputSchema: { offset: z.number().int().min(0).max(1000000).default(0) },
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      },
      async ({ offset }) => ({
        content: [{
          type: 'text',
          text: JSON.stringify(await this.recordings.list(userId, offset)),
        }],
      }),
    );
    server.registerTool(
      'get_playback_url',
      {
        description:
          'Get a private recording playback URL, valid for one hour. Anyone with this URL can play the recording until it expires.',
        inputSchema: { recordingId: z.string().uuid() },
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      },
      async ({ recordingId }) => ({
        content: [{
          type: 'text',
          text: JSON.stringify(await this.recordings.playback(userId, recordingId)),
        }],
      }),
    );
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }
}
