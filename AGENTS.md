# Repository Guidelines

## Project Structure & Module Organization
This repository is currently dependency/bootstrap-first. The framework baseline follows the setup prerequisites from `/pilot-sony`; source code will be copied later. The minimal Next.js placeholder lives in `app/` only so framework checks can run. Put shared application code in `src/`, colocate tests as `src/**/*.test.ts`, keep public assets in `public/`, and place operational notes in `docs/`.

## Build, Test, and Development Commands
Use npm with a committed `package-lock.json`.

- `npm install`: install dependencies and update the lockfile during setup.
- `npm run dev`: start the local Next.js server.
- `npm test`: run Vitest once.
- `npm run lint`: run the Next.js ESLint checks.
- `npm run build`: verify the production Next.js build.

Database scripts are not configured yet. Add `db:migrate`, `db:seed`, or `db:reset` only when the copied source includes matching scripts.

## Coding Style & Naming Conventions
Use TypeScript with strict checks. Follow Next.js defaults and `eslint-config-next`. Prefer PascalCase for React components, camelCase for variables/functions, and kebab-case for route folders when readable. Use the `@/*` alias for imports from `src/`.

## Testing Guidelines
Vitest is configured for Node-based tests under `src/**/*.test.ts`. Add focused tests with feature work, especially for session handling, LINE/LIFF helpers, API adapters, and database logic. Run `npm test` before opening a pull request.

## Commit & Pull Request Guidelines
This repo has no local commit history yet. Use concise imperative commits such as `chore: bootstrap next dependencies`. Pull requests should describe scope, list validation commands, link the task or issue, and include screenshots for UI-facing changes.

## Security & Configuration Tips
Keep DB credentials, LINE channel secrets, APIM keys, and session secrets out of source and screenshots. Only expose browser-safe values through `NEXT_PUBLIC_*`.
