# Sitemap and information architecture

Approved 29 Sep 2026. About 25 fixed pages plus 3 templates (project, announcement, article). Max three levels.

## 1. Page hierarchy and URLs

| Sheet | Page | URL | Template |
| --- | --- | --- | --- |
| 00 | Home | `/` | Home |
| 01 | Company overview | `/company` | SectionLanding |
| 01.1 | Leadership | `/company/leadership` | ContentPage (people) |
| 02 | Projects (portfolio) | `/projects` | Portfolio |
| 02.1–02.n | Project (template) — one per **verified** project, e.g. Nicholson, Calgoa, Victoria River Downs, Tanumbirini, Hawkwood | `/projects/[slug]` | ProjectDossier |
| 02.9 | How we explore | `/projects/how-we-explore` | ContentPage |
| 03 | Investor centre | `/investors` | SectionLanding |
| 03.1 | Announcements | `/investors/announcements` | DocumentLibrary |
| 03.1.x | Announcement (template) | `/investors/announcements/[yyyy-mm-dd-slug]` | DocumentDetail |
| 03.2 | Reports | `/investors/reports` | DocumentLibrary |
| 03.3 | Presentations | `/investors/presentations` | DocumentLibrary |
| 03.4 | Shareholder information | `/investors/shareholders` | ContentPage |
| 03.5 | Governance | `/investors/governance` | ContentPage + documents |
| 03.6 | Email alerts | `/investors/alerts` | Form |
| 04 | Sustainability | `/sustainability` | SectionLanding |
| 04.1 | Community and Country | `/sustainability/community` | ContentPage |
| 04.2 | Environment and safety | `/sustainability/environment-safety` | ContentPage |
| 05 | News | `/news` | ArticleIndex |
| 05.x | Article (template) | `/news/[slug]` | Article |
| 05.1 | Media | `/news/media` | ContentPage |
| — | Contact | `/contact` | Form |
| — | Disclaimer (JORC, CP, forward-looking) | `/disclaimer` | Legal |
| — | Privacy | `/privacy` | Legal |
| — | Terms of use | `/terms` | Legal |
| — | 404 | — | Utility |
| — | Component catalogue (noindex) | `/_catalogue` | Internal |

**URL rules:** lowercase, hyphens, no extensions/IDs; announcements prefixed with release date; PDFs at
`/documents/[same-slug].pdf`; filters via non-indexed query strings (`?year=2026&type=quarterly`); relinquished projects
keep their page marked "No longer held".

## 2. Primary navigation

Left: wordmark → `/` · sheet reference (not a link).
Centre-right: `01 Company` · `02 Projects` · `03 Investors` · `04 Sustainability` · `05 News`.
Right: `Contact` (text link) · **Investor updates** (outlined button → `/investors/alerts`).

Panels open on **click** (not hover), close on `Escape`, fully keyboard accessible; section names also link to landing pages.
- 01 panel: Overview, Leadership
- 02 panel ("sheet index"): mini clickable portfolio map + project list + How we explore
- 03 panel: six investor pages + latest announcement with date
- 04 panel: Overview, Community and Country, Environment and safety
- 05: direct link, no panel

## 3. Secondary navigation

- **Section bar** under header on every in-section page: sibling pages with sheet numbers; current underlined.
- **Breadcrumb** (mono) above each title.
- **In-page index** on long pages; on project pages it is the strat-column nav.
- **Document filters** shared by all investor document pages: type, year, search (Pagefind).
- **Previous / next** on project pages.

## 4. Footer

1. Sign-up strip: "Get Auburn's announcements by email" + email field + Subscribe + privacy link.
2. Four columns: **01 Company** (Overview, Leadership, 04 Sustainability, 05 News, Media) · **02 Projects** (Portfolio
   map, each verified project, How we explore) · **03 Investors** (Investor centre, Announcements, Reports,
   Presentations, Shareholder information, Governance) · **Contact** (street address, postal address, email, phone, LinkedIn).
3. Legal row: acknowledgement of Country (full sentence); mono line: Auburn Resources Limited · ACN [number] ·
   Disclaimer · Privacy · Terms · © [year].

## 5. Mobile navigation

