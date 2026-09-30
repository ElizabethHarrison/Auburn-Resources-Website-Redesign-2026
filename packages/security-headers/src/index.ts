/**
 * HTTP security headers (D-030, Proposed; docs/SECURITY-HEADERS.md). One list, used twice:
 *
 * - the site build writes it into Cloudflare's `_headers` file, which static assets apply to every file they serve;
 * - the edge Worker sets it on every response it returns, because `_headers` is not guaranteed to reach responses a
 *   Worker produces.
 *
 * The page's script and style policy is not here: it is a per-page `<meta>` Content Security Policy that Astro
 * generates with the hash of every inline script and style (`security.csp` in apps/site/astro.config.ts). These
 * headers add what a `<meta>` policy cannot carry (`frame-ancestors`) and the non-CSP protections.
 *
 * This file is loaded directly by Node's type stripping (tests/static-server.mjs → the Worker), so it has no imports.
 */

/** Values are constant: no per-request or per-page input, nothing echoed from the request. */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  // Header-only CSP directives; intersected with the page's <meta> policy by the browser.
  'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'none'; object-src 'none'",
  // Two years, this host only. includeSubDomains / preload wait for Q-48 (every subdomain must serve HTTPS first).
  'Strict-Transport-Security': 'max-age=63072000',
  'X-Content-Type-Options': 'nosniff',
  // Legacy equivalent of frame-ancestors 'none'.
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'accelerometer=(), browsing-topics=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

/** Preview builds (behind Cloudflare Access, D-005) are never indexed. */
export const PREVIEW_HEADERS: Readonly<Record<string, string>> = {
  'X-Robots-Tag': 'noindex',
};

/** Fingerprinted build assets never change, so browsers may cache them for a year. */
export const IMMUTABLE_ASSET_PATH = '/_astro/*';
export const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';

export function headersFor(options: {
  readonly preview: boolean;
}): Readonly<Record<string, string>> {
  return options.preview ? { ...SECURITY_HEADERS, ...PREVIEW_HEADERS } : SECURITY_HEADERS;
}

/** Cloudflare `_headers` (static assets) text for a build. */
export function toCloudflareHeaders(options: { readonly preview: boolean }): string {
  const lines = [
    '# Generated at build time from @auburn/security-headers (D-030). Do not edit.',
    '/*',
  ];
  for (const [name, value] of Object.entries(headersFor(options)))
    lines.push(`  ${name}: ${value}`);
  lines.push(IMMUTABLE_ASSET_PATH, `  Cache-Control: ${IMMUTABLE_CACHE}`);
  return `${lines.join('\n')}\n`;
}
