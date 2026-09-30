/**
 * Launch-readiness report (D-019, D-026; docs/LAUNCH-READINESS.md). Pure functions over content records: what a
 * production build hides and why, what is approved and by whom, and which reviews are overdue. Visibility comes from
 * `isRenderable` only (CLAUDE.md §4.4); nothing here changes what renders.
 */
import { collectSlots, slotStatus, type FoundSlot } from './content/audit';
import type { ContentAdapter, LegalPageKey, PageKey } from './content';
import {
  isRenderable,
  isReviewOverdue,
  reviewByDate,
  type ContentStatus,
  type IsoDate,
} from './facts';

/** Fixed pages and their URLs (docs/SITEMAP.md §1). A `Record` so every page key must be listed. */
export const PAGE_ROUTES: Readonly<Record<PageKey, string>> = {
  company: '/company',
  leadership: '/company/leadership',
  howWeExplore: '/projects/how-we-explore',
  investors: '/investors',
  announcements: '/investors/announcements',
  reports: '/investors/reports',
  presentations: '/investors/presentations',
  shareholders: '/investors/shareholders',
  governance: '/investors/governance',
  alerts: '/investors/alerts',
  sustainability: '/sustainability',
  community: '/sustainability/community',
  environmentSafety: '/sustainability/environment-safety',
  news: '/news',
  media: '/news/media',
  contact: '/contact',
};

export const LEGAL_ROUTES: Readonly<Record<LegalPageKey, string>> = {
  disclaimer: '/disclaimer',
  privacy: '/privacy',
  terms: '/terms',
};

export interface HiddenSlot {
  readonly path: string;
  /** Why production does not render it: its status, or the INPUT NEEDED brief. */
  readonly reason: string;
}

export interface ApprovedSlot {
  readonly path: string;
  readonly approvedBy?: string;
  readonly approvedAt?: string;
}

export interface OverdueSlot {
  readonly path: string;
  readonly reviewBy: IsoDate;
}

export interface ReadinessGroup {
  /** e.g. `page:company`, `project:nicholson`. */
  readonly id: string;
  readonly label: string;
  /** The page this record feeds, when it has one of its own. */
  readonly route?: string;
  /** Record-level status (projects, documents, articles), when the record has one. */
  readonly recordStatus?: ContentStatus;
  readonly slots: number;
  /** Slots a production build renders. */
  readonly renderedInProduction: number;
  readonly hidden: readonly HiddenSlot[];
  readonly approved: readonly ApprovedSlot[];
  readonly overdue: readonly OverdueSlot[];
}

export interface ReadinessReport {
  readonly contentSource: string;
  readonly generatedOn: IsoDate;
  readonly groups: readonly ReadinessGroup[];
}

function hiddenReason(found: FoundSlot): string {
  const { slot } = found;
  if (slot.kind === 'inputNeeded') return `INPUT NEEDED: ${slot.brief}`;
  return `status ${slotStatus(slot)}`;
}

export function readinessGroup(
  id: string,
  label: string,
  record: unknown,
  today: IsoDate,
  extra: { readonly route?: string; readonly recordStatus?: ContentStatus } = {},
): ReadinessGroup {
  const found = collectSlots(record);
  const hidden: HiddenSlot[] = [];
  const approved: ApprovedSlot[] = [];
  const overdue: OverdueSlot[] = [];
  let renderedInProduction = 0;
  for (const item of found) {
    const { slot, path } = item;
    if (isRenderable(slot, 'production')) renderedInProduction += 1;
    else hidden.push({ path, reason: hiddenReason(item) });
    if (slot.kind === 'fact') {
      if (slot.meta.status === 'approved') {
        approved.push({
          path,
          ...(slot.meta.approvedBy ? { approvedBy: slot.meta.approvedBy.personId } : {}),
          ...(slot.meta.approvedAt ? { approvedAt: slot.meta.approvedAt } : {}),
        });
      }
      if (isReviewOverdue(slot.meta, today))
        overdue.push({ path, reviewBy: reviewByDate(slot.meta) });
    } else if (slot.kind === 'interpretation' && slot.status === 'approved') {
      approved.push({ path, ...(slot.reviewedBy ? { approvedBy: slot.reviewedBy.personId } : {}) });
    } else if (slot.kind === 'narrative' && slot.status === 'approved') {
      approved.push({ path });
    }
  }
  return {
    id,
    label,
    ...extra,
    slots: found.length,
    renderedInProduction,
    hidden,
    approved,
    overdue,
  };
}

