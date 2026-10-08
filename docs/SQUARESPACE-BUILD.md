# Build the new Auburn site on Squarespace 7.1

Status: **prepared 8 Oct 2026 (D-037). Not built.** The owner chose to launch a **new** Squarespace 7.1 site with the
"Survey Sheet" design and the approved page structure, then move the domain to it. The Astro / Cloudflare / Sanity
build stays in this repository, paused (nothing deleted).

Files:
- `squarespace/auburn-restyle.css` — the whole look (paste once into Custom CSS).
- `squarespace/snippets.html` — Code-block HTML for what Squarespace has no block for: key-facts strip, document
  register table, numbered figure, compliance note, placeholder.

🖱 = a step in the Squarespace dashboard. ⚠️ = hard to undo: stop and check before clicking.

---

## 0. Rules that still apply (CLAUDE.md §2)

Squarespace has no approval system, so these are now kept by hand:

- **Numbers only from approved sources.** Every figure (projects, area, ownership, shares, dates, results) must be
  approved in writing: corporate facts by the company secretary, technical facts by the competent person, with a source
  and as-at date. Until then, use the `INPUT NEEDED` placeholder from `snippets.html`.
- **Never publish a page that shows `INPUT NEEDED`.** Hide the page (or the section) instead. Keep the whole site
  private until §11 passes.
- **Never use the HOLD items:**
  - "Potential for 40Mt resource @ 10% Zn-Pb";
  - "+200Mt sulphide / +25Mt oxide";
  - the outdated Hawkwood work plan;
  - the 2021 entitlement offer.
- **Legal text** (disclaimer, privacy, terms, competent person statements) is supplied by the company. Do not write it.
- **Traditional Owner groups** are named only with recorded consent. Never show cultural sites without permission.
- **No stock photography; no images of text.** Tables are real tables (snippet 2), and every image has alt text.
- **Indicative artwork stays out.** The mockup portfolio map, project positions and the schematic cross-section are
  indicative only. Use real, approved maps or leave the figure out.
- **Writing style:**
  - Australian English;
  - dates as `08 Oct 2026`;
  - units with a space (`100 m`, `km²`);
  - measured, not promotional.

---

## 1. Create the site

1. 🖱 squarespace.com → log in → **Websites** → **Create website** (or **+ New website**).
2. Pick any template, preferably the plainest one; everything visual is overridden. If offered **Start from scratch** or
   a **blank** template, take it. Check it is 7.1: the left panel shows **Website** and the Site Styles paintbrush.
3. Site title: **Auburn Resources**.
4. 🖱 **Settings → Website → Site availability** → **Password protected** (or **Private**). A trial site is private
   already. It stays that way until §11.
5. Delete the template's demo pages and demo blog posts as you replace them.

**Plan:** Code blocks (snippets) need **Core** or higher. Buy the plan only when you are ready to launch (§12). The trial
works for building.

## 2. Styles

1. 🖱 Site Styles (paintbrush):
   - **Fonts:**
     - Headings and Paragraphs: **Didact Gothic**.
     - Assign **IBM Plex Mono** to one style (e.g. Miscellaneous / Meta) so it loads.
     - Do not upload Century Gothic: it has no web licence.
   - **Colours:**
     - Palette: `#FFFFFF`, `#B1D3D9`, `#81B8C2`, `#275259`, `#3B3838`.
     - Section themes: keep the **White**, **Light** and **Dark** themes. The CSS repaints them as white, light teal
       and dark teal.
   - **Buttons:** shape **Square**.
   - **Animations:** **None**.
2. 🖱 **Website → Website Tools → Custom CSS** → paste all of `squarespace/auburn-restyle.css` → **Save**.

**Headings.** Use Heading 1 once per page (the page title). Section titles are Heading 2, and nothing below Heading 3.

**Mono labels and kickers.** In the text editor's style menu:
- **Paragraph 3** (small) gives the mono label, e.g. `SHEET 02 · PROJECTS`.
- **Paragraph 1** (large) gives the lead paragraph.

## 3. Section bands (same as the new site, D-032)

Each section: hover → **Edit section** (pencil) → **Colours** → theme.

| Theme | Use |
| --- | --- |
| **White** | Default. Titles, prose, tables, facts, figures, legal pages, forms. |
| **Light** | Cards and supporting sections (marked *Light* in §5–§9). |
| **Dark** | One feature section per page at most (marked *Dark*). Never the section just above the footer. |

