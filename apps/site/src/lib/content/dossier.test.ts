/**
 * Project dossier content integrity: which modules appear, never half-shown, never without the
 * competent-person statement where required, and related/adjacent sheets from renderable facts only.
 * Approved values here are test-local constructions — fixtures are never approved.
 */
import { describe, expect, it } from 'vitest';
import { type Fact, type Interpretation, inputNeeded } from '../facts';
import { projects } from './fixtures/data/projects';
import { prospects } from './fixtures/data/prospects';
import { workItems } from './fixtures/data/work-items';
import {
  adjacentProjects,
  isComplianceShown,
  moduleDefinitions,
  relatedProjects,
  visibleModules,
  type DossierData,
} from './dossier';
import type { FigureRecord, Project, ResourceEstimate } from './types';
import { isProjectListable, isProjectPublishable } from './visibility';

const approvedFact = <T>(value: T): Fact<T> => ({
  kind: 'fact',
  value,
  meta: { sourceDocument: { documentId: 'doc' }, asAt: '2026-09-29', status: 'approved' },
});
const approvedText = (text: string): Interpretation => ({
  kind: 'interpretation',
  text,
  sources: [{ documentId: 'doc' }],
  status: 'approved',
  asAt: '2026-09-29',
});
const approvedMap: FigureRecord = {
  kind: 'figure',
  id: 'fig',
  figureType: 'map',
  src: '/map.svg',
  width: 10,
  height: 10,
  caption: 'Caption',
  alt: 'Alt',
  source: 'Source',
  date: '2026-09-29',
  status: 'approved',
};

const nicholson = projects.find((project) => project.slug === 'nicholson') as Project;

function data(project: Project, overrides: Partial<DossierData> = {}): DossierData {
  return {
    project,
    workItems: workItems.filter((item) => item.projectId === project.id),
    prospects: prospects.filter((item) => item.projectId === project.id),
    resources: [],
    results: [],
    milestones: [],
    documents: [],
    ...overrides,
  };
}

describe('dossier modules', () => {
  it('keeps the approved module order 01–09', () => {
    expect(moduleDefinitions('X').map((module) => module.number)).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
    ]);
  });

  it('shows every module in preview, for every project', () => {
    for (const project of projects) {
      expect(visibleModules(data(project), 'preview')).toHaveLength(9);
    }
  });

  it('shows no module in production while nothing is approved (empty modules are omitted)', () => {
    for (const project of projects) {
      const modules = visibleModules(data(project), 'production');
      expect(modules).toEqual([]);
      expect(isComplianceShown(modules, data(project), 'production')).toBe(false);
    }
  });

  it('needs the approved map before module 01 appears', () => {
    const withMap = { ...nicholson, settingMap: approvedMap };
    expect(visibleModules(data(withMap), 'production').map((m) => m.id)).toEqual(['setting']);
  });

  it('never shows geology, targets, resources or results without an approved CP statement', () => {
    const technical: Project = {
      ...nicholson,
      geologySummary: approvedText('Approved summary.'),
    };
    const approvedProspects = prospects
      .slice(0, 1)
      .map((prospect) => ({ ...prospect, summary: approvedText('Approved target.') }));
    const withoutCp = data(technical, { prospects: approvedProspects });
    expect(visibleModules(withoutCp, 'production')).toEqual([]);

    const withCp = data(
      { ...technical, cpStatement: approvedText('CP statement.') },
      { prospects: approvedProspects },
    );
    const modules = visibleModules(withCp, 'production');
    expect(modules.map((m) => m.id)).toEqual(['geology', 'targets']);
    expect(isComplianceShown(modules, withCp, 'production')).toBe(true);
  });

  it('hides a resource table unless a whole row is approved (never half-shown)', () => {
    const row: ResourceEstimate = {
      id: 'r',
      projectId: nicholson.id,
      category: approvedFact('Inferred'),
      tonnesMt: approvedFact(1),
      grades: approvedFact('1% Zn'),
      containedMetal: approvedFact('1 kt Zn'),
      cutOff: inputNeeded('Cut-off'),
      estimateDate: approvedFact('2026-01-01' as const),
    };
    const project = { ...nicholson, cpStatement: approvedText('CP statement.') };
    expect(visibleModules(data(project, { resources: [row] }), 'production')).toEqual([]);
    const complete = { ...row, cutOff: approvedFact('0.5% Zn') };
    expect(
      visibleModules(data(project, { resources: [complete] }), 'production').map((m) => m.id),
    ).toEqual(['resources']);
  });
});

describe('publishing', () => {
  it('publishes no fixture project in production and every one in preview', () => {
    expect(projects.filter((project) => isProjectPublishable(project, 'production'))).toEqual([]);
    expect(projects.every((project) => isProjectPublishable(project, 'preview'))).toBe(true);
  });

  it('keeps a relinquished project published but unlisted', () => {
    const relinquished: Project = {
      ...nicholson,
      holding: approvedFact('noLongerHeld' as const),
      areaKm2: approvedFact(1),
      ownership: approvedFact({ holder: 'Holder', percent: 100 }),
    };
    expect(isProjectPublishable(relinquished, 'production')).toBe(true);
    expect(isProjectListable(relinquished, 'production')).toBe(false);
  });
});

describe('related and adjacent sheets', () => {
  it('prefers the same commodity, using only renderable facts', () => {
    const vrd = projects.find((project) => project.slug === 'victoria-river-downs') as Project;
    // Preview: Nicholson and VRD share zinc–lead (to verify, renderable in preview).
    expect(relatedProjects(nicholson, projects, 'preview')[0]?.slug).toBe(vrd.slug);
    // Production: unapproved commodities cannot influence the order — list order applies.
    expect(relatedProjects(nicholson, projects, 'production').map((p) => p.slug)).toEqual(
      projects
        .filter((p) => p.id !== nicholson.id)
        .slice(0, 3)
        .map((p) => p.slug),
    );
  });

  it('never includes the project itself and returns at most three', () => {
    for (const project of projects) {
      const related = relatedProjects(project, projects, 'preview');
      expect(related.length).toBeLessThanOrEqual(3);
      expect(related.some((p) => p.id === project.id)).toBe(false);
    }
  });

  it('wraps previous and next around the list', () => {
    const first = projects[0] as Project;
    const last = projects[projects.length - 1] as Project;
    expect(adjacentProjects(first, projects)).toEqual({ previous: last, next: projects[1] });
    expect(adjacentProjects(first, [first])).toBeUndefined();
  });
});
