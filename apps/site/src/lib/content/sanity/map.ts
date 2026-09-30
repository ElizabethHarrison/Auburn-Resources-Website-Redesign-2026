/**
 * Sanity documents → the site's content types (D-024). Pure: no network, no environment. The adapter and the tests
 * call `mapContent` with raw documents (from the live API or an NDJSON snapshot) that have already had the build's
 * perspective applied.
 *
 * Fail closed (D-024 §4, D-027):
 * - A value without complete provenance (resolvable source document, as-at date, status) never becomes a Fact: it
 *   maps to INPUT NEEDED (a preview placeholder; hidden in production).
 * - `approved` is accepted only with an approver who may approve this kind of content (`corporate` / `technical`),
 *   an approval date and, for facts and interpretation, complete provenance. Otherwise it is downgraded to
 *   `toVerify` and recorded as an error (production builds then fail — see adapter.ts).
 * - Held-back wording anywhere is fatal in every mode.
 * - Approved Narrative with digits is downgraded and recorded as an error.
 * - Passed review-by dates are warnings only (D-026).
 *
 * `Fact` / `isRenderable()` remain the final gate at render time; nothing here makes content renderable that the
 * existing rules would hide.
 */
import { createImageUrlBuilder } from '@sanity/image-url';
import {
  hasDigits,
  inputNeeded,
  isReviewOverdue,
  type ContentMode,
  type ContentStatus,
  type Fact,
  type FactMeta,
  type FactSlot,
  type InputNeeded,
  type Interpretation,
  type InterpretationSlot,
  type IsoDate,
  type Narrative,
  type NarrativeSlot,
} from '../../facts';
import { isIsoDate } from '../../dates';
import { findHeldBack } from '../held-back';
import type {
  ApproverKind,
  Article,
  AustralianState,
  Commodity,
  DocType,
  DocumentRecord,
  FigureRecord,
  FigureSlot,
  FigureType,
  HomePageContent,
  KeyFacts,
  LegalPageContent,
  LegalPageKey,
  Ownership,
  PageContent,
  PageKey,
  PageSection,
  Person,
  PhotoRecord,
  PhotoSlot,
  PortfolioPageContent,
  PostalAddress,
  Project,
  ProjectHolding,
  ProjectMilestone,
  ProjectSetting,
  ProjectStage,
  Prospect,
  ResourceEstimate,
  ResultRecord,
  SheetNumber,
  SiteSettings,
  TextSlot,
  WorkItem,
} from '../types';
import { IssueLog } from './issues';
import { SINGLETON_IDS, legalPageId, pageId } from './ids';
import type { RawDocument } from './perspective';
import type * as S from './sanity.types';

export interface MappedContent {
  readonly siteSettings: SiteSettings;
  readonly people: readonly Person[];
  readonly projects: readonly Project[];
  readonly documents: readonly DocumentRecord[];
  readonly workItems: readonly WorkItem[];
  readonly articles: readonly Article[];
  readonly homePage: HomePageContent;
  readonly portfolioPage: PortfolioPageContent;
  readonly prospects: readonly Prospect[];
  readonly resourceEstimates: readonly ResourceEstimate[];
  readonly results: readonly ResultRecord[];
  readonly milestones: readonly ProjectMilestone[];
  readonly pages: Readonly<Record<PageKey, PageContent>>;
  readonly legalPages: Readonly<Record<LegalPageKey, LegalPageContent>>;
}

export interface MapOptions {
  readonly mode: ContentMode;
  /** Build date, for review-by warnings (D-026). */
  readonly today: IsoDate;
  /** Image CDN coordinates; without them no figure can be delivered (and none may be approved). */
  readonly images?: { readonly projectId: string; readonly dataset: string } | undefined;
}

// ── Value guards (a CMS value must have the shape the type promises) ─────────────────────────────────

type Guard<T> = (value: unknown) => value is T;

const isString: Guard<string> = (value): value is string =>
  typeof value === 'string' && value.length > 0;
const isNumber: Guard<number> = (value): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isBoolean: Guard<boolean> = (value): value is boolean => typeof value === 'boolean';
const isDate: Guard<IsoDate> = (value): value is IsoDate =>
  typeof value === 'string' && isIsoDate(value);
const isStringList: Guard<readonly string[]> = (value): value is readonly string[] =>
  Array.isArray(value) && value.length > 0 && value.every(isString);
const oneOf =
  <T extends string>(values: readonly T[]): Guard<T> =>
  (value): value is T =>
    typeof value === 'string' && (values as readonly string[]).includes(value);
const listOf =
  <T extends string>(values: readonly T[]): Guard<readonly T[]> =>
  (value): value is readonly T[] =>
    Array.isArray(value) && value.length > 0 && value.every(oneOf(values));
const isAddress: Guard<PostalAddress> = (value): value is PostalAddress =>
  typeof value === 'object' && value !== null && isStringList((value as { lines?: unknown }).lines);
const isOwnership: Guard<Ownership> = (value): value is Ownership => {
  if (typeof value !== 'object' || value === null) return false;
  const { holder, percent } = value as { holder?: unknown; percent?: unknown };
  return isString(holder) && isNumber(percent);
};

