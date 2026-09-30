# Brand migration plan

Status: **proposal, 30 Sep 2026 — nothing implemented.** No token, component, layout, font, logo or asset has been
changed. Implementation starts only after the owner decides the items in §13 (Q-53–Q-56, Q-12, D-031).

Sources: the company style guide (one slide, Nov 2019; transcribed in `docs/STYLE-GUIDE-AUDIT.md` §1), the approved
"Survey Sheet" direction (`docs/DESIGN-DIRECTION.md`), and the repository as it stands. Contrast ratios are WCAG 2.2
values computed from the printed RGB values.

**Labels used throughout**

- **GUIDE** — stated or shown in the style guide. Authoritative.
- **INTERPRETATION** — our reading of something the guide shows but does not state. Needs your confirmation.
- **DECISION** — the guide is silent; a design choice is needed. The proposal is a recommendation, not a brand rule.
- **DERIVED** — a colour not in the guide, made by shading or tinting a guide colour so that it can meet WCAG. Needs
  approval like any token.
- **KEEP** — current implementation, retained because the guide is silent and nothing conflicts.

---

## 1. Current state

| Area | Today | Where |
| --- | --- | --- |
| Colours | "Survey Sheet" inks: Survey Blue `#1B3A5C`, Cyanotype `#2C5F8F`, Contour `#A9C1D9`, Graphite `#262A2E`, Muted `#5A6B7C`; paper `#F5F2EA`; copper `#B8672E` for Auburn ground. **No style-guide colour is used.** | `apps/site/src/styles/tokens.css` |
| Type | Century Gothic first; Didact Gothic (OFL, self-hosted, **400 only**) as fallback because Century Gothic has no web licence (Q-12); IBM Plex Mono for labels; weight 400 everywhere | `tokens.css`, `layouts/BaseLayout.astro` (`@fontsource/*`) |
| Logo | Text wordmark "Auburn" + mono "RESOURCES"; no wave mark; **no favicon** | `components/patterns/Header.astro` |
| Architecture | Components use tokens only (tests reject raw colours and other weights). Roles live in `tokens.css`; about 30 components reference ink tokens such as `--ink-survey` directly | `lib/design-system.test.ts`, `lib/tokens.test.ts`, `lib/contrast.test.ts` |
| Rules locked by tests | exact approved hex values; the list of colour literals; contrast of every pairing used; weight 400 only | same |

The token layer is the lever: **changing values in `tokens.css` restyles the site without touching layout or
content structure.** That is the core of the plan.

## 2. Official brand requirements (GUIDE only)

| # | Requirement | Evidence |
| --- | --- | --- |
| G-1 | Logo colours: blue `#1586E2` (R21 G134 B226), navy `#012361` (R1 G35 B97) | "Logo Colours" section |
| G-2 | Primary palette: dark teal `#275259`, teal `#81B8C2`, orange `#D45A1C`, charcoal `#3B3838`, "R0 G0 B0" (see Q-54); mid teal `#4899A6`, light teal `#B1D3D9`, peach `#F0AD8C`, grey `#ADA9A9` | "Primary Colour Palette" section |
| G-3 | The logo is the three-wave mark above "AUBURN RESOURCES" (waves in logo blue, lettering in logo navy) | lock-up on the slide |
| G-4 | Century Gothic is the typeface (regular and bold are embedded in the guide) | the PDF's fonts |

That is everything the guide states or shows. It gives **no** colour roles, combinations, type scale, weights rule,
logo clear space, minimum size, reversed logo, UI components, imagery, tone or accessibility rules.

## 3. The four ambiguities (not decided here)

### Q-54 — the last primary swatch

- **Exact ambiguity:** the swatch is drawn white (with a thin grey outline) but labelled "RGB: R0 G0 B0", which is black.
- **Evidence:** it is the only swatch with an outline, which a designer adds to make a white box visible on a white
  slide; black would need none. Pure black would be close to the palette's charcoal `#3B3838`, which already serves
  as the dark neutral. Nothing else on the slide is black.
