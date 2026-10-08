# CLAUDE.md — Auburn Resources website

This repository holds the rebuild of **auburnresources.com.au** for Auburn Resources Limited, an unlisted
Australian mineral explorer (zinc, copper, gold; Queensland and the Northern Territory).

Read these before writing code, in this order:

1. `docs/WEBSITE-STRATEGY.md` — why the site exists, audiences, positioning, homepage structure, technical decisions
2. `docs/SITEMAP.md` — every page, its URL, sheet number, purpose, CTAs and sections; content model; redirects
3. `docs/DESIGN-DIRECTION.md` — the approved "Survey Sheet" direction: tokens, type, components, page templates
4. `docs/CONTENT-SOURCE.md` — what content exists, what is unverified, and what must stay a placeholder
5. `docs/DECISIONS.md` — decisions since approval (check status: only **Approved** entries are settled)
6. `docs/OPEN-QUESTIONS.md` — what is still undecided; add to it instead of guessing

---

## Current state

- **Phase 0** (housekeeping) — done.
- **Phase 1** (scaffold) — done: pnpm workspace, Astro site in `apps/site`, tokens and base CSS, `BaseLayout`,
  SEO helpers, content adapter with typed fixtures, `Fact` rendering rules, unit tests, CI.
- **Phase 2** (design system) — done, approved: tokens tagged approved/derived, 11 primitives, static
  patterns and page frame in `apps/site/src/components/`, preview-only catalogue at `/_catalogue`
  (`src/catalogue/`), design-system/contrast tests, JS budget check. Review: `docs/reviews/phase-2-design-review.md`.
- **Phase 3** (page templates on fixtures) — done, approved (D-018, D-019, D-020). Every sitemap route exists
  in both builds; pages with no approved content are a temporary state, not launch-ready (D-019).
  Pages use `layouts/SiteLayout.astro` + `loadFrame()` (fixed pages via `layouts/ContentLayout.astro`); modules
  live in `components/modules/<page>/` (shared page modules in `modules/page/`). Page copy comes from `page`
  records (`getPage`, `getLegalPage`). Dossier module rules are in `lib/content/dossier.ts`.
- **Phase 4** (islands) — incremental, each item reviewed before the next: **1. Mobile menu** approved
  (`components/islands/MobileMenu.astro`, native dialog, D-021). **2. Document filters** approved (D-023):
  native GET form + edge Worker routing query strings to prebuilt `noindex` pages, zero client JS (D-023;
  `workers/edge`, `docs/WORKER.md`; not deployed). Order: mobile menu → document filters → Pagefind → forms → map → lightbox → remaining navigation → edge Worker. Client scripts live only in
  `components/islands/`. Items 3–8 are intentionally deferred.
- **Phase 5** (CMS) — done, pushed on `claude/phase-5-cms`, not yet merged (D-024–D-028; `docs/CMS.md`): Sanity schemas and Studio in
  `apps/studio` (local only, nothing created or deployed), Sanity adapter behind `ContentAdapter` in
  `apps/site/src/lib/content/sanity/` (fail-closed approval/provenance checks), `sanity-export` NDJSON snapshot source,
  fixture exporter, round-trip and hostile-content tests, typegen drift check. Playwright + axe tests in `tests/e2e`
  run against four builds (fixtures and Sanity snapshot, each in production and preview);
  `content-integrity.spec.ts` scans the production builds; `links.spec.ts` crawls every internal link.
- **Phase 6** (launch hardening, repository side) — plan awaiting review: `docs/PHASE-6-PLAN.md`. Steps 6.0–6.4:
  shared content-rules package, redirects, security headers (D-030, Proposed), launch-readiness report.
