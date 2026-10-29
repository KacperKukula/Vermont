import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional(),
  DATABASE_LOGIN: z.string().optional(),
  DATABASE_PASSWORD: z.string().optional(),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  R2_ENDPOINT: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  MAX_UPLOAD_BYTES: z.coerce.number().int().positive().max(5368709120).default(104857600),
});

export const config = schema.parse(process.env);
