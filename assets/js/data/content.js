/**
 * Editorial content — brand story, ingredient library, quiz logic, FAQs.
 * Brand facts (founder, dates, location, contact) are from aeindryskincare.com.
 */

export const BRAND = {
  name: 'Aeindry',
  fullName: 'Aeindry Skincare',
  tagline: 'All Natural Handmade Skincare where Purity is Essence',
  shortTag: 'Purity is Essence',
  founder: 'Riddhima Mohiley',
  founded: 2020,
  journeyStarted: 2012,
  region: 'Pacific Northwest',
  city: 'Sammamish, Washington',
  email: 'contactus@aeindryskincare.com',
  phone: '+1 312-909-7034',
  phoneHref: '+13129097034',
  instagram: 'https://www.instagram.com/aeindryskincare/',
  facebook: 'https://www.facebook.com/aeindryskincare/',
  instagramHandle: '@aeindryskincare'
};

/** Claims that appear as the scrolling promise band. */
export const PROMISES = [
  '100% Natural',
  'Handmade in Washington',
  'No Preservatives',
  'No Silicon',
  'No Formaldehyde',
  'No Parabens',
  'Woman Owned',
  'Small Batch',
  'Pure Essential Oils',
  'No Harsh Chemicals'
];

/** The four pillars shown on the home page. */
export const PILLARS = [
  {
    id: 'formulated',
    title: 'Formulated, not guessed',
    body: 'Riddhima is a certified formulator and a biotechnologist. Every recipe is built on the chemistry of the plant, then tested on the toughest critic in the house — her own family.',
    icon: 'flask'
  },
  {
    id: 'whole',
    title: 'Whole plants, whole butters',
    body: 'Plant oils, botanical extracts and rich butters — cocoa, shea, mango, kokum. Nothing is stripped down to an isolate because the isolate was cheaper to ship.',
    icon: 'leaf'
  },
  {
    id: 'nothing',
    title: 'And nothing else',
    body: 'No preservatives. No silicon, no formaldehyde, no parabens, no harsh chemicals. When a formula does not need water, we do not add it — so it does not need preserving either.',
    icon: 'shield'
  },
  {
    id: 'hands',
    title: 'Made by two hands',
    body: 'Poured, cut, cured and labelled in small batches in Sammamish, Washington. If a bar is a little different from the last one, that is because it is.',
    icon: 'hand'
  }
];

/** Founder story, scrubbed as the reader scrolls. */
export const TIMELINE = [
  {
    year: '2012',
    title: 'It starts with a rash',
    body: 'Our son develops allergies and eczema. The prescriptions work, and then they stop working, and the steroids keep getting stronger. Riddhima — a mom, a biotechnologist — starts reading ingredient labels the way she used to read papers.',
    accent: '#C98E8E'
  },
  {
    year: '2013',
    title: 'A world of ingredients',
    body: 'The research goes global: shea from West Africa, kokum from the Western Ghats, cold-pressed oils and the herbal infusions her grandmother would have recognised. Recipes get written, mixed, thrown out, rewritten.',
    accent: '#D8A54A'
  },
  {
    year: '2015',
    title: 'The lotion that worked',
    body: 'A hand and body lotion finally holds. The skin calms. The steroid prescriptions get smaller, then rarer. It is the first proof that the ingredient list was the problem all along.',
    accent: '#7FBFA0'
  },
  {
    year: '2017',
    title: 'Then the soap',
    body: 'Commercial soap kept undoing the progress, so the soap had to be made too. Cold process, glycerin left in, cured six weeks. Friends start asking for bars. Then friends of friends.',
    accent: '#9B8FC7'
  },
  {
    year: '2020',
    title: 'Aeindry is born',
    body: 'What began at a kitchen counter becomes a company: a small, woman-owned, 100% natural handmade skincare business, founded and made in the Pacific Northwest.',
    accent: '#D08A5C'
  },
  {
    year: 'Today',
    title: 'Still the same kitchen logic',
    body: 'Twelve products, small batches, local markets around Seattle and a growing shelf of regulars. Every formula still has to pass the original test: would you put it on a child with eczema?',
    accent: '#86AC8B'
  }
];

