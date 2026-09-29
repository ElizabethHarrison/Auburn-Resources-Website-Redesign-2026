# CLAUDE.md — Auburn Resources website

This repository holds the rebuild of **auburnresources.com.au** for Auburn Resources Limited, an unlisted
Australian mineral explorer (zinc, copper, gold; Queensland and the Northern Territory).

Read these before writing code, in this order:

1. `docs/WEBSITE-STRATEGY.md` — why the site exists, audiences, positioning, homepage structure, technical decisions
2. `docs/SITEMAP.md` — every page, its URL, sheet number, purpose, CTAs and sections; redirects
3. `docs/DESIGN-DIRECTION.md` — the approved "Survey Sheet" direction: tokens, type, components, page templates
4. `docs/CONTENT-SOURCE.md` — what content exists, what is unverified, and what must stay a placeholder

---

## Non-negotiable rules

### 1. Never invent facts
This is a mining company that will be judged by investors and regulators. Do **not** create, estimate, round,
"improve" or infer any of the following:

- geological facts, deposit models or comparisons
- resource or reserve figures, exploration targets, tonnages or grades
- drilling or exploration results, quantities or dates
- tenement numbers, areas, ownership percentages, JV terms
- share counts, shareholdings, IPO status, dates, people's titles or bios

If a value is not in `docs/CONTENT-SOURCE.md` (or later, in the CMS as an Approved fact), render a
**placeholder** instead: `[INPUT NEEDED: short description]`. In the CMS preview these render as the dashed copper
"INPUT NEEDED" box; on the production build, modules whose facts are not Approved are **hidden**, never half-shown.

Items marked **TO VERIFY** in `CONTENT-SOURCE.md` may be used in development and staging seed data, but must carry
status `toVerify` so they never publish until approved.

### 2. Three content classes, always kept apart
| Class | Stored as | Renders as |
| --- | --- | --- |
| **Fact** | Structured field + `factMeta` (source document, asAt, status, approvedBy, reviewBy) | Ruled data cell, mono label, source line |
| **Interpretation** | Rich text linked to ≥1 source document; CP review | Body text beside a numbered figure + source line |
| **Narrative** | Short plain text, character-limited, **no digits allowed** | Larger prose, no data styling, no source line |

- Numbers appear on the page only via Fact records. `FactCell` and friends accept a Fact object, never a raw string.
- Only facts with `status === 'approved'` render in production.

### 3. Compliance text
Any page showing exploration results, targets or resources must render the `ComplianceBlock` (competent person
statement + link to `/disclaimer`). Planned milestones are forward-looking and must link to `/disclaimer`.
The current site's exploration-target wording (e.g. "Potential for 40Mt resource @ 10% Zn-Pb") is **held back** —
never render it.

### 4. Don't copy the old site's mistakes
No stock photography, no images of text (tables must be HTML), no empty alt text on content images, no scroll-triggered
fade-ins that hide content, no Squarespace URLs, no `mailto:email@email.com`.

---

## Stack (approved)

| Concern | Choice |
| --- | --- |
| Framework | **Astro** (static output), TypeScript strict |
| Interactivity | **Preact** islands only (map, doc filters, mobile menu, strat-column nav, lightbox, forms) |
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

## Repository layout (target)

```
auburn-web/
├─ apps/site/            Astro site (src/pages mirrors the URL structure in docs/SITEMAP.md)
│  └─ src/{pages,layouts,components/{primitives,patterns,modules,islands},lib/{sanity,facts.ts,seo.ts},styles}
├─ apps/studio/          Sanity Studio (schemas/documents, schemas/objects, structure, validation, actions)
├─ workers/edge/         /documents proxy, /api/contact, /api/alerts
├─ docs/                 strategy, design, sitemap, content source, runbooks, decisions log
├─ tests/                Playwright, axe, visual snapshots
├─ redirects.csv         old Squarespace URLs → new URLs
└─ .github/workflows/
```

Package manager: **pnpm** workspaces. Node LTS.

Planned scripts (create them as the project is scaffolded; keep this list current):

```
pnpm dev            # site + studio locally
pnpm build          # production build of the site
pnpm test           # unit tests
pnpm test:e2e       # Playwright journeys + axe
pnpm lint && pnpm typecheck
pnpm sanity:typegen # regenerate content types from schemas
```

## Component layering

Tokens → Primitives → Patterns → Modules → Templates. Each layer only imports from layers below it.
Modules render **nothing** when their content is empty. Every `Figure` requires `alt` and `caption` (build fails without).
Keep a hidden, `noindex` component catalogue page (`/_catalogue`) showing every pattern with sample data.

## Budgets (CI-enforced)

- LCP < 2.0 s (4G mobile), CLS < 0.05, INP < 200 ms
- JS on content pages < 30 KB compressed; home total transfer < 500 KB
- Lighthouse ≥ 95 in all four categories
- WCAG 2.2 AA; zero axe violations

## Conventions

- URLs: lowercase, hyphenated, max three levels; never change a published slug without a redirect.
- Every page has a **sheet number** (e.g. `02.1`) shown in the title block and breadcrumb.
- Dates: display `DD MMM YYYY` in mono; store ISO; timezone Australia/Brisbane for announcements.
- Australian English spelling in all copy and UI (colour, organisation, licence).
- Accessibility first: real `<button>`/`<a>`, visible focus, `Escape` closes panels, reduced motion respected.
- No secrets in the repo. Env vars documented in `docs/ENV.md` (create when first needed).
- Small, reviewable commits. Update `docs/DECISIONS.md` when you make or change an architectural decision.

## Definition of done (per page/template)

- Matches `docs/DESIGN-DIRECTION.md` and the section list in `docs/SITEMAP.md`
- Uses only Approved facts; placeholders for anything missing; no invented content
- Works at 360 px, 768 px, 1280 px and 1440 px; keyboard and screen-reader usable
- Passes typecheck, lint, tests, axe and Lighthouse budgets
- Title, meta description, canonical, breadcrumb JSON-LD present

## When unsure

Ask, or leave a clearly marked placeholder and add the question to `docs/OPEN-QUESTIONS.md`.
Do not guess about facts, compliance wording or legal text.
