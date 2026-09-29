/**
 * Project fixtures (docs/CONTENT-SOURCE.md §3): the five projects with pages on the old site.
 *
 * - Whether each project is still held is unknown (Q-20); the verified list will replace this one.
 * - Sheet numbers follow the order in docs/SITEMAP.md §1 and are provisional (Q-05).
 * - Every technical statement awaits competent-person review.
 * - Excluded (HOLD / do not publish): exploration-target wording for Nicholson and Calgoa, the
 *   promotional "smoke" line, and Hawkwood's outdated work plan.
 * - Some claims are restructured into records, never reworded: Nicholson's neighbouring deposits and
 *   Tanumbirini's infrastructure are setting facts; Nicholson's drill targets are prospects (./prospects.ts).
 * - Third-party deposit figures (McArthur River, Nova-Bollinger, Voisey's Bay) are omitted until each
 *   has a source and date.
 */
import { inputNeeded } from '../../../facts';
import type { Project, ProjectSetting } from '../../types';
import { siteFact, siteStatement } from '../helpers';
import { crossSection, nicholsonSettingMap } from './figures';

const stillHeld = inputNeeded('Whether the project is still held (docs/OPEN-QUESTIONS.md Q-20)');
const stage = inputNeeded('Current exploration stage');
const area = inputNeeded('Area in km² from the tenement schedule');
const ownership = inputNeeded('Holder, ownership percentage and any JV terms');
const heroThesis = inputNeeded('Hero thesis: one line, no digits, 120 characters or fewer');
const geologySummary = inputNeeded('Geological setting, 120 words or fewer, CP-approved');

const tenements = inputNeeded(
  'Tenement numbers (e.g. EPM numbers) from the tenement schedule (Q-31)',
);
const pageAsAt = inputNeeded('Page as-at date, set when the project facts are approved');
const noSettingMap = inputNeeded('Fig. 1 regional setting map from tenement GIS (Q-31)');
const noSection = inputNeeded('Fig. 2 cross-section approved by the competent person (Q-33)');

function heroPhoto(name: string) {
  return inputNeeded(
    `Hero photograph at ${name}: landscape, natural light, field activity if possible. Commissioned only (no stock imagery); caption and date required.`,
  );
}

function cpStatement(name: string) {
  return inputNeeded(
    `Competent person statement for ${name}: name, qualifications, membership, relationship to Auburn and consent wording (Q-30)`,
  );
}

function setting(overrides: Partial<ProjectSetting> = {}): ProjectSetting {
  return {
    neighbouringDeposits: inputNeeded('Neighbouring deposits, each with a source'),
    nearestTown: inputNeeded('Nearest town and distance'),
    access: inputNeeded('Access: roads, seasonal access'),
    infrastructure: inputNeeded('Infrastructure: power, port, rail, water'),
    traditionalOwners: inputNeeded('Traditional Owners: named only with their consent'),
    ...overrides,
  };
}

