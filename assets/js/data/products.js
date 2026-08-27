/**
 * Product catalogue — Aeindry Skincare and Bloom In Clover
 *
 * Every product, price, size and variant name here came from the owner. Where
 * something has been photographed the photograph is named; everything else
 * falls back to the generated vessel in lib/art.js, which is why `art` is
 * filled in for all of them.
 *
 * ── WHAT THIS FILE DOES NOT INVENT ────────────────────────────────────────
 * Copy describes what the product *is* — what a lotion bar or a jelly mask is,
 * and how the form is used — and stops there. It makes no claim about what a
 * particular formula contains or does. `keyIngredients` is filled in only
 * where a label has actually been read, because it feeds the ingredient
 * encyclopedia; an empty list means nobody has read that label yet, not that
 * the jar is empty.
 *
 * Where the range notes said "will update later" the entry carries
 * `pricePending: true` or an empty `variants` list rather than a guess, and
 * `tools/check-catalogue.mjs` prints every one of them.
 *
 * Two products may share a name and be different things — Botanical Hand
 * Butter and Hand Butter, the two leave-ins — so ids, not names, are the
 * identity.
 *
 * When a WooCommerce store is connected the store's own prices win; these
 * drive the catalogue preview and the offline demo.
 */

export const CATEGORIES = [
  { id: 'all',  label: 'Everything' },
  { id: 'face', label: 'Face' },
  { id: 'body', label: 'Body & Hands' },
  { id: 'hair', label: 'Hair & Beard' },
  { id: 'soap', label: 'Soap & Bath' },
  { id: 'home', label: 'Home & Aroma' },
  { id: 'kits', label: 'Sets & Packs' }
];

/** Not yet priced, or priced provisionally — see the note above. */
const PENDING = true;

/** What we say when the label has not been transcribed into this file. */
const ON_LABEL = 'See the label — the full ingredient list is printed on every one.';

