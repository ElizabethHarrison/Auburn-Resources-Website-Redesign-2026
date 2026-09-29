/**
 * The Sanity content adapter (D-024): implements the same `ContentAdapter` interface as the fixtures, so pages and
 * templates do not change. It loads raw documents once per build (from the live API or an NDJSON snapshot), applies
 * the build's perspective, maps them, and enforces the integrity rules:
 *
 * - fatal issues (held-back wording) fail the build in every mode;
 * - error issues (rejected approvals, incomplete provenance claiming approval) fail a production build — the
 *   content is already downgraded or hidden, and failing makes the problem visible before publishing;
 * - warnings (e.g. overdue reviews, D-026) are printed and never change what renders.
 */
import type { ContentMode, IsoDate } from '../../facts';
import type { ContentAdapter } from '../adapter';
import { ContentIntegrityError, formatIssue, type ContentIssue } from './issues';
import { mapContent, type MapOptions, type MappedContent } from './map';
import { applyPerspective, type RawDocument } from './perspective';

export interface SanityAdapterOptions {
  readonly name: string;
  /** All raw documents visible to this build (drafts included for preview). */
  readonly load: () => Promise<readonly RawDocument[]>;
  readonly mode: ContentMode;
  readonly today: IsoDate;
  readonly images?: MapOptions['images'];
  /** Where to report warnings (and preview-mode errors). */
  readonly report?: (issues: readonly ContentIssue[]) => void;
}

/** Map and check; throws `ContentIntegrityError` when the build must not proceed. */
export async function loadContent(options: SanityAdapterOptions): Promise<MappedContent> {
  const raw = applyPerspective(await options.load(), options.mode);
  const { content, issues } = mapContent(raw, options);
  const blocking = issues.issues.filter(
    (issue) =>
      issue.severity === 'fatal' || (issue.severity === 'error' && options.mode === 'production'),
  );
  if (blocking.length > 0) throw new ContentIntegrityError(blocking);
  const reported = issues.issues.filter((issue) => !blocking.includes(issue));
  if (reported.length > 0) (options.report ?? defaultReport)(reported);
  return content;
}

function defaultReport(issues: readonly ContentIssue[]): void {
  console.warn(
    `[content] ${issues.length} CMS content issue(s):\n${issues.map((issue) => `  ${formatIssue(issue)}`).join('\n')}`,
  );
}

export function createSanityAdapter(options: SanityAdapterOptions): ContentAdapter {
  let loaded: Promise<MappedContent> | undefined;
  const content = () => (loaded ??= loadContent(options));
  const byProject = <T extends { projectId: string }>(list: readonly T[], projectId: string) =>
    list.filter((item) => item.projectId === projectId);
  return {
    name: options.name,
    getSiteSettings: async () => (await content()).siteSettings,
    getPeople: async () => (await content()).people,
    getProjects: async () => (await content()).projects,
    getProject: async (slug) => (await content()).projects.find((project) => project.slug === slug),
    getDocuments: async () => (await content()).documents,
    getDocument: async (id) => (await content()).documents.find((document) => document.id === id),
    getWorkItems: async (projectId) => {
      const items = (await content()).workItems;
      return projectId === undefined ? items : byProject(items, projectId);
    },
    getArticles: async () => (await content()).articles,
    getHomePage: async () => (await content()).homePage,
    getPortfolioPage: async () => (await content()).portfolioPage,
    getProspects: async (projectId) => byProject((await content()).prospects, projectId),
    getResourceEstimates: async (projectId) =>
      byProject((await content()).resourceEstimates, projectId),
    getResults: async (projectId) => byProject((await content()).results, projectId),
    getMilestones: async (projectId) => byProject((await content()).milestones, projectId),
    getPage: async (key) => (await content()).pages[key],
    getLegalPage: async (key) => (await content()).legalPages[key],
  };
}
