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
- **Amended by D-022 (29 Sep 2026):** "Preact islands" no longer means every interactive component uses Preact.
  Interactivity is native HTML/CSS first; Preact only where it gives a clear benefit (D-022).

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

## D-018 · Project dossier: one data-driven template
- **Date:** 29 Sep 2026 · **Status:** Approved (dossier review, 29 Sep 2026), on conditions: Q-18 stays as decided
  (indicative graphics preview-only); production approved-content rules, the compliance-block requirement and the
  no-half-shown rule unchanged; no project-specific page logic; unverified fixture content preview-only. Q-34 and
  Q-35 remain open.
- **Decision:** `/projects/[slug]` renders every project through one template. `lib/content/dossier.ts` decides
  from data alone which of modules 01–09 appear (approved order, SITEMAP §8): preview shows all nine with
  INPUT NEEDED; production shows a module only with approved content — 01 needs an approved map; 02 and 04–06
  also need an approved competent-person statement; 04 shows only rows whose every cell is approved. The
  compliance block appears whenever 02/04/05/06 do. Related sheets use only facts renderable in the mode.
- **Publishing:** a dossier route is generated only when `isProjectPublishable` (production: approved holding,
  area and ownership — SITEMAP §8 "ownership + area required to publish"). Listing (`isProjectListable`) now
  also requires this, so no card, menu or footer link can lead to a missing dossier. Production currently
  generates no dossier (Q-20).
- **Content model:** `Project` gains tenements, page as-at, setting facts, hero photo, setting map, section
  figure, photos, CP statement and an internal `heldBackNote` (preview-only; the held-back wording itself is
  never stored). New record types and adapter methods: prospects, resource estimates, results, milestones
  (the last three have no source content yet, so their fixtures are empty).
- **Presentation:** module headings from the approved Nicholson mockup (Q-34); hero photo falls back to the
  setting map (unnumbered; it is Fig. 1 in module 01); figures numbered in page order; strat-column index is
  static in Phase 3 (Phase 4 island adds the current band and mobile chip); CTA band "Get [project]
  announcements by email." with "Get investor updates" / "Discuss a partnership".
- **Tests:** `tests/e2e/dossier.spec.ts` (every fixture slug; outline, keyboard, focus, figures, sources,
  related links, no empty headings or labels, axe, overflow at five widths) and
  `tests/e2e/content-integrity.spec.ts` (scans the production build: HOLD wording, preview output, statuses,
  indicative assets, unapproved statements, no dossier routes). Playwright defines `__PREVIEW_BUILD__ = false`
  so specs can import fixture records.

## D-019 · Fixed-page templates: every sitemap route exists in both builds
- **Date:** 29 Sep 2026 · **Status:** Approved (Phase 3 review, 29 Sep 2026), with the refinement below
- **Context:** The approved header, section bars and footer link to every page in docs/SITEMAP.md §1, so a
  route that is missing in either build is a broken link. Most of these pages have no approved content yet.