export const PRODUCTS = [
  /* ══════════════════════════ FACE ══════════════════════════ */

  {
    id: 'face-serum',
    name: 'Face Serum',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'A few drops, every night',
    blurb: 'The concentrated step, in a dropper bottle.',
    description:
      'A serum is the thinnest thing in a routine and the one that goes on first, straight '
      + 'onto damp skin so it has something to hold. A few drops covers a face — it is meant to '
      + 'be used sparingly and to last.',
    price: 15, pricePending: PENDING,
    weight: '1 oz dropper bottle',
    scentFamily: ['unscented'], concerns: ['daily', 'aging'],
    /* The scents were not given with the range notes; the price was. */
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Goes on first, onto damp skin', 'A few drops is a whole application', 'Made in small batches in Washington'],
    howToUse: 'Two or three drops pressed into damp skin, morning or night. Follow with a cream or an oil.',
    art: { form: 'dropper', sub: 'FACE SERUM', tint: ['#FAF8F4', '#EBE6DC'], body: '#E7DECB', cap: '#5F6355', accent: '#C8961E' }
  },

  {
    id: 'copper-face-serum',
    name: 'Copper Serum',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'The one that costs more, and is meant to',
    blurb: 'Our most concentrated face serum.',
    description:
      'Priced above the rest of the serum shelf because of what goes into it. Used the same '
      + 'way — a few drops onto damp skin before anything heavier.',
    price: 20, pricePending: PENDING,
    weight: '1 oz dropper bottle',
    scentFamily: ['unscented'], concerns: ['aging', 'daily'],
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['The most concentrated serum we make', 'A few drops is a whole application', 'Small batches, made in Washington'],
    howToUse: 'Two or three drops pressed into damp skin at night. Follow with a cream if you use one.',
    art: { form: 'dropper', sub: 'COPPER SERUM', tint: ['#FBF5EF', '#EFDCC9'], body: '#D9A273', cap: '#8B5A2B', accent: '#C4713A' }
  },

  {
    id: 'under-eye-serum',
    name: 'Time Lock Under Eye Serum',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'For the thinnest skin on your face',
    blurb: 'A small bottle for a small area, because that is all you need.',
    description:
      'The skin under an eye is the thinnest on the body, which is why it gets its own step and '
      + 'its own smaller bottle. Patted rather than rubbed — the ring finger presses hardest of '
      + 'the ones that can be trusted not to drag.',
    price: 20, pricePending: PENDING,
    weight: '0.5 oz dropper bottle',
    scentFamily: ['unscented'], concerns: ['aging', 'daily'],
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Made for the eye area specifically', 'A drop per eye', 'Small batches, made in Washington'],
    howToUse: 'One drop per eye, patted along the bone with a ring finger. Never rubbed.',
    art: { form: 'dropper', sub: 'UNDER EYE', tint: ['#F8F6F5', '#E6E1E4'], body: '#DCD3DE', cap: '#7E4EAE', accent: '#9B8FC7' }
  },

  {
    id: 'face-toner',
    name: 'Face Toner',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'Rose Rosemary · Sweet Grass Neroli',
    blurb: 'The step between washing and everything else.',
    description:
      'Misted or pressed on after cleansing, while skin is still damp. Everything that goes on '
      + 'afterwards has an easier time of it — a serum spreads further on wet skin than on dry.',
    price: 14,
    weight: '4 fl oz',
    scentFamily: ['floral', 'herbal'], concerns: ['daily', 'sensitive'],
    variants: [
      { id: 'rose-rosemary',      label: 'Rose Rosemary',      swatch: '#C98E8E' },
      { id: 'sweet-grass-neroli', label: 'Sweet Grass Neroli', swatch: '#A8C63C' }
    ],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Two scents, both from essential oil', 'Leaves skin damp for the next step', 'Made in Washington'],
    howToUse: 'After cleansing, mist or press over the face and go straight into a serum or oil.',
    art: { form: 'spray', sub: 'FACE TONER', tint: ['#FAF7F6', '#EDE2E2'], body: '#F0E6E4', cap: '#C98E8E', accent: '#A8C63C' }
  },

  {
    id: 'face-cream',
    name: 'Face Cream',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'The last step, and the one that holds',
    blurb: 'A cream to seal in everything underneath it.',
    description:
      'A cream is the lid on a routine: it stops what you put on first from evaporating back '
      + 'off. Applied last, over a serum or an oil, on skin that is still slightly damp.',
    price: 20, pricePending: PENDING,
    weight: '2 oz jar',
    scentFamily: ['unscented'], concerns: ['dry', 'daily', 'aging'],
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Goes on last, over everything else', 'Small batches, made by hand', 'Made in Washington'],
    howToUse: 'A pea-sized amount, warmed between fingertips, over damp skin at the end of a routine.',
    art: { form: 'jar', sub: 'FACE CREAM', tint: ['#FBF9F4', '#EDE7DA'], body: '#F4EEE2', cap: '#6E7263', accent: '#C8961E' }
  },

  {
    id: 'face-oil',
    name: 'Face Oil',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'Four oils, four different jobs',
    blurb: 'Be Free, Berry Bakuchiol, Armor and Rose — pick the one that matches the week.',
    description:
      'An oil goes on damp skin and gives it something to hold onto. Four blends rather than '
      + 'one, because a face in February and a face in July are not asking for the same thing. '
      + 'A few drops pressed in is a whole application.',
    price: 34, pricePending: PENDING,
    weight: '1 oz dropper bottle',
    photo: 'face-oil-berry-bakuchiol',
    scentFamily: ['fruity', 'floral', 'unscented'], concerns: ['dry', 'aging', 'daily'],
    variants: [
      { id: 'be-free',        label: 'Be Free',         swatch: '#A8C63C' },
      { id: 'berry-bakuchiol', label: 'Berry Bakuchiol', swatch: '#B32644', note: 'Bakuchiol and berry-seed oils',
        photo: 'face-oil-berry-bakuchiol' },
      { id: 'armor',          label: 'Armor',           swatch: '#5F6355' },
      { id: 'rose',           label: 'Rose',            swatch: '#E8A0B4' }
    ],
    keyIngredients: ['bakuchiol', 'rosehip-oil', 'raspberry-seed-oil'],
    ingredients: ON_LABEL,
    benefits: ['Four blends, not one', 'A few drops is a whole application', 'Small batches, made in Washington'],
    howToUse: 'Two or three drops pressed into damp skin at night. Follow with a cream if you use one.',
    art: { form: 'dropper', sub: 'FACE OIL', tint: ['#F7F2F6', '#E9DCE8'], body: '#C9A8D8', cap: '#7E4EAE', accent: '#B32644' }
  },

  {
    id: 'face-scrub',
    name: 'Face Scrub',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'Bud of Rose · Black Rose · Lavender Cloud',
    blurb: 'A gentle polish, once or twice a week.',
    description:
      'A scrub is a once-or-twice-a-week thing, not a daily one. Worked over damp skin with '
      + 'very little pressure — the grains do the work, and leaning on them is how people end '
      + 'up with a red face and a compromised barrier.',
    price: 10,
    weight: '2 oz jar',
    scentFamily: ['floral'], concerns: ['oily', 'daily'],
    variants: [
      { id: 'bud-of-rose',    label: 'Bud of Rose',    swatch: '#E8A0B4' },
      { id: 'black-rose',     label: 'Black Rose',     swatch: '#6B3550' },
      { id: 'lavender-cloud', label: 'Lavender Cloud', swatch: '#9B8FC7' }
    ],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Once or twice a week, not daily', 'Three scents', 'Made by hand in Washington'],
    howToUse: 'On damp skin, in small circles, with almost no pressure. Rinse warm.',
    art: { form: 'jar', sub: 'FACE SCRUB', tint: ['#FAF6F7', '#EDE0E4'], body: '#F0E4E6', cap: '#6B3550', accent: '#E8A0B4' }
  },

  {
    id: 'face-cleanser',
    name: 'Face Cleanser',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'Solid, powder, oil or clay — four ways to wash',
    blurb: 'Six cleansers in four formats, because skin does not agree on this one.',
    description:
      'The solid bars are the plainest and the cheapest to keep going. The powder foams when '
      + 'it meets water in your palm. The oil-to-milk turns white as you rinse it, which is how '
      + 'you know it has lifted what it was meant to. The clay is the one for a week that has '
      + 'gone oily.',
    price: 14,
    weight: 'Varies by format',
    scentFamily: ['sweet', 'floral', 'unscented'], concerns: ['daily', 'oily', 'sensitive'],
    variants: [
      { id: 'solid-oats-honey',   label: 'Solid — Oats & Honey',        swatch: '#E9C97A', price: 10, note: 'Solid bar' },
      { id: 'solid-mango-lav',    label: 'Solid — Mango Lavender Meadow', swatch: '#C9B7DE', price: 10, note: 'Solid bar' },
      { id: 'powder-to-foam',     label: 'Powder to Foam',              swatch: '#F0E6D2', note: 'Foams in your palm' },
      { id: 'oil-to-milk',        label: 'Oil to Milk',                 swatch: '#EFD9A8', note: 'Turns milky as it rinses' },
      { id: 'clay',               label: 'Clay Cleanser',               swatch: '#B9A78F', note: 'For an oily week' }
    ],
    keyIngredients: ['kaolin-clay'],
    ingredients: ON_LABEL,
    benefits: ['Four formats, one shelf', 'The solid bars are the longest-lasting', 'Made in Washington'],
    howToUse: 'Wet hands, work up a lather or a milk, take a minute over it, rinse warm. Never hot.',
    art: { form: 'puck', sub: 'CLEANSER', tint: ['#FBF8F1', '#EDE5D4'], body: '#F2E9D8', cap: '#C8961E', accent: '#A8C63C' }
  },

  {
    id: 'jelly-face-mask',
    name: 'Jelly Face Mask',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'Five masks, fifteen minutes each',
    blurb: 'The wobbly kind that peels off in one piece.',
    description:
      'Mixed in the little bowl, spread on thick, and left to set. Fifteen minutes later it '
      + 'lifts away as one sheet, which is by some distance the best part. Five blends, and a '
      + 'mini set if you would rather try them all before committing.',
    price: 14,
    weight: '2 oz',
    scentFamily: ['fruity', 'sweet', 'herbal'], concerns: ['dry', 'oily', 'aging', 'daily'],
    variants: [
      { id: 'berry-bloom-radiance', label: 'Berry Bloom Radiance', swatch: '#B32644' },
      { id: 'aloe-honey-oats',      label: 'Aloe Honey Oats',      swatch: '#E9C97A' },
      { id: 'green-alchemy',        label: 'Green Alchemy Renewal', swatch: '#7E9A72' },
      { id: 'rice-berry-protein',   label: 'Rice Berry Protein',   swatch: '#E9B08C' },
      { id: 'root-and-bloom',       label: 'Root and Bloom',       swatch: '#8B6444' }
    ],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Peels off in one piece', 'Five blends', 'Made by hand in Washington'],
    howToUse: 'Mix, spread thick, leave fifteen minutes, then lift from one edge and peel.',
    art: { form: 'pot', sub: 'JELLY MASK', tint: ['#FBF4F6', '#F0DDE4'], body: '#F5E3E8', cap: '#B32644', accent: '#7E9A72' }
  },

  {
    id: 'clay-face-mask',
    name: 'Clay Face Mask',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'The traditional draw',
    blurb: 'Clay, water, and ten minutes.',
    description:
      'The oldest mask there is. Mixed with a little water into a paste, worn until it is just '
      + 'about dry — not cracked, which is past the point where it is doing anything useful — '
      + 'and rinsed off warm.',
    price: 14, pricePending: PENDING,
    weight: '2 oz jar',
    scentFamily: ['unscented'], concerns: ['oily', 'daily'],
    variants: [],
    keyIngredients: ['kaolin-clay', 'bentonite-clay'],
    ingredients: ON_LABEL,
    benefits: ['Mixed fresh each time', 'Rinse before it cracks', 'Made in Washington'],
    howToUse: 'Mix a teaspoon with water into a paste. Ten minutes, then rinse warm — do not let it crack.',
    art: { form: 'jar', sub: 'CLAY MASK', tint: ['#F8F5EF', '#E5DCCB'], body: '#B9A78F', cap: '#5F6355', accent: '#8B6444' }
  },

  {
    id: 'lip-oil',
    name: 'Lip Oil',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'Shine without the stick',
    blurb: 'A lip oil with a doe-foot, for the ones who cannot stand a balm.',
    description:
      'Lighter than a balm and glossier than nothing. Sits on rather than sinks in, which is '
      + 'the point of it — the shine is the product doing its job.',
    price: 14,
    weight: '0.2 fl oz',
    scentFamily: ['sweet'], concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Lighter than a balm', 'Doe-foot applicator', 'Made in Washington'],
    howToUse: 'Whenever. Over a balm at night if lips are having a bad week.',
    art: { form: 'roller', sub: 'LIP OIL', tint: ['#FBF5F5', '#F0DEDE'], body: '#F3E2E2', cap: '#C98E8E', accent: '#E8A0B4' }
  },

  {
    id: 'lip-balm',
    name: 'Lip Balm',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'The one you lose and buy again',
    blurb: 'A plain, honest balm in a tube.',
    description:
      'Nothing complicated. A tube that lives in a coat pocket and gets used without thinking '
      + 'about it — which is why they are priced to be bought five at a time.',
    price: 3.5,
    weight: '0.15 oz tube',
    scentFamily: ['sweet'], concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: ['beeswax'],
    ingredients: ON_LABEL,
    benefits: ['Cheap enough to keep one everywhere', 'Beeswax base', 'Made in Washington'],
    howToUse: 'As often as you like. Last thing at night is when it does the most.',
    art: { form: 'tube', sub: 'LIP BALM', tint: ['#FBF8F2', '#EEE6D6'], body: '#F2EADA', cap: '#C8961E', accent: '#A8C63C' }
  },

  {
    id: 'lip-gloss',
    name: 'Lip Gloss',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'Gloss, and nothing else to think about',
    blurb: 'A clear gloss with a wand.',
    description: 'Shine, applied with a wand, over bare lips or over a balm. That is the whole product.',
    price: 10,
    weight: '0.2 fl oz',
    scentFamily: ['sweet'], concerns: ['daily'],
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Wand applicator', 'Wears over a balm', 'Made in Washington'],
    howToUse: 'Over bare lips, or over the balm when you want the shine to last.',
    art: { form: 'roller', sub: 'LIP GLOSS', tint: ['#FBF6F8', '#F1E0E7'], body: '#F5E6EC', cap: '#B32644', accent: '#E8A0B4' }
  },

  {
    id: 'lip-scrub',
    name: 'Lip Scrub',
    brand: 'Aeindry', category: 'face', categoryLabel: 'Face',
    tagline: 'For the week the balm stops working',
    blurb: 'Sugar, and then a balm.',
    description:
      'When lips are flaking, a balm sits on top of the flakes instead of under them. This '
      + 'takes the flakes off first. Once a week is plenty; more than that and you are just '
      + 'making the problem you are treating.',
    price: 5,
    weight: '0.5 oz pot',
    scentFamily: ['sweet'], concerns: ['dry'],
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Once a week, no more', 'Follow with a balm', 'Made in Washington'],
    howToUse: 'A fingertip, rubbed gently over damp lips, then wiped off and followed with a balm.',
    art: { form: 'pot', sub: 'LIP SCRUB', tint: ['#FBF6F1', '#F0E1D3'], body: '#F4E7DA', cap: '#C4713A', accent: '#E8A0B4' }
  },
  /* ═════════════════════ BODY & HANDS ═════════════════════ */

  {
    id: 'botanical-hand-butter',
    name: 'Botanical Hand Butter',
    brand: 'Aeindry', category: 'body', categoryLabel: 'Body & Hands',
    tagline: 'Deep nourishing, with oat extract',
    blurb: 'The original tin — whipped, slow-melting, and made for hands that work.',
    description:
      'Whipped rather than poured, so it goes on light and then sinks in. Oat extract is the '
      + 'quiet workhorse — it is what makes a rich butter calm rather than merely greasy — and '
      + 'the Bud of Rose tin carries calendula instead.',
    price: 15,
    weight: '2 oz tin',
    photo: 'hand-butter',
    scentFamily: ['citrus', 'floral', 'herbal', 'sweet'],
    concerns: ['dry', 'eczema', 'daily', 'sensitive'],
    variants: [
      { id: 'citrus-mint',    label: 'Citrus Mint',    swatch: '#A8C63C', note: 'With oat extract' },
      { id: 'lavender-lemon', label: 'Lavender Lemon', swatch: '#7B2E86', note: 'With oat extract' },
      { id: 'orange-blossom', label: 'Orange Blossom', swatch: '#C8961E', note: 'With oat extract' },
      { id: 'bud-of-rose',    label: 'Bud of Rose',    swatch: '#E8A0B4', note: 'With calendula extract' },
      { id: 'vanilla',        label: 'Vanilla',        swatch: '#D9CDBA', note: 'With mango flower extract' }
    ],
    keyIngredients: ['shea-butter', 'cocoa-butter', 'oat-extract', 'calendula'],
    ingredients: ON_LABEL,
    benefits: ['Whipped, so it absorbs rather than sits', 'Oat extract to settle skin that reacts', 'Small batches, made in Washington'],
    howToUse: 'Warm a little between your fingers and work into hands and cuticles. Best last thing at night.',
    art: { form: 'tin', sub: 'HAND BUTTER', tint: ['#FAF6EE', '#EDE3D2'], body: '#EFE7D8', cap: '#A8C63C', accent: '#C8961E' }
  },

  {
    id: 'hand-butter',
    name: 'Hand Butter',
    brand: 'Aeindry', category: 'body', categoryLabel: 'Body & Hands',
    tagline: 'Eight scents, one 2 oz tin',
    blurb: 'The wider scent range — same tin, eight ways to smell.',
    description:
      'The scent shelf. Eight blends across citrus, floral and the greener end, all in the '
      + 'same 2 oz tin, all whipped the same way. If you already know you want a hand butter '
      + 'and are only choosing a smell, this is the shelf to stand in front of.',
    price: 14,
    weight: '2 oz tin',
    scentFamily: ['citrus', 'floral', 'woody', 'sweet', 'herbal'],
    concerns: ['dry', 'daily'],
    variants: [
      { id: 'bud-of-rose',    label: 'Bud of Rose',    swatch: '#E8A0B4' },
      { id: 'mango-blossom',  label: 'Mango Blossom',  swatch: '#EFC46B' },
      { id: 'yuzu-forest',    label: 'Yuzu Forest',    swatch: '#7E9A72' },
      { id: 'orange-blossom', label: 'Orange Blossom', swatch: '#C8961E' },
      { id: 'amber-orange',   label: 'Amber Orange',   swatch: '#C4713A' },
      { id: 'citrus-hearth',  label: 'Citrus Hearth',  swatch: '#D98A4A' },
      { id: 'lavender-lemon', label: 'Lavender Lemon', swatch: '#7B2E86' },
      { id: 'highland-mist',  label: 'Highland Mist',  swatch: '#8FA3A8' }
    ],
    keyIngredients: ['shea-butter', 'cocoa-butter'],
    ingredients: ON_LABEL,
    benefits: ['Eight scents in the one tin size', 'Whipped, so it absorbs rather than sits', 'Made by hand in Washington'],
    howToUse: 'Warm a little between your fingers and work into hands and cuticles.',
    art: { form: 'tin', sub: 'HAND BUTTER', tint: ['#FAF7F0', '#ECE2D0'], body: '#F0E8D9', cap: '#C4713A', accent: '#A8C63C' }
  },

  {
    id: 'body-oil',
    name: 'Body Oil',
    brand: 'Aeindry', category: 'body', categoryLabel: 'Body & Hands',
    tagline: 'Straight out of the shower, onto wet skin',
    blurb: 'An oil for the whole body, in two sizes.',
    description:
      'Body oil works best on skin that is still wet — the water is what it seals in, and a '
      + 'towel-dry first is the most common way to waste it. The 8 oz bottle is the one to buy '
      + 'if you are using it daily.',
    price: 20,
    weight: '4 fl oz · 8 fl oz',
    scentFamily: ['floral', 'woody'], concerns: ['dry', 'daily'],
    variants: [
      { id: 'standard', label: '4 fl oz', swatch: '#E9C97A' },
      { id: 'large',    label: '8 fl oz', swatch: '#C8961E', price: 41, note: 'The daily-use size' }
    ],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Made for damp skin, not dry', 'Two sizes', 'Small batches, made in Washington'],
    howToUse: 'Straight out of the shower, onto skin that is still wet. Pat dry afterwards, do not rub.',
    art: { form: 'bottle', sub: 'BODY OIL', tint: ['#FBF8EF', '#EFE5CC'], body: '#F3EBD7', cap: '#C8961E', accent: '#A8C63C' }
  },

  {
    id: 'body-cream',
    name: 'Body Cream',
    brand: 'Aeindry', category: 'body', categoryLabel: 'Body & Hands',
    tagline: 'Six blends, from the everyday to the special',
    blurb: 'Atharv, Aranya and Pomegranate Berry Velvet sit above the rest of the shelf.',
    description:
      'The largest scent range we make, and the one where the price is not flat: Atharv, Aranya '
      + 'and Pomegranate Berry Velvet cost more than the others because of what is in them. All '
      + 'six are the same rich cream underneath.',
    price: 20,
    weight: '4 oz jar',
    scentFamily: ['herbal', 'sweet', 'fruity', 'woody'],
    concerns: ['dry', 'daily', 'sensitive'],
    variants: [
      { id: 'atharv',            label: 'Atharv',                  swatch: '#8B6444', price: 30 },
      { id: 'aloe-oats-honey',   label: 'Aloe Oats Honey',         swatch: '#E9C97A' },
      { id: 'lemon-turmeric',    label: 'Lemon Turmeric',          swatch: '#E0B33A' },
      { id: 'aranya',            label: 'Aranya',                  swatch: '#5F6355', price: 30 },
      { id: 'matcha',            label: 'Matcha',                  swatch: '#7E9A72' },
      { id: 'pomegranate-berry', label: 'Pomegranate Berry Velvet', swatch: '#B32644', price: 30 }
    ],
    keyIngredients: ['shea-butter'],
    ingredients: ON_LABEL,
    benefits: ['Six blends', 'Rich enough for winter shins and elbows', 'Made by hand in Washington'],
    howToUse: 'After a shower, on skin that is still slightly damp.',
    art: { form: 'jar', sub: 'BODY CREAM', tint: ['#FAF8F2', '#ECE6D6'], body: '#F2ECDE', cap: '#7E9A72', accent: '#B32644' }
  },

  {
    id: 'body-butter-scrub',
    name: 'Body Butter & Scrub',
    brand: 'Aeindry', category: 'body', categoryLabel: 'Body & Hands',
    tagline: 'Two steps in one jar',
    blurb: 'Scrubs in the shower, then melts into a butter as it rinses.',
    description:
      'An emulsifying scrub: it goes on as a sugar scrub and turns into a butter under the '
      + 'water, so you step out already moisturised. It leaves a slick on the shower floor — '
      + 'worth knowing before you use it.',
    price: 14,
    weight: '6 oz jar',
    scentFamily: ['sweet', 'floral'], concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: ['shea-butter'],
    ingredients: ON_LABEL,
    benefits: ['Scrub and butter in one step', 'Rinses to a soft finish, not a squeak', 'Made in Washington'],
    howToUse: 'In the shower, on damp skin, then rinse. Mind your footing — it leaves the floor slippery.',
    art: { form: 'jar', sub: 'BUTTER & SCRUB', tint: ['#FBF7F3', '#EFE3D8'], body: '#F4EADF', cap: '#C4713A', accent: '#E8A0B4' }
  },

  {
    id: 'body-balm',
    name: 'Body Balm',
    brand: 'Aeindry', category: 'body', categoryLabel: 'Body & Hands',
    tagline: 'Green Alchemist · Barrier Repair · Brow Renew',
    blurb: 'Three small balms, each for one specific job.',
    description:
      'Balms rather than creams: no water in them, so they seal rather than soak. Three of '
      + 'them, and each is aimed at something narrower than "body" suggests — the third is for '
      + 'brows.',
    price: 1, pricePending: PENDING,
    weight: '1 oz tin',
    scentFamily: ['herbal', 'unscented'], concerns: ['eczema', 'dry', 'sensitive'],
    variants: [
      { id: 'green-alchemist', label: 'Green Alchemist', swatch: '#7E9A72' },
      { id: 'barrier-repair',  label: 'Barrier Repair',  swatch: '#E9C97A' },
      { id: 'brow-renew',      label: 'Brow Renew',      swatch: '#8B6444' }
    ],
    keyIngredients: ['beeswax'],
    ingredients: ON_LABEL,
    benefits: ['Anhydrous — nothing to preserve against', 'Three, each for one job', 'Made in Washington'],
    howToUse: 'A fingertip, warmed and pressed in. A balm goes on last, over anything wetter.',
    art: { form: 'tin', sub: 'BODY BALM', tint: ['#F8F7F1', '#E7E5D6'], body: '#EDEBDD', cap: '#7E9A72', accent: '#C8961E' }
  },

  {
    id: 'foot-cream',
    name: 'Foot Cream',
    brand: 'Aeindry', category: 'body', categoryLabel: 'Body & Hands',
    tagline: 'For heels that have given up',
    blurb: 'The heaviest cream we make, aimed at the thickest skin.',
    description:
      'Heels are the thickest skin on the body and need a cream built for it. Put it on at '
      + 'night and put socks on over the top — that is not a folk remedy, it is just how you '
      + 'stop it ending up on the sheets.',
    price: 20,
    weight: '4 oz jar',
    scentFamily: ['herbal'], concerns: ['dry', 'muscle'],
    variants: [],
    keyIngredients: ['shea-butter'],
    ingredients: ON_LABEL,
    benefits: ['Built for the thickest skin on you', 'Best worn overnight', 'Made in Washington'],
    howToUse: 'A thick layer at bedtime, socks over the top, and leave it to work.',
    art: { form: 'jar', sub: 'FOOT CREAM', tint: ['#F7F9F4', '#E3E9DC'], body: '#EDF0E6', cap: '#5F6355', accent: '#A8C63C' }
  },

  {
    id: 'lotion-bar',
    name: 'Lotion Bar',
    brand: 'Aeindry', category: 'body', categoryLabel: 'Body & Hands',
    tagline: 'Solid until it touches you',
    blurb: 'A bar of lotion. No bottle, no water, no preservative.',
    description:
      'Hard in the tin and liquid on contact with skin — body heat is the only thing that '
      + 'melts it. Because there is no water in it there is nothing to preserve, and because '
      + 'there is no bottle there is nothing to leak in a bag.',
    price: 5,
    weight: '1 oz bar',
    scentFamily: ['sweet', 'herbal'], concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: ['beeswax', 'shea-butter'],
    ingredients: ON_LABEL,
    benefits: ['No water, so no preservative', 'Travels without leaking', 'Made in Washington'],
    howToUse: 'Rub the bar straight onto dry patches — elbows, shins, knuckles — and let body heat do the rest.',
    art: { form: 'puck', sub: 'LOTION BAR', tint: ['#FBF8EE', '#EEE6CE'], body: '#F1E8D2', cap: '#C8961E', accent: '#E9C97A' }
  },

  {
    id: 'deodorant-creme',
    name: 'Natural Deodorant Creme',
    brand: 'Aeindry', category: 'body', categoryLabel: 'Body & Hands',
    tagline: 'All natural, and it actually works',
    blurb: 'A cream deodorant in a jar. No aluminium, no alcohol, no stick.',
    description:
      'Applied with a fingertip rather than swiped. It is a cream, so it goes on without the '
      + 'drag a stick leaves on freshly shaved skin, and there is no aluminium in it at all.',
    price: 12,
    weight: '2.15 oz jar',
    photo: 'deodorant-lavender-meadows',
    scentFamily: ['floral', 'herbal', 'fruity', 'citrus'],
    concerns: ['sensitive', 'daily'],
    variants: [
      { id: 'lavender-meadows', label: 'Lavender Meadows', swatch: '#9B8FC7', note: 'Soft, herbal, calm',
        photo: 'deodorant-lavender-meadows' },
      { id: 'plush-pear',       label: 'Plush Pear',       swatch: '#C9D4A0', note: 'Soft · juicy · elegant' },
      { id: 'smoky-citrus',     label: 'Smoky Citrus',     swatch: '#C4713A', note: 'Orange, lemon, woodsmoke',
        photo: 'deodorant-smoky-citrus' }
    ],
    keyIngredients: ['shea-butter', 'arrowroot', 'coconut-oil', 'essential-oils'],
    ingredients: ON_LABEL,
    benefits: ['No aluminium', 'A cream, so no drag on shaved skin', 'Scented with essential oil only'],
    howToUse: 'A pea-sized amount, warmed between fingertips and smoothed on. Less than you think.',
    art: { form: 'jar', sub: 'DEODORANT', tint: ['#F7F4FA', '#E7E1F0'], body: '#F2EDE6', cap: '#9B8FC7', accent: '#C4713A' }
  },

  {
    id: 'essential-oil-roll-on',
    name: 'Essential Oil Roll-On',
    brand: 'Aeindry', category: 'body', categoryLabel: 'Body & Hands',
    tagline: 'Pulse points, pocket-sized',
    blurb: 'Pre-diluted essential oil in a roller bottle.',
    description:
      'Already diluted in a carrier, so it goes straight onto wrists and temples without any '
      + 'mixing. Small enough to live in a bag and cheap enough to keep one in every one.',
    price: 5,
    weight: '10 ml roller',
    scentFamily: ['herbal', 'citrus', 'floral'], concerns: ['sleep', 'muscle', 'daily'],
    variants: [],
    keyIngredients: ['essential-oils'],
    ingredients: ON_LABEL,
    benefits: ['Pre-diluted — no mixing', 'Pocket-sized', 'Essential oil, never fragrance oil'],
    howToUse: 'Roll onto wrists, temples or the back of the neck. Warm it in with a thumb.',
    art: { form: 'roller', sub: 'ROLL-ON', tint: ['#F7F9F6', '#E2E9E0'], body: '#EAF0E7', cap: '#5F6355', accent: '#A8C63C' }
  },

  {
    id: 'solid-perfume',
    name: 'Solid Perfume',
    brand: 'Aeindry', category: 'body', categoryLabel: 'Body & Hands',
    tagline: 'Scent you can put in a pocket',
    blurb: 'A perfume in a tin, worn with a fingertip.',
    description:
      'A wax-based perfume rather than an alcohol one. It sits closer to the skin and lasts '
      + 'differently — quieter at arm\'s length, longer on the wrist — and it cannot spill in a bag.',
    price: 15,
    weight: '0.5 oz tin',
    scentFamily: ['floral', 'woody', 'sweet'], concerns: ['daily'],
    variants: [],
    keyIngredients: ['essential-oils'],
    ingredients: ON_LABEL,
    benefits: ['No alcohol', 'Cannot spill', 'Essential oil, never fragrance oil'],
    howToUse: 'A fingertip warmed on the tin, pressed onto wrists and the base of the throat.',
    art: { form: 'tin', sub: 'SOLID PERFUME', tint: ['#FAF6F8', '#EDDEE6'], body: '#F1E5EB', cap: '#B32644', accent: '#C8961E' }
  },
  /* ═════════════════════ HAIR & BEARD ═════════════════════ */

  {
    id: 'hair-butter',
    name: 'Hair Butter & Intensive Treatment Mask',
    brand: 'Aeindry', category: 'hair', categoryLabel: 'Hair & Beard',
    tagline: 'Root strength, botanical power',
    blurb: 'A weekly mask for scalp and lengths, built on cupuaçu and murumuru.',
    description:
      'A thick treatment rather than a conditioner. Coconut oil and the cupuaçu and murumuru '
      + 'butters do the conditioning; rosemary, neem, fenugreek and moringa are the scalp half '
      + 'of the formula. Left on long enough it behaves like a mask, which is what it is.',
    price: 24, pricePending: PENDING,
    weight: '4 oz jar',
    photo: 'hair-butter',
    /* Cropped out of one panel of a three-panel listing image — the only frame
       of this product on file — so 740 is as large as it honestly goes. */
    photoWidths: [480, 740],
    scentFamily: ['herbal', 'woody'], concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: ['coconut-oil', 'cupuacu-butter', 'murumuru-butter', 'rosemary', 'neem', 'fenugreek', 'moringa'],
    ingredients: ON_LABEL,
    benefits: ['Cupuaçu and murumuru, not a silicone', 'Scalp herbs as well as conditioning butters', 'Made in Washington'],
    howToUse: 'Work through the scalp and lengths, leave an hour or overnight, then wash out. Once a week.',
    art: { form: 'jar', sub: 'HAIR MASK', tint: ['#F6F2E8', '#E4DCC8'], body: '#EFE9DA', cap: '#6E7263', accent: '#A8C63C' }
  },

  {
    id: 'hair-leave-in',
    name: 'Hair Leave-in Conditioner & Serum',
    brand: 'Aeindry', category: 'hair', categoryLabel: 'Hair & Beard',
    tagline: 'Lavender Meadow · Verdant Bloom',
    blurb: 'Goes on damp and stays in — no rinsing.',
    description:
      'Sprayed or worked through towel-dried hair and left there. It is doing its work while '
      + 'the hair dries, which is why the timing matters more than the amount.',
    price: 17,
    weight: '4 fl oz',
    scentFamily: ['floral', 'herbal'], concerns: ['dry', 'daily'],
    variants: [
      { id: 'lavender-meadow', label: 'Lavender Meadow', swatch: '#9B8FC7' },
      { id: 'verdant-bloom',   label: 'Verdant Bloom',   swatch: '#7E9A72' }
    ],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['No rinsing', 'Two scents', 'Made by hand in Washington'],
    howToUse: 'On towel-dried hair, mid-length to ends. Comb through and leave it.',
    art: { form: 'spray', sub: 'LEAVE-IN', tint: ['#F8F6FA', '#E8E3F0'], body: '#EFEAF3', cap: '#9B8FC7', accent: '#7E9A72' }
  },

  {
    id: 'leave-in-keratin',
    name: 'Leave-in Conditioner — Keratin Strength',
    brand: 'Aeindry', category: 'hair', categoryLabel: 'Hair & Beard',
    tagline: 'The one for hair that snaps',
    blurb: 'A leave-in aimed at strength rather than softness.',
    description:
      'The other leave-in is about slip and scent; this one is about hair that breaks. Same '
      + 'method — on damp hair, left in — different job.',
    price: 17,
    weight: '4 fl oz',
    scentFamily: ['unscented'], concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Aimed at breakage, not softness', 'No rinsing', 'Made in Washington'],
    howToUse: 'On towel-dried hair, concentrated where it breaks. Comb through and leave it.',
    art: { form: 'spray', sub: 'KERATIN', tint: ['#F8F8F5', '#E6E5DD'], body: '#EEEDE5', cap: '#5F6355', accent: '#C8961E' }
  },

  {
    id: 'elixir-hair-oil',
    name: 'Elixir Hair Oil',
    brand: 'Aeindry', category: 'hair', categoryLabel: 'Hair & Beard',
    tagline: 'For the scalp, not the ends',
    blurb: 'A pre-wash oil, massaged in and washed out.',
    description:
      'Hair oil is most useful before a wash rather than after one: worked into the scalp, '
      + 'left an hour, then shampooed out. On the ends afterwards it is a finishing product, '
      + 'and a very little goes a long way.',
    price: 20,
    weight: '2 fl oz',
    scentFamily: ['herbal', 'woody'], concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: ['rosemary'],
    ingredients: ON_LABEL,
    benefits: ['Made for a pre-wash massage', 'A little on the ends afterwards', 'Made in Washington'],
    howToUse: 'Into the scalp an hour before washing. A drop on the ends after drying, if at all.',
    art: { form: 'dropper', sub: 'HAIR OIL', tint: ['#FAF7EE', '#EBE2CC'], body: '#E0CBA0', cap: '#6E7263', accent: '#C8961E' }
  },

  {
    id: 'copper-hair-serum',
    name: 'Rice Renew Copper Hair Serum',
    brand: 'Aeindry', category: 'hair', categoryLabel: 'Hair & Beard',
    tagline: 'The scalp serum',
    blurb: 'A leave-on serum for the scalp rather than the hair.',
    description:
      'Parted through to the scalp and left on — this is a treatment for the skin the hair '
      + 'grows out of, so the lengths are not really the point. Used a few times a week rather '
      + 'than daily.',
    price: 24,
    weight: '2 fl oz',
    scentFamily: ['unscented'], concerns: ['daily'],
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Aimed at the scalp, not the lengths', 'Left on, not rinsed', 'Made in Washington'],
    howToUse: 'Part the hair, apply along the parting, and massage in. A few times a week.',
    art: { form: 'dropper', sub: 'SCALP SERUM', tint: ['#FBF6F0', '#EFDECB'], body: '#D9A273', cap: '#8B5A2B', accent: '#C4713A' }
  },

  {
    id: 'nocturn-balm',
    name: 'Nocturn Hair & Face Balm',
    brand: 'Aeindry', category: 'hair', categoryLabel: 'Hair & Beard',
    tagline: 'The one that does both, overnight',
    blurb: 'Our most expensive balm, and the smallest amount you will use of anything.',
    description:
      'A night balm that works on hair ends and on face alike — the same problem in two places, '
      + 'which is skin and keratin losing water while you sleep. The price reflects what is in '
      + 'it; the amount you need does not.',
    price: 35,
    weight: '1 oz jar',
    scentFamily: ['woody', 'floral'], concerns: ['dry', 'aging', 'sleep'],
    variants: [],
    keyIngredients: ['beeswax'],
    ingredients: ON_LABEL,
    benefits: ['Works on ends and on face', 'Made for overnight', 'The smallest amount of anything we make'],
    howToUse: 'The very smallest amount, warmed between fingertips, over face or through ends at night.',
    art: { form: 'pot', sub: 'NIGHT BALM', tint: ['#F4F2F6', '#DEDBE6'], body: '#E6E2EE', cap: '#3F3B31', accent: '#9B8FC7' }
  },

  {
    id: 'shampoo-bar',
    name: 'Shampoo Bar',
    brand: 'Aeindry', category: 'hair', categoryLabel: 'Hair & Beard',
    tagline: 'Five bars, no bottle',
    blurb: 'A solid shampoo that outlasts three bottles and travels in a tin.',
    description:
      'Rubbed straight onto wet hair or worked up in the hands first. It takes a wash or two to '
      + 'get the amount right — most people use far too much at the start — and it wants a '
      + 'draining dish or it turns to mush.',
    price: 14,
    weight: '2.5 oz bar',
    scentFamily: ['floral', 'herbal', 'sweet', 'woody'], concerns: ['daily', 'sensitive'],
    variants: [
      { id: 'rose-billbury', label: 'Rose Billbury', swatch: '#C98E8E' },
      { id: 'hem-charcoal',  label: 'Hem Charcoal',  swatch: '#3F3B31' },
      { id: 'neem-ale',      label: 'Neem Ale',      swatch: '#7E9A72' },
      { id: 'rice-lavender', label: 'Rice Lavender', swatch: '#9B8FC7' },
      { id: 'aloe-honey',    label: 'Aloe Honey',    swatch: '#E9C97A' }
    ],
    keyIngredients: ['neem'],
    ingredients: ON_LABEL,
    benefits: ['No bottle', 'Five scents', 'Keep it on a draining dish and it lasts'],
    howToUse: 'Rub onto wet hair or lather in your hands first. Use less than you think, rinse well.',
    art: { form: 'bar', sub: 'SHAMPOO BAR', tint: ['#F6F4EE', '#E2DDCE'], body: '#D9CBA8', cap: '#6E7263', accent: '#A8C63C' }
  },

  {
    id: 'conditioner-bar',
    name: 'Conditioner Bar',
    brand: 'Aeindry', category: 'hair', categoryLabel: 'Hair & Beard',
    tagline: 'Hemp Pan Rosemary · Repair and Growth · Revitalize and Transform',
    blurb: 'The other half of the no-bottle wash.',
    description:
      'Glided down the lengths rather than rubbed into the scalp — conditioner belongs on the '
      + 'ends, and putting a bar on your roots is the fastest way to decide bars do not work '
      + 'for you.',
    price: 10,
    weight: '2 oz bar',
    scentFamily: ['herbal', 'woody'], concerns: ['dry', 'daily'],
    variants: [
      { id: 'hemp-pan-rosemary', label: 'Hemp Pan Rosemary',        swatch: '#7E9A72' },
      { id: 'repair-growth',     label: 'Repair and Growth',        swatch: '#C8961E' },
      { id: 'revitalize',        label: 'Revitalize and Transform', swatch: '#5F6355' }
    ],
    keyIngredients: ['rosemary'],
    ingredients: ON_LABEL,
    benefits: ['No bottle', 'Three blends', 'Keep it on a draining dish and it lasts'],
    howToUse: 'Glide down the lengths, mid-shaft to ends. Comb through, then rinse.',
    art: { form: 'bar', sub: 'CONDITIONER', tint: ['#F5F7F1', '#DFE5D6'], body: '#CBD8BE', cap: '#5F6355', accent: '#7E9A72' }
  },

  {
    id: 'beard-balm',
    name: 'Beard Balm',
    brand: 'Aeindry', category: 'hair', categoryLabel: 'Hair & Beard',
    tagline: 'Shape, and the skin underneath',
    blurb: 'A balm for the beard and the face it grows on.',
    description:
      'A balm holds where an oil does not, and most of the itch people blame on a beard is the '
      + 'skin under it being dry. Warmed between the palms first, then worked in from the skin '
      + 'outwards.',
    price: 14,
    weight: '2 oz tin',
    scentFamily: ['woody', 'herbal'], concerns: ['dry', 'sensitive', 'daily'],
    variants: [],
    keyIngredients: ['beeswax', 'shea-butter'],
    ingredients: ON_LABEL,
    benefits: ['Holds shape, unlike an oil', 'Works on the skin underneath', 'Made in Washington'],
    howToUse: 'Warm between the palms, work in from the skin outwards, then comb through.',
    art: { form: 'tin', sub: 'BEARD BALM', tint: ['#F6F4EF', '#E3DDD0'], body: '#EAE4D6', cap: '#3F3B31', accent: '#8B6444' }
  },

  {
    id: 'beard-oil',
    name: 'Beard Oil',
    brand: 'Aeindry', category: 'hair', categoryLabel: 'Hair & Beard',
    tagline: 'The daily one',
    blurb: 'A few drops, worked down to the skin.',
    description:
      'Lighter than the balm and meant for every day. The drops go on the palms, the palms go '
      + 'on the face, and the important part is getting it down to the skin rather than leaving '
      + 'it sitting on the hair.',
    price: 10,
    weight: '1 fl oz dropper bottle',
    scentFamily: ['woody', 'citrus'], concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Light enough for daily use', 'A few drops is a whole application', 'Made in Washington'],
    howToUse: 'Three or four drops into the palms, worked down to the skin, then combed out.',
    art: { form: 'dropper', sub: 'BEARD OIL', tint: ['#F8F5EE', '#E7DFCB'], body: '#C9A86E', cap: '#3F3B31', accent: '#8B6444' }
  },
  /* ═════════════════════ SOAP & BATH ═════════════════════ */

  {
    id: 'pine-tar-soap',
    name: 'Pine Tar Soap',
    brand: 'Aeindry', category: 'soap', categoryLabel: 'Soap & Bath',
    tagline: 'Unscented, all natural, handmade artisan soap',
    blurb: 'The plainest bar we make, and the one people come back for.',
    description:
      'Pine tar soap has been made for a very long time for a reason. This one is unscented — '
      + 'the smell is the pine tar itself — and stamped by hand. Nothing added to make it prettier.',
    price: 12,
    weight: '4 oz bar',
    photo: 'pine-tar-soap',
    scentFamily: ['unscented', 'woody'], concerns: ['eczema', 'sensitive', 'dry'],
    variants: [],
    keyIngredients: ['pine-tar', 'olive-oil', 'coconut-oil', 'shea-butter'],
    ingredients: ON_LABEL,
    benefits: ['Unscented — no essential oil at all', 'Hand-stamped, cured, cut by hand', 'A long-standing traditional formula'],
    howToUse: 'Lather on a cloth or between wet hands. Keep it on a draining dish and it will last.',
    art: { form: 'bar', sub: 'PINE TAR', tint: ['#F4EFE7', '#DFD3C2'], body: '#6B4A32', cap: '#3F3B31', accent: '#8B6444' }
  },

  {
    id: 'handmade-soap',
    name: 'Handmade Soap',
    brand: 'Aeindry', category: 'soap', categoryLabel: 'Soap & Bath',
    tagline: 'Cold process, cured six weeks',
    blurb: 'The everyday bar. Scents change with what is being made.',
    description:
      'Cold process, with the glycerin left in, cured six weeks on a rack before it is sold. '
      + 'Six weeks is the least glamorous part of soapmaking and the part that decides whether '
      + 'a bar lasts a fortnight or two months.',
    price: 9,
    weight: '4 oz bar',
    scentFamily: ['floral', 'herbal', 'citrus'], concerns: ['daily', 'sensitive'],
    /* The scent range was still being counted when this was written. */
    variants: [],
    keyIngredients: ['olive-oil', 'coconut-oil', 'shea-butter'],
    ingredients: ON_LABEL,
    benefits: ['Cured six weeks, so it lasts', 'Glycerin left in', 'Made by hand in Washington'],
    howToUse: 'Lather on a cloth or between wet hands. A draining dish doubles how long it lasts.',
    art: { form: 'bar', sub: 'HANDMADE SOAP', tint: ['#FAF6EE', '#EBE1CE'], body: '#EADFC4', cap: '#A8C63C', accent: '#C8961E' }
  },

  {
    id: 'shaving-soap',
    name: 'Old Fashioned Shaving Soap',
    brand: 'Aeindry', category: 'soap', categoryLabel: 'Soap & Bath',
    tagline: 'Cabane · Sangria — with or without the tin',
    blurb: 'A hard puck for a brush, the way shaving soap used to come.',
    description:
      'Loaded onto a wet brush and worked into a lather in a bowl or on the face. It takes '
      + 'longer than a can of foam and gives a slicker, denser lather that a blade actually '
      + 'glides through. Buy it with the tin the first time; refills go without.',
    price: 14,
    weight: '3.5 oz puck',
    scentFamily: ['woody', 'fruity'], concerns: ['sensitive', 'daily'],
    variants: [
      { id: 'cabane-tin',      label: 'Cabane — with tin',     swatch: '#6B4A32', price: 17 },
      { id: 'cabane',          label: 'Cabane — refill',       swatch: '#8B6444' },
      { id: 'sangria-tin',     label: 'Sangria — with tin',    swatch: '#8E2036', price: 17 },
      { id: 'sangria',         label: 'Sangria — refill',      swatch: '#B32644' }
    ],
    keyIngredients: ['bentonite-clay'],
    ingredients: ON_LABEL,
    benefits: ['Made for a brush, not a can', 'Refills cost less than the tin', 'Made in Washington'],
    howToUse: 'Wet the brush, load from the puck, and build the lather in a bowl or on the face.',
    art: { form: 'puck', sub: 'SHAVING SOAP', tint: ['#F7F3EC', '#E4DBC9'], body: '#EFE7D4', cap: '#6B4A32', accent: '#8E2036' }
  },

  {
    id: 'shower-steamers',
    name: 'Shower Steamers',
    brand: 'Aeindry', category: 'soap', categoryLabel: 'Soap & Bath',
    tagline: 'Drop one on the floor and stand in it',
    blurb: 'Made for a shower, where the steam does the work.',
    description:
      'Not a bath bomb. These go on the shower floor, out of the direct stream, and release '
      + 'as the steam builds — put one under the water and it will be gone in thirty seconds. '
      + 'Two sizes: the small one is a single shower, the big one is several.',
    price: 15,
    weight: 'Large 5.6 oz · Small 1.2 oz',
    photo: 'shower-steamers',
    scentFamily: ['citrus', 'herbal'], concerns: ['sleep', 'muscle', 'daily'],
    variants: [
      { id: 'lavender-large',   label: 'Lavender — large',            swatch: '#9B8FC7' },
      { id: 'lavender-small',   label: 'Lavender — small',            swatch: '#C9B7DE', price: 5 },
      { id: 'euc-mint-large',   label: 'Eucalyptus Peppermint — large', swatch: '#5E9E7A' },
      { id: 'euc-mint-small',   label: 'Eucalyptus Peppermint — small', swatch: '#9AC7B0', price: 5 },
      { id: 'lemongrass-large', label: 'Lemongrass Orange — large',   swatch: '#C8961E',
        photo: 'shower-steamers' },
      { id: 'lemongrass-small', label: 'Lemongrass Orange — small',   swatch: '#E0B33A', price: 5 }
    ],
    keyIngredients: ['lemongrass', 'sweet-orange', 'mandarin', 'essential-oils'],
    ingredients:
      'Sodium bicarbonate, citric acid, cornstarch, sunflower oil, L-menthol, lemongrass essential oil, '
      + 'sweet orange essential oil, mandarin essential oil.',
    benefits: ['Essential oil, never fragrance oil', 'Made for showers, not baths', 'Two sizes'],
    howToUse: 'Place one at the far end of the shower floor, out of the direct stream. It will last the wash.',
    art: { form: 'sphere', sub: 'STEAMERS', tint: ['#FAF7EC', '#EDE6CE'], body: '#F2EDDF', cap: '#A8C63C', accent: '#C8961E' }
  },

  {
    id: 'milk-bath',
    name: 'Milk Bath',
    brand: 'Aeindry', category: 'soap', categoryLabel: 'Soap & Bath',
    tagline: 'A long soak, and a ring round the tub',
    blurb: 'A scoop under running water and the whole bath turns soft.',
    description:
      'Poured under the tap as the bath fills so it dissolves properly. It leaves the water '
      + 'silky and the tub needing a rinse afterwards, which is a fair trade.',
    price: 10,
    weight: '8 oz',
    scentFamily: ['floral', 'sweet'], concerns: ['dry', 'sleep'],
    variants: [],
    keyIngredients: ['colloidal-oat'],
    ingredients: ON_LABEL,
    benefits: ['Dissolves under running water', 'Made by hand in Washington', 'Essential oil only'],
    howToUse: 'A scoop under the running tap as the bath fills. Rinse the tub after.',
    art: { form: 'net', sub: 'MILK BATH', tint: ['#FBF9F3', '#EFE9D9'], body: '#F5F0E2', cap: '#E8A0B4', accent: '#C8961E' }
  },

  {
    id: 'coconut-milk-bath-salt',
    name: 'Coconut Milk Bath Salt',
    brand: 'Aeindry', category: 'soap', categoryLabel: 'Soap & Bath',
    tagline: 'Salt and coconut milk',
    blurb: 'The salt soak, softened.',
    description:
      'A salt soak on its own can leave skin feeling stripped; the coconut milk is what stops '
      + 'that. Dissolved under the running tap, same as the milk bath.',
    price: 10,
    weight: '8 oz',
    scentFamily: ['sweet'], concerns: ['muscle', 'dry', 'sleep'],
    variants: [],
    keyIngredients: ['epsom-salt'],
    ingredients: ON_LABEL,
    benefits: ['Softer than a plain salt soak', 'Dissolves under running water', 'Made in Washington'],
    howToUse: 'A generous scoop under the running tap. Twenty minutes is the useful part.',
    art: { form: 'net', sub: 'BATH SALT', tint: ['#FBFAF6', '#EFEBDF'], body: '#F6F3E9', cap: '#D9CDBA', accent: '#A8C63C' }
  },

  {
    id: 'foot-soak',
    name: 'Mineral Detox Foot Soak',
    brand: 'Aeindry', category: 'soap', categoryLabel: 'Soap & Bath',
    tagline: 'A bowl, hot water, twenty minutes',
    blurb: 'For feet that have done a market day.',
    description:
      'A mineral soak for a basin rather than a bath. Twenty minutes in water as hot as you '
      + 'can stand, and then the foot cream while the skin is still soft — that order matters '
      + 'more than either product does alone.',
    price: 10,
    weight: '8 oz',
    scentFamily: ['herbal'], concerns: ['muscle', 'dry'],
    variants: [],
    keyIngredients: ['epsom-salt'],
    ingredients: ON_LABEL,
    benefits: ['Sized for a basin', 'Follow with the foot cream', 'Made in Washington'],
    howToUse: 'A scoop in a bowl of hot water, twenty minutes, then foot cream on damp skin.',
    art: { form: 'net', sub: 'FOOT SOAK', tint: ['#F6F9F5', '#E0E8DD'], body: '#EAF0E6', cap: '#5F6355', accent: '#5E9E7A' }
  },

  {
    id: 'bamboo-soap-dish',
    name: 'Bamboo Soap Dish',
    brand: 'Aeindry', category: 'soap', categoryLabel: 'Soap & Bath',
    tagline: 'The cheapest way to make a bar last',
    blurb: 'Slatted bamboo, in two sizes.',
    description:
      'A bar of soap sitting in its own puddle dissolves at roughly twice the rate of one that '
      + 'drains. This is not an accessory so much as the thing that decides whether a $9 bar '
      + 'lasts a fortnight or two months. Large fits a shampoo bar; small fits a soap.',
    price: 5,
    weight: 'Small · Large',
    scentFamily: ['unscented'], concerns: ['daily'],
    variants: [
      { id: 'small', label: 'Small — for a soap bar',    swatch: '#D9CDBA' },
      { id: 'large', label: 'Large — for a shampoo bar', swatch: '#B9A78F', price: 8 }
    ],
    keyIngredients: [],
    ingredients: 'Bamboo. That is the entire list.',
    benefits: ['Doubles how long a bar lasts', 'Slatted so it drains', 'Two sizes'],
    howToUse: 'Somewhere the water can run off it. Rinse and dry it out every few weeks.',
    art: { form: 'bar', sub: 'SOAP DISH', tint: ['#FAF7EE', '#EBE2CC'], body: '#D7C49B', cap: '#8B6444', accent: '#A8C63C' }
  },
  /* ═════════════════════ HOME & AROMA ═════════════════════ */

  {
    id: 'beeswax-candle',
    name: 'Beeswax Candle',
    brand: 'Aeindry', category: 'home', categoryLabel: 'Home & Aroma',
    tagline: 'All-natural wax, hand-poured in Washington',
    blurb: 'Beeswax, a cotton wick, and a jar you will keep.',
    description:
      'Beeswax burns slower and cleaner than paraffin and smells faintly of honey before it is '
      + 'scented at all. Two sizes, poured in small batches — the small one is a two-evening '
      + 'candle, the large one lasts a season of them.',
    price: 6,
    weight: 'Small · Large',
    photo: 'candle-summer-meadow',
    scentFamily: ['floral', 'sweet'], concerns: ['sleep'],
    variants: [
      { id: 'small', label: 'Small',  swatch: '#E9C97A', photo: 'candle-summer-meadow' },
      { id: 'large', label: 'Large',  swatch: '#C8961E', price: 10, photo: 'candle-hearth-and-haze' }
    ],
    keyIngredients: ['beeswax', 'essential-oils'],
    ingredients: 'Beeswax, cotton wick, essential oils.',
    benefits: ['Beeswax, not paraffin or a soy blend', 'Cotton wick', 'Hand-poured in Washington'],
    howToUse: 'First burn, let the melt pool reach the edge — it sets how the rest of the candle burns.',
    art: { form: 'jar', sub: 'BEESWAX CANDLE', tint: ['#FBF7EC', '#F0E7D2'], body: '#F3EBD8', cap: '#C8961E', accent: '#A8C63C' }
  },

  {
    id: 'room-diffuser',
    name: 'Room Diffuser',
    brand: 'Bloom In Clover', category: 'home', categoryLabel: 'Home & Aroma',
    tagline: '100% natural, made in USA',
    blurb: 'Reed diffusers in five scents. They fill a room and then stay out of the way.',
    description:
      'A glass bottle, rattan reeds and a natural base. Turn the reeds when the scent fades '
      + 'and it lifts again. From Bloom In Clover, our sister line.',
    price: 20,
    weight: '4 fl oz',
    photo: 'diffuser-calming-mind',
    scentFamily: ['woody', 'citrus', 'floral', 'sweet', 'fruity'],
    concerns: ['sleep', 'daily'],
    variants: [
      { id: 'calming-mind',    label: 'Calming Mind',    swatch: '#8B8474', note: 'Palo santo · lemon · rosewood',
        photo: 'diffuser-calming-mind' },
      { id: 'bright-and-deep', label: 'Bright and Deep', swatch: '#5F6355', note: 'Bergamot · musk · amber',
        photo: 'diffuser-bright-and-deep' },
      { id: 'almond-blossom',  label: 'Almond Blossom',  swatch: '#E8D9C0', note: 'Almond blossom · vanilla · lilac',
        photo: 'diffuser-almond-blossom' },
      { id: 'island-comfort',  label: 'Island Comfort',  swatch: '#D9CDBA', note: 'Coconut · vanilla · brown sugar',
        photo: 'diffuser-island-comfort' },
      { id: 'peachy-summer',   label: 'Peachy Summer',   swatch: '#E5B98C', note: 'Grapefruit · peach · apricot',
        photo: 'diffuser-peachy-summer' }
    ],
    keyIngredients: ['essential-oils'],
    ingredients: ON_LABEL,
    benefits: ['No flame, no electricity', 'Turn the reeds to refresh', '100% natural, made in USA'],
    howToUse: 'Put the reeds in and leave them an hour to draw. Turn them once a week.',
    art: { form: 'bottle', sub: 'ROOM DIFFUSER', tint: ['#FBFAF6', '#EFEADC'], body: '#F5F1E6', cap: '#C8961E', accent: '#A8C63C' }
  },

  {
    id: 'car-diffuser',
    name: 'Car Diffuser',
    brand: 'Bloom In Clover', category: 'home', categoryLabel: 'Home & Aroma',
    tagline: 'For the other room you sit in',
    blurb: 'A small diffuser that clips to a vent.',
    description:
      'The cheapest thing on the shelf and the one people buy in threes. Clips to a vent and '
      + 'works off the airflow, so it is strongest on the drive and quiet when parked.',
    price: 8,
    weight: 'Vent clip',
    scentFamily: ['woody', 'citrus', 'floral'], concerns: ['daily'],
    variants: [],
    keyIngredients: ['essential-oils'],
    ingredients: ON_LABEL,
    benefits: ['No flame, no electricity', 'Works off the vent airflow', 'Essential oil, never fragrance oil'],
    howToUse: 'Clip to a vent. A few drops to refresh it when it fades.',
    art: { form: 'roller', sub: 'CAR DIFFUSER', tint: ['#F9F8F3', '#E9E5D6'], body: '#F0ECDF', cap: '#5F6355', accent: '#C8961E' }
  },

  {
    id: 'room-spray',
    name: 'Room Spray',
    brand: 'Aeindry', category: 'home', categoryLabel: 'Home & Aroma',
    tagline: 'For a room, and for linen',
    blurb: 'A mist for the air, the sofa and the bed.',
    description:
      'The immediate version of a diffuser — a diffuser is for a room all week, this is for a '
      + 'room in the next ten minutes. Fine enough to go over fabric, though it is worth '
      + 'testing a hem before you do the whole sofa.',
    price: 10,
    weight: '4 fl oz',
    scentFamily: ['floral', 'herbal', 'citrus'], concerns: ['sleep', 'daily'],
    variants: [],
    keyIngredients: ['essential-oils'],
    ingredients: ON_LABEL,
    benefits: ['Works on air and on linen', 'Essential oil, never fragrance oil', 'Made in Washington'],
    howToUse: 'Two or three mists into the air, or over bedding an hour before you get in.',
    art: { form: 'spray', sub: 'ROOM & LINEN', tint: ['#F8F9F5', '#E4E9DD'], body: '#EEF1E8', cap: '#5F6355', accent: '#A8C63C' }
  },
  /* ═════════════════════ SETS & PACKS ═════════════════════
     Priced by the owner as single items rather than as bundles of the
     products above, so they are products in their own right — not SETS
     entries, which are computed from their lines.
     ═══════════════════════════════════════════════════════ */

  {
    id: 'mini-hand-butter-pack',
    name: 'Pack of 5 Mini Hand Butters',
    brand: 'Aeindry', category: 'kits', categoryLabel: 'Sets & Packs',
    tagline: 'Five 1 oz tins',
    blurb: 'The way to find out which scent is yours.',
    description:
      'Five one-ounce tins instead of one two-ounce one. It is the sampler, and it is also the '
      + 'answer for anyone who wants a tin in the car, one at the desk and one by the bed.',
    price: 30,
    weight: '5 × 1 oz tins',
    scentFamily: ['citrus', 'floral', 'woody', 'sweet', 'herbal'],
    concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: ['shea-butter', 'cocoa-butter'],
    ingredients: ON_LABEL,
    benefits: ['Five scents in one box', 'One-ounce tins travel', 'Made by hand in Washington'],
    howToUse: 'Keep them where your hands are: the car, the desk, the bedside, a coat pocket.',
    art: { form: 'tin', sub: 'MINI × 5', tint: ['#FAF7F0', '#ECE2D0'], body: '#F0E8D9', cap: '#E8A0B4', accent: '#A8C63C' }
  },

  {
    id: 'mini-body-oil-pack',
    name: 'Set of 6 Mini Body Oils',
    brand: 'Aeindry', category: 'kits', categoryLabel: 'Sets & Packs',
    tagline: 'Six to try, before you commit to eight ounces',
    blurb: 'The whole oil shelf, in small bottles.',
    description:
      'Six small bottles rather than one large one. Body oil is the product people are most '
      + 'often wrong about liking, so trying six is a cheaper mistake than buying the 8 oz and '
      + 'finding out.',
    price: 35,
    weight: '6 × mini bottles',
    scentFamily: ['floral', 'woody', 'citrus', 'sweet'],
    concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Six scents in one box', 'Travel-sized', 'Made in Washington'],
    howToUse: 'Straight out of the shower, onto skin that is still wet.',
    art: { form: 'bottle', sub: 'MINI × 6', tint: ['#FBF8EF', '#EFE5CC'], body: '#F3EBD7', cap: '#7E9A72', accent: '#C8961E' }
  },

  {
    id: 'mini-beeswax-pack',
    name: 'Pack of 4 Small Beeswax Candles',
    brand: 'Aeindry', category: 'kits', categoryLabel: 'Sets & Packs',
    tagline: 'Four smalls, for four rooms',
    blurb: 'Four of the small candles, boxed.',
    description:
      'Four smalls, which is what most people actually want — one on the table, one in the '
      + 'bathroom, and two still in the box for when someone comes round.',
    price: 20,
    weight: '4 × small candles',
    photo: 'candle-hearth-and-haze',
    scentFamily: ['floral', 'sweet'], concerns: ['sleep'],
    variants: [],
    keyIngredients: ['beeswax', 'essential-oils'],
    ingredients: 'Beeswax, cotton wick, essential oils.',
    benefits: ['Four for the price of a little over three', 'Beeswax, not paraffin', 'Hand-poured in Washington'],
    howToUse: 'First burn, let the melt pool reach the edge — it sets how the rest of the candle burns.',
    art: { form: 'jar', sub: 'CANDLE × 4', tint: ['#FBF7EC', '#F0E7D2'], body: '#F3EBD8', cap: '#C8961E', accent: '#E9C97A' }
  },

  {
    id: 'lotion-bar-pack',
    name: 'Set of 6 Lotion Bars',
    brand: 'Aeindry', category: 'kits', categoryLabel: 'Sets & Packs',
    tagline: 'Six bars, four dollars off',
    blurb: 'A year of lotion bars, in a box.',
    description:
      'Lotion bars keep more or less indefinitely — there is no water in them — so buying six '
      + 'is not stockpiling so much as not thinking about it again for a while.',
    price: 20,
    weight: '6 × 1 oz bars',
    scentFamily: ['sweet', 'herbal', 'floral'], concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: ['beeswax', 'shea-butter'],
    ingredients: ON_LABEL,
    benefits: ['Six for the price of four', 'No water, so they keep', 'Made in Washington'],
    howToUse: 'Rub the bar straight onto dry patches and let body heat do the rest.',
    art: { form: 'puck', sub: 'LOTION × 6', tint: ['#FBF8EE', '#EEE6CE'], body: '#F1E8D2', cap: '#A8C63C', accent: '#E9C97A' }
  },

  {
    id: 'lip-balm-pack',
    name: 'Pack of 5 Lip Balms',
    brand: 'Aeindry', category: 'kits', categoryLabel: 'Sets & Packs',
    tagline: 'One for every coat',
    blurb: 'Five balms, because you will lose four of them.',
    description:
      'The honest maths on lip balm: you do not lose them so much as distribute them. Five is '
      + 'the number that gets you through a winter with one always in reach.',
    price: 14,
    weight: '5 × 0.15 oz tubes',
    scentFamily: ['sweet'], concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: ['beeswax'],
    ingredients: ON_LABEL,
    benefits: ['Five for the price of four', 'Beeswax base', 'Made in Washington'],
    howToUse: 'One in every coat, bag and bedside drawer. That is the system.',
    art: { form: 'tube', sub: 'BALM × 5', tint: ['#FBF8F2', '#EEE6D6'], body: '#F2EADA', cap: '#E8A0B4', accent: '#C8961E' }
  },

  {
    id: 'roll-on-pack',
    name: 'Pack of 5 Essential Oil Roll-Ons',
    brand: 'Aeindry', category: 'kits', categoryLabel: 'Sets & Packs',
    tagline: 'Five blends, five bags',
    blurb: 'The whole roll-on shelf at once.',
    description:
      'Five pre-diluted rollers. Cheaper together, and it means you can leave one in the desk '
      + 'drawer and stop carrying the same bottle between rooms.',
    price: 20,
    weight: '5 × 10 ml rollers',
    scentFamily: ['herbal', 'citrus', 'floral', 'woody'],
    concerns: ['sleep', 'muscle', 'daily'],
    variants: [],
    keyIngredients: ['essential-oils'],
    ingredients: ON_LABEL,
    benefits: ['Five for the price of four', 'Pre-diluted — no mixing', 'Essential oil, never fragrance oil'],
    howToUse: 'Roll onto wrists, temples or the back of the neck. Warm it in with a thumb.',
    art: { form: 'roller', sub: 'ROLL-ON × 5', tint: ['#F7F9F6', '#E2E9E0'], body: '#EAF0E7', cap: '#9B8FC7', accent: '#A8C63C' }
  },

  {
    id: 'jelly-mask-mini-pack',
    name: 'Set of 3 Mini Jelly Masks',
    brand: 'Aeindry', category: 'kits', categoryLabel: 'Sets & Packs',
    tagline: 'Three masks, three Fridays',
    blurb: 'Try three before you buy a full one.',
    description:
      'Three minis. A jelly mask is a fifteen-minute commitment and a fairly memorable one, so '
      + 'trying three of the five is a reasonable way to find out which you would repeat.',
    price: 20,
    weight: '3 × mini pots',
    scentFamily: ['fruity', 'sweet', 'herbal'],
    concerns: ['dry', 'oily', 'daily'],
    variants: [],
    keyIngredients: [],
    ingredients: ON_LABEL,
    benefits: ['Three of the five blends', 'Enough for one mask each', 'Made by hand in Washington'],
    howToUse: 'Mix, spread thick, leave fifteen minutes, then lift from one edge and peel.',
    art: { form: 'pot', sub: 'MASK × 3', tint: ['#FBF4F6', '#F0DDE4'], body: '#F5E3E8', cap: '#7E9A72', accent: '#B32644' }
  }
];

