# PDFs, assets and forms: findings and decisions

Status: **investigation only, 30 Sep 2026. Nothing is implemented, uploaded or deployed.** Decisions: Q-47, Q-59,
Q-60 (and Q-11 for alerts). Platform facts come from Cloudflare and Sanity documentation (via search summaries; the
documentation sites are blocked from this environment) and are cited in `docs/LAUNCH-GATE.md` §1.

## 1. How documents work today (from the code)

- A document record (announcement, report, presentation, policy) has a **`file` fact** in Sanity: today a
  *string* holding the PDF's file name (`apps/studio/schemaTypes/documents/company.ts`). **There is no field for the
  PDF itself**, and no PDF has been uploaded anywhere.
- In production a document is listed only if its record, release date **and** file are approved
  (`isDocumentListable`, `apps/site/src/lib/content/visibility.ts`).
- Listed documents link to **`/documents/[slug].pdf`** (`lib/urls.ts`; used by `DocumentRegister.astro`,
  `LatestDocuments.astro` and the announcement page's "Download" button).
- **Nothing serves `/documents/[slug].pdf`.** The link-crawler test fails CI if such a link appears
  (`tests/e2e/links.spec.ts`: "PDF links need the document Worker"). So the first approved document file would turn
  CI red until PDF delivery exists — the rule fails closed, as intended.

**Consequence:** no document can appear in production until (a) PDFs are stored somewhere, (b) something serves
them at `/documents/[slug].pdf`, and (c) the link test knows which PDFs exist.

## 2. `/documents/[slug].pdf`: options (Q-59)

| Option | How | For | Against |
| --- | --- | --- | --- |
| **A. Build-time copy (recommended)** | Add a PDF file field to the document schema. At build time, download each **approved** document's PDF from Sanity into the build output as `documents/[slug].pdf`. Served as a static asset; no Worker code; the link test checks the file exists. | simplest; no runtime moving parts; only approved files reach the site; works with `_headers` (add PDF headers) | PDFs uploaded to Sanity are public by URL on `cdn.sanity.io` (even unapproved drafts) — Q-47; each PDF ≤ 25 MiB (Workers static-asset file limit); a changed PDF needs a rebuild (webhook) |
| B. Worker proxy (the original D-001 plan) | Worker route `/documents/*` looks up the slug in a build-time manifest and streams the file from Sanity's CDN | no PDF size limit from static assets; matches CLAUDE.md §4.1 | more code, a new Worker scope (D-023 is filter routing only); same Sanity exposure |
| C. Private storage (Cloudflare R2) | PDFs in a private R2 bucket; Worker serves approved slugs | files never public before approval | editors cannot upload from the Studio; a separate upload process; new Cloudflare product |
| D. Commit PDFs to the repository | files in git, copied into the build | no services | repository bloat, and every file change is a code change; approval would live outside the CMS — **not recommended** |

Changing from "Worker proxy" (CLAUDE.md §4.1) to option A is a stack decision: record it in DECISIONS.md if chosen.

Whichever option: the download link shows the file size and "PDF"; each announcement keeps its HTML page (CLAUDE.md
§7); PDF responses get `Content-Type: application/pdf`, the security headers and a cache policy; PDFs must be
text-searchable originals (accessibility: every PDF has an HTML summary page, CLAUDE.md §6).

Implementation (after the decision): schema field + typegen; mapper maps the asset; build step (A) or Worker route
(B/C); `_headers` rule for `/documents/*`; link test switches from "no PDF links" to "every PDF link exists"; e2e
for download links; docs. Roughly one reviewed step.

## 3. Sanity assets (Q-47)

- **Fact:** files and images uploaded to Sanity are **public to anyone with the URL, even in a private dataset**.
  Private assets with signed URLs are a Media Library feature (Enterprise add-on).
- Applies to: PDFs (if option A or B), figures, maps, photographs, portraits, logo files.
- Risk is limited to *unguessable* URLs of files that are not yet approved (e.g. a draft annual report uploaded
  before release). Released documents are public anyway.

| Option | Meaning |
| --- | --- |
| **A. Accept public-by-URL, with a rule (recommended)** | upload only files that are already public (released documents) or harmless before approval (photos with consent); never upload price-sensitive or unreleased documents to Sanity |
| B. Enterprise + Media Library private assets | signed URLs; highest cost |
| C. Keep files out of Sanity | R2 or other storage for PDFs (option 2C); images still need a home |

D-028 stays in force until you decide: **no real company asset is uploaded**.

## 4. Old-site preservation (before Squarespace is cancelled)

**Must happen before cut-over; once the Squarespace site is closed, its files and URLs are gone.** Needs the
Squarespace login (CS-9.4) and your authorisation; not done from this environment.

| What | Where (old site) | Why |
| --- | --- | --- |
| Annual Report 2022 | `/s/Auburn-Resources-Limited-Annual-Report.pdf` | investor register; redirect target |
| Notice of AGM 2022 | `/s/2022-Notice-of-AGM-Auburn-Resources.pdf` | same |
| Chase Mining earn-in (27 Oct 2021) | `/s/02442087.pdf` | same |
| Ripple Resources completion (10 May 2021) | `/s/02373162.pdf` | same |
| Ripple Resources agreement (12 Mar 2021) | `/s/02352809.pdf` | same |
| DGR Global quarterly (1 Feb 2021) | `/s/02336212.pdf` | decision: keep? |
| Corporate presentation (Feb 2022) | Squarespace staging domain (`porcupine-chihuahua-2pj9.squarespace.com`) | superseded? keep an archive copy |
| Every page as HTML + PDF print | all old URLs (SITEMAP §9) | provenance: the "Current website (Sep 2026)" source record (D-025) |
| Images: logo PNGs, project figures, portfolio map | Squarespace CDN | originals are wanted instead; keep as reference |
| Capital-structure image; media-coverage list | Investor Centre; Media Coverage page | provenance |

Store the archive in company storage (not the public repository), with a manifest: old URL → file name → checksum →
date captured. Then, per file: add a `redirects.csv` row `/s/<file>.pdf` → `/documents/<slug>.pdf` once that document
is approved and served (exact paths, not a wildcard; `docs/REDIRECTS.md`).

## 5. The "Get Auburn's announcements by email" strip (Q-60)

**Today:** the strip is in the footer of **every page** (`components/patterns/Footer.astro` → `SignupStrip.astro`)
and links to `/investors/alerts`. In production that page shows only its title: there is no form (forms are deferred
Phase 4 work) and no approved copy. So every page invites visitors to something that does not exist.

| Option | What it takes | Launch impact |
| --- | --- | --- |
| **A. Hide the strip in production until alerts exist (recommended if the ESP is not ready)** | a render rule: the strip renders only when an "alerts available" setting is approved; the alerts page stays (title-only or with an approved intro). Changes an approved sitemap element (footer item 1) → your approval | no dead-end call to action |
| B. Build the alerts form | ESP chosen (Q-11), double opt-in, Turnstile, Worker `/api/alerts`, privacy text (CS-4.2), CSP extended for Turnstile, accounts and secrets (C-7) | a full Phase 4 item; blocks launch until done |
| C. Interim manual list | alerts page tells visitors to email the company to subscribe (company approves the text; personal information handled under the privacy policy) | quick; manual work for the company; still needs the privacy policy |
| D. Re-point the strip to the announcements register ("See the latest announcements") | copy and link change; approval of the new wording | keeps the footer band, loses the email promise |

## 6. Contact form

Not required for launch **if** the contact page shows approved inboxes (CS-9.1). The planned form (Worker
`/api/contact`, Turnstile, Postmark) can follow; it needs the privacy policy, accounts and secrets (C-7).

## 7. Decision list

| # | Decision | Recommended | Blocks launch |
| --- | --- | --- | --- |
| 1 | Q-59 PDF delivery | Option A (build-time copy of approved PDFs), record as a stack decision | yes, if documents launch |
| 2 | Q-47 asset exposure | Accept public-by-URL with the "only already-public files" rule | yes, if documents or images launch |
| 3 | Old-site archive | Authorise capture now; store in company storage with a manifest | yes (before cut-over) |
| 4 | Q-60 alerts strip | Option A (hide until alerts exist) unless the ESP (Q-11) is chosen soon | yes |
| 5 | Contact form | Launch with approved inboxes; form after launch | no |
| 6 | Per-file redirects for old PDFs | Add once each document is approved and served | no |