export const projects: readonly Project[] = [
  {
    id: 'project-nicholson',
    name: 'Nicholson',
    slug: 'nicholson',
    sheetNumber: '02.1',
    holding: stillHeld,
    state: siteFact('QLD'),
    commodities: siteFact(['zinc', 'lead'] as const),
    stage,
    areaKm2: area,
    ownership,
    heroThesis,
    geologySummary,
    statements: [
      siteStatement(
        'Historically under-explored due to widespread cover: multiple blind, fertile structures.',
      ),
      siteStatement(
        'Prospective host rocks underlie the entire project (within 100 m of surface).',
      ),
      siteStatement('Historical exploration targeted rare outcropping zones.'),
      siteStatement(
        'Limited strike targeted with 225 drillholes (averaging 27 m); host sequence below 100 m.',
        'How the 5,000 m of drilling relates to the 225 historic holes: INPUT NEEDED.',
      ),
    ],
    tenements,
    asAt: pageAsAt,
    setting: setting({
      neighbouringDeposits: siteFact('Walford Creek; Century', {
        note: 'Site: "Located between Walford Creek and Century zinc deposits."',
      }),
    }),
    heroPhoto: heroPhoto('Nicholson'),
    settingMap: nicholsonSettingMap,
    sectionFigure: crossSection,
    photos: [],
    cpStatement: cpStatement('Nicholson'),
    heldBackNote:
      'The current website carries exploration-target wording that is held back until the competent person restates it under JORC 2012 or removes it (Q-32).',
    legacyPath: '/nicholson-project',
  },
  {
    id: 'project-calgoa',
    name: 'Calgoa',
    slug: 'calgoa',
    sheetNumber: '02.2',
    holding: stillHeld,
    state: siteFact('QLD'),
    commodities: siteFact(['copper', 'molybdenum'] as const),
    stage,
    areaKm2: area,
    ownership,
    heroThesis,
    geologySummary,
    statements: [
      siteStatement('Large-scale porphyry and skarn targets.'),
      siteStatement(
        "Project supported by the team that discovered SolGold's Alpala deposit.",
        'Is that team still engaged?',
      ),
      siteStatement(
        'Exploration strategy to define an Inferred Resource at Marodian–Calgoa.',
        'Forward-looking: must link to /disclaimer.',
      ),
      siteStatement('4 km strike of intrusive breccia: scale similar to Cachaposa.'),
      siteStatement(
        'Extensive supergene blanket: shallow, low-cost near-term resource.',
        'Reword: "low-cost near-term resource" is a claim.',
      ),
      siteStatement(
        'Two Auburn diamond holes represent a near-miss in proximal alteration to the system core.',
      ),
    ],
    tenements,
    asAt: pageAsAt,
    setting: setting(),
    heroPhoto: heroPhoto('Calgoa'),
    settingMap: noSettingMap,
    sectionFigure: noSection,
    photos: [],
    cpStatement: cpStatement('Calgoa'),
    heldBackNote:
      'The current website carries exploration-target wording that is held back until the competent person restates it under JORC 2012 or removes it (Q-32).',
    legacyPath: '/calgoa-project',
  },
  {
    id: 'project-victoria-river-downs',
    name: 'Victoria River Downs',
    slug: 'victoria-river-downs',
    sheetNumber: '02.3',
    holding: stillHeld,
    state: siteFact('NT'),
    commodities: siteFact(['zinc', 'lead'] as const),
    stage,
    areaKm2: area,
    ownership,
    heroThesis,
    geologySummary,
    statements: [
      siteStatement('Victoria River Basin: similar potential to the McArthur Basin.'),
      siteStatement(
        'Anomalous system comparable in scale to other giant deposits, with higher tenor.',
      ),
      siteStatement(
        'Prospective host sequence within 150 m of surface; not exposed (~150 m deep) and untested by drilling.',
      ),
      siteStatement(
        'Remarkable similarities to the Century metallogenic model.',
        'Tone: rewrite in measured language.',
      ),
      siteStatement(
        'Supplejack Dolostone traps fluids within the Timber Creek Formation: a Century analogue.',
      ),
    ],
    tenements,
    asAt: pageAsAt,
    setting: setting(),
    heroPhoto: heroPhoto('Victoria River Downs'),
    settingMap: noSettingMap,
    sectionFigure: noSection,
    photos: [],
    cpStatement: cpStatement('Victoria River Downs'),
    legacyPath: '/victoria-river-downs',
  },
  {
    id: 'project-tanumbirini',
    name: 'Tanumbirini',
    slug: 'tanumbirini',
    sheetNumber: '02.4',
    holding: inputNeeded(
      'Current status: old portfolio figure shows it moving to "Pentecost Resources" for a separate IPO',
    ),
    state: siteFact('NT'),
    commodities: siteFact(['base metals'] as const),
    stage,
    areaKm2: siteFact(6500, {
      unit: 'km²',
      qualifier: '+',
      note: 'Site: "+6,500 km² tenement package". Recalculate from the tenement schedule.',
    }),
    ownership,
    heroThesis,
    geologySummary,
    statements: [
      siteStatement('Province-scale, multi-element geochemical anomalism.'),
      siteStatement('Limited historic exploration.'),
      siteStatement(
        '175 km west of the McArthur River deposit.',
        'Old site also quotes McArthur River resource figures; omitted until sourced and dated.',
      ),
      siteStatement('Potential for Mt Isa-type, Zambian-type, IOCG and Ni-Cu sulphide deposits.'),
      siteStatement('Anomalism focused on a central magnetic anomaly: a deep-seated structure.'),
      siteStatement(
        'North-east McArthur–Beetaloo sub-basin margin: analogous to the Century structural architecture.',
      ),
    ],
    tenements,
    asAt: pageAsAt,
    setting: setting({
      infrastructure: siteFact('Sealed Carpentaria Highway; gas pipeline', {
        note: 'Site: "Traversed by the sealed Carpentaria Highway and gas pipeline."',
      }),
    }),
    heroPhoto: heroPhoto('Tanumbirini'),
    settingMap: noSettingMap,
    sectionFigure: noSection,
    photos: [],
    cpStatement: cpStatement('Tanumbirini'),
    legacyPath: '/tanumbirini-project',
  },
  {
    id: 'project-hawkwood',
    name: 'Hawkwood',
    slug: 'hawkwood',
    sheetNumber: '02.5',
    holding: stillHeld,
    state: siteFact('QLD'),
    commodities: siteFact(['nickel'] as const, { note: 'Site: "Nickel sulphide opportunity".' }),
    stage,
    areaKm2: siteFact(1650, { unit: 'km²', note: 'Site: "1,650 km² of tenure".' }),
    ownership,
    heroThesis,
    geologySummary,
    statements: [
      siteStatement(
        'Tenure within the southern Connors–Auburn magmatic arc (320–300 Ma), 350 km north-west of Brisbane.',
      ),
      siteStatement(
        'Province-scale control of at least 7 mafic/ultramafic intrusive complexes (270–250 Ma).',
      ),
      siteStatement(
        "Model based on analogies to Nova-Bollinger and Voisey's Bay.",
        'Old site quotes resource figures for both; omitted until each has a source and date.',
      ),
      siteStatement(
        '2018 VTEM Max survey: strong discrete conductors at Quaggy and Calrossie, and multiple large weak conductors at Jack Shay.',
        'Old site gives conductance values with garbled units; omitted until the CP corrects them.',
      ),
      siteStatement(
        'Surface Ni ± Cu ± PGE anomalism at Jack Shay broadly coincident with VTEM conductors.',
      ),
    ],
    tenements,
    asAt: pageAsAt,
    setting: setting(),
    heroPhoto: heroPhoto('Hawkwood'),
    settingMap: noSettingMap,
    sectionFigure: noSection,
    photos: [],
    cpStatement: cpStatement('Hawkwood'),
    heldBackNote:
      'The current website carries an outdated forward-looking work plan that is not published.',
    legacyPath: '/hawkwood-project',
  },
];
