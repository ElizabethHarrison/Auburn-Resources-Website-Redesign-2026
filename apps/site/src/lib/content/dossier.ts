/**
 * Project dossier module rules (docs/SITEMAP.md §8). One template renders every project; this module
 * decides, from data alone, which of modules 01–09 appear and in what order, so a page never shows an
 * empty heading.
 *
 * - Preview: every module appears, showing values with status or INPUT NEEDED placeholders.
 * - Production: a module appears only with approved content. Modules 02 and 04–06 (geology, resources,
 *   targets, results) also need an approved competent-person statement, and the compliance block is
 *   shown whenever any of them is.
 */
import { isRenderable, isStatusRenderable, type ContentMode } from '../facts';
import type {
  DocumentRecord,
  Project,
  ProjectMilestone,
  Prospect,
  ResourceEstimate,
  ResultRecord,
  WorkItem,
} from './types';
import { isDocumentListable, resolveFigure, resolvePhoto } from './visibility';

export type DossierModuleId =
  | 'setting'
  | 'geology'
  | 'history'
  | 'resources'
  | 'targets'
  | 'results'
  | 'photography'
  | 'milestones'
  | 'documents';

export interface DossierData {
  readonly project: Project;
  readonly workItems: readonly WorkItem[];
  readonly prospects: readonly Prospect[];
  readonly resources: readonly ResourceEstimate[];
  readonly results: readonly ResultRecord[];
  readonly milestones: readonly ProjectMilestone[];
  /** Documents tagged to the project and listable in this mode. */
  readonly documents: readonly DocumentRecord[];
}

export interface DossierModule {
  readonly id: DossierModuleId;
  readonly number: string;
  /** Short label for the strat-column index. */
  readonly label: string;
  /** Kicker, e.g. "01 — Setting". */
  readonly kicker: string;
  /** Module heading (from the approved project-page mockup). */
  readonly heading: string;
}

/** Module order and headings are approved (CLAUDE.md §9: project page module order). */
export function moduleDefinitions(projectName: string): readonly DossierModule[] {
  return [
    {
      id: 'setting',
      number: '01',
      label: 'Setting',
      kicker: '01 — Setting',
      heading: 'Where it sits',
    },
    {
      id: 'geology',
      number: '02',
      label: 'Geology',
      kicker: '02 — Geological setting',
      heading: 'Why this ground',
    },
    {
      id: 'history',
      number: '03',
      label: 'History',
      kicker: '03 — Exploration history',
      heading: 'Work to date',
    },
    {
      id: 'resources',
      number: '04',
      label: 'Resources',
      kicker: '04 — Existing resources',
      heading: 'Mineral Resources',
    },
    {
      id: 'targets',
      number: '05',
      label: 'Targets',
      kicker: '05 — Exploration targets',
      heading: 'Where we will drill',
    },
    {
      id: 'results',
      number: '06',
      label: 'Results',
      kicker: '06 — Key results',
      heading: 'Best intercepts and results',
    },
    {
      id: 'photography',
      number: '07',
      label: 'Photography',
      kicker: '07 — Photography',
      heading: 'On the ground',
    },
    {
      id: 'milestones',
      number: '08',
      label: 'Milestones',
      kicker: '08 — Milestones',
      heading: 'What happens next',
    },
    {
      id: 'documents',
      number: '09',
      label: 'Documents',
      kicker: '09 — Documents',
      heading: `${projectName} documents`,
    },
  ];
}

/** Whether technical modules (02, 04–06) may appear: they need the competent-person statement. */
export function isTechnicalAllowed(project: Project, mode: ContentMode): boolean {
  return isRenderable(project.cpStatement, mode);
}

