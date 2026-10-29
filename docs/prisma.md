# Working with Prisma

Run all commands from the repository root. The four root `db:*` commands run through Turborepo and target only `@vermont/server`. Caching is disabled for these tasks; Studio is persistent.

## Everyday commands

| Task | Command |
| --- | --- |
| Regenerate the client | `npm run db:generate` |
| Validate the schema | `npm run db:validate` |
| Apply SQL migrations | `npm run db:migrate` |
| Browse database records | `npm run db:studio` |
| Check server types | `npm run check -- --filter=@vermont/server` |
| Run server tests | `npm run test -- --filter=@vermont/server` |
| Run database integration tests | `npm run test:prisma -w @vermont/server` |

Build, check, dev, and test commands generate the client automatically. Do not edit or commit `apps/server/src/generated/prisma/`. Generation and validation need no running database.

For migrations, Studio, and database integration tests, start PostgreSQL and configure `DATABASE_URL` in the root `.env`. Use `DATABASE_LOGIN` and `DATABASE_PASSWORD` for optional credential overrides. Apply migrations before integration tests; R2 credentials are unnecessary.

## Change the database schema

The current migration history belongs to the SQL runner invoked by `npm run db:migrate`. Prisma supplies models and the generated client. Both environments use the same committed SQL files.

### Development

1. Start PostgreSQL with `docker compose -f infra/compose.dev.yaml up -d` and configure the root `.env` for your development database.
2. Add the next numbered `.sql` file in `apps/server/migrations/`, for example `003_add_asset_description.sql`. Add new files for subsequent changes; do not edit migrations already applied to another environment.
3. Update the matching model file in `apps/server/prisma/models/` (one model per file). Keep shared generator and datasource settings in `apps/server/prisma/schema.prisma`. Keep database names mapped with `@map` / `@@map` and check constraints in SQL.
4. Validate, apply the migration, regenerate the client, and verify the server:

   ```powershell
   npm run db:validate
   npm run db:migrate
   npm run db:generate
   npm run check -- --filter=@vermont/server
   npm run test -- --filter=@vermont/server
   npm run test:prisma -w @vermont/server
   ```

5. Commit the SQL migration, Prisma schema, and related application changes together. Generated client files stay uncommitted.

### Production

1. Test the committed migrations in staging against the existing schema. For rolling deployments, keep changes compatible with the running application and remove obsolete columns in a later release.
2. Back up the production database. Prepare the release checkout on a deployment host or migration job with Node.js, npm, Deno, and PostgreSQL access. Run `npm ci` with development dependencies included: Turbo and the Prisma CLI are development tools.
3. Configure the root `.env` with production `DATABASE_URL` and optional `DATABASE_LOGIN` and `DATABASE_PASSWORD` overrides. The migration command loads this file; the variables can also be supplied through the deployment environment. Keep secrets outside version control.
4. From the repository root, apply the committed SQL migrations before starting the new server release:

   ```powershell
   npm run db:migrate
   ```

   The runner takes a PostgreSQL advisory lock, skips filenames recorded in `schema_migrations`, and applies each pending file in its own transaction. If a file fails, it is rolled back and the command exits with an error. Earlier successful files remain applied. Stop deployment on failure and investigate before retrying.

5. Build the release with `npm run build`, which regenerates the client, then deploy it. Verify `/api/health` and an authenticated database operation. Migrations do not run automatically at server startup.

Studio edits records directly and does not create migrations. Reverting application code does not reverse schema changes; use a new corrective migration or the tested database restore procedure when necessary.

Prisma `migrate dev` and `migrate deploy` require converting and baselining the existing migration history before use here. Use the SQL runner for the current workflow; `db push` bypasses that migration history.

## Write queries

- Inject `DatabaseService` into feature services and query through `databaseService.client`.
- Filter asset queries by the authenticated user's ID.
- Convert asset sizes from `bigint` to numbers and dates to ISO strings for API responses. Never expose password or token hashes.
- Use transactions for changes that must succeed together. Preserve the row lock in API token rotation when changing that flow.
