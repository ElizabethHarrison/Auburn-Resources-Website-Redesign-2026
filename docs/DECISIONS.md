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
- **Date:** 29 Sep 2026 · **Status:** Proposed
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
- **Date:** 29 Sep 2026 · **Status:** Proposed
- **Context:** The design requires a CMS preview showing status dots and "INPUT NEEDED" placeholders, while production
  must show only Approved facts. A purely static production build cannot show drafts.
- **Decision:** The same Astro codebase is built twice. `CONTENT_MODE=production` renders Approved facts only and hides
  empty modules. `CONTENT_MODE=preview` renders every status with status dots and placeholders, reads Sanity drafts,
  and deploys to a Cloudflare environment behind Cloudflare Access (not indexed). Rebuilt on CMS draft changes.
- **Alternative rejected for now:** live visual editing (Sanity Presentation), which needs server rendering.
- **Consequences:** Preview is a few minutes behind edits. Visibility logic lives in one function
  (`isRenderable(fact, mode)`).

## D-006 · Scope of the JavaScript budget
- **Date:** 29 Sep 2026 · **Status:** Proposed
- **Context:** MapLibre GL is roughly 200 KB compressed, far above the 30 KB content-page budget.
- **Decision:** The 30 KB budget applies to JS loaded on page load. The map island first renders a static SVG poster
  and loads MapLibre only on user action or when scrolled into view; that deferred chunk is budgeted separately
  and excluded from the 30 KB figure and from the home page's 500 KB initial transfer.
