import type { Credentials, User } from '@people/contracts';
import { api } from './http';

export const authService = {
  me: () => api<User>('/auth/me'),
  login: (input: Credentials) => api<User>('/auth/login', {
    method: 'POST', body: JSON.stringify(input),
  }),
  register: (input: Credentials) => api<User>('/auth/register', {
    method: 'POST', body: JSON.stringify(input),
  }),
  logout: () => api('/auth/logout', { method: 'POST' }),
};
