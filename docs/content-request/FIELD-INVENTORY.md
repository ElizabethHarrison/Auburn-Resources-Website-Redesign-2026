# Field inventory

Every content field the website can show, with its state on **30 Sep 2026** (fixture content, production build).
Generated from the launch-readiness data (`pnpm build && pnpm readiness` produces the live version in
`apps/site/reports/`). "To verify" means an old-site value exists but is unverified; "INPUT NEEDED" means we have
nothing. **Nothing is approved.** Approval: corporate = company secretary; technical = competent person.

Request IDs refer to `company-secretary.md` (CS), `competent-person.md` (CP) and `project-owner.md` (PO).
Total: **319 fields**, none approved.


## Site settings (header, footer, contact details)

Appears on: footer, contact, key facts (site-wide).

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `legalName` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `companyType` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `acn` | INPUT NEEDED | ACN for the footer legal row | corporate |
| `abn` | INPUT NEEDED | ABN | corporate |
| `phone` | INPUT NEEDED | Company phone number | corporate |
| `email` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `streetAddress` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `postalAddress` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `socialProfiles` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `acknowledgementOfCountry` | INPUT NEEDED | Approved acknowledgement of Country wording (docs/OPEN-QUESTIONS.md Q-26) | corporate |
| `keyFacts.projectCount` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `keyFacts.flagshipCount` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `keyFacts.groundHeld` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `keyFacts.commodities` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `keyFacts.jurisdictions` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `keyFacts.companyStatus` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `keyFacts.dgrHolding` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `keyFacts.sharesOnIssue` | INPUT NEEDED | Shares on issue, from the share registry (Q-22) | corporate |
| `keyFacts.ipoStatus` | to verify | confirm or correct the old-site value; source + as-at | corporate |

## Home page

Appears on: `/`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `heroHeading` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `heroIntro` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `portfolioMap` | INPUT NEEDED | Fig. 1 portfolio map drawn from tenement GIS (Q-31). | technical |
| `whyHeading` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `whyText` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `crossSection` | INPUT NEEDED | Fig. 2 cross-section approved by the competent person (Q-33). | technical |
| `sustainabilityLine` | INPUT NEEDED | One specific, verifiable sentence on how Auburn works on Country and with landholders | corporate |

## Projects portfolio page

Appears on: `/projects`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | One-paragraph portfolio summary: plain language, no figures (numbers belong in facts) | corporate |
| `portfolioMap` | INPUT NEEDED | Fig. 1 portfolio map drawn from tenement GIS (Q-31). | technical |

## Page copy: /company

Appears on: `/company`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: who Auburn is, where it works and what it is looking for; one paragraph, no digits | corporate |
| `sections[0].paragraphs[0]` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `sections[0].paragraphs[1]` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `sections[1].paragraphs[0]` | INPUT NEEDED | Strategy and pathway as a sequence of stages, approved by the board | corporate |
| `sections[2].paragraphs[0]` | INPUT NEEDED | The relationship with DGR Global Ltd: shareholding, shared services and board links, approved by the company secretary | corporate |
| `sections[3].paragraphs[0]` | INPUT NEEDED | Company milestone timeline, verified dates only | corporate |

## Page copy: /company/leadership

Appears on: `/company/leadership`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: how the board and management are organised; one paragraph, no digits | corporate |

## Page copy: /projects/how-we-explore

Appears on: `/projects/how-we-explore`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: the exploration approach across the portfolio; one paragraph, no digits | corporate |
| `sections[0].paragraphs[0]` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `sections[1].paragraphs[0]` | INPUT NEEDED | One block per method (geophysics, geochemistry, drilling…) with an Auburn example figure, reviewed by the competent person | corporate |
| `sections[2].paragraphs[0]` | INPUT NEEDED | The sequence from target generation to a drill hole, reviewed by the competent person | corporate |

## Page copy: /investors

Appears on: `/investors`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: the company's current position for shareholders and brokers; one paragraph, no digits | corporate |
| `sections[0].paragraphs[0]` | INPUT NEEDED | Reporting calendar: dates of reports and meetings (Q-22) | corporate |

