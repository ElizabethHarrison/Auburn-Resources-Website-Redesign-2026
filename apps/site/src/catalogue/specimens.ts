/**
 * CATALOGUE SPECIMENS — design-review data only. NOT company facts.
 *
 * The catalogue needs some content in the `approved` state to show what production rendering looks
 * like. Company fixtures may never be approved (CLAUDE.md §2.1), so these specimens are deliberately
 * artificial: every label says "Specimen", no value refers to Auburn, a project, a person or a
 * document, and the source is a specimen record.
 *
 * Safeguards: this module may only be imported from src/catalogue (unit test), the catalogue route
 * exists only in preview builds (astro.config.ts), and CI fails if "Specimen" appears in production
 * output.
 */
import type { Fact, Interpretation, IsoDate, Narrative } from '~/lib/facts';
import type { DocumentRecord, Person, Project } from '~/lib/content/types';
import type { Milestone } from '~/components/patterns/MilestoneTrack.astro';

const SPECIMEN_DATE: IsoDate = '2026-09-29';
export const SPECIMEN_SOURCE_ID = 'specimen-source';

function specimenFact<T>(value: T, extra: { unit?: string; qualifier?: string } = {}): Fact<T> {
  return {
    kind: 'fact',
    value,
    ...extra,
    meta: {
      sourceDocument: { documentId: SPECIMEN_SOURCE_ID },
      asAt: SPECIMEN_DATE,
      status: 'approved',
    },
  };
}

function specimenText(text: string): Interpretation {
  return {
    kind: 'interpretation',
    text,
    sources: [{ documentId: SPECIMEN_SOURCE_ID }],
    status: 'approved',
    asAt: SPECIMEN_DATE,
  };
}

const specimenNarrative = (text: string): Narrative => ({
  kind: 'narrative',
  text,
  status: 'approved',
});

export const specimenSource: DocumentRecord = {
  id: SPECIMEN_SOURCE_ID,
  slug: 'catalogue-specimen-source',
  title: 'Catalogue specimen source',
  docType: 'other',
  releaseAt: specimenFact(SPECIMEN_DATE),
  status: 'approved',
  internal: true,
  file: specimenFact('specimen.pdf'),
  projectIds: [],
};

export const specimenFacts = {
  number: specimenFact(12345, { unit: 'm' }),
  percent: specimenFact(50, { unit: '%' }),
  qualified: specimenFact(1000, { unit: 'km²', qualifier: 'over' }),
  text: specimenFact('Specimen value'),
  date: specimenFact(SPECIMEN_DATE),
  year: specimenFact(2026),
};

export const specimenDocument: DocumentRecord = {
  id: 'specimen-document',
  slug: '2026-09-29-specimen-announcement',
  ref: specimenFact('SPEC-0001'),
  title: 'Specimen announcement (catalogue only — not a company document)',
  docType: 'announcement',
  releaseAt: specimenFact(SPECIMEN_DATE),
  status: 'approved',
  internal: false,
  file: specimenFact('specimen.pdf'),
  projectIds: [],
};

export const specimenPerson: Person = {
  id: 'specimen-person',
  name: 'Specimen Person',
  group: 'board',
  role: specimenFact('Specimen role'),
  bio: specimenText(
    'Specimen biography text, standing in for an approved biography so the card can be reviewed in its production state.',
  ),
  qualifications: specimenFact('Specimen qualifications'),
  portrait: { kind: 'inputNeeded', brief: 'Portrait' },
};

export const specimenProject: Project = {
  id: 'specimen-project',
  name: 'Specimen Sheet',
  slug: 'specimen-sheet',
  sheetNumber: '02.0',
  holding: specimenFact('active' as const),
  state: specimenFact('QLD' as const),
  commodities: specimenFact(['zinc', 'copper'] as const),
  stage: specimenFact('targetGeneration' as const),
  areaKm2: specimenFact(1000, { unit: 'km²' }),
  ownership: { kind: 'inputNeeded', brief: 'Ownership' },
  heroThesis: specimenNarrative('Specimen one-line thesis for layout review, without digits.'),
  geologySummary: { kind: 'inputNeeded', brief: 'Geology summary' },
  statements: [],
  tenements: { kind: 'inputNeeded', brief: 'Tenements' },
  asAt: specimenFact(SPECIMEN_DATE),
  setting: {
    neighbouringDeposits: { kind: 'inputNeeded', brief: 'Neighbouring deposits' },
    nearestTown: specimenFact('Specimen town'),
    access: specimenFact('Specimen access'),
    infrastructure: { kind: 'inputNeeded', brief: 'Infrastructure' },
    traditionalOwners: { kind: 'inputNeeded', brief: 'Traditional Owners (with consent)' },
  },
  heroPhoto: { kind: 'inputNeeded', brief: 'Hero photograph' },
  settingMap: { kind: 'inputNeeded', brief: 'Setting map' },
  sectionFigure: { kind: 'inputNeeded', brief: 'Section' },
  photos: [],
  cpStatement: { kind: 'inputNeeded', brief: 'Competent person statement' },
};

export const specimenMilestones: readonly Milestone[] = [
  { title: 'Specimen milestone A', state: 'done', when: specimenFact('Q1 2026') },
  { title: 'Specimen milestone B', state: 'done', when: specimenFact('Q2 2026') },
  { title: 'Specimen milestone C', state: 'next', when: specimenFact('Q3 2026') },
  {
    title: 'Specimen milestone D',
    state: 'planned',
    when: { kind: 'inputNeeded', brief: 'Quarter' },
  },
];

export const specimenCompliance: Interpretation = specimenText(
  'Specimen text standing in for the competent person statement. The real statement must be supplied by the company and approved by the competent person; it is never drafted by the web team.',
);
