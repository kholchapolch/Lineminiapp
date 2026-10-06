# EX-16076 — workbook subset import and activation review

## Requirement and scope

Import validated workbook data, report missing inputs, then activate the resulting dataset on Sony UAT. The user chose the valid workbook subset rather than synthetic fixtures. This delivers a CLI import/activation slice, not the remaining admin CRUD APIs or the complete Excel mapping implementation.

## Verified UAT result

- Target: `mysonybadgesqlstg.mysql.database.azure.com`, database `lineminidb`, SSH gateway `104.43.108.216`; TLS certificate verification enabled.
- Dataset: `9d481eed3bd75ea63986f40ff78a2be37190cc83758990d7c511b0b4a59eb67a`.
- Import committed 649 products and 5 contents as draft (revision 1); active remained empty during import.
- Activation checked the stored dataset hash and switched active atomically (revision 2).
- Independent post-activation connection verified the active hash and row counts.
- Active and draft now both point to the hash above. `cs_portal_revision=2` is a new app_config entry used for optimistic concurrency; initial revision is 0 before its first transactional creation.
- Before/after SHA-256 hashes of Badge configuration and pre-existing app_config rows match. Badge counts remain groups 6, rules 65, thresholds 71, conditions 67, logs 0.

## What is available

| Data | Imported |
|---|---:|
| Product model/category mappings | 649 |
| Register Product page (Thai) | 1 |
| Service Center and Repair Status footer links, TH/EN | 4 |

Product category counts: HE 223, DI 176, Personal Entertainment 146, Game 70, Mobile 34. Category names are preserved from the workbook. Footer labels are sourced from CTA rows 9/10; leading whitespace in the service-center URL is trimmed. Register page title is reused as its button label. Source body lines become typed checklist blocks. No English page is generated.

## Missing or deferred data

- All 649 product image URLs point to the Sony homepage. Stored as `null`, not as image resources.
- 28 article and 28 carousel rows lack stable IDs and PublishTime; excluded. No dates or source IDs manufactured.
- FAQ URL is `TBC`; excluded.
- Eight CTA definitions use checkbox form controls. Action/category resolution is deferred to its mapping review; cell blanks are not interpreted as unchecked boxes. CTA rows are not imported.
- Two model names (product sheet rows 207 and 232) contain suspicious `ï¿½` encoding. Preserved as source text and flagged; matching against Sony API is unproven.
- Page banner comes from the sample workbook and remains sample material, not production readiness evidence.

Row-level issues: `scripts/db/cs-portal/fixtures/workbook-uat.report.json` (716 entries, mostly missing product images). Source workbook SHA-256: `1ab2d8fa2acec3ba6a17fdadca170a8b471aa4805b1385622d1622b1e3bd220a`.

## Code flow

1. `scripts/db/cs-portal/extract-workbook.py` reads the workbook with openpyxl and produces the reviewed subset plus a source/row-level report. It intentionally handles this workbook layout and excludes article/carousel mapping pending review, even if future rows supply their missing fields.
2. `scripts/db/cs-portal/dataset.mjs` validates canonical fields, references, locale, approved HTTPS hosts, and typed payloads; hashes sorted canonical JSON. CTA payload import is not supported in this slice.
3. `scripts/db/cs-portal/repository.mjs` imports both tables in one transaction and validates readback before commit. Existing versions are hash-checked instead of reinserted. Locked pointers plus monotonic revision reject stale writes with a status-409 error.
4. Activation validates a stored version before changing active in the same transaction. The same operation can select a prior valid version for rollback. There is no previous dataset yet, and live rollback has not been exercised.
5. `dataset-cli.mjs` provides preview/status/apply/activate/verify with explicit expected host/database guards. Shared MySQL connection helper accepts an optional local tunnel port while retaining the DB hostname for TLS verification.

## How to inspect/reproduce

Node 20.6+ is needed for the `--env-file` CLI invocation. Python extraction needs openpyxl; use the bundled workspace Python where available. Do not edit generated fixture JSON manually; regenerate from the source and review the report.

```sh
python3 scripts/db/cs-portal/extract-workbook.py '/path/to/SONY CS Portal Data Schema and Data Sampling (2).xlsx' --out scripts/db/cs-portal/fixtures/workbook-uat.json
node scripts/db/cs-portal/dataset-cli.mjs preview --file scripts/db/cs-portal/fixtures/workbook-uat.json
npm run test:cs-portal-import
```

For read-only UAT verification, open a tunnel in another terminal:

```sh
ssh -o ExitOnForwardFailure=yes -N -L 127.0.0.1:13306:mysonybadgesqlstg.mysql.database.azure.com:3306 104.43.108.216
npm run db:cs-portal:dataset -- verify --tunnel-port 13306 --expected-host mysonybadgesqlstg.mysql.database.azure.com --expected-database lineminidb
```

The `.env` remains ignored and contains the original DB hostname. The tunnel is not kept running after this review. Do not point DATABASE_URL at localhost; the original hostname is used for TLS.

## Validation and limits

- Eight focused Node tests passed: hash determinism, invalid payload/URL/reference rejection, reviewed subset, rejection before DB connection, stale revision, rollback on simulated write failure, absent activation target, stored data tampering.
- Existing Vitest: 134 tests passed. Lint and build passed. Build emitted the existing generic safeError during static generation but exited successfully.
- Live evidence: import, draft isolation, activation, stored hash/count readback, unchanged existing Badge/config hashes.
- Transaction-failure and stale-revision tests use a fake connection; real concurrent writers and rollback to an older active dataset have not been exercised.
- No frontend/API deployment performed. Existing prototype still uses mock data; activating DB data alone does not update its UI.
- Stop here for review. Admin CRUD, remaining import mappings and content APIs remain pending. No commit/push in this round.
