# Phase 6 — launch hardening (repository side)

Status: **steps 6.0–6.4 implemented, awaiting review** (30 Sep 2026); see §5. Based on an inspection of the repository at
`8dcfdf6` (tip of `claude/phase-5-cms`), the decision log, open questions, CLAUDE.md and git history, plus a full
`pnpm check` baseline: all green (unit tests: site 180, studio 5, edge 21; e2e: 794 passed, 122 skipped by design).

## 1. Where the project is

- Phases 0–4 (items 1–2) are merged to `main` (`0e48c5f`). **Phase 5 (CMS) is pushed but not merged**:
  `claude/phase-5-cms`, four commits on top of `main`. Phase 6 is stacked on it (branch `claude/gifted-clarke-758lqy`).
- `docs/WEBSITE-STRATEGY.md` §7 lists build phases 5 "SEO & redirects" and 6 "Hardening" (accessibility and performance
  passes, security headers, monitoring). The repository's own phase numbering moved the CMS to Phase 5, so this Phase 6
  takes up the repository-side parts of both, as the strategy intended.
- There are no TODO/FIXME markers in the code. Remaining work is recorded in docs, or found by this inspection (§3).

## 2. What stands between now and a production launch

### 2.1 Launch blockers — need people, accounts or approvals (not code)

| Blocker | Owner | Ref |
| --- | --- | --- |
| Approved facts for every page (currently **no** fact is approved; production shows title blocks only, D-019) | Company secretary, CP | Q-20–Q-22, Q-28, Q-30 |
| Verified project list (drives menus, cards, redirects to project pages) | Company secretary | Q-20 |
| Legal text: disclaimer, privacy, terms, CP statement, acknowledgement of Country | Company, CP | Q-24, Q-26, Q-30 |
| Governance documents, reports, presentations (files + approval) | Company secretary | Q-25, Q-27 |
| Tenement GIS + CP-approved cross-section (or accept those modules hidden) | CP | Q-31, Q-33 |
| `/2021-entitlement-offer` target; old `/s/*.pdf` files re-hosted | Company secretary | Q-23, PDF Worker |
| Sanity plan, approval roles, asset exposure, Studio hosting | Project owner | Q-10, Q-46, Q-47, Q-45 |
| Cloudflare/GitHub accounts, deploy approval, DNS cut-over | Project owner | Q-09 |
| Deferred Phase 4 items needed at launch: forms (contact, alerts: Q-11 ESP), Pagefind, PDF Worker | Project owner | Phase 4 items 3–8 |
| Manual VoiceOver + NVDA pass; Lighthouse ≥ 95 measured on the real host | Web team | CLAUDE.md §6, §8 |

### 2.2 Launch blockers that are code and need no decision — **Phase 6 scope**

| Gap (required by) | Today |
| --- | --- |
| `redirects.csv` + CI rejecting self-redirects, chains and loops (CLAUDE.md §4.5, §7; SITEMAP §9) | missing |
| Security headers: CSP, HSTS, `nosniff`, `frame-ancestors`, referrer and permissions policies (STRATEGY §7.6) | missing |
| Content-readiness report before launch (D-019) and review-date report (D-026: "build log **and content report**") | build log only |
| Phase 5 caveat: studio test imports a file from `apps/site` (cross-package) | present |
| Phase 5 caveat: commit `59d29a6` alone does not pass its studio test (files arrive in `1fe3e1d`) | documented here |
| CLAUDE.md "Current state" is stale (D-023 shown as awaiting review) | stale |

### 2.3 Important but not blocking this phase (need a decision or a dependency first)

- **OG images** ("auto OG image", CLAUDE.md §7): `og:image`/`twitter:image` are absent. Generating images needs a new
  build dependency (e.g. satori + resvg, or sharp) and a brand decision (Q-40 logo) → **Q-49**.
- **Lighthouse CI budgets** (CLAUDE.md §8): needs `@lhci/cli` (a new dev dependency) → **Q-50**.
- **Staging CI against a live Sanity dataset**: needs a project, dataset and read token (Q-10, Q-09) → documented, not
  built.