- **Proposed interpretation:** **white `#FFFFFF` was intended; the label is a typo.** Consequence: the page ground
  becomes white (replacing warm paper, which is not in the palette).
- **Alternative:** black was intended and the drawn fill is wrong; the page ground stays a neutral you choose.
- **Confirm with:** whoever maintains the brand (the company, or the guide's author).

### Q-56 — heading weight (and case)

- **Exact ambiguity:** the slide's title is Century Gothic **Bold, uppercase**; its section labels ("Logo Colours",
  "Primary Colour Palette") are **regular, title case**. The guide states no rule, so both weights appear, and the
  approved direction says "weight 400 throughout".
- **Technical constraint (from the repository):** the web fallback, Didact Gothic, exists **only at weight 400**.
  Bold headings would be browser-synthesised ("faux bold") for every visitor without Century Gothic — poor quality.
  Real bold needs a **Century Gothic web licence** (Q-12, both weights) or a different fallback family.
- **Options:** (a) keep 400 for all headings (KEEP; closest to the section labels; no licence dependency);
  (b) bold for H1–H2 only, uppercase optional — only with the Century Gothic licence; (c) bold for the page title
  only.
- **Proposed interpretation:** the guide does not require bold; **option (a) until the licence is bought**, then
  revisit (b).

### Q-53 — palette roles

- **Exact ambiguity:** the guide lists colours but assigns no roles, and separates "Logo Colours" from the "Primary
  Colour Palette".
- **Evidence:** row 2 of the palette appears to be a lighter partner of the colour above it (dark teal → mid teal,
  teal → light teal, orange → peach, charcoal → grey); this pairing is **not stated**. The slide's own title and
  rules use dark teal.
- **Proposed interpretation:**
  1. Logo colours are reserved for the logo (INTERPRETATION of the separate heading).
  2. **Dark teal** is the primary structural colour (headings, rules, buttons, footer ground) — the guide uses it for
     its own title (INTERPRETATION).
  3. **Charcoal** is body text.
  4. **Orange** replaces copper as the accent that marks Auburn's own ground (maps, tags) — keeps the existing
     "accent = Auburn ground only" rule (CLAUDE.md §3, which needs your approval to reword).
  5. Light tones (teal, light teal, peach, grey) are fills, tints and rules — never text.
- **Alternative:** navy as the primary structural colour (logo-led), dark teal secondary. Both pass AA (§5).

### Q-55 — logo and vectors

- **Exact ambiguity:** the guide contains the logo only as a **393 × 128 px raster** and gives no usage rules; Q-40
  says the logo may be under review.
- **Proposed interpretation:** the 2019 lock-up is current until you say otherwise; **the raster is not a source
  file and will not be traced, converted or redrawn** without your explicit approval.
- Files required and where to get them: §9.

## 4. Proposed semantic tokens

Approach: **keep the existing token names** (they are already roles; renaming would touch about 30 files for no
visual gain) and change their **values**. Add the guide's raw colours as brand tokens so every role points at a
named brand value. Optional later clean-up: rename `--ink-survey` / `--copper` to brand-neutral names (§8.6).

### 4.1 Brand tokens (new, GUIDE)

| Token | Value | Source |
| --- | --- | --- |
| `--brand-logo-blue` | `#1586E2` | GUIDE (logo) |
| `--brand-logo-navy` | `#012361` | GUIDE (logo) |
| `--brand-dark-teal` | `#275259` | GUIDE |
| `--brand-teal` | `#81B8C2` | GUIDE |
| `--brand-orange` | `#D45A1C` | GUIDE |
| `--brand-charcoal` | `#3B3838` | GUIDE |
| `--brand-white` | `#FFFFFF` | GUIDE, if Q-54 = white |
| `--brand-mid-teal` | `#4899A6` | GUIDE |
| `--brand-light-teal` | `#B1D3D9` | GUIDE |
| `--brand-peach` | `#F0AD8C` | GUIDE |
| `--brand-grey` | `#ADA9A9` | GUIDE |

### 4.2 Derived tokens (new, DERIVED — need approval)