const COMMODITIES: readonly Commodity[] = [
  'zinc',
  'lead',
  'copper',
  'gold',
  'molybdenum',
  'nickel',
  'base metals',
];
const STATES: readonly AustralianState[] = ['QLD', 'NT'];
const HOLDINGS: readonly ProjectHolding[] = ['active', 'underReview', 'noLongerHeld'];
const STAGES: readonly ProjectStage[] = [
  'targetGeneration',
  'drillReady',
  'drilling',
  'resourceDefinition',
];
const STATUSES: readonly ContentStatus[] = ['draft', 'toVerify', 'approved', 'superseded'];
const DOC_TYPES: readonly DocType[] = [
  'announcement',
  'quarterly',
  'halfYear',
  'annual',
  'presentation',
  'policy',
  'notice',
  'sourceCapture',
  'thirdParty',
  'other',
];

const hasValue = (value: unknown): boolean =>
  value !== undefined &&
  value !== null &&
  value !== '' &&
  !(Array.isArray(value) && value.length === 0);

/** Copy only defined optional properties (exactOptionalPropertyTypes). */
function defined<T extends object>(value: T): { [K in keyof T]: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as {
    [K in keyof T]: Exclude<T[K], undefined>;
  };
}

// ── Mapping context ───────────────────────────────────────────────────────────────────────────────────

interface Where {
  readonly id: string;
  readonly path: string;
}

type RefLike = { readonly _ref?: string } | undefined;

class Mapper {
  readonly issues = new IssueLog();
  private readonly documentIds: Set<string>;
  private readonly people: Map<string, S.Person>;
  private readonly figures: Map<string, S.Figure>;
  private readonly photos: Map<string, S.Photo>;
  private readonly imageUrl: ReturnType<typeof createImageUrlBuilder> | undefined;

  constructor(
    private readonly docs: readonly RawDocument[],
    private readonly options: MapOptions,
  ) {
    this.documentIds = new Set(this.all<S.DocumentRecord>('documentRecord').map((doc) => doc._id));
    this.people = new Map(this.all<S.Person>('person').map((doc) => [doc._id, doc]));
    this.figures = new Map(this.all<S.Figure>('figure').map((doc) => [doc._id, doc]));
    this.photos = new Map(this.all<S.Photo>('photo').map((doc) => [doc._id, doc]));
    this.imageUrl = options.images ? createImageUrlBuilder(options.images) : undefined;
  }

  /** Documents of a type, in editorial order (then by ID, so output is deterministic). */
  all<T extends { _id: string }>(type: string): T[] {
    return (
      this.docs.filter((doc) => doc._type === type) as unknown as (T & { order?: number })[]
    ).sort(
      (a, b) =>
        (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) ||
        a._id.localeCompare(b._id),
    );
  }

  byId<T>(id: string): T | undefined {
    return this.docs.find((doc) => doc._id === id) as T | undefined;
  }

  // ── Checks ──

  heldBack(text: unknown, where: Where): void {
    const texts =
      typeof text === 'string'
        ? [text]
        : Array.isArray(text)
          ? text.filter((t) => typeof t === 'string')
          : [];
    for (const value of texts as string[]) {
      const hit = findHeldBack(value);
      if (hit)
        this.issues.add(
          'fatal',
          where.id,
          where.path,
          `held-back or banned wording (${hit.source})`,
        );
    }
  }

  /** Why an approval cannot be accepted, or an empty list. */
  private approvalProblems(
    approvedBy: RefLike,
    approvedAt: string | undefined,
    kind: ApproverKind,
  ): string[] {
    const problems: string[] = [];
    const personId = approvedBy?._ref;
    const person = personId ? this.people.get(personId) : undefined;
    if (!personId) problems.push('no approver');
    else if (!person) problems.push(`approver ${personId} not found`);
    else if (!(person.approverFor ?? []).includes(kind))
      problems.push(`approver ${personId} may not approve ${kind} content`);
    if (!approvedAt) problems.push('no approval date');
    return problems;
  }

  /** A record-level or item status; `approved` survives only with a valid approval. */
  status(
    raw: { status?: string; approvedBy?: RefLike; approvedAt?: string } | undefined,
    kind: ApproverKind,
    where: Where,
    extra: readonly string[] = [],
  ): ContentStatus {
    const value = raw?.status;
    if (!oneOf(STATUSES)(value)) {
      if (value !== undefined)
        this.issues.add(
          'warning',
          where.id,
          where.path,
          `unknown status "${String(value)}"; treated as draft`,
        );
      return 'draft';
    }
    if (value !== 'approved') return value;
    const problems = [...extra, ...this.approvalProblems(raw?.approvedBy, raw?.approvedAt, kind)];
    if (problems.length === 0) return 'approved';
    this.issues.add(
      'error',
      where.id,
      where.path,
      `approval rejected (${problems.join('; ')}); treated as to verify`,
    );
    return 'toVerify';
  }

  private ref(value: RefLike, known: Set<string>): string | undefined {
    const id = value?._ref;
    return id && known.has(id) ? id : undefined;
  }