No orange anywhere: it is reserved for Auburn's ground on real maps. Images, figures and placeholders sit on white.

## 4. Pages, navigation and URLs

🖱 **Website → Pages**. The main navigation is built from top-level items:
- Use **+ → Folder** for a dropdown.
- Use **+ → Page → Blank** for a page.
- Use **+ → Collection → Blog** for News.

Set each page's URL in its ⚙️ settings → **URL slug**.

| Navigation item | Pages inside (dropdown order) | URL slug |
| --- | --- | --- |
| Folder **01 Company** | Overview | `company` |
| | Leadership | `company/leadership` |
| Folder **02 Projects** | Portfolio | `projects` |
| | one page per **verified** project, e.g. Nicholson | `projects/nicholson` |
| | How we explore | `projects/how-we-explore` |
| Folder **03 Investors** | Investor centre | `investors` |
| | Announcements | `investors/announcements` |
| | Reports | `investors/reports` |
| | Presentations | `investors/presentations` |
| | Shareholder information | `investors/shareholders` |
| | Governance | `investors/governance` |
| | Email alerts | `investors/alerts` |
| Folder **04 Sustainability** | Overview | `sustainability` |
| | Community and Country | `sustainability/community` |
| | Environment and safety | `sustainability/environment-safety` |
| Blog **05 News** | (articles are posts) | `news` |
| **Contact** | — | `contact` |
| *Not linked* (under **Not linked**) | Media | `news/media` |
| | Disclaimer | `disclaimer` |
| | Privacy | `privacy` |
| | Terms of use | `terms` |

Notes:
- **Slashes in slugs.** If Squarespace refuses a `/` in a slug, use a hyphen instead (`company-leadership`). Then add a
  URL mapping from the slash form so the documented address still works (§10).
- **Project pages.** Only projects the company confirms are still held get a page. Order them by sheet number (02.1,
  02.2 …) as the company confirms them.
- **Folders don't open a page in 7.1.** The section landing page is the first item in its dropdown ("Overview",
  "Portfolio", "Investor centre").
- **Media** is linked from the News page and the footer, not the main navigation.
- **404:** 🖱 Settings → Website → **Not found / 404 page** → a Not-linked page titled **Unmapped sheet**:
  - one line saying the page is not on this map;
  - links to the five sections and Contact.