| Token | Value | Derivation | Why |
| --- | --- | --- | --- |
| `--derived-orange-text` | `#AA4816` | orange × 0.8 (shaded) | orange fails body text (3.98); this passes (5.76 on white) for tag text and small accent text |
| `--derived-grey-text` | `#686565` | grey × 0.6 (shaded) | no guide colour works for meta / source lines; this passes (5.77 on white) |
| `--derived-light-teal-tint` | `#ECF4F6` | light teal at 25 % on white | alternating bands, table stripes, map sea |
| `--derived-peach-tint` | `#FCEFE8` | peach at 20 % on white | preview placeholder fill; orange-tag ground |

### 4.3 Role tokens (existing names, new values)

| Role token (unchanged name) | Current | Proposed | Label |
| --- | --- | --- | --- |
| `--ink-survey` (headings, rules, buttons, footer ground) | `#1B3A5C` | `var(--brand-dark-teal)` | INTERPRETATION (Q-53) |
| `--ink-cyanotype` (links, mono labels, figure lines) | `#2C5F8F` | `var(--brand-dark-teal)` | DECISION: no second brand colour passes for small text except navy; links stay distinguished by underline |
| `--ink-contour` (secondary rules, tints) | `#A9C1D9` | `var(--brand-light-teal)` | INTERPRETATION |
| `--ink-graphite` (body text) | `#262A2E` | `var(--brand-charcoal)` | INTERPRETATION |
| `--ink-muted` (source lines, meta) | `#5A6B7C` | `var(--derived-grey-text)` | DERIVED |
| `--paper` (page ground) | `#F5F2EA` | `var(--brand-white)` | Q-54 |
| `--paper-deep` (preview banner, panels) | `#ECE6D8` | `var(--derived-peach-tint)` | DERIVED (preview only) |
| `--water` (map sea, bands) | `#EEF2F4` | `var(--derived-light-teal-tint)` | DERIVED |
| `--band-grey` | `#E6ECF1` | `var(--derived-light-teal-tint)` | DERIVED |
| `--copper` (Auburn ground: map fills, tag borders, large type) | `#B8672E` | `var(--brand-orange)` | INTERPRETATION (Q-53) |
| `--copper-text` | `#8A4A1E` | `var(--derived-orange-text)` | DERIVED |
| `--copper-tint` | `#F3E5D8` | `var(--derived-peach-tint)` | DERIVED |
| `--on-survey` (text on the dark ground) | `#F5F2EA` | `var(--brand-white)` | DECISION |
| `--on-survey-muted` | `#D8E2EC` | `var(--brand-light-teal)` | INTERPRETATION |
| `--placeholder-fill` (preview only) | `#F8EFE6` | `var(--derived-peach-tint)` | DERIVED |
| `--color-focus` / `--color-focus-on-dark` | cyanotype / on-survey | dark teal / white | DECISION |

If you choose navy as primary (Q-53 alternative): `--ink-survey` → `var(--brand-logo-navy)`; everything else as above.

## 5. Accessibility

### 5.1 What each brand colour may be used for

Thresholds (WCAG 2.2 AA): body text 4.5:1; large text (≥ 24 px, or ≥ 18.66 px bold) 3:1; borders, focus rings,
icons and UI boundaries 3:1. Ratios below are against white; the dark-ground column shows the best light partner.

