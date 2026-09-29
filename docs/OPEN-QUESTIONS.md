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
| Q-07 | Seed data's source is "Current website (Sep 2026)", which is not a stored document. Add a `source` type (website capture, third-party report, etc.) or create one "website capture" `document` record? | build (Phase 5) | Project owner | |
| Q-08 | Homepage CTA "Latest presentation": what should show when the newest presentation is stale (currently Feb 2022) — hide the CTA, or link to the presentations page? | none | Project owner | |
| Q-09 | Hosting accounts: which Cloudflare account and GitHub organisation own production and staging? | build (Phase 1 deploy) | Project owner | **Deferred:** do not configure production accounts yet; placeholders and documentation only (docs/ENV.md §4) |
| Q-10 | Sanity plan and seat count. | build (Phase 5) | Project owner | |
| Q-11 | Email platform for alerts (does Auburn or DGR Global already use one?). | build (Phase 4 alerts form) | Project owner | |
| Q-12 | Century Gothic web-font licence — buy, or keep Didact Gothic permanently? | none (fallback in use) | Project owner | |
| Q-13 | Phase 2 review: approve D-012 (full header navigation from 1280 px, sheet reference from 1440 px), or prefer tighter nav spacing / smaller nav text so it fits from 1024 px? | none | Project owner |  **Approved** 29 Sep 2026: full header navigation from 1280 px; sheet number joins at 1440 px; compact menu below 1280 px → D-012 |
| Q-14 | Home key-facts strip is specified as "Status (+ DGR holding)". Show the DGR holding inside the Status cell, as a sixth cell, or not on the home page? (Catalogue currently shows five cells, holding omitted.) | build (Phase 3 home) | Project owner |  **Approved** 29 Sep 2026: no DGR holding in the homepage key-facts strip for now |
| Q-15 | Source lines are 10.5 px mono (approved). Legible, but small for older readers — keep, or raise the minimum to 11–12 px? | none | Project owner |  **Keep 10.5 px for now**; reassess after seeing real pages |
| Q-16 | Phase 2 review: approve D-013 (catalogue specimens with `approved` status, preview-only) and D-014 (container queries)? | none | Project owner |  **Approved** with Phase 2 (29 Sep 2026) → D-013, D-014 |
| Q-17 | Access to the design canvas artboards ("1b · Survey Sheet — Century Gothic", "Project page template — Nicholson") or exports, for a side-by-side comparison before Phase 3. | none | Project owner |  **Do not block**: the approved written design specification is the source of truth |

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

## Competent person / technical

| ID | Question | Blocks | Answer |
| --- | --- | --- | --- |
| Q-30 | Competent person(s): name, qualifications, membership, consent. | launch (any technical page) | |
| Q-31 | Tenement numbers, holders, areas, dates and GIS outlines; licence for GIS files and base-map tiles. | launch (maps) | |
| Q-32 | Treatment of HOLD exploration-target wording (Nicholson, Calgoa): restate per JORC 2012 or remove. | none (held back) | |
| Q-33 | CP-approved replacement for the schematic cross-section (Fig. 2). | launch | |

## Brand / assets

| ID | Question | Blocks | Answer |
| --- | --- | --- | --- |
| Q-40 | Logo: vector originals, and is the logo being redesigned? (Header uses a text wordmark until then.) | none | |
| Q-41 | Field photography shoot and consistent leadership portraits — timing and consent process. | none | |