## Page copy: /investors/announcements

Appears on: `/investors/announcements`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: what the announcement register holds; one paragraph, no digits | corporate |

## Page copy: /investors/reports

Appears on: `/investors/reports`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: annual, half-yearly and quarterly reports; one paragraph, no digits | corporate |

## Page copy: /investors/presentations

Appears on: `/investors/presentations`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: the current corporate presentation and the archive; one paragraph, no digits | corporate |

## Page copy: /investors/shareholders

Appears on: `/investors/shareholders`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: practical information for holders of unlisted shares; one paragraph, no digits | corporate |
| `sections[0].paragraphs[0]` | INPUT NEEDED | Capital structure as an HTML table with an as-at date, from registry data (Q-22); never an image | corporate |
| `sections[1].paragraphs[0]` | INPUT NEEDED | How to buy or transfer unlisted shares, approved by the company secretary | corporate |
| `sections[2].paragraphs[0]` | INPUT NEEDED | Share registry name and contact details (Q-22) | corporate |
| `sections[3].paragraphs[0]` | INPUT NEEDED | Shareholder questions and answers, approved by the company secretary | corporate |

## Page copy: /investors/governance

Appears on: `/investors/governance`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: how the company is governed; one paragraph, no digits | corporate |
| `sections[0].paragraphs[0]` | INPUT NEEDED | Approach to governance, approved by the board | corporate |
| `sections[1].paragraphs[0]` | INPUT NEEDED | Board committees, their charters and members | corporate |
| `sections[2].paragraphs[0]` | INPUT NEEDED | How to raise a concern, and the governance contact | corporate |

## Page copy: /investors/alerts

Appears on: `/investors/alerts`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: what subscribers receive: announcements, reports, news; one paragraph, no digits | corporate |
| `sections[0].paragraphs[0]` | INPUT NEEDED | How subscriber details are used, consistent with the Privacy Policy | corporate |

## Page copy: /sustainability

Appears on: `/sustainability`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: how Auburn works, in specific and verifiable terms; one paragraph, no digits | corporate |
| `sections[0].paragraphs[0]` | INPUT NEEDED | Three or four specific, verifiable commitments (the old site copy is generic and is not reused) | corporate |
| `sections[1].paragraphs[0]` | INPUT NEEDED | Who is accountable for sustainability, by role | corporate |

## Page copy: /sustainability/community

Appears on: `/sustainability/community`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: working with Traditional Owners, landholders and communities; one paragraph, no digits | corporate |
| `sections[0].paragraphs[0]` | INPUT NEEDED | How Auburn works on Country; Traditional Owner groups named only with their recorded consent | corporate |
| `sections[1].paragraphs[0]` | INPUT NEEDED | Land access approach and agreements the company chooses to disclose | corporate |
| `sections[2].paragraphs[0]` | INPUT NEEDED | Local employment, contracting and community support | corporate |
| `sections[3].paragraphs[0]` | INPUT NEEDED | A named community contact | corporate |

## Page copy: /sustainability/environment-safety

Appears on: `/sustainability/environment-safety`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: environmental and safety practice; one paragraph, no digits | corporate |
| `sections[0].paragraphs[0]` | INPUT NEEDED | Environmental management and rehabilitation practice; before/after photographs if available | corporate |
| `sections[1].paragraphs[0]` | INPUT NEEDED | Safety management system, in specific terms | corporate |
| `sections[2].paragraphs[0]` | INPUT NEEDED | Environment and safety policies, as files | corporate |

## Page copy: /news

Appears on: `/news`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: exploration updates, company news and coverage; one paragraph, no digits | corporate |

## Page copy: /news/media

Appears on: `/news/media`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: information for journalists; one paragraph, no digits | corporate |
| `sections[0].paragraphs[0]` | INPUT NEEDED | Named media contact with email and phone | corporate |
| `sections[1].paragraphs[0]` | INPUT NEEDED | Media kit, logos, images and portraits, each with usage terms | corporate |
| `sections[2].paragraphs[0]` | INPUT NEEDED | Media coverage list (from the old Media Coverage page), each with outlet and date | corporate |

