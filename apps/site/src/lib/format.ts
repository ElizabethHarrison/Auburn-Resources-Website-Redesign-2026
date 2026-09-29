/**
 * Display formatting for Fact values (CLAUDE.md §2.5): Australian number format, SI units with a space
 * (`1,200 line km`), percent without one (`39%`), and qualifiers exactly as stated by the source.
 * Formatting never changes a value: no rounding, no abbreviation.
 */
import type { Fact, FactSlot } from './facts';
import type { AustralianState, Commodity, DocType } from './content/types';

const numberFormat = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 20 });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** Units written directly after the number, without a space. */
const UNSPACED_UNITS = new Set(['%']);
/** Qualifiers written directly before the number, without a space. */
const UNSPACED_QUALIFIERS = new Set(['+', '~', '>', '<', '≥', '≤']);

function formatScalar(value: unknown): string {
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map(formatScalar).join(', ');
  throw new Error(
    `No default format for fact value ${JSON.stringify(value)}; pass a format function.`,
  );
}

/**
 * `siteFact(9300, { unit: 'km²', qualifier: 'over' })` → `over 9,300 km²`.
 * Pass `format` for structured values (addresses, ownership) or custom wording.
 */
export function formatFactValue<T>(fact: Fact<T>, format?: (value: T) => string): string {
  const core = format ? format(fact.value) : formatScalar(fact.value);
  const unit =
    fact.unit === undefined ? '' : UNSPACED_UNITS.has(fact.unit) ? fact.unit : ` ${fact.unit}`;
  const qualifier =
    fact.qualifier === undefined
      ? ''
      : UNSPACED_QUALIFIERS.has(fact.qualifier)
        ? fact.qualifier
        : `${fact.qualifier} `;
  return `${qualifier}${core}${unit}`;
}

// ── Vocabulary labels (site taxonomy, not company facts) ───────────────────────────────────────

export const COMMODITY_LABELS: Record<Commodity, string> = {
  zinc: 'Zinc',
  lead: 'Lead',
  copper: 'Copper',
  gold: 'Gold',
  molybdenum: 'Molybdenum',
  nickel: 'Nickel',
  'base metals': 'Base metals',
};

export const STATE_NAMES: Record<AustralianState, string> = {
  QLD: 'Queensland',
  NT: 'Northern Territory',
};

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  announcement: 'Announcement',
  quarterly: 'Quarterly report',
  halfYear: 'Half-year report',
  annual: 'Annual report',
  presentation: 'Presentation',
  policy: 'Policy',
  notice: 'Notice',
  sourceCapture: 'Source capture',
  thirdParty: 'Third-party document',
  other: 'Document',
};

export function formatCommodities(values: readonly Commodity[]): string {
  return values.map((value) => COMMODITY_LABELS[value]).join(' · ');
}

// ── Fact display items ─────────────────────────────────────────────────────────────────────────

/**
 * A labelled fact slot ready for FactCell, FactStrip or CounterRow. Build it with `factDisplay()` so
 * the format function is type-checked against the fact's value type.
 */
export interface FactDisplay {
  readonly label: string;
  readonly slot: FactSlot<unknown>;
  readonly format?: (value: unknown) => string;
}

export function factDisplay<T>(
  label: string,
  slot: FactSlot<T>,
  format?: (value: T) => string,
): FactDisplay {
  return {
    label,
    slot,
    // Safe: `format` only ever receives this slot's own value.
    ...(format ? { format: format as (value: unknown) => string } : {}),
  };
}
