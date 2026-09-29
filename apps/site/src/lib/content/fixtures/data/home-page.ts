/**
 * Home page copy (docs/WEBSITE-STRATEGY.md §2 and §5). The headline, positioning line and thesis are
 * the approved *working* wording; the strategy says final wording follows fact verification, so they
 * are `toVerify` and appear only in preview until approved. Figures and the sustainability sentence
 * do not exist yet.
 */
import { inputNeeded } from '../../../facts';
import type { HomePageContent } from '../../types';
import { draftNarrative, sourcedStatement, websiteStrategySource } from '../helpers';

export const homePage: HomePageContent = {
  heroHeading: draftNarrative("Exploring the ground beside Australia's great base-metal deposits."),
  heroIntro: draftNarrative(
    "Auburn Resources is exploring for large zinc, copper and gold deposits in under-explored ground beside some of Australia's richest base-metal provinces.",
  ),
  portfolioMap: inputNeeded(
    'Fig. 1 portfolio map drawn from tenement GIS (Q-31). Mockup geometry is indicative only and must not ship.',
  ),
  whyHeading: draftNarrative('Under-explored because the answer is under cover.'),
  whyText: sourcedStatement(
    'The best rocks are under cover. Prospective host sequences sit beneath younger sediments, which is why the ground is under-explored and why Auburn uses geophysics and geochemistry to see through it.',
    websiteStrategySource,
    'Core story from docs/WEBSITE-STRATEGY.md §2. Geological claim: needs competent-person review.',
  ),
  crossSection: inputNeeded(
    'Fig. 2 cross-section approved by the competent person (Q-33). The mockup section is schematic only.',
  ),
  sustainabilityLine: inputNeeded(
    'One specific, verifiable sentence on how Auburn works on Country and with landholders',
  ),
};
