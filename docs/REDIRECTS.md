# Redirects from the old site

Source of truth: `docs/SITEMAP.md` §9 (approved). Machine-readable copy: `redirects.csv` at the repository root.
Changing a row changes the approved redirect map, so it needs owner approval (CLAUDE.md §9.4).

## Format

```
from,to,status
/about-us,/company,301
```

- `from`: an exact old-site path, lowercase, no trailing slash, query string or wildcard.
- `to`: a page of the new site: lowercase, hyphenated, at most three levels, no trailing slash or query string.
- `status`: `301` only.

## Checks

`apps/site/src/lib/redirects.ts` (unit-tested in `redirects.test.ts`) and the `auburn:redirects` integration
(`apps/site/integrations/redirects.ts`), run at the end of every build:

| Problem | Every build |
| --- | --- |
| Malformed row, wrong header, non-301 status | fails |
| Duplicate source, self-redirect, chain (`a → b → c`), loop | fails |
| Source is a page of the new site (e.g. `/projects`, `/investors`, which exist on both sites) | fails |
| Target is not a page of this build | preview: fails · production: warning |

A production build warns rather than fails for a missing target because pages without approved content are withheld
until approved (D-019): today the five project pages. Those redirects still ship, so old links point at the final URL
from day one; until the page is approved they end on the 404 page. They are listed in the launch-readiness report.

The unit test also checks that `redirects.csv` holds exactly the approved rows of SITEMAP §9.

## Output

Each build writes `_redirects` (Cloudflare static-assets format, `source target 301`) into its output directory.
Cloudflare applies it before serving assets and never serves the file itself. `tests/static-server.mjs` emulates
this, and `tests/e2e/redirects.spec.ts` requests every row against all four builds: 301, `Location` equal to the
target, one hop, target served (200) or, in production only, not yet published (404).

## Pending (not in `redirects.csv`)

| Old URL | Waiting on |
| --- | --- |
| `/2021-entitlement-offer` | Company secretary: archive page or `/investors/announcements` (Q-23). The offer itself is HOLD content. |
| `/s/*.pdf` (old Squarespace files) | Re-hosting at `/documents/[slug].pdf` (PDF Worker, deferred Phase 4 item 8). Needs a per-file map, not a wildcard. |

Cloudflare matches `_redirects` sources exactly; `/about-us/` (trailing slash) is not covered. Whether to add
trailing-slash variants is a deployment-time check against real traffic, not a change to the approved map.
