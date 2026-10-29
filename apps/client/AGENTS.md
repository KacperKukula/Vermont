# AGENTS.md

These instructions apply to apps/client/ and supplement the repository root AGENTS.md.

## Programming conventions

- Use the `@/` alias for imports from `src/` that would otherwise traverse parent directories (for example, `@/composables/useNotifications`). Keep `./` imports for files in the same directory.
- Use the `@styles/` alias for shared SCSS modules instead of parent-directory paths.
- Keep source aliases synchronized between Vite and TypeScript configuration, and use the same aliases in test imports and mocks.

- Use BEM for all CSS class names: block, block__element, and block--modifier.
- Extract code shared across applications into dedicated workspace packages under packages/. Reuse existing packages when appropriate.
- Keep server-only code and secrets out of packages consumed by the frontend.