| Colour | vs white | Body text | Large text | Backgrounds | Borders / UI | Buttons | Accent |
| --- | --- | --- | --- | --- | --- | --- | --- |
| logo navy `#012361` | 14.85 | yes | yes | yes (with white text 14.85) | yes | yes | logo only (proposal) |
| logo blue `#1586E2` | 3.79 | **no** | yes | no text on it (white 3.79) | yes | **no** (white label fails) | logo only (proposal) |
| dark teal `#275259` | 8.62 | yes | yes | yes (white 8.62, light teal 5.41) | yes | yes (primary) | — |
| charcoal `#3B3838` | 11.61 | yes | yes | yes (white 11.61) | yes | yes | — |
| orange `#D45A1C` | 3.98 | **no** | yes | only with black text (5.28); **not** with white (3.98) | yes (on white) | **no** as a normal-size button fill | **yes: Auburn ground** |
| mid teal `#4899A6` | 3.29 | **no** | yes (on white only) | no text on it (white 3.29) | yes (on white) | **no** | fills |
| teal `#81B8C2` | 2.19 | no | no | yes with navy text (6.77); dark-teal text large only (3.93) | **no** (< 3) | no | decorative fills |
| light teal `#B1D3D9` | 1.59 | no | no | yes, with dark teal (5.41), navy (9.33), charcoal (7.29) text | **no** (decorative rules only) | no | tints |
| peach `#F0AD8C` | 1.90 | no | no | yes, with dark teal (4.54) or charcoal text | no | no | tints |
| grey `#ADA9A9` | 2.33 | no | no | fills only | no | no | disabled fills only (with a text label) |
| derived orange text `#AA4816` | 5.76 | yes | yes | — | yes | — | small accent text |
| derived grey text `#686565` | 5.77 | yes | yes | — | yes | — | meta text |

**Never use for text:** teal, light teal, peach, grey; orange, logo blue and mid teal except as large text.
**Orange on dark teal (2.17) and on navy (3.73 — large only):** the Auburn-ground accent never sits on the dark ground.

### 5.2 Every proposed pairing (becomes `contrast.test.ts`)

| Foreground | Background | Ratio | Needed | Use |
| --- | --- | --- | --- | --- |
| charcoal | white | 11.61 | 4.5 | body text |
| charcoal | light-teal tint | 10.41 | 4.5 | body text on bands |
| charcoal | peach tint | 10.31 | 4.5 | placeholder brief (preview) |
| dark teal | white | 8.62 | 4.5 | headings, links, labels, fact values, outline button text |
| dark teal | light-teal tint | 7.73 | 4.5 | labels on bands |
| dark teal | light teal | 5.41 | 4.5 | text on light-teal panels (if used) |
| derived grey text | white | 5.77 | 4.5 | source lines, meta |
| derived grey text | light-teal tint | 5.18 | 4.5 | meta on bands |
| derived grey text | peach tint | 5.13 | 4.5 | meta in preview panels |
| derived orange text | white | 5.76 | 4.5 | tag text, small accent text |
| derived orange text | light-teal tint | 5.16 | 4.5 | tags on bands |
| derived orange text | peach tint | 5.11 | 4.5 | INPUT NEEDED label, preview banner |
| orange | white | 3.98 | 3.0 | large accent type; tag borders; status dots; map fills |
| orange | light-teal tint | 3.57 | 3.0 | map fill against sea |
| white | dark teal | 8.62 | 4.5 | footer text, CTA band, primary button label |
| light teal | dark teal | 5.41 | 4.5 | secondary footer text |
| white | dark teal | 8.62 | 3.0 | focus ring and light outlines on the dark ground |
| dark teal | white | 8.62 | 3.0 | rules, button outlines, focus ring, status dot |
| logo blue | white | 3.79 | 3.0 | logo waves (graphic) |
| logo navy | white | 14.85 | 4.5 | logo lettering |
| logo navy (lettering) | dark teal | 1.72 | — | **fails**: the full-colour logo cannot sit on the dark footer — a reversed logo is required |

Kept as documented failures (tests assert they fail, so no component uses them): orange on dark teal (2.17),
light teal on white (1.59, decorative rules only), mid teal on dark teal (2.62), orange with white label (3.98).

## 6. Typography

| Item | Label | Proposal |
| --- | --- | --- |
| Typeface | GUIDE | Century Gothic (unchanged) |
| Web availability | DECISION (Q-12) | buy a Century Gothic web licence (regular + bold), or keep Didact Gothic as the visible fallback |
| Weights | Q-56 | 400 everywhere until the licence exists (KEEP) |
| Case | DECISION | sentence case for headings (KEEP); uppercase only for mono labels as now; the guide's uppercase title is not treated as a rule |
| Mono face | DECISION (guide silent) | keep IBM Plex Mono for labels, sheet numbers, tables, dates (KEEP) |
| Scale and hierarchy | DECISION (guide silent) | keep the tested fluid scale (KEEP) |
| Heading colour | INTERPRETATION | dark teal (via `--ink-survey`); body charcoal |

