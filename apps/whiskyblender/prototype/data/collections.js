/**
 * DAWN EQUIVALENT: Shopify collection objects (collection.json metafield data)
 *
 * In Dawn these are Liquid objects accessed as {{ collection.title }}, {{ collection.products }}, etc.
 * Here they are plain JS objects keyed by handle, loaded into window.WB_COLLECTIONS.
 *
 * Field mapping to Shopify/Dawn:
 *   handle        → collection.handle
 *   title         → collection.title
 *   description   → collection.description
 *   coverImage    → collection.image.src
 *   products      → collection.products[].handle (resolved via WB_PRODUCTS)
 *   cta           → custom metafield — which CTA band to show (createunique | foryersel | yourownbrand | letscollab)
 *
 * template: 'default'   → collection.html  (hero image + product grid + optional CTA bands)
 * template: null        → shop filter only, not a navigable collection page
 */

window.WB_COLLECTIONS = {

  // ── Shop filters ──────────────────────────────────────────────────────────
  // template: null — these are shop filters only, not standalone collection pages

  featured: {
    handle: 'featured',
    title: 'Featured',
    products: [
      'hoonjuice', 'glasgow850', 'yerauntfannys', 'scotsenglishman', 'weemansblend',
      'doctorsspecial', 'braxtoncrackers', 'hipflask', 'jotter', 'idrinkwhisky',
      'saythanks', 'glasgow', 'nipbefore', '80yearsofthebinos',
    ],
    template: null,
  },

  weebits: {
    handle: 'weebits',
    title: 'Wee bits',
    products: ['hipflask', 'jotter', 'idrinkwhisky'],
    template: null,
  },

  // ── Occasions ─────────────────────────────────────────────────────────────

  anniversaries: {
    handle: 'anniversaries',
    title: 'Anniversaries',
    description: "From paper to pearl, silver to gold, every anniversary deserves a toast! Whether you're celebrating your own milestone or raising a glass to a special couple, we've got gifts that make the moment unforgettable. Think personalised labels, unique blends, and drams crafted to mark love that lasts.",
    coverImage: 'images/occassions/anniversaries_full.png',
    products: ['hoonjuice', 'glasgow850', 'yerauntfannys', 'scotsenglishman', 'weemansblend', 'doctorsspecial', 'braxtoncrackers', 'hipflask', 'jotter', 'idrinkwhisky', 'saythanks', 'glasgow', 'nipbefore', '80yearsofthebinos'],
    cta: 'createunique',
    template: 'default',
  },

  birthdays: {
    handle: 'birthdays',
    title: 'Birthdays',
    description: "Milestone or not, birthdays are all about raising a glass! Whether it's for your best mate, your mum, or even a treat for yourself, we've got gift ideas worth celebrating. From personalised bottles to unique drams made to mark the big day, there's no better way to toast another year well lived.",
    coverImage: 'images/occassions/birthdays_full.png',
    products: ['hoonjuice', 'glasgow850', 'yerauntfannys', 'scotsenglishman', 'weemansblend', 'doctorsspecial', 'braxtoncrackers', 'hipflask', 'jotter', 'idrinkwhisky', 'saythanks', 'glasgow', 'nipbefore', '80yearsofthebinos'],
    cta: 'createunique',
    template: 'default',
  },

  celebrations: {
    handle: 'celebrations',
    title: 'Celebrations',
    description: "Big wins, little victories, and everything worth cheering — every celebration deserves a great dram! Whether it's a promotion, a new home, or just good news shared with friends, our gift ideas — from personalised bottles to one-of-a-kind blends — make the moment even more memorable.",
    coverImage: 'images/occassions/celebrations_full.png',
    products: ['hoonjuice', 'glasgow850', 'yerauntfannys', 'scotsenglishman', 'weemansblend', 'doctorsspecial', 'braxtoncrackers', 'hipflask', 'jotter', 'idrinkwhisky', 'saythanks', 'glasgow', 'nipbefore', '80yearsofthebinos'],
    cta: 'createunique',
    template: 'default',
  },

  christmas: {
    handle: 'christmas',
    title: 'Christmas',
    description: "From stocking fillers to show-stoppers under the tree, Christmas is made for sharing a dram or two! Whether it's for family, friends, or a well-earned treat for yourself, our festive gift ideas — from personalised bottles to limited-edition blends — are sure to spread some holiday cheer.",
    coverImage: 'images/occassions/christmas_full.png',
    products: ['hoonjuice', 'glasgow850', 'yerauntfannys', 'scotsenglishman', 'weemansblend', 'doctorsspecial', 'braxtoncrackers', 'hipflask', 'jotter', 'idrinkwhisky', 'saythanks', 'glasgow', 'nipbefore', '80yearsofthebinos'],
    cta: 'createunique',
    template: 'default',
  },

  thankyous: {
    handle: 'thankyous',
    title: 'Thankyous',
    description: "From teachers and teammates to colleagues and closest friends, there's always someone who deserves a proper thank you. Show your appreciation in style with a thoughtful dram — whether it's a personalised miniature, a unique blend, or a bottle that says more than words ever could.",
    coverImage: 'images/occassions/thankyous_full.png',
    products: ['hoonjuice', 'glasgow850', 'yerauntfannys', 'scotsenglishman', 'weemansblend', 'doctorsspecial', 'braxtoncrackers', 'hipflask', 'jotter', 'idrinkwhisky', 'saythanks', 'glasgow', 'nipbefore', '80yearsofthebinos'],
    cta: 'createunique',
    template: 'default',
  },

  weddings: {
    handle: 'weddings',
    title: 'Weddings',
    description: "The best man, father of the bride, heck, even the bride herself — weddings are full of folk deserving of a great dram! We have some great gift ideas, from custom-labelled miniatures to a unique blend of the happy couple's very own Scotch.",
    coverImage: 'images/occassions/weddings_full.png',
    products: ['hoonjuice', 'glasgow850', 'yerauntfannys', 'scotsenglishman', 'weemansblend', 'doctorsspecial', 'braxtoncrackers', 'hipflask', 'jotter', 'idrinkwhisky', 'saythanks', 'glasgow', 'nipbefore', '80yearsofthebinos'],
    cta: 'createunique',
    template: 'default',
  },

  // ── Product collections ───────────────────────────────────────────────────

  'single-malts': {
    handle: 'single-malts',
    title: 'Single malts',
    description: 'Distinctive single malt whiskies, selected for their depth and personality. Featuring exceptional single casks alongside standout releases.',
    coverImage: 'images/casks/singlemalts.jpg',
    products: [
      'aultmore-2011', 'teaninich-2014', 'glenburgie-2015',
      'craigellachie-2013', 'macallan-32', 'highland-park-32',
    ],
    cta: 'yourownbrand',
    template: 'default',
  },

  custom: {
    handle: 'custom',
    title: 'Custom',
    description: 'Personalised gifts for someone special, even if that special someone is yersel!',
    coverImage: 'images/products/collaborations/custom.jpg',
    products: [
      '500-flat', '500-round', '500-round-black', '200-flat', '12-miniatures', '700-round',
      'aultmore-2011', 'teaninich-2014', 'glenburgie-2015',
      'craigellachie-2013', 'macallan-32', 'highland-park-32',
    ],
    cta: 'yourownbrand',
    template: 'default',
  },

  collaborations: {
    handle: 'collaborations',
    title: 'Collaborations',
    description: 'We work with individuals, brands, and businesses to craft bespoke bottles of Scotch whisky.',
    coverImage: 'images/products/collaborations/collaborations.jpg',
    products: ['hoonjuice', 'glasgow850', 'joeydunlop', 'goldendrop', 'dramsylvania', 'caskslug', 'poachersdram'],
    cta: 'yourownbrand',
    template: 'default',
  },

  andrewsofbothwell: {
    handle: 'andrewsofbothwell',
    title: 'Andrews of Bothwell',
    description: "The Andys' own bottles, all with minimal fuss. Speyside at their heart, with a dash of Highland and Islay.",
    coverImage: 'images/products/twaandras/twaandras.jpg',
    products: ['doctorsspecial', 'braxtoncrackers', 'weemansblend', 'yerauntfannys', 'scotsenglishman'],
    template: 'default',
  },

  football: {
    handle: 'football',
    title: 'Football',
    description: "We love partnering with clubs to create something truly special — giving fans the perfect way to toast and celebrate their teams.",
    coverImage: 'images/products/football/football.jpg',
    products: ['80yearsofthebinos'],
    cta: 'yourownbrand',
    template: 'default',
  },

  iconicscotland: {
    handle: 'iconicscotland',
    title: 'Iconic Scotland',
    description: 'Bottles of Scotch featuring reproductions of iconic works of art on our very own canvas label to celebrate different Scottish locations.',
    coverImage: 'images/products/iconicscotland/iconicscotland.png',
    products: ['glasgow'],
    template: 'default',
  },

  qualitypatter: {
    handle: 'qualitypatter',
    title: 'Quality Patter',
    description: "Sometimes you want to say more with a gift to someone, but don't always have the right words. Well, we've got you covered.",
    coverImage: 'images/products/qualitypatter/qualitypatter.png',
    products: ['saythanks'],
    template: 'default',
  },

};

// ── Shop page configuration ───────────────────────────────────────────────
//
// filters: ordered collection handles to show as filter tabs.
// 'featured' is always prepended, 'sale' is always appended — do not list them here.
//
window.WB_SHOP_CONFIG = {
  filters: ['andrewsofbothwell', 'weebits', 'custom', 'collaborations'],
};
