# ADR 0001: Keep Thresholds Normalized, Merge SKU Conditions

## Status

Accepted

## Context

The badge pilot needs to show a configurable badge shelf from Sony product ownership data. Sony API provides owned products, not final badge shelf data.

The rule setup must support:

- One badge with one unlock level.
- One badge with many levels, such as Bronze, Silver, Gold, or future client-defined tiers.
- One badge with one or many conditions.
- Condition logic for any one, all required, and minimum count from a SKU list.
- The same Sony SKU contributing to more than one badge rule.
- Debug review through SQL and the debug panel.

The client setup workflow is likely to send a rule name plus a list of Sony SKUs. Keeping one row per SKU makes setup noisy and hard to review by eye.

## Decision

Use this pilot schema:

- `badge_rules` stores badge identity, grouping, display window, and product registration earning window.
- `badge_rule_thresholds` stores shelf levels and image URLs.
- `badge_rule_conditions` stores each condition row with `match_type`, `required_count`, and `sony_skus` JSON.
- `app_config.badge_rules_version` stores the rule version used to invalidate browser badge caches.

Keep `badge_rule_thresholds` separate from `badge_rules` because one badge can have many visible tiers.

Merge the old condition group and condition item structure into one `badge_rule_conditions` table because the condition setup is easier for humans to maintain when the SKU list stays in one row.

Rename threshold image columns to:

- `achieved_image_url` for the color image.
- `locked_image_url` for the optional locked image.

If `locked_image_url` is null, the app uses `achieved_image_url` and dims it in the UI.

## Consequences

The schema keeps tier badges clean without duplicating badge metadata.

The condition table can still support composed rules by adding multiple condition rows under the same badge rule. For example, Trinity Master can use three `any` conditions so each lens family accepts version alternatives while the badge still requires all three families.

Limited-period campaign badges use `registration_start` and `registration_end` as the earning window for Sony product `registeredAt`. A user who registered a qualifying product inside that window can still see the achieved badge later. `active_from` and `active_to` are display controls only; keep `active_to` null unless the badge should disappear from the shelf.

The SKU list is stored as JSON, so SQL cannot enforce one foreign-key row per SKU. This is acceptable for the pilot because Sony SKUs are external identifiers and the debug panel exposes readable SKU labels for review.

The model supports composed rules from `any`, `all`, `min_count`, multiple conditions, multiple thresholds, and date windows. It does not try to be a fully nested boolean expression engine such as `(A OR B) AND (C OR (D AND E))`.

Badge calculation is done in application code because Sony owned products arrive as API JSON at request time. The browser may cache display-only achievement results in `localStorage`, but the server confirms the cache using customer key, normalized SKU hash, and `badge_rules_version` before the browser reuses it. Direct rule updates must bump `badge_rules_version`.

## Alternatives Considered

### Keep Condition Groups And Items

Rejected after pilot review.

It is more normalized, but it creates many rows for a rule that the client thinks of as one condition with one SKU list.

### Merge Everything Into One Rule Table

Rejected.

This is simpler for one-level badges, but it duplicates badge metadata for tier badges and makes multi-threshold display harder to inspect.

### Store Full Rule Logic As JSON

Rejected for now.

This could support arbitrary nested logic later, but it is harder for clients to review with SQL and harder to explain in the current debug panel.