/** Walks every record the adapter serves. Internal source records are skipped (never public, D-025). */
export async function buildReadinessReport(
  content: ContentAdapter,
  today: IsoDate,
): Promise<ReadinessReport> {
  const groups: ReadinessGroup[] = [];
  const add = (...args: Parameters<typeof readinessGroup>) => groups.push(readinessGroup(...args));

  add(
    'siteSettings',
    'Site settings (header, footer, contact details)',
    await content.getSiteSettings(),
    today,
  );
  add('homePage', 'Home page', await content.getHomePage(), today, { route: '/' });
  add('portfolioPage', 'Projects portfolio page', await content.getPortfolioPage(), today, {
    route: '/projects',
  });
  for (const [key, route] of Object.entries(PAGE_ROUTES) as [PageKey, string][]) {
    add(`page:${key}`, `Page copy: ${route}`, await content.getPage(key), today, { route });
  }
  for (const [key, route] of Object.entries(LEGAL_ROUTES) as [LegalPageKey, string][]) {
    add(`legal:${key}`, `Legal page: ${route}`, await content.getLegalPage(key), today, { route });
  }
  for (const project of await content.getProjects()) {
    const route = `/projects/${project.slug}`;
    add(`project:${project.slug}`, `Project: ${project.name}`, project, today, { route });
    const related = {
      prospects: await content.getProspects(project.id),
      resourceEstimates: await content.getResourceEstimates(project.id),
      results: await content.getResults(project.id),
      milestones: await content.getMilestones(project.id),
      workItems: await content.getWorkItems(project.id),
    };
    add(`project:${project.slug}:records`, `Project records: ${project.name}`, related, today);
  }
  for (const person of await content.getPeople()) {
    add(`person:${person.id}`, `Person: ${person.name}`, person, today);
  }
  for (const document of await content.getDocuments()) {
    if (document.internal) continue;
    add(`document:${document.slug}`, `Document: ${document.title}`, document, today, {
      recordStatus: document.status,
    });
  }
  for (const article of await content.getArticles()) {
    add(`article:${article.slug}`, `Article: ${article.title}`, article, today, {
      recordStatus: article.status,
    });
  }
  return { contentSource: content.name, generatedOn: today, groups };
}

// ── Report text ─────────────────────────────────────────────────────────────────────────────────

export interface BuildReadiness extends ReadinessReport {
  /** Page routes of the build. */
  readonly routes: readonly string[];
  /** Redirects whose target is not a page of the build. */
  readonly missingRedirectTargets: readonly { readonly from: string; readonly to: string }[];
}

const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** Markdown for one build (the production build is the one that decides launch readiness). */
export function renderReadinessMarkdown(build: BuildReadiness, buildName: string): string {
  const { groups } = build;
  const total = groups.reduce((sum, g) => sum + g.slots, 0);
  const rendered = groups.reduce((sum, g) => sum + g.renderedInProduction, 0);
  const approved = groups.flatMap((g) => g.approved.map((a) => ({ group: g, ...a })));
  const overdue = groups.flatMap((g) => g.overdue.map((o) => ({ group: g, ...o })));
  const routes = new Set(build.routes);
  const emptyPages = groups.filter(
    (g) => g.route && routes.has(g.route) && g.renderedInProduction === 0,
  );

  const lines = [
    `## Build \`${buildName}\` (content source: ${build.contentSource}, generated ${build.generatedOn})`,
    '',
    `- Content slots: **${total}**; rendered in production: **${rendered}**; approved: **${approved.length}**;` +
      ` review overdue: **${overdue.length}**.`,
    `- Pages in this build: ${build.routes.length}.`,
    '',
    '### Published pages with no approved content of their own (D-019: not launch-ready)',
    '',
    ...(emptyPages.length === 0
      ? ['None.']
      : emptyPages.map(
          (g) =>
            `- \`${g.route}\` — ${cell(g.label)}: ${g.slots} ${g.slots === 1 ? 'slot' : 'slots'}, none approved`,
        )),
    '',
    '### Redirect targets not published in this build (docs/REDIRECTS.md)',
    '',
    ...(build.missingRedirectTargets.length === 0
      ? ['None.']
      : build.missingRedirectTargets.map((r) => `- \`${r.from}\` → \`${r.to}\``)),
    '',
    '### Review overdue (D-026: still rendered if approved; re-check the source)',
    '',
    ...(overdue.length === 0
      ? ['None.']
      : [
          '| Record | Field | Review by |',
          '| --- | --- | --- |',
          ...overdue.map((o) => `| ${cell(o.group.label)} | \`${o.path}\` | ${o.reviewBy} |`),
        ]),
    '',
    '### Approved content and who approved it (D-027 launch-control audit)',
    '',
    ...(approved.length === 0
      ? ['None: no content is approved yet.']
      : [
          '| Record | Field | Approved by | Approved at |',
          '| --- | --- | --- | --- |',
          ...approved.map(
            (a) =>
              `| ${cell(a.group.label)} | \`${a.path}\` | ${a.approvedBy ?? '—'} | ${a.approvedAt ?? '—'} |`,
          ),
        ]),
    '',
    '### Hidden in production, by record',
    '',
  ];
  for (const group of groups) {
    if (group.hidden.length === 0) continue;
    const status = group.recordStatus ? ` · record status ${group.recordStatus}` : '';
    lines.push(
      `#### ${cell(group.label)}${group.route ? ` (\`${group.route}\`)` : ''}${status}`,
      '',
      `${group.hidden.length} of ${group.slots} slots hidden.`,
      '',
      '| Field | Reason |',
      '| --- | --- |',
      ...group.hidden.map((h) => `| \`${h.path || '(record)'}\` | ${cell(h.reason)} |`),
      '',
    );
  }
  return `${lines.join('\n').trimEnd()}\n`;
}
