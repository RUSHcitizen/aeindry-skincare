/**
 * Product catalogue — Aeindry Skincare and Bloom In Clover
 *
 * Every product here is one that exists and has been photographed. Names,
 * scent notes, sizes and ingredient lists are read off the labels in the
 * shoot; nothing is invented to fill a category out. Where a label does not
 * say something, this file does not say it either.
 *
 * ── PRICES ARE NOT FROM THE LABELS ────────────────────────────────────────
 * The photographs show what the products are, not what they cost. Every
 * `price` below is a placeholder carrying `pricePending: true`, and
 * `tools/check-prices.mjs` lists them. Set the real ones before selling.
 * When a WooCommerce store is connected the store's own prices win anyway —
 * these only drive the catalogue preview.
 *
 * `photo` is the white-sweep product shot; `art` still drives the generated
 * SVG, which is the fallback wherever a photo has not been taken yet.
 */

export const CATEGORIES = [
  { id: 'all',    label: 'Everything' },
  { id: 'body',   label: 'Body & Hands' },
  { id: 'face',   label: 'Face' },
  { id: 'soap',   label: 'Soap & Bath' },
  { id: 'home',   label: 'Home & Aroma' }
];

/** Photographed but priced provisionally — see the note above. */
const PENDING = true;

export const PRODUCTS = [
  {
    id: 'hand-butter',
    name: 'Botanical Hand Butter',
    brand: 'Aeindry',
    category: 'body',
    categoryLabel: 'Body & Hands',
    tagline: 'Deep nourishing, with oat extract',
    blurb: 'A dense, slow-melting butter for hands that work. Five scents, one tin.',
    description:
      'Whipped rather than poured, so it goes on light and then sinks in. Oat extract is the '
      + 'quiet workhorse — it is what makes a rich butter calm rather than merely greasy — and the '
      + 'Bud of Rose tin carries calendula instead. Made in small batches in Washington.',
    price: 14, pricePending: PENDING,
    weight: '2 oz tin',
    photo: 'hand-butter',
    scentFamily: ['citrus', 'floral', 'herbal', 'sweet'],
    concerns: ['dry', 'eczema', 'daily', 'sensitive'],
    variants: [
      { id: 'citrus-mint',     label: 'Citrus Mint',     swatch: '#A8C63C', note: 'With oat extract' },
      { id: 'lavender-lemon',  label: 'Lavender Lemon',  swatch: '#7B2E86', note: 'With oat extract' },
      { id: 'orange-blossom',  label: 'Orange Blossom',  swatch: '#C8961E', note: 'With oat extract' },
      { id: 'bud-of-rose',     label: 'Bud of Rose',     swatch: '#E8A0B4', note: 'With calendula extract' },
      { id: 'vanilla',         label: 'Vanilla',         swatch: '#D9CDBA', note: 'With mango flower extract' }
    ],
    keyIngredients: ['shea-butter', 'cocoa-butter', 'oat-extract', 'calendula'],
    ingredients: 'See the tin — full ingredient list is printed on every label.',
    benefits: [
      'Whipped, so it absorbs rather than sits',
      'Oat extract to settle skin that reacts',
      'Small batches, made in Washington'
    ],
    howToUse: 'Warm a little between your fingers and work into hands and cuticles. Best last thing at night.',
    art: { form: 'tin', tint: ['#FAF6EE', '#EDE3D2'], body: '#EFE7D8', cap: '#A8C63C', accent: '#C8961E' }
  },

  {
    id: 'hair-butter',
    name: 'Hair Butter & Intensive Treatment Mask',
    brand: 'Aeindry',
    category: 'body',
    categoryLabel: 'Body & Hands',
    tagline: 'Root strength, botanical power',
    blurb: 'A weekly mask for scalp and lengths, built on cupuaçu and murumuru.',
    description:
      'A thick treatment rather than a conditioner. Coconut oil and the cupuaçu and murumuru '
      + 'butters do the conditioning; rosemary, neem, fenugreek and moringa are the scalp half of '
      + 'the formula. Left on long enough it behaves like a mask, which is what it is.',
    price: 24, pricePending: PENDING,
    weight: '4 oz jar',
    photo: 'hair-butter',
    /* Cropped out of one panel of a three-panel listing image — the only frame
       of this product on file — so 740 is as large as it honestly goes. */
    photoWidths: [480, 740],
    scentFamily: ['herbal', 'woody'],
    concerns: ['dry', 'daily'],
    variants: [],
    keyIngredients: ['coconut-oil', 'cupuacu-butter', 'murumuru-butter', 'rosemary', 'neem', 'fenugreek', 'moringa'],
    ingredients: 'Coconut oil, cupuaçu butter, murumuru butter, rosemary, neem, fenugreek, moringa.',
    benefits: [
      'Cupuaçu and murumuru — deeply restoring, rich in fatty acids',
      'Rosemary and neem for the scalp, not just the lengths',
      'Fenugreek and moringa, traditionally used for thinning'
    ],
    howToUse: 'Work through damp hair from the scalp down. Leave twenty minutes, or overnight, then shampoo out.',
    art: { form: 'jar', tint: ['#F6F2E8', '#E4DCC8'], body: '#EFE9DA', cap: '#6E7263', accent: '#A8C63C' }
  },

  {
    id: 'deodorant-creme',
    name: 'Natural Deodorant Creme',
    brand: 'Aeindry',
    category: 'body',
    categoryLabel: 'Body & Hands',
    tagline: 'All natural, and it actually works',
    blurb: 'A cream deodorant in a jar. No aluminium, no alcohol, no stick.',
    description:
      'Applied with a fingertip rather than swiped. It is a cream, so it goes on without the drag '
      + 'a stick leaves on freshly shaved skin, and there is no aluminium in it at all.',
    price: 16, pricePending: PENDING,
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
    ingredients: 'See the jar — full ingredient list is printed on every label.',
    benefits: ['No aluminium', 'A cream, so no drag on shaved skin', 'Scented with essential oil only'],
    howToUse: 'A pea-sized amount, warmed between fingertips and smoothed on. Less than you think.',
    art: { form: 'jar', tint: ['#F7F4FA', '#E7E1F0'], body: '#F2EDE6', cap: '#9B8FC7', accent: '#C4713A' }
  },

  {
    id: 'face-oil-berry-bakuchiol',
    name: 'Berry Bakuchiol Face Oil',
    brand: 'Aeindry',
    category: 'face',
    categoryLabel: 'Face',
    tagline: 'Face oil loaded with antioxidants',
    blurb: 'Bakuchiol and berry-seed oils, for skin that wants results without the sting.',
    description:
      'Bakuchiol is the plant-side of the retinol conversation — it is used for the same reasons '
      + 'and does not carry the same irritation. Blended here into berry-seed oils, which is where '
      + 'the antioxidants come from.',
    price: 34, pricePending: PENDING,
    weight: '1 oz dropper bottle',
    photo: 'face-oil-berry-bakuchiol',
    scentFamily: ['fruity', 'unscented'],
    concerns: ['aging', 'daily'],
    variants: [],
    keyIngredients: ['bakuchiol', 'rosehip-oil', 'raspberry-seed-oil'],
    ingredients: 'See the bottle — full ingredient list is printed on the label.',
    benefits: [
      'Bakuchiol rather than retinol — no sting, no peeling',
      'Berry-seed oils for antioxidants',
      'A few drops is a whole application'
    ],
    howToUse: 'Two or three drops pressed into damp skin at night. Follow with a cream if you use one.',
    art: { form: 'dropper', tint: ['#F7F2F6', '#E9DCE8'], body: '#C9A8D8', cap: '#7E4EAE', accent: '#B32644' }
  },

  {
    id: 'pine-tar-soap',
    name: 'Pine Tar Soap',
    brand: 'Aeindry',
    category: 'soap',
    categoryLabel: 'Soap & Bath',
    tagline: 'Unscented, all natural, handmade artisan soap',
    blurb: 'The plainest bar we make, and the one people come back for.',
    description:
      'Pine tar soap has been made for a very long time for a reason. This one is unscented — '
      + 'the smell is the pine tar itself — and stamped by hand. Nothing added to make it prettier.',
    price: 12, pricePending: PENDING,
    weight: '4 oz bar',
    photo: 'pine-tar-soap',
    /* No essential oil in the bar at all; what you smell is the pine tar. */
    scentFamily: ['unscented', 'woody'],
    concerns: ['eczema', 'sensitive', 'dry'],
    variants: [],
    keyIngredients: ['pine-tar', 'olive-oil', 'coconut-oil', 'shea-butter'],
    ingredients: 'See the label — full ingredient list is printed on every bar.',
    benefits: ['Unscented — no essential oil at all', 'Hand-stamped, cured, cut by hand', 'Long-standing traditional formula'],
    howToUse: 'Lather on a cloth or between wet hands. Keep it on a draining dish and it will last.',
    art: { form: 'bar', tint: ['#F4EFE7', '#DFD3C2'], body: '#6B4A32', cap: '#3F3B31', accent: '#8B6444' }
  },

  {
    id: 'shower-steamers',
    name: 'Shower Steamers',
    brand: 'Aeindry',
    category: 'soap',
    categoryLabel: 'Soap & Bath',
    tagline: 'Lemongrass & orange',
    blurb: 'Drop one on the shower floor and stand in it.',
    description:
      'Bicarbonate and citric acid with lemongrass, sweet orange and mandarin essential oils. '
      + 'Not a bath bomb — these are made for a shower, where the steam does the work.',
    price: 14, pricePending: PENDING,
    weight: '5.6 oz',
    photo: 'shower-steamers',
    scentFamily: ['citrus', 'herbal'],
    concerns: ['sleep', 'daily'],
    variants: [],
    keyIngredients: ['lemongrass', 'sweet-orange', 'mandarin', 'essential-oils'],
    ingredients:
      'Sodium bicarbonate, citric acid, cornstarch, sunflower oil, L-menthol, lemongrass essential oil, '
      + 'sweet orange essential oil, mandarin essential oil.',
    benefits: ['Essential oil, never fragrance oil', 'Menthol for a genuinely open-airways steam', 'Made for showers, not baths'],
    howToUse: 'Place one at the far end of the shower floor, out of the direct stream. It will last the wash.',
    art: { form: 'bomb', tint: ['#FAF7EC', '#EDE6CE'], body: '#F2EDDF', cap: '#A8C63C', accent: '#C8961E' }
  },

  {
    id: 'beeswax-candle',
    name: 'Beeswax Candle',
    brand: 'Aeindry',
    category: 'home',
    categoryLabel: 'Home & Aroma',
    tagline: 'All-natural wax, hand-poured in Washington',
    blurb: 'Beeswax, a cotton wick, and a jar you will keep.',
    description:
      'Beeswax burns slower and cleaner than paraffin and smells faintly of honey before it is '
      + 'scented at all. Hand-poured in small batches.',
    price: 26, pricePending: PENDING,
    weight: '8 oz jar',
    photo: 'candle-summer-meadow',
    scentFamily: ['floral', 'sweet'],
    concerns: ['sleep'],
    variants: [
      { id: 'summer-meadow', label: 'Summer Meadow', swatch: '#C9D4A0', note: 'Green, open, light',
        photo: 'candle-summer-meadow' },
      { id: 'hearth-and-hive', label: 'Hearth & Hive', swatch: '#C8961E', note: 'Honey, warm, close',
        photo: 'candle-hearth-and-haze' }
    ],
    keyIngredients: ['beeswax', 'essential-oils'],
    ingredients: 'Beeswax, cotton wick, essential oils.',
    benefits: ['Beeswax, not paraffin or soy blend', 'Cotton wick', 'Hand-poured in Washington'],
    howToUse: 'First burn, let the melt pool reach the edge — it sets how the rest of the candle burns.',
    art: { form: 'jar', tint: ['#FBF7EC', '#F0E7D2'], body: '#F3EBD8', cap: '#C8961E', accent: '#A8C63C' }
  },

  {
    id: 'room-diffuser',
    name: 'Room Diffuser',
    brand: 'Bloom In Clover',
    category: 'home',
    categoryLabel: 'Home & Aroma',
    tagline: '100% natural, made in USA',
    blurb: 'Reed diffusers in five scents. They fill a room and then stay out of the way.',
    description:
      'A glass bottle, rattan reeds and a natural base. Turn the reeds when the scent fades and it '
      + 'lifts again. From Bloom In Clover, our sister line.',
    price: 22, pricePending: PENDING,
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
    ingredients: 'See the bottle — full ingredient list is printed on the label.',
    benefits: ['No flame, no electricity', 'Turn the reeds to refresh', '100% natural, made in USA'],
    howToUse: 'Put the reeds in and leave them an hour to draw. Turn them once a week.',
    art: { form: 'bottle', tint: ['#FBFAF6', '#EFEADC'], body: '#F5F1E6', cap: '#C8961E', accent: '#A8C63C' }
  }
];

