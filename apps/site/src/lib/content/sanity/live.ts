/**
 * Live Sanity loader (`CONTENT_SOURCE=sanity`): build-time only, in Node. Nothing here runs in the browser and no
 * token reaches the client. Datasets are private (D-024 §7), so a read token is required in both modes.
 *
 * - production: `published` perspective — drafts are never requested;
 * - preview: `drafts` perspective (drafts over published).
 * The adapter applies the perspective again to whatever comes back (defence in depth).
 */
import { createClient } from '@sanity/client';
import type { ContentMode } from '../../facts';
import type { RawDocument } from './perspective';

export interface LiveConfig {
  readonly projectId: string;
  readonly dataset: string;
  readonly apiVersion: string;
  readonly token: string;
}

/** Every document type the adapter maps. Assets and system documents are not fetched. */
export const CONTENT_TYPES = [
  'siteSettings',
  'person',
  'documentRecord',
  'project',
  'prospect',
  'resourceEstimate',
  'result',
  'milestone',
  'workItem',
  'figure',
  'photo',
  'article',
  'homePage',
  'portfolioPage',
  'page',
  'legalPage',
] as const;

export const CONTENT_QUERY = '*[_type in $types]';

export function perspectiveFor(mode: ContentMode): 'published' | 'drafts' {
  return mode === 'production' ? 'published' : 'drafts';
}

export function liveLoader(config: LiveConfig, mode: ContentMode) {
  if (!config.projectId || !config.dataset || !config.apiVersion || !config.token) {
    throw new Error(
      'CONTENT_SOURCE=sanity needs SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION and SANITY_READ_TOKEN (docs/ENV.md).',
    );
  }
  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    token: config.token,
    useCdn: false,
    perspective: perspectiveFor(mode),
  });
  return () => client.fetch<RawDocument[]>(CONTENT_QUERY, { types: [...CONTENT_TYPES] });
}
