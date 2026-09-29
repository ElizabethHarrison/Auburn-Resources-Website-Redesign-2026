/**
 * Build configuration, validated by Astro's env schema (astro.config.ts, docs/ENV.md).
 *
 * This is the only module that reads `astro:env`. Library code takes the mode as a parameter so it
 * stays pure and unit-testable.
 */
import {
  CONTENT_MODE,
  CONTENT_SOURCE,
  SANITY_API_VERSION,
  SANITY_DATASET,
  SANITY_EXPORT_PATH,
  SANITY_PROJECT_ID,
} from 'astro:env/server';
import { getSecret } from 'astro:env/server';
import { clampMode, type ContentMode } from './facts';

export const config = {
  contentMode: CONTENT_MODE satisfies ContentMode,
  contentSource: CONTENT_SOURCE,
  isPreview: CONTENT_MODE === 'preview',
  sanity: {
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    exportPath: SANITY_EXPORT_PATH,
  },
} as const;

/** The read token is a secret: read on demand, only by the live Sanity loader, never exported as config. */
export function sanityReadToken(): string | undefined {
  return getSecret('SANITY_READ_TOKEN');
}

/**
 * Rendering mode for a component. Components take an optional `mode` prop and pass it here; a
 * production build always renders in production mode whatever the prop says (see `clampMode`).
 */
export function renderMode(requested?: ContentMode): ContentMode {
  return clampMode(config.contentMode, requested);
}
