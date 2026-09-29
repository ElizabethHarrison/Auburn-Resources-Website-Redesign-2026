/** Site settings, people and documents (docs/SITEMAP.md §8). */
import { defineField, defineType } from 'sanity';
import {
  approvalFields,
  fact,
  orderField,
  interpretationField,
  narrativeField,
  recordStatus,
  requiredString,
} from '../fields';

export const keyFacts = defineType({
  name: 'keyFacts',
  title: 'Key facts',
  type: 'object',
  fields: [
    fact('projectCount', 'factNumber', 'Projects'),
    fact('flagshipCount', 'factNumber', 'Flagship projects'),
    fact('groundHeld', 'factNumber', 'Ground held (km²)'),
    fact('commodities', 'factCommodities', 'Commodities'),
    fact('jurisdictions', 'factStates', 'Jurisdictions'),
    fact('companyStatus', 'factString', 'Company status'),
    fact('dgrHolding', 'factNumber', 'DGR Global holding'),
    fact('sharesOnIssue', 'factNumber', 'Shares on issue'),
    fact('ipoStatus', 'factString', 'IPO status'),
  ],
});

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    fact('legalName', 'factString', 'Legal name'),
    fact('companyType', 'factString', 'Company type'),
    fact('acn', 'factString', 'ACN'),
    fact('abn', 'factString', 'ABN'),
    fact('phone', 'factString', 'Phone'),
    fact('email', 'factString', 'Email'),
    fact('streetAddress', 'factAddress', 'Street address'),
    fact('postalAddress', 'factAddress', 'Postal address'),
    fact('socialProfiles', 'factStringList', 'Social profiles'),
    narrativeField('acknowledgementOfCountry', 'Acknowledgement of Country'),
    defineField({ name: 'keyFacts', title: 'Key facts', type: 'keyFacts' }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});

export const person = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  fields: [
    orderField,
    requiredString('name', 'Name'),
    defineField({
      name: 'group',
      title: 'Group',
      type: 'string',
      options: { list: ['board', 'management'] },
      validation: (rule) => rule.required(),
    }),
    fact('role', 'factString', 'Role'),
    interpretationField('bio', 'Biography'),
    fact('qualifications', 'factString', 'Qualifications'),
    fact('portrait', 'factString', 'Portrait'),
    fact('cpMembership', 'factString', 'Competent person membership'),
    fact('cpConsent', 'factBoolean', 'Competent person consent'),
    defineField({
      name: 'approverFor',
      title: 'May approve',
      description:
        'Corporate: company secretary. Technical: competent person. Checked at build time; the CMS cannot restrict who sets this without Enterprise roles (D-027).',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: ['corporate', 'technical'] },
    }),
  ],
});

export const documentRecord = defineType({
  name: 'documentRecord',
  title: 'Document',
  type: 'document',
  fields: [
    orderField,
    requiredString('title', 'Title'),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    fact('ref', 'factString', 'Reference'),
    defineField({
      name: 'docType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
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
        ],
      },
      validation: (rule) => rule.required(),
    }),
    fact('releaseAt', 'factDate', 'Release date'),
    recordStatus,
    ...approvalFields,
    defineField({
      name: 'internal',
      title: 'Internal source record',
      description: 'Provenance sources only; never listed publicly (D-025).',
      type: 'boolean',
      initialValue: false,
    }),
    narrativeField('summary', 'Plain-language summary'),
    fact(
      'file',
      'factString',
      'File',
      'PDF file name. PDFs stay unlinked until the PDF Worker is approved (D-024).',
    ),
    defineField({
      name: 'projects',
      title: 'Projects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
    }),
    defineField({ name: 'externalUrl', title: 'External URL (editors only)', type: 'url' }),
    defineField({ name: 'legacyPath', title: 'Old-site path (redirects only)', type: 'string' }),
    defineField({ name: 'note', title: 'Internal note', type: 'text', rows: 2 }),
  ],
});