## 7. Component-by-component

For each: **Guide** (what the guide requires) · **Decision** (where it is silent) · **Proposal** · **Files**.

| Component | Guide | Decision (guide silent) | Proposal | Files |
| --- | --- | --- | --- | --- |
| **Logo** | wave lock-up; logo blue + navy | size, clear space, reversed version, favicon | vector lock-up in the header linking home, with an accessible name "Auburn Resources — home"; reversed (white) in the footer if the footer carries a logo; favicon from the wave mark | `Header.astro`, `Footer.astro` (optional), `BaseLayout.astro` (favicon links); new files in `apps/site/src/assets/brand/` |
| **Header / navigation** | — | ground, rule and link colours | white ground, dark-teal bottom rule, dark-teal nav text, underline on hover (KEEP layout, breakpoints, sheet numbers) | `Header.astro` (logo only; colours via tokens) |
| **Mobile menu** | — | as header | same tokens; no structural change | `islands/MobileMenu.astro` (none beyond tokens) |
| **Buttons** | — | fills and states | primary: dark-teal fill, white label; secondary: dark-teal outline; on dark: white outline or white fill with dark-teal label; **no orange or logo-blue buttons** (labels fail AA); square (KEEP) | `primitives/Button.astro` (none beyond tokens) |
| **Links** | — | colour, underline | dark teal, always underlined in body text, hover = thicker/solid underline (KEEP behaviour) | tokens only |
| **Cards** (sheet cards, link cards, person cards) | — | ground, borders | white ground, dark-teal 1 px frame, dark-teal titles, orange only for Auburn-ground tags (KEEP structure) | tokens only |
| **Backgrounds** | white (Q-54) | tints, bands | page white; bands light-teal tint; dark ground dark teal (footer, CTA band); peach tint preview-only | tokens only |
| **Borders / dividers** | — | weights and colours | 1 px dark-teal structural rules (pass 3:1); light-teal secondary rules — decorative only, never the sole boundary of a control (KEEP rule) | tokens only |
| **Forms** (filter form now; contact and alerts later) | — | fields, labels, focus, errors | white field, dark-teal 1 px border (8.62), charcoal text, visible labels, dark-teal focus ring; error and success states: §7.1 | `DocumentFilterForm.astro` (none beyond tokens) |
| **Alerts / status states** | — | colours | §7.1 | tokens; later forms |
| **Tables** (document registers, fact lists) | — | header and row styling | dark-teal header rule and mono labels; light-teal-tint zebra optional; charcoal cells (KEEP) | tokens only |
| **Tags** | — | — | orange border + derived orange text for Auburn ground; dark-teal tags otherwise (KEEP rule) | tokens only |
| **Maps / figures** | — | cartographic palette | Auburn ground orange fill (3.98 vs white; 3.57 vs sea tint), other tenure grey/mid-teal outline, sea light-teal tint, dark-teal frame and captions; legend and text equivalent unchanged | `MapLegend.astro`, `Figure.astro` (tokens only); future SVG/MapLibre styles read the same tokens |
| **Footer** | — | ground | dark-teal ground, white text, light-teal secondary text (5.41), white focus ring; reversed logo if a logo is added | `Footer.astro` (tokens; logo optional) |
| **Status dots, placeholders, preview banner** (preview only) | — | — | approved = dark teal; to verify / input needed = orange; placeholder fill peach tint with derived orange-text label | tokens only |
| **Responsive / mobile** | — | — | no change: breakpoints, 44 px targets, 360 px layout stay; logo needs a compact form that fits the 56 px mobile header (ask for a mark-only or stacked version) | `Header.astro` |

### 7.1 Alerts and status states (DECISION — the guide has no state colours)

Orange is proposed as the "Auburn ground" accent, so using it for errors would give it two meanings. Options:

