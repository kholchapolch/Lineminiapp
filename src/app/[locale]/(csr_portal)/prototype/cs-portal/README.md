# Sony CS Portal prototype

Question: Does the slide-based Product Center flow handle normal and edge-case content before production UX/UI is designed?

Local-only throwaway route:

    npm run dev
    http://localhost:3000/th/prototype/cs-portal?uuid=test-default

Key cases:

- test-dynamic-content
- test-10-cta
- test-many-products
- test-no-product
- test-no-line-uuid
- test-api-error
- test-no-content
- test-empty-article
- test-long-content
- test-expired-warranty

Boundaries:

- No Badge page/component/CSS changes.
- Reuses the existing Next.js locale layout and font/runtime.
- Uses deterministic in-memory data only.
- Route returns 404 when NODE_ENV is production.
- Delete this route, mock engine and prototype assets after the UX/content decisions are absorbed into production specifications.

Verdict: pending stakeholder review.
