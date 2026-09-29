import { describe, expect, it } from 'vitest';
import { handle, type Env } from './index.ts';

// A stand-in for the static-assets binding: these paths exist, everything else is the 404 page.
const FILES: Record<string, string> = {
  '/investors/reports': 'reports',
  '/filtered/reports/year-2022': 'reports 2022',
  '/filtered/reports/unavailable': 'reports unavailable',
  '/404': 'not found page',
};
const requested: string[] = [];
const env: Env = {
  ASSETS: {
    async fetch(request) {
      const { pathname } = new URL(request.url);
      requested.push(pathname);
      const body = FILES[pathname];
      return body === undefined
        ? new Response(FILES['/404'], { status: 404 })
        : new Response(body, { status: 200, headers: { 'Content-Type': 'text/html' } });
    },
  },
};
const get = (path: string, method = 'GET') =>
  handle(new Request(new URL(path, 'https://auburnresources.com.au'), { method }), env);

describe('Worker responses', () => {
  it('serves a valid filter with 200 and noindex', async () => {
    const response = await get('/investors/reports?year=2022');
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('reports 2022');
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
    expect(response.headers.get('Content-Type')).toBe('text/html');
  });

  it('serves the unavailable page with 404 for a well-formed filter that was not built', async () => {
    const response = await get('/investors/reports?year=1999');
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('reports unavailable');
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
  });

  it('serves the unavailable page with 400 for a malformed filter', async () => {
    const response = await get('/investors/reports?year=nope');
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('reports unavailable');
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
  });

  it('answers direct requests for internal filter pages with 404', async () => {
    const response = await get('/filtered/reports/year-2022');
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('not found page');
  });

  it('marks query-string variants of a listing noindex but leaves the canonical URL alone', async () => {
    const variant = await get('/investors/reports?utm_source=newsletter');
    expect(variant.status).toBe(200);
    expect(variant.headers.get('X-Robots-Tag')).toBe('noindex');
    const canonical = await get('/investors/reports');
    expect(canonical.status).toBe(200);
    expect(canonical.headers.get('X-Robots-Tag')).toBeNull();
  });

  it('never redirects', async () => {
    for (const path of [
      '/investors/reports?year=2022',
      '/investors/reports?year=//evil.example',
      '/filtered/x',
    ]) {
      const response = await get(path);
      expect(response.status >= 300 && response.status < 400, path).toBe(false);
      expect(response.headers.get('Location')).toBeNull();
    }
  });

  it('only ever fetches known asset paths', async () => {
    requested.length = 0;
    await get('/investors/reports?type=%2F..%2F..%2Fsecret');
    await get('/investors/announcements?year=2021/../../x');
    expect(
      requested.every((path) =>
        /^\/(filtered\/[a-z]+\/[a-z0-9-]+|404|investors\/[a-z]+)$/.test(path),
      ),
    ).toBe(true);
  });
});
