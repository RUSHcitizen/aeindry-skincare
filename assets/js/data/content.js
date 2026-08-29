/**
 * Editorial content — brand story, ingredient library, quiz logic, FAQs.
 * Brand facts (founder, dates, location, contact) are from aeindryskincare.com.
 *
 * This file reads the catalogue but is never read by it: the dependency runs
 * one way, so an ingredient can say which jar it is in without the catalogue
 * needing to know the encyclopedia exists.
 */
import { PRODUCTS } from './products.js';

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
    body: 'Our son develops allergies and eczema. Riddhima — a mom, a certified formulator and a biotechnologist — starts reading ingredient labels the way she used to read papers, and the natural skincare journey begins.',
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
    title: 'A formula worth keeping',
    body: 'After years of mixing, throwing out and rewriting, a hand and body lotion finally holds together the way it should — rich, stable, and built from a list short enough to read aloud.',
    accent: '#7FBFA0'
  },
  {
    year: '2017',
    title: 'Then the soap',
    body: 'The focus turns to natural soap. Cold process, glycerin left in, cured six weeks. Friends start asking for bars. Then friends of friends.',
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
    body: 'Eight products, small batches, local markets around Seattle and a growing shelf of regulars. Every formula still has to pass the original test: would you put it on a child with eczema?',
    accent: '#86AC8B'
  }
];

/**
 * Ingredient library — the interactive explorer.
 *
 * Every entry is something printed on a label in the range. `foundIn` is not
 * written here: it is derived below from each product's own `keyIngredients`,
 * so the encyclopedia and the catalogue cannot say different things about
 * which jar an ingredient is in.
 */
