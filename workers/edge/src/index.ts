/**
 * Edge Worker entry (D-023). Scope: document-filter routing only — the PDF proxy, contact and alerts
 * APIs are later Phase 4 work. Every other request is served by static assets unchanged.
 *
 * Deployment is documented in docs/WORKER.md §8 and is not done yet.
 */
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

export async function handle(request: Request, env: Env): Promise<Response> {
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
