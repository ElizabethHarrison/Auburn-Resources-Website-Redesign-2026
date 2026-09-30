# Section background bands (Option C)

Status: **proposal, 30 Sep 2026 — awaiting the owner's approval; nothing implemented.** The owner chose Option C
("mix") from the band mockups: white remains the page ground, a **light-teal** band breaks up long runs of white, and
an occasional **dark-teal** band gives a feature section weight. Both colours are official brand colours (D-031); no
colour, font, layout, module order, URL or content changes. Decision: D-032 (Proposed).

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
7. **Content-page blocks alternate by position among the blocks actually rendered** (so the pattern stays correct
   when production hides unapproved blocks): 1 white · 2 light · 3 white · 4 dark · 5 white · 6 light · 7 white · 8
   dark … — with rule 4 applied to the last block.
8. Preview only: status dots and INPUT NEEDED boxes keep their own colours inside bands (placeholders stay white
   boxes; see §6 for dots on dark).

## 3. Assignments (every template)

W = white · L = light teal · D = dark teal. Listed in page order, as the preview build renders them (every module
present). In production, hidden modules simply drop out; fixed assignments (home, portfolio, dossier) do not shift,
and content-page blocks re-alternate among what remains.

| Page | Sections |
| --- | --- |
| **Home** `/` | hero W · key facts W · **portfolio (sheet cards) L** · **why this ground D** · register W · **news L** · sustainability W · footer D |
| **Projects** `/projects` | title W · summary strip W · map W · **sheet cards L** · register W · **exploration pipeline D** · links W · footer D |
| **Project dossier** `/projects/[slug]` | hero W · key facts W · modules 01–09 W · **related sheets L** · CTA band D (existing) · compliance W · footer D |
| **Company** `/company` | title W · at a glance W · **who we are L** · strategy W · **relationship with DGR Global D** · milestones W · **leadership L** · footer D |
| **Leadership** | title W · board W · **management L** |
| **How we explore** | title W · under cover W · **toolkit L** · sequence W |
| **Investors** `/investors` | title W · key facts W · latest documents W · **register L** · reporting calendar W · **investor pages D** · investor contact W |
| **Announcements / Presentations** | title W · year blocks alternate W, L, W, D … (rule 7) |
| **Reports** | title W · 2022 W · **2021 L** |
| **Shareholders** | title W · capital structure W · **major shareholders L** · IPO status W · **how to invest D** · registry W · **questions L** |
| **Governance** | title W · approach W · **board committees L** · policies W · **whistleblower L** (last before footer: rule 4) |
| **Email alerts** | title W · privacy note W |
| **Announcement page** | title W · details W · **summary L** · related projects W · **related announcements L** (last: rule 4) |
| **Sustainability** | title W · approach W · **in this section L** · responsibility W |
| **Community and Country** | title W · working on Country W · **land access L** · local participation W · **community contact L** (last: rule 4) |
| **Environment and safety** | title W · environment W · **safety L** · policies W |
| **News** | title W · articles W |
| **Media** | title W · media contact W · **fact sheet L** · downloads W · **coverage L** (last: rule 4) |
| **Contact** | title W · contact details W · **enquiries L** |
| **Disclaimer, Privacy, Terms, 404** | all W (rule 5) |

Dark sections in total: home 1, projects 1, company 1, investors 1, shareholders 1 — plus the CTA band and footer as
today. Everything else is white or light.

## 4. What changes in the repository (after approval)

| Change | Where | Type |
| --- | --- | --- |
| Two tone scopes: `.tone-light` (light-teal ground) and `.tone-dark` (dark-teal ground that re-declares the role tokens — inks, grounds, `--color-*` aliases, rules, focus ring — for text and rules on dark) | `styles/tokens.css` (or `layout.css`); values only from `--brand-*` | tokens (approval: CLAUDE.md §9.3) |
| Figure frames keep a white ground inside tones | `Figure.astro`, `FigurePlaceholder.astro` (a `--figure-ground` role, always `--brand-white`) | component |
| A `tone` prop (`white` default · `light` · `dark`) on section wrappers | `PageBlock`, home modules, portfolio modules, `ProjectRelated` | component |
| Fixed assignments | `pages/index.astro`, `pages/projects/index.astro`, `pages/projects/[slug].astro` | page templates |
| Positional alternation for content-page blocks (rules 4, 5, 7) | `ContentLayout.astro` / `PageBlock` | component |
| Band padding: banded sections keep their own top and bottom padding so content never touches the band edge | same components; existing spacing tokens | component |
| Catalogue: a "Grounds" specimen showing text, links, buttons, rules, tags, fact cells and focus on each tone | `src/catalogue/` | preview only |
| Docs: `DESIGN-DIRECTION.md` (grounds and banding rules), CLAUDE.md §3, D-032 | docs | docs |

No new colours, no new dependencies, no layout-grid, type or URL changes. Independent of the spacing proposals in
`docs/SPACING-DENSITY-AUDIT.md` (either can go first).

## 5. Accessibility and tests

- **Unit (`contrast.test.ts`):** every pairing on each tone — on light teal: dark teal 5.41, charcoal 7.29, focus ring
  5.41; on dark teal: white 8.62, light teal 5.41 (secondary text, rules), white focus ring 8.62, white button with
  dark-teal label 8.62. Documented failures asserted: orange on dark teal 2.17, orange on light teal 2.50.
- **E2E (new):** on every page of all four builds, every element drawn in orange must have an effective background
  (nearest opaque ancestor) giving ≥ 3:1 — this enforces rule 2 automatically. The section before the footer is never
  dark (rule 4). Legal pages have no bands (rule 5).
- **Unchanged:** axe (WCAG 2.2 AA, including text contrast on the new grounds), focus visibility, 360 px no-scroll,
  reading order (backgrounds only).
- Screenshots before/after for review.

## 6. Decisions needed

1. Approve Option C as assigned in §3 (D-032).
2. Preview-only status dots inside dark bands: orange fails there. Proposed: inside dark bands they use **peach**
   `#F0AD8C` (4.54:1 on dark teal) — preview builds only; production never shows status dots. Alternatively, keep
   status dots off dark bands by making those sections light in preview.
3. Confirm legal pages and the 404 page stay all white.