## Page copy: /contact

Appears on: `/contact`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `intro` | INPUT NEEDED | Introduction: how to reach the company; one paragraph, no digits | corporate |
| `sections[0].paragraphs[0]` | INPUT NEEDED | A named inbox for each enquiry type: investors, partnerships, media, landholder or community, general | corporate |

## Legal page: /disclaimer

Appears on: `/disclaimer`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `lastUpdated` | INPUT NEEDED | Last-updated date of the supplied text | corporate |
| `clauses` | INPUT NEEDED | Disclaimer: forward-looking statements, JORC 2012 basis, competent persons and no offer of securities, supplied by the company (Q-24); not drafted by the web team | corporate |

## Legal page: /privacy

Appears on: `/privacy`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `lastUpdated` | INPUT NEEDED | Last-updated date of the supplied text | corporate |
| `clauses` | INPUT NEEDED | Privacy policy, supplied by the company (Q-24); not drafted by the web team | corporate |

## Legal page: /terms

Appears on: `/terms`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `lastUpdated` | INPUT NEEDED | Last-updated date of the supplied text | corporate |
| `clauses` | INPUT NEEDED | Terms of use, supplied by the company (Q-24); not drafted by the web team | corporate |

## Project: Nicholson

Appears on: `/projects/nicholson`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `holding` | INPUT NEEDED | Whether the project is still held (docs/OPEN-QUESTIONS.md Q-20) | corporate |
| `state` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `commodities` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `stage` | INPUT NEEDED | Current exploration stage | corporate |
| `areaKm2` | INPUT NEEDED | Area in km² from the tenement schedule | corporate |
| `ownership` | INPUT NEEDED | Holder, ownership percentage and any JV terms | corporate |
| `heroThesis` | INPUT NEEDED | Hero thesis: one line, no digits, 120 characters or fewer | corporate |
| `geologySummary` | INPUT NEEDED | Geological setting, 120 words or fewer, CP-approved | technical |
| `statements[0]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[1]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[2]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[3]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `tenements` | INPUT NEEDED | Tenement numbers (e.g. EPM numbers) from the tenement schedule (Q-31) | corporate |
| `asAt` | INPUT NEEDED | Page as-at date, set when the project facts are approved | corporate |
| `setting.neighbouringDeposits` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `setting.nearestTown` | INPUT NEEDED | Nearest town and distance | corporate |
| `setting.access` | INPUT NEEDED | Access: roads, seasonal access | corporate |
| `setting.infrastructure` | INPUT NEEDED | Infrastructure: power, port, rail, water | corporate |
| `setting.traditionalOwners` | INPUT NEEDED | Traditional Owners: named only with their consent | corporate |
| `heroPhoto` | INPUT NEEDED | Hero photograph at Nicholson: landscape, natural light, field activity if possible. Commissioned only (no stock imagery); caption and date required. | corporate |
| `settingMap` | INPUT NEEDED | Fig. 1 Nicholson regional setting map from tenement GIS (Q-31). | technical |
| `sectionFigure` | INPUT NEEDED | Fig. 2 cross-section approved by the competent person (Q-33). | technical |
| `cpStatement` | INPUT NEEDED | Competent person statement for Nicholson: name, qualifications, membership, relationship to Auburn and consent wording (Q-30) | technical |

## Project records: Nicholson

Appears on: `/projects/nicholson`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `prospects[0].summary` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `prospects[0].targetType` | INPUT NEEDED | Target type and depth | technical |
| `prospects[1].summary` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `prospects[1].targetType` | INPUT NEEDED | Evidence and target type | technical |
| `prospects[2].summary` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `prospects[2].targetType` | INPUT NEEDED | Evidence and target type | technical |
| `prospects[3].summary` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `prospects[3].targetType` | INPUT NEEDED | Status and target type | technical |
| `workItems[0].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[0].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[0].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[1].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[1].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[1].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[2].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[2].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[2].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[3].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[3].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[3].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |

## Project: Calgoa

