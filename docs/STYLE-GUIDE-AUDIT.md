# Style-guide audit

Status: **audit only, 30 Sep 2026. No design change has been made.** The owner has named the company style guide the
authoritative source for brand and design. Where it conflicts with the approved "Survey Sheet" direction
(`docs/DESIGN-DIRECTION.md`, CLAUDE.md §3, §9.3), the conflict is listed here for a decision (Q-53–Q-56); tokens are
not changed until the owner approves.

## 1. The source

`Auburn_Resources_Style_Guide (1).pdf`, supplied by the owner: **one slide** (960 × 540 pt, PowerPoint for Office 365,
created 5 Nov 2019). It is not committed to the repository because it embeds Century Gothic font files (CLAUDE.md
§9.10); its content is transcribed below.

| Section | Content (as printed) | Hex (converted from the printed RGB) |
| --- | --- | --- |
| Title | "AUBURN RESOURCES \| STYLE GUIDE", uppercase, in the dark teal below | — |
| **Logo Colours** | RGB 21 134 226 | `#1586E2` (logo blue) |
| | RGB 1 35 97 | `#012361` (logo navy) |
| **Primary Colour Palette**, row 1 | RGB 39 82 89 | `#275259` (dark teal) |
| | RGB 129 184 194 | `#81B8C2` (teal) |
| | RGB 212 90 28 | `#D45A1C` (orange) |
| | RGB 59 56 56 | `#3B3838` (charcoal) |
| | "RGB: R0 G0 B0" printed under a **white** swatch | `#000000` as printed; the swatch shows white — **contradiction (Q-54)** |
| row 2 | RGB 72 153 166 | `#4899A6` (mid teal) |
| | RGB 177 211 217 | `#B1D3D9` (light teal) |
| | RGB 240 173 140 | `#F0AD8C` (peach) |
| | RGB 173 169 169 | `#ADA9A9` (grey) |
| Logo | Raster lock-up, bottom right: three wave lines in logo blue above "AUBURN RESOURCES" in logo navy (embedded image 393 × 128 px) | — |
| Fonts embedded | Century Gothic, Century Gothic Bold (used for the slide's text; not stated as a rule) | — |

Colour names above are ours, for reference only; the guide names none of them.

**The guide is silent on:** colour roles and combinations, typography rules and hierarchy, logo clear space /
minimum size / misuse, spacing, grid, buttons, links, navigation, forms, states, photography, illustration, tone of
voice, terminology, accessibility and prohibitions. No brand rule is invented for those areas; the current
implementation stands unless the owner decides otherwise.

## 2. Contrast of the guide's colours (WCAG 2.2)

Ratios computed from the printed RGB values. AA: 4.5:1 body text, 3:1 large text (≥ 24 px, or ≥ 18.66 px bold) and
UI components.

| Colour | on white | on current paper `#F5F2EA` | Safe uses |
| --- | --- | --- | --- |
| logo navy `#012361` | 14.85 | 13.27 | any text |
| dark teal `#275259` | 8.62 | 7.70 | any text |
| charcoal `#3B3838` | 11.61 | 10.38 | any text |
| logo blue `#1586E2` | 3.79 | 3.39 | large text / UI on white only; **not body text** |
| orange `#D45A1C` | 3.98 | 3.56 | large text / UI only; **not body text** |
| mid teal `#4899A6` | 3.29 | 2.94 | large text on white only; fills |
| teal `#81B8C2`, light teal `#B1D3D9`, peach `#F0AD8C`, grey `#ADA9A9` | 1.59–2.33 | 1.42–2.08 | **backgrounds, fills, rules only — never text** |

On dark grounds: light teal on dark teal 5.41; peach on dark teal 4.54; white on logo navy 14.85; white on dark teal 8.62.

## 3. Findings by area

Severity: **Blocker** (must be resolved before launch), **Important**, **Optional**.

### 3.1 Colours

| # | Guide requires / shows | Website does | Where | Severity |
| --- | --- | --- | --- | --- |
| C-1 | Primary palette of dark teal, teal, orange, charcoal, white/black + four lighter tones | Its own "Survey Sheet" palette: Survey Blue `#1B3A5C`, Cyanotype `#2C5F8F`, Contour `#A9C1D9`, Graphite `#262A2E`, Muted `#5A6B7C`, Paper `#F5F2EA`; **no guide colour is used anywhere** | `apps/site/src/styles/tokens.css`; `docs/DESIGN-DIRECTION.md` | **Blocker** (decision Q-53): the site does not use the brand palette |
| C-2 | Orange `#D45A1C` is the palette's only warm accent | Copper `#B8672E` marks Auburn ground (maps, tags); copper-text `#8A4A1E` for small copper text | `tokens.css` `--copper*` | part of Q-53. A 1:1 swap keeps the "Auburn ground" rule and contrast profile (orange 3.56 on paper vs copper 3.7): large type/fills only, with a darker text variant still needed |
| C-3 | Logo colours: logo blue, logo navy | Not used (text wordmark in Survey Blue) | `components/patterns/Header.astro`, Footer | part of Q-53 / Q-55 |
| C-4 | A white (or black) swatch labelled "R0 G0 B0" | Page background is warm paper `#F5F2EA`, not white | `tokens.css` `--paper` | Important (Q-54): the guide does not say the page must be white, but paper is not in the palette |
| C-5 | Guide silent on combinations | Every pairing used is contrast-tested | `src/lib/contrast.test.ts` | Follows good practice; keep the tests whatever palette is chosen |

### 3.2 Typography

| # | Guide | Website | Where | Severity |
| --- | --- | --- | --- | --- |
| T-1 | Century Gothic is the typeface used (regular and bold embedded) | Century Gothic first in the stack; **Didact Gothic** (OFL) self-hosted as fallback because Century Gothic has no web licence (Q-12) | `tokens.css` `--font-sans` | **Aligned** in intent. Important: without a web licence most visitors see Didact Gothic (Q-12) |
| T-2 | The slide's title is set **bold, uppercase**; the guide states no weight rule | Weight 400 everywhere: "hierarchy by size and ink, not weight" (approved design direction) | `tokens.css` `--font-weight-regular`; DESIGN-DIRECTION | Ambiguous (Q-56): observed usage, not a stated rule. Decide whether headings may use bold |
| T-3 | No monospace font in the guide | IBM Plex Mono for labels, sheet numbers, tables, dates | `tokens.css` `--font-mono` | Optional (Q-56): guide is silent; the mono is part of the approved direction |
| T-4 | No type scale | Fluid scale, tested | `tokens.css` | Follows the approved direction; no conflict |

### 3.3 Logo and brand mark

| # | Guide | Website | Where | Severity |
| --- | --- | --- | --- | --- |
| L-1 | The logo is the wave mark + "AUBURN RESOURCES" lock-up | **Text wordmark** "Auburn" + mono "RESOURCES" (letter-spaced); no wave mark | `Header.astro` (`.wordmark`), `Footer.astro` | **Blocker** (Q-55): the site does not show the company logo. Needs vector artwork (SVG/EPS/AI) — the guide only holds a 393 × 128 px raster, too small for a crisp header and unsuitable as a master |
| L-2 | Guide gives no clear space, minimum size, reversed (on dark) version or misuse rules | — | — | Important (Q-55): request these with the vectors, especially a reversed version for the dark footer |
| L-3 | Q-40 notes the logo "is under review" | — | OPEN-QUESTIONS Q-40 | Important: confirm this 2019 lock-up is current before building it in |

### 3.4 Areas where the guide is silent (current implementation stands)

| Area | Current implementation (keep) | Evidence |
| --- | --- | --- |
| Spacing, layout, grid | 8 px scale, 12-column grid, 1440 px artboard, 48/64/80/90 rem breakpoints | `tokens.css`, `design-system.test.ts` |
| Buttons, links, navigation | Real `<a>`/`<button>`, square, outlined/filled, underline on hover, 44 px targets, visible focus ring | `components/primitives/Button.astro`, `Header.astro`, `MobileMenu.astro`; axe tests |
| Forms and states | Filter form only; visible labels; no error/success states yet (forms deferred) | `DocumentFilterForm.astro` |
| Photography, imagery, illustration | Documentary photography only, captioned, consented; no stock; numbered figures | CLAUDE.md §2.4, §3; DESIGN-DIRECTION |
| Tone of voice, terminology | Measured, technical, plain English; Australian English; no promotional phrasing | CLAUDE.md §1, §2.4–2.5 |
| Accessibility | WCAG 2.2 AA, zero axe violations, contrast tests | CLAUDE.md §6; e2e |
| Prohibitions | CLAUDE.md §2.4 and §3 (no stock images, images of text, shadows, gradients, rounded corners, scroll animations) | CLAUDE.md |

The guide contains no "must not" rules. Nothing in the current implementation contradicts a stated guide rule
other than C-1–C-4 and L-1 (which are about *not using* the guide's assets).

### 3.5 Already consistent with the guide

- Century Gothic as the brand typeface (T-1), and the refusal to commit or CDN-load it without a licence.
- Flat colour use with no gradients or shadows (the guide's slide uses flat fills only).
- Headings in a dark, cool ink on a light ground (the guide's title is dark teal on white; the site's are Survey
  Blue on paper) — the idea matches even though the values differ.
- Everything the guide is silent on (§3.4): no rewrite is needed there.

## 4. If the owner adopts the guide palette (impact, not a plan)

A mapping would change token **values**, not component code: components use role tokens only (no raw hex; enforced
by tests), so the change is concentrated in `tokens.css`, `DESIGN-DIRECTION.md` (approved document — owner approval),
contrast tests, the catalogue and screenshots. One possible role mapping, for discussion only:

| Role (token) | Current | Candidate from the guide | Check |
| --- | --- | --- | --- |
| headings, rules, buttons, footer (`--ink-survey`) | `#1B3A5C` | dark teal `#275259` or logo navy `#012361` | both pass AA |
| links, labels (`--ink-cyanotype`) | `#2C5F8F` | dark teal / logo navy (logo blue fails body AA) | logo blue only ≥ 24 px |
| secondary rules, tints (`--ink-contour`) | `#A9C1D9` | light teal `#B1D3D9` or teal `#81B8C2` | non-text only |
| body text (`--ink-graphite`) | `#262A2E` | charcoal `#3B3838` | passes |
| Auburn ground (`--copper`) | `#B8672E` | orange `#D45A1C` | large/fill only; a darker text variant must be derived and tested |
| page ground (`--paper`) | `#F5F2EA` | white (Q-54) | — |

Muted meta text (`--ink-muted`) has no guide equivalent that passes AA (grey `#ADA9A9` is 2.33:1 on white): it would
stay derived.

## 5. Decisions needed

The implementation proposal is `docs/BRAND-MIGRATION-PLAN.md` (D-031, Proposed).

See Q-53 to Q-56 in `docs/OPEN-QUESTIONS.md`.
