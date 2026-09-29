# Decisions log

Architectural and process decisions, newest last. Each entry: context, decision, status, consequences.
Status is one of **Approved** (by the project owner), **Proposed** (awaiting approval — do not build on it as settled)
or **Superseded**. Change a decision by adding a new entry that supersedes it; do not rewrite history.

---

## D-001 · Stack: Astro + Sanity + Cloudflare
- **Date:** 29 Sep 2026 · **Status:** Approved
- **Context:** Options compared in *Auburn Resources Technical Architecture*: Astro + Sanity + Cloudflare,
  Next.js + Payload, WordPress.
- **Decision:** Astro (static output, TypeScript strict) with Preact islands; Sanity hosted CMS with a custom Studio;
  Cloudflare static assets + Workers. Details in `docs/WEBSITE-STRATEGY.md` §6 and `CLAUDE.md`.
- **Consequences:** No public server or database. Content changes need a rebuild (target: live in under 3 minutes).
  A shareholder portal would need revisiting this.

## D-002 · Repository root is the monorepo; documents live in `docs/`
- **Date:** 29 Sep 2026 · **Status:** Approved (Phase 0)
- **Context:** The original `CLAUDE.md` described an `auburn-web/` root folder and referenced `docs/…` paths, but the
  documents sat at the repository root and a zip duplicated them.
- **Decision:** The repository root is the pnpm workspace root (no `auburn-web/` wrapper). The four planning documents
  moved to `docs/`. `auburn-web-docs.zip` removed (byte-identical duplicate; recoverable from git history).
- **Consequences:** One copy of each document. All paths in `CLAUDE.md` are relative to the repository root.

## D-003 · Build templates against typed fixtures first, behind a content adapter
- **Date:** 29 Sep 2026 · **Status:** Approved (Q-01, 29 Sep 2026)
- **Context:** The Sanity plan and seat count are undecided (Q-10), but templates can be built now.
- **Decision:** The site reads content only through `apps/site/src/lib/content/` (e.g. `getProjects()`,
  `getSiteSettings()`). Two back ends: `fixtures` (typed JSON seeded from `docs/CONTENT-SOURCE.md`, every fact
  `toVerify`) and `sanity` (GROQ at build time). Selected by env var.
- **Consequences:** Template work is not blocked on CMS procurement. The fixture types must match the Sanity typegen
  output once the Studio exists; CI checks this.

## D-004 · Remove self-referencing redirects
- **Date:** 29 Sep 2026 · **Status:** Approved (Phase 0)
- **Context:** `docs/SITEMAP.md` §9 listed `/projects → /projects` and `/investors → /investors`.
- **Decision:** Removed both rows; those URLs are unchanged between the old and new sites. CI will reject any redirect
  whose source equals its target, and any chain or loop.

## D-005 · One site, two content modes (`production` / `preview`)
- **Date:** 29 Sep 2026 · **Status:** Approved (Q-02, 29 Sep 2026)
- **Context:** The design requires a CMS preview showing status dots and "INPUT NEEDED" placeholders, while production
  must show only Approved facts. A purely static production build cannot show drafts.
- **Decision:** The same Astro codebase is built twice. `CONTENT_MODE=production` renders Approved facts only and hides
  empty modules. `CONTENT_MODE=preview` renders every status with status dots and placeholders, reads Sanity drafts,
  and deploys to a Cloudflare environment behind Cloudflare Access (not indexed). Rebuilt on CMS draft changes.
- **Alternative rejected for now:** live visual editing (Sanity Presentation), which needs server rendering.
- **Consequences:** Preview is a few minutes behind edits. Visibility logic lives in one function
  (`isRenderable(fact, mode)`).

