/**
 * Invariants for fixture data. These encode CLAUDE.md §2: nothing approved outside the CMS, every fact
 * sourced, HOLD content absent, narratives digit-free, and nothing renders in a production build.
 */
import { describe, expect, it } from 'vitest';
import { isIsoDate } from '../../dates';
import { NARRATIVE_LIMITS, validateNarrative } from '../../facts';
import { collectSlots, tallySlots } from '../audit';
import { fixturesAdapter } from './index';
import { articles } from './data/articles';
import { documents } from './data/documents';
import { homePage } from './data/home-page';
import { people } from './data/people';
import { projects } from './data/projects';
import { siteSettings } from './data/site-settings';
import { workItems } from './data/work-items';

const all = { siteSettings, people, projects, documents, workItems, homePage, articles };
const slots = collectSlots(all);
const documentIds = new Set(documents.map((document) => document.id));

describe('fixture provenance and status', () => {
  it('contains no approved content (approval happens only in the CMS)', () => {
    const approved = slots.filter(({ slot }) =>
      slot.kind === 'fact'
        ? slot.meta.status === 'approved'
        : 'status' in slot && slot.status === 'approved',
    );
    expect(approved.map(({ path }) => path)).toEqual([]);
    expect(documents.filter((document) => document.status === 'approved')).toEqual([]);
  });

  it('gives every fact and interpretation a source that resolves to a document record', () => {
    for (const { path, slot } of slots) {
      const refs =
        slot.kind === 'fact'
          ? [slot.meta.sourceDocument]
          : slot.kind === 'interpretation'
            ? slot.sources
            : [];
      for (const ref of refs) {
        expect(documentIds.has(ref.documentId), `${path} → ${ref.documentId}`).toBe(true);
      }
    }
  });

  it('uses valid ISO dates everywhere', () => {
    for (const { path, slot } of slots) {
      if (slot.kind === 'fact') {
        expect(isIsoDate(slot.meta.asAt), path).toBe(true);
        if (typeof slot.value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(slot.value)) {
          expect(isIsoDate(slot.value), path).toBe(true);
        }
      }
      if (slot.kind === 'interpretation') expect(isIsoDate(slot.asAt), path).toBe(true);
    }
  });

  it('gives every INPUT NEEDED a brief', () => {
    for (const { path, slot } of slots) {
      if (slot.kind === 'inputNeeded') expect(slot.brief.trim().length, path).toBeGreaterThan(0);
    }
  });
});

describe('held-back and banned content', () => {
  // docs/CONTENT-SOURCE.md HOLD / FIX / do-not-reuse items, and CLAUDE.md §2.4.
  const banned = [
    /40\s?Mt/i, // Nicholson exploration-target wording
    /200\s?Mt/i, // Calgoa exploration-target wording
    /25\s?Mt/i, // Calgoa oxide wording
    /smoke/i, // promotional line
    /aircore/i, // Hawkwood outdated work plan
    /entitlement offer/i, // 2021 Entitlement Offer (HOLD)
    /email@email\.com/i,
    /squarespace\.com/i,
    /pexels/i,
    /227\s?Mt/i, // unsourced third-party figures
    /13\.6\s?Mt/i,
    /77\.6\s?Mt/i,
  ];
  const serialized = JSON.stringify(all);

  it.each(banned.map((pattern) => [pattern.source, pattern] as const))(
    'excludes %s',
    (_, pattern) => {
      expect(serialized).not.toMatch(pattern);
    },
  );
});

describe('narrative rules', () => {
  it('keeps every narrative digit-free', () => {
    for (const { path, slot } of slots) {
      if (slot.kind === 'narrative') expect(validateNarrative(slot.text, 1000), path).toEqual([]);
    }
  });

  it('keeps project hero theses within the limit', () => {
    for (const project of projects) {
      if (project.heroThesis.kind === 'narrative') {
        expect(
          validateNarrative(project.heroThesis.text, NARRATIVE_LIMITS.projectHeroThesis),
        ).toEqual([]);
      }
    }
  });
});

describe('record integrity', () => {
  it('uses unique, lowercase, hyphenated slugs', () => {
    for (const list of [projects, documents]) {
      const slugs = list.map((record) => record.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('uses unique ids across all record types', () => {
    const ids = [...people, ...projects, ...documents, ...workItems].map((record) => record.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives projects unique sheet numbers within section 02', () => {
    const sheets = projects.map((project) => project.sheetNumber);
    expect(new Set(sheets).size).toBe(sheets.length);
    for (const sheet of sheets) expect(sheet).toMatch(/^02\.\d+$/);
  });

  it('links work items to existing projects', () => {
    const projectIds = new Set(projects.map((project) => project.id));
    for (const item of workItems) expect(projectIds.has(item.projectId), item.id).toBe(true);
  });

  it('keeps old-site paths as root-relative paths only', () => {
    for (const record of [...projects, ...documents]) {
      if (record.legacyPath !== undefined) expect(record.legacyPath).toMatch(/^\/[^/]/);
    }
  });
});

describe('rendering by mode', () => {
  it('renders nothing from fixtures in a production build', () => {
    expect(tallySlots(slots, 'production').renderable).toBe(0);
  });

  it('renders every non-superseded slot in a preview build', () => {
    const tally = tallySlots(slots, 'preview');
    expect(tally.renderable).toBe(tally.total - tally.byStatus.superseded);
  });
});

describe('fixtures adapter', () => {
  it('serves the fixture data', async () => {
    expect(await fixturesAdapter.getProjects()).toBe(projects);
    expect((await fixturesAdapter.getProject('nicholson'))?.name).toBe('Nicholson');
    expect(await fixturesAdapter.getProject('missing')).toBeUndefined();
    expect(await fixturesAdapter.getDocument('doc-2022-12-23-annual-report')).toBeDefined();
  });

  it('filters work items by project', async () => {
    const items = await fixturesAdapter.getWorkItems('project-calgoa');
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.projectId === 'project-calgoa')).toBe(true);
  });
});
