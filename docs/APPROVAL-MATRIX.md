# Owner and approval matrix

Status: **30 Sep 2026.** Who supplies, verifies and approves each kind of content, and who owns each outstanding
decision. Nothing is approved yet. Approval is recorded **only in the CMS**, by the named approver, with a date; the
build rejects an approval from someone not listed as an approver of the right kind (D-027).

## 1. Content

Kinds: **corporate** = company secretary · **technical** = competent person (CP). The kind is fixed per field by the
content system (`apps/site/src/lib/content/sanity/map.ts`).

| Content | Supplies | Verifies | Approves | Kind | Pack |
| --- | --- | --- | --- | --- | --- |
| Company details, contacts | company secretary | company secretary | company secretary | corporate | CS-2, CS-9 |
| Key facts, capital, registry, IPO statement | company secretary (registry) | company secretary | company secretary | corporate | CS-3 |
| Legal text (disclaimer, privacy, terms) | company / legal adviser | legal adviser | company secretary | corporate | CS-4 |
| People (roles, bios, portraits) | each person | each person | company secretary | corporate | CS-5 |
| Governance documents | company secretary | company secretary | company secretary | corporate | CS-6 |
| Reports, announcements, presentations (record, date, file, summary) | company secretary | company secretary | company secretary | corporate | CS-7 |
| Acknowledgement of Country; Traditional Owner names | company (with consent records) | company secretary | company secretary | corporate | CS-8 |
| Project holding, ownership, area, stage, tenements, state, access, infrastructure, as-at | company secretary (tenement register) | company secretary; CP for technical sense | company secretary | corporate | CS-1, CP-5 |
| Page copy (introductions, sections), hero lines, summaries | writer commissioned by the owner | company secretary | company secretary | corporate | PO-3 |
| Geology summaries, technical statements, CP statements | CP | CP | CP | technical | CP-1, CP-2 |
| Neighbouring deposits, third-party figures | CP | CP | CP | technical | CP-3 |
| Prospects, targets, resources, results, work history | CP | CP | CP | technical | CP-4, CP-7 |
| Maps, sections (figures) | CP (GIS) + web team (drawing) | CP | CP | technical | CP-5, CP-6 |
| Photographs | photographer | company secretary (consent) | company secretary | corporate | PO-4 |
| Milestones | company secretary | company secretary | company secretary | corporate | CS-10.2 |
| Technical passages in page copy (How we explore, home "why") | writer + CP | CP | company secretary today (home "why" is technical) | open: Q-58 | CP-8 |

## 2. People to appoint or confirm

| Role | Status | Needed for |
| --- | --- | --- |
| Corporate approver | old site lists Geoff Walker, Company Secretary & CFO — **to confirm** (CS-0.1) | any corporate content |
| Technical approver (CP) | **not named** (Q-30) | any technical content |
| Other approvers | none — to confirm (CS-0.2) | — |
| Studio users with write access | to decide (Q-46): recommended approvers + web team only | D-027 limitation |

## 3. Outstanding decisions

| Decision | Owner | Blocks launch | Ref |
| --- | --- | --- | --- |
| Minimum launch content, title-only pages | project owner | yes | `MINIMUM-LAUNCH-CONTENT.md` |
| Sanity plan (Growth), seats | project owner | yes | Q-10 |
| Approval roles / write access | project owner | yes | Q-46, D-027 |
| Studio hosting | project owner | yes | Q-45 |
| Asset exposure (Sanity CDN public by URL) | project owner | yes if documents or photos launch | Q-47 |
| PDF delivery for `/documents/[slug].pdf` | project owner | yes if documents launch | Q-59 |
| Email-alerts strip (build or hide) | project owner | yes | Q-60 |
| Brand palette, page ground, logo, heading weight | project owner | palette + logo: yes | Q-53–Q-56 |
| Accounts, registrar, DNS | project owner | yes | Q-09 |
| Canonical host (apex vs www) | project owner | yes | LAUNCH-GATE B-12 |
| OG image; Lighthouse CI; analytics | project owner | OG + Lighthouse: yes | Q-49–Q-51 |
| Approve D-029, D-030; HSTS scope | project owner | no | Q-48 |
| Merge Phase 6 | project owner | yes | LAUNCH-GATE B-13 |
| Whether and how the JORC Code applies to site disclosures | company / legal adviser | yes for technical pages | CS-4.4 |
| HOLD exploration-target wording | CP | no (stays hidden) | Q-32 |
| Third-party deposit figures | project owner + CP | no | Q-57 |
| Technical approval for page copy | project owner | no | Q-58 |
| Entitlement-offer URL | company secretary | no | Q-23 |
| Q-05, Q-08, Q-12, Q-34, Q-35, Q-40–Q-42 | as listed | no | OPEN-QUESTIONS |
