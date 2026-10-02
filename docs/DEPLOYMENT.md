# Deployment

Status: **repository side ready, 2 Oct 2026 (D-034). Nothing has been deployed.** No Cloudflare Worker, Sanity
project, secret or DNS record exists yet; the current auburnresources.com.au (Squarespace) is untouched. Do not publish
the production build until content is approved (D-019; `docs/LAUNCH-GATE.md`): today it is title-only by design.

## 0. Temporary launch configuration (D-035)

The owner has approved a **temporary single-operator setup** to get the infrastructure running. It departs from this
document where marked; nothing about the content rules or the safety checks changes.

| Setting | This document | Temporary value |
| --- | --- | --- |
| Cloudflare account owner (login email) | a company-controlled address | `eharrison@dgrglobal.com.au` — **departs** (a DGR Global mailbox, not an Auburn one; move to an Auburn-controlled address before launch) |
| Cloudflare administrators | **at least two** (§3) | Elizabeth Harrison only — **departs** |
| workers.dev subdomain | the account's choice (§3.1) | `auburnresources` (if available) → preview `https://auburn-edge-preview.auburnresources.workers.dev` |
| Zero Trust team | — | `auburnresources` (→ `auburnresources.cloudflareaccess.com`) |
| Preview Access allow-list | named reviewers (§3.3) | `eharrison@dgrglobal.com.au` only (Elizabeth Harrison) |
| Sanity plan / Studio | Growth; Q-45 | Growth; Sanity-hosted (`*.sanity.studio`) |
| Sanity members | owner/developer Administrator; company secretary and competent person Editor (§4.1) | Elizabeth Harrison only, Administrator (also edits content) — **departs** |
| Approver person records | company secretary: corporate; competent person: technical | one record, Elizabeth Harrison, `approverFor: corporate, technical` — **departs** |
| Preview dataset | `staging` or `production` | `staging` |

Safeguards that still hold: approvals need a source, as-at date, approver of the right kind and date (fail-closed);
publishing is not approval; nothing is approved in code; nothing is backdated; the production dataset stays separate
from staging; the preview is behind Access before any site content reaches it; production is not deployed or routed.
The approver's person record has no approved *role*, so it never appears on the public Leadership page (it does in
the Access-protected preview).