Appears on: `/projects/calgoa`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `holding` | INPUT NEEDED | Whether the project is still held (docs/OPEN-QUESTIONS.md Q-20) | corporate |
| `state` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `commodities` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `stage` | INPUT NEEDED | Current exploration stage | corporate |
| `areaKm2` | INPUT NEEDED | Area in km² from the tenement schedule | corporate |
| `ownership` | INPUT NEEDED | Holder, ownership percentage and any JV terms | corporate |
| `heroThesis` | INPUT NEEDED | Hero thesis: one line, no digits, 120 characters or fewer | corporate |
| `geologySummary` | INPUT NEEDED | Geological setting, 120 words or fewer, CP-approved | technical |
| `statements[0]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[1]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[2]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[3]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[4]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[5]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `tenements` | INPUT NEEDED | Tenement numbers (e.g. EPM numbers) from the tenement schedule (Q-31) | corporate |
| `asAt` | INPUT NEEDED | Page as-at date, set when the project facts are approved | corporate |
| `setting.neighbouringDeposits` | INPUT NEEDED | Neighbouring deposits, each with a source | technical |
| `setting.nearestTown` | INPUT NEEDED | Nearest town and distance | corporate |
| `setting.access` | INPUT NEEDED | Access: roads, seasonal access | corporate |
| `setting.infrastructure` | INPUT NEEDED | Infrastructure: power, port, rail, water | corporate |
| `setting.traditionalOwners` | INPUT NEEDED | Traditional Owners: named only with their consent | corporate |
| `heroPhoto` | INPUT NEEDED | Hero photograph at Calgoa: landscape, natural light, field activity if possible. Commissioned only (no stock imagery); caption and date required. | corporate |
| `settingMap` | INPUT NEEDED | Fig. 1 regional setting map from tenement GIS (Q-31) | technical |
| `sectionFigure` | INPUT NEEDED | Fig. 2 cross-section approved by the competent person (Q-33) | technical |
| `cpStatement` | INPUT NEEDED | Competent person statement for Calgoa: name, qualifications, membership, relationship to Auburn and consent wording (Q-30) | technical |

## Project records: Calgoa

Appears on: `/projects/calgoa`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `workItems[0].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[0].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[0].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[1].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[1].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[1].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |

## Project: Victoria River Downs