/**
 * Sets — several products bought together for one reason.
 *
 * Unlike the packs in the `kits` category, which the owner prices as single
 * items, a set is only a list of ids and a saving. Every name, price, photo
 * and variant is read from the products at render time, so a set can never
 * quietly drift from what is actually sold, and `tools/check-catalogue.mjs`
 * fails the build if one names something that has left the range.
 */
export const SETS = [
  {
    id: 'dry-skin',
    name: 'The Dry Skin Set',
    concern: 'dry',
    tagline: 'For skin that drinks everything and stays thirsty',
    blurb: 'The two richest things we make, plus the bar that will not strip what they put back.',
    lines: [
      { productId: 'botanical-hand-butter', variantId: 'vanilla' },
      { productId: 'body-cream', variantId: 'aloe-oats-honey' },
      { productId: 'pine-tar-soap' }
    ],
    saving: 6
  },
  {
    id: 'sensitive',
    name: 'The Calm Set',
    concern: 'sensitive',
    tagline: 'Nothing in here will argue with you',
    blurb: 'Unscented soap, oat-extract butter and a deodorant with no aluminium in it.',
    lines: [
      { productId: 'pine-tar-soap' },
      { productId: 'botanical-hand-butter', variantId: 'bud-of-rose' },
      { productId: 'deodorant-creme', variantId: 'lavender-meadows' }
    ],
    saving: 5
  },
  {
    id: 'unwind',
    name: 'The Unwind Set',
    concern: 'sleep',
    tagline: 'An evening, arranged',
    blurb: 'A steamer for the shower, a candle for after, and a diffuser that carries the room.',
    lines: [
      { productId: 'shower-steamers', variantId: 'lavender-large' },
      { productId: 'beeswax-candle', variantId: 'large' },
      { productId: 'room-diffuser', variantId: 'calming-mind' }
    ],
    saving: 6
  },
  {
    id: 'everyday',
    name: 'The Everyday Set',
    concern: 'daily',
    tagline: 'The three you will actually finish',
    blurb: 'Hands, underarms, face. The routine most people are really after.',
    lines: [
      { productId: 'hand-butter', variantId: 'citrus-hearth' },
      { productId: 'deodorant-creme', variantId: 'smoky-citrus' },
      { productId: 'face-toner', variantId: 'rose-rosemary' }
    ],
    saving: 6
  },
  {
    id: 'no-bottle',
    name: 'The No-Bottle Set',
    concern: 'daily',
    tagline: 'A whole bathroom, and not one plastic pump',
    blurb: 'Shampoo bar, conditioner bar, soap and the dish that makes all three last.',
    lines: [
      { productId: 'shampoo-bar', variantId: 'aloe-honey' },
      { productId: 'conditioner-bar', variantId: 'repair-growth' },
      { productId: 'handmade-soap' },
      { productId: 'bamboo-soap-dish', variantId: 'large' }
    ],
    saving: 7
  },
  {
    id: 'beard',
    name: 'The Beard Set',
    concern: 'daily',
    tagline: 'Oil on weekdays, balm on the days it matters',
    blurb: 'The two beard products and the shaving soap for the edges.',
    lines: [
      { productId: 'beard-oil' },
      { productId: 'beard-balm' },
      { productId: 'shaving-soap', variantId: 'cabane-tin' }
    ],
    saving: 6
  }
];

