/**
 * Edge Worker entry (D-023). Scope: document-filter routing only — the PDF proxy, contact and alerts
 * APIs are later Phase 4 work. Every other request is served by static assets unchanged, apart from the
 * security headers (D-030), which the Worker sets on every response it returns because Cloudflare's
 * `_headers` file is not guaranteed to reach Worker responses.
 *
 * Deployment is documented in docs/WORKER.md §8 and is not done yet.
 */
import { SECURITY_HEADERS } from '@auburn/security-headers';
import { decide } from './document-filters.ts';

/** The static-assets binding (Cloudflare Workers static assets), or the local test server's stand-in. */
export interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

export interface Env {
  readonly ASSETS: AssetsBinding;
}

const NOINDEX = 'noindex';

async function asset(env: Env, request: Request, path: string): Promise<Response> {
  return env.ASSETS.fetch(new Request(new URL(path, request.url), { method: request.method }));
}

/** Re-issue a response with a given status and the noindex header. */
function withNoindex(response: Response, status = response.status): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', NOINDEX);
  return new Response(response.body, { status, headers });
}

/** Every response leaves with the constant security headers (never derived from the request). */
function secured(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  return new Response(response.body, { status: response.status, headers });
}

export async function handle(request: Request, env: Env): Promise<Response> {
  return secured(await route(request, env));
}

async function route(request: Request, env: Env): Promise<Response> {
  const decision = decide(new URL(request.url), request.method);
  switch (decision.kind) {
    case 'pass':
      return env.ASSETS.fetch(request);
    case 'hidden':
      return withNoindex(await asset(env, request, '/404'), 404);
    case 'unfiltered':
      return withNoindex(await asset(env, request, decision.asset));
    case 'invalid':
      return withNoindex(await asset(env, request, decision.asset), 400);
    case 'filter': {
      const page = await asset(env, request, decision.asset);
      if (page.ok) return withNoindex(page, 200);
      return withNoindex(await asset(env, request, decision.fallback), 404);
    }
  }
}

export default { fetch: handle };
