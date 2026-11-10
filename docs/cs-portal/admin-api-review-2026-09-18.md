# EX-16076 — Admin CRUD and version workflow review

## Requirement

Provide BE-only CRUD for products and contents, import preview/apply, and explicit activate/rollback. Every accepted edit snapshots both tables into a new draft version. Active data changes only on activation. All writes require the current revision; stale writers receive 409. Use dedicated server-side CS_PORTAL_ADMIN_TOKEN, not LINE cookies, LINE/APIM keys, or session secrets.

Previously approved schema/import/mock-image work was committed and pushed as `87aac7f` to `origin/codex/sony-cs-portal-be`. The API changes in this review are not yet committed, pushed, or deployed.

## Endpoints

All paths below start with `/api/cs-portal/admin`. Every endpoint requires `Authorization: Bearer <CS_PORTAL_ADMIN_TOKEN>` and returns `Cache-Control: private, no-store`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/state` | active/draft pointers and decimal-string revision |
| GET | `/versions` | available hashes and row counts, including older versions |
| GET / POST | `/products` | list / create product |
| GET / PUT / DELETE | `/products/{model_key}` | get / replace / delete product |
| GET / POST | `/contents` | list / create content |
| GET / PUT / DELETE | `/contents/{locale}/{content_type}/{external_key}` | get / replace / delete content |
| POST | `/import/preview` | validate a canonical JSON dataset and compute hash; no DB access |
| POST | `/import/apply` | validate and store both tables as one draft snapshot |
| POST | `/activate` | validate stored dataset and atomically change active pointer |
| POST | `/rollback` | select a previous stored dataset using the same activation/CAS operation |

URL-encode path identities. Lists accept `limit=1..500` (default 100), `offset` (default 0), and optional `version=<hash>`. Without a version, reads use draft, falling back to active. Response includes selected version and current revision. A content identity is the tuple locale + content_type + external_key; identities cannot change in PUT. PUT replaces the full item; PATCH is not supported.

All writes require JSON with `revision` copied from GET state/list. POST create and PUT replace take `{ "revision": "4", "item": { ... } }`; DELETE takes `{ "revision": "4" }`. Import apply takes `{ "revision": "4", "dataset": { "products": [], "contents": [] } }`. Preview takes only `{ "dataset": { ... } }`. Activate/rollback take `{ "revision": "4", "version": "<64-character hash>" }`.

Bodies are limited to 8 MiB (streamed limit); datasets to 10,000 products and 20,000 contents. Unknown body fields are rejected.

## Example review flow

Use a disposable local database for mutation exercises. The current UAT active dataset is not changed by this implementation review.

1. Configure DATABASE_URL/DATABASE_SSL as usual and set a separate random CS_PORTAL_ADMIN_TOKEN in the ignored local environment or deployment secret store. Do not use NEXT_PUBLIC_*. Unconfigured admin returns 503; wrong/missing token returns 401.
2. GET state and a product, retaining the revision and complete item.
3. PUT the item with a changed model_name and that revision. Response has a new draft hash; active remains the previous hash.
4. GET the same item without version: shows draft. GET with version equal to the old active hash: shows the old name.
5. Repeat PUT with the stale revision: 409, no snapshot/pointer write.
6. POST activate with the new draft hash and the latest revision: active changes atomically.
7. POST rollback with the old hash and the latest revision: active returns to old data; draft remains available for continued editing.

Import preview accepts canonical JSON, not XLSX multipart uploads. Existing `extract-workbook.py` produces this JSON; its documented source/mapping exclusions still apply. This review does not resolve the workbook CTA checkbox mappings or invent missing article/carousel records.

## Code flow

- `src/app/api/cs-portal/admin/[...path]/route.ts`: Node App Router entry; no static caching.
- `src/lib/cs-portal/admin-handler.ts`: auth, body bounds, request/response and safe errors.
- `src/lib/cs-portal/admin-service.ts`: immutable list edits and identity rules.
- `src/lib/cs-portal/admin-repository.ts`: reuses the application MySQL pool and the shared snapshot engine.
- `scripts/db/cs-portal/repository.mjs`: shared CLI/API transaction engine. Lock current pointers, check revision, load a complete snapshot, edit/validate both collections, write/readback, then move draft. A failure rolls back the entire operation.
- `scripts/db/cs-portal/dataset.mjs`: same validator/hash for CLI, preview, CRUD and activation. Adds CTA action validation, real calendar-date checks and empty snapshots while preserving existing deployed hashes.

Empty snapshots are represented by `app_config` keys `cs_portal_dataset:<hash>` with row-count metadata. These markers are created in the same import/edit transaction; no third table or migration is needed. Existing non-empty versions are found from table rows and need no backfill. `cs_portal_revision` continues to be a monotonically increasing decimal string. Activating a version does not modify its rows or replace the current draft pointer.

Deleting a product referenced by model-targeted content fails validation rather than cascading content deletion. Delete dependent contents first. Invalid stored data/hash produces a safe 500 rather than exposing SQL or secrets. Missing versions/items are 404. Concurrent state changes are 409. Empty datasets can be stored/activated intentionally via authenticated import.

CTA payload examples:

```json
{"label":"Firmware","action":{"type":"articles"}}
{"label":"Support","action":{"type":"external","url":"https://www.sony.co.th/th"}}
{"label":"My badges","action":{"type":"internal","route":"/my-badges"}}
```

Each CTA also requires a non-empty action_key on the content row. Internal routes are limited to `/my-badges` and `/register-product`; external destinations retain the Sony HTTPS allowlist. The exact approved mock URL remains allowed only in product images. These payload contracts support CRUD storage; consumer-side CTA resolution remains the later CTA task.

## Validation and boundaries

- Vitest: 144 tests pass, including 10 new admin/service tests.
- Shared import engine: 11 Node tests pass, including import idempotence, immutable edits, activate/rollback and empty-snapshot manifest behavior using a transactional adapter double.
- Lint and production build pass; build includes the new admin route. Existing generic safeError during unrelated static page generation remains.
- Built Next.js HTTP smoke passed: missing bearer returns 401; authenticated preview returns 200 with the expected 649/5 counts, hash and no-store header, with DATABASE_URL disabled.
- Both known deployed dataset hashes are unchanged under the updated validator.
- CRUD transaction failure/stale revision checks and API CRUD/activation tests use mocks. No live MySQL CRUD/concurrent-writer/rollback test or deployed API test was performed in this round.
- Admin token has not been installed on UAT. No additional UAT DB changes or workflow/runtime changes.

Stop for review before starting the Register Product content API task. Keep ClickUp in review for QA; no task comments.
