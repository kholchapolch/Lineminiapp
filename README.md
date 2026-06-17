# Sony Thailand LIFF Badge Pilot

Pilot implementation repo for the Sony Thailand LINE LIFF badge display.

## Current Scope

- One Next.js LIFF web app.
- Server-side database query for badge display data.
- Local Postgres for development and tests.
- SQL migrations compatible with a future Supabase project.
- No CMS/admin in this pilot. Badge/config data is maintained directly in the database.

## GitHub Issues

- #1 Scaffold Next.js LIFF app
- #2 Set up local Postgres and database migrations
- #3 Prepare Supabase integration path
- #4 Implement server-side badge data access
- #5 Implement LIFF initialization and session states
- #6 Build badge display page
- #7 Document local run and issue close checklist

## Requirements

- Node.js 26.x or compatible modern Node.js runtime
- npm 11.x
- Docker

## Local Setup

```bash
npm install
cp .env.example .env.local
docker compose up -d
export DATABASE_URL=postgres://sony:sony@localhost:54339/sony_badges
npm run db:reset
npm run dev
```

Open `http://localhost:3000`.

Useful sample customers:

- `http://localhost:3000?customerId=demo-earned`
- `http://localhost:3000?customerId=demo-locked`
- `http://localhost:3000?customerId=demo-empty`
- `http://localhost:3000?customerId=demo-missing-data`

## Database

Migration:

```bash
npm run db:migrate
```

Seed:

```bash
npm run db:seed
```

Reset local DB schema/data:

```bash
npm run db:reset
```

## Supabase Path

The SQL in `db/migrations/001_initial_schema.sql` is standard Postgres and can be applied to Supabase later.

When a hosted Supabase project is ready:

1. Create a Supabase project in the approved organization.
2. Apply `db/migrations/001_initial_schema.sql`.
3. Apply `db/seed.sql` only to development/staging projects.
4. Store the hosted Postgres connection string in server-side environment variables.
5. Never expose Supabase service role keys to browser code or `NEXT_PUBLIC_*` values.
6. Add Row Level Security before exposing any direct browser reads.

Environment placeholders for future hosted Supabase usage are documented in `.env.example`:

- `SUPABASE_URL` and `SUPABASE_ANON_KEY` are safe only for public client use when Row Level Security is correctly configured.
- `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only and must never be placed in `NEXT_PUBLIC_*`.
- `DATABASE_URL` remains the preferred server-side connection setting for this pilot because the app queries the database from server code.

## LIFF Setup

Local development works without a LIFF ID and shows local preview mode.

For LINE testing, set:

```bash
NEXT_PUBLIC_LIFF_ID=<liff-id>
```

The LIFF endpoint must be HTTPS in staging/production.

## Verification Before Closing Issues

Run these before closing implementation issues:

```bash
npm run test
npm run lint
npm run build
```

For database-related issues, also verify:

```bash
docker compose up -d
export DATABASE_URL=postgres://sony:sony@localhost:54339/sony_badges
npm run db:reset
```

## Security Notes

- Browser code must not contain DB credentials.
- Server-side code owns database access.
- LINE ID, customer UID, serial number, model name, registration date, and logs are sensitive until Security/PDPA confirms handling.
- Keep secrets out of `NEXT_PUBLIC_*`, markdown, screenshots, GitHub issues, and logs.
