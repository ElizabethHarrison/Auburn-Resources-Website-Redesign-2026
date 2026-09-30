import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  checkRedirects,
  parseRedirects,
  routesFromHtmlFiles,
  toCloudflareRedirects,
} from './redirects';

const csv = (...rows: string[]) => ['from,to,status', ...rows].join('\n');

describe('parseRedirects', () => {
  it('reads valid rows and ignores blank lines', () => {
    const { redirects, errors } = parseRedirects(
      csv('/about-us,/company,301', '', '/cart,/,301', ''),
    );
    expect(errors).toEqual([]);
    expect(redirects).toEqual([
      { from: '/about-us', to: '/company', status: 301, line: 2 },
      { from: '/cart', to: '/', status: 301, line: 4 },
    ]);
  });

  it('rejects a wrong header', () => {
    expect(parseRedirects('source,target,code\n/a,/b,301').errors.join()).toMatch(/header/);
  });

  it.each([
    ['temporary status', csv('/a,/company,302'), /301/],
    ['missing column', csv('/a,/company'), /3 columns/],
    ['extra column', csv('/a,/company,301,x'), /3 columns/],
    ['uppercase source', csv('/About-Us,/company,301'), /source/],
    ['trailing slash source', csv('/about/,/company,301'), /source/],
    ['wildcard source', csv('/s/*,/documents,301'), /source/],
    ['query in source', csv('/a?x=1,/company,301'), /source/],
    ['external target', csv('/a,https://example.com/,301'), /target/],
    ['relative target', csv('/a,company,301'), /target/],
    ['target with query', csv('/a,/investors/reports?year=2021,301'), /target/],
    ['target four levels deep', csv('/a,/one/two/three/four,301'), /target/],
    ['target trailing slash', csv('/a,/company/,301'), /target/],
  ])('rejects %s', (_name, text, message) => {
    const { redirects, errors } = parseRedirects(text);
    expect(errors.join('\n')).toMatch(message);
    expect(redirects).toEqual([]);
  });
});

describe('checkRedirects', () => {
  const parse = (...rows: string[]) => parseRedirects(csv(...rows)).redirects;

  it('rejects a self-redirect', () => {
    expect(checkRedirects(parse('/company,/company,301')).errors.join()).toMatch(/itself/);
  });

  it('rejects duplicate sources', () => {
    expect(checkRedirects(parse('/a,/company,301', '/a,/contact,301')).errors.join()).toMatch(
      /duplicate/,
    );
  });

  it('rejects a chain', () => {
    const { errors } = checkRedirects(parse('/a,/b,301', '/b,/company,301'));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/chain \/a → \/b → \/company/);
  });

  it('rejects a loop', () => {
    const { errors } = checkRedirects(parse('/a,/b,301', '/b,/c,301', '/c,/a,301'));
    expect(errors).toHaveLength(3);
    for (const error of errors) expect(error).toMatch(/loop/);
  });

  it('rejects a source that is a page of the new site (e.g. /projects, /investors)', () => {
    const routes = new Set(['/', '/projects', '/investors']);
    const { errors } = checkRedirects(parse('/projects,/,301'), routes);
    expect(errors.join()).toMatch(/page of the new site/);
  });

  it('reports targets missing from a build without failing', () => {
    const routes = new Set(['/', '/company']);
    const { errors, missingTargets } = checkRedirects(
      parse('/about,/company,301', '/nicholson-project,/projects/nicholson,301'),
      routes,
    );
    expect(errors).toEqual([]);
    expect(missingTargets.map((r) => r.to)).toEqual(['/projects/nicholson']);
  });
});

describe('toCloudflareRedirects', () => {
  it('writes one line per redirect, in order, after a header comment', () => {
    const text = toCloudflareRedirects(
      parseRedirects(csv('/about-us,/company,301', '/cart,/,301')).redirects,
    );
    expect(text.split('\n').filter((l) => l && !l.startsWith('#'))).toEqual([
      '/about-us /company 301',
      '/cart / 301',
    ]);
  });
});

describe('routesFromHtmlFiles', () => {
  it('maps file-format HTML to routes', () => {
    expect([
      ...routesFromHtmlFiles([
        'index.html',
        'company.html',
        'company/leadership.html',
        'x.css',
        'a/index.html',
      ]),
    ]).toEqual(['/', '/company', '/company/leadership', '/a']);
  });
});

describe('redirects.csv (docs/SITEMAP.md §9)', () => {
  const file = readFileSync(new URL('../../../../redirects.csv', import.meta.url), 'utf8');
  const { redirects, errors } = parseRedirects(file);

  it('parses and passes the structural rules', () => {
    expect(errors).toEqual([]);
    expect(checkRedirects(redirects).errors).toEqual([]);
  });

  it('contains every approved row of the sitemap table', () => {
    const map = Object.fromEntries(redirects.map((r) => [r.from, r.to]));
    const expected: Record<string, string> = {
      '/about-us': '/company',
      '/about': '/company',
      '/home': '/',
      '/home-1': '/',
      '/home-2': '/',
      '/home-impact': '/',
      '/welcome': '/',
      '/board-of-directors-and-management': '/company/leadership',
      '/corporate-governance': '/investors/governance',
      '/corporate-governance-1': '/investors/governance',
      '/corporate-governance-2': '/investors/governance',
      '/project-portfolio': '/projects',
      '/nicholson-project': '/projects/nicholson',
      '/calgoa-project': '/projects/calgoa',
      '/tanumbirini-project': '/projects/tanumbirini',
      '/hawkwood-project': '/projects/hawkwood',
      '/victoria-river-downs': '/projects/victoria-river-downs',
      '/investor-centre': '/investors',
      '/investor-center': '/investors',
      '/presentations': '/investors/presentations',
      '/email-alerts': '/investors/alerts',
      '/auburnresources': '/investors/alerts',
      '/media-coverage': '/news/media',
      '/contact-us': '/contact',
      '/contact-us-1': '/contact',
      '/cart': '/',
    };
    expect(map).toEqual(expected);
  });

  it('leaves out the rows still pending (Q-23, re-hosted PDFs) and never redirects /projects or /investors', () => {
    const sources = redirects.map((r) => r.from);
    expect(sources).not.toContain('/2021-entitlement-offer');
    expect(sources.some((s) => s.startsWith('/s/'))).toBe(false);
    expect(sources).not.toContain('/projects');
    expect(sources).not.toContain('/investors');
  });
});