  private review(meta: FactMeta, where: Where): void {
    if (meta.status === 'approved' && isReviewOverdue(meta, this.options.today)) {
      this.issues.add(
        'warning',
        where.id,
        where.path,
        `review overdue (review by ${meta.reviewBy ?? 'as-at + 12 months'})`,
      );
    }
  }

  // ── Content classes ──

  fact<T>(
    raw:
      | { value?: unknown; unit?: string; qualifier?: string; brief?: string; meta?: S.FactMeta }
      | undefined,
    guard: Guard<T>,
    kind: ApproverKind,
    where: Where,
    defaultBrief: string,
  ): FactSlot<T> {
    const brief = raw?.brief ?? defaultBrief;
    if (!raw || !hasValue(raw.value)) return inputNeeded(brief);
    this.heldBack(raw.value, where);
    const meta = raw.meta;
    const claimsApproval = meta?.status === 'approved';
    if (!guard(raw.value)) {
      this.issues.add(
        claimsApproval ? 'error' : 'warning',
        where.id,
        where.path,
        'value has the wrong shape',
      );
      return inputNeeded(`${brief} (value in the CMS is malformed)`);
    }
    const sourceId = this.ref(meta?.sourceDocument, this.documentIds);
    const asAt = meta?.asAt;
    if (!sourceId || !asAt || !isDate(asAt)) {
      this.issues.add(
        claimsApproval ? 'error' : 'warning',
        where.id,
        where.path,
        'provenance incomplete (resolvable source document and as-at date required)',
      );
      return inputNeeded(`${brief} (provenance incomplete in the CMS)`);
    }
    const status = this.status(meta, kind, where);
    const factMeta: FactMeta = {
      sourceDocument: { documentId: sourceId },
      asAt,
      status,
      ...defined({
        approvedBy:
          status === 'approved' && meta?.approvedBy?._ref
            ? { personId: meta.approvedBy._ref }
            : undefined,
        approvedAt: status === 'approved' ? meta?.approvedAt : undefined,
        reviewBy: meta?.reviewBy && isDate(meta.reviewBy) ? meta.reviewBy : undefined,
        note: meta?.note,
      }),
    };
    this.review(factMeta, where);
    const fact: Fact<T> = {
      kind: 'fact',
      value: raw.value,
      ...defined({ unit: raw.unit, qualifier: raw.qualifier }),
      meta: factMeta,
    };
    return fact;
  }

  optionalFact<T>(
    raw: Parameters<Mapper['fact']>[0],
    guard: Guard<T>,
    kind: ApproverKind,
    where: Where,
    defaultBrief: string,
  ): FactSlot<T> | undefined {
    return raw === undefined ? undefined : this.fact(raw, guard, kind, where, defaultBrief);
  }

  interpretation(
    raw: S.Interpretation | undefined,
    kind: ApproverKind,
    where: Where,
    defaultBrief: string,
  ): InterpretationSlot {
    const brief = raw?.brief ?? defaultBrief;
    if (!raw?.text) return inputNeeded(brief);
    this.heldBack(raw.text, where);
    const sources = (raw.sources ?? []).map((source) => this.ref(source, this.documentIds));
    const resolved = sources.filter((id): id is string => id !== undefined);
    const claimsApproval = raw.status === 'approved';
    if (
      resolved.length === 0 ||
      resolved.length !== sources.length ||
      !raw.asAt ||
      !isDate(raw.asAt)
    ) {
      this.issues.add(
        claimsApproval ? 'error' : 'warning',
        where.id,
        where.path,
        'provenance incomplete (resolvable sources and as-at date required)',
      );
      return inputNeeded(`${brief} (provenance incomplete in the CMS)`);
    }
    // Interpretation is approved by its reviewer (competent person or company secretary).
    const status = this.status(
      {
        ...(raw.status === undefined ? {} : { status: raw.status }),
        approvedBy: raw.reviewedBy,
        approvedAt: raw.asAt,
      },
      kind,
      where,
    );
    const [first, ...rest] = resolved as [string, ...string[]];
    const interpretation: Interpretation = {
      kind: 'interpretation',
      text: raw.text,
      sources: [{ documentId: first }, ...rest.map((documentId) => ({ documentId }))],
      status,
      asAt: raw.asAt,
      ...defined({
        reviewedBy:
          status === 'approved' && raw.reviewedBy?._ref
            ? { personId: raw.reviewedBy._ref }
            : undefined,
        note: raw.note,
      }),
    };
    return interpretation;
  }

  narrative(
    raw: S.Narrative | undefined,
    where: Where,
    defaultBrief: string,
    maxChars?: number,
  ): NarrativeSlot {
    const brief = raw?.brief ?? defaultBrief;
    if (!raw?.text) return inputNeeded(brief);
    this.heldBack(raw.text, where);
    const problems = [
      ...(hasDigits(raw.text) ? ['contains digits'] : []),
      ...(maxChars !== undefined && [...raw.text].length > maxChars
        ? [`longer than ${maxChars} characters`]
        : []),
    ];
    const status = this.status(raw, 'corporate', where, problems);
    if (problems.length > 0 && status !== 'approved') {
      this.issues.add('warning', where.id, where.path, `narrative ${problems.join(', ')}`);
    }
    const narrative: Narrative = { kind: 'narrative', text: raw.text, status };
    return narrative;
  }

