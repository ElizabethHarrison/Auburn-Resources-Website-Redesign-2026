import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import {
  checkRedirects,
  parseRedirects,
  routesFromHtmlFiles,
  toCloudflareRedirects,
} from '../src/lib/redirects';

/** Paths a redirect may neither come from nor point to: internal and utility pages. */
const INTERNAL = ['/404', '/_catalogue', '/filtered/'];

/**
 * Emits Cloudflare's `_redirects` from `redirects.csv` after every build (docs/REDIRECTS.md) and checks it against the
 * pages the build has just produced. Structural errors (self-redirects, chains, loops, duplicates, a source that is a
 * page) fail every build. A target missing from the build fails a preview build (preview has every sitemap route); in
 * production it is a warning, because pages without approved content are withheld until approved (D-019).
 */
export function redirects(options: { preview: boolean }): AstroIntegration {
  let repoRoot: URL;
  return {
    name: 'auburn:redirects',
    hooks: {
      'astro:config:done': ({ config }) => {
        repoRoot = new URL('../../', config.root);
      },
      'astro:build:done': async ({ dir, logger }) => {
        const csv = await readFile(new URL('redirects.csv', repoRoot), 'utf8');
        const parsed = parseRedirects(csv);
        const files = await readdir(fileURLToPath(dir), { recursive: true });
        const routes = new Set(
          [...routesFromHtmlFiles(files)].filter(
            (route) => !INTERNAL.some((path) => route === path || route.startsWith(path)),
          ),
        );
        const check = checkRedirects(parsed.redirects, routes);
        const errors = [...parsed.errors, ...check.errors];
        const missing = check.missingTargets.map(
          (r) => `line ${r.line}: ${r.from} → ${r.to} (no such page in this build)`,
        );
        if (options.preview) errors.push(...missing);
        if (errors.length > 0) {
          throw new Error(`redirects.csv is invalid:\n  ${errors.join('\n  ')}`);
        }
        for (const message of missing) logger.warn(`redirect target not published yet: ${message}`);
        await writeFile(new URL('_redirects', dir), toCloudflareRedirects(parsed.redirects));
        logger.info(`_redirects: ${parsed.redirects.length} redirects`);
      },
    },
  };
}