- **Publish webhooks / rebuilds**: needs a deploy target and a webhook secret → documented in `docs/CMS.md` §7, not built.
- **Monitoring**: analytics choice (Plausible or Cloudflare Web Analytics), uptime and Worker error alerts → **Q-51**.
- **Approval audit report** for the D-027 limitation (who approved what, when): useful on a non-Enterprise plan; its
  form depends on Q-46. The readiness report in this phase lists approver and date per approved fact, which is its
  starting point.

### 2.4 Optional / future

Q-05 sheet renumbering, Q-08 stale-presentation CTA, Q-12 font licence, Q-34/Q-35 wording, Q-41 photography, Q-42
office map, visual-regression snapshots, Pagefind/map/lightbox/navigation panels (deferred Phase 4 items).

## 3. Phase 5 caveats — findings

| Caveat | Finding | Phase 6 action |
| --- | --- | --- |
| Sanity plan / roles | Custom roles are Enterprise-only (D-027). Build-time validation already fails closed on incomplete or mis-attributed approvals; a deliberate false attribution is not detectable. | None in code. Decision Q-10/Q-46. Readiness report lists approver + date per approved item. |
| Asset privacy | Standard asset URLs are public by URL (D-028). No real assets uploaded. | None. Decision Q-47. |
| Studio hosting | Undecided; local only. | None. Decision Q-45. |
| Staging CI | Needs dataset + token. | Documented only (§2.3). |
| Read-token configuration | `SANITY_READ_TOKEN` is a secret read only via `getSecret` in `lib/config.ts`; never in the client bundle (leak guards). | None; the CSP (step 6.3) adds a further `connect-src 'none'` barrier. |
| Webhooks | Not built. | Documented only. |
| Cross-package test import | `apps/studio/validation/rules.test.ts` imports `../../site/src/lib/content/held-back`, and the list exists twice. | **Step 6.1**: one shared workspace package. |
| Commit buildability | `59d29a6` lacks `held-back.ts` and `sanity.types.ts`; the branch tip is fine. History on a pushed branch is not rewritten. | Recommend **squash-merging** the Phase 5 PR (or accept and note it) → **Q-52**. |

## 4. Recommended Phase 6

**Objective:** make the repository launch-hardened: redirects, security headers and a launch-readiness report,
built and tested exactly as they will run at the edge, plus the Phase 5 clean-ups. No accounts, no deployment,
no content decisions.

**Steps** (each a separate commit, tests with each):

- **6.0** This plan; CLAUDE.md status corrected; new questions Q-48–Q-52.
- **6.1** `packages/content-rules` (**D-029, Proposed**): the single held-back list, imported by the site and the Studio; the cross-package
  test import removed; a test proves both consumers use the same list.
- **6.2** `redirects.csv` from the approved SITEMAP §9 table (pending rows excluded and listed), a validator
  (format, lowercase, duplicates, self-redirects, chains, loops, source shadowing a real page, target must be a real
  route), generation of Cloudflare's `_redirects` into both builds, the local server honouring it, unit and e2e tests,
  CI step.
- **6.3** Security headers (**D-030, Proposed**): a strict Content Security Policy from Astro's built-in
  `security.csp` (already in the approved stack; no dependency), which hashes every inline script and style in each
  page into a `<meta>` CSP (no `unsafe-inline`/`unsafe-eval`); and the page-independent HTTP headers (HSTS,
  `nosniff`, `frame-ancestors 'none'` via `X-Frame-Options`/CSP header, referrer and permissions policies; preview
  also `X-Robots-Tag: noindex`) in a generated `_headers` file for static assets **and** added by the Worker to the
  responses it produces itself. The local server applies both; e2e tests assert the headers and that no page
  reports a CSP violation (the mobile menu still works).
- **6.4** Launch-readiness report (D-019, D-026): generated from the content adapter in CI, listing per route what
  production hides and why (unapproved, INPUT NEEDED, missing provenance), overdue reviews, approved items with
  approver and date, and redirect targets that do not exist in production yet. Uploaded as a CI artifact; never
  deployed.

