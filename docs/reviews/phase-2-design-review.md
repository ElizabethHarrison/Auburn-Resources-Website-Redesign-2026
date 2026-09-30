# Phase 2 design review — "Survey Sheet" design system

> **Historical record.** Colours named below (Survey Blue, Cyanotype, Paper, copper) were replaced on 30 Sep 2026 by
> the company brand palette (D-031, `docs/BRAND-MIGRATION-PLAN.md`); the review is kept as written.

29 Sep 2026 · Branch `claude/phase-2-design-system` · Review it in a preview build: `pnpm dev`, then open
`/_catalogue` (preview only; it does not exist in production builds).

Everything here implements `docs/DESIGN-DIRECTION.md`. Nothing changes the approved direction: colours,
type faces, weight 400, 1 px rules, square corners, no shadows or gradients, copper for Auburn's ground
only. Items marked **Decide** need your call; the implementation is conservative until then.

## 1. Tokens

**Implemented** (`apps/site/src/styles/tokens.css`, each tagged `[A]` approved or `[D]` derived):
15 approved colours and their roles; font stacks; the approved type sizes (hero 36/48, project title 84,
H2 40–48 desktop, card title 34, body 16–18, fact value 20–44, mono 10.5–13); 8 px spacing scale; 1440
artboard, 64 px gutters, 12 columns / 24 px gap; 88/56 px header, 44 px section bar and touch target; 1 px
rules, 1.5 px dashed placeholder border, radius 0; button 16 × 22 px padding; tag 4 × 8 px padding.

**Derived** (not stated in the design direction; all conservative and changeable in one place):

| Token | Value | Why |
| --- | --- | --- |
| Mobile sizes | project title 44, H2 28, card title 26 (fluid to the approved desktop sizes) | Only desktop sizes were specified |
| `--text-h3` | 22 → 28 px | Needed between H2 and body |
| `--text-lead`, `--text-small` | 18 → 20 px, 15 px | Intro paragraphs; secondary text in cards |
| `--leading-heading`, `--leading-mono` | 1.2, 1.4 | Only hero (1.12) and body (1.6) were given |
| `--measure` | 68 ch | Comfortable prose line length |
| `--space-half` | 4 px | Tag padding (spec: 3–4 px) |
| Section padding (mobile) | 48 px | Spec gives 64–80 px desktop |
| Focus ring | 2 px Cyanotype, 2 px offset; 2 px Paper on Survey Blue | Not specified; Cyanotype on Survey Blue is 1.74:1 |
| `--rule-on-dark` | 1 px on-survey-muted | Rules inside the footer |
| `--status-dot-size` | 9 px | Not specified |
| Motion | 120 / 200 ms, standard easing; 0 ms with reduced motion | "Minimal" only; currently used for nothing that moves on its own |
| Breakpoints | 48 / 64 / 80 / 90 rem (768 / 1024 / 1280 / 1440 px) | Not specified; see §5 |

**Contrast** (unit-tested): every pairing used passes AA. Pairings that **fail** and are therefore never
used: muted on paper-deep (4.41:1 text), Cyanotype on Survey Blue (1.74:1), copper on Survey Blue (2.78:1),
Contour Blue on paper (1.66:1 — Contour rules are decorative only; never use them for form borders).

## 2. Components created

- **Primitives (11):** Button, ArrowLink, Tag, MonoLabel, Rule, Container, Grid, DateMono, SheetRef,
  VisuallyHidden, Icon.
- **Patterns (18):** StatusDot, Placeholder, SourceLine, FactValue *(new: inline fact)*, FactCell, FactStrip,
  CounterRow, Timeline, Figure, MapLegend, SheetCard, DocumentRegister, PersonCard, MilestoneTrack,
  Accordion, CTABand, ComplianceBlock, SignupStrip.
- **Page frame (4, static):** Header, SectionBar, Breadcrumb, Footer.
- **Catalogue:** `/_catalogue` — Foundations, Primitives, Patterns, Page frame, Data/fact components,
  Documents, People, Project components. Fact-aware specimens show **preview** and **production** panes.

Zero JavaScript: no client scripts, no islands, no dependencies added. Both builds ship 0 KB of JS.

## 3. Interpretations of the design documentation

