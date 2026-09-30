/**
 * Content record types, mirroring the Sanity content model in docs/SITEMAP.md §8.
 *
 * Phase 1 covers the types needed for the scaffold and fixture seed data. The remaining types
 * (tenement, prospect, result, resourceEstimate, milestone, figure, photo, article, referenceDeposit,
 * page, redirect) are added with the templates that use them. When Sanity arrives (Phase 5), its
 * typegen output must map onto these types without changing any page or component.
 */
import type { ImageMetadata } from 'astro';
import type {
  ContentStatus,
  DocumentRef,
  FactSlot,
  InputNeeded,
  InterpretationSlot,
  IsoDate,
  NarrativeSlot,
} from '../facts';

// ── Shared ──────────────────────────────────────────────────────────────────────────────────────

/** Sheet number, e.g. `00`, `02`, `02.1`, `03.1`. Utility and legal pages have none (Q-04). */
export type SheetNumber = `${number}` | `${number}.${number}`;

export type AustralianState = 'QLD' | 'NT';

export type Commodity =
  'zinc' | 'lead' | 'copper' | 'gold' | 'molybdenum' | 'nickel' | 'base metals';

// ── Documents (also used as fact sources) ───────────────────────────────────────────────────────

export type DocType =
  | 'announcement'
  | 'quarterly'
  | 'halfYear'
  | 'annual'
  | 'presentation'
  | 'policy'
  | 'notice'
  /** Internal provenance records (e.g. a capture of the old website) — never listed publicly. */
  | 'sourceCapture'
  | 'thirdParty'
  | 'other';

export interface DocumentRecord {
  readonly id: string;
  readonly slug: string;
  /** Document reference number (docs/SITEMAP.md §8 `ref`), when one exists. */
  readonly ref?: FactSlot<string>;
  readonly title: string;
  readonly docType: DocType;
  /** Release date. A Fact, because dates are facts. */
  readonly releaseAt: FactSlot<IsoDate>;
  /** Approval of the record as a whole (e.g. whether it belongs on the site at all). */
  readonly status: ContentStatus;
  /** Internal records are sources only and never appear in document registers. */
  readonly internal: boolean;
  readonly summary?: NarrativeSlot;
  /** The PDF, once re-hosted. Old-site URLs are never rendered. */
  readonly file: FactSlot<string>;
  readonly projectIds: readonly string[];
  /** External location of a third-party source, for editors. Not rendered as a download. */
  readonly externalUrl?: string;
  /** Path on the old Squarespace site, used only to generate redirects. */
  readonly legacyPath?: string;
  readonly note?: string;
}

// ── Site settings (singleton) ───────────────────────────────────────────────────────────────────

export interface PostalAddress {
  readonly lines: readonly string[];
}

export interface KeyFacts {
  readonly projectCount: FactSlot<number>;
  readonly flagshipCount: FactSlot<number>;
  readonly groundHeld: FactSlot<number>;
  readonly commodities: FactSlot<readonly Commodity[]>;
  readonly jurisdictions: FactSlot<readonly AustralianState[]>;
  readonly companyStatus: FactSlot<string>;
  readonly dgrHolding: FactSlot<number>;
  readonly sharesOnIssue: FactSlot<number>;
  readonly ipoStatus: FactSlot<string>;
}

export interface SiteSettings {
  readonly legalName: FactSlot<string>;
  readonly companyType: FactSlot<string>;
  readonly acn: FactSlot<string>;
  readonly abn: FactSlot<string>;
  readonly phone: FactSlot<string>;
  readonly email: FactSlot<string>;
  readonly streetAddress: FactSlot<PostalAddress>;
  readonly postalAddress: FactSlot<PostalAddress>;
  readonly socialProfiles: FactSlot<readonly string[]>;
  readonly acknowledgementOfCountry: NarrativeSlot;
  readonly keyFacts: KeyFacts;
}

// ── People ──────────────────────────────────────────────────────────────────────────────────────

export type PersonGroup = 'board' | 'management';

export interface Person {
  readonly id: string;
  readonly name: string;
  readonly group: PersonGroup;
  readonly role: FactSlot<string>;
  readonly bio: InterpretationSlot;
  readonly qualifications: FactSlot<string>;
  readonly portrait: FactSlot<string>;
  /** Competent person details, when this person acts as one. */
  readonly cpMembership?: FactSlot<string>;
  readonly cpConsent?: FactSlot<boolean>;
  /**
   * What this person may approve: `corporate` (company secretary) or `technical` (competent person). Checked at build
   * time for every approval that names them (D-027).
   */
  readonly approverFor?: readonly ApproverKind[];
}

export type ApproverKind = 'corporate' | 'technical';

// ── Projects ────────────────────────────────────────────────────────────────────────────────────

export type ProjectHolding = 'active' | 'underReview' | 'noLongerHeld';