- **Launch preparation** (docs only): `docs/LAUNCH-GATE.md` (blockers, checklist), `docs/STYLE-GUIDE-AUDIT.md` (the
  company style guide vs the site: palette and logo differ, Q-53–Q-56; no design change made), `docs/BRAND-MIGRATION-PLAN.md`
  (D-031 approved and **implemented**: colour tokens now use the brand palette, `--copper*` renamed `--accent*`; the
  official vector logo is still awaited, Q-55), `docs/SECTION-BANDS-PLAN.md` (D-032 approved and **implemented**: light-teal and
  dark-teal section bands via tone scopes; `tests/e2e/section-bands.spec.ts`), `docs/SPACING-DENSITY-AUDIT.md`
  (D-033 approved and **implemented**: P1–P10, margin-heading page blocks with a `wide` option, bands keep more
  room; `tests/e2e/layout-density.spec.ts`), `docs/content-request/`
  (what the company secretary, competent person and owner must supply), `docs/MINIMUM-LAUNCH-CONTENT.md`,
  `docs/APPROVAL-MATRIX.md`, `docs/PDF-ASSETS-FORMS.md` (Q-59 PDFs, Q-60 alerts strip).
- **Deployment** (repository side, D-034; `docs/DEPLOYMENT.md`): manual `.github/workflows/deploy.yml` (preview or
  production, from Sanity only, fail-closed pre-flight), `wrangler` dev dependency in `workers/edge`, opt-in indexing
  in the Worker (`SITE_INDEXABLE`), preview Access check. **Nothing deployed**; no Cloudflare, Sanity or DNS change.
- **Interim (D-036):** `squarespace/auburn-restyle.css` + `docs/SQUARESPACE-RESTYLE.md` restyle the current Squarespace
  site with the new look (appearance only; prepared, not applied). It is not part of the new site.
- **Launch route (D-037):** a **new** Squarespace 7.1 site in the same design and layout, built by hand from
  `docs/SQUARESPACE-BUILD.md` (`squarespace/auburn-restyle.css` + `squarespace/snippets.html`); domain moved by the
  owner. Prepared, not built. The Astro/Cloudflare/Sanity route is paused, not removed.
- **Not yet built:** Phase 4 items 3–8 (deferred), live Sanity project/dataset/import, Studio hosting, webhooks,
  Lighthouse budgets in CI. Q-05, Q-08, Q-10, Q-45–Q-51, Q-55 (provisional) and Q-57–Q-60 are open and must not be decided silently.

Update this section as each phase lands. Build phases are in `docs/WEBSITE-STRATEGY.md` §7.

---

## 1. Project goals

- Make the website the **single, current, credible source of truth** about Auburn for investors, and a clear front
  door for partners, media and communities.
- Audiences in priority order: investors → mining professionals → project partners → journalists → general visitors
  (landholders, communities, job-seekers). Journeys: `docs/SITEMAP.md` §7.
- Fix what the old Squarespace site got wrong: broken contact links, stale investor centre, unverified portfolio
  claims, no compliance statements, stock imagery, poor accessibility and ~9 s load.
- Voice: measured, technical, confident. Plain English first, detail second. Never promotional.

## 2. Content rules (non-negotiable)

### 2.1 Never invent facts
This is a mining company that will be judged by investors and regulators. Do **not** create, estimate, round,
"improve" or infer any of the following:

- geological facts, deposit models or comparisons
- resource or reserve figures, exploration targets, tonnages or grades
- drilling or exploration results, quantities or dates
- tenement numbers, areas, ownership percentages, JV terms
- share counts, shareholdings, IPO status, dates, people's titles or bios

If a value is not in `docs/CONTENT-SOURCE.md` (or later, in the CMS as an Approved fact), render a
**placeholder** instead: `[INPUT NEEDED: short description]`. In preview mode these render as the dashed orange
"INPUT NEEDED" box; in production, modules whose facts are not Approved are **hidden**, never half-shown.

Items marked **TO VERIFY** in `CONTENT-SOURCE.md` may be used in fixtures and staging seed data, but must carry
status `toVerify` so they never publish until approved. Never change a fact's status to `approved` in code, fixtures or
seed scripts — approval happens only in the CMS, by the company secretary (corporate) or competent person (technical).

### 2.2 Three content classes, always kept apart
| Class | Stored as | Renders as |
| --- | --- | --- |
| **Fact** | Structured field + `factMeta` (source document, asAt, status, approvedBy, reviewBy) | Ruled data cell, mono label, source line |
| **Interpretation** | Rich text linked to ≥1 source document; CP review | Body text beside a numbered figure + source line |
| **Narrative** | Short plain text, character-limited, **no digits allowed** | Larger prose, no data styling, no source line |

