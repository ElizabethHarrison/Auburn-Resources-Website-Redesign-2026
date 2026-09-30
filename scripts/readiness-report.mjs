#!/usr/bin/env node
/**
 * Launch-readiness report (D-019, D-026; docs/LAUNCH-READINESS.md). Combines the data the production and preview builds
 * leave in apps/site/reports/ into apps/site/reports/launch-readiness.md: the pages production withholds, then the
 * production build's own report. Run after `pnpm build && pnpm build:preview`. Never deployed; CI keeps it as an
 * artifact. It reports only: it never changes what renders and never fails the build for missing content.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'apps/site/reports';
const read = (name) => JSON.parse(readFileSync(`${DIR}/${name}.readiness.json`, 'utf8'));
const production = read('dist');
const preview = read('dist-preview');

/** Internal and utility routes that are not sitemap pages. */
const internal = (route) =>
  route === '/404' || route === '/_catalogue' || route.startsWith('/filtered/');
const published = new Set(production.routes);
const withheld = preview.routes.filter((route) => !internal(route) && !published.has(route));

const text = [
  '# Launch-readiness report',
  '',
  'Generated from the production and preview builds. **Launch-ready means every section below reads "None"** (except',
  'the approval audit, which lists what was approved and by whom). Nothing here changes what renders: production shows',
  'approved content only (CLAUDE.md §2, D-019).',
  '',
  '## Pages withheld from production (in preview, not in production)',
  '',
  ...(withheld.length === 0 ? ['None.'] : withheld.map((route) => `- \`${route}\``)),
  '',
  readFileSync(`${DIR}/dist.readiness.md`, 'utf8'),
].join('\n');

writeFileSync(`${DIR}/launch-readiness.md`, text);
console.log(
  `${DIR}/launch-readiness.md: ${withheld.length} pages withheld, ` +
    `${production.missingRedirectTargets.length} redirect targets unpublished.`,
);
