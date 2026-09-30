#!/usr/bin/env node
/**
 * Schema/typegen drift check (D-003, D-024): regenerate the Sanity types from the Studio schema and fail if they differ
 * from the committed file, which the site's mapper compiles against. Offline: needs no Sanity project.
 * On failure the regenerated file is left in place — review and commit it.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const FILE = 'apps/site/src/lib/content/sanity/sanity.types.ts';
const before = readFileSync(FILE, 'utf8');
execSync('pnpm --filter @auburn/studio typegen', { stdio: ['ignore', 'ignore', 'inherit'] });
const after = readFileSync(FILE, 'utf8');
if (before !== after) {
  console.error(
    `${FILE} is out of date with the Studio schema. Review the regenerated file and commit it.`,
  );
  process.exit(1);
}
console.log('Sanity types match the Studio schema.');