- Numbers appear on the page only via Fact records. `FactCell` and friends accept a `Fact` object, never a raw string.
- Only facts with `status === 'approved'` render in production.
- Never hard-code a number in a template, component or UI string (sheet numbers and dates from records excepted).
- Numbers inside **approved Interpretation** text are preserved as written (D-011, interim — no final compliance
  decision). They are not Facts and are never pulled into data cells.

### 2.3 Compliance text
- Any page showing exploration results, targets or resources must render `ComplianceBlock` (competent person
  statement + link to `/disclaimer`).
- Planned milestones are forward-looking and must link to `/disclaimer`.
- Items marked **HOLD** in `CONTENT-SOURCE.md` are never rendered, in any mode — including the exploration-target
  wording ("Potential for 40Mt resource @ 10% Zn-Pb", "+200Mt sulphide / +25Mt oxide"), the outdated Hawkwood work
  plan and the 2021 entitlement offer.
- Do not draft legal text (disclaimer, privacy, terms, CP statements) as final copy. Use placeholders.
- Third-party deposit figures (e.g. McArthur River, Nova-Bollinger) need a source and date, like any fact.
- Name Traditional Owner groups only with recorded consent. Never show photos of cultural sites without permission.

### 2.4 Don't copy the old site's mistakes
No stock photography, no images of text (tables must be HTML), no empty alt text on content images, no
scroll-triggered fade-ins that hide content, no Squarespace URLs, no `mailto:email@email.com`, no promotional
phrasing from the old copy (e.g. "where there's smoke, there's fire").

### 2.5 Spelling and formats
- Australian English in all copy and UI (colour, organisation, licence, recognise).
- Dates: display `DD MMM YYYY` in mono; store ISO 8601; timezone Australia/Brisbane for announcements.
- Units: SI with a space (`1,200 line km`, `100 m`); `km²` not `sq km`.

## 3. Design principles

The approved direction is **"Survey Sheet"** (`docs/DESIGN-DIRECTION.md`). The site reads like a finely made
geological survey sheet: precise, methodical, authored by geologists, never hyped.

- **Sheet numbers everywhere.** Five numbered sections: 01 Company · 02 Projects · 03 Investors · 04 Sustainability ·
  05 News. Each page's sheet number (e.g. `SHEET 02.1 · NICHOLSON`) appears in the title block and breadcrumb.
- **Brand palette only (D-031).** Every colour comes from the company style guide via `--brand-*` tokens; no derived
  colours without the owner's approval. Dark teal `#275259` is the primary colour; charcoal `#3B3838` is body text;
  logo blue and logo navy are for the logo only.
- **Section bands (D-032).** White is the page ground; light-teal bands and at most one dark-teal band per page
  structure long pages, chosen by content, never by position (`docs/SECTION-BANDS-PLAN.md`). Apply them only
  through the `tone` prop (`lib/tones.ts`); orange never sits directly on a band; figures and placeholders stay
  white; legal pages and 404 stay white; a dark section never touches the footer.
- **The orange accent marks Auburn's own ground and nothing else.** `--accent` (#D45A1C, 3.98:1 on white) is for map
  fills, tag borders, status dots and large type only — never small text or a normal-size button fill; lettering
  beside it uses `--accent-text` (charcoal). Orange map fills need a dark-teal outline.
- **Hierarchy by size and ink, not weight.** Century Gothic at 400 throughout; IBM Plex Mono for labels, sheet numbers,
  captions, tables, dates, tenement IDs.
- **Ruled, square, flat.** 1 px rules (dark teal for structure, light teal for secondary). No shadows, no
  gradients, border-radius 0. Hover = underline or line, not colour blocks.
- **Figures are numbered and captioned** (`FIG. 1 — …`), with source and date. Prose sits beside figures, not in walls.
- **Data in ruled cells**, like a map-sheet margin.
- **One cartographic style** for every map; only Auburn tenements are orange; every map has a text equivalent.
- **Documentary photography only**, with caption, date, place, photographer and consent.
- **Minimal motion**; nothing moves unless the user acts; respect `prefers-reduced-motion`.
- Mockup map geometry, project positions and the schematic cross-section are **indicative only** — never ship as fact.

