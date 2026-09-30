import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fixturesAdapter } from './content/fixtures';
import type { Fact, Interpretation, IsoDate } from './facts';
import { inputNeeded } from './facts';
import {
  LEGAL_ROUTES,
  PAGE_ROUTES,
  buildReadinessReport,
  readinessGroup,
  renderReadinessMarkdown,
  type BuildReadiness,
} from './readiness';

const TODAY = '2026-09-30' as IsoDate;

// Test-only records: report tests need approved content, which fixtures never contain (CLAUDE.md §2.1).
function fact(
  status: Fact<string>['meta']['status'],
  extra: Partial<Fact<string>['meta']> = {},
): Fact<string> {
  return {
    kind: 'fact',
    value: 'value',
    meta: {
      sourceDocument: { documentId: 'doc-1' },
      asAt: '2026-01-01' as IsoDate,
      status,
      ...extra,
    },
  } as Fact<string>;
}

describe('readinessGroup', () => {
  const record = {
    approved: fact('approved', { approvedBy: { personId: 'cosec' }, approvedAt: '2026-09-01' }),
    toVerify: fact('toVerify'),
    stale: fact('approved', { approvedBy: { personId: 'cp' }, reviewBy: '2026-06-30' as IsoDate }),
    gap: inputNeeded('ACN for footer'),
    prose: {
      kind: 'interpretation',
      text: 'Reviewed prose.',
      sources: [{ documentId: 'doc-1' }],
      status: 'approved',
      asAt: '2026-01-01',
      reviewedBy: { personId: 'cp' },
    } as Interpretation,
  };
  const group = readinessGroup('test', 'Test record', record, TODAY, { route: '/test' });

  it('counts what production renders, using isRenderable', () => {
    expect(group.slots).toBe(5);
    expect(group.renderedInProduction).toBe(3);
  });

  it('gives the reason each hidden slot is hidden', () => {
    expect(group.hidden).toEqual([
      { path: 'toVerify', reason: 'status toVerify' },
      { path: 'gap', reason: 'INPUT NEEDED: ACN for footer' },
    ]);
  });

  it('lists approvals with approver and date (D-027 audit)', () => {
    expect(group.approved).toEqual([
      { path: 'approved', approvedBy: 'cosec', approvedAt: '2026-09-01' },
      { path: 'stale', approvedBy: 'cp' },
      { path: 'prose', approvedBy: 'cp' },
    ]);
  });

  it('reports overdue reviews without hiding them (D-026)', () => {
    expect(group.overdue).toEqual([{ path: 'stale', reviewBy: '2026-06-30' }]);
    expect(group.hidden.map((h) => h.path)).not.toContain('stale');
  });
});

describe('page routes', () => {
  it('map every page key to a real page of the site', () => {
    for (const route of [...Object.values(PAGE_ROUTES), ...Object.values(LEGAL_ROUTES)]) {
      expect(existsSync(new URL(`../pages${route}.astro`, import.meta.url)), route).toBe(true);
    }
  });
});

describe('buildReadinessReport over the fixtures', async () => {
  const report = await buildReadinessReport(fixturesAdapter, TODAY);
  const ids = report.groups.map((g) => g.id);

  it('covers every page, legal page, project and public document', async () => {
    for (const key of Object.keys(PAGE_ROUTES)) expect(ids).toContain(`page:${key}`);
    for (const key of Object.keys(LEGAL_ROUTES)) expect(ids).toContain(`legal:${key}`);
    for (const project of await fixturesAdapter.getProjects())
      expect(ids).toContain(`project:${project.slug}`);
    for (const document of await fixturesAdapter.getDocuments()) {
      expect(ids.includes(`document:${document.slug}`)).toBe(!document.internal);
    }
  });

  it('finds nothing approved and nothing rendered in production (fixtures are never approved)', () => {
    for (const group of report.groups) {
      expect(group.approved, group.id).toEqual([]);
      expect(group.renderedInProduction, group.id).toBe(0);
    }
  });
});

describe('renderReadinessMarkdown', () => {
  const base: BuildReadiness = {
    contentSource: 'fixtures',
    generatedOn: TODAY,
    groups: [
      readinessGroup('page:company', 'Page copy: /company', { gap: inputNeeded('Intro') }, TODAY, {
        route: '/company',
      }),
    ],
    routes: ['/', '/company'],
    missingRedirectTargets: [{ from: '/nicholson-project', to: '/projects/nicholson' }],
  };

  it('lists empty published pages, unpublished redirect targets and hidden slots', () => {
    const text = renderReadinessMarkdown(base, 'dist');
    expect(text).toContain('- `/company` — Page copy: /company: 1 slot, none approved');
    expect(text).toContain('- `/nicholson-project` → `/projects/nicholson`');
    expect(text).toContain('| `gap` | INPUT NEEDED: Intro |');
    expect(text).toContain('None: no content is approved yet.');
  });

  it('does not list a page as empty when it is not in the build', () => {
    const text = renderReadinessMarkdown({ ...base, routes: ['/'] }, 'dist');
    expect(text).not.toContain('- `/company` —');
  });

  it('escapes table cells', () => {
    const group = readinessGroup('x', 'A | B', { gap: inputNeeded('pipe | here') }, TODAY);
    expect(renderReadinessMarkdown({ ...base, groups: [group] }, 'dist')).toContain(
      'pipe \\| here',
    );
  });
});