## D-006 · Scope of the JavaScript budget
- **Date:** 29 Sep 2026 · **Status:** Approved (Q-03, 29 Sep 2026)
- **Context:** MapLibre GL is roughly 200 KB compressed, far above the 30 KB content-page budget.
- **Decision:** The 30 KB budget applies to the initial/core JS bundle (JS loaded on page load). The map island first renders a static SVG poster
  and loads MapLibre only on user action or when scrolled into view; that deferred chunk is budgeted separately
  and excluded from the 30 KB figure and from the home page's 500 KB initial transfer.

## D-007 · URL output: no trailing slash, no extension
- **Date:** 29 Sep 2026 · **Status:** Approved (implements docs/SITEMAP.md §1 URL rules)
- **Decision:** Astro `trailingSlash: 'never'` and `build.format: 'file'` (emits `company.html`, served at
  `/company` by Cloudflare static assets). Canonical URLs are lowercase, absolute, with no trailing slash
  (except `/`), no `.html`, no query string (`lib/seo.ts`).
- **Consequences:** Cloudflare must be configured to serve `x.html` at `/x` and redirect `/x/` to `/x`
  (Phase 6/7 deploy configuration).

## D-008 · Toolchain versions
- **Date:** 29 Sep 2026 · **Status:** Approved (Phase 1)
- **Decision:** Node 24 LTS (`>=24.16.0 <25`; `eslint-plugin-astro` requires ≥ 24.16), pnpm 10.33,
  Astro 7, **TypeScript 6.0** (not 7: `@astrojs/check` and `typescript-eslint` do not support TypeScript 7
  yet), ESLint 10 with `typescript-eslint`, `eslint-plugin-astro` and `eslint-plugin-jsx-a11y-x` (the
  maintained fork; the original `eslint-plugin-jsx-a11y` does not support ESLint 10), Prettier 3 with
  `prettier-plugin-astro`, Vitest 5. Fonts self-hosted via `@fontsource` (Didact Gothic, IBM Plex Mono;
  latin subset, weight 400 only).
- **Consequences:** Revisit TypeScript 7 when `@astrojs/check` and `typescript-eslint` support it.
  Markdown is excluded from Prettier so the approved documents are never reflowed.

## D-009 · Content slots: every fact-shaped field is a Fact or an explicit INPUT NEEDED
- **Date:** 29 Sep 2026 · **Status:** Approved (Phase 1)
- **Decision:** `FactSlot<T> = Fact<T> | InputNeeded` (likewise for Interpretation and Narrative). Missing
  values are recorded as `inputNeeded(brief)` rather than left empty, so preview can show exactly what is
  missing and production can hide it. All visibility logic is in `lib/facts.ts` (`isRenderable`,
  `resolve`, `isModuleVisible`). Fixtures are TypeScript modules (compile-time checked), with invariant
  tests: no `approved` status outside the CMS, every source resolves, HOLD wording absent, narratives
  digit-free, and zero renderable slots in a production build.
- **Interim for Q-07:** the old-site capture and the DGR quarterly are modelled as internal `document`
  records (`docType: 'sourceCapture' | 'thirdParty'`, `internal: true`) so `factMeta.sourceDocument` can
  stay a required document reference. Revisit when Q-07 is answered.

## D-010 · Utility and legal pages have no sheet numbers
- **Date:** 29 Sep 2026 · **Status:** Approved (Q-04, for now)
- **Decision:** Contact, Disclaimer, Privacy, Terms and 404 are utility/legal pages without sheet numbers.
  `SheetNumber` is optional for them; every other page must have one.

## D-011 · Numbers inside Interpretation text
- **Date:** 29 Sep 2026 · **Status:** Approved (Q-06, interim — no final compliance decision)
- **Decision:** Numbers inside approved Interpretation content are preserved as written. They are not
  Facts, are never extracted into data cells, and the existing content-class rules still apply (Narrative
  has no digits; data cells take Fact objects only).

## D-012 · Header breakpoints set by measurement
- **Date:** 29 Sep 2026 · **Status:** Approved (Q-13, 29 Sep 2026)
- **Context:** Measured with Didact Gothic, the full header row needs ~980 px of content width without the
  sheet reference and ~1,230 px with it. At a 64rem (1024 px) breakpoint it overflowed.