## 4. Technical conventions

### 4.1 Stack (approved — `docs/DECISIONS.md` D-001)
| Concern | Choice |
| --- | --- |
| Framework | **Astro** (static output), TypeScript strict |
| Interactivity | Islands only (menu, doc filters, search, nav panels, strat-column nav, lightbox, forms, map): **native HTML/CSS first**; **Preact** only where it gives a clear benefit (D-022) |
| Styling | Plain CSS + design tokens (`src/styles/tokens.css`) + Astro scoped styles. **No Tailwind / utility framework** |
| CMS | **Sanity** (hosted), customised Studio in `apps/studio` |
| Images | Sanity image CDN (AVIF/WebP, srcset) + Astro `<Image>`; figures as SVG where possible |
| Maps | **MapLibre GL** + GeoJSON tenements from CMS; static SVG poster first, library lazy-loaded |
| Search | **Pagefind** (built at deploy) |
| Forms | Cloudflare Worker (`workers/edge`) + Turnstile; Postmark (enquiries); ESP double opt-in (alerts) |
| Documents | Uploaded to Sanity; served at `/documents/[slug].pdf` via Worker proxy |
| Hosting | **Cloudflare** (static assets + Workers), DNS on Cloudflare |
| Analytics | Plausible or Cloudflare Web Analytics (cookie-free) + Search Console |
| CI | GitHub Actions: typecheck, lint, unit, Playwright journeys, axe, Lighthouse budgets |

Package manager: **pnpm** 10 workspaces. Node **24 LTS**, pinned in `.nvmrc` and `engines`. TypeScript 6.0 (not 7 —
see D-008).

### 4.2 Repository layout (target — the repository root is the workspace root, D-002)
```
/
├─ apps/site/            Astro site (src/pages mirrors the URL structure in docs/SITEMAP.md)
│  └─ src/{pages,layouts,components/{primitives,patterns,modules,islands},lib/{content,config.ts,facts.ts,dates.ts,seo.ts},styles}
├─ apps/studio/          Sanity Studio (schemaTypes/{objects,documents}, structure, validation; local only)
├─ packages/content-rules/  shared content rules: the held-back list (D-029)
├─ packages/security-headers/  HTTP security headers for _headers and the Worker (D-030)
├─ workers/edge/         document-filter routing now (D-023), deployed by .github/workflows/deploy.yml (D-034);
│                        later /documents proxy, /api/contact, /api/alerts
├─ docs/                 strategy, design, sitemap, content source, decisions, open questions, env, runbooks
├─ tests/                Playwright, axe, visual snapshots
├─ redirects.csv         old Squarespace URLs → new URLs
└─ .github/workflows/
```

### 4.3 Scripts (run from the repository root; keep this list current)
```
pnpm install        # install (Node 24, pnpm via Corepack)
pnpm dev            # site dev server, preview mode (placeholders visible)
pnpm build          # production build → apps/site/dist (Approved content only)
pnpm build:preview  # preview build → apps/site/dist-preview (noindex)
pnpm build:sanity-export  # both modes through the Sanity adapter from the NDJSON snapshot → dist-sanity, dist-sanity-preview
pnpm studio         # Sanity Studio locally (apps/studio; not hosted — Q-45)
pnpm typegen        # regenerate Sanity types from the Studio schema (commit the result)
pnpm typegen:check  # fail if the committed Sanity types are out of date
pnpm content:export # regenerate the NDJSON snapshots from the fixtures
pnpm serve          # serve the last production build locally
pnpm serve:production  # serve apps/site/dist at http://localhost:4600 (static, behind the edge Worker, like Cloudflare)
pnpm serve:preview     # serve apps/site/dist-preview at http://localhost:4601
pnpm test           # unit tests (Vitest)
pnpm lint           # ESLint + Prettier check
pnpm format         # Prettier write
pnpm typecheck      # astro check
pnpm budget         # JS-on-page-load budget (30 KB compressed) against both production builds
pnpm readiness      # launch-readiness report from the last production + preview builds → apps/site/reports/
pnpm test:e2e       # Playwright + axe against all four builds (build them first; `pnpm check` does)
pnpm check          # all of the above plus both builds and e2e — run before pushing
```
The Studio runs separately (`pnpm studio`); CMS details, environments and migration are in `docs/CMS.md`.