- 56 px header: wordmark + "Menu" (word, not icon only). Sheet ref moves to breadcrumb line.
- Full-screen menu on paper: five numbered rows (accordion); 02 shows a mini map; pinned bottom: full-width
  "Get investor updates", Contact, tap-to-mail.
- Section bar → horizontally scrolling chips. Project strat-column → sticky "Sections" chip opening a bottom sheet.
- Maps/figures full width with "View full screen" + pinch zoom; legends below.
- Document tables → cards; filters collapse into one "Filter" button. Touch targets ≥ 44 px.

## 6. Page specifications

Format: **Purpose** · **Audience** · **Primary CTA** · **Secondary CTA** · **Key information** · **Sections (in order)**.

### 00 Home `/`
Purpose: what, where, why now; route each audience. Audience: investors first. CTA: Explore the projects ·
Latest presentation. Key info: positioning, key facts (verified, dated), portfolio map, latest announcements.
Sections: see `WEBSITE-STRATEGY.md` §5.

### 01 Company overview `/company`
Purpose: who Auburn is, strategy, structure. Audience: investors, partners, general. CTA: Explore the projects ·
Meet the leadership. Key info: status, history, strategy/pathway, DGR Global relationship and shareholding, head office.
Sections: title block · who we are · strategy (horizontal sequence) · relationship with DGR Global · milestone timeline
(verified dates only) · leadership teaser · footer.

### 01.1 Leadership `/company/leadership`
Purpose: board and management credibility. Audience: investors, partners, journalists. CTA: Read the governance
framework · Contact the company secretary. Key info: name, role, qualifications, bio, independence, directorships,
committees. Sections: title + index · Board cards · Management cards · company secretary · link to Governance.

### 02 Projects `/projects`
Purpose: whole portfolio at a glance. Audience: investors, professionals, partners. CTA: open a project ·
How we explore. Key info: each verified project with location, commodity, area, ownership, stage; reference deposits;
total ground held (as-at). Sections: title + summary · interactive portfolio map (Fig. 1) · filters (commodity, state,
stage) · project index cards · exploration pipeline by stage · link to How we explore · disclaimer note.

### 02.x Project `/projects/[slug]`
See §8.

### 02.9 How we explore `/projects/how-we-explore`
Purpose: exploration approach across the portfolio (the under-cover thesis). Audience: professionals, curious investors.
CTA: Explore the projects · Get investor updates. Sections: title + thesis · why under-explored (Fig. 2) · toolkit
(one block per method with an Auburn example figure) · target-to-drill-hole sequence · back to portfolio.

### 03 Investor centre `/investors`
Purpose: current position in one screen. Audience: shareholders, brokers. CTA: Get investor updates · Download latest
presentation. Key info: key-facts title block (status, shares on issue, major holders, IPO status, as-at), latest
announcement/report/presentation, reporting calendar, investor contact. Sections: title · key facts · three "latest"
cards · register (last 8) · reporting calendar · quick links · contact.

### 03.1 Announcements `/investors/announcements`
Purpose: complete searchable record. CTA: open/download · subscribe. Sections: title · filter row · register table
(paginated by year) · alerts strip.

### 03.1.x Announcement `/investors/announcements/[date-slug]`
Purpose: permanent linkable page per announcement. CTA: Download PDF · View related project. Sections: title block
(date, ref) · plain-language summary · PDF download + preview · related project and announcements.

### 03.2 Reports `/investors/reports`
Annual, half-yearly, quarterly. CTA: latest annual report · all announcements. Sections: title · latest feature ·
filter + table.

### 03.3 Presentations `/investors/presentations`
CTA: current corporate presentation · Get investor updates. Sections: title · current feature (date, cover) · archive.

### 03.4 Shareholder information `/investors/shareholders`
Purpose: practical questions about unlisted shares. CTA: Contact share registry · Contact company secretary.
Sections: title · capital structure (HTML table, as-at) · major shareholders · IPO status (one dated paragraph) ·
how to invest in an unlisted company · registry details · FAQs (accordion).

### 03.5 Governance `/investors/governance`
CTA: Download corporate governance statement · Meet the leadership. Sections: title + index · approach · board and
committees · policies and charters (all linked) · constitution · whistleblower and contact.

### 03.6 Email alerts `/investors/alerts`
CTA: Subscribe · Read latest announcement. Sections: title · form (name, email, alert types: announcements, reports,
news) · privacy note. Double opt-in.

