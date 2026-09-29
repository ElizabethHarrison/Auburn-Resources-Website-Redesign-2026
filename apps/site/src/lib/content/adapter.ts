/**
 * The content adapter contract (docs/DECISIONS.md D-003).
 *
 * Pages load content only through an adapter. Components never fetch. Adapters return records with
 * every status intact; filtering for the build mode happens in `lib/facts.ts` at render time, so the
 * same data drives both preview and production builds.
 *
 * Implementations: `fixtures` (Phase 1). `sanity` is added in Phase 5 and must satisfy this same
 * interface so the page and component layers do not change.
 */
import type {
  Article,
  DocumentRecord,
  HomePageContent,
  PortfolioPageContent,
  Person,
  Project,
  SiteSettings,
  WorkItem,
} from './types';

export interface ContentAdapter {
  readonly name: string;
  getSiteSettings(): Promise<SiteSettings>;
  getPeople(): Promise<readonly Person[]>;
  getProjects(): Promise<readonly Project[]>;
  getProject(slug: string): Promise<Project | undefined>;
  /** All documents, including internal source records. Registers must exclude `internal` records. */
  getDocuments(): Promise<readonly DocumentRecord[]>;
  getDocument(id: string): Promise<DocumentRecord | undefined>;
  getWorkItems(projectId?: string): Promise<readonly WorkItem[]>;
  getArticles(): Promise<readonly Article[]>;
  getHomePage(): Promise<HomePageContent>;
  getPortfolioPage(): Promise<PortfolioPageContent>;
}