const INGREDIENT_ENTRIES = [
  /* ── Butters ─────────────────────────────────────────────────────────── */
  {
    id: 'shea-butter', name: 'Shea Butter', latin: 'Butyrospermum parkii', origin: 'West Africa',
    family: 'butter', color: '#E8D9B8',
    role: 'Barrier repair',
    body: 'Unrefined and cold-pressed, shea is roughly 10% unsaponifiables — the fraction that calms inflamed skin rather than just sitting on it. It is the backbone of almost everything here.'
  },
  {
    id: 'cocoa-butter', name: 'Cocoa Butter', latin: 'Theobroma cacao', origin: 'West Africa & South America',
    family: 'butter', color: '#E3C79B',
    role: 'Occlusive hold',
    body: 'Solid at room temperature and melting at exactly body heat. It is what lets a whipped butter hold its shape in the tin and then give way the moment it touches skin.'
  },
  {
    id: 'cupuacu-butter', name: 'Cupuaçu Butter', latin: 'Theobroma grandiflorum', origin: 'The Amazon basin',
    family: 'butter', color: '#EFE0C6',
    role: 'Holds water in hair',
    body: 'A cousin of cocoa, and unusual among butters for how much water it will take up and hold. That is the property the hair mask is built on — it conditions by keeping moisture in the strand rather than coating it.'
  },
  {
    id: 'murumuru-butter', name: 'Murumuru Butter', latin: 'Astrocaryum murumuru', origin: 'Amazonian palm',
    family: 'butter', color: '#F2E8D4',
    role: 'Slip and shine',
    body: 'Pressed from the seed of an Amazonian palm and high in lauric and myristic acids. It melts thin, so a heavy treatment can go through hair without dragging it down.'
  },

  /* ── Oils ────────────────────────────────────────────────────────────── */
  {
    id: 'coconut-oil', name: 'Organic Virgin Coconut Oil', latin: 'Cocos nucifera', origin: 'South & Southeast Asia',
    family: 'oil', color: '#F6F0E2',
    role: 'Cleansing & antibacterial',
    body: 'In soap it is what makes lather. On skin, its lauric acid does quiet antibacterial work — which is why the deodorant does not need anything harsher in it.'
  },
  {
    id: 'olive-oil', name: 'Olive Oil', latin: 'Olea europaea', origin: 'Mediterranean',
    family: 'oil', color: '#C8CE8E',
    role: 'The soap base',
    body: 'Gentle enough for the most reactive skin, and stable enough to sit for six weeks drawing the good out of dried calendula. It is the base of the herbal infusions and the backbone of the bar.'
  },
  {
    id: 'rosehip-oil', name: 'Rosehip Seed Oil', latin: 'Rosa canina', origin: 'Chile & the Andes',
    family: 'oil', color: '#E9B08C',
    role: 'Tone & texture',
    body: 'Naturally high in the precursors to trans-retinoic acid — the gentle, plant-side of the vitamin A story. Cold-pressed, kept in the dark, and used at a percentage you can feel.'
  },
  {
    id: 'raspberry-seed-oil', name: 'Raspberry Seed Oil', latin: 'Rubus idaeus', origin: 'Northern Europe & North America',
    family: 'oil', color: '#D98A9A',
    role: 'Where the antioxidants come from',
    body: 'Cold-pressed from the seed left after the fruit is pressed. Very high in vitamin E and in alpha-linolenic acid, which is what makes a berry-seed oil worth the trouble of pressing it.'
  },

  /* ── Extracts & actives ──────────────────────────────────────────────── */
  {
    id: 'bakuchiol', name: 'Bakuchiol', latin: 'Psoralea corylifolia', origin: 'India & Sri Lanka',
    family: 'extract', color: '#C9A8D8',
    role: 'The plant side of retinol',
    body: 'Used for the same reasons retinol is used, and without the sting, the flaking or the sun sensitivity that comes with it. It is the reason the face oil can be a nightly thing rather than a twice-weekly one.'
  },
  {
    id: 'oat-extract', name: 'Oat Extract', latin: 'Avena sativa', origin: 'Northern Europe',
    family: 'extract', color: '#EFE4CC',
    role: 'Settles skin that reacts',
    body: 'The avenanthramides in oat are what make it the old, reliable answer to itch. It is the quiet workhorse of the hand butter — what makes a rich butter calm rather than merely greasy.'
  },
  {
    id: 'arrowroot', name: 'Arrowroot Powder', latin: 'Maranta arundinacea', origin: 'Central & South America',
    family: 'extract', color: '#F4EFE6',
    role: 'Moisture management',
    body: 'A fine, silky starch that handles damp without the respiratory questions that hang over talc. It is what gives the cream deodorant a dry finish instead of a slick one.'
  },
  {
    id: 'pine-tar', name: 'Pine Tar', latin: 'Pinus sylvestris', origin: 'Northern forests',
    family: 'extract', color: '#4A3728',
    role: 'The oldest answer to itch',
    body: 'Made by heating pine wood without oxygen until the resin runs. It has been put into soap for angry, itchy skin for a very long time, and the smell of the bar is the tar itself — nothing is added to it.'
  },

  /* ── Herbs ───────────────────────────────────────────────────────────── */
  {
    id: 'calendula', name: 'Calendula', latin: 'Calendula officinalis', origin: 'Our own garden',
    family: 'herb', color: '#E7A93A',
    role: 'The herb for angry skin',
    body: 'Petals are dried, steeped in olive oil for six weeks, then pressed — a slow infusion made this way for a very long time. It is the extract in the Bud of Rose tin, where the other four carry oat.'
  },
  {
    id: 'rosemary', name: 'Rosemary', latin: 'Salvia rosmarinus', origin: 'Mediterranean',
    family: 'herb', color: '#7E9A72',
    role: 'Scalp circulation',
    body: 'The herb with the longest history of being rubbed into a scalp, and one of the few with modern work behind it. In the hair mask it is the scalp half of the formula rather than the conditioning half.'
  },
  {
    id: 'neem', name: 'Neem', latin: 'Azadirachta indica', origin: 'The Indian subcontinent',
    family: 'herb', color: '#6E8C5A',
    role: 'Keeps a scalp clean',
    body: 'Bitter, green and unmistakable. Neem has been used on scalps and skin across South Asia for centuries for its antibacterial and antifungal reputation, and it is why the mask can sit on skin for an hour.'
  },
  {
    id: 'fenugreek', name: 'Fenugreek', latin: 'Trigonella foenum-graecum', origin: 'The Mediterranean & South Asia',
    family: 'herb', color: '#D9C07A',
    role: 'Slip and strength',
    body: 'Soaked seeds go slippery — a natural mucilage, the same trick as marshmallow root — which is what lets a thick butter comb through hair instead of tangling in it.'
  },
  {
    id: 'moringa', name: 'Moringa', latin: 'Moringa oleifera', origin: 'The Himalayan foothills',
    family: 'herb', color: '#8FA96B',
    role: 'Root nourishment',
    body: 'The leaf is one of the densest plant sources of vitamins and minerals anyone has measured, which is why it turns up in a formula aimed at the root rather than the length.'
  },

  /* ── Aromatics ───────────────────────────────────────────────────────── */
  {
    id: 'lemongrass', name: 'Lemongrass', latin: 'Cymbopogon citratus', origin: 'South & Southeast Asia',
    family: 'aroma', color: '#C4CF6E',
    role: 'Sharp, green, awake',
    body: 'Citral-rich and far greener than a true citrus. In steam it is the note that carries furthest, which is exactly what a shower steamer needs it to do.'
  },
  {
    id: 'sweet-orange', name: 'Sweet Orange', latin: 'Citrus sinensis', origin: 'Cold-pressed peel',
    family: 'aroma', color: '#E8A64C',
    role: 'The warm half of citrus',
    body: 'Cold-pressed from the peel rather than distilled, which is why it smells like the fruit and not like a cleaning product. It rounds off lemongrass’s edge.'
  },
  {
    id: 'mandarin', name: 'Mandarin', latin: 'Citrus reticulata', origin: 'Cold-pressed peel',
    family: 'aroma', color: '#EFB878',
    role: 'The soft one',
    body: 'The gentlest of the citrus oils and the one most often chosen for children. It is the third note in the steamers, and the reason they read as warm rather than sharp.'
  },
  {
    id: 'essential-oils', name: 'Pure Essential Oils', latin: 'Various', origin: 'Steam-distilled & cold-pressed',
    family: 'aroma', color: '#B7C4A0',
    role: 'Scent, and more',
    body: 'Never fragrance oil. Every scent in the range comes from steam-distilled or cold-pressed plant material, used at percentages that respect what these compounds actually do on skin.'
  },

  /* ── Wax ─────────────────────────────────────────────────────────────── */
  {
    id: 'beeswax', name: 'Beeswax', latin: 'Cera alba', origin: 'Local Washington apiaries',
    family: 'wax', color: '#E9C97A',
    role: 'Structure & seal',
    body: 'It sets a balm and forms a breathable seal that keeps water in the skin instead of letting it evaporate off. Poured on its own with a cotton wick, it is also the candle.'
  }
];