### 04 Sustainability `/sustainability`
Purpose: ESG in specific, verifiable terms. CTA: Community and Country · policies. Sections: title + acknowledgement of
Country · approach (3–4 specific commitments) · two cards · who is responsible.

### 04.1 Community and Country `/sustainability/community`
Audience: landholders, Traditional Owners, communities, ESG investors. CTA: Contact us about a project area · See where
we work. Sections: working on Country · landholders and land access · local participation · community contact.
Name Traditional Owner groups only with consent.

### 04.2 Environment and safety `/sustainability/environment-safety`
CTA: policies · contact. Sections: environment and rehabilitation (before/after photos if available) · health and
safety · policies.

### 05 News `/news`
CTA: latest article · Get investor updates. Sections: featured article · filter (exploration updates, company news,
in the media) · list · link to Media.

### 05.x Article `/news/[slug]`
CTA: read full announcement · view project. Sections: title (date, project tag) · lead · body with images/figures ·
linked announcement + project · more news. Disclaimer where results are reported.

### 05.1 Media `/news/media`
CTA: contact media contact · download media kit. Sections: media contact · fact sheet (verified, dated) · downloads
(kit, logos, images, portraits) · coverage list.

### Contact `/contact`
CTA: send enquiry · call/email. Form enquiry types: Investors · Partnerships · Media · Landholder or community ·
General (each routes to a named inbox). Sections: form · direct contacts by type · office address + map.

### Disclaimer / Privacy / Terms
Title + last-updated date, numbered clauses. Disclaimer holds forward-looking statements, JORC 2012 basis, competent
persons, no offer of securities. **Legal text must be supplied by the company — do not draft it.**

### 404
"Unmapped sheet" message · search documents · links to the five sections.

## 7. User journeys

- **Prospective investor:** Home (hero, key facts, map) → Projects → a flagship project → Investor centre (recent
  activity) → Shareholder information (how to invest, IPO) → Leadership → **Subscribe** / download presentation.
- **Industry professional:** lands on a project page from search → key-facts margin → strat-column sections → figures
  full screen, captions, CP statement → related announcements → How we explore → **download announcement/figures**.
- **Project partner:** Projects (map + stage filter) → 2–3 project pages (tenure, ownership, JVs) → Leadership →
  Governance → **"Discuss a partnership"** (Contact, type Partnerships → CEO).
- **Journalist / researcher:** News or article → linked announcement → Media (fact sheet, images) → Leadership →
  **contact media contact**.
- **General visitor:** Home on mobile → plain-English intro + map → Sustainability → Community and Country →
  **Contact** (type Landholder or community) or phone.

## 8. Project page template

Module order, visual form and empty-state behaviour:

| # | Module | Visual form | Content class | If empty |
| --- | --- | --- | --- | --- |
| — | Hero | Title block (breadcrumb, H1, tags: commodity, state, stage; thesis ≤120 chars, no digits; CTAs "Latest [project] announcement" + "Discuss a partnership") beside full-height field photo | Fact + narrative | Photo falls back to location map |
| — | Key-facts strip | Six ruled cells: location, commodity, area, tenements, ownership, as-at | Fact | Cell drops; ownership + area required to publish |
| 01 | Setting | Fig. 1 inset map + fact list (neighbouring deposits, nearest town, access, infrastructure, Traditional Owners) | Fact | Map required |
| 02 | Geological setting | ≤120 words beside Fig. 2 cross-section | Interpretation (CP) | Hidden |
| 03 | Exploration history | Counter row (quantities) + timeline (to scale only when all items dated) | Fact | Hidden |
| 04 | Existing resources | Table: category, Mt, grades, contained metal, cut-off, date, source | Fact (CP) | Hidden — never an empty table |
| 05 | Exploration targets | Numbered target cards keyed to map pins; optional JORC Exploration Target block with ranges + cautionary statement | Interpretation; ranges are facts | Hidden |
| 06 | Key results | ≤3 highlight cards (interval @ grade from depth, hole, prospect, reported date, announcement, CP) | Fact | Hidden |
| 07 | Photography | Asymmetric gallery + lightbox | Narrative + fact metadata | Hidden |
| 08 | Milestones | Four-step track: done · done · next (highlighted) · planned | Fact / forward-looking | Hidden |
| 09 | Documents | Register filtered by project tag | Fact | Hidden |
| — | Related sheets | Up to 3 cards (same commodity, else same state) + prev/next | System | Prev/next always |
| — | CTA band | "Get investor updates" · "Discuss a partnership" | Narrative | Always |
| — | Compliance | CP statement + disclaimer link + page as-at date | Fact | Required when 02/04/05/06 shown |

