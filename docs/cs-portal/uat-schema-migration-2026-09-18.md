# EX-16076: UAT schema migration review — 2026-09-18

Requirement: prepare the two Portal tables and dataset configuration for the agreed import/CRUD/draft/activate/rollback workflow. This review covers schema only.

## Target and execution

- SSH gateway: `104.43.108.216`, existing SSH user/key configuration.
- MySQL endpoint: `mysonybadgesqlstg.mysql.database.azure.com:3306`.
- Database: `lineminidb`; server version: `8.4.8-azure`.
- TLS certificate verification enabled; negotiated cipher: `TLS_AES_256_GCM_SHA384`.
- DB credentials saved in ignored local `.env`, permissions `600`; secrets omitted here.
- Imported and executed all four statements from `scripts/db/cs-portal/schema.mjs` through a temporary tunnel-aware runner. Every statement succeeded.
- MySQL DDL commits independently; this was not a transactional migration.

## Readback

| Table | Before | After |
|---|---:|---:|
| app_config | 3 | 6 |
| badge_display_groups | 6 | 6 |
| badge_rules | 65 | 65 |
| badge_rule_thresholds | 71 | 71 |
| badge_rule_conditions | 67 | 67 |
| badge_calculation_logs | 0 | 0 |
| cs_portal_products | absent | 0 |
| cs_portal_contents | absent | 0 |

SHA-256 comparisons of sorted row serializations confirmed unchanged contents for the four Badge configuration tables and all pre-existing app_config rows. Both new tables use InnoDB. Primary, unique, and check constraints were read back from information_schema successfully; invalid-write enforcement was not separately exercised.

New configuration:

- `cs_portal_schema_version`: `1`
- `cs_portal_active_dataset_version`: empty
- `cs_portal_draft_dataset_version`: empty

Existing app_config schema remains unchanged (utf8mb3). New Portal tables declare utf8mb4.

## Review boundary

No dataset imported or activated. No import/CRUD/content API behavior is proven by this migration. Application deployment and live API validation were not performed. Stop here for review before continuing implementation.

Local diagnostic snapshots: `/private/tmp/sony-uat-before.json` and `/private/tmp/sony-uat-after.json` (temporary; contain schema, counts, and hashes rather than source rows).
