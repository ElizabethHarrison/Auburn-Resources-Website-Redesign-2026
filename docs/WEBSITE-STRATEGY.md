# Website strategy — Auburn Resources

Status: approved direction, 29 September 2026. Source documents (Claude Docs): *Auburn Resources Website Audit &
Redesign Strategy*, *Auburn Resources Visual Directions*, *Auburn Resources Information Architecture*,
*Auburn Resources Technical Architecture*.

## 1. Why we are rebuilding

The current Squarespace site (audited 29 Sep 2026) undersells and in places misstates the company:

- Broken basics: every email link goes to `mailto:email@email.com`; the newsletter form has no storage configured;
  structured data names the organisation "DGR Global" with a different address.
- Stale investor centre: newest announcement 23 Dec 2022, newest presentation Feb 2022.
- Portfolio claims (10 projects, 4 flagships, 9,300 km², QLD and NT) may no longer match reality.
- No JORC cautionary, competent person or forward-looking statements.
- Weak visual credibility: stock hero photo, 54 px logo on mobile, no H1s, empty alt text, cropped figures, ~9 s load.
- 12+ orphan/draft pages indexed; governance documents listed but not linked.

## 2. Goal and positioning

**Goal:** make the website the single, current, credible source of truth about Auburn for investors, and a clear
front door for partners, media and communities.

**Positioning (working line, final wording after fact verification):**
Auburn Resources is exploring for large zinc, copper and gold deposits in under-explored ground beside some of
Australia's richest base-metal provinces.

**Core story:** the best rocks are under cover. Prospective host sequences sit beneath younger sediments, which is why
the ground is under-explored and why Auburn uses geophysics and geochemistry to see through it.

**Voice:** measured, technical, confident. Every claim carries a number, a source or a JORC-compliant qualifier.
Plain English first, detail second. Australian English.

## 3. Audiences (priority order)

1. **Prospective and existing investors** — status, disclosure, capital structure, reasons to believe.
2. **Mining industry professionals** — credible geology, sound data, figures, competent person.
3. **Potential project partners** — tenure, geology, stage, who to talk to.
4. **Journalists and researchers** — facts, images, contacts, fast.
5. **General visitors** — landholders, communities, job-seekers: who Auburn is, where it works, how to reach it.

Journeys for each are in `SITEMAP.md` §7.

## 4. Principles

1. Five numbered sections like map sheets: 01 Company · 02 Projects · 03 Investors · 04 Sustainability · 05 News.
2. Built around the investor: permanent "Investor updates" button; deepest section is Investors.
3. Every fact has one home (CMS) and flows everywhere it appears.
4. Projects come from a single verified list.
5. Short, permanent URLs; nothing orphaned; every old URL redirects.
6. Facts, interpretation and narrative are visibly distinct (see `CLAUDE.md` §2).

## 5. Homepage structure (approved)

| # | Section | Content | CTA |
| --- | --- | --- | --- |
| 1 | Header / title block | Wordmark, sheet ref "SHEET 00 · HOME", numbered nav, Contact, "Investor updates" (outlined) | Investor updates |
| 2 | Hero | Mono kicker "ZINC · COPPER · GOLD / QUEENSLAND & NORTHERN TERRITORY"; H1 (working): "Exploring the ground beside Australia's great base-metal deposits."; one-paragraph intro; Fig. 1 portfolio map (contour lines, Auburn ground in copper, reference deposits in outline, legend box, graticule, scale bar, north arrow) | Primary: Explore the projects · Secondary: Latest presentation |
| 3 | Key facts strip | 5 ruled cells: Projects · Ground held · Commodities · Jurisdictions · Status (+ DGR holding); as-at date | — |
| 4 | 02 Projects | "The portfolio, sheet by sheet": one map-sheet card per flagship (sheet no., state, name, commodity tag, one line, "Read the dossier →") | All projects and the full map |
| 5 | Why this ground | "Under-explored because the answer is under cover." + Fig. 2 schematic cross-section with legend | How we explore |
| 6 | 03 Investors | "The register": key-facts title block + latest documents table (ref, date, type, document, file) + filters | Get email alerts · View the full register |
| 7 | News | Latest two articles | — |
| 8 | Sustainability teaser | One sentence + link | — |
| 9 | Footer | Sign-up strip; four link columns; acknowledgement of Country; legal row | Subscribe |

