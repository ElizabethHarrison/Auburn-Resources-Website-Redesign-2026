/**
 * Fixtures adapter: serves the typed sample data in ./data (docs/DECISIONS.md D-003).
 * Every seeded value is `toVerify` or INPUT NEEDED, so a production build renders none of it.
 */
import type { ContentAdapter } from '../adapter';
import { articles } from './data/articles';
import { documents } from './data/documents';
import { homePage } from './data/home-page';
import { portfolioPage } from './data/portfolio-page';
import { prospects } from './data/prospects';
import { milestones, resourceEstimates, results } from './data/technical';
import { people } from './data/people';
import { projects } from './data/projects';
import { siteSettings } from './data/site-settings';
import { workItems } from './data/work-items';

export const fixturesAdapter: ContentAdapter = {
  name: 'fixtures',
  getSiteSettings: async () => siteSettings,
  getPeople: async () => people,
  getProjects: async () => projects,
  getProject: async (slug) => projects.find((project) => project.slug === slug),
  getDocuments: async () => documents,
  getDocument: async (id) => documents.find((document) => document.id === id),
  getWorkItems: async (projectId) =>
    projectId === undefined ? workItems : workItems.filter((item) => item.projectId === projectId),
  getArticles: async () => articles,
  getHomePage: async () => homePage,
  getPortfolioPage: async () => portfolioPage,
  getProspects: async (projectId) => prospects.filter((item) => item.projectId === projectId),
  getResourceEstimates: async (projectId) =>
    resourceEstimates.filter((item) => item.projectId === projectId),
  getResults: async (projectId) => results.filter((item) => item.projectId === projectId),
  getMilestones: async (projectId) => milestones.filter((item) => item.projectId === projectId),
};
