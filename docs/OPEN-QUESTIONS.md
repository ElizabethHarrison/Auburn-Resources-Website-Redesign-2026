# Open questions

Questions that need a human decision. Claude adds questions here instead of guessing; the owner records the answer
and date, and any resulting decision goes into `docs/DECISIONS.md`.

**Blocks** = what cannot proceed until answered: *build* (development work), *launch* (production go-live), or
*none* (placeholder in the meantime).

## Project owner / web team

| ID | Question | Blocks | Owner | Answer |
| --- | --- | --- | --- | --- |
| Q-01 | Approve D-003 (fixtures first, behind a content adapter)? | build (Phase 1) | Project owner | **Approved** 29 Sep 2026 → D-003 |
| Q-02 | Approve D-005 (static preview build behind Cloudflare Access, rather than live visual editing)? | build (Phase 3) | Project owner | **Approved** 29 Sep 2026 → D-005 |
| Q-03 | Approve D-006 (JS budget excludes the deferred map chunk)? | build (Phase 1 CI) | Project owner | **Approved** 29 Sep 2026: budget applies to the initial/core bundle; MapLibre excluded, lazy-loaded only when the map is needed → D-006 |
| Q-04 | Pages marked "—" in the sitemap (Contact, Disclaimer, Privacy, Terms, 404): give them sheet numbers, or exempt them from the "every page has a sheet number" rule? | build (Phase 3) | Project owner | **For now:** no sheet numbers; treated as utility/legal pages → D-010 |
| Q-05 | Project sheet numbers `02.1–02.n` collide with `02.9` (How we explore) if there are nine or more projects. Renumber How we explore (e.g. `02.0` or `02.X`) or cap the project count? | none | Project owner | |
| Q-06 | Interpretation text (CP-approved geology) will contain numbers, e.g. depths. Allowed as written once CP-approved, or must every number be a Fact reference? | build (Phase 5 schemas) | Project owner + CP | **Interim:** no final compliance decision. Preserve numbers inside approved Interpretation content; content-class rules still enforced → D-011 |
| Q-07 | Seed data's source is "Current website (Sep 2026)", which is not a stored document. Add a `source` type (website capture, third-party report, etc.) or create one "website capture" `document` record? | build (Phase 5) | Project owner | **Decided** 29 Sep 2026: internal `document` records → D-025 |
| Q-08 | Homepage CTA "Latest presentation": what should show when the newest presentation is stale (currently Feb 2022) — hide the CTA, or link to the presentations page? | none | Project owner | |
| Q-09 | Hosting accounts: which Cloudflare account and GitHub organisation own production and staging? | build (Phase 1 deploy) | Project owner | **Answered 2 Oct 2026 (temporary, D-035):** Cloudflare account login `eharrison@dgrglobal.com.au`; Elizabeth Harrison sole administrator for the initial setup. The account should move to an Auburn-controlled address before launch. A second administrator is still required before launch (`docs/DEPLOYMENT.md` §0) |
| Q-10 | Sanity plan and seat count. | build (Phase 5) | Project owner | **Answered 2 Oct 2026 (D-035):** Growth. Initial seat: Elizabeth Harrison only (temporary); further seats when the approvers are added |
| Q-11 | Email platform for alerts (does Auburn or DGR Global already use one?). | build (Phase 4 alerts form) | Project owner | |
| Q-12 | Century Gothic web-font licence — buy, or keep Didact Gothic permanently? | none (fallback in use) | Project owner | **Not now** (30 Sep 2026): no web licence; Didact Gothic stays the fallback → D-031 |
| Q-13 | Phase 2 review: approve D-012 (full header navigation from 1280 px, sheet reference from 1440 px), or prefer tighter nav spacing / smaller nav text so it fits from 1024 px? | none | Project owner |  **Approved** 29 Sep 2026: full header navigation from 1280 px; sheet number joins at 1440 px; compact menu below 1280 px → D-012 |
| Q-14 | Home key-facts strip is specified as "Status (+ DGR holding)". Show the DGR holding inside the Status cell, as a sixth cell, or not on the home page? (Catalogue currently shows five cells, holding omitted.) | build (Phase 3 home) | Project owner |  **Approved** 29 Sep 2026: no DGR holding in the homepage key-facts strip for now |
| Q-15 | Source lines are 10.5 px mono (approved). Legible, but small for older readers — keep, or raise the minimum to 11–12 px? | none | Project owner |  **Keep 10.5 px for now**; reassess after seeing real pages |
| Q-16 | Phase 2 review: approve D-013 (catalogue specimens with `approved` status, preview-only) and D-014 (container queries)? | none | Project owner |  **Approved** with Phase 2 (29 Sep 2026) → D-013, D-014 |
| Q-17 | Access to the design canvas artboards ("1b · Survey Sheet — Century Gothic", "Project page template — Nicholson") or exports, for a side-by-side comparison before Phase 3. | none | Project owner |  **Do not block**: the approved written design specification is the source of truth |
| Q-18 | The mockup map (Fig. 1) and cross-section (Fig. 2) now appear in preview, labelled indicative (D-017). Should production show them before tenement GIS / a CP-approved section exist — labelled "indicative" — or stay hidden until replaced? Showing them changes the rule that mockup geometry never ships (CLAUDE.md §3, §9). | none (preview only until decided) | Project owner + CP |  **Decided** 29 Sep 2026: keep hidden from production. Mockup-derived graphics are preview-only, labelled indicative/to verify, excluded from production by build and CI, and replaced later by approved GIS/technical figures. The content-governance rule is unchanged. |
| Q-19 | Before launch, production pages with no approved content show only their title block and navigation (legal pages: title only). Acceptable while content is approved, or should such routes be withheld (which would break approved navigation links)? (D-019) | none (launch readiness) | Project owner | **Approved** 29 Sep 2026 (D-019): acceptable as a temporary state only, not launch-ready; nothing fabricated; a content-readiness report lists such pages before launch |
| Q-43 | D-001 names Preact for islands; the mobile menu needed none (native dialog, D-021). Confirm the rule for later islands: native HTML and minimal script first, Preact only where state and rendering justify it (likely the document filters and map)? | none | Project owner | **Decided** 29 Sep 2026: native HTML/CSS first; Preact only where it gives a clear benefit native capabilities cannot → D-022 |
| Q-44 | Document filters (Phase 4.2): a static build serves the same file for `/investors/announcements` and `/investors/announcements?year=2021`, so query-string filtering cannot work without JavaScript unless something at the edge reads the query. Choose: (A) a minimal edge Worker maps `?year=&type=` to pre-rendered, noindex filtered pages (no client JS; pulls part of item 8 forward; needs deployment approval); (B) native GET form + small vanilla script filtering the static list (no-JS users get the full list with year jump-links); (C) static path-based filter pages (conflicts with SITEMAP §1 query-string rule and the three-level URL limit); (D) B now, A when the Worker lands. | build (Phase 4.2) | Project owner | **Decided** 29 Sep 2026: option A, Worker scope limited to filter routing → D-023 |
| Q-45 | Studio hosting: Sanity-hosted (`*.sanity.studio`, Sanity login) vs self-hosted on Cloudflare behind Access (extra gate, own deploy). Neither is decided or deployed; the Studio runs locally. | launch | Project owner | **Answered 2 Oct 2026 (D-035):** Sanity-hosted. Not deployed yet |
| Q-46 | Approval roles: Enterprise custom roles (CMS-enforced), or a non-Enterprise plan with tightly limited write access plus an approval audit report (D-027 launch-control limitation)? Related to Q-10. | launch | Project owner | **Answered 2 Oct 2026 (D-035):** Growth with tightly limited write access plus the approval audit. **Temporarily** one person (Elizabeth Harrison) holds both approver kinds; the final arrangement (company secretary: corporate; competent person: technical) is still required before launch |
| Q-47 | Real assets: accept public-by-URL Sanity asset CDN delivery, buy private assets (Enterprise Media Library add-on), or host assets elsewhere (e.g. behind the Worker)? No real assets are uploaded until decided (D-028). | launch (assets) | Project owner | |
| Q-48 | Security headers (D-030, Proposed, Phase 6.3): approve the policy? HSTS is sent without `includeSubDomains`/`preload` until every subdomain of auburnresources.com.au is known to serve HTTPS — confirm the subdomains (mail, legacy, DGR-hosted) and whether to preload later. | launch | Project owner | |
| Q-49 | Open Graph images (CLAUDE.md §7 "auto OG image"): one static branded card for every page, or per-page generated cards? Generation needs a new build dependency (e.g. satori + resvg) and depends on the logo (Q-40). | launch (SEO) | Project owner | |
| Q-50 | Lighthouse budgets in CI (CLAUDE.md §8): approve adding `@lhci/cli` as a dev dependency, run against the local edge server in CI? | launch (CI) | Project owner | |
| Q-51 | Monitoring: Plausible or Cloudflare Web Analytics (both cookie-free); uptime checks and Worker error alerts — which service and who receives alerts? | launch | Project owner | |
| Q-52 | Phase 5 merge method: commit `59d29a6` alone does not pass its own studio test (the files it needs arrive in `1fe3e1d`). Squash-merge the Phase 5 PR so every commit on `main` builds, or merge as is and accept the note? History on the pushed branch is not rewritten. | none | Project owner | **Merged as is** (PR #6, merge commit `944200a`, 30 Sep 2026); owner to confirm no further action |
| Q-58 | Page copy is approved as corporate content. Technical passages in page copy (How we explore; any geology in introductions) — approved by the company secretary alone, or also by the competent person? (`docs/APPROVAL-MATRIX.md`) | none | Project owner | |
| Q-59 | PDF delivery at `/documents/[slug].pdf`: (A) copy approved PDFs from Sanity into the build at build time (recommended; replaces the "Worker proxy" line in CLAUDE.md §4.1), (B) Worker proxy, (C) private R2 storage, (D) PDFs in git? Nothing serves that path today, so no document can launch (`docs/PDF-ASSETS-FORMS.md` §2). | launch (documents) | Project owner | |
| Q-60 | The footer strip "Get Auburn's announcements by email" is on every page and leads to an alerts page with no form. (A) hide it in production until alerts exist, (B) build the alerts form now (needs Q-11), (C) interim "email us to subscribe", (D) re-point it to the announcements register? (`docs/PDF-ASSETS-FORMS.md` §5) | launch | Project owner | |

## Company secretary

| ID | Question | Blocks | Answer |
| --- | --- | --- | --- |
| Q-20 | Verified current project list (drives menus, map, cards, footer, redirects). Which of Nicholson, Victoria River Downs, Calgoa, Tanumbirini, Hawkwood, Mt Abbott, Ban Ban, Gayndah, Bone Creek, Marodian are held? | launch | |
| Q-21 | ACN / ABN, phone number, current street address (Teneriffe vs Eagle Street). | launch | |
| Q-22 | Capital structure, shares on issue, major holders, registry details, IPO statement, reporting calendar. | launch | |
| Q-23 | Fate of `/2021-entitlement-offer` (archive page or redirect to announcements). | launch | |
| Q-24 | Disclaimer, Privacy and Terms text (must be supplied by the company, not drafted by us). | launch | |
| Q-25 | Governance documents as files, and 2023–2025 reports and current presentation. | launch | |
| Q-26 | Acknowledgement of Country — final approved wording. | launch | |
| Q-27 | Governance: which of the fourteen documents named on the old site are current, and their files and adoption dates? Is the Privacy Policy listed there the same text as the website privacy page? | launch | |
| Q-28 | Investor centre and Media fact sheet: confirm which key facts appear and their labels (e.g. "DGR Global holding" as the major-holder figure). | none | |

## Competent person / technical

| ID | Question | Blocks | Answer |
| --- | --- | --- | --- |
| Q-30 | Competent person(s): name, qualifications, membership, consent. | launch (any technical page) | |
| Q-31 | Tenement numbers, holders, areas, dates and GIS outlines; licence for GIS files and base-map tiles. | launch (maps) | |
| Q-32 | Treatment of HOLD exploration-target wording (Nicholson, Calgoa): restate per JORC 2012 or remove. | none (held back) | |
| Q-33 | CP-approved replacement for the schematic cross-section (Fig. 2). | launch | |
| Q-34 | Project dossier module headings are taken from the approved Nicholson mockup ("Where it sits", "Why this ground", "Where we will drill", …). "Where we will drill" is forward-looking; keep it (the module links to the disclaimer) or use the neutral kicker "Exploration targets"? | none | |
| Q-35 | Two old-site claims are stored as project setting facts rather than statements: Nicholson neighbouring deposits "Walford Creek; Century" and Tanumbirini infrastructure "Sealed Carpentaria Highway; gas pipeline". Confirm, with sources, when the setting facts are reviewed. | none | |
| Q-57 | Third-party deposit figures (McArthur River, Nova-Bollinger, Voisey's Bay) are on the site's blocked list as "unsourced". If the competent person supplies a source and date and approves them, may they be unblocked (a change to the held-back list, CLAUDE.md §9.6), or do they stay off the site? | none | |

## Brand / assets

| ID | Question | Blocks | Answer |
| --- | --- | --- | --- |
| Q-40 | Logo: vector originals, and is the logo being redesigned? (Header uses a text wordmark until then.) | none | |
| Q-41 | Field photography shoot and consistent leadership portraits — timing and consent process. | none | |
| Q-42 | Contact page office map (SITEMAP §6): static image, map island (Phase 4) or omit? | none | |
| Q-53 | The company style guide (one slide, Nov 2019) sets a palette — logo blue `#1586E2`, logo navy `#012361`, dark teal `#275259`, teal `#81B8C2`, orange `#D45A1C`, charcoal `#3B3838`, mid teal `#4899A6`, light teal `#B1D3D9`, peach `#F0AD8C`, grey `#ADA9A9` — none of which the site uses (it uses the approved "Survey Sheet" inks). Adopt the guide's palette by re-mapping the token roles (e.g. dark teal or navy for headings, orange for Auburn ground), keep Survey Sheet, or blend? Changes tokens (CLAUDE.md §9.3). (`docs/STYLE-GUIDE-AUDIT.md`) Proposal: `docs/BRAND-MIGRATION-PLAN.md` §3. | launch (brand) | **Decided** 30 Sep 2026: dark teal primary; logo colours for the logo only; orange replaces copper as the accent → D-031 |
| Q-54 | The guide's last primary swatch is drawn white but labelled "RGB: R0 G0 B0" (black). Which is intended? And should the page ground be white rather than the current warm paper `#F5F2EA`? Proposal: `docs/BRAND-MIGRATION-PLAN.md` §3. | none | **Decided** 30 Sep 2026: white (label treated as a typo) → D-031 |
| Q-55 | Is the 2019 wave-mark lock-up in the style guide the current logo (Q-40 says it may be redesigned)? Please supply vector masters (SVG + EPS/AI), a reversed version for dark backgrounds and any clear-space / minimum-size rules. The site shows a text wordmark until then. Proposal: `docs/BRAND-MIGRATION-PLAN.md` §3. | launch (brand) | **Provisional** 30 Sep 2026: 2019 lock-up treated as current; owner obtains official vectors; no tracing; no footer logo → D-031 |
| Q-56 | The guide's own title is set in Century Gothic **Bold** capitals, but it states no typography rules; the approved direction uses weight 400 only and IBM Plex Mono for labels. Is bold (and uppercase) required for headings? Is the mono face acceptable? Proposal: `docs/BRAND-MIGRATION-PLAN.md` §3. | none | **Decided** 30 Sep 2026: regular weight throughout; no faux bold → D-031 |