All figures in the key-facts strip must come from Approved facts; until then, placeholders.

## 6. Technical decisions (approved)

**Option chosen: Astro + Sanity + Cloudflare** (static-first). Rejected: Next.js + Payload (more ops; better only if a
shareholder portal is needed soon); WordPress (security/plugin burden; weak fact-verification workflow).

| Concern | Decision |
| --- | --- |
| Frontend | Astro static output, TypeScript; Preact islands only where interactive |
| Styling | Plain CSS + tokens; scoped component styles; no utility framework |
| CMS | Sanity hosted; custom Studio with validation (no digits in narrative, source required for facts) and roles |
| Roles | Editor · Company secretary (approves corporate facts, publishes announcements) · Competent person (approves technical facts) · Admin. SSO + 2FA |
| Images | Sanity image CDN (AVIF/WebP, responsive) |
| Maps | MapLibre GL, GeoJSON tenements, static SVG first paint, lazy-load on view/tap |
| Documents | Sanity assets, permanent `/documents/[slug].pdf` via Worker; each announcement also gets an HTML page |
| Announcements | `document` type, scheduled publishing, publish → rebuild (live < 3 min) → optional subscriber email |
| Search | Pagefind |
| Forms | Cloudflare Worker + Turnstile; Postmark for enquiries; Mailchimp or Campaign Monitor (TBC) for alerts, double opt-in |
| Analytics | Plausible or Cloudflare Web Analytics; Search Console; Bing Webmaster |
| Hosting/deploy | Cloudflare; GitHub PR → CI → merge; CMS publish webhook triggers content builds; atomic deploys, 1-click rollback |
| Environments | Preview per PR (staging dataset) · Staging · Production |
| SEO | Per-page meta, canonical, sitemap, JSON-LD (Organization with correct legal name; BreadcrumbList; Article; Place on projects), auto OG images, 301s from all old URLs |
| Performance | LCP < 2.0 s, CLS < 0.05, INP < 200 ms, JS < 30 KB on content pages, home < 500 KB, Lighthouse ≥ 95 |
| Accessibility | WCAG 2.2 AA; axe in CI; manual VoiceOver/NVDA before launch; text equivalents for maps; HTML summaries for PDFs |
| Security | No public server/DB; CSP, HSTS and security headers; secrets in Cloudflare/GitHub; Renovate; nightly Sanity export |

### Open decisions (do not block scaffolding)

- Sanity plan and seat count (check current pricing)
- Century Gothic web-font licence (or licensable alternative); until licensed, use fallback stack in `DESIGN-DIRECTION.md`
- Email platform (does Auburn or DGR Global already use one?)
- Source and licence of tenement GIS files and base-map tiles
- Fate of `/2021-entitlement-offer` (company secretary)

## 7. Build phases

1. **Scaffold:** monorepo, Astro site, Studio, tokens, base layout, header/footer, CI with budgets.
2. **Content model:** Sanity schemas + validation + roles; seed staging with `CONTENT-SOURCE.md` data as `toVerify`.
3. **Templates:** Home → Project dossier → Investor centre + Document library → remaining pages.
4. **Islands:** portfolio/project map, document filter + Pagefind, mobile menu, strat-column nav, lightbox, forms.
5. **SEO & redirects:** meta, JSON-LD, OG images, `redirects.csv`, sitemap.
6. **Hardening:** accessibility pass, performance pass, security headers, monitoring.
7. **Migration & approval:** company secretary and CP approve facts; photography; launch cut-over.
