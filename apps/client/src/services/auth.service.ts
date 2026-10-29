import type { Credentials, User } from '@vermont/contracts';
import { api } from './http';

export const authService = {
  /**
   * Retrieves the currently authenticated user's information.
   * @returns The currently authenticated user, or null if not authenticated.
   */
  me: () => api<User>('/auth/me'),
  login: (input: Credentials) => api<User>('/auth/login', {
    method: 'POST', data: input,
  }),
  register: (input: Credentials) => api<User>('/auth/register', {
    method: 'POST', data: input,
  }),
  logout: () => api('/auth/logout', { method: 'POST' }),
};
