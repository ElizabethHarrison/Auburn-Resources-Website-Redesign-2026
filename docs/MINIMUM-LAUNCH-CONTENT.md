# Minimum launch content

Status: **proposal for the owner's decision (B-1 in `docs/LAUNCH-GATE.md`), 30 Sep 2026.** This defines the smallest
set of *approved* content for a credible production launch. It decides no fact, legal wording or technical claim:
each item is supplied and approved by the named person (`docs/content-request/`). IDs refer to the Content Request
Pack: CS = company secretary, CP = competent person, PO = project owner.

How the site behaves meanwhile (unchanged): production shows approved content only; anything else is hidden, never
half-shown. A page whose content is all unapproved still exists, showing only its title block (D-019: acceptable
temporarily, **not launch-ready**).

## 1. Absolutely required for launch

Without these the site is not a credible, compliant source of truth.

| Area | Content | Request | Approver |
| --- | --- | --- | --- |
| Approval | Company secretary confirmed as corporate approver; approver list | CS-0.1, CS-0.2 | owner / board |
| Company identity | Legal name, company type, public email, current street address | CS-2.1, 2.2, 2.6, 2.7 | CS (corporate) |
| Key facts | Company status, number of projects, commodities, jurisdictions, DGR Global holding (with as-at date) | CS-3.1, 3.2, 3.4, 3.5 | CS |
| IPO statement | Current position, or removal of the old "proposed IPO" line | CS-3.9 | CS |
| Legal | Disclaimer, privacy policy, terms of use — company-supplied text with last-updated dates | CS-4.1–4.3 | CS (company-supplied) |
| Home | Hero heading and introduction | PO-3 | CS |
| Company | Introduction; DGR Global relationship | PO-3, CS-10.1 | CS |
| Leadership | Each person's current role (bios may follow) | CS-5.1 | CS |
| Portfolio | Verified project list; portfolio summary | CS-1.1, PO-3 | CS |
| Investors | Investor centre introduction | PO-3 | CS |
| Contact | Introduction and approved inboxes | CS-9.1, PO-3 | CS |
| Brand | Logo vectors and the palette decision | PO-4.1, Q-53–Q-55 | owner |

**Needs your decision (flagged, not assumed):**

- **At least one project page?** Recommended: launch with every *held* flagship project that has holding, area,
  ownership, stage and a CP statement approved (CS-1.4–1.6, CP-0, CP-1). A company-level launch with no project page
  is possible but thin for an explorer. **Any project page with technical content needs an appointed CP.**
- **At least the latest annual report?** Recommended: yes, which requires the PDF route (`docs/PDF-ASSETS-FORMS.md`).
  Without it, the reports and announcements registers are empty in production.
- **Title-only pages:** list which pages may launch showing only their title (D-019), or require intro copy for all.
- **Email-alerts strip:** build the form or hide the strip (Q-60); it is on every page.

## 2. Required for specific pages or features

A page can launch title-only (if you allow it) until these are approved; its modules appear as soon as they are.

| Page / feature | Needs | Request |
| --- | --- | --- |
| Each project page | holding, area and ownership (publish rule); technical modules also need the CP statement | CS-1.4–1.6, CP-1, CP-2 |
| Project technical modules | geology summary; decided statements; prospects | CP-2, CP-4 |
| `/investors/reports`, `/announcements`, `/presentations` | document record, release date and file approved + the PDF route | CS-7, Q-59 |
| `/investors/governance` | current policies as PDFs with dates; approach; committees; whistleblower route | CS-6 |
| `/investors/shareholders` | shares on issue, capital structure table, registry contact, transfer process | CS-3.6, 3.7, 3.10 |
| `/investors/alerts` | the alerts decision (Q-60); intro; data-use text consistent with the privacy policy | PO-2.6, PO-3 |
| `/sustainability` (three pages) | specific commitments, accountability, practice, community contact | CS-8, CS-10.3 |
| `/news/media` | media contact | CS-9.2 |
| Announcement pages | plain-language summary per announcement | CS-7.3 |
| Footer legal row | ACN, ABN | CS-2.3, 2.4 |

## 3. Desirable before launch

ACN, ABN, phone, postal address; acknowledgement of Country (CS-8.1: strongly recommended); biographies and
qualifications; tenement numbers; ground held (km²); geology summaries and statements for every launched project;
the home "why this ground" paragraph; Open Graph image (Q-49, a CLAUDE.md §7 requirement); flagship count and its
wording (CS-1.3); Century Gothic licence (Q-12).

## 4. Safe to defer until after launch

Their modules stay hidden until approved; nothing breaks.

Maps and GIS (Q-31), cross-sections (Q-33), field photography and portraits (Q-41), work history and years
(CP-7.1), resources and results (CP-7.3; only if any exist), milestones (CS-10.2), reporting calendar (CS-3.11),
major holders (CS-3.8), media kit and coverage list (CS-10.4), Traditional Owner names (CS-8.2, only with consent),
social links (CS-2.9), `/2021-entitlement-offer` target (Q-23), third-party deposit figures (Q-57), HOLD wording
(Q-32: stays hidden regardless), neighbouring deposits (Q-35), search, map island, lightbox, contact form (if inboxes
are shown).
