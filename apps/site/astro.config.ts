import { defineConfig, envField } from 'astro/config';
import type { AstroIntegration } from 'astro';
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
const SITEMAP_EXCLUDE = ['/_catalogue', '/404'];

/**
 * The design-system catalogue (/_catalogue) exists only in preview builds. It is injected here rather
 * than living in src/pages, so a production build never contains it.
 */
const catalogue: AstroIntegration = {
  name: 'auburn:catalogue',
  hooks: {
    'astro:config:setup': ({ injectRoute }) => {
      if (isPreview) {
        injectRoute({ pattern: '/_catalogue', entrypoint: './src/catalogue/CataloguePage.astro' });
      }
    },
  },
};

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  compressHTML: true,
  vite: {
    // Compile-time flag: preview-only code (e.g. indicative mockup figures) is removed from
    // production bundles by dead-code elimination, so its assets are never emitted.
    define: { __PREVIEW_BUILD__: JSON.stringify(isPreview) },
  },
  // Preview builds are noindex and disallowed in robots.txt, so they get no sitemap.
  integrations: isPreview
    ? [catalogue]
    : [
        sitemap({
          filter: (page) => {
            const { pathname } = new URL(page);
            return !SITEMAP_EXCLUDE.some((path) => pathname.startsWith(path));
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