**Explicitly not in Phase 6:** creating a Sanity project/dataset, importing content, uploading assets, deploying the
Studio or Worker, DNS, secrets, CI secrets; approving or changing any fact status; drafting legal/CP text; the
deferred Phase 4 items (Pagefind, forms, map, lightbox, navigation panels, PDF Worker); OG image generation and
Lighthouse CI (need dependencies: Q-49, Q-50); changing URLs, the redirect map, tokens, design or module order;
weakening any safeguard or test.

**Prerequisites / decisions for the owner:** none to start. To finish launch: Q-48 (review D-030 header policy, HSTS
scope), Q-49, Q-50, Q-51, Q-52, plus the launch blockers in §2.1.

**Files and systems that change:** `docs/` (this plan, DECISIONS D-029/D-030, OPEN-QUESTIONS, CMS, WORKER, new
`docs/LAUNCH.md` sections as steps land), `CLAUDE.md`; `pnpm-workspace.yaml` (+`packages/*`), `packages/content-rules`;
`apps/site/src/lib/content/held-back.ts`, `apps/studio/validation/*`; `redirects.csv`, `scripts/*.mjs` (+ tests);
`tests/static-server.mjs`, new e2e specs; root `package.json` scripts; `.github/workflows/ci.yml`. No external system.

**Acceptance criteria**
- `pnpm check` green; no existing test removed or weakened; fixture, hostile and round-trip suites unchanged.
- `dist` and `dist-sanity` still byte-identical (the `_redirects`/`_headers` files are generated identically).
- Every approved SITEMAP §9 row is in `redirects.csv`; pending rows are absent and listed; the validator fails on a
  seeded self-redirect, chain, loop, duplicate or bad target (unit-tested); e2e confirms each redirect returns 301 to
  its target on the local edge server.
- Every HTML page carries the CSP `<meta>` and every response the security headers (static and Worker-produced); no
  CSP violation on any page; the mobile menu works under the CSP; the CSP contains no `unsafe-inline`/`unsafe-eval`.
- The readiness report is produced in CI, lists every sitemap route, and marks every route that production renders
  with no approved content.

**Tests and checks:** `pnpm lint`, `pnpm typecheck`, `pnpm test` (site, studio, edge, content-rules, scripts),
`pnpm typegen:check`, all four builds, `pnpm budget`, `pnpm test:e2e` (four projects), CI guards.

**Risks and assumptions**
- Cloudflare Workers static assets honour `_redirects` and `_headers` (documented for Workers static assets); the
  local server emulates the subset used. If the real host differs, the files move into the Worker; the tests stay.
- `_headers` may not apply to responses the Worker produces (filter routes), so the Worker adds the same constant
  headers itself; the CSP travels inside each page as a `<meta>` tag, so it applies however the page is served.
  (`frame-ancestors` cannot be set by `<meta>`; it is in the HTTP headers.)
- A redirect to a project page returns the 404 page in production until that project is approved (Q-20); reported,
  not hidden.
- HSTS is sent without `includeSubDomains`/`preload` until the domain's subdomains are known (Q-48).
- Stacking on the unmerged Phase 5 branch: if Phase 5 changes in review, Phase 6 needs a merge from it.

## 5. Delivered (branch `claude/gifted-clarke-758lqy`, stacked on `claude/phase-5-cms`)

| Step | Commit subject | Docs |
| --- | --- | --- |
| 6.0 | Phase 6 plan, Q-48–Q-52, CLAUDE.md status | this file |
| 6.1 | `@auburn/content-rules`: one held-back list (D-029, Proposed) | `docs/CMS.md` §9 |
| 6.2 | `redirects.csv`, build-time validation, `_redirects`, e2e | `docs/REDIRECTS.md` |
| 6.3 | Strict CSP + security headers (D-030, Proposed) | `docs/SECURITY-HEADERS.md` |
| 6.4 | Launch-readiness report, CI artifact | `docs/LAUNCH-READINESS.md` |

Unchanged: the fixture adapter and fixtures, `isRenderable` and every fail-closed check, the redirect map, URLs,
tokens, design and module order. The production build's pages are byte-identical to before apart from the CSP
`<meta>` tag; `dist` and `dist-sanity` remain byte-identical. Nothing was created, uploaded or deployed.