/** Ingredient library — the interactive explorer. */
export const INGREDIENTS = [
  {
    id: 'shea-butter', name: 'Shea Butter', latin: 'Butyrospermum parkii', origin: 'West Africa',
    family: 'butter', color: '#E8D9B8',
    role: 'Barrier repair',
    body: 'Unrefined and cold-pressed, shea is roughly 10% unsaponifiables — the fraction that actually calms inflamed skin rather than just sitting on it. It is the backbone of almost everything we make.',
    foundIn: ['specialty-soap', 'salve', 'face-cream', 'deodorant', 'perfume', 'shave-soap']
  },
  {
    id: 'cocoa-butter', name: 'Cocoa Butter', latin: 'Theobroma cacao', origin: 'West Africa & South America',
    family: 'butter', color: '#E3C79B',
    role: 'Occlusive hold',
    body: 'Solid at room temperature and melting at exactly body heat, cocoa butter is what makes a lip balm stay put in wind and a bath bomb leave the water soft.',
    foundIn: ['lip-balm', 'specialty-soap', 'essential-oil-bath-bomb']
  },
  {
    id: 'mango-butter', name: 'Mango Butter', latin: 'Mangifera indica', origin: 'South Asia',
    family: 'butter', color: '#F0DFAE',
    role: 'Rich, non-greasy',
    body: 'Lighter than shea and far less waxy than cocoa. It gives the face cream its richness without the shine — the reason the cream disappears matte.',
    foundIn: ['face-cream']
  },
  {
    id: 'coconut-oil', name: 'Organic Virgin Coconut Oil', latin: 'Cocos nucifera', origin: 'South & Southeast Asia',
    family: 'oil', color: '#F6F0E2',
    role: 'Cleansing & antibacterial',
    body: 'In soap it is what makes lather. On skin, its lauric acid does quiet antibacterial work — which is why the deodorant does not need anything harsher.',
    foundIn: ['specialty-soap', 'lip-balm', 'deodorant', 'shave-soap']
  },
  {
    id: 'olive-oil', name: 'Olive Oil', latin: 'Olea europaea', origin: 'Mediterranean',
    family: 'oil', color: '#C8CE8E',
    role: 'The infusion base',
    body: 'Gentle enough for the most reactive skin, and stable enough to sit for six weeks drawing the good out of calendula and comfrey. Every salve starts here.',
    foundIn: ['salve', 'specialty-soap', 'shave-soap']
  },
  {
    id: 'castor-oil', name: 'Castor Oil', latin: 'Ricinus communis', origin: 'East Africa & India',
    family: 'oil', color: '#EFE6C4',
    role: 'Lather & shine',
    body: 'A little makes soap lather creamy instead of bubbly, and gives lip balm its faint natural gloss. Too much makes everything sticky — the craft is in the percentage.',
    foundIn: ['lip-balm', 'specialty-soap', 'shave-soap']
  },
  {
    id: 'avocado-oil', name: 'Avocado Oil', latin: 'Persea americana', origin: 'Central America',
    family: 'oil', color: '#C3D3A0',
    role: 'Deep conditioning',
    body: 'Heavy in oleic acid and unusually rich in vitamins A, D and E. It penetrates further than most oils, which is what dry, cracked skin actually needs.',
    foundIn: ['lip-balm', 'shave-soap']
  },
  {
    id: 'rosehip-oil', name: 'Rosehip Seed Oil', latin: 'Rosa canina', origin: 'Chile & the Andes',
    family: 'oil', color: '#E9B08C',
    role: 'Tone & texture',
    body: 'Naturally high in trans-retinoic acid precursors — the gentle, plant-side of the vitamin A story. Cold-pressed, kept in the dark, used at a real percentage.',
    foundIn: ['face-cream']
  },
  {
    id: 'jojoba-oil', name: 'Jojoba', latin: 'Simmondsia chinensis', origin: 'Sonoran Desert',
    family: 'oil', color: '#EBD79A',
    role: 'Skin-identical',
    body: 'Technically a liquid wax, and close enough to human sebum that skin treats it as its own. It never goes rancid, which is why it belongs in a preservative-free formula.',
    foundIn: ['face-cream', 'perfume', 'essential-oil']
  },
  {
    id: 'sea-buckthorn', name: 'Sea Buckthorn', latin: 'Hippophae rhamnoides', origin: 'Himalaya & Northern Europe',
    family: 'oil', color: '#E68A3C',
    role: 'Repair & radiance',
    body: 'Brilliant orange, extraordinarily high in omega-7. A few drops per batch is all the face cream needs — any more and you would notice the colour on your face.',
    foundIn: ['face-cream']
  },
  {
    id: 'calendula', name: 'Calendula', latin: 'Calendula officinalis', origin: 'Our own garden',
    family: 'herb', color: '#E7A93A',
    role: 'Calms the angry',
    body: 'The single most important herb in the salve. Petals are dried, steeped in olive oil for six weeks, then pressed. It is the reason the salve helps skin that nothing else settles.',
    foundIn: ['salve', 'powder-to-foam-cleanser']
  },
  {
    id: 'marshmallow-root', name: 'Marshmallow Root', latin: 'Althaea officinalis', origin: 'Europe & West Asia',
    family: 'herb', color: '#DCCDB0',
    role: 'Slip & softness',
    body: 'A natural mucilage that turns water silky. It is why a powder cleanser can foam without a single stripping surfactant doing the work.',
    foundIn: ['powder-to-foam-cleanser']
  },
  {
    id: 'colloidal-oat', name: 'Colloidal Oatmeal', latin: 'Avena sativa', origin: 'Temperate everywhere',
    family: 'herb', color: '#EADCBD',
    role: 'The eczema standard',
    body: 'One of the very few natural actives with genuine clinical backing for itch. Milled to a colloid so it suspends in water instead of sinking to the bottom.',
    foundIn: ['powder-to-foam-cleanser', 'specialty-soap']
  },
  {
    id: 'kaolin-clay', name: 'Kaolin Clay', latin: 'Kaolinite', origin: 'Cornwall & Georgia, USA',
    family: 'mineral', color: '#F0E9E0',
    role: 'Gentle draw',
    body: 'The mildest of the cosmetic clays. It absorbs excess oil without stripping, and gives soap and deodorant their silky, non-chalky feel.',
    foundIn: ['specialty-soap', 'powder-to-foam-cleanser', 'deodorant', 'shave-soap', 'essential-oil-bath-bomb']
  },
  {
    id: 'bentonite-clay', name: 'Bentonite Clay', latin: 'Montmorillonite', origin: 'Wyoming',
    family: 'mineral', color: '#CFC7B4',
    role: 'Blade slip',
    body: 'Swells in water into something genuinely slippery. In shave soap it is the difference between a blade gliding and a blade dragging.',
    foundIn: ['shave-soap']
  },
  {
    id: 'magnesium', name: 'Magnesium Hydroxide', latin: 'Mg(OH)₂', origin: 'Seawater',
    family: 'mineral', color: '#E4EAEA',
    role: 'Odour, without the burn',
    body: 'Neutralises odour-causing bacteria at a pH skin can live with — unlike baking soda, which works and then, for a lot of people, starts to burn.',
    foundIn: ['deodorant']
  },
  {
    id: 'arrowroot', name: 'Arrowroot Powder', latin: 'Maranta arundinacea', origin: 'Caribbean & South America',
    family: 'mineral', color: '#F4F1E8',
    role: 'Moisture management',
    body: 'A fine, silky starch that handles damp without the respiratory questions that hang over talc. It gives the deodorant its dry finish.',
    foundIn: ['deodorant']
  },
  {
    id: 'rice-powder', name: 'Rice Powder', latin: 'Oryza sativa', origin: 'East & South Asia',
    family: 'herb', color: '#F2ECDD',
    role: 'Soft polish',
    body: 'Ground fine enough to polish rather than scratch. Centuries older than any exfoliating acid, and considerably kinder to a compromised barrier.',
    foundIn: ['powder-to-foam-cleanser']
  },
  {
    id: 'beeswax', name: 'Beeswax', latin: 'Cera alba', origin: 'Local Washington apiaries',
    family: 'wax', color: '#E9C97A',
    role: 'Structure & seal',
    body: 'It sets a balm, holds a perfume solid, and forms a breathable seal that keeps water in the skin instead of evaporating off it.',
    foundIn: ['lip-balm', 'salve', 'perfume']
  },
  {
    id: 'epsom-salt', name: 'Epsom Salt', latin: 'Magnesium sulfate', origin: 'Epsom, England',
    family: 'mineral', color: '#EFF3F2',
    role: 'The long soak',
    body: 'Dissolves warm and soft. Whether the magnesium truly crosses the skin is still argued over; that a hot Epsom bath unknots a back is not.',
    foundIn: ['essential-oil-bath-bomb']
  },
  {
    id: 'vitamin-e', name: 'Vitamin E', latin: 'Tocopherol', origin: 'Sunflower-derived',
    family: 'oil', color: '#E5C766',
    role: 'Keeps oils honest',
    body: 'Not a preservative — it cannot stop microbes. It is an antioxidant that keeps the oils themselves from turning, which is the only kind of spoiling an anhydrous formula can do.',
    foundIn: ['face-cream', 'lip-balm', 'salve', 'deodorant', 'perfume']
  },
  {
    id: 'essential-oils', name: 'Pure Essential Oils', latin: 'Steam-distilled botanicals', origin: 'Sourced worldwide',
    family: 'aroma', color: '#B5C4A0',
    role: 'Scent, and more',
    body: 'Never fragrance oil. Every scent in the range comes from steam-distilled or cold-pressed plant material, used at percentages that respect what these compounds actually do on skin.',
    foundIn: ['specialty-soap', 'salve', 'perfume', 'essential-oil', 'room-and-linen-spray', 'essential-oil-bath-bomb', 'deodorant', 'lip-balm']
  }
];