/**
 * Sets — several products bought together for one reason.
 *
 * Built out of `concerns` on the products above rather than a second hand-kept
 * list, so a set can never quietly reference something that has left the
 * catalogue. Price is the honest sum of the parts less the saving.
 */
export const SETS = [
  {
    id: 'dry-skin',
    name: 'The Dry Skin Set',
    concern: 'dry',
    tagline: 'For skin that drinks everything and stays thirsty',
    blurb: 'The two richest things we make, plus the bar that will not strip what they put back.',
    lines: [
      { productId: 'hand-butter', variantId: 'vanilla' },
      { productId: 'hair-butter' },
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
      { productId: 'hand-butter', variantId: 'bud-of-rose' },
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
      { productId: 'shower-steamers' },
      { productId: 'beeswax-candle', variantId: 'summer-meadow' },
      { productId: 'room-diffuser', variantId: 'calming-mind' }
    ],
    saving: 8
  },
  {
    id: 'everyday',
    name: 'The Everyday Set',
    concern: 'daily',
    tagline: 'The three you will actually finish',
    blurb: 'Hands, underarms, face. The routine most people are really after.',
    lines: [
      { productId: 'hand-butter', variantId: 'citrus-mint' },
      { productId: 'deodorant-creme', variantId: 'smoky-citrus' },
      { productId: 'face-oil-berry-bakuchiol' }
    ],
    saving: 7
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
 * The photo for a product, or for one of its variants when that variant was
 * shot separately. Returns null when nothing was photographed, which is the
 * signal to fall back to the generated illustration.
 */
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
