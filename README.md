# Sony Thailand LIFF Badge Pilot

Pilot implementation repo for the Sony Thailand LINE LIFF badge display.

## Current Scope

- One Next.js LIFF web app.
- Server-side database query for badge display data.
- Local MySQL for development and tests.
- Code-based MySQL migration and seed scripts.
- No CMS/admin in this pilot. Badge/config data is maintained through reviewed seed/config code or controlled DB changes.

## GitHub Issues

- #1 Scaffold Next.js LIFF app
- #2 Set up local MySQL and database migrations
- #3 Prepare code-based rule seed workflow
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
export DATABASE_URL=mysql://sony:sony@127.0.0.1:3307/sony_badges
npm run db:reset
npm run dev
```

Badge database seed options:

- `npm run db:seed:all` applies the schema, seeds every configured rule, and verifies row counts.
- `npm run db:seed:sql` regenerates `scripts/db/seed-all-rules.sql` from `seed-data.mjs`.
- `npm run db:seed:sql:check` fails when the checked-in manual SQL is stale.
- Manual MySQL: `mysql -u <user> -p <database> < scripts/db/seed-all-rules.sql` after running the migration.
- `npm run docs:badge-rules` regenerates the client-readable rules, migration, and mock-testing guide.
- `npm run docs:badge-rules:check` verifies that the checked-in HTML guide matches the rule source.

Open `http://localhost:3000`.

When `APP_ENV=local` and `SONY_PRODUCT_API_MODE=mock`, the badge entry skips
LIFF and opens the new design with `SONY_DEMO_LINE_UUID`.

To render the new design from specific SKUs, use the local-only SKU mock mode:

- `http://localhost:3000/th/badges?mock=1&sku=SEL2470GM2&sku=SEL70200GM2`
- Comma-separated SKUs are also accepted.
- Repeat a SKU to simulate multiple serial registrations for the same model.

The supplied products still pass through the database-backed badge rules. This
mode is unavailable outside local mock configuration.

Useful sample LINE UUIDs:

Mock `lineuuid` query strings are accepted only for explicit local debug
samples. Do not configure these URLs in LINE Developers.

- `http://localhost:3000/badge?lineuuid=demo-line-earned&debug=1`
- `http://localhost:3000/badge?lineuuid=demo-line-tier-bronze&debug=1`
- `http://localhost:3000/badge?lineuuid=demo-line-tier-silver&debug=1`
- `http://localhost:3000/badge?lineuuid=demo-line-tier-gold&debug=1`
- `http://localhost:3000/badge?lineuuid=demo-line-tier-body-silver-gm-gold&debug=1`
- `http://localhost:3000/badge?lineuuid=demo-line-sony-warranty-contract&debug=1`
- `http://localhost:3000/badge?lineuuid=demo-line-locked&debug=1`
- `http://localhost:3000/badge?lineuuid=demo-line-empty&debug=1`
- `http://localhost:3000/badge?lineuuid=demo-line-missing-data&debug=1`

Debug preview:

- `http://localhost:3000/badge?lineuuid=demo-line-earned&debug=1` shows display-safe mock JSON in local only. Production ignores debug mode.

Client rule setup guide:

- Open `docs/badge-rules-setup.html` to review how badge rules, conditions, Sony product JSON, and aggregation progress are configured.
- Open `docs/client-badge-rule-confirmation.html` to review the client Excel rule interpretation that should be confirmed with Sony before production setup.
- Open `docs/mock-data-and-live-usage.html` to review all mock `lineuuid` values, mock SKUs, debug mode behavior, and live Sony API usage.

Badge result API mock sample:

- `http://localhost:3000/api/customer-products?lineuuid=demo-line-earned&debug=1`

LINE Mini App entry:

- `http://localhost:3000/badge`

The `/entry` route validates the request source with `Origin` and/or `Referer`
against `ALLOWED_ORIGINS` and `ALLOWED_REFERRERS`. In staging/production the
server must resolve the user from a signed LINE session cookie created after
server-side LINE ID token verification. Query-string `lineuuid` is accepted only
for explicit local debug mock samples because users can edit URL parameters.

If a user opens `/badge` directly without a valid session, the badge page tries
to initialize LIFF, submit `liff.getIDToken()` to `/api/line-session`, and retry
badge loading automatically. If the page is not running inside LINE, it shows a
LINE session error instead of trusting a URL `lineuuid`.

## App Configuration

Required server-side settings:

- `APP_ENV`: `local`, `staging`, or `production`.
- `APP_BASE_URL`: canonical app origin, for example `http://localhost:3000`.
- `DATABASE_URL`: server-side MySQL connection string.
- `ALLOWED_ORIGINS`: comma-separated allowed `Origin` values for `/entry`.
- `ALLOWED_REFERRERS`: comma-separated allowed `Referer` origins for `/entry`.
- `LINE_CHANNEL_ID`: LINE Login channel ID used to verify LIFF ID tokens.
- `APP_SESSION_SECRET`: server-only secret for signed LINE session cookies.
- `LOG_HASH_SECRET`: optional server-only HMAC secret for log identifiers. Falls
  back to `APP_SESSION_SECRET`.
