/**
 * Home page copy (docs/WEBSITE-STRATEGY.md §2 and §5). The headline, positioning line and thesis are
 * the approved *working* wording; the strategy says final wording follows fact verification, so they
 * are `toVerify` and appear only in preview until approved. Figures are the indicative mockup graphics
 * (./figures.ts, preview only); the sustainability sentence does not exist yet.
 */
import { inputNeeded } from '../../../facts';
import type { HomePageContent } from '../../types';
import { draftNarrative, sourcedStatement, websiteStrategySource } from '../helpers';
import { crossSection, portfolioMap } from './figures';

export const homePage: HomePageContent = {
  heroHeading: draftNarrative("Exploring the ground beside Australia's great base-metal deposits."),
  heroIntro: draftNarrative(
    "Auburn Resources is exploring for large zinc, copper and gold deposits in under-explored ground beside some of Australia's richest base-metal provinces.",
  ),
  portfolioMap,
  whyHeading: draftNarrative('Under-explored because the answer is under cover.'),
  whyText: sourcedStatement(
    'The best rocks are under cover. Prospective host sequences sit beneath younger sediments, which is why the ground is under-explored and why Auburn uses geophysics and geochemistry to see through it.',
    websiteStrategySource,
    'Core story from docs/WEBSITE-STRATEGY.md §2. Geological claim: needs competent-person review.',
  ),
  crossSection,
  sustainabilityLine: inputNeeded(
    'One specific, verifiable sentence on how Auburn works on Country and with landholders',
  ),
};