/**
 * Which products each ingredient is in, read off the catalogue rather than
 * repeated by hand. An ingredient nobody lists is kept — it is still true of
 * the ingredient — but it renders with no "found in" row.
 */
export const INGREDIENTS = INGREDIENT_ENTRIES.map((ing) => ({
  ...ing,
  foundIn: PRODUCTS.filter((p) => (p.keyIngredients || []).includes(ing.id)).map((p) => p.id)
}));

export const INGREDIENT_MAP = new Map(INGREDIENTS.map((i) => [i.id, i]));

export const INGREDIENT_FAMILIES = [
  { id: 'all',     label: 'All' },
  { id: 'butter',  label: 'Butters' },
  { id: 'oil',     label: 'Oils' },
  { id: 'extract', label: 'Extracts & Actives' },
  { id: 'herb',    label: 'Herbs' },
  { id: 'aroma',   label: 'Aromatics' },
  { id: 'wax',     label: 'Waxes' }
];

/** What we will never use — the counter-list. */
export const NEVER_LIST = [
  { name: 'Parabens', why: 'Preservatives with an endocrine question mark we would rather not answer.' },
  { name: 'Formaldehyde donors', why: 'Slow-release preservatives. A known sensitiser, common in "gentle" products.' },
  { name: 'Silicones', why: 'They make skin feel smooth by coating it. Feel is not repair.' },
  { name: 'Synthetic fragrance', why: 'A single "fragrance" on a label can hide dozens of undisclosed compounds.' },
  { name: 'Baking soda', why: 'Common in natural deodorant, and at pH 9 it irritates a lot of people. Arrowroot handles the damp instead.' },
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
      { step: 'Wash',  productId: 'pine-tar-soap', why: 'Unscented, and pine tar has been used on angry skin for a very long time. Nothing volatile in the bar at all.' },
      { step: 'Calm',  productId: 'botanical-hand-butter', variantId: 'bud-of-rose', why: 'Calendula extract rather than oat in this one — the tin to reach for when skin is already reacting.' },
      { step: 'Seal',  productId: 'body-balm', variantId: 'barrier-repair', why: 'A balm has no water in it, so it seals rather than soaks. It goes on last, over anything wetter.' }
    ]
  },
  dry: {
    title: 'The Deep Winter ritual',
    intro: 'Four steps, and the order of them is the whole trick: everything goes onto skin that is still damp, and the heaviest thing goes on last.',
    steps: [
      { step: 'Wash',  productId: 'handmade-soap', why: 'Cold process with the glycerin left in — the part most commercial soap takes out and sells separately.' },
      { step: 'Oil',   productId: 'body-oil', variantId: 'large', why: 'Straight out of the shower, onto wet skin. The water is what it is sealing in.' },
      { step: 'Cream', productId: 'body-cream', variantId: 'aloe-oats-honey', why: 'Over the oil while skin is still slightly damp. Rich enough for winter shins.' },
      { step: 'Hands', productId: 'botanical-hand-butter', variantId: 'vanilla', why: 'Hands take the most weather and get the least attention. Last thing at night.' }
    ]
  },
  sensitive: {
    title: 'The Short List ritual',
    intro: 'Nothing here is scented with anything volatile, and every step is one you can stop and still have a routine.',
    steps: [
      { step: 'Wash',  productId: 'pine-tar-soap', why: 'No essential oil in the bar whatsoever. If something is going to react, it will not be this.' },
      { step: 'Tone',  productId: 'face-toner', variantId: 'rose-rosemary', why: 'Leaves skin damp for the next step, which is most of what a toner is for.' },
      { step: 'Seal',  productId: 'face-cream', why: 'A cream over damp skin, and then nothing else. Short lists are easier to rule things out of.' },
      { step: 'Daily', productId: 'deodorant-creme', variantId: 'lavender-meadows', why: 'No aluminium, and a cream rather than a stick — no drag on freshly shaved skin.' }
    ]
  },
  oily: {
    title: 'The Clear Morning ritual',
    intro: 'Oil is not the enemy; stripping it and triggering more is. Keep it simple and let the skin settle.',
    steps: [
      { step: 'Wash',  productId: 'face-cleanser', variantId: 'clay', why: 'Clay absorbs excess oil without the squeak that makes skin overproduce to compensate.' },
      { step: 'Mask',  productId: 'jelly-face-mask', variantId: 'green-alchemy', why: 'Once a week, fifteen minutes. It peels off in one piece, which is the best part.' },
      { step: 'Treat', productId: 'face-oil', variantId: 'berry-bakuchiol', why: 'Bakuchiol for texture, without the peeling a retinol brings. Oil on oily skin is not the contradiction it sounds like.' }
    ]
  },
  aging: {
    title: 'The Long Game ritual',
    intro: 'Nothing here works in a week. All of it works over a year.',
    steps: [
      { step: 'Treat', productId: 'face-oil', variantId: 'berry-bakuchiol', why: 'Bakuchiol is the plant side of the retinol conversation, and berry-seed oils bring the antioxidants.' },
      { step: 'Eyes',  productId: 'under-eye-serum', why: 'The thinnest skin on the body gets its own step. One drop per eye, patted, never rubbed.' },
      { step: 'Seal',  productId: 'nocturn-balm', why: 'The night balm goes over everything. The smallest amount of anything we make.' },
      { step: 'Hands', productId: 'hand-butter', variantId: 'amber-orange', why: 'Hands age faster than faces and get a fraction of the attention.' }
    ]
  },
  muscle: {
    title: 'The After-Effort ritual',
    intro: 'Heat, steam and something to work into the parts that ache.',
    steps: [
      { step: 'Soak',  productId: 'coconut-milk-bath-salt', why: 'Whether the magnesium crosses the skin is still argued over; that a hot soak unknots a back is not.' },
      { step: 'Steam', productId: 'shower-steamers', variantId: 'euc-mint-large', why: 'Eucalyptus and peppermint, at the far end of the shower floor where the steam does the work.' },
      { step: 'Feet',  productId: 'foot-soak', why: 'A basin, water as hot as you can stand, twenty minutes.' },
      { step: 'Work',  productId: 'foot-cream', why: 'Onto damp skin straight after the soak, then socks. The order matters more than either step alone.' }
    ]
  },
  sleep: {
    title: 'The Wind Down ritual',
    intro: 'Four things in the order you would actually do them, ending with the room rather than the skin.',
    steps: [
      { step: 'Steam', productId: 'shower-steamers', variantId: 'lavender-large', why: 'Lavender, on the shower floor, half an hour before you want to be asleep.' },
      { step: 'Oil',   productId: 'body-oil', why: 'Onto wet skin as you get out. It is the last thing that needs any effort.' },
      { step: 'Light', productId: 'beeswax-candle', variantId: 'large', why: 'Beeswax burns slower and cleaner than paraffin, and smells of honey before it is scented at all.' },
      { step: 'Room',  productId: 'room-spray', why: 'Over the bedding an hour before you get in, so it has faded to something you notice rather than smell.' }
    ]
  },
  daily: {
    title: 'The Honest Basics ritual',
    intro: 'Nothing wrong, nothing to fix. Four good things you will actually finish.',
    steps: [
      { step: 'Wash',  productId: 'face-cleanser', variantId: 'solid-oats-honey', why: 'A solid bar is the cheapest cleanser to keep going and the longest-lasting.' },
      { step: 'Hands', productId: 'hand-butter', variantId: 'citrus-hearth', why: 'Kept by the sink and used without thinking about it.' },
      { step: 'Lips',  productId: 'lip-balm', why: 'Cheap enough to keep one in every coat, which is the only system that works.' },
      { step: 'Daily', productId: 'deodorant-creme', variantId: 'smoky-citrus', why: 'A fingertip is a whole application.' }
    ]
  }
};

