/**
 * Portfolio page copy (docs/SITEMAP.md 02). No approved portfolio summary exists yet.
 */
import { inputNeeded } from '../../../facts';
import type { PortfolioPageContent } from '../../types';
import { portfolioMap } from './figures';

export const portfolioPage: PortfolioPageContent = {
  intro: inputNeeded(
    'One-paragraph portfolio summary: plain language, no figures (numbers belong in facts)',
  ),
  portfolioMap,
};
