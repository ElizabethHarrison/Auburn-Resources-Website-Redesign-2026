/**
 * Provenance objects shared by every content class (CLAUDE.md §2.2; D-009, D-024, D-027).
 *
 * - `factMeta`: source document, as-at date, review status, approver and approval date, review-by date, note.
 * - Fact objects (`factString`, `factNumber`, …): a value plus unit/qualifier and `factMeta`, or — when the value
 *   is not known — an INPUT NEEDED `brief`. Never a bare value without provenance.
 * - `interpretation` (reviewed prose with sources) and `narrative` (plain text, no digits).
 */
import { defineField, defineType, type FieldDefinition } from 'sanity';
import {
  STATUS_OPTIONS,
  factMetaIssue,
  heldBackIssue,
  interpretationIssue,
  narrativeIssue,
} from '../../validation/rules';

const status = defineField({
  name: 'status',
  title: 'Review status',
  type: 'string',
  options: { list: STATUS_OPTIONS, layout: 'radio' },
  initialValue: 'draft',
});

/** Who approved an item with a record-level status, and when (checked at build time, D-027). */
export const approvalFields = [
  defineField({
    name: 'approvedBy',
    title: 'Approved by',
    type: 'reference',
    to: [{ type: 'person' }],
  }),
  defineField({ name: 'approvedAt', title: 'Approved at', type: 'datetime' }),
];

const brief = defineField({
  name: 'brief',
  title: 'INPUT NEEDED brief',
  description: 'What is missing, shown to editors in preview when there is no value.',
  type: 'string',
});

export const factMeta = defineType({
  name: 'factMeta',
  title: 'Provenance',
  type: 'object',
  fields: [
    defineField({
      name: 'sourceDocument',
      title: 'Source document',
      type: 'reference',
      to: [{ type: 'documentRecord' }],
    }),
    defineField({ name: 'asAt', title: 'True as at', type: 'date' }),
    status,
    defineField({
      name: 'approvedBy',
      title: 'Approved by',
      description: 'The company secretary (corporate facts) or competent person (technical facts).',
      type: 'reference',
      to: [{ type: 'person' }],
    }),
    defineField({ name: 'approvedAt', title: 'Approved at', type: 'datetime' }),
    defineField({
      name: 'reviewBy',
      title: 'Review by',
      description:
        'Defaults to twelve months after the as-at date. Overdue items are reported, not hidden (D-026).',
      type: 'date',
    }),
    defineField({
      name: 'note',
      title: 'Internal note',
      description: 'Never published.',
      type: 'text',
      rows: 2,
    }),
  ],
});

type ValueField = Omit<FieldDefinition, 'name'> & Record<string, unknown>;

/** One fact object type per value type, all with the same shape: value · unit · qualifier · brief · meta. */
function factType(name: string, title: string, value: ValueField) {
  return defineType({
    name,
    title,
    type: 'object',
    fields: [
      { name: 'value', title: 'Value', ...value } as FieldDefinition,
      defineField({ name: 'unit', title: 'Unit', type: 'string' }),
      defineField({
        name: 'qualifier',
        title: 'Qualifier (exactly as the source states it)',
        type: 'string',
      }),
      brief,
      defineField({ name: 'meta', title: 'Provenance', type: 'factMeta' }),
    ],
    validation: (rule) =>
      rule.custom(
        (fact: { value?: unknown; meta?: Parameters<typeof factMetaIssue>[0] } | undefined) => {
          const value = fact?.value;
          const hasValue =
            value !== undefined &&
            value !== null &&
            value !== '' &&
            !(Array.isArray(value) && value.length === 0);
          if (typeof value === 'string') {
            const held = heldBackIssue(value);
            if (held !== true) return held;
          }
          return factMetaIssue(fact?.meta, hasValue);
        },
      ),
  });
}

const list = (values: readonly string[]) => values.map((value) => ({ title: value, value }));

export const factTypes = [
  factType('factString', 'Fact (text)', { type: 'string' }),
  factType('factNumber', 'Fact (number)', { type: 'number' }),
  factType('factDate', 'Fact (date)', { type: 'date' }),
  factType('factBoolean', 'Fact (yes/no)', { type: 'boolean' }),
  factType('factStringList', 'Fact (list)', { type: 'array', of: [{ type: 'string' }] }),
  factType('factAddress', 'Fact (address)', {
    type: 'object',
    fields: [{ name: 'lines', title: 'Lines', type: 'array', of: [{ type: 'string' }] }],
  }),
  factType('factOwnership', 'Fact (ownership)', {
    type: 'object',
    fields: [
      { name: 'holder', title: 'Holder', type: 'string' },
      { name: 'percent', title: 'Percent', type: 'number' },
      { name: 'jvPartner', title: 'JV partner', type: 'string' },
      { name: 'jvTerms', title: 'JV terms', type: 'text' },
    ],
  }),
  factType('factState', 'Fact (state)', { type: 'string', options: { list: list(['QLD', 'NT']) } }),
  factType('factStates', 'Fact (states)', {
    type: 'array',
    of: [{ type: 'string' }],
    options: { list: list(['QLD', 'NT']) },
  }),
  factType('factCommodities', 'Fact (commodities)', {
    type: 'array',
    of: [{ type: 'string' }],
    options: {
      list: list(['zinc', 'lead', 'copper', 'gold', 'molybdenum', 'nickel', 'base metals']),
    },
  }),
  factType('factHolding', 'Fact (holding)', {
    type: 'string',
    options: { list: list(['active', 'underReview', 'noLongerHeld']) },
  }),
  factType('factStage', 'Fact (stage)', {
    type: 'string',
    options: { list: list(['targetGeneration', 'drillReady', 'drilling', 'resourceDefinition']) },
  }),
  factType('factOperator', 'Fact (operator)', {
    type: 'string',
    options: { list: list(['auburn', 'historic']) },
  }),
];

export const interpretation = defineType({
  name: 'interpretation',
  title: 'Interpretation',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 4 }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'documentRecord' }] }],
    }),
    status,
    defineField({ name: 'asAt', title: 'As at', type: 'date' }),
    defineField({
      name: 'reviewedBy',
      title: 'Reviewed by',
      description: 'Competent person (technical) or company secretary (corporate).',
      type: 'reference',
      to: [{ type: 'person' }],
    }),
    defineField({ name: 'note', title: 'Internal note', type: 'text', rows: 2 }),
    brief,
  ],
  validation: (rule) =>
    rule.custom((value) => interpretationIssue(value as Parameters<typeof interpretationIssue>[0])),
});

export const narrative = defineType({
  name: 'narrative',
  title: 'Narrative',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: 'Text (no digits)', type: 'text', rows: 3 }),
    status,
    ...approvalFields,
    brief,
  ],
  validation: (rule) =>
    rule.custom((value: { text?: string } | undefined) => narrativeIssue(value?.text)),
});

export const figureSlot = defineType({
  name: 'figureSlot',
  title: 'Figure',
  type: 'object',
  fields: [
    defineField({ name: 'figure', title: 'Figure', type: 'reference', to: [{ type: 'figure' }] }),
    brief,
  ],
});

export const photoSlot = defineType({
  name: 'photoSlot',
  title: 'Photograph',
  type: 'object',
  fields: [
    defineField({ name: 'photo', title: 'Photograph', type: 'reference', to: [{ type: 'photo' }] }),
    brief,
  ],
});

export const provenanceTypes = [
  factMeta,
  ...factTypes,
  interpretation,
  narrative,
  figureSlot,
  photoSlot,
];