| Option | Error | Success | Info |
| --- | --- | --- | --- |
| **A (proposed)** | charcoal text + icon + **2 px dark-teal left border** + the word "Error" | dark teal + icon + "Done" | light-teal-tint panel, dark-teal text |
| B | derived orange text + icon (orange used for "attention" as well as Auburn ground) | as A | as A |
| C | a new, non-brand red for errors (contrast-tested) | as A | as A |

Whichever option: never colour alone (icon + text), messages linked with `aria-describedby`, focus moved to the error
summary. Not needed until forms are built.

## 8. Mapping to the repository

### 8.1 Tokens

`apps/site/src/styles/tokens.css`: add §4.1 brand tokens (tagged, e.g. `[G]`) and §4.2 derived tokens (`[D]`);
re-point the §4.3 role tokens; update comments. Nothing else in `tokens.css` changes (spacing, type scale, layout,
radius, motion).

### 8.2 Components

| Change | Files | Why |
| --- | --- | --- |
| None beyond token values | all other components (about 30 reference tokens only) | the token architecture already isolates colour |
| Logo instead of the text wordmark | `components/patterns/Header.astro` | GUIDE G-3 (needs §9 files) |
| Favicon and app icons | `layouts/BaseLayout.astro` | no favicon today |
| Reversed logo in the footer (optional) | `components/patterns/Footer.astro` | only if you want a footer logo |
| Swatches | `src/catalogue/sections/Foundations.astro` | shows the new palette (preview only) |
| Heading weight (only if Q-56 = bold) | `styles/base.css`, `tokens.css` (`--font-weight-*`) | Q-56 |

### 8.3 Pages affected

Every page changes colour (global tokens); no page changes layout, order or content. Pages with visible logo or
colour-heavy modules to review by eye: home, portfolio, project dossier, investor centre and registers, footer on all
pages, the catalogue (preview).

### 8.4 Layout or content structure

**No change needed.** Module order, sheet numbers, grids, breakpoints and content rules are unaffected.

### 8.5 Tests

| Test | Change |
| --- | --- |
| `lib/tokens.test.ts` | new approved values; new literal list (brand + derived tokens); tag checks |
| `lib/contrast.test.ts` | replace pairings with §5.2; update the documented-failures list |
| `lib/design-system.test.ts` | unchanged (no raw colours in components); weight rule changes only if Q-56 = bold |
| e2e axe (all pages, four builds) | unchanged; re-verifies contrast on rendered pages |
| New: logo | header shows the logo image with an accessible name; link to `/`; favicon links present |
| New (optional): visual snapshots | a small Playwright screenshot set (home, project, investors) to review the migration |

These are value updates approved by the owner, not weakened checks.

### 8.6 Optional clean-up (not required)

Rename role tokens to brand-neutral names (`--ink-survey` → `--ink-primary`, `--copper` → `--accent-ground`, …) in a
separate mechanical commit. Recommended only after the migration is approved and stable.

### 8.7 Documentation

`docs/DESIGN-DIRECTION.md` (approved document: colour section rewritten, with your approval); CLAUDE.md §3 (copper
wording → orange / "accent"; §9.3 list); `docs/DECISIONS.md` (D-031); catalogue text; `docs/STYLE-GUIDE-AUDIT.md`
status.

## 9. Asset requirements

**Logo — required files (vector masters; do not trace the raster):**

| File | Why |
| --- | --- |
| Full-colour lock-up, **SVG** (outlined text) | header |
| Same as **EPS or AI, or vector PDF** | master for print and future edits |
| **Reversed** lock-up (white, or white waves + white lettering) | dark footer / CTA band (navy lettering on dark teal is 1.72:1) |
| **Mark only** (the waves), SVG | favicon, compact mobile header, social image |
| Compact / stacked version, if one exists | 56 px mobile header |
| One-colour (navy) version | documents, embossing |
| Usage notes: clear space, minimum size, colours on dark, don'ts (if they exist) | so we don't invent rules |
| Name of the lettering typeface (if the lettering is set text) | the lettering does not appear to be Century Gothic; knowing the typeface avoids guesswork |

