/**
 * Figures and photographs (docs/SITEMAP.md §8). No real company asset is uploaded until asset exposure is decided
 * (D-028, Q-47). Indicative mockup graphics never belong here (D-017, D-024).
 */
import { defineField, defineType } from 'sanity';
import { approvalFields, recordStatus, requiredString } from '../fields';

const common = [
  defineField({
    name: 'image',
    title: 'Image',
    type: 'image',
    validation: (rule) => rule.required(),
  }),
  requiredString('caption', 'Caption'),
  requiredString('alt', 'Alternative text'),
  defineField({
    name: 'longDescription',
    title: 'Long description (text equivalent)',
    type: 'text',
    rows: 4,
  }),
  requiredString('source', 'Source'),
  defineField({ name: 'date', title: 'Date', type: 'date', validation: (rule) => rule.required() }),
  recordStatus,
  ...approvalFields,
];

export const figure = defineType({
  name: 'figure',
  title: 'Figure',
  type: 'document',
  fields: [
    defineField({
      name: 'figureType',
      title: 'Type',
      type: 'string',
      options: { list: ['map', 'section', 'geophysics', 'other'] },
      validation: (rule) => rule.required(),
    }),
    ...common,
  ],
});

export const photo = defineType({
  name: 'photo',
  title: 'Photograph',
  type: 'document',
  fields: [
    ...common,
    requiredString('place', 'Place'),
    requiredString('photographer', 'Photographer'),
    requiredString('consentNote', 'Consent note'),
  ],
});