| Component | Interpretation | Decide? |
| --- | --- | --- |
| Header | Full navigation needs ~980 px (Didact Gothic); with the sheet reference ~1,230 px. So: full nav from 1280 px, sheet reference from 1440 px; below that, wordmark + "Menu" (a link to the footer navigation until the Phase 4 menu), sheet reference in the breadcrumb line | **Decide** (Q-13) |
| Wordmark | Text "Auburn" + mono "RESOURCES" on one line; no logo mark until vectors arrive (Q-40) | — |
| Home key facts | Five cells as listed; "Status (+ DGR holding)" is ambiguous, holding not shown yet | **Decide** (Q-14) |
| FactStrip | Closed ruled grid: 2 columns mobile, 3 tablet, one row from 1024 px; a lone last cell spans its row | — |
| FactCell | Values never break inside a number; they shrink to fit narrow cells (never above the approved size, never below 20 px) | — |
| StatusDot | ● verified, ◐ to verify, ○ input needed as specified; **draft/superseded** (unspecified) use a hollow Survey Blue circle. Text label always present | — |
| Placeholder | Block and inline variants; the inline one is needed inside tables, cards and addresses | — |
| SheetCard | Whole card is one link (the project name) — one tab stop; name scales with the card | — |
| DocumentRegister | REF shows "—" when a document has no reference; FILE is "PDF" (plus hidden title for screen readers); table/cards switch by the register's own width | — |
| PersonCard | Portrait 4:5, max 14 rem wide, alt "Portrait of [name]"; no approved portrait → no image (never a stand-in) | — |
| Timeline | Ordered sequence, **not to scale** yet (spec: to scale only when all items are dated; needs real dated data) | Later |
| MilestoneTrack | Square markers (filled done, solid highlighted next, open planned); note "Planned milestones are forward-looking. Read the disclaimer" | Wording |
| ComplianceBlock | Heading "Competent person statement"; link text "Disclaimer, forward-looking statements and JORC basis"; not rendered in production without an approved statement | Wording |
| SignupStrip | Copy from the sitemap; **static link to /investors/alerts** (no form until Phase 4); privacy link "How we use your email address" | Wording |
| Footer | Contact column rows appear only with their value; status dots suppressed on Survey Blue (copper fails contrast there); "© year" always shown | — |
| SectionBar | Mobile chips use a Contour Blue outline (decorative; the text carries the meaning) | — |
| Figure | Caption `FIG. n — …`; optional long description in a native disclosure; lightbox in Phase 4 | — |
| Catalogue | Uses artificial **approved specimens** to show production rendering (company fixtures stay unapproved) | **Decide** (Q-16) |

## 4. Accessibility decisions

- Semantic HTML throughout: real `<a>`/`<button>`, `<nav>` with names, `<dl>` for facts, `<table>` with
  captions and scoped headers, `<ol>` for sequences, native `<details>` for the accordion (no JavaScript).
- `aria-current` for the current section, page, breadcrumb and milestone step.
- Visible focus on all 118 tab stops in the catalogue (checked automatically); Paper ring on Survey Blue.
- Status is never colour-only: shape plus visible (or screen-reader) text.
- Wide tables sit in a labelled, focusable scroll region; mobile shows cards instead.
- `role="list"` kept on styled lists (Safari drops list semantics otherwise).
- Touch targets ≥ 44 px for links in lists, buttons, chips and breadcrumbs.
- axe (WCAG 2.0–2.2 A/AA + best practice) on the catalogue at 360 and 1280 px: **0 WCAG violations**. The only
  remaining best-practice note (duplicate landmark names) comes from the catalogue deliberately rendering the
  footer and compliance block twice.

## 5. Responsive decisions

- Four viewport breakpoints: 768 (tablet: columns begin), 1024 (desktop layouts), 1280 (full header nav),
  1440 (sheet reference in header). Layouts gain columns rather than shrinking the desktop layout.
- Container queries where a component's column width varies: register (table from 640 px wide), fact
  values and card names (scale with their box).
- Checked at 360, 768, 1280 and 1440 px: no horizontal page scroll at any width.

## 6. Not specified in the documentation (my choices)

Focus ring style; motion timings; breakpoints; mobile type sizes; draft status marker; milestone marker
shape; portrait size; the footer contact labels (Street, Postal, Email, Phone, LinkedIn); UI copy for the
compliance link, milestone note and privacy link; chip style for the mobile section bar.

## 7. Recommended before Phase 3

1. **Decide Q-13** (header breakpoints) and **Q-14** (DGR holding on the home strip).
2. **Compare against the mockups** (Q-17). I have not been able to see the design canvas artboards, so the
   comparison has been against the written spec only.
3. **Review the derived mobile type sizes** in the catalogue at 360 px, especially the 44 px project title
   with long names ("Victoria River Downs").
4. **Consider 11–12 px minimum for source lines** (Q-15). 10.5 px is approved but small.
5. **Approve the specimen approach** (Q-16), or tell me to drop production panes from the catalogue.
6. **Re-measure the header and fact cells if Century Gothic is licensed**: it is wider than Didact Gothic.
7. Confirm the three pieces of UI copy in §3 marked "Wording".
