import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Astro configuration for auburnresources.com.au.
 *
 * - Static output only (docs/DECISIONS.md D-001).
 * - URLs have no trailing slash and no extension (docs/SITEMAP.md §1); `build.format: 'file'` emits
 *   `company.html`, which Cloudflare static assets serves at `/company`.
 * - CONTENT_MODE selects production (Approved facts only) or preview (all statuses + placeholders),
 *   see D-005. Environment variables are documented in docs/ENV.md.
 */

// SITE_URL is read from the process environment (not .env) because `site` is needed before Astro
// loads env files. The default is the production domain so canonical URLs are always absolute.
const SITE_URL = process.env.SITE_URL ?? 'https://auburnresources.com.au';
const isPreview = process.env.CONTENT_MODE === 'preview';

// Paths that must never appear in the XML sitemap (noindex, internal or utility pages).
// '/' is TEMPORARY: it is the noindex Phase 1 scaffold page. Remove it when the Home template replaces
// the scaffold in Phase 3.
const SITEMAP_EXCLUDE = ['/_catalogue', '/404'];
const SITEMAP_EXCLUDE_EXACT = ['/'];

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  compressHTML: true,
  // Preview builds are noindex and disallowed in robots.txt, so they get no sitemap.
  integrations: isPreview
    ? []
    : [
        sitemap({
          filter: (page) => {
            const { pathname } = new URL(page);
            return (
              !SITEMAP_EXCLUDE_EXACT.includes(pathname) &&
              !SITEMAP_EXCLUDE.some((path) => pathname.startsWith(path))
            );
          },
        }),
      ],
  env: {
    schema: {
      CONTENT_MODE: envField.enum({
        context: 'server',
        access: 'public',
        values: ['production', 'preview'],
        // Default to the safe mode: nothing unapproved can render unless preview is explicitly asked for.
        default: 'production',
      }),
      CONTENT_SOURCE: envField.enum({
        context: 'server',
        access: 'public',
        // 'sanity' is added in Phase 5 (docs/DECISIONS.md D-003).
        values: ['fixtures'],
        default: 'fixtures',
      }),
    },
  },
});