export type ProjectStage = 'targetGeneration' | 'drillReady' | 'drilling' | 'resourceDefinition';

export interface Ownership {
  readonly holder: string;
  readonly percent: number;
  readonly jvPartner?: string;
  readonly jvTerms?: string;
}

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  /** Provisional until the verified project list is confirmed (docs/OPEN-QUESTIONS.md Q-05, Q-20). */
  readonly sheetNumber: SheetNumber;
  readonly holding: FactSlot<ProjectHolding>;
  readonly state: FactSlot<AustralianState>;
  readonly commodities: FactSlot<readonly Commodity[]>;
  readonly stage: FactSlot<ProjectStage>;
  readonly areaKm2: FactSlot<number>;
  readonly ownership: FactSlot<Ownership>;
  /** ≤120 characters, no digits. */
  readonly heroThesis: NarrativeSlot;
  /** ≤120 words; competent-person review. */
  readonly geologySummary: InterpretationSlot;
  /** Technical statements captured from the old site, each awaiting CP review. */
  readonly statements: readonly InterpretationSlot[];
  /** Tenement numbers as reported (e.g. EPM numbers). */
  readonly tenements: FactSlot<string>;
  /** Page as-at date, set when the project's facts are approved. */
  readonly asAt: FactSlot<IsoDate>;
  /** Module 01 fact list. */
  readonly setting: ProjectSetting;
  /** Hero field photograph; the hero falls back to the setting map without one. */
  readonly heroPhoto: PhotoSlot;
  /** Module 01 map (Fig. 1). Required for module 01 to publish. */
  readonly settingMap: FigureSlot;
  /** Module 02 cross-section (Fig. 2), competent-person approved. */
  readonly sectionFigure: FigureSlot;
  /** Module 07 field photography. */
  readonly photos: readonly PhotoSlot[];
  /** Competent person statement covering this project's technical content (modules 02, 04–06). */
  readonly cpStatement: InterpretationSlot;
  /**
   * Internal note that the old site carried wording held back for compliance (HOLD). The held-back wording
   * itself is never stored or rendered; preview shows only this note.
   */
  readonly heldBackNote?: string;
  /** Path on the old site, used to generate redirects. */
  readonly legacyPath?: string;
}

/** Project module 01 fact list (docs/SITEMAP.md §8). */
export interface ProjectSetting {
  readonly neighbouringDeposits: FactSlot<string>;
  readonly nearestTown: FactSlot<string>;
  readonly access: FactSlot<string>;
  readonly infrastructure: FactSlot<string>;
  /** Name Traditional Owner groups only with recorded consent (CLAUDE.md §2.3). */
  readonly traditionalOwners: FactSlot<string>;
}

/** Target / prospect (docs/SITEMAP.md §8 `prospect`), module 05. */
export interface Prospect {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly summary: InterpretationSlot;
  readonly targetType: FactSlot<string>;
}

/** JORC 2012 Mineral Resource row (docs/SITEMAP.md §8 `resourceEstimate`), module 04. */
export interface ResourceEstimate {
  readonly id: string;
  readonly projectId: string;
  readonly category: FactSlot<string>;
  readonly tonnesMt: FactSlot<number>;
  readonly grades: FactSlot<string>;
  readonly containedMetal: FactSlot<string>;
  readonly cutOff: FactSlot<string>;
  readonly estimateDate: FactSlot<IsoDate>;
}

/** Reported drilling/geochemistry result (docs/SITEMAP.md §8 `result`), module 06. */
export interface ResultRecord {
  readonly id: string;
  readonly projectId: string;
  /** Headline exactly as reported, e.g. interval @ grade from depth. */
  readonly headline: FactSlot<string>;
  readonly holeOrSurveyId: FactSlot<string>;
  readonly prospectName: string;
  /** The announcement that reported it (required: a result cannot exist without one). */
  readonly reportedIn: DocumentRef;
}

/** Project milestone (docs/SITEMAP.md §8 `milestone`), module 08. Forward-looking when planned. */
export interface ProjectMilestone {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly state: 'done' | 'next' | 'planned';
  readonly when: FactSlot<string>;
  readonly status: ContentStatus;
}

/** Exploration work completed (docs/SITEMAP.md §8, `workItem`). */
export interface WorkItem {
  readonly id: string;
  readonly projectId: string;
  readonly method: string;
  readonly quantity: FactSlot<number>;
  readonly year: FactSlot<number>;
  readonly operator: FactSlot<'auburn' | 'historic'>;
}

// ── Figures (docs/SITEMAP.md §8, `figure`) ─────────────────────────────────────────────────────

export type FigureType = 'map' | 'section' | 'geophysics' | 'photo' | 'other';

