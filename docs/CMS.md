# CMS — Sanity integration (Phase 5)

Decisions: D-024 (architecture), D-025 (source records), D-026 (review dates), D-027 (approval roles), D-028 (assets).
Open: Q-10 (plan), Q-45 (Studio hosting), Q-46 (approval roles), Q-47 (asset exposure).
**Nothing is created, imported or deployed**: no Sanity project exists yet.

## 1. Architecture

```
apps/studio  ── schema ──▶ sanity typegen ──▶ apps/site/src/lib/content/sanity/sanity.types.ts (committed)
                                                        │
Sanity dataset (private) ──▶ live.ts ─┐                 ▼
                                      ├─▶ perspective ─▶ map.ts ─▶ checks ─▶ ContentAdapter ─▶ pages
NDJSON snapshot ──────────▶ snapshot.ts┘   (published /   (types +   (fail     (unchanged
fixtures ──▶ export.ts ──▶ snapshot/*.ndjson  drafts)      provenance) closed)   boundary)
```

- `CONTENT_SOURCE=fixtures` (default): the typed fixtures, unchanged — the deterministic test source.
- `CONTENT_SOURCE=sanity`: the live dataset, read at build time with a token (Node only; nothing reaches the browser).
- `CONTENT_SOURCE=sanity-export`: the same Sanity mapping over an NDJSON file (`SANITY_EXPORT_PATH`), no credentials.

Templates never see Sanity. `Fact` / `isRenderable()` stay the final production gate.

## 2. Content types

Documents: `siteSettings` (singleton), `homePage`, `portfolioPage` (singletons), `person`, `documentRecord`
(documents and internal source records), `project`, `prospect`, `resourceEstimate`, `result`, `milestone`, `workItem`,
`figure`, `photo`, `article`, `page` (one per page key, ID `page-<key>`), `legalPage` (ID `legalPage-<key>`).

Objects: `factMeta` (source, as at, status, approved by/at, review by, note); fact objects `factString`, `factNumber`,
`factDate`, `factBoolean`, `factStringList`, `factAddress`, `factOwnership`, `factState`, `factStates`,
`factCommodities`, `factHolding`, `factStage`, `factOperator` (each: value · unit · qualifier · INPUT NEEDED brief ·
meta); `interpretation`; `narrative`; `figureSlot`; `photoSlot`; `keyFacts`; `projectSetting`; `pageSection`;
`legalClause`. Collections have an `order` field; records with a status also have `approvedBy` / `approvedAt`.

## 3. Status, provenance and approval

| In the CMS | Production build | Preview build |
| --- | --- | --- |
| Draft document (`drafts.*`) | never fetched, and dropped if present | shown over the published version |
| Published, status draft / to verify | mapped, **not rendered** (existing gate) | shown with status markers |
| Value without resolvable source + as-at date | INPUT NEEDED (hidden) | INPUT NEEDED ("provenance incomplete") |
| `approved`, complete and by a permitted approver | rendered | shown as verified |
| `approved` but approver missing, unknown, wrong kind, or no date | **build fails**; content downgraded | downgraded to to verify, reported |
| Approved narrative containing digits | **build fails**; downgraded | downgraded, reported |
| Held-back wording anywhere (even a draft) | **build fails** | **build fails** |
| Review-by date passed (D-026) | still rendered; warning in the build log | same |

Approver kinds: `corporate` (company secretary: company facts, documents, pages, most project facts) and `technical`
(competent person: geology, statements, targets, resources, results, work, maps, sections, neighbouring deposits). A
person may approve only the kinds listed in their `approverFor`.

**Launch-control limitation (D-027):** without Enterprise custom roles, Sanity cannot restrict who edits `approverFor`
or records an approval. The build detects incomplete and mis-attributed approvals, not a deliberate false attribution.
Studio validation (`apps/studio/validation/rules.ts`) guides editors but is not a security boundary.

## 4. Assets (D-028)

Figures and photos reference Sanity image assets; the adapter builds CDN URLs with `@sanity/image-url` at build time.
Standard Sanity asset URLs are **public to anyone who has the URL**, even for a private dataset; private assets need an
Enterprise Media Library add-on. **No real company asset is uploaded** until Q-47 is decided. PDFs stay unlinked until
the PDF Worker is approved. Indicative mockup graphics never enter Sanity.

## 5. Local development

- `pnpm dev` — fixtures, as before. No credentials needed.
- `CONTENT_SOURCE=sanity-export pnpm --filter @auburn/site dev` — the Sanity pipeline over the snapshot.
- `pnpm studio` — the Studio locally. Schema work, `pnpm typegen` and `pnpm --filter @auburn/studio build` run
  offline with the placeholder project ID; editing real content needs `SANITY_STUDIO_PROJECT_ID`,
  `SANITY_STUDIO_DATASET` and a Sanity login.
- After changing the schema: `pnpm typegen`, then commit `sanity.types.ts` (`pnpm typegen:check` in CI).
- After changing fixtures: `pnpm content:export` regenerates `snapshot/fixtures.ndjson` and `snapshot/hostile.ndjson`.

## 6. Migration (not run)

1. `snapshot/fixtures.ndjson` is the migration file: every status exactly as in the fixtures (never `approved`; the
   exporter refuses), INPUT NEEDED slots as briefs, no indicative graphics, no assets.
2. The round-trip test proves fixtures → NDJSON → mapper gives the fixtures back exactly.
3. When authorised: create the project and the private `staging` dataset, then
   `sanity dataset import apps/site/src/lib/content/sanity/snapshot/fixtures.ndjson staging`. `production` is seeded the
   same way only when approved. Approval then happens in the Studio, by the company secretary or competent person.

## 7. Environments and secrets

| Build | `CONTENT_SOURCE` | Dataset | Perspective | Secret |
| --- | --- | --- | --- | --- |
| CI, local | `fixtures`, `sanity-export` | — | — | none |
| Preview (behind Access) | `sanity` | `production` (or `staging`) | drafts | `SANITY_READ_TOKEN` (viewer) |
| Production | `sanity` | `production` | published | `SANITY_READ_TOKEN` (viewer) |

Datasets are private, so both builds need the viewer token (a build-time secret in CI/Cloudflare, never in the repo or
the browser). Webhook-triggered rebuilds (`SANITY_WEBHOOK_SECRET`) are deployment work and not built.

## 8. Studio hosting (Q-45, undecided)

- **Sanity-hosted** (`sanity deploy`, `*.sanity.studio`): no infrastructure; access is Sanity login + project membership.
- **Self-hosted on Cloudflare behind Access**: an extra identity gate in front of the Studio and one more deployment.
Either way, content access is governed by Sanity project membership and roles (see D-027).

## 9. Tests

- Studio: validation rules; the held-back list is the shared `@auburn/content-rules` list (D-029), not a copy.
- Site: `roundtrip.test.ts` (snapshot drift, exporter safety, exact round trip, nothing renderable in production),
  `hostile.test.ts` (forged, mis-attributed and incomplete approvals; digits; held-back wording; missing and dangling
  sources; malformed values; drafts; figures; overdue reviews; the hostile snapshot fails a production build),
  `loaders.test.ts` (perspectives, credentials, NDJSON).
- CI builds the site from the snapshot in both modes, runs every e2e/axe/integrity/link spec against those builds too,
  applies the leak guards to them, and checks the snapshot production build is byte-identical to the fixture build.
