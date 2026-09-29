import { describe, expect, it } from 'vitest';
import { siteSettings } from './content/fixtures/data/site-settings';
import type { SiteSettings } from './content/types';
import type { Fact, FactSlot } from './facts';
import {
  breadcrumbJsonLd,
  canonicalUrl,
  descriptionIssues,
  organizationJsonLd,
  pageTitle,
  robotsDirective,
  robotsTxt,
  serializeJsonLd,
} from './seo';

const SITE = 'https://auburnresources.com.au';

function approve<T>(slot: FactSlot<T>): Fact<T> {
  if (slot.kind !== 'fact') throw new Error('Expected a fact');
  return { ...slot, meta: { ...slot.meta, status: 'approved' } };
}

describe('pageTitle', () => {
  it('appends the site name, except on the home page', () => {
    expect(pageTitle('Leadership')).toBe('Leadership | Auburn Resources');
    expect(pageTitle(undefined)).toBe('Auburn Resources');
    expect(pageTitle('Auburn Resources')).toBe('Auburn Resources');
  });
});

describe('descriptionIssues', () => {
  it('flags empty, short and long descriptions', () => {
    expect(descriptionIssues('')).toHaveLength(1);
    expect(descriptionIssues('Too short.')).toHaveLength(1);
    expect(descriptionIssues('x'.repeat(161))).toHaveLength(1);
    expect(
      descriptionIssues('A meta description of a sensible length for a search result.'),
    ).toEqual([]);
  });
});

describe('canonicalUrl', () => {
  it('produces lowercase absolute URLs without trailing slashes, extensions or query strings', () => {
    expect(canonicalUrl('/', SITE)).toBe(`${SITE}/`);
    expect(canonicalUrl('/Company/Leadership/', SITE)).toBe(`${SITE}/company/leadership`);
    expect(canonicalUrl('/company.html', SITE)).toBe(`${SITE}/company`);
    expect(canonicalUrl('/index.html', SITE)).toBe(`${SITE}/`);
    expect(canonicalUrl('/investors/announcements?year=2026#top', SITE)).toBe(
      `${SITE}/investors/announcements`,
    );
  });

  it('always uses the configured site origin', () => {
    expect(canonicalUrl('https://example.com/company', SITE)).toBe(`${SITE}/company`);
  });
});

describe('robots', () => {
  it('never indexes preview builds', () => {
    expect(robotsDirective('preview')).toBe('noindex, nofollow');
    expect(robotsTxt('preview', SITE)).toBe('User-agent: *\nDisallow: /\n');
  });

  it('indexes production pages unless they opt out', () => {
    expect(robotsDirective('production')).toBe('index, follow');
    expect(robotsDirective('production', true)).toBe('noindex, nofollow');
    expect(robotsTxt('production', SITE)).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
    expect(robotsTxt('production', SITE)).toContain('Disallow: /_catalogue');
    expect(robotsTxt('production', SITE)).toContain('Disallow: /filtered/');
  });
});

describe('breadcrumbJsonLd', () => {
  it('lists items in order with canonical URLs', () => {
    const jsonLd = breadcrumbJsonLd(
      [
        { name: 'Home', path: '/' },
        { name: '02 Projects', path: '/projects/' },
      ],
      SITE,
    );
    expect(jsonLd).toEqual({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: '02 Projects', item: `${SITE}/projects` },
      ],
    });
  });
});

describe('organizationJsonLd', () => {
  it('emits nothing in production while the legal name is unapproved', () => {
    expect(organizationJsonLd(siteSettings, 'production', SITE)).toBeUndefined();
  });

  it('uses only approved values in production', () => {
    const settings: SiteSettings = { ...siteSettings, legalName: approve(siteSettings.legalName) };
    expect(organizationJsonLd(settings, 'production', SITE)).toEqual({
      '@type': 'Organization',
      name: 'Auburn Resources',
      legalName: 'Auburn Resources Limited',
      url: `${SITE}/`,
    });
  });

  it('never names DGR Global as the organisation', () => {
    const json = JSON.stringify(organizationJsonLd(siteSettings, 'preview', SITE));
    expect(json).not.toMatch(/"(legalName|name)":"DGR/);
  });
});

describe('serializeJsonLd', () => {
  it('adds the schema.org context and escapes < so content cannot close the script tag', () => {
    const out = serializeJsonLd([{ '@type': 'Thing', name: '</script><script>' }]);
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Thing',
      name: '</script><script>',
    });
  });

  it('uses @graph for several blocks', () => {
    const out = JSON.parse(serializeJsonLd([{ '@type': 'A' }, { '@type': 'B' }]));
    expect(out['@graph']).toHaveLength(2);
  });
});