export const INGREDIENT_MAP = new Map(INGREDIENTS.map((i) => [i.id, i]));

export const INGREDIENT_FAMILIES = [
  { id: 'all',     label: 'All' },
  { id: 'butter',  label: 'Butters' },
  { id: 'oil',     label: 'Oils' },
  { id: 'herb',    label: 'Herbs' },
  { id: 'mineral', label: 'Clays & Minerals' },
  { id: 'wax',     label: 'Waxes' },
  { id: 'aroma',   label: 'Aromatics' }
];

/** What we will never use — the counter-list. */
export const NEVER_LIST = [
  { name: 'Parabens', why: 'Preservatives with an endocrine question mark we would rather not answer.' },
  { name: 'Formaldehyde donors', why: 'Slow-release preservatives. A known sensitiser, common in "gentle" products.' },
  { name: 'Silicones', why: 'They make skin feel smooth by coating it. Feel is not repair.' },
  { name: 'Synthetic fragrance', why: 'A single "fragrance" on a label can hide dozens of undisclosed compounds.' },
  { name: 'Baking soda', why: 'Effective in deodorant, and at pH 9 it burns a lot of people. Magnesium does the job kinder.' },
  { name: 'Petrolatum', why: 'It seals, but it gives skin nothing. Butters do both.' },
  { name: 'Synthetic dyes', why: 'Clays, roots and botanicals colour everything we make. They also rinse out of towels.' },
  { name: 'SLS & harsh detergents', why: 'They clean by stripping. A compromised barrier cannot afford it.' }
];