/**
 * Scent quiz — three questions, weighted onto the families below.
 *
 * The weights only name families that products actually carry. A quiz that can
 * land on a family with nothing in it is a quiz that sometimes recommends an
 * empty shelf, so `tools/check-catalogue.mjs` checks every family here has at
 * least one match and at least one product.
 */
export const SCENT_QUIZ = [
  {
    id: 'place',
    question: 'Where would you rather wake up?',
    options: [
      { label: 'A cabin under Douglas firs',  sub: 'Damp bark, cold air',      weights: { woody: 3, unscented: 1 } },
      { label: 'A garden after the rain',     sub: 'Wet petals, green stems',  weights: { floral: 3, herbal: 2 } },
      { label: 'A lemon grove at noon',       sub: 'Warm rind, bright light',  weights: { citrus: 3, fruity: 1 } },
      { label: 'A kitchen mid-morning',       sub: 'Rosemary, steam, honey',   weights: { herbal: 3, sweet: 1 } }
    ]
  },
  {
    id: 'want',
    question: 'What do you want the scent to do?',
    options: [
      { label: 'Settle me',       sub: 'Lower the volume',        weights: { floral: 2, herbal: 2, woody: 1 } },
      { label: 'Wake me up',      sub: 'Sharpen the morning',     weights: { citrus: 3, herbal: 1 } },
      { label: 'Comfort me',      sub: 'Vanilla, honey, close',   weights: { sweet: 3, fruity: 1 } },
      { label: 'Barely be there', sub: 'Clean, and that is all',  weights: { unscented: 4 } }
    ]
  },
  {
    id: 'time',
    question: 'When will you reach for it?',
    options: [
      { label: 'First thing',      sub: 'Before the day begins',   weights: { citrus: 2, herbal: 2 } },
      { label: 'Through the day',  sub: 'At the desk, in the car', weights: { fruity: 2, citrus: 1, floral: 1 } },
      { label: 'Last thing',       sub: 'Shower, candle, quiet',   weights: { woody: 2, sweet: 2, floral: 1 } },
      { label: 'On the flare-ups', sub: 'When skin misbehaves',    weights: { unscented: 4 } }
    ]
  }
];

