/**
 * Hostile and unsafe CMS content (D-024 §3–5, D-026, D-027). Starting from the migrated fixtures, each case forges or
 * breaks something an editor (or an API client bypassing Studio validation) could do. Nothing may become renderable
 * in production unless the approval is complete and made by a person allowed to approve that kind of content.
 *
 * A combined hostile snapshot (snapshot/hostile.ndjson) must also fail a production build end to end.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isRenderable } from '../../facts';
import { collectSlots, tallySlots } from '../audit';
import { createSanityAdapter, loadContent } from './adapter';
import { exportFixtures } from './export';
import { fixtureSet } from './fixture-set';
import { ContentIntegrityError } from './issues';
import { mapContent } from './map';
import { applyPerspective, type RawDocument } from './perspective';
import { parseNdjson, snapshotLoader, toNdjson } from './snapshot';

type Doc = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any -- test fixtures mutate raw JSON freely.

const today = '2026-09-29' as const;
const ref = (id: string) => ({ _type: 'reference', _ref: id });
const SYSTEM = {
  _createdAt: '2026-09-29T00:00:00Z',
  _updatedAt: '2026-09-29T00:00:00Z',
  _rev: 'test',
};

/** Test-only approvers. They exist only in these tests, never in fixtures or the CMS export. */
const approvers: Doc[] = [
  {
    _id: 'person-test-secretary',
    _type: 'person',
    ...SYSTEM,
    name: 'Test Secretary',
    group: 'management',
    approverFor: ['corporate'],
  },
  {
    _id: 'person-test-cp',
    _type: 'person',
    ...SYSTEM,
    name: 'Test Competent Person',
    group: 'management',
    approverFor: ['technical'],
  },
];

function base(): Doc[] {
  return [...(structuredClone(exportFixtures(fixtureSet)) as Doc[]), ...structuredClone(approvers)];
}
const byId = (docs: Doc[], id: string) => docs.find((doc) => doc._id === id) as Doc;
const approve = (meta: Doc, by: string, at = '2026-09-29T10:00:00Z') =>
  Object.assign(meta, { status: 'approved', approvedBy: ref(by), approvedAt: at });

function map(
  docs: Doc[],
  mode: 'production' | 'preview',
  images?: { projectId: string; dataset: string },
) {
  return mapContent(applyPerspective(docs as RawDocument[], mode), { mode, today, images });
}

describe('forged or incomplete approvals are rejected (fail closed)', () => {
  it('approved with no approver or date → downgraded, error', () => {
    const docs = base();
    byId(docs, 'siteSettings').email.meta.status = 'approved';
    const { content, issues } = map(docs, 'production');
    expect(content.siteSettings.email).toMatchObject({
      kind: 'fact',
      meta: { status: 'toVerify' },
    });
    expect(isRenderable(content.siteSettings.email, 'production')).toBe(false);
    expect(
      issues
        .of('error')
        .map((i) => i.message)
        .join(),
    ).toMatch(/no approver; no approval date/);
  });

  it('approved by someone who is not an approver → rejected', () => {
    const docs = base();
    approve(byId(docs, 'person-nicholas-mather').role.meta, 'person-brian-moller');
    const { content, issues } = map(docs, 'production');
    expect(isRenderable(content.people[0]?.role, 'production')).toBe(false);
    expect(issues.of('error')[0]?.message).toMatch(/may not approve corporate content/);
  });

  it('technical content approved by the company secretary → rejected', () => {
    const docs = base();
    const statement = byId(docs, 'project-nicholson').statements[0];
    Object.assign(statement, { status: 'approved', reviewedBy: ref('person-test-secretary') });
    const { content, issues } = map(docs, 'production');
    const mapped = content.projects.find((p) => p.id === 'project-nicholson')?.statements[0];
    expect(isRenderable(mapped, 'production')).toBe(false);
    expect(issues.of('error')[0]?.message).toMatch(/may not approve technical content/);
  });

  it('approver who does not exist → rejected', () => {
    const docs = base();
    approve(byId(docs, 'siteSettings').legalName.meta, 'person-nobody');
    const { issues } = map(docs, 'production');
    expect(issues.of('error')[0]?.message).toMatch(/approver person-nobody not found/);
  });

  it('approved record without approval metadata (document, narrative) → downgraded', () => {
    const docs = base();
    byId(docs, 'doc-2022-12-23-annual-report').status = 'approved';
    Object.assign(byId(docs, 'homePage').heroHeading, { status: 'approved' });
    const { content, issues } = map(docs, 'production');
    expect(content.documents.find((d) => d.id === 'doc-2022-12-23-annual-report')?.status).toBe(
      'toVerify',
    );
    expect(isRenderable(content.homePage.heroHeading, 'production')).toBe(false);
    expect(issues.of('error')).toHaveLength(2);
  });

  it('approved narrative containing digits → rejected even with a valid approver', () => {
    const docs = base();
    const heading = byId(docs, 'homePage').heroHeading;
    Object.assign(heading, { text: 'Ten projects over 9,300 km²' });
    approve(heading, 'person-test-secretary');
    const { content, issues } = map(docs, 'production');
    expect(isRenderable(content.homePage.heroHeading, 'production')).toBe(false);
    expect(issues.of('error')[0]?.message).toMatch(/contains digits/);
  });
});