/** Ritual builder — concern → routine. */
export const CONCERNS = [
  { id: 'eczema',    label: 'Eczema & flare-ups', icon: 'shield', body: 'Itchy, cracked or reactive patches that come and go.' },
  { id: 'dry',       label: 'Dryness & tightness', icon: 'drop',  body: 'Skin that feels tight after washing, all year or just in winter.' },
  { id: 'sensitive', label: 'Sensitivity & redness', icon: 'leaf', body: 'Products sting, and your face tells you about it.' },
  { id: 'oily',      label: 'Congestion & shine', icon: 'sun',    body: 'Oily zones, blocked pores, a shine by midday.' },
  { id: 'aging',     label: 'Tone & texture', icon: 'star',       body: 'Fine lines, uneven tone, skin that lost its bounce.' },
  { id: 'muscle',    label: 'Aches & tension', icon: 'bolt',      body: 'Shoulders, backs and legs after a long week.' },
  { id: 'sleep',     label: 'Winding down', icon: 'moon',         body: 'Trouble switching off at the end of the day.' },
  { id: 'daily',     label: 'A simple daily ritual', icon: 'circle', body: 'Nothing wrong — you just want good, honest basics.' }
];

export const ROUTINES = {
  eczema: {
    title: 'The Calm Barrier ritual',
    intro: 'This is the routine the company was built to solve. Strip nothing, seal everything, and keep the ingredient list short enough to rule things out.',
    steps: [
      { step: 'Cleanse', productId: 'powder-to-foam-cleanser', variantId: 'oat-original', why: 'Waterless, so there is no preservative to react to. Colloidal oat is the one natural active with real clinical backing for itch.' },
      { step: 'Wash',    productId: 'specialty-soap', variantId: 'lavender-oat', why: 'Glycerin-rich cold process instead of a stripping detergent bar.' },
      { step: 'Treat',   productId: 'salve', variantId: 'calendula', why: 'Six-week calendula infusion — the original formula that reduced the steroid prescriptions.' },
      { step: 'Seal',    productId: 'face-cream', variantId: 'fragrance-free', why: 'Fragrance-free, so nothing volatile touches broken skin.' }
    ]
  },
  dry: {
    title: 'The Deep Winter ritual',
    intro: 'Pacific Northwest damp outside, dry heat inside. The answer is butters, and applying them to damp skin so there is water to seal in.',
    steps: [
      { step: 'Soften', productId: 'essential-oil-bath-bomb', variantId: 'lavender-dream', why: 'The cocoa butter heart melts into the water, so you come out conditioned rather than stripped.' },
      { step: 'Wash',   productId: 'specialty-soap', variantId: 'turmeric-honey', why: 'Rich butters in the bar itself — cleansing that does not undo the bath.' },
      { step: 'Face',   productId: 'face-cream', variantId: 'rose-frank', why: 'Mango, kokum and shea. Press it into damp skin, do not rub.' },
      { step: 'Lips',   productId: 'lip-balm', variantId: 'vanilla-cocoa', why: 'Cocoa butter holds through wind in a way petrolatum never quite does.' }
    ]
  },
  sensitive: {
    title: 'The Nothing-Added ritual',
    intro: 'When everything stings, the fix is subtraction. Every product here has a fragrance-free or near-neutral option so you can isolate what your skin is reacting to.',
    steps: [
      { step: 'Cleanse', productId: 'powder-to-foam-cleanser', variantId: 'oat-original', why: 'No water, no preservatives, no surfactant harsh enough to matter.' },
      { step: 'Tools',   productId: 'face-wipe-washing-net', variantId: 'set', why: 'Soft double-gauze instead of a disposable round that drags.' },
      { step: 'Moisturise', productId: 'face-cream', variantId: 'blue-tansy', why: 'Blue tansy and aloe for skin that flushes.' },
      { step: 'Underarms', productId: 'deodorant', variantId: 'unscented', why: 'No baking soda, no fragrance — the two usual culprits.' }
    ]
  },
  oily: {
    title: 'The Clear & Balanced ritual',
    intro: 'Oily skin is usually over-stripped skin overcompensating. Clarify with clay and charcoal, then — counter-intuitively — keep moisturising.',
    steps: [
      { step: 'Wash',    productId: 'specialty-soap', variantId: 'charcoal-tea', why: 'Activated charcoal and tea tree, without the drying detergents.' },
      { step: 'Cleanse', productId: 'powder-to-foam-cleanser', variantId: 'rice-clay', why: 'Rice and rose clay polish and absorb without scratching.' },
      { step: 'Hydrate', productId: 'face-cream', variantId: 'blue-tansy', why: 'Light and matte. Skipping moisturiser is what made it oily.' },
      { step: 'Freshen', productId: 'room-and-linen-spray', variantId: 'lemon-sage', why: 'Mist the pillowcase between washes.' }
    ]
  },
  aging: {
    title: 'The Slow Glow ritual',
    intro: 'Rosehip and sea buckthorn do the tone-and-texture work, gently and over months. Everything here is about consistency rather than intensity.',
    steps: [
      { step: 'Cleanse', productId: 'powder-to-foam-cleanser', variantId: 'rice-clay', why: 'A soft weekly polish that never compromises the barrier.' },
      { step: 'Treat',   productId: 'face-cream', variantId: 'rose-frank', why: 'Rosehip for the plant-side of the vitamin A story, sea buckthorn for radiance.' },
      { step: 'Wash',    productId: 'specialty-soap', variantId: 'rose-clay', why: 'Rose clay and geranium — gentle enough for daily use on the body.' },
      { step: 'Scent',   productId: 'perfume', variantId: 'rose-oud', why: 'Alcohol-free, so it conditions the skin it wears on.' }
    ]
  },
  muscle: {
    title: 'The Recovery ritual',
    intro: 'Heat, magnesium and the warming oils — arnica, camphor, menthol, ginger. Built for the evening after a long week.',
    steps: [
      { step: 'Soak',    productId: 'essential-oil-bath-bomb', variantId: 'eucalyptus-mint', why: 'Epsom salt and a long, slow fizz.' },
      { step: 'Rub',     productId: 'salve', variantId: 'muscle-rub', why: 'Arnica, camphor and menthol in a fast-penetrating base.' },
      { step: 'Roll',    productId: 'essential-oil', variantId: 'ease', why: 'Copaiba and ginger, pre-diluted, for the shoulders at your desk.' },
      { step: 'Wash',    productId: 'specialty-soap', variantId: 'cedar-moss', why: 'Cedarwood and moss — grounding, forest-green.' }
    ]
  },
  sleep: {
    title: 'The Wind-Down ritual',
    intro: 'Scent is the fastest route to the nervous system. Lavender and chamomile, layered from the bath to the pillow.',
    steps: [
      { step: 'Bath',   productId: 'essential-oil-bath-bomb', variantId: 'lavender-dream', why: 'Start the signal an hour before bed.' },
      { step: 'Wash',   productId: 'specialty-soap', variantId: 'lavender-oat', why: 'Lavender and colloidal oat — calm on both counts.' },
      { step: 'Roll',   productId: 'essential-oil', variantId: 'calm', why: 'Lavender and chamomile at the temples and wrists.' },
      { step: 'Linens', productId: 'room-and-linen-spray', variantId: 'lavender-linen', why: 'Two pumps on the pillowcase, ten minutes before you lie down.' }
    ]
  },
  daily: {
    title: 'The Everyday Essentials',
    intro: 'The four things most people end up reordering. No concern to solve — just honest basics that do what they say.',
    steps: [
      { step: 'Wash',    productId: 'specialty-soap', variantId: 'lavender-oat', why: 'The bestseller. Six-week cure, glycerin left in.' },
      { step: 'Face',    productId: 'face-cream', variantId: 'rose-frank', why: 'Rich in the jar, matte on the skin.' },
      { step: 'Lips',    productId: 'lip-balm', variantId: 'peppermint', why: 'Five ingredients, all edible.' },
      { step: 'Underarms', productId: 'deodorant', variantId: 'bergamot-cedar', why: 'A jar lasts about three months.' }
    ]
  }
};

