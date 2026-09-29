/**
 * Document-filter routing (D-023; docs/WORKER.md). Pure and dependency-free: decides, from the request
 * URL alone, which prebuilt static page answers a listing request with a query string.
 *
 * Safety: the only paths this can produce are `/filtered/<fixed listing key>/<slug>`, where the slug is
 * built from values that passed strict validation (four-digit year, fixed type list). Query values are
 * never echoed into a response, and nothing here redirects.
 *
 * The slug format must match `apps/site/src/lib/document-filters.ts` (`stateSlug`); the end-to-end
 * tests exercise both through the local server.
 */

export const FILTERED_PREFIX = '/filtered/';

interface ListingRule {
  readonly key: 'announcements' | 'reports' | 'presentations';
  readonly params: readonly FilterParam[];
}

type FilterParam = 'year' | 'type';

/** The only listings the Worker routes. Keys are fixed; paths are the canonical listing URLs. */
export const LISTINGS: Readonly<Record<string, ListingRule>> = {
  '/investors/announcements': { key: 'announcements', params: ['year'] },
  '/investors/presentations': { key: 'presentations', params: ['year'] },
  '/investors/reports': { key: 'reports', params: ['year', 'type'] },
};

/** Report document types as URL slugs (same list as the site). */
export const REPORT_TYPES: readonly string[] = ['annual', 'half-year', 'quarterly', 'notice'];

const FILTER_PARAMS: readonly FilterParam[] = ['year', 'type'];
const YEAR = /^\d{4}$/;

export type Decision =
  /** Not a filter request: serve the static asset unchanged. */
  | { readonly kind: 'pass' }
  /** A direct request for an internal filter page: answer 404. */
  | { readonly kind: 'hidden' }
  /** A listing with a query string but no filter value: the unfiltered page, not indexed. */
  | { readonly kind: 'unfiltered'; readonly asset: string }
  /** A well-formed filter: serve its prebuilt page, or the listing's unavailable page (404) if none exists. */
  | { readonly kind: 'filter'; readonly asset: string; readonly fallback: string }
  /** A malformed filter: the listing's unavailable page with 400. */
  | { readonly kind: 'invalid'; readonly asset: string };

function listingFor(pathname: string): { path: string; rule: ListingRule } | undefined {
  const path = pathname.endsWith('.html') ? pathname.slice(0, -'.html'.length) : pathname;
  const rule = LISTINGS[path];
  return rule ? { path, rule } : undefined;
}

export function decide(url: URL, method = 'GET'): Decision {
  if (url.pathname.startsWith(FILTERED_PREFIX) || url.pathname === FILTERED_PREFIX.slice(0, -1)) {
    return { kind: 'hidden' };
  }
  const listing = listingFor(url.pathname);
  if (!listing || (method !== 'GET' && method !== 'HEAD') || url.search === '') {
    return { kind: 'pass' };
  }
  const { path, rule } = listing;
  const unavailable = `${FILTERED_PREFIX}${rule.key}/unavailable`;

  const values: Partial<Record<FilterParam, string>> = {};
  for (const param of FILTER_PARAMS) {
    const all = url.searchParams.getAll(param);
    if (all.length > 1) return { kind: 'invalid', asset: unavailable };
    const value = all[0] ?? '';
    if (value === '') continue;
    if (!rule.params.includes(param)) return { kind: 'invalid', asset: unavailable };
    values[param] = value;
  }

  const { year, type } = values;
  if (year !== undefined && !YEAR.test(year)) return { kind: 'invalid', asset: unavailable };
  if (type !== undefined && !REPORT_TYPES.includes(type))
    return { kind: 'invalid', asset: unavailable };
  if (year === undefined && type === undefined) return { kind: 'unfiltered', asset: path };

  const slug = [year === undefined ? '' : `year-${year}`, type === undefined ? '' : `type-${type}`]
    .filter((part) => part !== '')
    .join('-');
  return { kind: 'filter', asset: `${FILTERED_PREFIX}${rule.key}/${slug}`, fallback: unavailable };
}