describe('provenance', () => {
  it('a value without a source never becomes a fact', () => {
    const docs = base();
    delete byId(docs, 'siteSettings').keyFacts.projectCount.meta.sourceDocument;
    const { content } = map(docs, 'preview');
    expect(content.siteSettings.keyFacts.projectCount).toMatchObject({
      kind: 'inputNeeded',
      brief: expect.stringMatching(/provenance incomplete/),
    });
  });

  it('a source that does not resolve never becomes a fact', () => {
    const docs = base();
    byId(docs, 'siteSettings').companyType.meta.sourceDocument = ref('doc-does-not-exist');
    const { content } = map(docs, 'preview');
    expect(content.siteSettings.companyType.kind).toBe('inputNeeded');
  });

  it('a malformed value is not rendered as a fact', () => {
    const docs = base();
    byId(docs, 'project-calgoa').state.value = 'WA';
    const { content, issues } = map(docs, 'preview');
    expect(content.projects.find((p) => p.id === 'project-calgoa')?.state.kind).toBe('inputNeeded');
    expect(issues.of('warning').some((i) => i.message.includes('wrong shape'))).toBe(true);
  });
});

describe('held-back wording', () => {
  it('is fatal in every mode, even in an unapproved draft', async () => {
    const docs = base();
    byId(docs, 'homePage').heroIntro = {
      _type: 'narrative',
      text: 'Potential for 40Mt resource',
      status: 'draft',
    };
    for (const mode of ['preview', 'production'] as const) {
      await expect(
        loadContent({
          name: 't',
          load: async () => docs as RawDocument[],
          mode,
          today,
          report: () => undefined,
        }),
      ).rejects.toThrow(ContentIntegrityError);
    }
  });
});

describe('drafts and publication', () => {
  it('production never sees drafts; preview shows drafts over published', () => {
    const docs = base();
    docs.push({
      ...structuredClone(byId(docs, 'project-hawkwood')),
      _id: 'drafts.project-hawkwood',
      name: 'Hawkwood (draft)',
    });
    expect(
      map(docs, 'production').content.projects.find((p) => p.id === 'project-hawkwood')?.name,
    ).toBe('Hawkwood');
    expect(
      map(docs, 'preview').content.projects.find((p) => p.id === 'project-hawkwood')?.name,
    ).toBe('Hawkwood (draft)');
  });

  it('publication never implies approval: published unverified content renders nothing in production', () => {
    const { content } = map(base(), 'production');
    expect(tallySlots(collectSlots(content), 'production').renderable).toBe(0);
  });
});

describe('valid approvals are accepted', () => {
  it('a complete corporate approval renders in production', () => {
    const docs = base();
    approve(byId(docs, 'siteSettings').legalName.meta, 'person-test-secretary');
    const { content, issues } = map(docs, 'production');
    expect(issues.of('error')).toEqual([]);
    expect(content.siteSettings.legalName).toMatchObject({
      kind: 'fact',
      value: 'Auburn Resources Limited',
      meta: {
        status: 'approved',
        approvedBy: { personId: 'person-test-secretary' },
        approvedAt: '2026-09-29T10:00:00Z',
      },
    });
    expect(isRenderable(content.siteSettings.legalName, 'production')).toBe(true);
  });

  it('a complete technical approval by the competent person renders', () => {
    const docs = base();
    const statement = byId(docs, 'project-nicholson').statements[0];
    Object.assign(statement, { status: 'approved', reviewedBy: ref('person-test-cp') });
    const { content, issues } = map(docs, 'production');
    expect(issues.of('error')).toEqual([]);
    expect(
      isRenderable(
        content.projects.find((p) => p.id === 'project-nicholson')?.statements[0],
        'production',
      ),
    ).toBe(true);
  });

  it('an overdue review is a warning; the approved fact still renders (D-026)', () => {
    const docs = base();
    const meta = byId(docs, 'siteSettings').legalName.meta;
    approve(meta, 'person-test-secretary');
    meta.asAt = '2020-01-01';
    const { content, issues } = map(docs, 'production');
    expect(isRenderable(content.siteSettings.legalName, 'production')).toBe(true);
    expect(issues.of('warning').some((i) => i.message.startsWith('review overdue'))).toBe(true);
    expect(issues.of('error')).toEqual([]);
  });
});