**Before the public launch, end this configuration:** move the Cloudflare account login to an Auburn-controlled address and add a second administrator; give the company
secretary and the competent person their own Sanity seats and person records; reduce the temporary record's
`approverFor` to what its holder actually holds; have the proper approvers re-confirm every approval recorded under
this arrangement (the launch-readiness report's approval audit lists them); update this section and D-035.

## 1. The five stages

They are separate steps with separate owners; none happens as a side effect of another.

| Stage | What happens | Who | Public? | Where |
| --- | --- | --- | --- | --- |
| **Local development** | `pnpm dev` / builds from fixtures; no accounts or secrets | developer | no | §5.1 |
| **Preview deployment** | Deploy workflow, target `preview`: Sanity drafts + placeholders → Worker `auburn-edge-preview`, behind Cloudflare Access, `noindex` | developer (on request) | **no** — Access + noindex | §5.2 |
| **Sanity content approval** | Company secretary (corporate) and competent person (technical) approve facts in the Studio. Approval is a status on the record, never set in code | approvers | no | §4.2 |
| **Production deployment** | Deploy workflow, target `production`, from `main`: Sanity published + approved only → Worker `auburn-edge` | developer, with a required reviewer | **no** until cutover — the Worker has no route | §5.3 |
| **DNS cutover** | Attach auburnresources.com.au (and www) to the production Worker; preserve email records | owner + registrar access | **yes** | §6 |

```
local:      fixtures ─▶ pnpm build / build:preview ─▶ tests/static-server.mjs (emulates Cloudflare)
preview:    Sanity (drafts) ─▶ Deploy workflow ─▶ auburn-edge-preview ─▶ *.workers.dev or preview.<domain>, behind Access
production: Sanity (published, approved only) ─▶ Deploy workflow (main) ─▶ auburn-edge ─▶ no route … until §6
cutover:    auburnresources.com.au ─▶ auburn-edge (custom domain), www ─▶ apex
```

What is in the repository: `workers/edge/wrangler.jsonc` (both Workers; no account ID, routes or domains),
`.github/workflows/deploy.yml` (manual only), `scripts/check-deploy-env.mjs` and `scripts/check-preview-access.mjs`
(fail-closed pre-flight), `tests/e2e/deployment-config.spec.ts` (keeps all of the above honest).

## 2. Settings: GitHub Environments

Create two **GitHub Environments** (repository → Settings → Environments): `preview` and `production`. Every value
below is set there, per environment; none is committed. The workflow refuses to start if any is missing (§7).

| Name | Kind | `preview` | `production` | Notes |
| --- | --- | --- | --- | --- |
| `SANITY_READ_TOKEN` | **secret** | Viewer token | Viewer token | build-time only; never reaches the browser (`docs/CMS.md` §7). Use a separate token per environment |
| `CLOUDFLARE_API_TOKEN` | **secret** | deploy token | deploy token | §3.2; may be the same token |
| `CLOUDFLARE_ACCOUNT_ID` | **secret** | account ID | account ID | not sensitive, kept as a secret so it stays out of logs and forks |
| `SANITY_PROJECT_ID` | variable | project ID | project ID | |
| `SANITY_DATASET` | variable | `staging` or `production` | **`production`** (enforced) | preview reads drafts from it |
| `SITE_URL` | variable | the preview URL | `https://auburnresources.com.au` | canonical URLs, sitemap, Open Graph. Production may not be a workers.dev address |
| `PREVIEW_URL` | variable | the preview hostname, `https://…` | — | checked for Access before and after each preview deploy |

Environment protection (Settings → Environments → each):

- `production`: **Required reviewers** (the owner); **Deployment branches**: `main` only.
- `preview`: Deployment branches: `main` (add others only if needed for review).

`CONTENT_SOURCE=sanity` and `CONTENT_MODE` are set by the workflow and build scripts, not by you. Later integrations
(webhook, forms, analytics) add the variables listed as planned in `docs/ENV.md` §3.

## 3. Cloudflare setup (outside the repository)

Account owner (Q-09): a Cloudflare account the company controls, with at least two admins.

### 3.1 Workers subdomain

Workers & Pages → set the account's **workers.dev subdomain** (e.g. `auburn`). Only the preview Worker uses it; the
production Worker has `workers_dev: false`.

### 3.2 API token for the workflow

My Profile → API Tokens → Create custom token:
- Permissions: **Account → Workers Scripts → Edit** (nothing else; routes and domains are not managed by the token).
- Account resources: this account only.
- Store it as `CLOUDFLARE_API_TOKEN` in both GitHub Environments; store the account ID as `CLOUDFLARE_ACCOUNT_ID`.
If a deploy reports a missing permission, add only that permission.

### 3.3 Protect the preview **before any site content reaches it**

Access for a workers.dev hostname is switched on from the Worker's own settings, so the Worker must exist first:

1. Workers & Pages → Create → **Hello World** Worker named exactly **`auburn-edge-preview`** (placeholder; contains
   nothing of the site).
2. That Worker → Settings → Domains & Routes → `workers.dev` → **enable Cloudflare Access**. Edit the generated Access
   application (Zero Trust → Access → Applications): allow only named emails (owner, developer, reviewers).
3. Confirm in a private window that `https://auburn-edge-preview.<subdomain>.workers.dev` shows the Access login.
4. Set `PREVIEW_URL` (and `SITE_URL`) in the `preview` GitHub Environment to that URL.

Only now run the preview deploy (§5.2); its first step re-checks Access and stops if the hostname answers publicly.
Per-version preview URLs are disabled in `wrangler.jsonc` (`preview_urls: false`), so no other hostname exists.

Later, once the zone is on Cloudflare (§6.1), a custom preview hostname (e.g. `preview.auburnresources.com.au`) may
replace workers.dev: add it to the Access application first, then as the Worker's custom domain, then update
`PREVIEW_URL`/`SITE_URL`.

### 3.4 Production Worker

Nothing to do before the first production deploy: the workflow creates `auburn-edge` with no route and no workers.dev
address, so it serves nothing. Its custom domains are attached only at cutover (§6.3).

## 4. Sanity (outside the repository) and content approval

### 4.1 Setup

Decisions first (`docs/LAUNCH-GATE.md` B-2, B-3, B-5): plan (**Growth** for private datasets; never import real
content during a trial that could lapse), approval roles, Studio hosting (Q-45).

1. Create the project (sanity.io/manage). Note the project ID.
2. Datasets, both **private**: `sanity dataset create staging --visibility private` and
   `sanity dataset create production --visibility private` (from `apps/studio`, logged in).
3. Members: owner and developer (Administrator/Developer), company secretary and competent person (Editor) — the
   people records that approve must match them (D-027).
4. API → CORS origins: the Studio's host only.
5. API → Tokens: one **Viewer** token per GitHub Environment → `SANITY_READ_TOKEN`.
6. Seed staging only: `sanity dataset import apps/site/src/lib/content/sanity/snapshot/fixtures.ndjson staging`
   (every status as in the fixtures; nothing approved). Seed `production` the same way only when the owner decides.
7. Studio: `pnpm studio` locally with `SANITY_STUDIO_PROJECT_ID`/`SANITY_STUDIO_DATASET`; host it per Q-45.

### 4.2 Content approval

- Content is entered and published in the Studio. **Publishing is not approval**: a fact renders in production only
  when its status is `approved` with a source, as-at date, approver of the right kind and date (fail-closed mapper,
  `docs/CMS.md`). Nothing in the repository, workflow or scripts ever sets `approved`.
- Corporate facts: the company secretary. Technical facts and CP statements: the competent person. Legal pages: text
  supplied by the company's adviser.
- After approvals, run the Deploy workflow again (no webhook yet: `docs/LAUNCH-GATE.md` A-8, C-5). The run's
  `launch-readiness-<target>` artifact lists what is still hidden and why.

## 5. Deploying

### 5.1 Local development (no accounts)

```
pnpm install
pnpm dev                 # preview mode, fixtures, placeholders visible
pnpm build && pnpm build:preview
pnpm serve:production    # dist on :4600, behind the real Worker, as Cloudflare routes it
pnpm serve:preview       # dist-preview on :4601 (preview Worker settings: noindex everywhere)
pnpm check               # everything CI runs
```
`tests/static-server.mjs` reads `wrangler.jsonc`: only `run_worker_first` paths reach the Worker, `_redirects` and
`_headers` apply to static responses only, and the Worker gets the environment's `vars` — as on Cloudflare.

### 5.2 Preview deployment

Prerequisites: §2 `preview` environment complete; §3.3 done; §4.1 done.

GitHub → Actions → **Deploy** → Run workflow → branch `main` (or the branch under review) → target `preview`.

The run: pre-flight (all settings present, `CONTENT_SOURCE=sanity`) → Access check on `PREVIEW_URL` → install,
unit tests → `pnpm build:preview` (drafts perspective) → asserts the build read Sanity → preview guards (robots
`Disallow: /`, `noindex` on every page, `X-Robots-Tag` in `_headers`) → readiness artifact →
`wrangler deploy --env=preview` → Access check again.

### 5.3 Production deployment

Prerequisites: §2 `production` environment complete (with a required reviewer); approved content (§4.2); the minimum
launch set agreed (B-1).

GitHub → Actions → **Deploy** → Run workflow → branch **`main`** → target `production` → reviewer approves.

The run: pre-flight (also: branch is `main`, dataset is `production`) → install, unit tests → `pnpm build`
(published perspective, approved content only) → asserts the build read Sanity → production leak guards (no
placeholders, preview markers, catalogue or indicative artwork; robots allows; JS budget) → readiness artifact →
`wrangler deploy` (top-level `auburn-edge`). Until cutover the Worker has no route, so this changes nothing public.

**Checking production before cutover:** the production Worker deliberately has no public hostname. Either attach a
temporary custom hostname behind Access once the zone is on Cloudflare (§6.1; e.g. `next.auburnresources.com.au`,
Access application first, then custom domain), or run the same build locally (`CONTENT_SOURCE=sanity` with the
Viewer token in your shell, `pnpm build && pnpm serve:production`).

## 6. DNS cutover (outside the repository; the live site keeps running until §6.3)

Owner + registrar login (Q-09). Find out first whether the domain is registered through Squarespace.

### 6.1 Move DNS to Cloudflare without changing what it points to

1. Before anything: download every old-site file (`docs/LAUNCH-GATE.md` A-7) and record the current DNS records
   (A/CNAME for apex and www, **MX, SPF (TXT), DKIM, DMARC**, verification TXT).
2. Cloudflare → Add site `auburnresources.com.au` → review the imported records against the list; add anything
   missing. Records for the existing website stay pointed at Squarespace (DNS only is fine).
3. Lower TTLs at the current provider a day ahead; then change the nameservers at the registrar to Cloudflare's.
4. Verify: the old site still loads; **email still sends and receives** (E-9); SPF/DKIM/DMARC pass.

Nothing about the website changes in this step.

### 6.2 Rehearse on the real network

Optional but recommended: attach `next.auburnresources.com.au` to the production Worker behind Access (§5.3) and
run `docs/LAUNCH-GATE.md` E-1 to E-8 against it.

### 6.3 Cutover

1. Production Worker `auburn-edge` → Settings → Domains & Routes → **Add custom domain** `auburnresources.com.au`
   (Cloudflare replaces the apex record pointing at Squarespace). Then `www.auburnresources.com.au` with a redirect
   rule www → apex (301), per B-12.
2. Verify immediately: home and a few pages 200; `robots.txt` allows and lists the sitemap; no `X-Robots-Tag`; a
   handful of old URLs 301 in one hop; security headers present (E-3, E-4, E-5).
3. Remove any temporary `next.` hostname. Keep Squarespace live (unlinked) until the checks pass and files are saved.
4. Search Console: verify the domain, submit `/sitemap-index.xml` (C-8, E-10).

**Undo:** remove the custom domain from the Worker and restore the apex/www records to Squarespace's values from
§6.1 step 1 (the old site keeps working until its subscription ends).

## 7. Safety: what fails closed, and where it is tested

| Guard | Where | Test |
| --- | --- | --- |
| Missing secret or variable → workflow stops before building; names printed, never values | `scripts/check-deploy-env.mjs` | `deployment-config.spec.ts` |
| `CONTENT_SOURCE` anything but `sanity` → stops | same | same |
| Build with `CONTENT_SOURCE=sanity` but no credentials → build fails (no fallback to fixtures) | `apps/site/src/lib/content/sanity/live.ts` | same |
| Build output must report `contentSource: sanity` before deploying | workflow step | same (presence) |
| Production only from `main`, only from the `production` dataset | `check-deploy-env.mjs` + Environment rules | same |
| Preview hostname must answer with Access (401/403 or Access login) before and after deploy | `scripts/check-preview-access.mjs` | same |
| Every Worker response is `noindex` unless `SITE_INDEXABLE` is exactly `"true"` (production only); preview listing pages included | `workers/edge/src/index.ts`, `wrangler.jsonc` | `workers/edge/src/index.test.ts`, `document-filters.spec.ts`, `security-headers.spec.ts` |
| Production has no workers.dev address, no preview URLs, no committed routes or account | `wrangler.jsonc` | `deployment-config.spec.ts` |
| Preview build: robots `Disallow: /`, `noindex` meta on every page, `X-Robots-Tag` in `_headers` | build + workflow guard | CI guard, `security-headers.spec.ts` |
| Production build: no placeholders, preview markers, catalogue, indicative artwork or readiness data | workflow guard (same as CI) | CI, `content-integrity.spec.ts` |
| Deploys never run on push, merge or schedule | `deploy.yml` (`workflow_dispatch` only) | `deployment-config.spec.ts` |
