import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { RecordingsModule } from '../recordings/recordings.module.js';
import { McpController } from './mcp.controller.js';
import { McpService } from './mcp.service.js';

@Module({
  imports: [AuthModule, RecordingsModule],
  controllers: [McpController],
  providers: [McpService],
})
export class McpModule {}