/** Scent quiz — three questions, weighted scoring onto scent families. */
export const SCENT_QUIZ = [
  {
    id: 'place',
    question: 'Where would you rather wake up?',
    options: [
      { label: 'A cabin under Douglas firs',   sub: 'Damp bark, cold air',   weights: { woody: 3, earthy: 2 } },
      { label: 'A garden after the rain',      sub: 'Wet petals, green stems', weights: { floral: 3, herbal: 2 } },
      { label: 'A lemon grove at noon',        sub: 'Warm rind, bright light', weights: { citrus: 3, floral: 1 } },
      { label: 'A herb kitchen mid-morning',   sub: 'Rosemary, sage, steam',   weights: { herbal: 3, earthy: 1 } }
    ]
  },
  {
    id: 'want',
    question: 'What do you want the scent to do?',
    options: [
      { label: 'Settle me',      sub: 'Lower the volume',      weights: { floral: 2, herbal: 2, earthy: 1 } },
      { label: 'Wake me up',     sub: 'Sharpen the morning',   weights: { citrus: 3, herbal: 1 } },
      { label: 'Ground me',      sub: 'Feet on the floor',     weights: { woody: 3, earthy: 2 } },
      { label: 'Barely be there', sub: 'Clean, and that is all', weights: { unscented: 4 } }
    ]
  },
  {
    id: 'time',
    question: 'When will you reach for it?',
    options: [
      { label: 'First thing',    sub: 'Before the day begins', weights: { citrus: 2, herbal: 2 } },
      { label: 'Through the day', sub: 'At the desk, in the car', weights: { woody: 2, citrus: 1, floral: 1 } },
      { label: 'Last thing',     sub: 'Bath, bed, quiet',      weights: { floral: 2, herbal: 2, earthy: 1 } },
      { label: 'On the flare-ups', sub: 'When skin misbehaves', weights: { unscented: 4 } }
    ]
  }
];