### Content model (Sanity document types)

Shared object **`factMeta`** on every fact: `sourceDocument` (ref → document, required), `asAt` (date),
`status` (`draft | toVerify | approved | superseded`), `approvedBy` (ref → person), `reviewBy` (date, default asAt + 12 months).

| Type | Key fields |
| --- | --- |
| `siteSettings` (singleton) | legal name, ACN, addresses, contacts, key facts (each with factMeta), default SEO |
| `project` | name, slug, sheetNumber, status (active/underReview/noLongerHeld), state, commodities[], stage (targetGeneration/drillReady/drilling/resourceDefinition), areaKm2, ownership {holder, percent, jvPartner, jvTerms}, locationFacts, traditionalOwners, heroThesis (≤120, no digits), geologySummary (≤120 words), heroPhoto, gallery[], figures[], competentPerson, relatedOverride[] |
| `tenement` | number, project, holder, areaKm2, grantDate, expiryDate, status, geojson |
| `prospect` | name, project, point, targetType, evidence, status, explorationTarget? {tonnageRange, gradeRange, basis, cautionaryStatement} |
| `result` | project, prospect, holeOrSurveyId, interval, fromDepth, grades, gradeBasis, reportedIn (document) |
| `resourceEstimate` | project, category, tonnes, grades, containedMetal, cutOff, estimateDate, competentPerson |
| `workItem` | project, method, quantity, unit, year, operator (auburn/historic) |
| `milestone` | project, title, quarter, state (done/next/planned) |
| `figure` | file, figureType (map/section/geophysics/other), caption, alt, longDescription, source, date |
| `photo` | image, caption, alt, date, place, photographer, consentNote |
| `document` | ref, title, docType (announcement/quarterly/halfYear/annual/presentation/policy/notice/other), releaseAt, summary, pdf, projects[], sendAlert, slug |
| `article` | title, slug, date, lead, body (portable text), projects[], linkedDocument |
| `person` | name, role, bio, qualifications, portrait, cpMembership, cpConsent |
| `referenceDeposit` | name, owner, point, publishedFigures (with source + date) |
| `page` | title, slug, sheetNumber, modules[] (fixed set), seo |
| `redirect` | from, to, permanent |

Studio guardrails: narrative fields reject digits; facts cannot leave Draft without a source; only secretary/CP roles
can approve; slug change auto-creates a redirect; production renders Approved facts only.

## 9. Redirects (301) from the current site

| Current | New |
| --- | --- |
| `/about-us`, `/about` | `/company` |
| `/home`, `/home-1`, `/home-2`, `/home-impact`, `/welcome` | `/` |
| `/board-of-directors-and-management` | `/company/leadership` |
| `/corporate-governance`, `/corporate-governance-1`, `/corporate-governance-2` | `/investors/governance` |
| `/project-portfolio`, `/projects` | `/projects` |
| `/nicholson-project` | `/projects/nicholson` |
| `/calgoa-project` | `/projects/calgoa` |
| `/tanumbirini-project` | `/projects/tanumbirini` |
| `/hawkwood-project` | `/projects/hawkwood` |
| `/victoria-river-downs` | `/projects/victoria-river-downs` |
| `/investor-centre`, `/investor-center`, `/investors` | `/investors` |
| `/presentations` | `/investors/presentations` |
| `/email-alerts`, `/auburnresources` | `/investors/alerts` |
| `/media-coverage` | `/news/media` |
| `/contact-us`, `/contact-us-1` | `/contact` |
| `/cart` | `/` |
| `/2021-entitlement-offer` | **TBC by company secretary** (archive page or `/investors/announcements`) |
| `/s/*.pdf` (old Squarespace files) | matching `/documents/[slug].pdf` once re-hosted |

If a project is confirmed no longer held, keep its redirect target and mark the page "No longer held".
