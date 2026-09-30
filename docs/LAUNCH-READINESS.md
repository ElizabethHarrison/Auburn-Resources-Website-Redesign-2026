# Launch-readiness report

Required by D-019 (a content-readiness report before launch) and D-026 (overdue reviews reported in a content report).
It **reports only**: it never changes what renders, never approves anything and never fails a build for missing
content. Visibility is decided by `isRenderable` alone (CLAUDE.md §4.4).

## How it is made

1. Every build renders `/_readiness.json` (`apps/site/src/readiness/endpoint.ts`) from **that build's own content
   adapter** — so a live-Sanity production build reports on published documents and a preview build on drafts.
   `lib/readiness.ts` walks every record with the existing content audit (`lib/content/audit.ts`).
2. The `auburn:readiness` integration moves it out of the output directory, adds the build's page list and the
   redirect targets it lacks, and writes `apps/site/reports/<build>.readiness.{json,md}`. It is **never deployed**
   (a CI guard fails if any readiness file is left in a build).
3. `pnpm readiness` (after `pnpm build && pnpm build:preview`) combines production and preview into
   `apps/site/reports/launch-readiness.md`. CI uploads the `apps/site/reports/` folder as the `launch-readiness`
   artifact on every run. `apps/site/reports/` is git-ignored.

## What it lists

| Section | Meaning | Launch-ready when |
| --- | --- | --- |
| Pages withheld from production | sitemap pages in preview but not production (e.g. unapproved projects, announcements) | none |
| Published pages with no approved content of their own | pages production builds that show only their title block (D-019) | none |
| Redirect targets not published | old-site redirects that end on the 404 page until the target is approved | none |
| Review overdue | facts past their review-by date (D-026); still rendered if approved | none, or accepted |
| Approved content and who approved it | every approved slot with approver and date: the audit trail for the D-027 limitation | reviewed by the owner |
| Hidden in production, by record | every slot production hides, with its status or INPUT NEEDED brief | nothing blocking |

Today (fixtures): 319 content slots, none approved, so every published page is title-only, 8 sitemap pages are
withheld and 5 redirect targets are unpublished. That is the expected pre-approval state, not a defect.

## Tests

`apps/site/src/lib/readiness.test.ts`: reasons, approval audit, overdue detection without hiding, page-route map
against real pages, full coverage of fixture records, nothing approved in fixtures, report text.
