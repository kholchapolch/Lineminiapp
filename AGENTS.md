# Repository Guidelines

## Project Structure

The Sony Badge Next.js application lives under `src/`. App Router pages and API
routes are in `src/app`, reusable UI is in `src/components`, business and
integration logic is in `src/lib`, and shared types are in `src/types`. Keep
focused Vitest files beside their modules as `*.test.ts`. Static assets live in
`public/`; database migration and seed tools live in `scripts/db/`.

The UAT Windows App Service runtime is repository-specific: preserve
`server.js`, `web.config`, `public/deployment-check.html`, and
`.github/workflows/uat_mysonybadgestg.yml` when syncing application code. Keep
`.github/workflows/main_mysonybadgesprd.yml` in the same release tree.

## Commands

Use npm and the committed `package-lock.json`.

- `npm ci`: install the locked dependency tree.
- `npm run dev`: start the local development server.
- `npm test`: run Vitest once.
- `npm run lint`: run Next.js ESLint checks.
- `npm run build`: build the production application.
- `npm run db:migrate`: apply the MySQL schema migration.
- `npm run db:seed`: replace the configured badge-rule data.
- `npm run db:verify`: verify seeded rule counts and version.

## Code and Test Style

Use strict TypeScript, the `@/*` alias for `src/`, PascalCase for React
components, camelCase for functions and values, and stable badge/rule codes.
Make surgical changes and add focused tests for session, SKU, API, database, or
calculation behavior. Run tests, lint, and build before pushing `uat` or `main`.

## Deployment and Secrets

Pushes to `uat` deploy to the `uat` GitHub environment. Pushes to `main` deploy
to the `production` GitHub environment. Keep both workflow files synchronized
on both branches, promote the same release SHA to `uat` first, and fast-forward
`main` only after UAT verification. The workflows materialize `.env.production`
from `UAT_ENV_FILE` or `PROD_ENV_FILE`; never commit `.env*`. Azure/App Service
environment variables override values loaded from `.env.production`. Keep DB,
session, LINE server, and APIM secrets server-only and never use
`NEXT_PUBLIC_*` for secret values.

The target database requires TLS. Use `DATABASE_SSL=true` or `?ssl=true` in
`DATABASE_URL`. Do not disable certificate verification.

## Commits and Pull Requests

Use concise imperative commits. Before staging, inspect `git status` and the
full diff, and preserve unrelated local work. Pull requests should state scope,
validation commands, deployment impact, and screenshots for UI changes.
