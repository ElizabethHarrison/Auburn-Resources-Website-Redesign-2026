/**
 * SEO helpers (CLAUDE.md §7): titles, canonical URLs, robots, and JSON-LD.
 *
 * Structured data is built from Facts, so it follows the same rendering rules as the page: in
 * production only Approved values are emitted. The old site named the organisation "DGR Global" in
 * its structured data; the Organization block here uses only the approved legal name.
 */
import type { ContentMode } from './facts';
import { isRenderable } from './facts';
import type { FactSlot, IsoDate } from './facts';
import type { Project, SiteSettings } from './content/types';
import { STATE_NAMES } from './format';

export const SITE_NAME = 'Auburn Resources';

/** Recommended bounds for meta descriptions; enforced as warnings at build time. */
export const DESCRIPTION_LIMITS = { min: 50, max: 160 } as const;

// ── Titles and descriptions ─────────────────────────────────────────────────────────────────────

/** `Leadership | Auburn Resources`; the home page is just the site name. */
export function pageTitle(title: string | undefined): string {
  const trimmed = title?.trim();
  return trimmed && trimmed !== SITE_NAME ? `${trimmed} | ${SITE_NAME}` : SITE_NAME;
}

export function descriptionIssues(description: string): string[] {
  const length = [...description.trim()].length;
  const issues: string[] = [];
  if (length === 0) issues.push('Meta description is empty.');
  else if (length < DESCRIPTION_LIMITS.min)
    issues.push(`Meta description is short (${length} characters).`);
  if (length > DESCRIPTION_LIMITS.max)
    issues.push(`Meta description is long (${length} characters).`);
  return issues;
}

// ── URLs ────────────────────────────────────────────────────────────────────────────────────────

/**
 * Canonical URL: absolute, lowercase path, no trailing slash (except the root), no `.html`, no query
 * string or fragment (filters use non-indexed query strings — docs/SITEMAP.md §1).
 */
export function canonicalUrl(pathname: string, site: URL | string): string {
  const base = new URL(site);
  let path = new URL(pathname, base).pathname.toLowerCase();
  path = path.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return new URL(path, base.origin).href;
}

// ── Robots ──────────────────────────────────────────────────────────────────────────────────────

/** Preview builds are never indexed; individual pages (e.g. `/_catalogue`, 404) may opt out too. */
export function robotsDirective(mode: ContentMode, noindex = false): string {
  return mode === 'preview' || noindex ? 'noindex, nofollow' : 'index, follow';
}

/** robots.txt body. Preview disallows everything; production points to the sitemap. */
export function robotsTxt(mode: ContentMode, site: URL | string): string {
  if (mode === 'preview') return 'User-agent: *\nDisallow: /\n';
  const sitemap = new URL('/sitemap-index.xml', site).href;
  return `User-agent: *\nAllow: /\nDisallow: /_catalogue\n\nSitemap: ${sitemap}\n`;
}

// ── JSON-LD ─────────────────────────────────────────────────────────────────────────────────────

export type JsonLd = Record<string, unknown> & { '@type': string };

export interface BreadcrumbItem {
  /** Visible label, e.g. `02 Projects`. */
  readonly name: string;
  readonly path: string;
}

export function breadcrumbJsonLd(items: readonly BreadcrumbItem[], site: URL | string): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path, site),
    })),
  };
}

function renderedValue<T>(slot: FactSlot<T>, mode: ContentMode): T | undefined {
  return slot.kind === 'fact' && isRenderable(slot, mode) ? slot.value : undefined;
}

/**
 * Organization JSON-LD. Returns `undefined` when the legal name is not renderable in this mode, so no
 * unverified organisation data is ever published. Other properties are included only if renderable.
 */
export function organizationJsonLd(
  settings: SiteSettings,
  mode: ContentMode,
  site: URL | string,
): JsonLd | undefined {
  const legalName = renderedValue(settings.legalName, mode);
  if (legalName === undefined) return undefined;

  const email = renderedValue(settings.email, mode);
  const phone = renderedValue(settings.phone, mode);
  const street = renderedValue(settings.streetAddress, mode);
  const sameAs = renderedValue(settings.socialProfiles, mode);

  return {
    '@type': 'Organization',
    name: SITE_NAME,
    legalName,
    url: new URL('/', site).href,
    ...(email === undefined ? {} : { email }),
    ...(phone === undefined ? {} : { telephone: phone }),
    ...(street === undefined
      ? {}
      : { address: { '@type': 'PostalAddress', streetAddress: street.lines.join(', ') } }),
    ...(sameAs === undefined ? {} : { sameAs: [...sameAs] }),
  };
}

/**
 * Serialise JSON-LD for a `<script type="application/ld+json">` element. `<` is escaped so content can
 * never close the script element early.
 */
export function serializeJsonLd(blocks: readonly JsonLd[]): string {
  const graph =
    blocks.length === 1
      ? { '@context': 'https://schema.org', ...blocks[0] }
      : {
          '@context': 'https://schema.org',
          '@graph': blocks,
        };
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}

/**
 * Place JSON-LD for a project page (CLAUDE.md §7). Only approved facts are used: the state is added as
 * the containing area when approved; coordinates are never included until approved GIS exists.
 */
export function placeJsonLd(project: Project, mode: ContentMode, url: string): JsonLd {
  const state = renderedValue(project.state, mode);
  return {
    '@type': 'Place',
    name: project.name,
    url,
    ...(state === undefined
      ? {}
      : { containedInPlace: { '@type': 'AdministrativeArea', name: STATE_NAMES[state] } }),
  };
}

/**
 * Article JSON-LD for announcements and news (CLAUDE.md §7). The publication date is included only
 * when it is approved (renderable in production); nothing unapproved enters structured data.
 */
export function articleJsonLd(
  headline: string,
  date: FactSlot<IsoDate>,
  mode: ContentMode,
  url: string,
): JsonLd {
  const published = renderedValue(date, mode);
  return {
    '@type': 'Article',
    headline,
    url,
    ...(published === undefined ? {} : { datePublished: published }),
  };
}
