/**
 * Content record types, mirroring the Sanity content model in docs/SITEMAP.md §8.
 *
 * Phase 1 covers the types needed for the scaffold and fixture seed data. The remaining types
 * (tenement, prospect, result, resourceEstimate, milestone, figure, photo, article, referenceDeposit,
 * page, redirect) are added with the templates that use them. When Sanity arrives (Phase 5), its
 * typegen output must map onto these types without changing any page or component.
 */
import type {
  ContentStatus,
  DocumentRef,
  FactSlot,
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
}

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
  /** Path on the old site, used to generate redirects. */
  readonly legacyPath?: string;
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

// ── Re-exports so callers need one import ───────────────────────────────────────────────────────

export type { DocumentRef };
