import { defineConfig } from 'prisma/config';
import { databaseSettings } from './src/database/database-settings.js';

// Use the same URL and optional separate credentials as the application.
const settings = databaseSettings(process.env);

export default defineConfig({
  schema: 'prisma',
  datasource: {
    url: settings?.connectionString,
  },
});
