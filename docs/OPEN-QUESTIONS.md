# Open questions

Questions that need a human decision. Claude adds questions here instead of guessing; the owner records the answer
and date, and any resulting decision goes into `docs/DECISIONS.md`.

**Blocks** = what cannot proceed until answered: *build* (development work), *launch* (production go-live), or
*none* (placeholder in the meantime).

## Project owner / web team

| ID | Question | Blocks | Owner | Answer |
| --- | --- | --- | --- | --- |
| Q-01 | Approve D-003 (fixtures first, behind a content adapter)? | build (Phase 1) | Project owner | |
| Q-02 | Approve D-005 (static preview build behind Cloudflare Access, rather than live visual editing)? | build (Phase 3) | Project owner | |
| Q-03 | Approve D-006 (JS budget excludes the deferred map chunk)? | build (Phase 1 CI) | Project owner | |
| Q-04 | Pages marked "—" in the sitemap (Contact, Disclaimer, Privacy, Terms, 404): give them sheet numbers, or exempt them from the "every page has a sheet number" rule? | build (Phase 3) | Project owner | |
| Q-05 | Project sheet numbers `02.1–02.n` collide with `02.9` (How we explore) if there are nine or more projects. Renumber How we explore (e.g. `02.0` or `02.X`) or cap the project count? | none | Project owner | |
| Q-06 | Interpretation text (CP-approved geology) will contain numbers, e.g. depths. Allowed as written once CP-approved, or must every number be a Fact reference? | build (Phase 5 schemas) | Project owner + CP | |
| Q-07 | Seed data's source is "Current website (Sep 2026)", which is not a stored document. Add a `source` type (website capture, third-party report, etc.) or create one "website capture" `document` record? | build (Phase 5) | Project owner | |
| Q-08 | Homepage CTA "Latest presentation": what should show when the newest presentation is stale (currently Feb 2022) — hide the CTA, or link to the presentations page? | none | Project owner | |
| Q-09 | Hosting accounts: which Cloudflare account and GitHub organisation own production and staging? | build (Phase 1 deploy) | Project owner | |
| Q-10 | Sanity plan and seat count. | build (Phase 5) | Project owner | |
| Q-11 | Email platform for alerts (does Auburn or DGR Global already use one?). | build (Phase 4 alerts form) | Project owner | |
| Q-12 | Century Gothic web-font licence — buy, or keep Didact Gothic permanently? | none (fallback in use) | Project owner | |

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
