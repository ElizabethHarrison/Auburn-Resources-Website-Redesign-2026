/**
 * Content integrity of the production build, scanned file by file (not just the pages a journey
 * visits): HOLD wording never appears, no preview-only output, no unapproved fixture facts, and no
 * mockup-derived (indicative) assets. Complements the CI grep guards.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { expect, test } from '@playwright/test';
import { projects } from '../../apps/site/src/lib/content/fixtures/data/projects';
import { isPreview, productionDist } from './helpers';

let DIST = '';

function filesIn(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesIn(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

test.describe('production build integrity', () => {
  // Playwright requires an object pattern for the fixtures argument, even when none is used.
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, testInfo) => {
    test.skip(
      isPreview(testInfo),
      'scans each production build (fixtures and Sanity snapshot) once',
    );
    DIST = productionDist(testInfo);
  });

  const files = () => filesIn(DIST);
  const textFiles = () => files().filter((file) => /\.(html|xml|txt|js|css|json)$/.test(file));

  test('contains no HOLD or banned wording', () => {
    const banned = [
      /40\s?Mt/i,
      /200\s?Mt/i,
      /25\s?Mt/i,
      /smoke/i,
      /aircore/i,
      /entitlement offer/i,
    ];
    for (const file of textFiles()) {
      const text = readFileSync(file, 'utf8');
      for (const pattern of banned) expect(text, relative(DIST, file)).not.toMatch(pattern);
    }
  });

  test('contains no preview-only output or unapproved statuses', () => {
    const markers = [/data-preview-only/, /INPUT NEEDED/i, /To verify/i, /Specimen/, /indicative/i];
    for (const file of textFiles()) {
      const text = readFileSync(file, 'utf8');
      for (const pattern of markers) expect(text, relative(DIST, file)).not.toMatch(pattern);
    }
  });

  test('contains no mockup-derived assets', () => {
    const assets = files().filter((file) =>
      /indicative|mockup|\.webp$/i.test(relative(DIST, file)),
    );
    expect(assets).toEqual([]);
  });

  test('publishes no dossier for an unapproved project, and the sitemap lists none', () => {
    for (const project of projects) {
      expect(files()).not.toContain(join(DIST, 'projects', `${project.slug}.html`));
    }
    const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
    for (const project of projects) {
      expect(sitemap).not.toContain(`/projects/${project.slug}<`);
    }
  });

  test('contains none of the unapproved fixture statements', () => {
    const statements = projects.flatMap((project) =>
      project.statements.flatMap((statement) =>
        statement.kind === 'interpretation' ? [statement.text] : [],
      ),
    );
    const html = files()
      .filter((file) => file.endsWith('.html'))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    for (const statement of statements) expect(html).not.toContain(statement);
  });
});
