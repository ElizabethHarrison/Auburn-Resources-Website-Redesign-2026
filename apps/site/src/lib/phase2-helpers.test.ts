import { describe, expect, it } from 'vitest';
import { documents } from './content/fixtures/data/documents';
import { people } from './content/fixtures/data/people';
import { projects } from './content/fixtures/data/projects';
import type { DocumentRecord, Person, Project } from './content/types';
import { isDocumentListable, isPersonListable, isProjectListable } from './content/visibility';
import { clampMode, type Fact, inputNeeded } from './facts';
import { factDisplay, formatFactValue, formatNumber } from './format';
import { SECTIONS, footerColumns, projectSectionPages } from './navigation';
import { documentPageUrl, documentPdfUrl, projectUrl } from './urls';

const fact = <T>(
  value: T,
  extra: Partial<Fact<T>> = {},
  status: Fact<T>['meta']['status'] = 'approved',
): Fact<T> => ({
  kind: 'fact',
  value,
  ...extra,
  meta: { sourceDocument: { documentId: 'x' }, asAt: '2026-09-29', status },
});

describe('clampMode', () => {
  it('never lets a component render preview inside a production build', () => {
    expect(clampMode('production', 'preview')).toBe('production');
    expect(clampMode('production')).toBe('production');
  });

  it('lets preview builds show production rendering on request', () => {
    expect(clampMode('preview', 'production')).toBe('production');
    expect(clampMode('preview')).toBe('preview');
  });
});

describe('formatFactValue', () => {
  it('formats Australian numbers without rounding', () => {
    expect(formatNumber(9300)).toBe('9,300');
    expect(formatNumber(39.34)).toBe('39.34');
  });

  it('spaces SI units, not percent; keeps qualifiers as stated', () => {
    expect(formatFactValue(fact(9300, { unit: 'km²', qualifier: 'over' }))).toBe('over 9,300 km²');
    expect(formatFactValue(fact(6500, { unit: 'km²', qualifier: '+' }))).toBe('+6,500 km²');
    expect(formatFactValue(fact(39, { unit: '%' }))).toBe('39%');
    expect(formatFactValue(fact(1200, { unit: 'line km' }))).toBe('1,200 line km');
  });

  it('requires a format function for structured values', () => {
    expect(() => formatFactValue(fact({ lines: ['a'] }))).toThrow();
    const item = factDisplay('Address', fact({ lines: ['PO Box 1', 'Town'] }), (v) =>
      v.lines.join(', '),
    );
    expect(item.format?.({ lines: ['PO Box 1', 'Town'] })).toBe('PO Box 1, Town');
  });
});

describe('record visibility', () => {
  it('lists no fixture document, person or project in production (none approved)', () => {
    expect(documents.filter((d) => isDocumentListable(d, 'production'))).toEqual([]);
    expect(people.filter((p) => isPersonListable(p, 'production'))).toEqual([]);
    expect(projects.filter((p) => isProjectListable(p, 'production'))).toEqual([]);
  });

  it('never lists internal source records, even in preview', () => {
    const listed = documents.filter((d) => isDocumentListable(d, 'preview'));
    expect(listed.length).toBeGreaterThan(0);
    expect(listed.every((d) => !d.internal)).toBe(true);
  });

  it('needs an approved record, date and file for a production register row', () => {
    const base = documents.find((d) => !d.internal) as DocumentRecord;
    const approved: DocumentRecord = {
      ...base,
      status: 'approved',
      releaseAt: fact('2026-09-29' as const),
      file: fact('a.pdf'),
    };
    expect(isDocumentListable(approved, 'production')).toBe(true);
    expect(isDocumentListable({ ...approved, file: inputNeeded('PDF') }, 'production')).toBe(false);
    expect(isDocumentListable({ ...approved, status: 'toVerify' }, 'production')).toBe(false);
  });

  it('lists a project in production only when confirmed held', () => {
    const base = projects[0] as Project;
    expect(isProjectListable({ ...base, holding: fact('active' as const) }, 'production')).toBe(
      true,
    );
    expect(
      isProjectListable({ ...base, holding: fact('noLongerHeld' as const) }, 'production'),
    ).toBe(false);
    expect(
      isProjectListable(
        { ...base, holding: fact('active' as const, {}, 'toVerify') },
        'production',
      ),
    ).toBe(false);
  });

  it('needs an approved role for a production person card', () => {
    const base = people[0] as Person;
    expect(isPersonListable({ ...base, role: fact('Role') }, 'production')).toBe(true);
  });
});

describe('urls', () => {
  it('builds lowercase URLs without trailing slashes', () => {
    expect(projectUrl({ slug: 'nicholson' })).toBe('/projects/nicholson');
    expect(documentPdfUrl({ slug: '2022-12-23-annual-report' })).toBe(
      '/documents/2022-12-23-annual-report.pdf',
    );
  });

  it('gives only announcements an HTML page', () => {
    expect(documentPageUrl({ slug: 'a', docType: 'announcement' })).toBe(
      '/investors/announcements/a',
    );
    expect(documentPageUrl({ slug: 'a', docType: 'annual' })).toBeUndefined();
  });
});

describe('navigation (docs/SITEMAP.md)', () => {
  it('has the five numbered sections in order', () => {
    expect(SECTIONS.map((s) => `${s.id} ${s.label}`)).toEqual([
      '01 Company',
      '02 Projects',
      '03 Investors',
      '04 Sustainability',
      '05 News',
    ]);
  });

  it('uses only lowercase, hyphenated URLs at most three levels deep', () => {
    const hrefs = SECTIONS.flatMap((s) => [s.href, ...s.pages.map((p) => p.href)]);
    for (const href of hrefs) {
      expect(href).toMatch(/^\/[a-z0-9-/]*$/);
      expect(href.split('/').filter(Boolean).length).toBeLessThanOrEqual(3);
    }
  });

  it('inserts project dossiers after the portfolio and before How we explore', () => {
    const pages = projectSectionPages([{ label: 'X', href: '/projects/x', sheet: '02.1' }]);
    expect(pages.map((p) => p.label)).toEqual(['Portfolio', 'X', 'How we explore']);
    expect(
      footerColumns([{ label: 'X', href: '/projects/x' }])[1]?.links.map((l) => l.label),
    ).toEqual(['Portfolio map', 'X', 'How we explore']);
  });
});

describe('breakBeforeDots', () => {
  it('offers wrap points before each dot in a domain, and keeps plain text whole', async () => {
    const { breakBeforeDots } = await import('./format');
    expect(breakBeforeDots('Capture of the current auburnresources.com.au website')).toEqual([
      'Capture of the current auburnresources',
      '.com',
      '.au website',
    ]);
    expect(breakBeforeDots('Annual Report')).toEqual(['Annual Report']);
    expect(breakBeforeDots('Report. Next')).toEqual(['Report. Next']);
  });
});

describe('isColumnVisible', () => {
  it('shows a column in production only when every row has an approved value', async () => {
    const { isColumnVisible } = await import('./content/visibility');
    const rows = [{ v: fact(1) }, { v: fact(2, {}, 'toVerify') }];
    expect(isColumnVisible(rows, (r) => r.v, 'production')).toBe(false);
    expect(isColumnVisible(rows.slice(0, 1), (r) => r.v, 'production')).toBe(true);
    expect(isColumnVisible(rows, (r) => r.v, 'preview')).toBe(true);
    expect(isColumnVisible([], (r: { v: Fact<number> }) => r.v, 'preview')).toBe(false);
  });
});