/**
 * The seven families. Every note listed is one printed on a label in the
 * range — nothing here describes a scent we do not actually sell.
 */
export const SCENT_PROFILES = {
  citrus:    { label: 'Citrus & Bright',   body: 'Lemongrass, sweet orange, mandarin, grapefruit and bergamot. The scent equivalent of opening a window.',                     color: '#E8A64C' },
  floral:    { label: 'Floral & Soft',     body: 'Rose bud, orange blossom, lavender, lilac and almond blossom. Gentle without being sweet — the scents that read as calm.',    color: '#C98E8E' },
  herbal:    { label: 'Herbal & Clear',    body: 'Mint, lavender, lemongrass, rosemary and menthol. Clean, green, and slightly medicinal in the best way.',                     color: '#5E9E7A' },
  woody:     { label: 'Woody & Grounding', body: 'Pine tar, palo santo, rosewood, amber and woodsmoke. Quiet, warm, and closer to the forest floor than the flower bed.',       color: '#7A6249' },
  sweet:     { label: 'Sweet & Warm',      body: 'Vanilla, honey, coconut and brown sugar. Comfort rather than dessert — the ones you notice at the end of the day.',           color: '#C8961E' },
  fruity:    { label: 'Fruity & Fresh',    body: 'Pear, peach, apricot and berry seed. Light, juicy, and gone before it can turn cloying.',                                     color: '#D98A6A' },
  unscented: { label: 'Unscented & Pure',  body: 'Nothing added. For reactive skin, shared offices, and anyone who has had enough of being marketed a mood.',                    color: '#D3C2A6' }
};