### 4.4 Content access and modes (approved — D-003, D-005, D-009)
- Components never fetch. Pages call `src/lib/content/*` loaders, which return typed records from fixtures or Sanity.
- `CONTENT_MODE=production|preview`. The single function `isRenderable(fact, mode)` in `lib/facts.ts` decides fact
  visibility; do not duplicate this logic in components.
- Placeholders and status dots render **only** in preview mode. CI fails if preview-only output appears in the
  production build.
- Only `lib/config.ts` reads `astro:env`; everything else in `lib/` takes the mode as a parameter and is unit-tested.
- Unit tests sit next to the code (`*.test.ts`); Playwright and axe tests go in `/tests`.

### 4.5 General
- TypeScript strict; no `any` without a comment explaining why.
- URLs: lowercase, hyphenated, max three levels; never change a published slug without a redirect. Redirects live in
  `redirects.csv`; CI rejects self-redirects, chains and loops.
- No secrets in the repo. Env vars documented in `docs/ENV.md` (create when first needed).
- Dependencies: only what the approved stack needs. Ask before adding any runtime dependency.
- Small, reviewable commits with descriptive messages. Update `docs/DECISIONS.md` when you make or change an
  architectural decision (as **Proposed** until the owner approves).

## 5. Component conventions

- Layering: **Tokens → Primitives → Patterns → Modules → Templates**. Each layer imports only from layers below it.
  Islands are the only client-side components.
  - *Primitives*: Button, ArrowLink, Tag, MonoLabel, Rule, Container, Grid, DateMono, SheetRef, VisuallyHidden, Icon.
  - *Patterns*: Header, NavPanel, SectionBar, Breadcrumb, FactCell, FactValue, FactStrip, SourceLine, StatusDot,
    Placeholder, Figure, MapLegend, SheetCard, DocumentRegister, PersonCard, Timeline, CounterRow, MilestoneTrack,
    Accordion, InPageIndex, CTABand, ComplianceBlock, SignupStrip, Footer. (NavPanel and InPageIndex: Phase 4.)
  - *Modules*: page sections (home modules, project modules 01–09, investor modules).
  - *Templates*: Home, SectionLanding, Portfolio, ProjectDossier, ContentPage, DocumentLibrary, DocumentDetail,
    ArticleIndex, Article, Form, Legal, Utility.
- One component per file, PascalCase (`FactCell.astro`, `MapIsland.tsx`); props typed with an exported `Props`.
- Styles: Astro scoped styles using tokens only — no raw hex values, px spacing outside the scale, or `!important`.
- **Modules render nothing when their content is empty** (no empty tables, no empty headings).
- Every `Figure` requires `alt` and `caption` (a missing prop is a type error; the build fails).
- Fact components accept `Fact` objects only, never raw strings or numbers.
- Islands: native HTML/CSS and minimal script first; Preact only with a demonstrated benefit, explained before it
  is introduced (D-022). Preact islands hydrate with the least eager directive (`client:visible` / `client:idle`). All work without JS
  where possible (links and native forms first).
- Keep the `noindex`, preview-only component catalogue (`/_catalogue`, source in `src/catalogue/`) showing every
  pattern with sample data; add each new pattern to it. Catalogue specimens never leave `src/catalogue/` (D-013).
- Fact-aware components take an optional `mode` prop and call `renderMode()` from `lib/config.ts`: a production
  build always renders production, whatever the prop says. Labels are never rendered without their value.
- Viewport breakpoints are 48/64/80/90rem only (tests enforce it); components in variable-width columns use
  container queries (D-014).

## 6. Accessibility requirements

