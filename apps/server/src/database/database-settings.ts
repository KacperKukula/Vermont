import type { ClientConfig } from 'pg';
import { z } from 'zod';

interface DatabaseEnvironment {
  DATABASE_URL?: string;
  DATABASE_LOGIN?: string;
  DATABASE_PASSWORD?: string;
}

// Use one parser for the application and migrations. URL credentials stay supported.
export function databaseSettings(env: DatabaseEnvironment): ClientConfig | undefined {
  const parsed = z.string().url().regex(/^postgres(?:ql)?:\/\//).safeParse(env.DATABASE_URL);
  if (!parsed.success) return undefined;
  const url = new URL(parsed.data);
  if (!url.hostname || url.pathname.length < 2) return undefined;
  if (env.DATABASE_LOGIN || env.DATABASE_PASSWORD) {
    if (!env.DATABASE_LOGIN || env.DATABASE_PASSWORD === undefined) return undefined;
    // Encode credentials here so special characters in the password remain literal.
    url.username = encodeURIComponent(env.DATABASE_LOGIN);
    url.password = encodeURIComponent(env.DATABASE_PASSWORD);
    // pg also accepts credentials in query parameters; the explicit fields take precedence.
    url.searchParams.delete('user');
    url.searchParams.delete('password');
  }
  return { connectionString: url.toString(), connectionTimeoutMillis: 5000 };
}
