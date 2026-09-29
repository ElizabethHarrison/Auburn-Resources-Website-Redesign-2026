#!/usr/bin/env node
/**
 * Minimal static server for end-to-end tests: serves a build directory the way Cloudflare static assets
 * will (`/company` → company.html, `/` → index.html, unknown paths → 404), behind the real edge Worker
 * (workers/edge, D-023). No dependencies.
 *
 * Usage: node tests/static-server.mjs <dir> <port>
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
// Node 24 runs the Worker's TypeScript directly (type stripping); no build step, no dependencies.
import worker from '../workers/edge/src/index.ts';

const [dirArg, portArg] = process.argv.slice(2);
const root = resolve(dirArg ?? 'dist');
const port = Number(portArg ?? 4600);

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

async function locate(pathname) {
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
 * The static-assets binding, as Cloudflare provides it to the Worker: `/x` → x.html, `/` → index.html,
 * unknown paths → the 404 page with status 404.
 */
const ASSETS = {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const file = await locate(pathname);
    if (!file) {
      const notFound = join(root, '404.html');
      return new Response((await isFile(notFound)) ? await readFile(notFound) : 'Not found', {
        status: 404,
        headers: { 'Content-Type': TYPES['.html'] },
      });
    }
    return new Response(await readFile(file), {
      status: 200,
      headers: { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' },
    });
  },
};

// Every request goes through the real edge Worker (D-023), exactly as `run_worker_first` routes would;
// requests it does not handle fall through to ASSETS unchanged.
createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${port}`);
  const result = await worker.fetch(new Request(url, { method: request.method }), { ASSETS });
  response.writeHead(result.status, Object.fromEntries(result.headers));
  response.end(request.method === 'HEAD' ? undefined : Buffer.from(await result.arrayBuffer()));
}).listen(port, () =>
  console.log(`Serving ${root} on http://localhost:${port} (via the edge Worker)`),
);
