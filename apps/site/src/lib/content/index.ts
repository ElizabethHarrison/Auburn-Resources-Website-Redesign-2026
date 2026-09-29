/**
 * Content entry point for pages. Selects the adapter from CONTENT_SOURCE (docs/ENV.md).
 *
 *   import { content } from '~/lib/content';
 *   const settings = await content.getSiteSettings();
 */
import { config } from '../config';
import type { ContentAdapter } from './adapter';
import { fixturesAdapter } from './fixtures';

const adapters: Record<typeof config.contentSource, ContentAdapter> = {
  fixtures: fixturesAdapter,
};

export const content: ContentAdapter = adapters[config.contentSource];

export type { ContentAdapter } from './adapter';
export type * from './types';
