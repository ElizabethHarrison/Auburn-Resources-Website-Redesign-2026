# Section background bands (Option C)

Status: **approved and implemented, 30 Sep 2026 (D-032).** The owner chose Option C ("mix") from the band mockups
and approved it, with peach for preview-only status dots on dark teal, and legal pages and 404 all white. White
remains the page ground, a **light-teal** band breaks up long runs of white, and an occasional **dark-teal** band
gives a feature section weight. Both colours are official brand colours (D-031); no colour, font, spacing, layout,
module order, URL, content or CMS change. §3 is the final assignment; §3.1 lists where it departs from the
proposal and why; §4 is what was built.

## 1. The three grounds

| Tone | Colour | Text and rules inside | Used for |
| --- | --- | --- | --- |
| **White** | `--brand-white` `#FFFFFF` | as today (dark teal, charcoal) | hero and title blocks, maps, most content |
| **Light** | `--brand-light-teal` `#B1D3D9` | as today: dark teal 5.41:1, charcoal 7.29:1 | project cards, alternate content blocks |
| **Dark** | `--brand-dark-teal` `#275259` | white 8.62:1; secondary text and rules light teal 5.41:1; links white, underlined; focus ring white | one feature section per page at most (plus the existing CTA band and footer) |

## 2. Rules

1. **Hero, page title and key-facts strip are always white.** Every page opens on white.
2. **Orange (the Auburn accent) never sits on a band directly.** On dark teal it is 2.17:1 and on light teal 2.50:1,
   below the 3:1 minimum. So:
   - sections containing maps, commodity tags or other orange elements are never dark;
   - on light bands, orange appears only inside white cards (the project sheet cards are white).
3. **Figures sit on a white panel** inside any band (the figure frame keeps a white ground), so every figure palette,
   including future CP-approved maps and sections, displays as drawn.
4. **Never two dark areas together.** The section immediately before the footer (dark) is never dark; if the pattern
   would make it dark it becomes light. The existing CTA band (dark) is never next to a dark section.
5. **Legal pages (disclaimer, privacy, terms) and the 404 page stay all white** — long-form reading, no banding.
6. **Project dossier modules stay white.** They sit beside the sticky strat-column index; full-width bands would cut
   across it. The dossier's banding comes from its related-sheets band, the CTA band and the footer.
7. **Bands are assigned by content, not by position** (implemented; the proposal's positional alternation was
   dropped — see §3.1). Each band is chosen for what the section holds; a section is never coloured just because it
   is next in sequence, low-content sections are not made into large coloured blocks, and two dominant bands are not
   placed close together. When production hides a section, the others keep their tone; rule 4 is enforced in CSS
   for whatever ends up last.
8. Preview only: status dots and INPUT NEEDED boxes keep their own colours inside bands (placeholders stay white
   boxes; dots on dark teal are peach, §3.2).

## 3. Assignments (every template, as implemented)

W = white · L = light teal · D = dark teal. Listed in page order, as the preview build renders them (every module
present). In production, hidden modules drop out and the rest keep their tone. Changes from the proposal are in
**bold italics** and explained in §3.1.

| Page | Sections |
| --- | --- |
| **Home** `/` | hero W · key facts W · **portfolio (sheet cards) L** · **why this ground D** (Fig. 2 on its white panel) · register W · **news L** · sustainability W · footer D |
| **Projects** `/projects` | title W · summary strip W · map W · **sheet cards L** · register W · ***exploration pipeline L*** · links W · footer D |
| **Project dossier** `/projects/[slug]` | hero W · key facts W · modules 01–09 W · **related sheets L** · CTA band D (existing) · compliance W · footer D |
| **Company** `/company` | title W · at a glance W · **who we are L** · strategy W · **relationship with DGR Global D** · milestones W · **leadership L** · footer D |
| **Leadership** | title W · board W · **management L** |
| **How we explore** | title W · under cover W · **toolkit L** · sequence W |
| **Investors** `/investors` | title W · key facts W · latest documents W · **register L** · reporting calendar W · **investor pages D** · investor contact W |
| **Announcements / Presentations / Reports** | title W · filters W · year registers ***alternate W, L, W, L …*** (never D) |
| **Shareholders** | title W · capital structure W · **major shareholders L** · IPO status W · **how to invest D** · registry W · **questions L** |
| **Governance** | title W · approach W · **board committees L** · policies W · **whistleblower L** |
| **Email alerts** | title W · privacy note W |
| **Announcement page** | title W · details W · **summary L** · related projects W · **related announcements L** |
| **Sustainability** | title W · approach W · **in this section L** · responsibility W |
| **Community and Country** | title W · working on Country W · **land access L** · local participation W · **community contact L** |
| **Environment and safety** | title W · environment W · **safety L** · policies W |
| **News** | title W · articles W |
| **Media** | title W · media contact W · **fact sheet L** · downloads W · **coverage L** |
| **Contact** | title W · contact details W · **enquiries L** |
| **Disclaimer, Privacy, Terms, 404** | all W (rule 5) |

Dark sections in total: home 1, company 1, investors 1, shareholders 1 — plus the CTA band and footer as before.
Everything else is white or light. In the production build today most of these sections are hidden (no approved
content yet), so the public build currently shows two bands: the investor centre's page links (dark, shown light by
rule 4 because it ends the page) and the sustainability "in this section" cards (light).

### 3.1 Exceptions to the proposal (after reviewing screenshots at 1440 and 360 px)

