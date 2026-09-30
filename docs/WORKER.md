# Edge Worker — document-filter routing (D-023)

Scope, **strictly**: query-string routing for the three investor document listings. The broader edge Worker
(PDF proxy at `/documents/*.pdf`, `/api/contact`, `/api/alerts`) is **not** built (WEBSITE-STRATEGY §7, Phase 4
item 8). Nothing here is deployed.

## 1. Why a Worker

The site is static. A static host serves the same file for `/investors/reports` and
`/investors/reports?year=2022`, so without JavaScript the page cannot show filtered results, and one file cannot be
both indexable and `noindex`. The Worker reads the query string at the edge and serves a prebuilt filtered page
instead (Q-44, option A). The browser receives plain HTML: **no client JavaScript** is involved in filtering.

## 2. Query-string format

| Listing | Parameters |
| --- | --- |
| `/investors/announcements` | `year` |
| `/investors/presentations` | `year` |
| `/investors/reports` | `year`, `type` |

- `year`: four digits, e.g. `2022`.
- `type` (reports only): one of `annual`, `half-year`, `quarterly`, `notice` — the report document types
  (`annual`, `halfYear`, `quarterly`, `notice`) written as URL slugs.
- An empty value (`?year=`, which the form sends for "All years") means "not filtering on this".
- Other parameters (e.g. `utm_source`) are ignored: they never select, build or change content.

Examples: `/investors/announcements?year=2021`, `/investors/reports?type=quarterly`,
`/investors/reports?year=2022&type=annual`.

## 3. Generated filter pages (Astro, static)

For each listing, the build generates one page per **valid filter state** of the documents *listable in that
build* (`isDocumentListable`; production: approved record, date and file only):

- each year present, each report type present, and (reports) every year × type pair of those values — so any
  combination the form can submit has a page; a pair with no documents shows the empty state;
- one `unavailable` page per listing, for filters that are malformed or not in the dataset.

They live at `/filtered/<listing>/<state>` (`src/pages/filtered/[listing]/[state].astro`), where `<state>` is
`year-2022`, `type-quarterly`, `year-2022-type-quarterly` or `unavailable`. They reuse the listing template
(`DocumentListingBody`, `DocumentRegister`, `DocumentLibrary`) with the filter applied; they are `noindex`,
canonicalise to the unfiltered listing, are excluded from the XML sitemap, disallowed in `robots.txt` and linked
from nowhere. Visitors never see these paths: the Worker serves them at the query-string URL.

With today's fixtures the preview build generates 1 announcements state (2021), 0 presentations states (the only
presentation is undated), 11 reports states (2 years, 3 types, 6 pairs) plus 3 `unavailable` pages; the
production build generates only the 3 `unavailable` pages, because no document is approved.

## 4. Request / response flow (`workers/edge/src/index.ts`)

```
request ──▶ decide(url)                           (pure; workers/edge/src/document-filters.ts)
  │
  ├─ path is not a listing or /filtered/…  ─────▶ ASSETS (static file, unchanged)
  ├─ path starts with /filtered/               ─▶ 404 page, status 404, X-Robots-Tag: noindex
  ├─ listing, no query string                  ─▶ ASSETS (the canonical, indexable page)
  ├─ listing, query but no filter value         ─▶ ASSETS unfiltered page, X-Robots-Tag: noindex
  ├─ listing, malformed filter                  ─▶ /filtered/<listing>/unavailable, status 400, noindex
  │    (bad year, unknown type, repeated key, type on a year-only listing)
  └─ listing, well-formed filter ─▶ ASSETS /filtered/<listing>/<state>
         ├─ exists  ─▶ 200, X-Robots-Tag: noindex
         └─ missing ─▶ /filtered/<listing>/unavailable, status 404, noindex   (e.g. a year with no documents)
```

- **No arbitrary paths:** the asset path is built only from a fixed listing key and values that passed strict
  validation (`^\d{4}$`, a fixed type list); the result must also exist in the build. Query values are never echoed
  into responses.
- **No redirects** of any kind, so no open-redirect surface.
- Only `GET` and `HEAD` are routed; other methods go to the static assets unchanged.
- `noindex` is sent twice: the `X-Robots-Tag` response header and the page's `<meta name="robots">`.

## 5. Canonical and indexing

| URL | Indexable | Canonical | In sitemap |
| --- | --- | --- | --- |
| `/investors/announcements` (and reports, presentations) | yes | itself | yes |
| any listing URL with a query string | no (`X-Robots-Tag` + meta) | the unfiltered listing | no |
| `/filtered/…` (internal) | never served directly (404) | the unfiltered listing | no |

The filter form uses `method="get"`, so crawlers do not follow it, and no link on the site points to a filtered URL.

## 6. Preview and production

One Worker, one architecture. Each build generates its own filter pages from its own visible documents, so the
Worker's result follows the existing content rules automatically: in production a year appears only if an approved
document has it; `?year=2021` currently returns the `unavailable` page (404) in production and the 2021 register
(200) in preview. The preview deployment (behind Cloudflare Access, D-005) runs the same script against the preview
build's assets.

## 7. Local development and tests

- `tests/static-server.mjs` runs the real Worker (`workers/edge/src/index.ts`, loaded by Node 24's built-in type
  stripping) with a local `ASSETS` stand-in that serves the build directory the way Cloudflare static assets do.
  `pnpm serve:production`, `pnpm serve:preview` and Playwright therefore exercise the same routing code as the edge.
- `workers/edge` has its own unit tests (`pnpm --filter @auburn/edge test`), run by `pnpm test`.
- No `wrangler` is installed; the Worker has no dependencies.

## 8. Deployment (later — not done)

Requires owner approval of the Cloudflare account (Q-09) and a deploy runbook. When approved:

1. Add `wrangler` as a dev dependency of `workers/edge` (build-time only; ask first per CLAUDE.md §4.5).
2. `workers/edge/wrangler.jsonc` (committed, not used yet) declares the Worker with static assets:
   `assets.directory` = the site build (`../../apps/site/dist`, or `dist-preview` for the preview environment),
   `assets.binding` = `ASSETS`, `assets.not_found_handling` = `404-page`, `assets.html_handling` =
   `drop-trailing-slash`, and `assets.run_worker_first` = the three listing paths and `/filtered/*`, so only
   those requests run the Worker (everything else is served from static assets without invoking it).
   The build output also contains `_redirects` (old-site redirects, docs/REDIRECTS.md), which static assets apply
   without invoking the Worker.
3. Environments: `production` (auburnresources.com.au) and `preview` (behind Cloudflare Access; `noindex` already
   built in). Custom domain / routes and the account ID are set at deploy time, not committed (no secrets needed
   for this Worker).
4. CI: build both sites, then `wrangler deploy --env <name>` from `workers/edge` on the protected branch only.
5. After deploy, re-run the filter e2e suite against the deployed preview URL.
