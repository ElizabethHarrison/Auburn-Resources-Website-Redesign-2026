#!/usr/bin/env node
/**
 * Minimal static server for end-to-end tests: serves a build directory the way Cloudflare Workers static assets
 * does (`/company` → company.html, `/` → index.html, unknown paths → 404), with the real edge Worker
 * (workers/edge, D-023) in front of the `run_worker_first` paths only. No dependencies.
 *
 * Follows workers/edge/wrangler.jsonc (read, not restated) and the documented Cloudflare behaviour
 * (docs/LAUNCH-GATE.md §1): `_redirects` and `_headers` apply to static-asset responses only, never to responses the
 * Worker builds; the Worker gets the environment's `vars`.
 *
 * Usage: node tests/static-server.mjs <dir> <port> [production|preview]
 * The environment defaults to `preview` for a directory whose name ends in `-preview`, else `production`.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
// Node 24 runs the Worker's TypeScript directly (type stripping); no build step, no dependencies.
import worker from '../workers/edge/src/index.ts';
import { runsWorkerFirst, wranglerEnvironment } from './wrangler-config.mjs';

const [dirArg, portArg, envArg] = process.argv.slice(2);
const root = resolve(dirArg ?? 'dist');
const port = Number(portArg ?? 4600);
const environment = wranglerEnvironment(
  envArg ?? (/-preview$/.test(root) ? 'preview' : 'production'),
);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/**
 * Cloudflare's `_redirects` (static assets), the subset the build emits: exact-path `source target 301` lines
 * (docs/REDIRECTS.md). Read once at start-up.
 */
async function loadRedirects() {
  const file = join(root, '_redirects');
  if (!(await isFile(file))) return new Map();
  const rules = new Map();
  for (const line of (await readFile(file, 'utf8')).split('\n')) {
    const text = line.trim();
    if (text === '' || text.startsWith('#')) continue;
    const [from, to, status] = text.split(/\s+/);
    rules.set(from, { to, status: Number(status) });
  }
  return rules;
}
const REDIRECTS = await loadRedirects();

/**
 * Cloudflare's `_headers` (static assets), the subset the build emits: a path line (`/*` or `/prefix/*`) followed by
 * indented `Name: value` lines, applied to every static response whose path matches (docs/SECURITY-HEADERS.md).
 */
async function loadHeaders() {
  const file = join(root, '_headers');
  if (!(await isFile(file))) return [];
  const rules = [];
  for (const line of (await readFile(file, 'utf8')).split('\n')) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      rules.push({ prefix: line.trim().replace(/\*$/, ''), headers: [] });
      continue;
    }
    const colon = line.indexOf(':');
    rules.at(-1)?.headers.push([line.slice(0, colon).trim(), line.slice(colon + 1).trim()]);
  }
  return rules;
}
const HEADER_RULES = await loadHeaders();

function withStaticHeaders(pathname, headers) {
  for (const rule of HEADER_RULES) {
    if (pathname.startsWith(rule.prefix))
      for (const [name, value] of rule.headers) headers.set(name, value);
  }
  return headers;
}

/** Cloudflare never serves its configuration files as assets. */
const CONFIG_FILES = new Set(['/_redirects', '/_headers']);

async function locate(pathname) {
  if (CONFIG_FILES.has(pathname)) return undefined;
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const base = join(root, safe);
  if (!base.startsWith(root)) return undefined;
  const candidates = safe.endsWith('/')
    ? [join(base, 'index.html')]
    : [base, `${base}.html`, join(base, 'index.html')];
  for (const candidate of candidates) if (await isFile(candidate)) return candidate;
  return undefined;
}

/**
 * Static-asset serving: `/x` → x.html, `/` → index.html, unknown paths → the 404 page with status 404. For a request
 * that does not run the Worker, `_redirects` and `_headers` apply (`configured`); the binding the Worker receives
 * gets plain assets, because Cloudflare does not apply either file to responses the Worker produces.
 */
async function serveAsset(request, configured) {
  const { pathname } = new URL(request.url);
  const redirect = configured ? REDIRECTS.get(pathname) : undefined;
  if (redirect) {
    return new Response(null, {
      status: redirect.status,
      headers: staticHeaders(configured, pathname, new Headers({ Location: redirect.to })),
    });
  }
  const file = await locate(pathname);
  if (!file) {
    const notFound = join(root, '404.html');
    return new Response((await isFile(notFound)) ? await readFile(notFound) : 'Not found', {
      status: 404,
      headers: staticHeaders(configured, pathname, new Headers({ 'Content-Type': TYPES['.html'] })),
    });
  }
  return new Response(await readFile(file), {
    status: 200,
    headers: staticHeaders(
      configured,
      pathname,
      new Headers({ 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' }),
    ),
  });
}

function staticHeaders(configured, pathname, headers) {
  return configured ? withStaticHeaders(pathname, headers) : headers;
}

/** What the Worker receives: its environment's `vars` and the plain static-assets binding. */
const WORKER_ENV = {
  ...environment.vars,
  ASSETS: { fetch: (request) => serveAsset(request, false) },
};

createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${port}`);
  const incoming = new Request(url, { method: request.method });
  const result = runsWorkerFirst(environment.runWorkerFirst, url.pathname)
    ? await worker.fetch(incoming, WORKER_ENV)
    : await serveAsset(incoming, true);
  response.writeHead(result.status, Object.fromEntries(result.headers));
  response.end(request.method === 'HEAD' ? undefined : Buffer.from(await result.arrayBuffer()));
}).listen(port, () =>
  console.log(
    `Serving ${root} on http://localhost:${port} as Cloudflare would (${environment.name}; Worker on ${environment.runWorkerFirst.length} run_worker_first patterns)`,
  ),
);