**Where to get them:** (1) the company's brand owner or the designer/agency who produced the Nov 2019 style guide
(the PDF's author metadata may help the company trace them); (2) the old site's logo files are named
"Untitled design - 2024-05-23…", which is the default naming of an online design tool — if the logo was rebuilt
there in 2024, its owner can export SVG/PDF; (3) DGR Global's marketing team, if they manage group branding. Confirm
first that this 2019 lock-up is current (Q-40, Q-55).

**Favicon set (made from the mark once supplied):** `favicon.svg`, `favicon.ico` (32 px), `apple-touch-icon.png`
(180 px). **Fonts:** Century Gothic web licence (Q-12) — optional; nothing is committed without it. **Social image:**
depends on Q-49.

## 10. Accessibility considerations

- Only navy, dark teal and charcoal (and the two derived text colours) are ever used for normal-size text.
- Orange, logo blue and mid teal: large text or graphics only; never button labels on those fills.
- Light tones: backgrounds and decoration only; never the only boundary of an input or control.
- Dark ground (footer, CTA band): white or light-teal text only; no orange, no full-colour logo.
- Focus ring: dark teal on light grounds, white on the dark ground (both ≥ 3:1).
- Links stay underlined (colour is not the only cue, WCAG 1.4.1).
- Status: icon + text, never colour alone.
- Everything verified by `contrast.test.ts` (unit) and axe on every page of four builds (e2e).

## 11. Test requirements

- Unit: tokens (values, literals, tags), contrast (every pairing in §5.2 plus documented failures), design-system
  rules unchanged.
- E2E: zero axe violations on every page in all four builds; header logo present with an accessible name, links home,
  sized within the header at 360/768/1280/1440 px; favicon links; no horizontal scroll; mobile menu unchanged.
- Guards unchanged: no raw colours in components, production has no preview-only output, CSP has no new sources (logo
  and favicon are same-origin files).
- Manual: eye review of home, project page, investor centre, footer and catalogue in both modes; screenshots attached
  to the review.

## 12. Implementation order (after approval)

1. Record D-031 (Approved) and the answers to Q-53–Q-56 in DECISIONS / OPEN-QUESTIONS; update DESIGN-DIRECTION and
   CLAUDE.md wording.
2. Tokens: add brand + derived tokens; re-point roles; update `tokens.test.ts` and `contrast.test.ts`. One commit.
3. Catalogue swatches; screenshots; eye review. One commit.
4. Logo (only when vector files arrive): header logo, favicon set, optional footer logo; tests. One commit.
5. Heading weight (only if Q-56 = bold and the licence exists): font files, weights, tests. One commit.
6. Optional token rename (§8.6).

Steps 2–3 can ship before the logo arrives; step 4 waits for the files.

## 13. Acceptance criteria

- Every colour on the site resolves to a guide colour or an approved derived colour; `tokens.test.ts` lists them.
- Every pairing used passes WCAG 2.2 AA (`contrast.test.ts`); zero axe violations on all pages in four builds.
- The header shows the company logo from supplied vector files (not traced); favicon present.
- No layout, module order, content or URL change; no new runtime dependency; no third-party font or CDN load.
- The "accent marks Auburn ground only" rule still holds, with orange as the accent.
- `pnpm check` green; screenshots reviewed and approved by you.

## 14. Decisions you need to make

1. **Q-54:** white intended for the "R0 G0 B0" swatch (page ground white), or black?
2. **Q-53:** primary structural colour — dark teal (proposed) or navy; logo colours reserved for the logo; orange
   replaces copper as the Auburn-ground accent.
3. **Derived colours (§4.2):** approve the two text shades and two tints, or have the brand owner supply them.
4. **Q-56 + Q-12:** keep weight 400 (proposed), or bold headings with a Century Gothic web licence.
5. **Q-55:** confirm the 2019 lock-up is current and request the vector files in §9; footer logo yes/no.
6. **Status states (§7.1):** option A, B or C (can wait until forms are built).
7. **Approve D-031** (roles kept, values changed; DESIGN-DIRECTION colour section replaced).