export const SCENT_PROFILES = {
  woody:     { label: 'Woody & Grounding', body: 'Cedar, vetiver, fir and sandalwood. Quiet, warm, and closer to the forest floor than the flower bed.', color: '#7A6249' },
  floral:    { label: 'Floral & Soft',     body: 'Rose, geranium, lavender and neroli. Gentle without being sweet — the scents that read as calm.',      color: '#C98E8E' },
  citrus:    { label: 'Citrus & Bright',   body: 'Sweet orange, bergamot, lemon. The scent equivalent of opening a window.',                            color: '#E8A64C' },
  herbal:    { label: 'Herbal & Clear',    body: 'Rosemary, peppermint, sage, eucalyptus. Clean, green, and slightly medicinal in the best way.',       color: '#5E9E7A' },
  earthy:    { label: 'Earthy & Deep',     body: 'Moss, clay, patchouli and oakmoss. For people who like the smell of rain on soil.',                   color: '#5C7355' },
  unscented: { label: 'Unscented & Pure',  body: 'Nothing added. For reactive skin, shared offices, and anyone who has had enough of being marketed a mood.', color: '#D3C2A6' }
};

/** Which variants to recommend per scent family. */
export const SCENT_MATCHES = {
  woody:     [['perfume','vetiver-vanilla'], ['specialty-soap','cedar-moss'], ['room-and-linen-spray','cedar-smoke'], ['deodorant','bergamot-cedar']],
  floral:    [['perfume','rose-oud'], ['specialty-soap','rose-clay'], ['face-cream','rose-frank'], ['essential-oil-bath-bomb','rose-garden']],
  citrus:    [['lip-balm','sweet-orange'], ['room-and-linen-spray','lemon-sage'], ['essential-oil-bath-bomb','citrus-grove'], ['deodorant','bergamot-cedar']],
  herbal:    [['essential-oil','focus'], ['specialty-soap','lavender-oat'], ['salve','chest-rub'], ['deodorant','lavender-sage']],
  earthy:    [['specialty-soap','cedar-moss'], ['room-and-linen-spray','douglas-fir'], ['perfume','vetiver-vanilla'], ['salve','calendula']],
  unscented: [['lip-balm','unscented'], ['face-cream','fragrance-free'], ['deodorant','unscented'], ['shave-soap','unscented']]
};