export const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]));

export const getProduct = (id) => PRODUCT_MAP.get(id) || null;

/** Lowest purchasable price for a product, accounting for variant overrides. */
export const priceOf = (product, variantId) => {
  if (!product) return 0;
  const v = variantId && product.variants?.find((x) => x.id === variantId);
  return v && typeof v.price === 'number' ? v.price : product.price;
};

/**
 * The rendered widths of a product's photograph.
 *
 * Two tiers for everything, but not always the same two: a source is only ever
 * scaled down, never up, so a photograph cropped out of a smaller frame tops
 * out lower. Declaring it here keeps the `w` descriptors in the srcset honest
 * — a browser told 900 about a 740px file will happily choose it for a display
 * size it cannot fill.
 */
export const PHOTO_WIDTHS = [480, 900];
export const photoWidthsOf = (product, variantId) => {
  const v = variantId && product?.variants?.find((x) => x.id === variantId);
  return (v?.photo ? v.photoWidths : null) || product?.photoWidths || PHOTO_WIDTHS;
};

/**
 * The photo for a product, or for one of its variants when that variant was
 * shot separately. Returns null when nothing was photographed, which is the
 * signal to fall back to the generated illustration.
 */
export const photoOf = (product, variantId) => {
  if (!product) return null;
  const v = variantId && product.variants?.find((x) => x.id === variantId);
  return v?.photo || product.photo || null;
};

export const getSet = (id) => SETS.find((s) => s.id === id) || null;

/** What a set costs, and what it saves — both derived, never stored twice. */
export const setPricing = (set) => {
  const full = (set?.lines || []).reduce(
    (n, l) => n + priceOf(getProduct(l.productId), l.variantId), 0);
  return { full, price: Math.max(0, full - (set?.saving || 0)), saving: set?.saving || 0 };
};

export const formatPrice = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