Appears on: `/projects/victoria-river-downs`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `holding` | INPUT NEEDED | Whether the project is still held (docs/OPEN-QUESTIONS.md Q-20) | corporate |
| `state` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `commodities` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `stage` | INPUT NEEDED | Current exploration stage | corporate |
| `areaKm2` | INPUT NEEDED | Area in km² from the tenement schedule | corporate |
| `ownership` | INPUT NEEDED | Holder, ownership percentage and any JV terms | corporate |
| `heroThesis` | INPUT NEEDED | Hero thesis: one line, no digits, 120 characters or fewer | corporate |
| `geologySummary` | INPUT NEEDED | Geological setting, 120 words or fewer, CP-approved | technical |
| `statements[0]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[1]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[2]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[3]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[4]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `tenements` | INPUT NEEDED | Tenement numbers (e.g. EPM numbers) from the tenement schedule (Q-31) | corporate |
| `asAt` | INPUT NEEDED | Page as-at date, set when the project facts are approved | corporate |
| `setting.neighbouringDeposits` | INPUT NEEDED | Neighbouring deposits, each with a source | technical |
| `setting.nearestTown` | INPUT NEEDED | Nearest town and distance | corporate |
| `setting.access` | INPUT NEEDED | Access: roads, seasonal access | corporate |
| `setting.infrastructure` | INPUT NEEDED | Infrastructure: power, port, rail, water | corporate |
| `setting.traditionalOwners` | INPUT NEEDED | Traditional Owners: named only with their consent | corporate |
| `heroPhoto` | INPUT NEEDED | Hero photograph at Victoria River Downs: landscape, natural light, field activity if possible. Commissioned only (no stock imagery); caption and date required. | corporate |
| `settingMap` | INPUT NEEDED | Fig. 1 regional setting map from tenement GIS (Q-31) | technical |
| `sectionFigure` | INPUT NEEDED | Fig. 2 cross-section approved by the competent person (Q-33) | technical |
| `cpStatement` | INPUT NEEDED | Competent person statement for Victoria River Downs: name, qualifications, membership, relationship to Auburn and consent wording (Q-30) | technical |

## Project records: Victoria River Downs

Appears on: `/projects/victoria-river-downs`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `workItems[0].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[0].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[0].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[1].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[1].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[1].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[2].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[2].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[2].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[3].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[3].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[3].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[4].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[4].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[4].operator` | to verify | confirm or correct the old-site value; source + as-at | technical |

## Project: Tanumbirini

Appears on: `/projects/tanumbirini`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `holding` | INPUT NEEDED | Current status: old portfolio figure shows it moving to "Pentecost Resources" for a separate IPO | corporate |
| `state` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `commodities` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `stage` | INPUT NEEDED | Current exploration stage | corporate |
| `areaKm2` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `ownership` | INPUT NEEDED | Holder, ownership percentage and any JV terms | corporate |
| `heroThesis` | INPUT NEEDED | Hero thesis: one line, no digits, 120 characters or fewer | corporate |
| `geologySummary` | INPUT NEEDED | Geological setting, 120 words or fewer, CP-approved | technical |
| `statements[0]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[1]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[2]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[3]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[4]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[5]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `tenements` | INPUT NEEDED | Tenement numbers (e.g. EPM numbers) from the tenement schedule (Q-31) | corporate |
| `asAt` | INPUT NEEDED | Page as-at date, set when the project facts are approved | corporate |
| `setting.neighbouringDeposits` | INPUT NEEDED | Neighbouring deposits, each with a source | technical |
| `setting.nearestTown` | INPUT NEEDED | Nearest town and distance | corporate |
| `setting.access` | INPUT NEEDED | Access: roads, seasonal access | corporate |
| `setting.infrastructure` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `setting.traditionalOwners` | INPUT NEEDED | Traditional Owners: named only with their consent | corporate |
| `heroPhoto` | INPUT NEEDED | Hero photograph at Tanumbirini: landscape, natural light, field activity if possible. Commissioned only (no stock imagery); caption and date required. | corporate |
| `settingMap` | INPUT NEEDED | Fig. 1 regional setting map from tenement GIS (Q-31) | technical |
| `sectionFigure` | INPUT NEEDED | Fig. 2 cross-section approved by the competent person (Q-33) | technical |
| `cpStatement` | INPUT NEEDED | Competent person statement for Tanumbirini: name, qualifications, membership, relationship to Auburn and consent wording (Q-30) | technical |

## Project records: Tanumbirini

Appears on: `/projects/tanumbirini`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `workItems[0].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[0].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[0].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[1].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[1].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[1].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[2].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[2].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[2].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[3].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[3].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[3].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |
| `workItems[4].quantity` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `workItems[4].year` | INPUT NEEDED | Year(s) of the work | technical |
| `workItems[4].operator` | INPUT NEEDED | Operator: Auburn or historic | technical |

## Project: Hawkwood

Appears on: `/projects/hawkwood`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `holding` | INPUT NEEDED | Whether the project is still held (docs/OPEN-QUESTIONS.md Q-20) | corporate |
| `state` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `commodities` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `stage` | INPUT NEEDED | Current exploration stage | corporate |
| `areaKm2` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `ownership` | INPUT NEEDED | Holder, ownership percentage and any JV terms | corporate |
| `heroThesis` | INPUT NEEDED | Hero thesis: one line, no digits, 120 characters or fewer | corporate |
| `geologySummary` | INPUT NEEDED | Geological setting, 120 words or fewer, CP-approved | technical |
| `statements[0]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[1]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[2]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[3]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `statements[4]` | to verify | confirm or correct the old-site value; source + as-at | technical |
| `tenements` | INPUT NEEDED | Tenement numbers (e.g. EPM numbers) from the tenement schedule (Q-31) | corporate |
| `asAt` | INPUT NEEDED | Page as-at date, set when the project facts are approved | corporate |
| `setting.neighbouringDeposits` | INPUT NEEDED | Neighbouring deposits, each with a source | technical |
| `setting.nearestTown` | INPUT NEEDED | Nearest town and distance | corporate |
| `setting.access` | INPUT NEEDED | Access: roads, seasonal access | corporate |
| `setting.infrastructure` | INPUT NEEDED | Infrastructure: power, port, rail, water | corporate |
| `setting.traditionalOwners` | INPUT NEEDED | Traditional Owners: named only with their consent | corporate |
| `heroPhoto` | INPUT NEEDED | Hero photograph at Hawkwood: landscape, natural light, field activity if possible. Commissioned only (no stock imagery); caption and date required. | corporate |
| `settingMap` | INPUT NEEDED | Fig. 1 regional setting map from tenement GIS (Q-31) | technical |
| `sectionFigure` | INPUT NEEDED | Fig. 2 cross-section approved by the competent person (Q-33) | technical |
| `cpStatement` | INPUT NEEDED | Competent person statement for Hawkwood: name, qualifications, membership, relationship to Auburn and consent wording (Q-30) | technical |