describe('figures', () => {
  const figure: Doc = {
    _id: 'figure-test-map',
    _type: 'figure',
    ...SYSTEM,
    figureType: 'map',
    image: { _type: 'image', asset: ref('image-abc123-1200x800-png') },
    caption: 'Test map',
    alt: 'A test map',
    source: 'Test source',
    date: '2026-09-29',
    status: 'approved',
    approvedBy: ref('person-test-cp'),
    approvedAt: '2026-09-29T10:00:00Z',
  };

  it('an approved figure is delivered from the Sanity image CDN (asset URLs are public, D-028)', () => {
    const docs = base();
    docs.push(structuredClone(figure));
    byId(docs, 'project-nicholson').settingMap = {
      _type: 'figureSlot',
      figure: ref('figure-test-map'),
    };
    const { content } = map(docs, 'production', { projectId: 'testproj', dataset: 'staging' });
    const map_ = content.projects.find((p) => p.id === 'project-nicholson')?.settingMap;
    expect(map_).toMatchObject({ kind: 'figure', status: 'approved', width: 1200, height: 800 });
    expect(map_?.kind === 'figure' && String(map_.src)).toMatch(
      /^https:\/\/cdn\.sanity\.io\/images\/testproj\/staging\/abc123-1200x800\.png/,
    );
  });

  it('a figure approved by the company secretary (maps are technical) is not approved', () => {
    const docs = base();
    docs.push({ ...structuredClone(figure), approvedBy: ref('person-test-secretary') });
    byId(docs, 'project-nicholson').settingMap = {
      _type: 'figureSlot',
      figure: ref('figure-test-map'),
    };
    const { content } = map(docs, 'production', { projectId: 'testproj', dataset: 'staging' });
    const slot = content.projects.find((p) => p.id === 'project-nicholson')?.settingMap;
    expect(slot?.kind === 'figure' && slot.status).toBe('toVerify');
  });

  it('without image delivery configured, no figure is produced', () => {
    const docs = base();
    docs.push(structuredClone(figure));
    byId(docs, 'project-nicholson').settingMap = {
      _type: 'figureSlot',
      figure: ref('figure-test-map'),
    };
    const { content, issues } = map(docs, 'production');
    expect(content.projects.find((p) => p.id === 'project-nicholson')?.settingMap.kind).toBe(
      'inputNeeded',
    );
    expect(issues.of('error')).toHaveLength(1);
  });
});

describe('hostile snapshot, end to end', () => {
  const FILE = new URL('./snapshot/hostile.ndjson', import.meta.url);

  function hostile(): Doc[] {
    const docs = base();
    byId(docs, 'siteSettings').email.meta.status = 'approved'; // forged
    approve(byId(docs, 'person-nicholas-mather').role.meta, 'person-brian-moller'); // not an approver
    Object.assign(byId(docs, 'project-nicholson').statements[0], {
      status: 'approved',
      reviewedBy: ref('person-test-secretary'),
    }); // wrong kind
    byId(docs, 'doc-2022-12-23-annual-report').status = 'approved'; // no approval metadata
    docs.push({
      ...structuredClone(byId(docs, 'project-hawkwood')),
      _id: 'drafts.project-hawkwood',
      name: 'Hawkwood (draft)',
    });
    return docs;
  }

  it('matches the committed hostile snapshot', () => {
    const ndjson = toNdjson(hostile() as RawDocument[]);
    if (process.env.UPDATE_SNAPSHOT) writeFileSync(FILE, ndjson);
    expect(readFileSync(FILE, 'utf8')).toBe(ndjson);
  });

  it('fails a production build, listing every rejected approval', async () => {
    const adapter = createSanityAdapter({
      name: 'hostile',
      load: snapshotLoader(fileURLToPath(FILE)),
      mode: 'production',
      today,
      report: () => undefined,
    });
    const error = await adapter.getSiteSettings().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ContentIntegrityError);
    expect((error as ContentIntegrityError).issues.map((i) => i.documentId).sort()).toEqual([
      'doc-2022-12-23-annual-report',
      'person-nicholas-mather',
      'project-nicholson',
      'siteSettings',
    ]);
  });

  it('builds in preview with every forged item shown as to verify, and reports them', async () => {
    const reported: string[] = [];
    const adapter = createSanityAdapter({
      name: 'hostile',
      load: async () => parseNdjson(readFileSync(FILE, 'utf8')),
      mode: 'preview',
      today,
      report: (issues) => reported.push(...issues.map((i) => i.documentId)),
    });
    const settings = await adapter.getSiteSettings();
    expect(settings.email).toMatchObject({ meta: { status: 'toVerify' } });
    expect((await adapter.getProject('hawkwood'))?.name).toBe('Hawkwood (draft)');
    expect(reported).toContain('siteSettings');
  });
});
