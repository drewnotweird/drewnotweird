export const BASE_LABELS = [
  {
    id: '500ml-single-malt',
    name: '500ml single malt blank',
    size: '500ml',
    extraTemplates: ['tampa-whisky-club'],
  },
  {
    id: '500ml-single-malt-roundel',
    name: '500ml single malt with roundel',
    size: '500ml',
    extraTemplates: [],
    websiteTemplate: 'website-options-singlemalt',
  },
  {
    id: '500ml-blended-malt',
    name: '500ml blended malt blank',
    size: '500ml',
    extraTemplates: [],
    websiteTemplate: 'website-options',
  },
  {
    id: '500ml-custom-roundel',
    name: '500ml custom blended malt with roundel',
    size: '500ml',
    extraTemplates: [],
    websiteTemplate: 'website-options',
  },
  {
    id: '200ml-custom-roundel',
    name: '200ml custom blended malt with roundel',
    size: '200ml',
    extraTemplates: [],
    websiteTemplate: 'website-options',
  },
  {
    id: '50ml-contact',
    name: '50ml contact sheet',
    size: '50ml',
    extraTemplates: [],
    websiteTemplate: 'website-options',
  },
];

const PRINT_COLOR_OPTIONS = [
  { value: 'black', label: 'Black' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'red', label: 'Red' },
  { value: 'white', label: 'White' },
];

const TAMPA_COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
];

const TAMPA_IMAGE_OPTIONS = [
  { value: 'ship', label: 'Ship' },
  { value: 'casks', label: 'Casks' },
];

const SINGLEMALT_STYLE_OPTIONS = [
  { value: 'option_1', label: 'Style 1' },
  { value: 'option_2', label: 'Style 2' },
  { value: 'option_3', label: 'Style 3' },
  { value: 'option_4', label: 'Style 4' },
  { value: 'option_5', label: 'Style 5' },
  { value: 'option_6', label: 'Style 6' },
];

export const ALL_TEMPLATES = {
  'tampa-whisky-club': {
    id: 'tampa-whisky-club',
    name: 'Tampa Whisky Club',
    sample: {
      series: "Gaspar's Stash Series",
      blendName: 'Orchard Galore',
      customerName: 'Andy Davidson',
      description: 'Inchmurrin Distilled at Loch Lomond Distillery / First Fill Bourbon / Cask No.66 / Distilled January 6th, 2014 / Bottled March 20th 2026',
      color: 'red',
      keyImage: 'ship',
    },
    fields: [
      { key: 'series',       label: 'Series',           type: 'text',   placeholder: "Gaspar's Stash Series" },
      { key: 'blendName',    label: 'Expression',       type: 'text',   placeholder: 'Name of the expression' },
      { key: 'customerName', label: "Customer's name",  type: 'text',   placeholder: 'Firstname Lastname' },
      { key: 'description',  label: 'Description',      type: 'text',   placeholder: 'Distillery / Cask type / Cask No. / Dates' },
      { key: 'color',        label: 'Accent color',     type: 'select', options: TAMPA_COLOR_OPTIONS },
      { key: 'keyImage',     label: 'Key image',        type: 'select', options: TAMPA_IMAGE_OPTIONS },
    ],
  },

  'website-options-singlemalt': {
    id: 'website-options-singlemalt',
    name: 'Website options',
    sample: {
      blendName: 'Highland Selection',
      distillery: 'Glengoyne',
      reference: '09374658G27',
      labelStyle: 'option_1',
      singleCask: false,
    },
    fields: [
      { key: 'blendName',   label: 'Blend name',            type: 'text',     placeholder: 'Name of the blend' },
      { key: 'distillery',  label: 'Distilled at',          type: 'text',     placeholder: 'Name of the distillery' },
      { key: 'reference',   label: 'Reference',             type: 'text',     placeholder: 'e.g. 09374658g27' },
      { key: 'labelStyle',  label: 'Label style',           type: 'select',   options: SINGLEMALT_STYLE_OPTIONS },
      { key: 'singleCask',  label: 'Single cask overlay',   type: 'checkbox' },
    ],
  },

  'website-options': {
    id: 'website-options',
    name: 'Website options',
    sample: {
      blendName: 'The Weekend Blend',
      createdBy: 'A. Nicolson',
      reference: '09374658G27',
      color: 'black',
    },
    fields: [
      { key: 'blendName',  label: 'Blend name',   type: 'text',   placeholder: 'Name of the blend' },
      { key: 'createdBy',  label: 'Created by',   type: 'text',   placeholder: 'Blender name' },
      { key: 'reference',  label: 'Reference',    type: 'text',   placeholder: 'e.g. 09374658g27' },
      { key: 'color',      label: 'Print color',  type: 'select', options: PRINT_COLOR_OPTIONS },
    ],
  },

  'single-image': {
    id: 'single-image',
    name: 'Single image',
    sample: null,
    fields: [
      { key: 'image', label: 'Background image', type: 'file', accept: 'image/*' },
    ],
  },
};

export function getTemplatesForBase(baseId) {
  const base = BASE_LABELS.find(b => b.id === baseId);
  if (!base) return [];
  const ids = [
    ...(base.extraTemplates || []),
    ...(base.websiteTemplate ? [base.websiteTemplate] : []),
    'single-image',
  ];
  return ids.map(id => ALL_TEMPLATES[id]);
}

// Physical dimensions by bottle size
export const LABEL_DIMS = {
  '500ml': {
    pageW: 794,
    pageH: 432,          // content height (content-box; total = 432+128 = 560)
    pagePaddingTop: 128,
    cropsH: 560,
    cropsFile: 'crops50.png',
    labelW: 552,
    labelH: 303,
    scale: 2.2,
    // Standard text positions
    outerTop: 56, outerLeft: 195, outerW: 90, outerH: 80,
    sideTop: 204, sideLeft: 210, sideW: 116, sideH: 12,
    refRight: -30, refTop: 45, refFontSize: 8,
    imgTop: -8, imgLeft: 112, imgW: 448, imgH: 244,
  },
  '200ml': {
    pageW: 562,
    pageH: 325,          // content height (content-box; total = 325+73 = 398)
    pagePaddingTop: 73,
    cropsH: 398,
    cropsFile: 'crops20.png',
    labelW: 427,
    labelH: 252,
    scale: 1.6,
    outerTop: 36, outerLeft: 145, outerW: 90, outerH: 80,
    sideTop: 158, sideLeft: 153, sideW: 116, sideH: 12,
    refRight: -36, refTop: 45, refFontSize: 6,
    imgTop: -7, imgLeft: 93, imgW: 342, imgH: 188,
  },
};
