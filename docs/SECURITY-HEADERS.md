# Security headers and Content Security Policy

Decision: **D-030 (Proposed)**. Open: Q-48 (HSTS scope). Nothing is deployed; the files below take effect when the site
is deployed to Cloudflare (Q-09).

## 1. Content Security Policy (per page, `<meta>`)

Astro's built-in `security.csp` (`apps/site/astro.config.ts`) writes a `<meta http-equiv="content-security-policy">`
into every page, listing the SHA-256 hash of each inline script and style the build emits. No `'unsafe-inline'` or
`'unsafe-eval'` for scripts. No new dependency.

| Directive | Value | Why |
| --- | --- | --- |
| `default-src` | `'self'` | everything else from the site only |
| `script-src` | `'self'` + hashes | the mobile-menu module script (D-021) and nothing else can run |
| `style-src` | `'self'` + hashes | scoped styles only |
| `img-src` | `'self' https://cdn.sanity.io` | approved figures and photos from the Sanity image CDN (D-024; no real asset yet, D-028) |
| `font-src` | `'self'` | self-hosted fonts only (CLAUDE.md §9.10) |
| `connect-src`, `frame-src`, `worker-src` | `'none'` | the site makes no requests from script, embeds nothing |
| `form-action` | `'self'` | the filter form (and later the contact/alerts forms) post to the site only |
| `base-uri`, `object-src` | `'none'` | standard hardening |
| `upgrade-insecure-requests` | — | no mixed content |

Preview builds only: `style-src-attr 'unsafe-inline'`, because the design-system catalogue's colour swatches use
`style` attributes. Production pages have none (an e2e test checks).

When a later island needs more (MapLibre tiles and workers, Turnstile, Pagefind, an analytics script), its directive
is added with that island's approval, never as a blanket relaxation.

## 2. HTTP headers (every response)

Defined once in `packages/security-headers` (`@auburn/security-headers`):

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `frame-ancestors 'none'; base-uri 'none'; object-src 'none'` (directives a `<meta>` cannot carry) |
| `Strict-Transport-Security` | `max-age=63072000` (no `includeSubDomains`/`preload` until Q-48) |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation, payment, USB, sensors, topics: all disabled |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `X-Robots-Tag` | `noindex` (preview builds only) |

Also `Cache-Control: public, max-age=31536000, immutable` for fingerprinted `/_astro/*` files.

Delivered two ways, so no response is missed:

1. **`_headers`**: every build writes it (`apps/site/integrations/headers.ts`); Cloudflare static assets apply it to
   every file they serve and never serve the file itself.
2. **The edge Worker** sets the same headers on every response it returns (`workers/edge/src/index.ts`), because
   `_headers` is not guaranteed to reach responses a Worker produces. This adds to the Worker's D-023 scope (headers
   only; no routing change) and is part of D-030.

Values are constants: nothing is derived from the request.

## 3. Tests

- `packages/security-headers`: the `_headers` text (unit).
- `workers/edge`: every Worker response, whatever the route, carries every header; bodies and statuses unchanged.
- `tests/e2e/security-headers.spec.ts`, all four builds on the local edge server (`tests/static-server.mjs` applies
  `_headers` and `_redirects` like Cloudflare): headers on pages, filter views, 404s and redirects; preview `noindex`;
  immutable caching; a CSP `<meta>` on every page, placed before any script or style, with no `unsafe-eval` and no
  script `unsafe-inline`; no style attributes or inline handlers in production; **no CSP violation** on any public
  page in Chromium; the mobile menu works under the policy.
- Verified by mutation: injecting an inline script and a style attribute into a built page makes the violation and
  attribute tests fail.

## 4. Before deployment

- Check the live responses (e.g. securityheaders.com, Mozilla Observatory) after the first preview deployment.
- Q-48: confirm every subdomain serves HTTPS, then decide `includeSubDomains` and HSTS preload.