- **WCAG 2.2 AA**; zero axe violations in CI; manual VoiceOver and NVDA pass before launch.
- Real `<button>` and `<a>` elements; semantic landmarks; one `<h1>` per page; no skipped heading levels.
- Visible focus on every interactive element (`:focus-visible` ring from tokens); skip link to main content.
- Nav panels open on **click**, not hover; `Escape` closes panels, menus, bottom sheets and the lightbox, returning
  focus to the trigger; focus is trapped only in modal surfaces.
- Touch targets ≥ 44 × 44 px. Works at 360 px with no horizontal page scroll; text resizes to 200 %.
- Contrast: retest any new colour pairing; orange `#D45A1C` never for body or small text.
- Every content image has meaningful alt text; decorative images have `alt=""` and are marked decorative in the CMS.
- Maps and figures have text equivalents (project list, long description); tables are real HTML tables with headers;
  PDFs have an HTML summary page.
- Forms: visible labels, programmatic error messages, no reliance on colour alone, Turnstile in accessible mode.
- Respect `prefers-reduced-motion`; no autoplay; no content hidden behind scroll animations.

## 7. SEO requirements

- Every page: unique `<title>`, meta description, canonical URL, Open Graph and Twitter tags (auto OG image),
  `BreadcrumbList` JSON-LD.
- JSON-LD: `Organization` with the correct legal name (not "DGR Global"), `Article` on news and announcements, `Place`
  on project pages.
- XML sitemap and `robots.txt`; `noindex` on `/_catalogue`, preview builds, filter query strings and 404.
- 301 redirects for every old URL (`docs/SITEMAP.md` §9); no orphan pages; nothing indexed that isn't in the sitemap.
- Each announcement gets an HTML page as well as its PDF at `/documents/[slug].pdf`.
- Semantic headings (H1 on every page — the old site had none), descriptive link text, `lang="en-AU"`.

## 8. Budgets (CI-enforced)

- LCP < 2.0 s (4G mobile), CLS < 0.05, INP < 200 ms
- JS loaded on page load < 30 KB compressed on content pages; home total initial transfer < 500 KB
  (MapLibre is lazy-loaded only when the map is needed and budgeted separately — D-006)
- Lighthouse ≥ 95 in all four categories
- WCAG 2.2 AA; zero axe violations

## 9. Things Claude must NOT change without explicit approval

Ask first, and record the approved change in `docs/DECISIONS.md`:

1. **The approved documents** in `docs/` (strategy, sitemap, design direction, content source) — except factual
   corrections the owner has approved.
2. **The stack** (D-001) or adding a framework, CSS library, CMS plugin or runtime dependency.
3. **Design tokens** (colour values, colour roles, type faces), the brand palette, and the "orange accent = Auburn
   ground only" rule.
4. **URLs, slugs, sheet numbers, navigation labels and order**, and the redirect map.
5. **Homepage section order** and the **project page module order**.
6. **Any fact's status** — never set `approved`; never un-hide a HOLD item.
7. **Compliance, legal and CP wording**, the acknowledgement of Country, and Traditional Owner names.
8. **Budgets, accessibility targets and CI checks** — never weaken, skip or disable a check or test to get green.
9. **Content rules in this file** (§2) and this list (§9).
10. **Fonts**: never commit Century Gothic files (no licence yet); never load fonts from third-party CDNs in production.
11. **Deleting content, documents or assets**, or rewriting git history on shared branches.
12. **Deployment, DNS, environment and secret configuration.**

## 10. Definition of done (per page/template)

- Matches `docs/DESIGN-DIRECTION.md` and the section list in `docs/SITEMAP.md`
- Uses only Approved facts in production; placeholders in preview for anything missing; no invented content
- Works at 360 px, 768 px, 1280 px and 1440 px; keyboard and screen-reader usable
- Passes typecheck, lint, tests, axe and Lighthouse budgets
- Title, meta description, canonical, breadcrumb JSON-LD present
- Added to `/_catalogue` if it introduces a new pattern

## 11. When unsure

Ask, or leave a clearly marked placeholder and add the question to `docs/OPEN-QUESTIONS.md`.
Do not guess about facts, compliance wording or legal text.
