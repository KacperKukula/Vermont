import { All, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service.js';
import { McpService } from './mcp.service.js';

@Controller('mcp')
export class McpController {
  constructor(
    private readonly authService: AuthService,
    private readonly mcpService: McpService,
  ) {}

  @Post()
  async handle(@Req() request: Request, @Res() response: Response) {
    const token = request.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) {
      response.status(401).json({ error: 'Bearer token required' });
      return;
    }

    const user = await this.authService.apiToken(token);
    await this.mcpService.handle(user.id, request, response);
  }

  @All()
  unsupported(@Res() response: Response) {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Use POST for stateless MCP' });
  }
}