export const TESTIMONIALS = [
  { quote: 'My son has had eczema since he was two. The calendula salve is the first thing that has let us go a whole winter without a steroid script. I do not say that lightly.', name: 'Marisa T.', meta: 'Redmond, WA', product: 'Herbal Salve' },
  { quote: 'I have thrown away four natural deodorants that burned. This one does not, and it actually lasts through a shift. The jar has lasted me since February.', name: 'Devon R.', meta: 'Seattle, WA', product: 'Deodorant Cream' },
  { quote: 'The charcoal and tea tree bar cleared up back acne that two prescriptions did not touch. My whole family has switched over.', name: 'Priya N.', meta: 'Bellevue, WA', product: 'Specialty Soap' },
  { quote: 'Bought the face cream at the Redmond Saturday Market half expecting it to be another pretty jar. Six months later I have repurchased three times.', name: 'Elena K.', meta: 'Sammamish, WA', product: 'Face Cream' },
  { quote: 'The powder cleanser is genuinely clever — nothing to leak in a bag, and my skin stopped feeling tight after washing for the first time in years.', name: 'Jordan M.', meta: 'Portland, OR', product: 'Powder to Foam Cleanser' },
  { quote: 'Riddhima spent twenty minutes at her market stall talking me out of the expensive thing and into the right thing. That is why I keep going back.', name: 'Alice W.', meta: 'Bothell, WA', product: 'Solid Perfume' }
];

