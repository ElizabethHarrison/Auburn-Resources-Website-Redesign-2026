/** Small helpers so every schema declares facts, text and references the same way. */
import { defineField } from 'sanity';
import { approvalFields } from './objects/provenance';
import { STATUS_OPTIONS } from '../validation/rules';

export const fact = (name: string, type: string, title?: string, description?: string) =>
  defineField({ name, title: title ?? name, type, ...(description ? { description } : {}) });

export const narrativeField = (name: string, title?: string) =>
  defineField({ name, title: title ?? name, type: 'narrative' });
export const interpretationField = (name: string, title?: string) =>
  defineField({ name, title: title ?? name, type: 'interpretation' });

export const recordStatus = defineField({
  name: 'status',
  title: 'Review status',
  type: 'string',
  options: { list: STATUS_OPTIONS, layout: 'radio' },
  initialValue: 'draft',
  validation: (rule) => rule.required(),
});

export { approvalFields };

/** Display order within a collection (the adapter sorts by it; lower first). */
export const orderField = defineField({ name: 'order', title: 'Display order', type: 'number' });

export const projectRef = defineField({
  name: 'project',
  title: 'Project',
  type: 'reference',
  to: [{ type: 'project' }],
  validation: (rule) => rule.required(),
});

export const requiredString = (name: string, title?: string) =>
  defineField({
    name,
    title: title ?? name,
    type: 'string',
    validation: (rule) => rule.required(),
  });
