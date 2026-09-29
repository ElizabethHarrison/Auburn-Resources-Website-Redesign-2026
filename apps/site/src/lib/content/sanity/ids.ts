/** Fixed document IDs for singletons and keyed pages (the Studio structure uses the same IDs). No dots: dotted IDs are private paths. */
import type { LegalPageKey, PageKey } from '../types';

export const SINGLETON_IDS = {
  siteSettings: 'siteSettings',
  homePage: 'homePage',
  portfolioPage: 'portfolioPage',
} as const;

export const pageId = (key: PageKey): string => `page-${key}`;
export const legalPageId = (key: LegalPageKey): string => `legalPage-${key}`;