export const FAQS = [
  { q: 'Why are there no preservatives?', a: 'Because most of what we make contains no water. Microbes need water to grow, so an anhydrous formula — a balm, a salve, a solid perfume, a powder cleanser — has nothing to preserve against. Where a formula does contain water, like the Room & Linen Spray, we say so and use a trace of grain alcohol. We would rather reformulate around the problem than add a preservative to solve it.' },
  { q: 'Is this safe for children and eczema-prone skin?', a: 'This is the skin the company was built for. Our son\'s eczema is the reason any of it exists. Start with the fragrance-free and unscented options, patch test on a small area for a few days, and introduce one product at a time so you can tell what is helping. The bath bombs are formulated at an essential-oil strength that is gentle enough for children.' },
  { q: 'How long do the products last?', a: 'Anhydrous products keep 12–18 months from the date on the base — vitamin E slows the oils from turning, which is the only kind of spoiling they can do. Soap only improves: a cured bar gets harder and milder with age. Keep everything out of direct sun and away from a steamy shower shelf.' },
  { q: 'Why can I only get the CBD Muscle Rub in Washington?', a: 'State law. Hemp-derived CBD in topical products is regulated state by state, and we ship it only within Washington State so that we stay comfortably on the right side of it. Every other salve variant ships anywhere we ship.' },
  { q: 'What does "cured six weeks" actually mean?', a: 'Cold process soap is safe to use after about 48 hours, but it is still soft and full of water. Six weeks on a curing rack lets that water evaporate: the bar gets harder, lathers better, and lasts two or three times longer in the shower. It is the least glamorous part of the process and the one that matters most.' },
  { q: 'Do you test on animals?', a: 'Never. Formulas are tested on the founder, her family, and a very patient circle of friends. Nothing we make contains an animal-derived ingredient other than beeswax and honey, both from local Washington apiaries.' },
  { q: 'Where can I find you in person?', a: 'We sell at markets around the Seattle area through the season, including the Redmond Saturday Market, and through local handmade markets in Bothell. Follow along on Instagram for the current schedule — that is where dates get posted first.' },
  { q: 'Something arrived damaged, or is not right for me.', a: 'Email contactus@aeindryskincare.com and tell us what happened. Small company, real person reading it. We will make it right — a replacement, a swap for a different scent, or a refund, whichever suits you.' }
];

export const JOURNAL = [
  {
    id: 'six-week-cure',
    title: 'Why we cure soap for six weeks',
    excerpt: 'A cold process bar is technically safe to use in 48 hours. Everything that makes it good happens in the six weeks after.',
    read: '4 min',
    date: 'March 2026',
    tag: 'Craft',
    color: '#C9B79A'
  },
  {
    id: 'baking-soda',
    title: 'The baking soda problem',
    excerpt: 'It works. That is the trouble — it works right up until the morning your underarms are raw, and then it never works again.',
    read: '5 min',
    date: 'February 2026',
    tag: 'Formulation',
    color: '#A0824F'
  },
  {
    id: 'water-preservatives',
    title: 'No water, no preservatives',
    excerpt: 'The cleanest way to keep a preservative off an ingredient list is to build a formula that never needed one.',
    read: '6 min',
    date: 'January 2026',
    tag: 'Formulation',
    color: '#7FBFA0'
  },
  {
    id: 'calendula-infusion',
    title: 'Six weeks in oil: the calendula infusion',
    excerpt: 'Heat extraction takes two hours and gets you most of the way. We take six weeks for the rest of it.',
    read: '4 min',
    date: 'December 2025',
    tag: 'Ingredients',
    color: '#E7A93A'
  },
  {
    id: 'patch-testing',
    title: 'How to patch test properly',
    excerpt: 'Most people patch test for an hour. Contact dermatitis often takes three days to show up.',
    read: '3 min',
    date: 'November 2025',
    tag: 'Guides',
    color: '#9B8FC7'
  },
  {
    id: 'winter-barrier',
    title: 'Your barrier in a Pacific Northwest winter',
    excerpt: 'Damp outside, forced air inside, and a shower hot enough to hurt. Here is what that combination actually does.',
    read: '5 min',
    date: 'October 2025',
    tag: 'Guides',
    color: '#5E9BA8'
  }
];

export const STATS = [
  { value: 2012, suffix: '', label: 'The year the research started', prefix: '', group: false },
  { value: 12,   suffix: '',  label: 'Formulas, made in small batches', prefix: '' },
  { value: 6,    suffix: ' wks', label: 'Cure time on every soap bar', prefix: '' },
  { value: 100,  suffix: '%', label: 'Natural, with nothing hidden', prefix: '' }
];
