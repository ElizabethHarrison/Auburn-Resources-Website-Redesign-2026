import { describe, expect, it } from 'vitest';
import { CONTENT_QUERY, CONTENT_TYPES, liveLoader, perspectiveFor } from './live';
import { applyPerspective, type RawDocument } from './perspective';
import { parseNdjson, toNdjson } from './snapshot';

const doc = (id: string, name: string): RawDocument => ({ _id: id, _type: 'project', name });

describe('perspective (D-024 §4–5)', () => {
  const docs = [
    doc('a', 'A'),
    doc('drafts.a', 'A draft'),
    doc('drafts.b', 'B draft only'),
    doc('versions.r1.a', 'A release'),
  ];

  it('production sees published documents only', () => {
    expect(applyPerspective(docs, 'production').map((d) => d.name)).toEqual(['A']);
  });

  it('preview sees drafts over published, under the published ID', () => {
    const preview = applyPerspective(docs, 'preview');
    expect(preview.map((d) => [d._id, d.name])).toEqual([
      ['a', 'A draft'],
      ['b', 'B draft only'],
    ]);
  });

  it('asks the API for the matching perspective', () => {
    expect(perspectiveFor('production')).toBe('published');
    expect(perspectiveFor('preview')).toBe('drafts');
    expect(CONTENT_QUERY).toBe('*[_type in $types]');
    expect(CONTENT_TYPES).not.toContain('sanity.imageAsset');
  });
});

describe('live loader', () => {
  it('refuses to run without full credentials (private datasets)', () => {
    expect(() =>
      liveLoader(
        { projectId: 'p', dataset: 'staging', apiVersion: '2026-09-29', token: '' },
        'production',
      ),
    ).toThrow(/SANITY_READ_TOKEN/);
  });
});

describe('NDJSON', () => {
  it('round-trips and rejects non-documents', () => {
    expect(parseNdjson(toNdjson([doc('a', 'A')]))).toEqual([doc('a', 'A')]);
    expect(() => parseNdjson('{"name":"no id"}\n')).toThrow(/not a Sanity document/);
  });
});
