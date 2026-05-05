export const BASE_LABELS = [
  {
    id: '500ml-single-malt',
    name: '500ml single malt blank',
    size: '500ml',
    extraTemplates: ['tampa-whisky-club'],
    tallerBars: true,
  },
  {
    id: '500ml-single-malt-roundel',
    name: '500ml single malt with roundel',
    size: '500ml',
    extraTemplates: [],
    websiteTemplate: 'website-options-singlemalt',
    isRoundel: true,
  },
  {
    id: '500ml-blended-malt',
    name: '500ml blended malt blank',
    size: '500ml',
    extraTemplates: [],
    singleImageTemplate: 'single-image-blended',
  },
  {
    id: '500ml-custom-roundel',
    name: '500ml custom blended malt with roundel',
    size: '500ml',
    extraTemplates: [],
    websiteTemplate: 'website-options-blended',
    singleImageTemplate: null,
    isRoundel: true,
  },
  {
    id: '200ml-single-malt',
    name: '200ml single malt blank',
    size: '200ml',
    extraTemplates: [],
  },
  {
    id: '200ml-single-malt-roundel',
    name: '200ml single malt with roundel',
    size: '200ml',
    extraTemplates: [],
    websiteTemplate: 'website-options-singlemalt',
    isRoundel: true,
  },
  {
    id: '200ml-blended-malt',
    name: '200ml blended malt blank',
    size: '200ml',
    extraTemplates: [],
    singleImageTemplate: 'single-image-blended',
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

export const SINGLEMALT_ARTWORKS = [
  { value: '', label: 'None' },
  { value: 'singlemalt500ml-option_1.jpg', label: 'Style 1' },
  { value: 'singlemalt500ml-option_2.jpg', label: 'Style 2' },
  { value: 'singlemalt500ml-option_3.jpg', label: 'Style 3' },
  { value: 'singlemalt500ml-option_4.jpg', label: 'Style 4' },
  { value: 'singlemalt500ml-option_5.jpg', label: 'Style 5' },
  { value: 'singlemalt500ml-option_6.jpg', label: 'Style 6' },
];

export const COLOR_PALETTE = [
  { value: '#ffffff', label: 'White',     luminance: 'light' },
  { value: '#f5f0e8', label: 'Cream',     luminance: 'light' },
  { value: '#d4a878', label: 'Gold',      luminance: 'light' },
  { value: '#c8bfa8', label: 'Parchment', luminance: 'light' },
  { value: '#111111', label: 'Black',     luminance: 'dark' },
  { value: '#1a2744', label: 'Navy',      luminance: 'dark' },
  { value: '#1c3320', label: 'Forest',    luminance: 'dark' },
  { value: '#3b0d17', label: 'Claret',    luminance: 'dark' },
];

export const ALL_TEMPLATES = {
  'tampa-whisky-club': {
    id: 'tampa-whisky-club',
    name: 'Tampa Whisky Club',
    sample: {
      series: "Gaspar's Stash Series",
      blendName: 'Orchard Galore',
      customerName: 'Andy Davidson',
      description: 'Inchmurrin Distilled at Loch Lomond Distillery / First Fill Bourbon / Cask No.66 / Distilled 6 January 2014 / Bottled 20 March 2026 /  46% abv / 500ml ℮',
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
      artwork: 'singlemalt500ml-option_4.jpg',
      blendName: 'Yer fat maw!',
      distillery: 'Glengoyne Distillery',
      strength: '46',
      singleCask: true,
      reference: '#3023',
      fgColor: '#1c3320',
      bgColor: '#ffffff',
    },
    fields: [
      { key: 'artwork',     label: 'Label artwork',      type: 'preset-image',  options: SINGLEMALT_ARTWORKS, default: '' },
      { key: 'blendName',  label: 'Whisky name',        type: 'text',          placeholder: 'Name of the whisky' },
      { key: 'distillery', label: 'Distilled at',       type: 'text',          default: '[Name of] Distillery' },
      { key: 'strength',   label: 'Strength',           type: 'strength',      default: '46' },
      { key: 'singleCask', label: 'Single cask',        type: 'checkbox' },
      { key: 'reference',      label: 'Reference',          type: 'text',           placeholder: 'e.g. #3023' },
      { key: 'referenceOnDark', label: 'On dark',            type: 'checkbox-inline' },
      { key: 'fgColor',        label: 'Foreground colour',  type: 'color-swatch',   options: COLOR_PALETTE, default: '#111111' },
      { key: 'bgColor',        label: 'Background colour',  type: 'color-swatch',   options: COLOR_PALETTE, default: '#ffffff' },
    ],
  },

  'website-options-blended': {
    id: 'website-options-blended',
    name: 'Website options',
    sample: {
      artwork: 'singlemalt500ml-option_4.jpg',
      blendName: 'The Weekend Blend',
      createdBy: 'A. Nicolson',
      reference: '#3023',
      fgColor: '#1c3320',
    },
    fields: [
      { key: 'artwork',    label: 'Label artwork',      type: 'preset-image',  options: SINGLEMALT_ARTWORKS, default: '' },
      { key: 'blendName',  label: 'Whisky name',        type: 'text',          placeholder: 'Name of the whisky' },
      { key: 'createdBy',  label: 'Created by',         type: 'text',          placeholder: 'Blender name' },
      { key: 'reference',       label: 'Reference',  type: 'text',           placeholder: 'e.g. #3023' },
      { key: 'referenceOnDark', label: 'On dark',    type: 'checkbox-inline' },
      { key: 'fgColor',         label: 'Text colour', type: 'color-swatch',   options: COLOR_PALETTE, default: '#111111' },
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
      { key: 'image',      label: 'Background image',  type: 'file',     accept: 'image/*' },
      { key: 'strength',   label: 'Strength',           type: 'strength', default: '46' },
      { key: 'singleCask', label: 'Single cask',        type: 'checkbox' },
      { key: 'reference',       label: 'Reference',          type: 'text',         placeholder: 'e.g. #3023' },
      { key: 'referenceOnDark', label: 'On dark',            type: 'checkbox-inline' },
      { key: 'fgColor',         label: 'Foreground colour',  type: 'color-swatch', options: COLOR_PALETTE, default: '#111111' },
      { key: 'bgColor',         label: 'Background colour',  type: 'color-swatch', options: COLOR_PALETTE, default: '#ffffff' },
    ],
  },

  'single-image-blended': {
    id: 'single-image-blended',
    name: 'Single image',
    sample: null,
    fields: [
      { key: 'image',           label: 'Background image',  type: 'file',           accept: 'image/*' },
      { key: 'reference',       label: 'Reference',         type: 'text',           placeholder: 'e.g. #3023' },
      { key: 'referenceOnDark', label: 'On dark',           type: 'checkbox-inline' },
    ],
  },
};

export function getTemplatesForBase(baseId) {
  const base = BASE_LABELS.find(b => b.id === baseId);
  if (!base) return [];
  const singleImgId = 'singleImageTemplate' in base ? base.singleImageTemplate : 'single-image';
  const ids = [
    ...(base.extraTemplates || []),
    ...(base.websiteTemplate ? [base.websiteTemplate] : []),
    ...(singleImgId ? [singleImgId] : []),
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
    barsFile: 'sample50cl-bars.png',
    labelW: 552,
    labelH: 303,
    scale: 2.2,
    // Standard text positions
    outerTop: 56, outerLeft: 195, outerW: 90, outerH: 80,
    sideTop: 204, sideLeft: 210, sideW: 116, sideH: 12,
    refRight: -30, refTop: 45, refFontSize: 8,
    imgTop: -8, imgLeft: 112, imgW: 448, imgH: 244,
    // Roundel image area
    roundelTop: 4, roundelLeft: -9, roundelW: 570, roundelH: 232,
  },
  '200ml': {
    pageW: 562,
    pageH: 325,          // content height (content-box; total = 325+73 = 398)
    pagePaddingTop: 73,
    cropsH: 398,
    cropsFile: 'crops20.png',
    barsFile: 'sample20cl-bars.png',
    labelW: 427,
    labelH: 252,
    scale: 1.6,
    outerTop: 36, outerLeft: 145, outerW: 90, outerH: 80,
    sideTop: 158, sideLeft: 153, sideW: 116, sideH: 12,
    refRight: -36, refTop: 45, refFontSize: 6,
    imgTop: -7, imgLeft: 93, imgW: 342, imgH: 188,
    // Roundel image area (proportional to 500ml)
    roundelTop: 4, roundelLeft: -9, roundelW: 445, roundelH: 193,
  },
};
