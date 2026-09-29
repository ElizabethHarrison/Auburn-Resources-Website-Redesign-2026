/**
 * Content audit: walks any record and collects every Fact, Interpretation, Narrative and INPUT NEEDED
 * slot. Used by the fixture invariant tests and the development scaffold page, and later by CMS
 * import checks.
 */
import type {
  ContentMode,
  ContentStatus,
  Fact,
  InputNeeded,
  Interpretation,
  Narrative,
} from '../facts';
import { isRenderable } from '../facts';

export type Slot = Fact<unknown> | InputNeeded | Interpretation | Narrative;

const SLOT_KINDS = new Set(['fact', 'inputNeeded', 'interpretation', 'narrative']);

function isSlot(value: unknown): value is Slot {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    typeof value.kind === 'string' &&
    SLOT_KINDS.has(value.kind)
  );
}

export interface FoundSlot {
  /** Dotted path from the root, e.g. `keyFacts.groundHeld`. */
  readonly path: string;
  readonly slot: Slot;
}

/** Depth-first list of every slot inside `root`. Slots are not searched inside. */
export function collectSlots(root: unknown, path = ''): FoundSlot[] {
  if (isSlot(root)) return [{ path, slot: root }];
  if (Array.isArray(root)) {
    return root.flatMap((item, index) => collectSlots(item, `${path}[${index}]`));
  }
  if (typeof root === 'object' && root !== null) {
    return Object.entries(root).flatMap(([key, value]) =>
      collectSlots(value, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

export function slotStatus(slot: Slot): ContentStatus | 'inputNeeded' {
  switch (slot.kind) {
    case 'fact':
      return slot.meta.status;
    case 'inputNeeded':
      return 'inputNeeded';
    default:
      return slot.status;
  }
}

export interface StatusTally {
  readonly total: number;
  readonly byStatus: Readonly<Record<ContentStatus | 'inputNeeded', number>>;
  /** Slots that produce output in the given mode (values, or placeholders in preview). */
  readonly renderable: number;
}

export function tallySlots(slots: readonly FoundSlot[], mode: ContentMode): StatusTally {
  const byStatus = { draft: 0, toVerify: 0, approved: 0, superseded: 0, inputNeeded: 0 };
  let renderable = 0;
  for (const { slot } of slots) {
    byStatus[slotStatus(slot)] += 1;
    if (isRenderable(slot, mode)) renderable += 1;
  }
  return { total: slots.length, byStatus, renderable };
}
