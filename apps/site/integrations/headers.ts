import { writeFile } from 'node:fs/promises';
import type { AstroIntegration } from 'astro';
import { toCloudflareHeaders } from '@auburn/security-headers';

/**
 * Emits Cloudflare's `_headers` after every build: the security headers (D-030, docs/SECURITY-HEADERS.md) for every
 * static file, `noindex` on the whole preview build, and long-lived caching for fingerprinted `/_astro/*` assets.
 */
export function headers(options: { preview: boolean }): AstroIntegration {
  return {
    name: 'auburn:headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        await writeFile(new URL('_headers', dir), toCloudflareHeaders(options));
        logger.info(`_headers: security headers${options.preview ? ' + noindex (preview)' : ''}`);
      },
    },
  };
}
