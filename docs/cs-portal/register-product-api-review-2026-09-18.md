# EX-16091 — Registered Product Information Page API

## Requirement

The ClickUp parent EX-13801 requests a data-driven pre-registration page: title, description, hero image, body heading, bullet points, Register Now and Back to Home. The agreed BE scope is a session-protected API returning typed blocks from the active dataset, with TH/EN selection and 404 when the requested language has no page. Back to Home is FE navigation, not an external registration action in this payload.

The workbook's sheet 4 describes the schema; sheet 8 supplies the imported Thai sample. No new translations or invented production content were introduced. Existing source text is preserved, including spelling.

## Contract

`GET /api/cs-portal/pages/register-product?locale=th`

- Requires the existing signed `sony_line_session` cookie created by the LINE-session flow.
- Exactly one `locale=th|en` is required. Unknown or duplicate query keys are rejected. UUID in a query and admin bearer tokens do not authorize this API.
- Reads the active pointer once and verifies that complete immutable snapshot with the existing repository/hash validator. Draft is never used as fallback.
- Returns `key`, `locale`, `title`, `lead`, and typed `blocks` only. No DB IDs, session identity, draft data or arbitrary HTML.
- All responses have `Cache-Control: private, no-store`; route is dynamic Node.js.

| Status | Meaning |
|---|---|
| 200 | Authenticated session, valid query, page exists in that language |
| 400 | Missing/invalid/duplicate locale or unsupported query |
| 401 | Missing, tampered or expired LINE session |
| 404 | Valid active dataset has no Register Product page in requested language |
| 500 | Active dataset missing/corrupt, DB failure, or invalid stored page payload |

English currently returns 404, because the active workbook dataset contains Thai only. There is no cross-language fallback.

## Data flow and files

1. `src/app/api/cs-portal/pages/register-product/route.ts`: validate signed LINE session, parse query, return safe errors/no-store JSON.
2. `src/lib/cs-portal/content-repository.ts`: reuse application MySQL pool, capture active pointer once, read and hash-validate that snapshot via the shared repository.
3. `src/lib/cs-portal/register-product-page.ts`: select exactly one global `register-product` page for the locale, validate and project its public fields.
4. Shared `validatePagePayload` in `scripts/db/cs-portal/dataset.mjs`: the same payload rules as import/CRUD, so unsafe URLs, HTML or unknown block types fail closed.
5. `src/lib/cs-portal/types.ts`: public block union (`image`, `heading`, `paragraph`, `check_list`, `link_button`) and page response type.

The current repository reads both tables to verify the dataset hash per request; it does not cache a version across requests. Future optimization must preserve one-version-per-request behavior.

## Before/after example and FE review

Before: no Portal registration content API; prototype data was in memory.
After: an authenticated request with `locale=th` returns the active dataset's Thai title “ลงทะเบียนสินค้า”, lead, banner image, body heading, four checklist items and a registration link button.

Full response captured from the local built route reading UAT: `docs/cs-portal/register-product-th-response.json`.

Source field mapping:

| Workbook field | Response |
|---|---|
| Page_Title | title and current registration button label |
| Page_Description | lead |
| Image_URL | image block url |
| Body_Title | heading block text |
| Body_Cotent | check_list items (already split during import) |
| Register_Now_URL | link_button url |

FE should render each block by type and use the existing session cookie. Do not interpret strings as raw HTML. Test the TH response, missing EN state, expired-session handling, registration link target and Back to Home navigation. Example with an existing local test session:

```sh
curl -i --cookie 'sony_line_session=<valid-session-cookie>' 'http://localhost:3000/api/cs-portal/pages/register-product?locale=th'
```

## Evidence and limitations

- New focused tests: 20 pass (route 17, repository 3).
- Full Vitest: 164 pass; shared import tests: 11 pass; lint/build pass. The pre-existing safeError message during unrelated static generation remains, with successful build exit.
- Built local HTTP API + live UAT DB readback: TH 200; EN 404; invalid locale 400; expired session 401. Thai response exactly matches the imported workbook fixture. No-store verified.
- UAT active dataset independently verified: `a0a1d91399283d3026a778447a837064cff45a024e128629cc316a1494b8dd6e`, revision 4, products 649, contents 5.
- **MOCK used only for local signed session identity/secret and the unit-test English page.** The HTTP smoke read real UAT stored data via SSH; it did not perform a real LIFF login. The English test fixture was never imported or activated.
- Test harness routed local TCP through the existing SSH gateway while retaining MySQL TLS certificate verification. No product connection settings or UAT data were changed.
- The public UAT application has not been deployed with this route. FE browser rendering and actual LINE login remain unverified.
- Prior CRUD review was committed/pushed as `5ea44ac`. This page API is uncommitted for review. EX-16076 remains in review; EX-16091 moves to in review for QA. No ClickUp comments.
