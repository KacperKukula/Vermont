import { config } from '../config.js';

export const SESSION_COOKIE_NAME = 'people_session';
export const SESSION_LIFETIME = 7 * 24 * 60 * 60 * 1000;
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.COOKIE_SECURE,
  sameSite: 'lax' as const,
  path: '/',
};