| Where | Proposed | Implemented | Why |
| --- | --- | --- | --- |
| Projects: exploration pipeline | D | **L** | Only the short links row separated it from the dark footer: two dominant dark areas too close together. The page's weight already comes from the map and the sheet-card band. |
| Document libraries (announcements, presentations, reports) | W, L, W, D by position | **W, L alternating, never D** | Registers carry status dots and file placeholders (orange); a dark year register would have to hide or recolour them. |
| Content pages generally | positional alternation (rule 7) | **fixed, content-led assignment** | The owner asked for hierarchy over mechanical alternation; positional rules coloured sections because of their sequence. |
| A band that ends a content page | page bottom padding under the band | **band runs straight into the footer** | The white strip left between a closing band and the footer looked like a mistake. The band keeps its own padding. |
| Leadership: missing-portrait frame (preview) | — | **white fill** | Its hollow orange frame sat on light teal (2.50:1); caught by the new e2e check. |
| Figure placeholders (preview) | light-teal fill | **white fill (`--figure-ground`)** | In the Sanity snapshot build the home Fig. 2 is a placeholder inside the dark band; a light-teal frame with an orange edge failed on both sides. Now it matches real figures. |

### 3.2 Accessibility treatment inside bands

- Text, links, rules, buttons and focus rings take their colours from the tone scope (all ≥ 4.5:1 for text, ≥ 3:1
  for non-text; `contrast.test.ts`). On dark teal: white text and focus ring (8.62:1), light-teal meta (5.41:1), the
  primary button turns white with a dark-teal label.
- Orange never sits directly on a band. On light bands it stays inside white cards (sheet cards), white placeholders,
  white figure panels, and — for preview status dots — a white disc drawn behind the dot. No orange element is used
  on a dark band; preview status dots there are peach (4.54:1, owner-approved).
- Figures (`--figure-ground`) and placeholders (`tone-white`) are always white, so every figure palette and every
  INPUT NEEDED box looks the same on any band.

## 4. What changed in the repository

| Change | Where |
| --- | --- |
| Tone scopes `.tone-white`, `.tone-light`, `.tone-dark`: each re-declares the ink roles, `--color-*` aliases, rule and focus composites, and status-dot colours; values only from `--brand-*`. The rule-4 guard (`.content-page > .tone-dark:last-child` renders light) is in the same block | `styles/tokens.css` |
| `--figure-ground` (always `--brand-white`); figure frames use it | `styles/tokens.css`, `Figure.astro` |
| `Tone` type and `toneClass()` | `lib/tones.ts` |
| A `tone` prop (`white` default · `light` · `dark`) on section wrappers: `PageBlock` (and `FactList`, `LinkCards`, `PeopleGroup` through it), a `tones` map by section id on `PageSections`, the home, portfolio and related-sheets modules; `DocumentLibrary` alternates its year registers | `components/modules/…` |
| Placeholders always white (`tone-white`); figure placeholders use `--figure-ground`; status dots draw a ground disc; missing-portrait frame filled white | `Placeholder.astro`, `FigurePlaceholder.astro`, `StatusDot.astro`, `PersonCard.astro` |
| A band that ends a content page meets the footer directly | `layouts/ContentLayout.astro` |
| Assignments (§3) | page templates in `pages/` |
| Catalogue: "Grounds (section bands)" specimen — text, link, rule, buttons and a white card on each tone | `catalogue/sections/Foundations.astro` |
| Tests: `parseScope()` + per-tone contrast pairings; e2e `section-bands.spec.ts` | `lib/tokens.ts`, `lib/contrast.test.ts`, `tests/e2e/` |
| Docs: this plan, D-032, `DESIGN-DIRECTION.md` (grounds), CLAUDE.md §3 | `docs/`, `CLAUDE.md` |

No new colours, no new dependencies, no layout-grid, type, spacing or URL changes. Independent of the spacing
proposals in `docs/SPACING-DENSITY-AUDIT.md`, which remain unimplemented.

## 5. Accessibility and tests

- **Unit (`contrast.test.ts`):** for each tone scope (white, light, dark, and the rule-4 guard), text, heading, link,
  label, meta and accent-lettering colours reach 4.5:1 against the band's colour; rules, focus ring and approved dot
  reach 3:1; preview status dots reach 3:1 on their ground; figures and placeholders resolve to white. Peach on dark
  teal is pinned at 4.54:1. Documented failures asserted: orange on dark teal 2.17, orange on light teal 2.50.
- **E2E (`section-bands.spec.ts`, all four builds, every built page except the catalogue):** every element drawn in
  orange (text, border, fill, SVG fill or stroke) reaches 3:1 against the ground it sits on — a border passes when
  either side of it contrasts, so a white box with an orange edge on a band passes and a hollow orange tag on a band
  fails; no full-width dark area ends `main` (rule 4); disclaimer, privacy, terms and 404 carry no bands (rule 5).
- **Unchanged and passing:** axe (WCAG 2.2 AA, including text contrast on the new grounds), focus visibility, 360 px
  no-scroll, reading order (backgrounds only).
- Before/after screenshots of 21 pages at 1440 and 360 px (preview and production) were reviewed before commit.

## 6. Decisions (resolved 30 Sep 2026)

1. Option C approved as the starting point; the final assignment is §3 with the exceptions in §3.1.
2. Preview-only status dots inside dark bands use **peach** `#F0AD8C` (4.54:1). Production never shows status dots.
3. Legal pages and the 404 page stay all white.