/** Which variants to recommend per scent family. */
export const SCENT_MATCHES = {
  citrus:    [['hand-butter','citrus-hearth'], ['shower-steamers','lemongrass-large'], ['deodorant-creme','smoky-citrus'], ['room-diffuser','peachy-summer']],
  floral:    [['botanical-hand-butter','bud-of-rose'], ['deodorant-creme','lavender-meadows'], ['room-diffuser','almond-blossom'], ['face-toner','rose-rosemary']],
  herbal:    [['botanical-hand-butter','lavender-lemon'], ['hair-butter', null], ['shower-steamers','euc-mint-large'], ['conditioner-bar','hemp-pan-rosemary']],
  woody:     [['pine-tar-soap', null], ['room-diffuser','calming-mind'], ['room-diffuser','bright-and-deep'], ['beard-balm', null]],
  sweet:     [['botanical-hand-butter','vanilla'], ['beeswax-candle','large'], ['room-diffuser','island-comfort'], ['face-cleanser','solid-oats-honey']],
  fruity:    [['deodorant-creme','plush-pear'], ['room-diffuser','peachy-summer'], ['face-oil','berry-bakuchiol'], ['jelly-face-mask','berry-bloom-radiance']],
  unscented: [['pine-tar-soap', null], ['leave-in-keratin', null], ['clay-face-mask', null], ['bamboo-soap-dish','large']]
};

/**
 * Customer reviews.
 *
 * Deliberately empty. Real reviews belong here and nowhere else — filling this
 * array is the only step needed to switch the section on. Entries take the
 * shape { quote, name, meta, product }. Never populate it with invented
 * testimonials: the UI renders an explicit placeholder while it is empty.
 */
export const TESTIMONIALS = [];

export const FAQS = [
  { q: 'Why are there no preservatives?', a: 'Because almost nothing we make contains water. Microbes need water to grow, so an anhydrous formula — a whipped butter, a face oil, a cream deodorant, a bar of soap — has nothing to preserve against. We would rather reformulate around the problem than add a preservative to solve it.' },
  { q: 'Is this safe for children and eczema-prone skin?', a: 'This is the skin the company was built for. Our son\'s eczema is the reason any of it exists. Start with the Pine Tar Soap, which is unscented, and the Bud of Rose hand butter, which carries calendula rather than oat. Patch test on a small area for a few days and introduce one product at a time so you can tell what is helping.' },
  { q: 'How long do the products last?', a: 'Anhydrous products keep 12–18 months from the date on the base — vitamin E slows the oils from turning, which is the only kind of spoiling they can do. Soap only improves: a cured bar gets harder and milder with age. Keep everything out of direct sun and away from a steamy shower shelf.' },
  { q: 'Is everything scented with essential oil?', a: 'Everything that is scented at all, yes — essential oil rather than fragrance oil, which is why some of the scents are quieter and why they fade rather than hang about. The Pine Tar Soap has no essential oil in it whatsoever; what you can smell is the pine tar.' },
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
    excerpt: 'It is the most common odour-neutraliser in natural deodorant, and the most common reason people give up on natural deodorant.',
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
  { value: 8,    suffix: '',  label: 'Formulas, made in small batches', prefix: '' },
  { value: 6,    suffix: ' wks', label: 'Cure time on every soap bar', prefix: '' },
  { value: 100,  suffix: '%', label: 'Natural, with nothing hidden', prefix: '' }
];
