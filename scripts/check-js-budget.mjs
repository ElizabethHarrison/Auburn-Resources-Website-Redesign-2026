#!/usr/bin/env node
/**
 * JavaScript budget (CLAUDE.md §8; docs/DECISIONS.md D-006): JS loaded on page load must stay under
 * 30 KB compressed on every page. Counts external scripts and modulepreloads referenced by each HTML
 * file plus inline scripts (JSON-LD excluded). Lazily imported chunks (e.g. MapLibre) are not referenced
 * by the HTML and so are budgeted separately.
 *
 * Usage: node scripts/check-js-budget.mjs <dist-dir> [limit-kb]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const [dir, limitArg] = process.argv.slice(2);
if (!dir) {
  console.error('Usage: node scripts/check-js-budget.mjs <dist-dir> [limit-kb]');
  process.exit(2);
}
const limit = Number(limitArg ?? 30) * 1024;

const walk = (d) =>
  readdirSync(d).flatMap((n) =>
    statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)],
  );
const gz = (buffer) => gzipSync(buffer, { level: 9 }).length;

let failed = false;
for (const file of walk(dir).filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  let bytes = 0;
  for (const [, src] of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g))
    bytes += gz(readFileSync(join(dir, src)));
  for (const [, href] of html.matchAll(/<link\b[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g))
    bytes += gz(readFileSync(join(dir, href)));
  for (const [tag, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!tag.includes('application/ld+json') && !/\bsrc=/.test(tag)) bytes += gz(Buffer.from(body));
  }
  const over = bytes > limit;
  failed ||= over;
  console.log(
    `${over ? 'FAIL' : 'ok  '} ${(bytes / 1024).toFixed(1).padStart(6)} KB  ${file.slice(dir.length)}`,
  );
}
console.log(`Limit: ${limit / 1024} KB compressed JS on page load.`);
process.exit(failed ? 1 : 0);
