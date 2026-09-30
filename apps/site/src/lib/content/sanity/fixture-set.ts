/** The typed fixtures gathered for export (tests and the snapshot script only). */
import { articles } from '../fixtures/data/articles';
import { documents } from '../fixtures/data/documents';
import { FIGURE_BRIEFS } from '../fixtures/data/figures';
import { homePage } from '../fixtures/data/home-page';
import { legalPages } from '../fixtures/data/legal-pages';
import { pages } from '../fixtures/data/pages';
import { people } from '../fixtures/data/people';
import { portfolioPage } from '../fixtures/data/portfolio-page';
import { projects } from '../fixtures/data/projects';
import { prospects } from '../fixtures/data/prospects';
import { siteSettings } from '../fixtures/data/site-settings';
import { milestones, resourceEstimates, results } from '../fixtures/data/technical';
import { workItems } from '../fixtures/data/work-items';
import type { FixtureSet } from './export';

export const fixtureSet: FixtureSet = {
  siteSettings,
  people,
  projects,
  documents,
  workItems,
  articles,
  homePage,
  portfolioPage,
  prospects,
  resourceEstimates,
  results,
  milestones,
  pages,
  legalPages,
  figureBriefs: FIGURE_BRIEFS,
};
