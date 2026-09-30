import { describe, expect, it } from 'vitest';
import { SECURITY_HEADERS, headersFor, toCloudflareHeaders } from './index';

describe('security headers', () => {
  it('forbids framing, sniffing and plugins, and pins HTTPS for this host only (Q-48)', () => {
    expect(SECURITY_HEADERS['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    expect(SECURITY_HEADERS['Strict-Transport-Security']).toMatch(/^max-age=\d+$/);
  });

  it('adds noindex to preview only', () => {
    expect(headersFor({ preview: true })['X-Robots-Tag']).toBe('noindex');
    expect(headersFor({ preview: false })['X-Robots-Tag']).toBeUndefined();
  });

  it('writes Cloudflare _headers: every header under /*, immutable caching for /_astro/*', () => {
    const text = toCloudflareHeaders({ preview: false });
    const lines = text.split('\n');
    expect(lines[1]).toBe('/*');
    for (const [name, value] of Object.entries(SECURITY_HEADERS))
      expect(lines).toContain(`  ${name}: ${value}`);
    expect(text).toContain('/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n');
    expect(text).not.toContain('X-Robots-Tag');
    expect(toCloudflareHeaders({ preview: true })).toContain('  X-Robots-Tag: noindex\n');
  });
});
