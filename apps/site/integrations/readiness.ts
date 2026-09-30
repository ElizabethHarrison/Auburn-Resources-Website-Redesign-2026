import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { checkRedirects, parseRedirects, routesFromHtmlFiles } from '../src/lib/redirects';
import { renderReadinessMarkdown, type BuildReadiness } from '../src/lib/readiness';

const REPORT = '_readiness.json';

/**
 * Builds the launch-readiness data (`src/readiness/endpoint.ts`) with every build, then moves it out of the output
 * directory into `apps/site/reports/<outDir>.readiness.{json,md}`, with the build's page list and the redirect
 * targets it lacks, so it is never deployed (docs/LAUNCH-READINESS.md). `pnpm readiness` turns the files into the report.
 */
export function readiness(): AstroIntegration {
  let siteRoot: URL;
  return {
    name: 'auburn:readiness',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        injectRoute({ pattern: '/_readiness.json', entrypoint: './src/readiness/endpoint.ts' });
      },
      'astro:config:done': ({ config }) => {
        siteRoot = config.root;
      },
      'astro:build:done': async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const source = new URL(REPORT, dir);
        const data = JSON.parse(await readFile(source, 'utf8')) as Omit<
          BuildReadiness,
          'routes' | 'missingRedirectTargets'
        >;
        const routes = [...routesFromHtmlFiles(await readdir(outDir, { recursive: true }))].sort();
        const csv = await readFile(new URL('../../redirects.csv', siteRoot), 'utf8');
        const { missingTargets } = checkRedirects(parseRedirects(csv).redirects, new Set(routes));
        const reports = new URL('reports/', siteRoot);
        await mkdir(reports, { recursive: true });
        const name = basename(outDir);
        const build: BuildReadiness = {
          ...data,
          routes,
          missingRedirectTargets: missingTargets.map(({ from, to }) => ({ from, to })),
        };
        const target = new URL(`${name}.readiness.json`, reports);
        await writeFile(target, `${JSON.stringify(build, null, 2)}\n`);
        await writeFile(
          new URL(`${name}.readiness.md`, reports),
          renderReadinessMarkdown(build, name),
        );
        await rm(source);
        logger.info(`readiness data → ${fileURLToPath(target)} (not deployed)`);
      },
    },
  };
}
