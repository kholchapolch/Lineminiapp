# EX-16076 — temporary mock product images

Requirement: fill the 649 missing product images with an obvious temporary placeholder for FE/E2E; mark mocks clearly.

- Mock URL: https://placehold.co/600x600/F1F5F9/475569/png?text=MOCK%5CnPRODUCT+IMAGE%5CnPLACEHOLDER
- 600×600 PNG, light gray background, dark text: `MOCK / PRODUCT IMAGE / PLACEHOLDER` on separate lines.
- Source/service documentation: https://placehold.co/
- URL checked from this machine: HTTP 200, image/png, 15,144 bytes. This is an external temporary image service; browser/E2E rendering remains to be verified by FE.
- All 649 replacements are mock data. No real product photos were added. The URL text itself identifies the mock; the current product schema has no separate mock flag.
- Only null product image URLs are replaced. Existing real images, model/category mappings, and all five content records are preserved.
- Validator permits this exact mock URL only in product image fields, not arbitrary external links.

Original dataset: `9d481eed3bd75ea63986f40ff78a2be37190cc83758990d7c511b0b4a59eb67a` (kept for rollback).

Prepared dataset: `a0a1d91399283d3026a778447a837064cff45a024e128629cc316a1494b8dd6e`.

Source workbook fixture remains unchanged. To reproduce the mock overlay:

```sh
node scripts/db/cs-portal/prepare-product-placeholders.mjs scripts/db/cs-portal/fixtures/workbook-uat.json /tmp/sony-placeholder-dataset.json
node scripts/db/cs-portal/dataset-cli.mjs preview --file /tmp/sony-placeholder-dataset.json
npm run test:cs-portal-import
```

Focused tests: 9 passed, including preserving real images and content, not mutating source data, and rejecting placeholder URLs as link destinations. No frontend deployment is included; this change prepares image URLs for consumers of the UAT dataset.

## Live result

Import succeeded at revision 3; activation succeeded at revision 4. Independent readback verified the new active dataset hash, all 649 mock image URLs, unchanged non-image product fields, unchanged five contents, and the intact prior dataset hash. Active dataset is `a0a1d91399283d3026a778447a837064cff45a024e128629cc316a1494b8dd6e`.