- **Decision:** Full header navigation from 80rem (1280 px); sheet reference in the header from 90rem
  (1440 px, the artboard). Below those, the "Menu" link and the breadcrumb line carry them.
- **Consequences:** 1024–1279 px (small laptops, landscape tablets) get the compact header. Re-measure
  when Century Gothic is licensed (it is wider).

## D-013 · Design-system catalogue: preview-only route with artificial specimens
- **Date:** 29 Sep 2026 · **Status:** Approved (Q-16, 29 Sep 2026)
- **Decision:** `/_catalogue` is injected by `astro.config.ts` only in preview builds (source in
  `src/catalogue/`, outside `src/pages/`). To show production rendering it uses *specimens*: artificial
  values with status `approved`, labelled "Specimen", in `src/catalogue/specimens.ts`. Company fixtures stay
  unapproved. Safeguards: unit test (specimens importable only from `src/catalogue`), CI guard (no
  "Specimen", no catalogue, no `data-preview-only` in production output), and the page refuses to render
  outside preview.

## D-014 · Container queries for components that live in columns
- **Date:** 29 Sep 2026 · **Status:** Approved (Q-16, 29 Sep 2026)
- **Decision:** Page layout uses the four viewport breakpoints (48/64/80/90rem). Components placed in
  columns of varying width respond to their own width: DocumentRegister switches cards → table at 40rem;
  FactCell values and SheetCard names scale with the cell (`cqi`), capped at the approved token sizes, so
  numbers and names never break mid-word.

## D-015 · Build-time guards for the design system
- **Date:** 29 Sep 2026 · **Status:** Approved (Phase 2; extends D-006)
- **Decision:** `src/lib/design-system.test.ts` rejects colour literals outside `tokens.css`, shadows,
  gradients, non-zero radius, weights other than 400, undocumented breakpoints, client scripts and inline
  styles in components. `src/lib/contrast.test.ts` checks every colour pairing components use.
  `scripts/check-js-budget.mjs` (`pnpm budget`) enforces the 30 KB page-load JS budget in CI.

## D-016 · Homepage review decisions
- **Date:** 29 Sep 2026 · **Status:** Approved (homepage review)
- **Decision:** No additional homepage credibility or contact section; the approved section order stays
  (WEBSITE-STRATEGY §5). The production homepage may stay sparse while content is unapproved — approval rules
  are never weakened to fill it. The footer keeps the Contact heading/link; individual contact fields stay
  hidden until their values are approved. Catalogue specimens are confirmed catalogue-only (Q-16).
  Q-05, Q-07 and Q-08 remain open.

## D-017 · Mockup graphics kept in the design as indicative figures (preview only)
- **Date:** 29 Sep 2026 · **Status:** Approved (Q-18, 29 Sep 2026): preview only; production stays hidden
  until approved GIS/technical figures replace them. The "mockup geometry never ships" rule is unchanged.
- **Decision:** The Fig. 1 portfolio map and Fig. 2 schematic cross-section from the approved mockups
  ("1b · Survey Sheet — Century Gothic"; "Project page template — Nicholson") are cropped at full resolution
  into `apps/site/src/assets/figures/indicative/` and used as figure records with status `toVerify`, captioned
  "indicative", with text descriptions. The Nicholson regional-setting map is stored for the project dossier.
  They render in preview builds only: they are loaded behind the compile-time `__PREVIEW_BUILD__` flag, so a
  production bundle cannot contain them, and CI fails if any `*indicative*` file reaches production.
- **Why not production yet:** the approved rules say mockup geometry, project positions and the schematic
  section are indicative only and must never ship as fact (CLAUDE.md §3; DESIGN-DIRECTION "Maps and figures").
  Showing them publicly would need an explicit owner decision (Q-18) and a change to those rules.
- **Also:** `sharp` added as a build-time dependency of the site (required by Astro's `<Image>` pipeline,
  part of the approved stack).