  textSlot(
    raw: (S.Narrative | S.Interpretation) | undefined,
    kind: ApproverKind,
    where: Where,
    defaultBrief: string,
  ): TextSlot {
    return raw?._type === 'interpretation'
      ? this.interpretation(raw, kind, where, defaultBrief)
      : this.narrative(raw as S.Narrative | undefined, where, defaultBrief);
  }

  // ── Figures and photographs ──

  private figureRecord(
    raw: S.Figure | S.Photo,
    figureType: FigureType,
    where: Where,
  ): FigureRecord | undefined {
    const assetRef = raw.image?.asset?._ref;
    const dimensions = assetRef ? /^image-[a-zA-Z0-9]+-(\d+)x(\d+)-[a-z]+$/.exec(assetRef) : null;
    const kind: ApproverKind =
      figureType === 'photo' || figureType === 'other' ? 'corporate' : 'technical';
    if (
      !raw.image ||
      !dimensions ||
      !this.imageUrl ||
      !raw.caption ||
      !raw.alt ||
      !raw.source ||
      !raw.date ||
      !isDate(raw.date)
    ) {
      this.issues.add(
        raw.status === 'approved' ? 'error' : 'warning',
        where.id,
        where.path,
        'figure incomplete (image, caption, alt, source and date required, and image delivery configured)',
      );
      return undefined;
    }
    for (const text of [raw.caption, raw.alt, raw.longDescription, raw.source])
      this.heldBack(text, where);
    return {
      kind: 'figure',
      id: raw._id,
      figureType,
      src: this.imageUrl.image(raw.image).auto('format').url(),
      width: Number(dimensions[1]),
      height: Number(dimensions[2]),
      caption: raw.caption,
      alt: raw.alt,
      ...defined({ longDescription: raw.longDescription }),
      source: raw.source,
      date: raw.date,
      status: this.status(raw, kind, where),
    };
  }

  figureSlot(raw: S.FigureSlot | undefined, where: Where, defaultBrief: string): FigureSlot {
    const brief = raw?.brief ?? defaultBrief;
    const figure = raw?.figure?._ref ? this.figures.get(raw.figure._ref) : undefined;
    if (!figure) return inputNeeded(brief);
    const type: FigureType = oneOf<FigureType>(['map', 'section', 'geophysics', 'other'])(
      figure.figureType,
    )
      ? figure.figureType
      : 'other';
    return (
      this.figureRecord(figure, type, { id: figure._id, path: where.path }) ??
      inputNeeded(`${brief} (figure incomplete in the CMS)`)
    );
  }

  photoSlot(raw: S.PhotoSlot | undefined, where: Where, defaultBrief: string): PhotoSlot {
    const brief = raw?.brief ?? defaultBrief;
    const photo = raw?.photo?._ref ? this.photos.get(raw.photo._ref) : undefined;
    if (!photo) return inputNeeded(brief);
    const record = this.figureRecord(photo, 'photo', { id: photo._id, path: where.path });
    if (!record || !photo.place || !photo.photographer || !photo.consentNote) {
      return inputNeeded(
        `${brief} (photograph incomplete in the CMS: place, photographer and consent required)`,
      );
    }
    const result: PhotoRecord = {
      ...record,
      figureType: 'photo',
      place: photo.place,
      photographer: photo.photographer,
      consentNote: photo.consentNote,
    };
    return result;
  }
}

// ── Records ───────────────────────────────────────────────────────────────────────────────────────────

const refId = (value: RefLike): string | undefined => value?._ref;

function requireString(
  mapper: Mapper,
  value: string | undefined,
  where: Where,
): string | undefined {
  if (value) return value;
  mapper.issues.add('error', where.id, where.path, 'required field missing; record skipped');
  return undefined;
}

