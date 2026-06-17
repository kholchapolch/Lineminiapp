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

Useful sample LINE UUIDs:

- `http://localhost:3000/badge?lineuuid=demo-line-earned`
- `http://localhost:3000/badge?lineuuid=demo-line-locked`
- `http://localhost:3000/badge?lineuuid=demo-line-empty`
- `http://localhost:3000/badge?lineuuid=demo-line-missing-data`

Badge result API:

- `http://localhost:3000/api/customer-products?lineuuid=demo-line-earned`

Local LIFF entry preview:

- `http://localhost:3000/entry?lineuuid=demo-line-earned`
- `http://localhost:3000/entry?lineuuid=demo-line-locked`

The `/entry` route validates the request source with `Origin` and/or `Referer`
against `ALLOWED_ORIGINS` and `ALLOWED_REFERRERS` before resolving the
`lineuuid` into the badge display route.

## App Configuration

Required server-side settings:

- `APP_ENV`: `local`, `staging`, or `production`.
- `APP_BASE_URL`: canonical app origin, for example `http://localhost:3000`.
- `DATABASE_URL`: server-side Postgres connection string.
- `ALLOWED_ORIGINS`: comma-separated allowed `Origin` values for `/entry`.
- `ALLOWED_REFERRERS`: comma-separated allowed `Referer` origins for `/entry`.
- `SONY_PRODUCT_API_MODE`: `mock` locally, `live` for Sony API integration.
- `SONY_PRODUCT_API_BASE_URL`: required when `SONY_PRODUCT_API_MODE=live`.
- `SONY_DEMO_LINE_UUID`: local fallback `lineuuid` for preview entry flow.

Client-visible setting:

- `NEXT_PUBLIC_LIFF_ID`: required outside local mode. Leave blank locally to use
  preview mode without LINE.

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

### Direct Badge Rule Updates

This pilot has no CMS/admin surface. Badge rules are maintained directly in
Postgres until an admin workflow is approved.

Use a reviewed SQL transaction for every badge rule change:

```sql
BEGIN;

UPDATE badge_rules
SET
  badge_name = 'Alpha Collector',
  description = 'Collect eligible Sony Alpha camera and G Master lens products.',
  rule_type = 'tier',
  required_count = 3,
  sort_order = 10,
  is_active = true,
  updated_at = now()
WHERE badge_code = 'alpha-tier';

DELETE FROM badge_rule_skus
WHERE badge_rule_id = (
  SELECT id FROM badge_rules WHERE badge_code = 'alpha-tier'
);

INSERT INTO badge_rule_skus (badge_rule_id, sony_sku, is_active)
SELECT id, sku, true
FROM badge_rules
CROSS JOIN (VALUES ('ILCE-7M4'), ('ILCE-7CM2')) AS allowed_skus(sku)
WHERE badge_code = 'alpha-tier';

COMMIT;
```

Operational rules:

1. Run the SQL in staging first, then verify the affected customer examples at
   `/badge?lineuuid=...` and `/api/customer-products?lineuuid=...`.
2. Keep `badge_code` stable because the display layer and analytics can depend
   on it.
3. Prefer setting `is_active = false` over deleting a rule that has already been
   issued to customers.
4. Do not paste LINE IDs, serial numbers, customer exports, or database secrets
   into GitHub issues, screenshots, or chat logs.
5. Keep production SQL in a dated, reviewed change note before applying it.

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

When LIFF runs inside LINE, the client reads `liff.getProfile().userId` and
passes it to `/entry?lineuuid=...`. The server entry route keeps redirect
validation server-side before sending the user to the badge display route.

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
