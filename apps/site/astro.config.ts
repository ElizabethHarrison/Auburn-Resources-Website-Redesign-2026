import { defineConfig, envField } from 'astro/config';
import type { AstroIntegration } from 'astro';
import sitemap from '@astrojs/sitemap';
import { headers } from './integrations/headers';
import { readiness } from './integrations/readiness';
import { redirects } from './integrations/redirects';

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
// `/filtered/…`: prebuilt filter views served by the edge Worker at query-string URLs (D-023).
const SITEMAP_EXCLUDE = ['/_catalogue', '/404', '/filtered/'];

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
  // Content Security Policy (D-030, Proposed; docs/SECURITY-HEADERS.md): Astro writes a <meta> policy into every page
  // with the hash of each inline script and style it emits, so no 'unsafe-inline' or 'unsafe-eval' is needed.
  // Directives a <meta> policy cannot carry (frame-ancestors) and the other security headers are HTTP headers
  // (@auburn/security-headers).
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        // Approved figures and photos may come from the Sanity image CDN (D-024, D-028).
        "img-src 'self' https://cdn.sanity.io",
        "font-src 'self'",
        "connect-src 'none'",
        "form-action 'self'",
        "frame-src 'none'",
        "worker-src 'none'",
        "manifest-src 'self'",
        "base-uri 'none'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
      // Preview only: the design-system catalogue's colour swatches use style attributes. Production pages have none
      // (an e2e test checks), so production allows no inline style attributes.
      ...(isPreview
        ? {
            styleDirective: {
              resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' as const }],
            },
          }
        : {}),
    },
  },
  vite: {
    // Compile-time flag: preview-only code (e.g. indicative mockup figures) is removed from
    // production bundles by dead-code elimination, so its assets are never emitted.
    define: { __PREVIEW_BUILD__: JSON.stringify(isPreview) },
  },
  // Preview builds are noindex and disallowed in robots.txt, so they get no sitemap.
  // Every build emits `_redirects` from redirects.csv (docs/REDIRECTS.md) and `_headers` (docs/SECURITY-HEADERS.md), and
  // moves the launch-readiness data out of the output (docs/LAUNCH-READINESS.md).
  integrations: isPreview
    ? [catalogue, redirects({ preview: true }), headers({ preview: true }), readiness()]
    : [
        redirects({ preview: false }),
        headers({ preview: false }),
        readiness(),
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
        // fixtures: typed fixtures (default, deterministic). sanity: live CMS (needs credentials).
        // sanity-export: the Sanity mapping pipeline over an NDJSON snapshot, no credentials (D-024).
        values: ['fixtures', 'sanity', 'sanity-export'],
        default: 'fixtures',
      }),
      SANITY_PROJECT_ID: envField.string({ context: 'server', access: 'public', optional: true }),
      SANITY_DATASET: envField.string({ context: 'server', access: 'public', optional: true }),
      SANITY_API_VERSION: envField.string({
        context: 'server',
        access: 'public',
        default: '2026-09-29',
      }),
      // Build-time only; never sent to the browser. Required for CONTENT_SOURCE=sanity (private datasets).
      SANITY_READ_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      SANITY_EXPORT_PATH: envField.string({
        context: 'server',
        access: 'public',
        default: 'src/lib/content/sanity/snapshot/fixtures.ndjson',
      }),
    },
  },
});
