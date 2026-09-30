/**
 * Typed fixtures → Sanity documents (the migration source; D-024 §8, §11–12). The output is what
 * `sanity dataset import` accepts, and what the `sanity-export` snapshot source reads.
 *
 * Rules enforced here, not just by convention:
 * - statuses are copied exactly; exporting anything `approved` is an error (approval happens only in the CMS);
 * - indicative mockup graphics (listed in `FIGURE_BRIEFS`) are never exported: their slot becomes INPUT NEEDED with
 *   the same brief production uses;
 * - no real figure or photo asset is exported (D-028) — fixtures have none, and one appearing is an error.
 */
import type { Fact, FactMeta, FactSlot, InterpretationSlot, NarrativeSlot } from '../../facts';
import type {
  Article,
  DocumentRecord,
  FigureSlot,
  HomePageContent,
  LegalPageContent,
  PageContent,
  Person,
  PhotoSlot,
  PortfolioPageContent,
  Project,
  ProjectMilestone,
  Prospect,
  ResourceEstimate,
  ResultRecord,
  SiteSettings,
  WorkItem,
} from '../types';
import { SINGLETON_IDS, legalPageId, pageId } from './ids';
import type { RawDocument } from './perspective';

export interface FixtureSet {
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
  readonly pages: Readonly<Record<string, PageContent>>;
  readonly legalPages: Readonly<Record<string, LegalPageContent>>;
  /** INPUT NEEDED briefs for indicative figures, by figure ID. */
  readonly figureBriefs: Readonly<Record<string, string>>;
}

type Json = Record<string, unknown>;

const SYSTEM = {
  _createdAt: '2026-09-29T00:00:00Z',
  _updatedAt: '2026-09-29T00:00:00Z',
  _rev: 'fixtures',
};
const ref = (id: string) => ({ _type: 'reference', _ref: id });
const keyed = <T extends Json>(items: readonly T[]) =>
  items.map((item, index) => ({ _key: `k${index}`, ...item }));

function defined(value: Json): Json {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined));
}

function refuseApproved(status: string, where: string): string {
  if (status === 'approved')
    throw new Error(`${where}: fixtures are never exported as approved (D-024 §11).`);
  return status;
}

function meta(value: FactMeta, where: string): Json {
  return defined({
    _type: 'factMeta',
    sourceDocument: ref(value.sourceDocument.documentId),
    asAt: value.asAt,
    status: refuseApproved(value.status, where),
    approvedBy: value.approvedBy ? ref(value.approvedBy.personId) : undefined,
    approvedAt: value.approvedAt,
    reviewBy: value.reviewBy,
    note: value.note,
  });
}

function fact<T>(slot: FactSlot<T>, type: string, where: string): Json {
  if (slot.kind === 'inputNeeded') return { _type: type, brief: slot.brief };
  const value = slot as Fact<T>;
  return defined({
    _type: type,
    value: value.value,
    unit: value.unit,
    qualifier: value.qualifier,
    meta: meta(value.meta, where),
  });
}

const optionalFact = <T>(slot: FactSlot<T> | undefined, type: string, where: string) =>
  slot === undefined ? undefined : fact(slot, type, where);

function interpretation(slot: InterpretationSlot, where: string): Json {
  if (slot.kind === 'inputNeeded') return { _type: 'interpretation', brief: slot.brief };
  return defined({
    _type: 'interpretation',
    text: slot.text,
    sources: keyed(slot.sources.map((source) => ref(source.documentId))),
    status: refuseApproved(slot.status, where),
    asAt: slot.asAt,
    reviewedBy: slot.reviewedBy ? ref(slot.reviewedBy.personId) : undefined,
    note: slot.note,
  });
}

function narrative(slot: NarrativeSlot, where: string): Json {
  if (slot.kind === 'inputNeeded') return { _type: 'narrative', brief: slot.brief };
  return { _type: 'narrative', text: slot.text, status: refuseApproved(slot.status, where) };
}

