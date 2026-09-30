/**
 * Redirects from the old site (docs/SITEMAP.md §9), kept in `redirects.csv` at the repository root and emitted as
 * Cloudflare's `_redirects` file at build time (docs/REDIRECTS.md). Pure functions, unit-tested; the build calls them
 * with the routes it has just generated.
 *
 * Rules (CLAUDE.md §4.5, §7): permanent (301) only; exact paths, lowercase and hyphenated, no trailing slash, no query
 * string, no wildcards; no duplicate sources, no self-redirects, no chains, no loops; a source never shadows a page of
 * the new site; a target is a page of the new site.
 */

export interface Redirect {
  readonly from: string;
  readonly to: string;
  readonly status: 301;
  /** 1-based line in the CSV, for messages. */
  readonly line: number;
}

export interface ParsedRedirects {
  readonly redirects: readonly Redirect[];
  readonly errors: readonly string[];
}

const HEADER = 'from,to,status';

/** `/` or up to three lowercase, hyphenated segments: `/company`, `/projects/nicholson`. */
const TARGET_PATH = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*){0,2})?$/;
/** Old-site paths: same shape, any depth (Squarespace used flat paths). */
const SOURCE_PATH = /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

export function parseRedirects(csv: string): ParsedRedirects {
  const lines = csv.replace(/\r\n/g, '\n').split('\n');
  const errors: string[] = [];
  const redirects: Redirect[] = [];
  if (lines[0]?.trim() !== HEADER) errors.push(`line 1: header must be "${HEADER}"`);
  lines.slice(1).forEach((raw, index) => {
    const line = index + 2;
    const text = raw.trim();
    if (text === '') return;
    const cells = text.split(',');
    if (cells.length !== 3) {
      errors.push(`line ${line}: expected 3 columns (from,to,status), found ${cells.length}`);
      return;
    }
    const [from = '', to = '', status = ''] = cells.map((cell) => cell.trim());
    if (status !== '301') {
      errors.push(`line ${line}: status must be 301 (permanent), found "${status}"`);
      return;
    }
    if (!SOURCE_PATH.test(from)) {
      errors.push(
        `line ${line}: source "${from}" must be an exact lowercase path (no trailing slash, query or wildcard)`,
      );
      return;
    }
    if (!TARGET_PATH.test(to)) {
      errors.push(
        `line ${line}: target "${to}" must be a site path: lowercase, hyphenated, at most three levels, no trailing slash or query`,
      );
      return;
    }
    redirects.push({ from, to, status: 301, line });
  });
  return { redirects, errors };
}

export interface RedirectCheck {
  /** Structural problems: always fail the build. */
  readonly errors: readonly string[];
  /** Redirects whose target page is not in this build (e.g. an unapproved project in production). */
  readonly missingTargets: readonly Redirect[];
}

/**
 * Structural rules, plus, when `routes` (the pages of a build) is given, shadowing and target checks.
 */
export function checkRedirects(
  redirects: readonly Redirect[],
  routes?: ReadonlySet<string>,
): RedirectCheck {
  const errors: string[] = [];
  const bySource = new Map<string, Redirect>();
  for (const redirect of redirects) {
    const earlier = bySource.get(redirect.from);
    if (earlier) {
      errors.push(
        `line ${redirect.line}: duplicate source ${redirect.from} (first on line ${earlier.line})`,
      );
      continue;
    }
    bySource.set(redirect.from, redirect);
  }
  for (const redirect of bySource.values()) {
    if (redirect.from === redirect.to) {
      errors.push(`line ${redirect.line}: ${redirect.from} redirects to itself`);
      continue;
    }
    const next = bySource.get(redirect.to);
    if (!next) continue;
    // Follow the chain to tell a loop from a plain chain.
    const seen = new Set([redirect.from]);
    let hop: Redirect | undefined = next;
    while (hop && !seen.has(hop.from)) {
      seen.add(hop.from);
      hop = bySource.get(hop.to);
    }
    errors.push(
      hop
        ? `line ${redirect.line}: redirect loop through ${[...seen].join(' → ')} → ${hop.from}`
        : `line ${redirect.line}: chain ${redirect.from} → ${redirect.to} → ${next.to}; point ${redirect.from} at the final page`,
    );
  }
  const missingTargets: Redirect[] = [];
  if (routes) {
    for (const redirect of bySource.values()) {
      if (routes.has(redirect.from)) {
        errors.push(
          `line ${redirect.line}: source ${redirect.from} is a page of the new site; redirecting it would hide the page`,
        );
      }
      if (!routes.has(redirect.to)) missingTargets.push(redirect);
    }
  }
  return { errors, missingTargets };
}

/** Cloudflare `_redirects` (static assets): one `source target status` line per redirect, in CSV order. */
export function toCloudflareRedirects(redirects: readonly Redirect[]): string {
  const header = '# Generated from redirects.csv at build time (docs/REDIRECTS.md). Do not edit.\n';
  return header + redirects.map((r) => `${r.from} ${r.to} ${r.status}\n`).join('');
}

/** A build's page routes from its HTML files (`company.html` → `/company`, `index.html` → `/`). */
export function routesFromHtmlFiles(files: readonly string[]): ReadonlySet<string> {
  const routes = new Set<string>();
  for (const file of files) {
    const path = file.replace(/\\/g, '/').replace(/^\.?\/*/, '');
    if (!path.endsWith('.html')) continue;
    let route = `/${path.slice(0, -'.html'.length)}`;
    if (route === '/index') route = '/';
    else if (route.endsWith('/index')) route = route.slice(0, -'/index'.length);
    routes.add(route);
  }
  return routes;
}