**Each page starts with a title section** (White):
- Paragraph 3 label `SHEET 01 · COMPANY` (the page's sheet number from `docs/SITEMAP.md` §1);
- Heading 1 title;
- Paragraph 1 lead;
- the page's buttons: primary first, then secondary.

## 5. Header and footer

**Header** 🖱 (hover the header → **Edit site header**):
- Layout with the title left and navigation right.
- Site title text "Auburn Resources" until the official vector logo arrives (Q-55). Do not trace or redraw it.
- **Elements → Button: on** → label **Investor updates** → link `/investors/alerts`. The CSS outlines it.
- Colour: White theme.

**Footer** 🖱 (scroll down → **Edit footer**). The CSS paints it dark teal. Build three sections:
1. **Sign-up strip.**
   - Heading 3 "Get Auburn's announcements by email".
   - A **Newsletter** block (§8).
   - A link to `/privacy`.
2. **Four columns** (text blocks side by side):

   | Column | Links |
   | --- | --- |
   | **01 Company** | Overview, Leadership, 04 Sustainability, 05 News, Media |
   | **02 Projects** | Portfolio, each verified project, How we explore |
   | **03 Investors** | Investor centre, Announcements, Reports, Presentations, Shareholder information, Governance |
   | **Contact** | Street address, postal address, email, phone, LinkedIn |

   Contact details only as the company confirms them. Never `email@email.com`.
3. **Legal row.**
   - The acknowledgement of Country, using the company's wording only (Q-26). Until it arrives, leave a placeholder;
     the site stays private.
   - A Paragraph 3 line: `Auburn Resources Limited · ACN [INPUT NEEDED] · Disclaimer · Privacy · Terms · © [year]`.

## 6. Home (sections in this order: WEBSITE-STRATEGY §5)

| # | Section | Theme | Build |
| --- | --- | --- | --- |
| 1 | Header | — | §5 |
| 2 | Hero | White | Label `ZINC · COPPER · GOLD / QUEENSLAND & NORTHERN TERRITORY`. H1 "Exploring the ground beside Australia's great base-metal deposits." (working title; the owner may change it). One intro paragraph (company-approved). Buttons: **Explore the projects** → `/projects` (primary) and **Latest presentation** → `/investors/presentations` (secondary). Fig. 1 portfolio map only when a real, approved map exists (snippet 3); otherwise leave it out. |
| 3 | Key facts | White | Snippet 1 (five cells + as-at line). |
| 4 | The portfolio, sheet by sheet | **Light** | Label `02 PROJECTS`. One card per flagship project: a Text block per card, or a Summary block if projects are kept as a collection. Each card has the sheet number, state, name, commodity, one line and "Read the dossier →". Then a link "All projects and the full map" → `/projects`. |
| 5 | Why this ground | **Dark** | H2 "Under-explored because the answer is under cover." The text comes from the approved How-we-explore wording. Fig. 2 is left out: the cross-section is indicative only. Button **How we explore** → `/projects/how-we-explore` (white on dark). |
| 6 | The register | White | Label `03 INVESTORS`. Snippet 1 (investor facts) and snippet 2 (latest documents). Buttons **Get email alerts** → `/investors/alerts` and **View the full register** → `/investors/announcements`. |
| 7 | News | **Light** | **Summary block** → the News blog, 2 items, list or grid, title + date + excerpt. |
| 8 | Sustainability | White | One sentence + link "Sustainability →" `/sustainability`. Keep it White: it sits above the footer. |
| 9 | Footer | — | §5 |

## 7. Section pages

Sections listed top to bottom. *Light* / *Dark* = band theme; everything else is White.

**01 Company — Overview** (`/company`). Buttons: Explore the projects · Meet the leadership.
1. Title.
2. At a glance: snippet 1.
3. Who we are.
4. Strategy: a horizontal sequence of short text blocks.
5. Relationship with DGR Global (shareholding only as approved).
6. Milestones: verified dates only.
7. *Light* — Leadership teaser with a link to Leadership.

**01.1 Leadership.** Buttons: Read the governance framework · Contact the company secretary.
1. Title.
2. Board: one text and image card per person, with name, role, qualifications, bio, independence and committees, all
   as the company supplies them.
3. *Light* — Management.
4. Company secretary.
5. Link to Governance.

Portraits only with consent; no stock images.

**02 Projects — Portfolio** (`/projects`). Buttons: Open a project · How we explore.
1. Title with a summary.
2. Summary facts: snippet 1.
3. Portfolio map: an approved map only (snippet 3), with a list of projects as its text equivalent.
4. *Light* — Project cards.
5. Project register: snippet 2, with columns adapted to Project · State · Commodity · Stage.
6. *Light* — Exploration pipeline by stage.
7. Link to How we explore, plus a disclaimer note linking to `/disclaimer`.

**02.x Project page** — one per verified project, modules in this order (SITEMAP §8). Leave out any module without
approved content; never an empty table.
1. Hero: label `SHEET 02.1 · NICHOLSON` style; H1; tags commodity / state / stage; one-line thesis with no numbers;
   buttons "Latest [project] announcement" · "Discuss a partnership" (→ `/contact`); a field photo, or the location
   map.
2. Key-facts strip: snippet 1 with six cells — location, commodity, area, tenements, ownership, as-at. Ownership and
   area are required to publish.
3. **01 Setting** — map (snippet 3) and a fact list.
4. **02 Geological setting** — up to 120 words, competent-person-reviewed, beside a figure.
5. **03 Exploration history** — counts and dated timeline.
6. **04 Existing resources** — snippet 2 table, competent person only.
7. **05 Exploration targets** — competent person only. Never the HOLD wording.
8. **06 Key results** — up to three cards, each with an announcement link.
9. **07 Photography** — a Gallery block with captions (date, place, photographer).
10. **08 Milestones** — planned items link to `/disclaimer`.
11. **09 Documents** — snippet 2, this project's documents.
12. *Light* — Related projects: up to three cards plus Previous / Next links.
13. CTA band: **Get investor updates** · **Discuss a partnership**.
14. Compliance: snippet 4. Required whenever 02, 04, 05 or 06 is shown.

**02.9 How we explore.**
1. Title with the thesis.
2. Why under-explored.
3. The toolkit: one block per method.
4. From target to drill hole.
5. Back to the portfolio.

**03 Investors — Investor centre** (`/investors`). Buttons: Get investor updates · Download latest presentation.
1. Title.
2. Key facts: snippet 1 with status, shares on issue, major holders, IPO status, as-at.
3. Latest announcement, report and presentation: three cards.
4. *Light* — Register: snippet 2, the last eight documents.
5. Reporting calendar.
6. **Dark** — Investor pages: links to the six pages.
7. Investor contact. Keep it White: it sits above the footer.

**03.1 Announcements / 03.2 Reports / 03.3 Presentations.**
1. Title.
2. Latest feature (Reports, Presentations).
3. Register: snippet 2, newest first, grouped by year.
4. Alerts strip: a Newsletter block.

Upload each PDF with 🖱 link → **File** → upload. One HTML summary per announcement is good practice: a blog post or
page with the plain-language summary and the PDF link.

**03.4 Shareholder information.**
1. Title.
2. Capital structure: snippet 2 adapted to a table, with an as-at date.
3. *Light* — Major shareholders.
4. IPO status: one dated paragraph, company secretary wording only.
5. How to invest in an unlisted company.
6. Registry details.
7. FAQs: an **Accordion** block.

**03.5 Governance.**
1. Title.
2. Approach.
3. Board and committees.
4. Policies and charters (PDF links).
5. Constitution.
6. Whistleblower and contact.

**03.6 Email alerts.**
1. Title.
2. Newsletter / form (§8).
3. Privacy note linking to `/privacy`.

**04 Sustainability — Overview.**
1. Title with the acknowledgement of Country (company wording).
2. Approach: three or four specific commitments.
3. *Light* — Cards linking to Community and Country, and to Environment and safety.
4. Who is responsible.

**04.1 Community and Country.**
1. Working on Country.
2. Landholders and land access.
3. Local participation.
4. Community contact.

**04.2 Environment and safety.**
1. Environment and rehabilitation.
2. Health and safety.
3. Policies.

**05 News** (blog). Blog page settings:
- list layout;
- show date and excerpt;
- categories: *Exploration updates*, *Company news*, *In the media*.

Article posts: date, project tag, lead, body. If a post reports results, add snippet 4.

**05.1 Media.**
1. Media contact.
2. *Light* — Fact sheet: snippet 1, approved and dated.
3. Downloads: kit, logos, images.
4. Coverage list.

**Contact.**
1. Form (§8).
2. Direct contacts by type.
3. Office address, with a **Map** block if the address is confirmed.

**Disclaimer / Privacy / Terms.**
- All White.
- Title and a last-updated date.
- Numbered clauses with the company-supplied text only.

## 8. Forms

**Contact** — 🖱 add a **Form** block.

Fields:
- Name (required);
- Email (required);
- Phone (optional);
- **Enquiry type** dropdown: Investors · Partnerships · Media · Landholder or community · General;
- Message (required).

Settings:
- **Storage:** email to the inbox the company names.
- **Post-submit message:** "Thank you. We'll reply within [INPUT NEEDED: response time]." (company to confirm).
- Labels stay visible. Do not use placeholder-only fields.

**Email alerts** — 🖱 **Newsletter** block, connected to **Squarespace Email Campaigns** (or Mailchimp).
- Turn **double opt-in** on.
- Fields: name and email.
- Link the privacy policy beside it.

## 9. Images

- Documentary photos only: Auburn's own ground, people and work.
- Each image needs:
  - a caption (what, place, date, photographer);
  - alt text that says what it shows;
  - consent for any identifiable people.
- Maps and figures must be real and approved, numbered `Fig. 1 — …`, with a source and date (snippet 3).
- Image blocks: square (no rounded style); no shadows; no animation.

## 10. Redirects (old addresses → new)

🖱 **Settings → Developer tools** (older menus: **Advanced**) → **URL mappings**. Paste these lines; they are already in
Squarespace's format.

```
/about-us -> /company 301
/about -> /company 301
/home -> / 301
/home-1 -> / 301
/home-2 -> / 301
/home-impact -> / 301
/welcome -> / 301
/board-of-directors-and-management -> /company/leadership 301
/corporate-governance -> /investors/governance 301
/corporate-governance-1 -> /investors/governance 301
/corporate-governance-2 -> /investors/governance 301
/project-portfolio -> /projects 301
/nicholson-project -> /projects/nicholson 301
/calgoa-project -> /projects/calgoa 301
/tanumbirini-project -> /projects/tanumbirini 301
/hawkwood-project -> /projects/hawkwood 301
/victoria-river-downs -> /projects/victoria-river-downs 301
/investor-centre -> /investors 301
/investor-center -> /investors 301
/presentations -> /investors/presentations 301
/email-alerts -> /investors/alerts 301
/auburnresources -> /investors/alerts 301
/media-coverage -> /news/media 301
/contact-us -> /contact 301
/contact-us-1 -> /contact 301
/cart -> / 301
```

Adjust these before pasting:
- **Projects not built.** Point any project that gets no page (not confirmed as held) at `/projects` instead.
- **Hyphenated slugs.** If a slug became hyphenated (§4), point the mapping at the real slug, and add
  `/company/leadership -> /company-leadership 301` style lines.
- **`/2021-entitlement-offer`** waits for the company secretary's decision (SITEMAP §9). Do not map it yet.
- **Old PDFs (`/s/…pdf`).** Download every one from the old site before it closes (§12). Re-upload only those the
  company still wants, then map each old address to its new file link.
- **No loops.** Never map a URL to itself. `/projects` and `/investors` need no mapping.

## 11. Checks before going live

- **No placeholders.** Search every page for `INPUT NEEDED` (open each page; Ctrl/Cmd + F). None may remain.
- **Approvals on file.** Every number on the site has the approver's written OK, with its source and as-at date.
- **No HOLD wording, no stock photos, no `email@email.com`.**
- **Compliance.** Snippet 4 sits on every page that shows results, targets or resources. Legal pages hold the
  company's text.
- **Screen widths.** Check at phone width (360 px) and desktop:
  - text readable on every band;
  - nothing scrolls sideways except a register table inside its box.
- **Keyboard.** Press **Tab** through the header, a page and the forms: focus is visible everywhere, and every form
  works.
- **SEO.** 🖱 each page's ⚙️ → **SEO**: a unique title and description. 🖱 **Settings → Website → Language**: English
  (Australia).
- **Forms.** Send a test from both forms and confirm they arrive.

## 12. Launch and move the domain (⚠️ each step: pause and check)

**Before you start, keep email working.** On the **old** site, 🖱 **Settings → Domains → auburnresources.com.au → DNS**.
Screenshot every record, above all **MX**, TXT (SPF, DKIM, DMARC) and any custom records. Email must keep working
after the move.

1. ⚠️ **Subscribe the new site** to a plan (Core or higher). The plan is needed for Code blocks and a custom domain.
2. ⚠️ **Move the domain from the old site to the new one** (both sites are in the same Squarespace account):
   1. 🖱 old site → **Settings → Domains** → the domain → **Move domain** / **Transfer to another site** → choose the
      new site.
   2. If that option is not offered: disconnect it from the old site, then 🖱 new site → **Settings → Domains → Use a
      domain I own**. If the domain is registered elsewhere, change only what Squarespace's connection screen asks
      for.
3. **Re-check the DNS records** against your screenshot. Re-add any missing MX or TXT record. Send a test email to
   and from the company address.
4. 🖱 New site → **Settings → Domains** → make `auburnresources.com.au` the **primary** domain and turn **SSL** on.
5. ⚠️ **Make it public.** Only after §11 passes: 🖱 **Settings → Site availability → Public**.
6. **Check the redirects.** Open a few old addresses (e.g. `/about-us`, `/investor-centre`) and confirm they land on
   the new pages.
7. **Keep the old site for now.** Do **not** delete it until every old PDF is downloaded and the new site has run
   cleanly for a few weeks. Deleting it cannot be undone.

After launch: in Google Search Console, verify the domain (Squarespace: **Settings → Developer tools → External
API keys / Search Console**) and submit `https://auburnresources.com.au/sitemap.xml`.

## What this route does not have (compared with the paused Astro build)

| Missing | What it means |
| --- | --- |
| Approval states and the fail-closed production build | The checks in §0 and §11 are manual. |
| Sheet-numbered section bar, click-open navigation panels with a project map, in-page index | Squarespace dropdowns are used instead. |
| Document filters, site search over PDFs, Pagefind | The register is a plain table and Squarespace's own search is used. |
| `/documents/[slug].pdf` addresses | PDFs keep Squarespace's file links. |
| JSON-LD (`Organization`, `Place`, `Article`), automatic OG images | Only Squarespace's built-in SEO. |
| Budgets (JS ≤ 30 KB, LCP < 2 s), axe in CI | Squarespace's own scripts and speed apply. |

The Astro build can still replace this site later from the same page structure and URLs, so the redirects keep
working.
