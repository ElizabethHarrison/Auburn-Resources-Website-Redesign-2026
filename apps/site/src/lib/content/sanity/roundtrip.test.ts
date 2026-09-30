/**
 * Migration fidelity (D-024 §8–12): fixtures → Sanity documents (NDJSON) → the Sanity mapper must give back exactly
 * the fixtures — except indicative graphics, which never enter the CMS and come back as the INPUT NEEDED briefs that
 * production already uses. Also keeps the committed snapshot in step with the fixtures (drift check).
 *
 * Update the snapshot after changing fixtures: `pnpm --filter @auburn/site content:export`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inputNeeded } from '../../facts';
import { collectSlots, tallySlots } from '../audit';
import { findHeldBack } from '../held-back';
import { exportFixtures } from './export';
import { fixtureSet } from './fixture-set';
import { mapContent } from './map';
import { applyPerspective } from './perspective';
import { parseNdjson, toNdjson } from './snapshot';

const SNAPSHOT = new URL('./snapshot/fixtures.ndjson', import.meta.url);
const today = '2026-09-29' as const;

/** Replace indicative figures (listed in FIGURE_BRIEFS) by their production INPUT NEEDED brief. */
function withoutIndicative<T>(value: T): T {
  if (Array.isArray(value)) return value.map(withoutIndicative) as T;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (record.kind === 'figure') {
      const brief = (fixtureSet.figureBriefs as Record<string, string>)[record.id as string];
      if (!brief)
        throw new Error(`Fixture figure ${String(record.id)} is not a listed indicative graphic`);
      return inputNeeded(brief) as T;
    }
    return Object.fromEntries(
      Object.entries(record).map(([key, v]) => [key, withoutIndicative(v)]),
    ) as T;
  }
  return value;
}

const exported = exportFixtures(fixtureSet);
const ndjson = toNdjson(exported);

describe('fixture export', () => {
  it('matches the committed snapshot (run content:export after changing fixtures)', () => {
    if (process.env.UPDATE_SNAPSHOT) writeFileSync(SNAPSHOT, ndjson);
    expect(readFileSync(SNAPSHOT, 'utf8')).toBe(ndjson);
  });

  it('never exports approved content, held-back wording or indicative graphics', () => {
    expect(ndjson).not.toMatch(/"status":"approved"/);
    expect(findHeldBack(ndjson)).toBeUndefined();
    expect(ndjson).not.toMatch(/indicative/i);
    expect(ndjson).not.toMatch(/\.webp|\/_astro\//);
  });

  it('uses unique document IDs and no drafts', () => {
    const ids = exported.map((doc) => doc._id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.some((id) => id.startsWith('drafts.'))).toBe(false);
  });
});

describe('round trip: fixtures → NDJSON → Sanity mapper', () => {
  const docs = applyPerspective(parseNdjson(ndjson), 'preview');
  const { content, issues } = mapContent(docs, { mode: 'preview', today });

  it('reports no errors or fatal issues for the migrated fixtures', () => {
    expect(issues.of('fatal')).toEqual([]);
    expect(issues.of('error')).toEqual([]);
  });

  it('gives back exactly the fixtures (indicative graphics excepted)', () => {
    const expected = withoutIndicative(fixtureSet);
    expect(content.siteSettings).toEqual(expected.siteSettings);
    expect(content.people).toEqual(expected.people);
    expect(content.projects).toEqual(expected.projects);
    expect(content.documents).toEqual(expected.documents);
    expect(content.workItems).toEqual(expected.workItems);
    expect(content.articles).toEqual(expected.articles);
    expect(content.homePage).toEqual(expected.homePage);
    expect(content.portfolioPage).toEqual(expected.portfolioPage);
    expect(content.prospects).toEqual(expected.prospects);
    expect(content.resourceEstimates).toEqual(expected.resourceEstimates);
    expect(content.results).toEqual(expected.results);
    expect(content.milestones).toEqual(expected.milestones);
    expect(content.pages).toEqual(expected.pages);
    expect(content.legalPages).toEqual(expected.legalPages);
  });

  it('publishes nothing: every migrated slot stays unrenderable in production', () => {
    const production = mapContent(applyPerspective(parseNdjson(ndjson), 'production'), {
      mode: 'production',
      today,
    });
    expect(production.issues.of('error')).toEqual([]);
    expect(tallySlots(collectSlots(production.content), 'production').renderable).toBe(0);
  });
});
