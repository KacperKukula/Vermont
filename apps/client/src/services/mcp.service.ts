import { api } from './http';

export const mcpService = {
  createToken: () => api<{ token: string }>('/auth/mcp-token', { method: 'POST' }),
  revokeToken: () => api('/auth/mcp-token/revoke', { method: 'POST' }),
};