function mapSiteSettings(m: Mapper): SiteSettings {
  const raw = m.byId<S.SiteSettings>(SINGLETON_IDS.siteSettings);
  const at = (path: string): Where => ({ id: SINGLETON_IDS.siteSettings, path });
  const k = raw?.keyFacts;
  const keyFacts: KeyFacts = {
    projectCount: m.fact(
      k?.projectCount,
      isNumber,
      'corporate',
      at('keyFacts.projectCount'),
      'Number of projects',
    ),
    flagshipCount: m.fact(
      k?.flagshipCount,
      isNumber,
      'corporate',
      at('keyFacts.flagshipCount'),
      'Number of flagship projects',
    ),
    groundHeld: m.fact(
      k?.groundHeld,
      isNumber,
      'corporate',
      at('keyFacts.groundHeld'),
      'Ground held (km²)',
    ),
    commodities: m.fact(
      k?.commodities,
      listOf(COMMODITIES),
      'corporate',
      at('keyFacts.commodities'),
      'Commodities',
    ),
    jurisdictions: m.fact(
      k?.jurisdictions,
      listOf(STATES),
      'corporate',
      at('keyFacts.jurisdictions'),
      'Jurisdictions',
    ),
    companyStatus: m.fact(
      k?.companyStatus,
      isString,
      'corporate',
      at('keyFacts.companyStatus'),
      'Company status',
    ),
    dgrHolding: m.fact(
      k?.dgrHolding,
      isNumber,
      'corporate',
      at('keyFacts.dgrHolding'),
      'DGR Global holding',
    ),
    sharesOnIssue: m.fact(
      k?.sharesOnIssue,
      isNumber,
      'corporate',
      at('keyFacts.sharesOnIssue'),
      'Shares on issue',
    ),
    ipoStatus: m.fact(k?.ipoStatus, isString, 'corporate', at('keyFacts.ipoStatus'), 'IPO status'),
  };
  return {
    legalName: m.fact(raw?.legalName, isString, 'corporate', at('legalName'), 'Legal name'),
    companyType: m.fact(raw?.companyType, isString, 'corporate', at('companyType'), 'Company type'),
    acn: m.fact(raw?.acn, isString, 'corporate', at('acn'), 'ACN'),
    abn: m.fact(raw?.abn, isString, 'corporate', at('abn'), 'ABN'),
    phone: m.fact(raw?.phone, isString, 'corporate', at('phone'), 'Phone'),
    email: m.fact(raw?.email, isString, 'corporate', at('email'), 'Email'),
    streetAddress: m.fact(
      raw?.streetAddress,
      isAddress,
      'corporate',
      at('streetAddress'),
      'Street address',
    ),
    postalAddress: m.fact(
      raw?.postalAddress,
      isAddress,
      'corporate',
      at('postalAddress'),
      'Postal address',
    ),
    socialProfiles: m.fact(
      raw?.socialProfiles,
      isStringList,
      'corporate',
      at('socialProfiles'),
      'Social profiles',
    ),
    acknowledgementOfCountry: m.narrative(
      raw?.acknowledgementOfCountry,
      at('acknowledgementOfCountry'),
      'Acknowledgement of Country (Q-26)',
    ),
    keyFacts,
  };
}

function mapPeople(m: Mapper): Person[] {
  return m.all<S.Person>('person').flatMap((raw) => {
    const at = (path: string): Where => ({ id: raw._id, path });
    const name = requireString(m, raw.name, at('name'));
    if (!name || (raw.group !== 'board' && raw.group !== 'management')) return [];
    const approverFor = (raw.approverFor ?? []).filter(
      oneOf<ApproverKind>(['corporate', 'technical']),
    );
    const person: Person = {
      id: raw._id,
      name,
      group: raw.group,
      role: m.fact(raw.role, isString, 'corporate', at('role'), 'Role'),
      bio: m.interpretation(raw.bio, 'corporate', at('bio'), 'Biography'),
      qualifications: m.fact(
        raw.qualifications,
        isString,
        'corporate',
        at('qualifications'),
        'Qualifications',
      ),
      portrait: m.fact(raw.portrait, isString, 'corporate', at('portrait'), 'Portrait'),
      ...defined({
        cpMembership: m.optionalFact(
          raw.cpMembership,
          isString,
          'technical',
          at('cpMembership'),
          'Competent person membership',
        ),
        cpConsent: m.optionalFact(
          raw.cpConsent,
          isBoolean,
          'technical',
          at('cpConsent'),
          'Competent person consent',
        ),
        approverFor: approverFor.length > 0 ? approverFor : undefined,
      }),
    };
    return [person];
  });
}

function mapDocuments(m: Mapper): DocumentRecord[] {
  return m.all<S.DocumentRecord>('documentRecord').flatMap((raw) => {
    const at = (path: string): Where => ({ id: raw._id, path });
    const title = requireString(m, raw.title, at('title'));
    const slug = requireString(m, raw.slug?.current, at('slug'));
    if (!title || !slug || !oneOf(DOC_TYPES)(raw.docType)) return [];
    const record: DocumentRecord = {
      id: raw._id,
      slug,
      title,
      docType: raw.docType,
      releaseAt: m.fact(raw.releaseAt, isDate, 'corporate', at('releaseAt'), 'Release date'),
      status: m.status(raw, 'corporate', at('status')),
      internal: raw.internal === true,
      file: m.fact(raw.file, isString, 'corporate', at('file'), 'Re-hosted PDF'),
      projectIds: (raw.projects ?? []).map(refId).filter((id): id is string => id !== undefined),
      ...defined({
        ref: m.optionalFact(raw.ref, isString, 'corporate', at('ref'), 'Document reference'),
        summary:
          raw.summary === undefined
            ? undefined
            : m.narrative(raw.summary, at('summary'), 'Plain-language summary'),
        externalUrl: raw.externalUrl,
        legacyPath: raw.legacyPath,
        note: raw.note,
      }),
    };
    m.heldBack(title, at('title'));
    return [record];
  });
}