- `SONY_PRODUCT_API_MODE`: `mock` locally, `live` for Sony API integration.
- `SONY_PRODUCT_API_BASE_URL`: full endpoint URL, including path, required when
  `SONY_PRODUCT_API_MODE=live`.
- `SONY_PRODUCT_API_SUBSCRIPTION_KEY`: server-only Azure APIM subscription key
  sent as `Ocp-Apim-Subscription-Key` in live mode. Do not expose it through
  `NEXT_PUBLIC_*`.
- `SONY_PRODUCT_API_COUNTRY_CODE`: request country code for Sony APIM. Defaults
  to `th`.
- `SONY_DEMO_LINE_UUID`: sample mock customer identifier used by local tooling;
  the runtime does not silently fall back to it when a LINE session is missing.

Client-visible setting:

- `NEXT_PUBLIC_LIFF_ID`: required outside local mode. Leave blank locally to use
  preview mode without LINE.
- `NEXT_PUBLIC_DEBUG_MOCK_JSON`: optional local/staging flag for showing the
  display-safe debug JSON panel without adding `?debug=1`. Keep disabled on any
  customer-accessible staging/UAT. Production ignores this flag.

### Sony APIM Warranty API

Live mode calls Sony's warranty endpoint server-side:

- Method: `POST`
- URL: `https://apim-rcap-dev.azure-api.net/mysony-api/QueryWarrantyMySonyByLine`
- Header: `Ocp-Apim-Subscription-Key: <server-side secret>`
- Body:

```json
{
  "countryCode": "th",
  "lineId": "<LINE user ID>"
}
```

The current response shape is:

```json
{
  "prodDetails": [
    {
      "lineId": "U...",
      "serialNumber": "1000003",
      "modelName": "ZV-E10M2/BQ AP2",
      "registrationDate": "2026-03-25",
      "warrantyExpiryDate": "2027-06-23"
    }
  ]
}
```

The adapter maps `prodDetails[].modelName` to the internal match key `sku`
because the current API response does not provide a separate canonical SKU
field. Badge rule `sony_skus` values must therefore match normalized
`modelName` values until Sony provides a dedicated SKU/model-code field.

## Database

Migration:

```bash
npm run db:migrate
```

Seed from code:

```bash
npm run db:seed
```

Reset local DB schema/data:

```bash
npm run db:reset
```

Verify seed counts and `badge_rules_version`:

```bash
npm run db:verify
```

Rule/cache version:

- `app_config.badge_rules_version` invalidates browser badge caches when badge
  rules, thresholds, or conditions change.
- The badge page stores display-only badge results in browser `localStorage`.
  Raw Sony SKUs are not stored there; the cache key uses a server-generated SKU
  hash and customer cache key.
- The server still fetches Sony products per badge load, then skips full rule
  loading when the browser cache metadata matches the current
  `badge_rules_version`.
- Update `badge_rules_version` after any direct rule setup change.

### Badge Rule Updates

This pilot has no CMS/admin surface. The default setup path is code-based:

- Edit `scripts/db/seed-data.mjs`.
- Run `npm run db:reset` locally.
- Review `/badge?lineuuid=...&debug=1` only as an explicit local debug mock.
- Commit the seed change with the implementation.

Operational rules:

1. Run the seed in staging first, then verify the affected customer examples at
   `/badge` through LINE SDK/session flow. Use local debug mock URLs only for
   sample data review.
2. Keep `badge_code` stable because the display layer and analytics can depend
   on it.
3. Prefer setting `is_active = false` over deleting a rule that has already been
   shown in a campaign.
4. Use `registration_start` and `registration_end` for limited-period earning.
   A product registered inside this window can still show an achieved badge
   later. Use `active_to` only when the badge should disappear from the shelf.
5. Do not paste LINE IDs, serial numbers, customer exports, or database secrets
   into GitHub issues, screenshots, or chat logs.
6. Keep production seed/config changes in a dated, reviewed change note before applying them.

## LIFF Setup

Local mock mode bypasses LIFF when `APP_ENV=local` and
`SONY_PRODUCT_API_MODE=mock`. Use `mock=1&sku=...` to build a custom product
scenario, or `lineuuid` with `debug=1` for the legacy diagnostic view. Normal
LINE testing should set the LIFF ID and open `/badge` without URL identity
parameters.

For LINE testing, set:

```bash
NEXT_PUBLIC_LIFF_ID=<liff-id>
```

The LIFF endpoint must be HTTPS in staging/production.

When LIFF runs inside LINE, the client uses `liff.getIDToken()` and sends that
token to `/api/line-session`. The server verifies the ID token with LINE and
stores the LINE user ID in a signed, HTTP-only session cookie. `/entry` keeps
redirect validation server-side before sending the user to the badge display
route, and `/badge` can also create the same session automatically if it detects
that the session is missing.

The LINE Developers endpoint URL should be `/badge`, not a URL containing
`lineuuid` or `debug`.

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
export DATABASE_URL=mysql://sony:sony@127.0.0.1:3307/sony_badges
npm run db:reset
```

## Security Notes

- Browser code must not contain DB credentials.
- Server-side code owns database access.
- LINE ID, customer UID, serial number, model name, registration date, and logs are sensitive until Security/PDPA confirms handling.
- Keep secrets out of `NEXT_PUBLIC_*`, markdown, screenshots, GitHub issues, and logs.