- **Decision:**
  - Every fixed route is generated in both builds. Copy comes from a `page` record per page (SITEMAP §8
    `page`): a Narrative intro and sections whose headings are the section names from SITEMAP §6 (structure)
    and whose paragraphs are Narrative/Interpretation slots. A section renders only when a paragraph renders.
    Facts (status, holdings, addresses, contacts) are read from site settings, never copied into pages.
  - In production a page with nothing approved shows its title block and structural navigation only
    (extends D-016's "sparse production" to all pages; Q-19). Legal pages show only their title until the
    company supplies the text (Q-24); nothing legal is drafted.
  - Forms (email alerts, contact enquiry) are Phase 4: preview shows where they go; production shows none.
  - Document libraries (announcements, reports, presentations) are registers grouped by year (static
    "pagination"); filters and search are Phase 4. Governance lists the fourteen documents named on the old
    site as records (`toVerify`, files INPUT NEEDED).
  - An announcement page is generated only for an announcement listable in that build, so every register
    link resolves. The article template exists but generates no page until an article exists.
  - "Download latest presentation" and a featured "current presentation" follow Q-08 (omitted in production).
  - `/documents/*.pdf` is served by the edge Worker (Phase 4+); the link crawler fails if any page links to it
    before then (no file is approved yet, so none does).
  - Dossier review fixes: a result card shows its reporting announcement and date, and publishes only when that
    announcement is published; a photograph publishes only with place, photographer and consent recorded.
- **Refinement on approval — "title and navigation only" pages:**
  - It is an acceptable *temporary* production state while approved content is unavailable. It is **not** a
    finished or launch-ready page.
  - A page with no approved content never fabricates or infers content to look complete.
  - Production keeps the title, breadcrumb and section navigation and any genuinely useful approved links, and
    never renders empty headings, empty sections, fake statistics, placeholder copy, INPUT NEEDED markers or
    unapproved claims.
  - **Before launch**, generate a content-readiness report listing every production page still in this state
    (launch checklist; not built yet).
- **Tests:** `tests/e2e/pages.spec.ts` (every route: H1, outline, SEO, section marking, no scripts, no empty
  headings or orphan labels, no raw ISO dates, axe at 360/1280, no overflow at 360–1440; announcement pages;
  404) and `tests/e2e/links.spec.ts` (crawls each build from `/`: every internal link 200, every anchor has a
  target, sitemap lists only linked pages).

## D-020 · PersonCard responds to its column, not the viewport (bug fix under D-014)
- **Date:** 29 Sep 2026 · **Status:** Approved (Phase 3 review, 29 Sep 2026): keep the PersonCard container-query
  fix and the investor section-bar fix; no unrelated design changes
- **Context:** PersonCard switched to its portrait + text layout at a 48rem *viewport* width. In the three-column
  people grid on Company and Leadership (first real use outside the catalogue), each card is ~300 px wide at
  1024 px, so the two-column layout overflowed the page — a concrete bug, and contrary to D-014 (components
  in variable-width columns use container queries).
- **Decision:** The card is a size container; the two-column layout applies when the card itself is at least
  36rem wide. Tokens, type, colours and markup order are unchanged.
- **Also:** the desktop section bar used one 32 px gap for both columns and wrapped rows; section 03 (seven pages)
  is the first to wrap, leaving a large empty band. Wrapped rows now sit directly under each other
  (`row-gap: 0`); single-row bars are unchanged.

## D-021 · Mobile menu: native modal dialog and a few lines of script, no framework
- **Date:** 29 Sep 2026 · **Status:** Approved (Phase 4.1 review, 29 Sep 2026)
- **Context:** D-001 lists Preact for islands, including the mobile menu. The Phase 4 brief asks for the smallest
  possible island, no framework unless the architecture requires it, and native HTML/CSS first. Native `<dialog>`
  already provides everything a modal menu needs.
- **Decision:**
  - `components/islands/MobileMenu.astro`: a native modal `<dialog>` (the page behind is inert; Escape closes it
    natively; "Close" is a `method="dialog"` form button) and one inline module (~430 B raw, ~270 B gzipped)
    that calls `showModal()`, keeps `aria-expanded` in sync, returns focus to "Menu" on close, and closes the
    menu if the window widens to 80rem. No Preact, no dependency.
  - Section rows are native `<details>` disclosures (current section open, current page `aria-current`). Pinned
    below: "Get investor updates", Contact, and tap-to-mail only when the email is approved.
  - Without JavaScript, "Menu" remains the Phase 2 link to the footer navigation. CSS `@media (scripting)` picks
    link or button, so nothing swaps after load (no layout shift). Desktop (from 80rem) is unchanged.
  - No animation. The mini portfolio map in row 02 (SITEMAP §5) waits for approved GIS (Q-31) and the map item.
- **Guards updated (not weakened):** client scripts are allowed only under `components/islands/`
  (design-system test); e2e pages must carry exactly the approved menu script and nothing else
  (`expectOnlyApprovedScripts`). **Bug fixed:** `scripts/check-js-budget.mjs` measured inline scripts' attribute
  text instead of their code; it now counts the code (menu pages report 0.26 KB of the 30 KB budget).
- **Consequences:** Later islands follow the same rule — native first; Preact only where state and rendering
  justify it (Q-43).

## D-022 · Interactivity: native HTML/CSS first; Preact only with a demonstrated benefit
- **Date:** 29 Sep 2026 · **Status:** Approved (Q-43, 29 Sep 2026); amends D-001
- **Decision:** "Native HTML/CSS first. Use Preact only where interaction/state/rendering complexity provides a clear
  benefit that cannot be achieved cleanly with native browser capabilities."
  - Mobile menu: native dialog + minimal script (D-021).
  - Disclosure/accordion behaviour: native `<details>`/`<summary>` where appropriate.
  - Document filters: normal links/forms/query parameters and server/static rendering first.
  - Pagefind search: the smallest appropriate client-side integration.
  - Map: a map library only when interactive GIS functionality is actually required.
  - Forms: progressive enhancement and minimal client-side behaviour.
  - Preact is not added merely because the architecture originally mentioned it; a component that genuinely needs it
    is explained (why native is insufficient) before Preact is introduced.
- **Consequences:** D-001's stack is otherwise unchanged; Preact remains available, not required. CLAUDE.md §4.1 and
  §5 updated. `docs/WEBSITE-STRATEGY.md` §6 (approved document) still says "Preact islands only where interactive";
  read it together with this decision.

## D-023 · Document filters: query strings routed by a small edge Worker to prebuilt static pages
- **Date:** 29 Sep 2026 · **Status:** Approved (Q-44 option A, 29 Sep 2026)
- **Decision:** Use a small Cloudflare Worker to provide query-string document filtering while retaining a static
  Astro site and zero client-side JavaScript for the filters. The Worker is pulled forward from the later Worker
  phase with scope strictly limited to document-filter routing; the broader document Worker (PDF proxy), contact
  API, alerts API and other edge functionality are not implemented.
- **How:** architecture, URLs, SEO behaviour, local emulation and deployment steps in `docs/WORKER.md`.
  - Filters: announcements `year`; presentations `year`; reports `year` and `type`
    (`annual`, `half-year`, `quarterly`, `notice`). Native GET form; "Clear filters" is a plain link.
  - The build generates one `noindex` page per valid state of the documents visible in that build (each year,
    each type, every year × type pair) plus one `unavailable` page per listing, at `/filtered/<listing>/<state>`.
    They reuse the listing template (`DocumentListingBody` → `DocumentLibrary` → `DocumentRegister`).
  - The Worker (`workers/edge`, dependency-free) validates the query strictly, serves the prebuilt page with
    `X-Robots-Tag: noindex`, answers malformed filters with the unavailable page (400) and out-of-data filters with
    it (404), answers direct `/filtered/…` requests with 404, never redirects, and passes everything else to static
    assets.
  - Unfiltered listings stay canonical and indexable; filtered responses canonicalise to them; `/filtered/` is
    excluded from the XML sitemap and disallowed in `robots.txt`.
  - Preview and production use the same Worker; each build's filter pages follow its own visibility rules
    (production today: no approved documents, so no filter states).
- **Not deployed.** `workers/edge/wrangler.jsonc` documents the configuration; deployment needs Q-09 and `wrangler`.
- **Also:** `Button` accepts `type="submit"`; layouts accept a `canonicalPath` override; `tests/static-server.mjs`
  runs the real Worker in front of the build so Playwright tests the same routing code.
