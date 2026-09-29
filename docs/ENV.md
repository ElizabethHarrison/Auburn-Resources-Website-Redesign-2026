# Environment and configuration

What the site needs to build and run, per environment. **No secrets are stored in this repository.**
Secrets live in the hosting provider's secret store (Cloudflare) and GitHub Actions secrets.

Status: Phase 5. Build-time variables, including the Sanity ones (docs/CMS.md); no Sanity project exists yet. Hosting accounts are **not configured** —
production Cloudflare and GitHub ownership are pending (`docs/OPEN-QUESTIONS.md` Q-09).

## 1. Toolchain

| Tool | Version | Where it is pinned |
| --- | --- | --- |
| Node.js | 24 LTS (≥ 24.16.0, < 25) | `.nvmrc`, `package.json` `engines` (enforced by `engine-strict`) |
| pnpm | 10.33.0 | `package.json` `packageManager` (use Corepack: `corepack enable`) |

## 2. Build-time variables (in use)

Validated by Astro's env schema in `apps/site/astro.config.ts`; an invalid value fails the build.
Only `apps/site/src/lib/config.ts` reads them.

| Variable | Values | Default | Purpose |
| --- | --- | --- | --- |
| `CONTENT_MODE` | `production` \| `preview` | `production` | `production` renders Approved content only and hides empty modules. `preview` renders every status with status dots and INPUT NEEDED placeholders, adds a preview banner, and is `noindex` with `Disallow: /` in robots.txt (D-005). |
| `CONTENT_SOURCE` | `fixtures` \| `sanity` \| `sanity-export` | `fixtures` | Which content adapter to use (D-003, D-024): typed fixtures; the live Sanity dataset (needs the variables below); or the Sanity mapping over an NDJSON snapshot (no credentials). |
| `SANITY_PROJECT_ID` | Sanity project ID | — | Required for `sanity`; also enables image-CDN URLs. |
| `SANITY_DATASET` | `production` \| `staging` | — | Private datasets only (D-024 §7). |
| `SANITY_API_VERSION` | date | `2026-09-29` | Pinned Content Lake API version. |
| `SANITY_READ_TOKEN` | **secret** | — | Viewer token, build-time only (Astro `secret` env; never sent to the browser). Required for `sanity`. |
| `SANITY_EXPORT_PATH` | path | `src/lib/content/sanity/snapshot/fixtures.ndjson` | NDJSON file for `sanity-export`, relative to `apps/site`. |
| `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` | Studio only | `placeholder`, `staging` | Local Studio (`pnpm studio`); the placeholder lets schema work, typegen and `sanity build` run offline. |
| `SITE_URL` | absolute URL | `https://auburnresources.com.au` | Origin for canonical URLs, sitemap and Open Graph. Read from the process environment only (not `.env`), because Astro needs it before loading env files. |

The package scripts set `CONTENT_MODE` for you: `pnpm dev` and `pnpm build:preview` use `preview`;
`pnpm dev:production` (in `apps/site`) and `pnpm build` use `production`. For other local overrides, copy
`apps/site/.env.example` to `apps/site/.env` (git-ignored).

The default is `production` on purpose: if the variable is missing, nothing unapproved can render.

## 3. Planned variables (not yet in use)

Documented now so the shape is agreed. Names may change when each integration is built; update this table
at the same time. **Secret** values go only in Cloudflare / GitHub secret stores, never in `.env` files
that are committed.

| Variable | Secret | Phase | Used by | Purpose |
| --- | --- | --- | --- | --- |
| `SANITY_WEBHOOK_SECRET` | **yes** | 5 | worker / CI | Verifies CMS publish webhooks that trigger rebuilds |
| `TURNSTILE_SITE_KEY` | no | 4 | site | Bot protection widget on forms |
| `TURNSTILE_SECRET_KEY` | **yes** | 4 | worker | Verifies Turnstile tokens |
| `POSTMARK_SERVER_TOKEN` | **yes** | 4 | worker | Sends enquiry emails |
| `CONTACT_ROUTES` | no | 4 | worker | Enquiry type → inbox mapping (addresses to be supplied by the company) |
| `ESP_API_KEY` | **yes** | 4 | worker | Email alerts provider (platform undecided, Q-11) |
| `ESP_LIST_ID` | no | 4 | worker | Alerts list |
| `PLAUSIBLE_DOMAIN` or `CF_ANALYTICS_TOKEN` | no | 6 | site | Cookie-free analytics (provider undecided) |

## 4. Environments (planned — not configured)

| Environment | Build | Content | Access | Hosting |
| --- | --- | --- | --- | --- |
| Local | `pnpm dev` | fixtures (later: staging dataset) | developer | — |
| PR preview | `pnpm build:preview` | fixtures / staging dataset | Cloudflare Access | `[INPUT NEEDED: Cloudflare account — Q-09]` |
| Staging | `pnpm build` + `pnpm build:preview` | staging dataset | Cloudflare Access | `[INPUT NEEDED: Cloudflare account — Q-09]` |
| Production | `pnpm build` | production dataset, Approved only | public | `[INPUT NEEDED: Cloudflare account and DNS — Q-09]` |

Still to decide or supply (Q-09): the Cloudflare account and project names, the GitHub organisation
that owns the repository and its Actions secrets, who holds admin access, and the DNS cut-over plan.
Nothing in this repository deploys yet: CI only lints, typechecks, tests and builds.

The edge Worker (`workers/edge`, D-023) needs **no variables or secrets** for document-filter routing. Its
deployment configuration (`workers/edge/wrangler.jsonc`) commits no account ID or routes; see `docs/WORKER.md` §8.

## 5. CI (GitHub Actions)

`.github/workflows/ci.yml` runs on pull requests and on pushes to `main`. It needs **no secrets** at this
stage. It sets `ASTRO_TELEMETRY_DISABLED=1`.
