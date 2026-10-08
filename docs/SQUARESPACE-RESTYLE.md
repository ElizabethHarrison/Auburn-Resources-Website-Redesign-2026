# Squarespace restyle (interim)

Status: **prepared 8 Oct 2026 (D-036). Not applied.** The owner chose to restyle the current Squarespace site with
the new "Survey Sheet" look as a stopgap, while the new site (Cloudflare + Sanity, `docs/DEPLOYMENT.md`) continues.
Nothing here changes the new site, its content rules or its deployment.

> **Superseded by D-037:** the owner is building a new Squarespace site instead — see `docs/SQUARESPACE-BUILD.md`.
> The CSS file is shared by both routes.

File: `squarespace/auburn-restyle.css` — paste into Squarespace's Custom CSS. Appearance only: no content, page,
navigation or URL changes. Brand palette only (D-031); square, flat, 1 px rules, weight 400; no orange (D-032).

## What it does and does not do

| Restyled | Not possible from CSS (stays as in Squarespace) |
| --- | --- |
| Colours, fonts (with the right Site Styles), heading sizes in ink not weight | Page structure, layout grid, mobile layout |
| Square, flat buttons (dark teal; white on dark bands) | The new site's fact cells, project dossiers, document filters |
| Section bands: White / **Light teal** / **Dark teal**, chosen per section | The approval safeguards: content is only as accurate as it is kept by hand |
| Header rule, footer in dark teal, mono captions, dates and labels | Accessibility and speed work beyond colour, focus and motion |
| Visible keyboard focus; reduced motion respected | Redirects, structured data, sitemap changes |

## Steps

🖱 = Squarespace dashboard. Nothing is public until you click **Save** in step 4.

**1. Confirm the version (7.1 only).** Open the site in Squarespace. If the left panel has **Website → Website Tools**
(or a **Site Styles** paintbrush with Fonts / Colours / Animations), it is **7.1** — continue. If you see
**Design → Template**, it is **7.0**: stop; this CSS is written for 7.1.

**2. Make a private copy to try it on (recommended).** squarespace.com → your account dashboard → the site's **⋯**
menu → **Duplicate site**. The copy is a private trial site; do steps 3–5 there first. If **Duplicate site** is not
offered, skip it: the Custom CSS editor previews changes before you save.

**3. Site Styles** (🖱 the paintbrush, or Website → Site Styles):
- **Fonts:** Headings and Paragraphs → **Didact Gothic** (if listed; visitors with Century Gothic installed see it
  first). Assign **IBM Plex Mono** to one text style (e.g. Meta / Miscellaneous) so Squarespace loads it for the
  mono labels and captions. Do not upload Century Gothic: it has no web licence.
- **Colours → palette:** `#FFFFFF`, `#B1D3D9`, `#81B8C2`, `#275259`, `#3B3838` (anything the CSS does not reach then
  still uses brand colours).
- **Animations:** **None.** Scroll fade-ins hide content until scrolled (not allowed in the new design).
- **Buttons:** shape **Square**.

**4. Paste the CSS.** 🖱 **Website → Website Tools → Custom CSS** (older 7.1 menus: **Design → Custom CSS**). Select
everything in `squarespace/auburn-restyle.css`, paste it into the editor, look at the preview, then **Save**.

**5. Choose each section's band.** In the page editor: hover a section → **Edit section** (pencil) → **Colours** /
**Design** → theme:
- **White** for most sections, titles and dense content.
- **Light** for project cards, news and supporting sections.
- **Dark** for one feature section per page at most.
- Never make the section just above the footer **Dark** (the footer is dark teal). Legal pages stay all White.

**6. Check** at desktop and phone width: text readable on every band; press **Tab** — every link and button shows a
focus outline; forms usable; no animation on scroll.

**Undo:** Custom CSS → delete everything → **Save**; set Site Styles back. Nothing else is changed.

## Before you publish: content on the old site

Restyling makes old copy look current. The new site's content rules (CLAUDE.md §2) hold back items still on the old
site; consider removing them in Squarespace (owner decision; not done here):
- exploration-target wording marked HOLD: "Potential for 40Mt resource @ 10% Zn-Pb", "+200Mt sulphide / +25Mt oxide";
- the outdated Hawkwood work plan and the 2021 entitlement offer;
- promotional lines such as "where there's smoke, there's fire";
- any `mailto:email@email.com` link (broken contact link).
