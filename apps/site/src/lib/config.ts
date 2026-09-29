/**
 * Build configuration, validated by Astro's env schema (astro.config.ts, docs/ENV.md).
 *
 * This is the only module that reads `astro:env`. Library code takes the mode as a parameter so it
 * stays pure and unit-testable.
 */
import { CONTENT_MODE, CONTENT_SOURCE } from 'astro:env/server';
import { clampMode, type ContentMode } from './facts';

export const config = {
  contentMode: CONTENT_MODE satisfies ContentMode,
  contentSource: CONTENT_SOURCE,
  isPreview: CONTENT_MODE === 'preview',
} as const;

/**
 * Rendering mode for a component. Components take an optional `mode` prop and pass it here; a
 * production build always renders in production mode whatever the prop says (see `clampMode`).
 */
export function renderMode(requested?: ContentMode): ContentMode {
  return clampMode(config.contentMode, requested);
}