function productionVisibility(
  data: DossierData,
  mode: ContentMode,
): Record<DossierModuleId, boolean> {
  const { project } = data;
  const technical = isTechnicalAllowed(project, mode);
  return {
    // The map is required for module 01 (SITEMAP §8).
    setting: resolveFigure(project.settingMap, mode).kind === 'figure',
    geology:
      technical &&
      (isRenderable(project.geologySummary, mode) ||
        project.statements.some((statement) => isRenderable(statement, mode))),
    history: data.workItems.some((item) => isRenderable(item.quantity, mode)),
    // Never an empty or partial table: a resource row appears only when every cell is approved.
    resources:
      technical &&
      data.resources.some((row) =>
        [
          row.category,
          row.tonnesMt,
          row.grades,
          row.containedMetal,
          row.cutOff,
          row.estimateDate,
        ].every((slot) => isRenderable(slot, mode)),
      ),
    targets: technical && data.prospects.some((prospect) => isRenderable(prospect.summary, mode)),
    results: technical && data.results.some((result) => isRenderable(result.headline, mode)),
    photography: project.photos.some((photo) => resolvePhoto(photo, mode).kind === 'figure'),
    milestones: data.milestones.some((milestone) => isStatusRenderable(milestone.status, mode)),
    documents: data.documents.length > 0,
  };
}

/** The modules to render, in approved order. */
export function visibleModules(data: DossierData, mode: ContentMode): DossierModule[] {
  const definitions = moduleDefinitions(data.project.name);
  if (mode === 'preview') return [...definitions];
  const visible = productionVisibility(data, mode);
  return definitions.filter((module) => visible[module.id]);
}

/** The compliance block is required whenever geology, resources, targets or results are shown. */
export function isComplianceShown(
  modules: readonly DossierModule[],
  data: DossierData,
  mode: ContentMode,
): boolean {
  if (mode === 'preview') return true;
  return (
    isTechnicalAllowed(data.project, mode) &&
    modules.some((module) => ['geology', 'resources', 'targets', 'results'].includes(module.id))
  );
}

/**
 * Results that may appear: a result cannot exist without the announcement that reported it, so in
 * production its reporting document must itself be listable (SITEMAP §8 module 06).
 */
export function publishableResults(
  results: readonly ResultRecord[],
  documents: readonly DocumentRecord[],
  mode: ContentMode,
): ResultRecord[] {
  if (mode === 'preview') return [...results];
  return results.filter((result) => {
    const report = documents.find((document) => document.id === result.reportedIn.documentId);
    return report !== undefined && isDocumentListable(report, mode);
  });
}

// ── Related sheets and previous / next ──────────────────────────────────────────────────────────

function renderedCommodities(project: Project, mode: ContentMode): readonly string[] {
  return project.commodities.kind === 'fact' && isRenderable(project.commodities, mode)
    ? project.commodities.value
    : [];
}

function renderedState(project: Project, mode: ContentMode): string | undefined {
  return project.state.kind === 'fact' && isRenderable(project.state, mode)
    ? project.state.value
    : undefined;
}

/**
 * Up to three related projects: same commodity first, then same state, then the rest in list order.
 * Matching uses only facts renderable in this mode, so unapproved facts never influence production.
 */
export function relatedProjects(
  project: Project,
  listed: readonly Project[],
  mode: ContentMode,
  limit = 3,
): Project[] {
  const others = listed.filter((candidate) => candidate.id !== project.id);
  const commodities = renderedCommodities(project, mode);
  const state = renderedState(project, mode);
  const score = (candidate: Project) => {
    if (renderedCommodities(candidate, mode).some((commodity) => commodities.includes(commodity)))
      return 0;
    if (state !== undefined && renderedState(candidate, mode) === state) return 1;
    return 2;
  };
  return others
    .map((candidate, index) => ({ candidate, index, score: score(candidate) }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/** Previous and next sheets in list order, wrapping around; none when the project stands alone. */
export function adjacentProjects(
  project: Project,
  listed: readonly Project[],
): { previous: Project; next: Project } | undefined {
  const index = listed.findIndex((candidate) => candidate.id === project.id);
  if (index === -1 || listed.length < 2) return undefined;
  const previous = listed[(index - 1 + listed.length) % listed.length];
  const next = listed[(index + 1) % listed.length];
  return previous && next ? { previous, next } : undefined;
}