/** A supplied figure asset. Maps and sections need CP approval before `status` is approved. */
export interface FigureRecord {
  readonly kind: 'figure';
  readonly id: string;
  readonly figureType: FigureType;
  /** CMS image URL, or an imported local asset (built through Astro's image pipeline). */
  readonly src: string | ImageMetadata;
  readonly width: number;
  readonly height: number;
  readonly caption: string;
  readonly alt: string;
  readonly longDescription?: string;
  readonly source: string;
  readonly date: IsoDate;
  readonly status: ContentStatus;
}

export type FigureSlot = FigureRecord | InputNeeded;

/**
 * Documentary photograph (docs/SITEMAP.md §8 `photo`; DESIGN-DIRECTION "Photography"): every photo needs
 * caption, date, place, photographer and a consent note. Never stock imagery; never cultural sites
 * without permission.
 */
export interface PhotoRecord extends FigureRecord {
  readonly figureType: 'photo';
  readonly place: string;
  readonly photographer: string;
  /** Record of consent (people pictured, landholder, Traditional Owners where relevant). */
  readonly consentNote: string;
}

export type PhotoSlot = PhotoRecord | InputNeeded;

// ── Articles (docs/SITEMAP.md §8, `article`) ───────────────────────────────────────────────────

export interface Article {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly date: FactSlot<IsoDate>;
  readonly lead: NarrativeSlot;
  readonly status: ContentStatus;
  readonly projectIds: readonly string[];
  readonly linkedDocumentId?: string;
}

// ── Home page (singleton; docs/WEBSITE-STRATEGY.md §5) ─────────────────────────────────────────

/**
 * Editable home-page copy. Headings that make claims about the company or its geology are content,
 * not template text, so they follow the same approval rules as everything else.
 */
export interface HomePageContent {
  /** Working H1 (WEBSITE-STRATEGY §5); final wording after fact verification. */
  readonly heroHeading: NarrativeSlot;
  /** One-paragraph introduction. */
  readonly heroIntro: NarrativeSlot;
  /** Fig. 1 portfolio map. */
  readonly portfolioMap: FigureSlot;
  /** "Why this ground" heading. */
  readonly whyHeading: NarrativeSlot;
  /** The under-cover thesis; geological, so CP review. */
  readonly whyText: InterpretationSlot;
  /** Fig. 2 cross-section (CP-approved). */
  readonly crossSection: FigureSlot;
  /** Sustainability teaser sentence. */
  readonly sustainabilityLine: NarrativeSlot;
}

// ── Portfolio page (docs/SITEMAP.md 02) ────────────────────────────────────────────────────────

export interface PortfolioPageContent {
  /** One-paragraph portfolio summary (Narrative: no digits). */
  readonly intro: NarrativeSlot;
  /** Fig. 1 portfolio map — the same figure record the home page uses. */
  readonly portfolioMap: FigureSlot;
}

// ── Content pages (docs/SITEMAP.md §8 `page`: a fixed set of modules per page) ─────────────────

/** Every fixed page with editable copy. Keys, not slugs: URLs are fixed by the sitemap (lib/navigation.ts). */
export type PageKey =
  | 'company'
  | 'leadership'
  | 'howWeExplore'
  | 'investors'
  | 'announcements'
  | 'reports'
  | 'presentations'
  | 'shareholders'
  | 'governance'
  | 'alerts'
  | 'sustainability'
  | 'community'
  | 'environmentSafety'
  | 'news'
  | 'media'
  | 'contact';

/** A paragraph of page copy: Narrative (plain, no digits) or Interpretation (claims, with sources). */
export type TextSlot = NarrativeSlot | InterpretationSlot;

/**
 * A titled block of page copy. The heading is structural (the section name from docs/SITEMAP.md §6),
 * so it is template text; the paragraphs are content and follow the approval rules. A section with no
 * renderable paragraph is not rendered at all — never a heading over nothing.
 */
export interface PageSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly TextSlot[];
  /** Forward-looking content (plans, strategy): the section links to the disclaimer. */
  readonly forwardLooking?: boolean;
}

export interface PageContent {
  readonly key: PageKey;
  /** One-paragraph introduction under the H1. */
  readonly intro: NarrativeSlot;
  readonly sections: readonly PageSection[];
}

/** Legal pages (docs/SITEMAP.md §6): text supplied by the company, never drafted by the web team. */
export type LegalPageKey = 'disclaimer' | 'privacy' | 'terms';

export interface LegalClause {
  readonly heading: string;
  readonly text: InterpretationSlot;
}

export interface LegalPageContent {
  readonly key: LegalPageKey;
  readonly lastUpdated: FactSlot<IsoDate>;
  /** Numbered clauses, or INPUT NEEDED until the company supplies the text (Q-24). */
  readonly clauses: readonly LegalClause[] | InputNeeded;
}

// ── Re-exports so callers need one import ───────────────────────────────────────────────────────

export type { DocumentRef };