function mapSetting(m: Mapper, raw: S.ProjectSetting | undefined, id: string): ProjectSetting {
  const at = (path: string): Where => ({ id, path: `setting.${path}` });
  return {
    neighbouringDeposits: m.fact(
      raw?.neighbouringDeposits,
      isString,
      'technical',
      at('neighbouringDeposits'),
      'Neighbouring deposits, each with a source',
    ),
    nearestTown: m.fact(
      raw?.nearestTown,
      isString,
      'corporate',
      at('nearestTown'),
      'Nearest town and distance',
    ),
    access: m.fact(raw?.access, isString, 'corporate', at('access'), 'Access'),
    infrastructure: m.fact(
      raw?.infrastructure,
      isString,
      'corporate',
      at('infrastructure'),
      'Infrastructure',
    ),
    traditionalOwners: m.fact(
      raw?.traditionalOwners,
      isString,
      'corporate',
      at('traditionalOwners'),
      'Traditional Owners: named only with their consent',
    ),
  };
}

function mapProjects(m: Mapper): Project[] {
  return m.all<S.Project>('project').flatMap((raw) => {
    const at = (path: string): Where => ({ id: raw._id, path });
    const name = requireString(m, raw.name, at('name'));
    const slug = requireString(m, raw.slug?.current, at('slug'));
    const sheet =
      raw.sheetNumber && /^02\.\d+$/.test(raw.sheetNumber)
        ? (raw.sheetNumber as SheetNumber)
        : undefined;
    if (!name || !slug || !sheet) return [];
    if (raw.heldBackNote) m.heldBack(raw.heldBackNote, at('heldBackNote'));
    const project: Project = {
      id: raw._id,
      name,
      slug,
      sheetNumber: sheet,
      holding: m.fact(
        raw.holding,
        oneOf(HOLDINGS),
        'corporate',
        at('holding'),
        'Whether the project is still held (Q-20)',
      ),
      state: m.fact(raw.state, oneOf(STATES), 'corporate', at('state'), 'State'),
      commodities: m.fact(
        raw.commodities,
        listOf(COMMODITIES),
        'corporate',
        at('commodities'),
        'Commodities',
      ),
      stage: m.fact(
        raw.stage,
        oneOf(STAGES),
        'corporate',
        at('stage'),
        'Current exploration stage',
      ),
      areaKm2: m.fact(
        raw.areaKm2,
        isNumber,
        'corporate',
        at('areaKm2'),
        'Area in km² from the tenement schedule',
      ),
      ownership: m.fact(
        raw.ownership,
        isOwnership,
        'corporate',
        at('ownership'),
        'Holder, ownership percentage and any JV terms',
      ),
      heroThesis: m.narrative(
        raw.heroThesis,
        at('heroThesis'),
        'Hero thesis: one line, no digits',
        120,
      ),
      geologySummary: m.interpretation(
        raw.geologySummary,
        'technical',
        at('geologySummary'),
        'Geological setting, CP-approved',
      ),
      statements: (raw.statements ?? []).map((statement, index) =>
        m.interpretation(statement, 'technical', at(`statements[${index}]`), 'Technical statement'),
      ),
      tenements: m.fact(
        raw.tenements,
        isString,
        'corporate',
        at('tenements'),
        'Tenement numbers (Q-31)',
      ),
      asAt: m.fact(raw.asAt, isDate, 'corporate', at('asAt'), 'Page as-at date'),
      setting: mapSetting(m, raw.setting, raw._id),
      heroPhoto: m.photoSlot(raw.heroPhoto, at('heroPhoto'), 'Hero photograph'),
      settingMap: m.figureSlot(
        raw.settingMap,
        at('settingMap'),
        'Fig. 1 regional setting map from tenement GIS (Q-31)',
      ),
      sectionFigure: m.figureSlot(
        raw.sectionFigure,
        at('sectionFigure'),
        'Fig. 2 cross-section approved by the competent person (Q-33)',
      ),
      photos: (raw.photos ?? []).map((photo, index) =>
        m.photoSlot(photo, at(`photos[${index}]`), 'Photograph'),
      ),
      cpStatement: m.interpretation(
        raw.cpStatement,
        'technical',
        at('cpStatement'),
        'Competent person statement (Q-30)',
      ),
      ...defined({ heldBackNote: raw.heldBackNote, legacyPath: raw.legacyPath }),
    };
    return [project];
  });
}

/** Child records need a project that exists in this build. */
function projectOf(
  m: Mapper,
  raw: { _id: string; project?: RefLike },
  projects: ReadonlySet<string>,
): string | undefined {
  const id = refId(raw.project);
  if (id && projects.has(id)) return id;
  m.issues.add(
    'warning',
    raw._id,
    'project',
    'project reference missing or not published; record skipped',
  );
  return undefined;
}

