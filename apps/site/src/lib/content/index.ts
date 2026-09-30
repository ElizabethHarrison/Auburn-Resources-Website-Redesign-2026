/**
 * Content entry point for pages. Selects the adapter from CONTENT_SOURCE (docs/ENV.md, D-024).
 *
 *   import { content } from '~/lib/content';
 *   const settings = await content.getSiteSettings();
 *
 * Every source satisfies the same `ContentAdapter`; pages and templates never know which one is in use.
 */
import { resolve } from 'node:path';
import { config, sanityReadToken } from '../config';
import { toBrisbaneDate } from '../dates';
import type { ContentAdapter } from './adapter';
import { fixturesAdapter } from './fixtures';
import { createSanityAdapter } from './sanity/adapter';
import { snapshotLoader } from './sanity/snapshot';

function sanityAdapter(): ContentAdapter {
  const { sanity, contentMode: mode } = config;
  const today = toBrisbaneDate(new Date());
  const images =
    sanity.projectId && sanity.dataset
      ? { projectId: sanity.projectId, dataset: sanity.dataset }
      : undefined;
  if (config.contentSource === 'sanity-export') {
    return createSanityAdapter({
      name: 'sanity-export',
      load: snapshotLoader(resolve(process.cwd(), sanity.exportPath)),
      mode,
      today,
      images,
    });
  }
  return createSanityAdapter({
    name: 'sanity',
    // Loaded lazily so fixture and snapshot builds never initialise the API client.
    load: async () => {
      const { liveLoader } = await import('./sanity/live');
      return liveLoader(
        {
          projectId: sanity.projectId ?? '',
          dataset: sanity.dataset ?? '',
          apiVersion: sanity.apiVersion,
          token: sanityReadToken() ?? '',
        },
        mode,
      )();
    },
    mode,
    today,
    images,
  });
}

export const content: ContentAdapter =
  config.contentSource === 'fixtures' ? fixturesAdapter : sanityAdapter();

export type { ContentAdapter } from './adapter';
export type * from './types';