## Person: Nicholas Mather

Appears on: `/company/leadership`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `role` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `bio` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `qualifications` | INPUT NEEDED | Qualifications | corporate |
| `portrait` | INPUT NEEDED | New portrait in the consistent house style | corporate |

## Person: Brian Moller

Appears on: `/company/leadership`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `role` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `bio` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `qualifications` | INPUT NEEDED | Qualifications | corporate |
| `portrait` | INPUT NEEDED | New portrait in the consistent house style | corporate |

## Person: Peter Wright

Appears on: `/company/leadership`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `role` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `bio` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `qualifications` | INPUT NEEDED | Qualifications | corporate |
| `portrait` | INPUT NEEDED | New portrait in the consistent house style | corporate |

## Person: John Bierling

Appears on: `/company/leadership`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `role` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `bio` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `qualifications` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `portrait` | INPUT NEEDED | New portrait in the consistent house style | corporate |

## Person: Geoff Walker

Appears on: `/company/leadership`.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `role` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `bio` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `qualifications` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `portrait` | INPUT NEEDED | New portrait in the consistent house style | corporate |

## Document: Annual Report

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `file` | INPUT NEEDED | Re-hosted PDF (old site file to be migrated) | corporate |

## Document: Notice of AGM and Explanatory Memorandum

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `file` | INPUT NEEDED | Re-hosted PDF (old site file to be migrated) | corporate |

## Document: Earn-in and JV Agreement with Chase Mining Limited

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `file` | INPUT NEEDED | Re-hosted PDF (old site file to be migrated) | corporate |

## Document: Agreement completion for acquisition of Ripple Resources Pty Ltd

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `file` | INPUT NEEDED | Re-hosted PDF (old site file to be migrated) | corporate |

## Document: Auburn agreement for acquisition of Ripple Resources

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `file` | INPUT NEEDED | Re-hosted PDF (old site file to be migrated) | corporate |

## Document: DGR Global Quarterly Activities Report

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | to verify | confirm or correct the old-site value; source + as-at | corporate |
| `file` | INPUT NEEDED | Re-hosted PDF (old site file to be migrated) | corporate |

## Document: Corporate Presentation

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Exact release date (old site shows Feb 2022) | corporate |
| `file` | INPUT NEEDED | Re-hosted PDF (old site file to be migrated) | corporate |

## Document: Appendix 4G and Corporate Governance Statement

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Board Charter

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Audit & Risk Management Committee Charter

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Remuneration Committee Charter

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Code of Conduct

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Anti-Bribery and Corruption Policy

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Diversity Policy

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Privacy Policy

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Assessing the Independence of Directors Policy

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Continuous Disclosure Policy

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Related Party Policy

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Whistleblower Policy

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Share Trading Policy

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |

## Document: Constitution

Appears on: investor registers, `/investors/governance`, announcement page.

| Field | Now | Needed | Approval |
| --- | --- | --- | --- |
| `releaseAt` | INPUT NEEDED | Adoption or last-review date | corporate |
| `file` | INPUT NEEDED | Current file: listed on the old site but never linked | corporate |