function mapProjectRecords(m: Mapper, projectIds: ReadonlySet<string>) {
  const prospects = m.all<S.Prospect>('prospect').flatMap((raw): Prospect[] => {
    const projectId = projectOf(m, raw, projectIds);
    const at = (path: string): Where => ({ id: raw._id, path });
    const name = requireString(m, raw.name, at('name'));
    if (!projectId || !name) return [];
    return [
      {
        id: raw._id,
        projectId,
        name,
        summary: m.interpretation(raw.summary, 'technical', at('summary'), 'Target description'),
        targetType: m.fact(raw.targetType, isString, 'technical', at('targetType'), 'Target type'),
      },
    ];
  });
  const resourceEstimates = m
    .all<S.ResourceEstimate>('resourceEstimate')
    .flatMap((raw): ResourceEstimate[] => {
      const projectId = projectOf(m, raw, projectIds);
      const at = (path: string): Where => ({ id: raw._id, path });
      if (!projectId) return [];
      return [
        {
          id: raw._id,
          projectId,
          category: m.fact(raw.category, isString, 'technical', at('category'), 'Category'),
          tonnesMt: m.fact(raw.tonnesMt, isNumber, 'technical', at('tonnesMt'), 'Tonnes (Mt)'),
          grades: m.fact(raw.grades, isString, 'technical', at('grades'), 'Grades'),
          containedMetal: m.fact(
            raw.containedMetal,
            isString,
            'technical',
            at('containedMetal'),
            'Contained metal',
          ),
          cutOff: m.fact(raw.cutOff, isString, 'technical', at('cutOff'), 'Cut-off'),
          estimateDate: m.fact(
            raw.estimateDate,
            isDate,
            'technical',
            at('estimateDate'),
            'Estimate date',
          ),
        },
      ];
    });
  const results = m.all<S.Result>('result').flatMap((raw): ResultRecord[] => {
    const projectId = projectOf(m, raw, projectIds);
    const at = (path: string): Where => ({ id: raw._id, path });
    const reportedIn = refId(raw.reportedIn);
    const prospectName = requireString(m, raw.prospectName, at('prospectName'));
    if (!projectId || !prospectName || !reportedIn) return [];
    return [
      {
        id: raw._id,
        projectId,
        headline: m.fact(raw.headline, isString, 'technical', at('headline'), 'Result as reported'),
        holeOrSurveyId: m.fact(
          raw.holeOrSurveyId,
          isString,
          'technical',
          at('holeOrSurveyId'),
          'Hole or survey',
        ),
        prospectName,
        reportedIn: { documentId: reportedIn },
      },
    ];
  });
  const milestones = m.all<S.Milestone>('milestone').flatMap((raw): ProjectMilestone[] => {
    const projectId = projectOf(m, raw, projectIds);
    const at = (path: string): Where => ({ id: raw._id, path });
    const title = requireString(m, raw.title, at('title'));
    if (
      !projectId ||
      !title ||
      !oneOf<ProjectMilestone['state']>(['done', 'next', 'planned'])(raw.state)
    )
      return [];
    m.heldBack(title, at('title'));
    return [
      {
        id: raw._id,
        projectId,
        title,
        state: raw.state,
        when: m.fact(raw.when, isString, 'corporate', at('when'), 'Quarter or date'),
        status: m.status(raw, 'corporate', at('status')),
      },
    ];
  });
  const workItems = m.all<S.WorkItem>('workItem').flatMap((raw): WorkItem[] => {
    const projectId = projectOf(m, raw, projectIds);
    const at = (path: string): Where => ({ id: raw._id, path });
    const method = requireString(m, raw.method, at('method'));
    if (!projectId || !method) return [];
    return [
      {
        id: raw._id,
        projectId,
        method,
        quantity: m.fact(raw.quantity, isNumber, 'technical', at('quantity'), 'Quantity'),
        year: m.fact(raw.year, isNumber, 'technical', at('year'), 'Year(s) of the work'),
        operator: m.fact(
          raw.operator,
          oneOf<'auburn' | 'historic'>(['auburn', 'historic']),
          'technical',
          at('operator'),
          'Operator: Auburn or historic',
        ),
      },
    ];
  });
  return { prospects, resourceEstimates, results, milestones, workItems };
}

function mapArticles(m: Mapper): Article[] {
  return m.all<S.Article>('article').flatMap((raw): Article[] => {
    const at = (path: string): Where => ({ id: raw._id, path });
    const title = requireString(m, raw.title, at('title'));
    const slug = requireString(m, raw.slug?.current, at('slug'));
    if (!title || !slug) return [];
    m.heldBack(title, at('title'));
    return [
      {
        id: raw._id,
        slug,
        title,
        date: m.fact(raw.date, isDate, 'corporate', at('date'), 'Date'),
        lead: m.narrative(raw.lead, at('lead'), 'Lead'),
        status: m.status(raw, 'corporate', at('status')),
        projectIds: (raw.projects ?? []).map(refId).filter((id): id is string => id !== undefined),
        ...defined({ linkedDocumentId: refId(raw.linkedDocument) }),
      },
    ];
  });
}