function figureSlot(
  slot: FigureSlot,
  briefs: Readonly<Record<string, string>>,
  where: string,
): Json {
  if (slot.kind === 'inputNeeded') return { _type: 'figureSlot', brief: slot.brief };
  const brief = briefs[slot.id];
  if (brief) return { _type: 'figureSlot', brief }; // a listed indicative graphic: never exported
  throw new Error(
    `${where}: figure ${slot.id} is not an indicative graphic; real assets are not exported (D-028).`,
  );
}

function photoSlot(slot: PhotoSlot, where: string): Json {
  if (slot.kind === 'inputNeeded') return { _type: 'photoSlot', brief: slot.brief };
  throw new Error(`${where}: photograph ${slot.id}: real assets are not exported (D-028).`);
}

export function exportFixtures(set: FixtureSet): RawDocument[] {
  const out: Json[] = [];
  const s = set.siteSettings;
  const k = s.keyFacts;
  out.push({
    _id: SINGLETON_IDS.siteSettings,
    _type: 'siteSettings',
    ...SYSTEM,
    legalName: fact(s.legalName, 'factString', 'siteSettings.legalName'),
    companyType: fact(s.companyType, 'factString', 'siteSettings.companyType'),
    acn: fact(s.acn, 'factString', 'siteSettings.acn'),
    abn: fact(s.abn, 'factString', 'siteSettings.abn'),
    phone: fact(s.phone, 'factString', 'siteSettings.phone'),
    email: fact(s.email, 'factString', 'siteSettings.email'),
    streetAddress: fact(s.streetAddress, 'factAddress', 'siteSettings.streetAddress'),
    postalAddress: fact(s.postalAddress, 'factAddress', 'siteSettings.postalAddress'),
    socialProfiles: fact(s.socialProfiles, 'factStringList', 'siteSettings.socialProfiles'),
    acknowledgementOfCountry: narrative(
      s.acknowledgementOfCountry,
      'siteSettings.acknowledgementOfCountry',
    ),
    keyFacts: {
      _type: 'keyFacts',
      projectCount: fact(k.projectCount, 'factNumber', 'keyFacts.projectCount'),
      flagshipCount: fact(k.flagshipCount, 'factNumber', 'keyFacts.flagshipCount'),
      groundHeld: fact(k.groundHeld, 'factNumber', 'keyFacts.groundHeld'),
      commodities: fact(k.commodities, 'factCommodities', 'keyFacts.commodities'),
      jurisdictions: fact(k.jurisdictions, 'factStates', 'keyFacts.jurisdictions'),
      companyStatus: fact(k.companyStatus, 'factString', 'keyFacts.companyStatus'),
      dgrHolding: fact(k.dgrHolding, 'factNumber', 'keyFacts.dgrHolding'),
      sharesOnIssue: fact(k.sharesOnIssue, 'factNumber', 'keyFacts.sharesOnIssue'),
      ipoStatus: fact(k.ipoStatus, 'factString', 'keyFacts.ipoStatus'),
    },
  });

  set.people.forEach((p, order) =>
    out.push(
      defined({
        _id: p.id,
        _type: 'person',
        ...SYSTEM,
        order,
        name: p.name,
        group: p.group,
        role: fact(p.role, 'factString', `${p.id}.role`),
        bio: interpretation(p.bio, `${p.id}.bio`),
        qualifications: fact(p.qualifications, 'factString', `${p.id}.qualifications`),
        portrait: fact(p.portrait, 'factString', `${p.id}.portrait`),
        cpMembership: optionalFact(p.cpMembership, 'factString', `${p.id}.cpMembership`),
        cpConsent: optionalFact(p.cpConsent, 'factBoolean', `${p.id}.cpConsent`),
        approverFor: p.approverFor ? [...p.approverFor] : undefined,
      }),
    ),
  );

  set.documents.forEach((d, order) =>
    out.push(
      defined({
        _id: d.id,
        _type: 'documentRecord',
        ...SYSTEM,
        order,
        title: d.title,
        slug: { _type: 'slug', current: d.slug },
        ref: optionalFact(d.ref, 'factString', `${d.id}.ref`),
        docType: d.docType,
        releaseAt: fact(d.releaseAt, 'factDate', `${d.id}.releaseAt`),
        status: refuseApproved(d.status, `${d.id}.status`),
        internal: d.internal,
        summary: d.summary === undefined ? undefined : narrative(d.summary, `${d.id}.summary`),
        file: fact(d.file, 'factString', `${d.id}.file`),
        projects: d.projectIds.length > 0 ? keyed(d.projectIds.map(ref)) : undefined,
        externalUrl: d.externalUrl,
        legacyPath: d.legacyPath,
        note: d.note,
      }),
    ),
  );

  set.projects.forEach((p, order) =>
    out.push(
      defined({
        _id: p.id,
        _type: 'project',
        ...SYSTEM,
        order,
        name: p.name,
        slug: { _type: 'slug', current: p.slug },
        sheetNumber: p.sheetNumber,
        holding: fact(p.holding, 'factHolding', `${p.id}.holding`),
        state: fact(p.state, 'factState', `${p.id}.state`),
        commodities: fact(p.commodities, 'factCommodities', `${p.id}.commodities`),
        stage: fact(p.stage, 'factStage', `${p.id}.stage`),
        areaKm2: fact(p.areaKm2, 'factNumber', `${p.id}.areaKm2`),
        ownership: fact(p.ownership, 'factOwnership', `${p.id}.ownership`),
        heroThesis: narrative(p.heroThesis, `${p.id}.heroThesis`),
        geologySummary: interpretation(p.geologySummary, `${p.id}.geologySummary`),
        statements: keyed(
          p.statements.map((statement, i) => interpretation(statement, `${p.id}.statements[${i}]`)),
        ),
        tenements: fact(p.tenements, 'factString', `${p.id}.tenements`),
        asAt: fact(p.asAt, 'factDate', `${p.id}.asAt`),
        setting: {
          _type: 'projectSetting',
          neighbouringDeposits: fact(
            p.setting.neighbouringDeposits,
            'factString',
            `${p.id}.setting`,
          ),
          nearestTown: fact(p.setting.nearestTown, 'factString', `${p.id}.setting`),
          access: fact(p.setting.access, 'factString', `${p.id}.setting`),
          infrastructure: fact(p.setting.infrastructure, 'factString', `${p.id}.setting`),
          traditionalOwners: fact(p.setting.traditionalOwners, 'factString', `${p.id}.setting`),
        },
        heroPhoto: photoSlot(p.heroPhoto, `${p.id}.heroPhoto`),
        settingMap: figureSlot(p.settingMap, set.figureBriefs, `${p.id}.settingMap`),
        sectionFigure: figureSlot(p.sectionFigure, set.figureBriefs, `${p.id}.sectionFigure`),
        photos: keyed(p.photos.map((photo, i) => photoSlot(photo, `${p.id}.photos[${i}]`))),
        cpStatement: interpretation(p.cpStatement, `${p.id}.cpStatement`),
        heldBackNote: p.heldBackNote,
        legacyPath: p.legacyPath,
      }),
    ),
  );

  set.prospects.forEach((r, order) =>
    out.push({
      _id: r.id,
      _type: 'prospect',
      ...SYSTEM,
      order,
      project: ref(r.projectId),
      name: r.name,
      summary: interpretation(r.summary, `${r.id}.summary`),
      targetType: fact(r.targetType, 'factString', `${r.id}.targetType`),
    }),
  );
  set.resourceEstimates.forEach((r, order) =>
    out.push({
      _id: r.id,
      _type: 'resourceEstimate',
      ...SYSTEM,
      order,
      project: ref(r.projectId),
      category: fact(r.category, 'factString', r.id),
      tonnesMt: fact(r.tonnesMt, 'factNumber', r.id),
      grades: fact(r.grades, 'factString', r.id),
      containedMetal: fact(r.containedMetal, 'factString', r.id),
      cutOff: fact(r.cutOff, 'factString', r.id),
      estimateDate: fact(r.estimateDate, 'factDate', r.id),
    }),
  );
  set.results.forEach((r, order) =>
    out.push({
      _id: r.id,
      _type: 'result',
      ...SYSTEM,
      order,
      project: ref(r.projectId),
      headline: fact(r.headline, 'factString', r.id),
      holeOrSurveyId: fact(r.holeOrSurveyId, 'factString', r.id),
      prospectName: r.prospectName,
      reportedIn: ref(r.reportedIn.documentId),
    }),
  );
  set.milestones.forEach((r, order) =>
    out.push({
      _id: r.id,
      _type: 'milestone',
      ...SYSTEM,
      order,
      project: ref(r.projectId),
      title: r.title,
      state: r.state,
      when: fact(r.when, 'factString', r.id),
      status: refuseApproved(r.status, `${r.id}.status`),
    }),
  );
  set.workItems.forEach((w, order) =>
    out.push({
      _id: w.id,
      _type: 'workItem',
      ...SYSTEM,
      order,
      project: ref(w.projectId),
      method: w.method,
      quantity: fact(w.quantity, 'factNumber', `${w.id}.quantity`),
      year: fact(w.year, 'factNumber', `${w.id}.year`),
      operator: fact(w.operator, 'factOperator', `${w.id}.operator`),
    }),
  );
  set.articles.forEach((a, order) =>
    out.push(
      defined({
        _id: a.id,
        _type: 'article',
        ...SYSTEM,
        order,
        title: a.title,
        slug: { _type: 'slug', current: a.slug },
        date: fact(a.date, 'factDate', `${a.id}.date`),
        lead: narrative(a.lead, `${a.id}.lead`),
        status: refuseApproved(a.status, `${a.id}.status`),
        projects: a.projectIds.length > 0 ? keyed(a.projectIds.map(ref)) : undefined,
        linkedDocument: a.linkedDocumentId ? ref(a.linkedDocumentId) : undefined,
      }),
    ),
  );

  const h = set.homePage;
  out.push({
    _id: SINGLETON_IDS.homePage,
    _type: 'homePage',
    ...SYSTEM,
    heroHeading: narrative(h.heroHeading, 'homePage.heroHeading'),
    heroIntro: narrative(h.heroIntro, 'homePage.heroIntro'),
    portfolioMap: figureSlot(h.portfolioMap, set.figureBriefs, 'homePage.portfolioMap'),
    whyHeading: narrative(h.whyHeading, 'homePage.whyHeading'),
    whyText: interpretation(h.whyText, 'homePage.whyText'),
    crossSection: figureSlot(h.crossSection, set.figureBriefs, 'homePage.crossSection'),
    sustainabilityLine: narrative(h.sustainabilityLine, 'homePage.sustainabilityLine'),
  });
  out.push({
    _id: SINGLETON_IDS.portfolioPage,
    _type: 'portfolioPage',
    ...SYSTEM,
    intro: narrative(set.portfolioPage.intro, 'portfolioPage.intro'),
    portfolioMap: figureSlot(
      set.portfolioPage.portfolioMap,
      set.figureBriefs,
      'portfolioPage.portfolioMap',
    ),
  });

  for (const page of Object.values(set.pages)) {
    out.push({
      _id: pageId(page.key),
      _type: 'page',
      ...SYSTEM,
      key: page.key,
      intro: narrative(page.intro, `${page.key}.intro`),
      sections: keyed(
        page.sections.map((section) =>
          defined({
            _type: 'pageSection',
            sectionId: section.id,
            heading: section.heading,
            paragraphs: keyed(
              section.paragraphs.map((paragraph, i) =>
                paragraph.kind === 'interpretation'
                  ? interpretation(paragraph, `${page.key}.${section.id}[${i}]`)
                  : narrative(paragraph, `${page.key}.${section.id}[${i}]`),
              ),
            ),
            forwardLooking: section.forwardLooking,
          }),
        ),
      ),
    });
  }

  for (const legal of Object.values(set.legalPages)) {
    out.push(
      defined({
        _id: legalPageId(legal.key),
        _type: 'legalPage',
        ...SYSTEM,
        key: legal.key,
        lastUpdated: fact(legal.lastUpdated, 'factDate', `${legal.key}.lastUpdated`),
        clauses:
          'kind' in legal.clauses
            ? undefined
            : keyed(
                legal.clauses.map((clause) => ({
                  _type: 'legalClause',
                  heading: clause.heading,
                  text: interpretation(clause.text, legal.key),
                })),
              ),
        clausesBrief: 'kind' in legal.clauses ? legal.clauses.brief : undefined,
        status: 'draft',
      }),
    );
  }

  return out as unknown as RawDocument[];
}
