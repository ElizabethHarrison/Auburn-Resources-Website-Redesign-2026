# @auburn/edge

Cloudflare Worker for auburnresources.com.au. **Current scope (D-023): document-filter routing only** —
`/investors/{announcements,reports,presentations}?year=…&type=…` → prebuilt static filter pages, with `noindex`.
The PDF proxy, contact API and alerts API are later Phase 4 work. Not deployed.

- Architecture, SEO behaviour and deployment steps: [`docs/WORKER.md`](../../docs/WORKER.md)
- `src/document-filters.ts` — pure routing decision; `src/index.ts` — the `fetch` handler
- `pnpm --filter @auburn/edge test` · `pnpm --filter @auburn/edge typecheck`
- Locally, `tests/static-server.mjs` runs this Worker in front of the built site (used by Playwright).
- No dependencies.