function mapHomePage(m: Mapper): HomePageContent {
  const raw = m.byId<S.HomePage>(SINGLETON_IDS.homePage);
  const at = (path: string): Where => ({ id: SINGLETON_IDS.homePage, path });
  return {
    heroHeading: m.narrative(raw?.heroHeading, at('heroHeading'), 'Hero heading'),
    heroIntro: m.narrative(raw?.heroIntro, at('heroIntro'), 'Hero introduction'),
    portfolioMap: m.figureSlot(
      raw?.portfolioMap,
      at('portfolioMap'),
      'Fig. 1 portfolio map drawn from tenement GIS (Q-31).',
    ),
    whyHeading: m.narrative(raw?.whyHeading, at('whyHeading'), '"Why this ground" heading'),
    whyText: m.interpretation(
      raw?.whyText,
      'technical',
      at('whyText'),
      '"Why this ground" text, CP-reviewed',
    ),
    crossSection: m.figureSlot(
      raw?.crossSection,
      at('crossSection'),
      'Fig. 2 cross-section approved by the competent person (Q-33).',
    ),
    sustainabilityLine: m.narrative(
      raw?.sustainabilityLine,
      at('sustainabilityLine'),
      'Sustainability line',
    ),
  };
}

function mapPortfolioPage(m: Mapper): PortfolioPageContent {
  const raw = m.byId<S.PortfolioPage>(SINGLETON_IDS.portfolioPage);
  const at = (path: string): Where => ({ id: SINGLETON_IDS.portfolioPage, path });
  return {
    intro: m.narrative(raw?.intro, at('intro'), 'Portfolio summary'),
    portfolioMap: m.figureSlot(
      raw?.portfolioMap,
      at('portfolioMap'),
      'Fig. 1 portfolio map drawn from tenement GIS (Q-31).',
    ),
  };
}

const PAGE_KEYS: readonly PageKey[] = [
  'company',
  'leadership',
  'howWeExplore',
  'investors',
  'announcements',
  'reports',
  'presentations',
  'shareholders',
  'governance',
  'alerts',
  'sustainability',
  'community',
  'environmentSafety',
  'news',
  'media',
  'contact',
];

function mapPages(m: Mapper): Record<PageKey, PageContent> {
  return Object.fromEntries(
    PAGE_KEYS.map((key) => {
      const id = pageId(key);
      const raw = m.byId<S.Page>(id);
      const at = (path: string): Where => ({ id, path });
      const sections = (raw?.sections ?? []).flatMap((section, index): PageSection[] => {
        if (!section.sectionId || !section.heading) return [];
        m.heldBack(section.heading, at(`sections[${index}].heading`));
        return [
          {
            id: section.sectionId,
            heading: section.heading,
            paragraphs: (section.paragraphs ?? []).map((paragraph, p) =>
              m.textSlot(
                paragraph,
                'corporate',
                at(`sections[${index}].paragraphs[${p}]`),
                section.heading ?? 'Paragraph',
              ),
            ),
            ...defined({ forwardLooking: section.forwardLooking }),
          },
        ];
      });
      const page: PageContent = {
        key,
        intro: m.narrative(raw?.intro, at('intro'), 'Introduction: one paragraph, no digits'),
        sections,
      };
      return [key, page];
    }),
  ) as Record<PageKey, PageContent>;
}

function mapLegalPages(m: Mapper): Record<LegalPageKey, LegalPageContent> {
  const keys: readonly LegalPageKey[] = ['disclaimer', 'privacy', 'terms'];
  return Object.fromEntries(
    keys.map((key) => {
      const id = legalPageId(key);
      const raw = m.byId<S.LegalPage>(id);
      const at = (path: string): Where => ({ id, path });
      const clauses = (raw?.clauses ?? []).flatMap((clause, index) =>
        clause.heading
          ? [
              {
                heading: clause.heading,
                text: m.interpretation(
                  clause.text,
                  'corporate',
                  at(`clauses[${index}]`),
                  clause.heading,
                ),
              },
            ]
          : [],
      );
      const missing: InputNeeded = inputNeeded(
        raw?.clausesBrief ??
          `${key} text, supplied by the company (Q-24); not drafted by the web team`,
      );
      const page: LegalPageContent = {
        key,
        lastUpdated: m.fact(
          raw?.lastUpdated,
          isDate,
          'corporate',
          at('lastUpdated'),
          'Last-updated date of the supplied text',
        ),
        clauses: clauses.length > 0 ? clauses : missing,
      };
      return [key, page];
    }),
  ) as Record<LegalPageKey, LegalPageContent>;
}

/** Map every record. Records failing hard requirements are skipped with an issue; see `issues`. */
export function mapContent(
  docs: readonly RawDocument[],
  options: MapOptions,
): { content: MappedContent; issues: IssueLog } {
  const m = new Mapper(docs, options);
  if (!m.byId(SINGLETON_IDS.siteSettings)) {
    m.issues.add('error', SINGLETON_IDS.siteSettings, '', 'site settings document missing');
  }
  const projects = mapProjects(m);
  const records = mapProjectRecords(m, new Set(projects.map((project) => project.id)));
  const content: MappedContent = {
    siteSettings: mapSiteSettings(m),
    people: mapPeople(m),
    projects,
    documents: mapDocuments(m),
    articles: mapArticles(m),
    homePage: mapHomePage(m),
    portfolioPage: mapPortfolioPage(m),
    pages: mapPages(m),
    legalPages: mapLegalPages(m),
    ...records,
  };
  return { content, issues: m.issues };
}
