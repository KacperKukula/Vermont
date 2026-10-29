# AGENTS.md

## Scope and language

- These instructions apply to the entire Vermont repository. More specific instructions may be defined in nested AGENTS.md files.
- Write all new files and all added or edited file content in English, including documentation, comments, and identifiers.

## Application overview

Vermont is a music and audiobook player where users upload their own audio resources and listen to them through the application.

The project is a monorepo managed with npm workspaces and Turborepo:

- apps/client/: Vue 3 frontend using Vite and SCSS.
- apps/server/: NestJS backend running on Deno, with REST and MCP endpoints.
- packages/: shared workspace packages. packages/contracts/ contains shared types and Zod schemas.
- infra/: infrastructure configuration, including local PostgreSQL and Cloudflare R2 CORS configuration.
- doc/: project documentation.

PostgreSQL stores application data, and private Cloudflare R2 storage holds uploaded audio files.

## Global Programming conventions

- Use exactly 2 spaces per indentation level. Do not use tabs for indentation.
- Optimize code for readability. Prefer descriptive names, small focused functions, and straightforward control flow.
- Follow established programming best practices and widely adopted formatting and code style conventions for the language and framework, prioritizing the project's explicit rules and existing formatter configuration.

- Use a single-line guard clause without braces for a simple early return, for example: `if (busy.value) return;`. End the return statement with a semicolon; do not add a semicolon after an `if` block.
- Keep `catch` and `finally` on the same line as the preceding closing brace (`} catch (cause) {` and `} finally {`), with their bodies on separate indented lines.

- Format returned object literals with multiple properties across multiple lines: put each property on its own line, indent properties by 2 spaces, place the closing brace on a separate line followed by a semicolon, and omit the trailing comma after the last property.

## Project tooling

- Use npm workspaces and the existing npm lockfile as the dependency source of truth. Do not introduce a second package manager or use deno install for dependencies.
- Run commands from the repository root:
  - npm run dev: start development tasks.
  - npm run build: build the workspaces.
  - npm run check: run configured checks.
  - npm run test: run configured tests.
- After code changes, run the checks relevant to the affected workspaces and report any checks that could not be completed.
