# AGENTS.md

These instructions apply to apps/server/ and supplement the repository root AGENTS.md.

## Programming conventions

- Organize the server into feature modules using the NestJS module, controller, and service pattern:
  - Controllers handle HTTP requests, input validation, and responses. Keep business logic and SQL out of controllers.
  - Services implement application logic and interact with the database or external integrations.
  - Modules declare controllers and providers and configure their dependencies, imports, and exports.
- Extract code shared across applications into dedicated workspace packages under packages/. Reuse existing packages when appropriate.
- Keep server-only code and secrets out of packages consumed by the frontend.
