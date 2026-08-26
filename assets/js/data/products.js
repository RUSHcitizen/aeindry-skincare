/**
 * Product catalogue — Aeindry Skincare
 *
 * Names, categories, product claims and ingredient stories are taken from
 * aeindryskincare.com. Prices and variant line-ups are representative
 * placeholders (see README) — swap `price` / `variants` for live values.
 *
 * `art` drives the generated SVG illustration in lib/art.js:
 *   form  — which vessel to draw
 *   tint  — [from, to] background wash for the card media
 *   body  — main product colour
 *   cap   — lid / cap colour
 *   accent— highlight used for swirls, labels and glow
 */

export const CATEGORIES = [
  { id: 'all',        label: 'Everything' },
  { id: 'face',       label: 'Face Care' },
  { id: 'soap',       label: 'Soaps' },
  { id: 'body',       label: 'Body & Bath' },
  { id: 'aroma',      label: 'Aromatherapy' },
  { id: 'home',       label: 'Home' }
];

export const PRODUCTS = [
  {
    id: 'specialty-soap',
    name: 'Specialty Soap',
    category: 'soap',
    categoryLabel: 'Soaps',
    tagline: 'Cold-pressed, clay-swirled, cured six weeks',
    blurb: 'Handmade with plant-extracted colours and clays, scented with pure essential oil.',
    description:
      'Our specialty soaps are made the slow way. Exotic butters and herb-infused oils are blended with plant-extracted colours and mineral clays, scented only with pure essential oil, then cured for six full weeks so every bar lathers rich and rinses clean. No detergents, no synthetic fragrance, no dyes — just soap the way it was made before shortcuts existed.',
    price: 12,
    compareAt: null,
    rating: 4.9,
    reviews: 214,
    badges: ['Bestseller'],
    weight: '4.5 oz bar',
    scentFamily: ['herbal', 'floral', 'earthy'],
    concerns: ['eczema', 'dry', 'sensitive', 'daily'],
    variants: [
      { id: 'lavender-oat',   label: 'Lavender & Oat',        swatch: '#9B8FC7', note: 'Calming, colloidal oatmeal' },
      { id: 'charcoal-tea',   label: 'Charcoal & Tea Tree',   swatch: '#3B3F43', note: 'Clarifying, for oily skin' },
      { id: 'rose-clay',      label: 'Rose Clay & Geranium',  swatch: '#C98E8E', note: 'Gentle, for sensitive skin' },
      { id: 'turmeric-honey', label: 'Turmeric & Honey',      swatch: '#D8A54A', note: 'Brightening, warm' },
      { id: 'cedar-moss',     label: 'Cedarwood & Moss',      swatch: '#5C7355', note: 'Grounding, forest-green' }
    ],
    keyIngredients: ['shea-butter', 'cocoa-butter', 'olive-oil', 'coconut-oil', 'kaolin-clay', 'essential-oils'],
    ingredients:
      'Saponified oils of olive, organic virgin coconut, sustainable palm, castor and sweet almond; shea butter, cocoa butter, herb-infused oils, kaolin & rose clay, French green clay, activated charcoal, madder root, annatto, pure essential oils.',
    benefits: [
      'Six-week cure for a harder, longer-lasting bar',
      'Naturally glycerin-rich — soap that moisturises as it cleans',
      'Coloured only with clays, roots and botanicals',
      'Scented with pure essential oil, never fragrance oil'
    ],
    howToUse: 'Lather between wet hands or on a washcloth, work over damp skin, rinse. Keep on a draining dish between washes and the bar will last months.',
    art: { form: 'bar', tint: ['#FCF8FB', '#E9DFF0'], body: '#E6DAD0', cap: '#7E4EAE', accent: '#B98DDB' }
  },

  {
    id: 'shave-soap',
    name: 'Shave Soap',
    category: 'soap',
    categoryLabel: 'Soaps',
    tagline: 'A closer pass, without the burn after',
    blurb: 'Helps with a great shave — and saves you from the burning sensation afterward.',
    description:
      'Whipped to a dense, slippery lather that cushions the blade instead of foaming away under it. Bentonite clay adds the slip, kaolin adds the glide, and a base of shea and tallow-free butters keeps the skin conditioned so the pass after the pass does not sting. Built for a brush, forgiving without one.',
    price: 14,
    compareAt: null,
    rating: 4.8,
    reviews: 96,
    badges: [],
    weight: '3.5 oz puck',
    scentFamily: ['woody', 'herbal'],
    concerns: ['sensitive', 'daily'],
    variants: [
      { id: 'bay-rum',      label: 'Bay Rum',          swatch: '#8A5A3B', note: 'Classic, spiced' },
      { id: 'sandal-vet',   label: 'Sandalwood & Vetiver', swatch: '#9C8663', note: 'Warm, woody' },
      { id: 'unscented',    label: 'Unscented',        swatch: '#E3DAC9', note: 'For reactive skin' }
    ],
    keyIngredients: ['shea-butter', 'bentonite-clay', 'kaolin-clay', 'castor-oil'],
    ingredients:
      'Saponified oils of olive, coconut, castor and avocado; shea butter, bentonite clay, kaolin clay, glycerin, aloe vera, pure essential oils.',
    benefits: [
      'Dense, cushioning lather that will not collapse mid-shave',
      'Bentonite clay for genuine blade slip',
      'No drying detergents or synthetic foaming agents',
      'Unscented option for reactive skin'
    ],
    howToUse: 'Wet the puck, load a damp brush with 20–30 seconds of swirling, build the lather on your face. Rinse the puck and let it dry open-air.',
    art: { form: 'puck', tint: ['#F9F9FD', '#DFE3F0'], body: '#EDE4DC', cap: '#55609E', accent: '#949BCB' }
  },

  {
    id: 'salve',
    name: 'Herbal Salve',
    category: 'body',
    categoryLabel: 'Body & Bath',
    tagline: 'Herb-infused oils, slowly drawn',
    blurb: 'Made with skin-loving herb-infused oils — fast penetrating, moisturising, and infused with essential oil for added benefit.',
    description:
      'Calendula, plantain, comfrey and chamomile steeped in oil for six weeks, then set with beeswax into a balm that melts on contact. Fast-penetrating rather than greasy — it sinks into cracked knuckles, weathered elbows and wind-burned cheeks and stays put. This is the formula the whole company grew out of.',
    price: 18,
    compareAt: null,
    rating: 5.0,
    reviews: 341,
    badges: ['Bestseller', 'Where it began'],
    weight: '2 oz tin',
    scentFamily: ['herbal', 'earthy'],
    concerns: ['eczema', 'dry', 'sensitive', 'muscle'],
    variants: [
      { id: 'calendula',    label: 'Calendula Rescue',    swatch: '#E0A93F', note: 'Eczema, cracked skin', price: 18 },
      { id: 'muscle-rub',   label: 'Muscle Rub',          swatch: '#4E7C59', note: 'Arnica, camphor, menthol', price: 20 },
      { id: 'cbd-muscle',   label: 'CBD-Infused Muscle Rub', swatch: '#2F5D3A', note: 'Ships to Washington State only', price: 34, restricted: 'WA' },
      { id: 'chest-rub',    label: 'Chest Rub',           swatch: '#5E9BA8', note: 'Eucalyptus, easy breathing', price: 18 }
    ],
    keyIngredients: ['calendula', 'beeswax', 'shea-butter', 'olive-oil', 'essential-oils'],
    ingredients:
      'Olive oil infused with calendula, plantain, comfrey and chamomile; shea butter, beeswax, vitamin E, pure essential oils. CBD variant adds full-spectrum hemp extract.',
    benefits: [
      'Six-week herbal infusion, never a quick heat extraction',
      'Absorbs fast — conditions without a greasy film',
      'Beeswax seals in moisture through the workday',
      'Nothing but oil, wax and plants'
    ],
    howToUse: 'Warm a small amount between fingertips and press into clean, dry skin. Reapply as often as needed. For the muscle rub, massage into the area and wash hands after.',
    note: 'CBD-Infused Muscle Rub ships within Washington State only.',
    art: { form: 'tin', tint: ['#FDF9EF', '#F0E3C8'], body: '#E8DCC6', cap: '#A88322', accent: '#E3C56F' }
  },

  {
    id: 'face-cream',
    name: 'Face Cream',
    category: 'face',
    categoryLabel: 'Face Care',
    tagline: 'Exotic butters, ultra moisturising',
    blurb: 'All-natural plant-based ultra moisturising face cream made with exotic butters and skin-loving oils.',
    description:
      'A rich, plant-based cream built on mango, kokum and shea butters with rosehip, jojoba and sea buckthorn oils. Thick in the jar, it thins to nothing on warm skin and leaves a soft, matte finish rather than a shine. Made in Washington in small batches, with no silicon, no formaldehyde donors and no harsh chemicals.',
    price: 34,
    compareAt: 39,
    rating: 4.9,
    reviews: 187,
    badges: ['Bestseller'],
    weight: '1.7 oz jar',
    scentFamily: ['floral', 'unscented'],
    concerns: ['dry', 'sensitive', 'aging', 'daily'],
    variants: [
      { id: 'rose-frank',  label: 'Rose & Frankincense', swatch: '#D9A2A8', note: 'Mature, dry skin' },
      { id: 'blue-tansy',  label: 'Blue Tansy & Aloe',   swatch: '#7FA3C4', note: 'Reactive, redness-prone' },
      { id: 'fragrance-free', label: 'Fragrance Free',   swatch: '#EDE4D5', note: 'Pure, for eczema' }
    ],
    keyIngredients: ['shea-butter', 'mango-butter', 'rosehip-oil', 'jojoba-oil', 'sea-buckthorn', 'vitamin-e'],
    ingredients:
      'Mango butter, kokum butter, shea butter, rosehip seed oil, jojoba oil, sea buckthorn oil, sweet almond oil, aloe vera, vitamin E, pure essential oils.',
    benefits: [
      'NO silicon, formaldehyde or harsh chemicals',
      'Sinks in matte — wears cleanly under make-up',
      'Sea buckthorn and rosehip for tone and texture',
      'Handmade in small batches in Washington'
    ],
    howToUse: 'Warm a pea-sized amount between fingertips and press — do not rub — into damp skin, morning and night. Follow a serum, precede sunscreen.',
    art: { form: 'jar', tint: ['#FDF6F5', '#F3DEE1'], body: '#F4EBE6', cap: '#A93E5C', accent: '#D96C87' }
  },

  {
    id: 'powder-to-foam-cleanser',
    name: 'Powder to Foam Cleanser',
    category: 'face',
    categoryLabel: 'Face Care',
    tagline: 'Water-activated, waterless in the jar',
    blurb: 'All natural and gentle on facial skin — a must-have for your daily facial care routine.',
    description:
      'A dry botanical powder that turns to soft foam the moment it meets water. Because there is no water in the jar there is no need for a preservative system, so the formula stays exactly as gentle as its ingredient list: oat, rice, kaolin and marshmallow root, ground fine and blended with a plant-derived foamer. Cleanses without stripping and doubles as a weekly gentle exfoliant.',
    price: 26,
    compareAt: null,
    rating: 4.8,
    reviews: 118,
    badges: ['Preservative free'],
    weight: '2.1 oz jar',
    scentFamily: ['unscented', 'herbal'],
    concerns: ['sensitive', 'daily', 'oily'],
    variants: [
      { id: 'oat-original', label: 'Oat & Marshmallow', swatch: '#E8D9BC', note: 'Everyday, all skin types' },
      { id: 'rice-clay',    label: 'Rice & Rose Clay',  swatch: '#DDB6AE', note: 'Brightening' }
    ],
    keyIngredients: ['colloidal-oat', 'kaolin-clay', 'marshmallow-root', 'rice-powder'],
    ingredients:
      'Colloidal oatmeal, rice powder, kaolin clay, marshmallow root, chamomile, sodium cocoyl isethionate (coconut-derived), calendula, pure essential oils.',
    benefits: [
      'Waterless — so no preservatives are needed at all',
      'Foams gently without stripping the skin barrier',
      'Doubles as a soft weekly exfoliant',
      'Travel-safe: nothing to spill, nothing to leak'
    ],
    howToUse: 'Tip half a teaspoon into a wet palm, add a little water and work into a foam. Massage over damp skin for 30 seconds, rinse warm. Keep the jar dry.',
    art: { form: 'pot', tint: ['#FBFBF0', '#EAEACB'], body: '#F0E9DE', cap: '#918C2C', accent: '#E6E27C' }
  },

  {
    id: 'face-wipe-washing-net',
    name: 'Face Wipe & Washing Net',
    category: 'face',
    categoryLabel: 'Face Care',
    tagline: 'The small tools that make the ritual',
    blurb: 'A soft reusable face wipe and a foaming net that turns any bar into a cloud of lather.',
    description:
      'Two humble things that quietly upgrade everything else. The washing net whips a soap bar or a scoop of cleanser into a dense, air-light foam in seconds, so you use less product and get a better cleanse. The face wipe is soft double-gauze cotton — warm it under the tap to melt off the day, cool it to calm a flushed face. Both wash and reuse for years.',
    price: 8,
    compareAt: null,
    rating: 4.7,
    reviews: 64,
    badges: ['Reusable'],
    weight: 'Set of 2',
    scentFamily: ['unscented'],
    concerns: ['daily', 'sensitive'],
    variants: [
      { id: 'set',      label: 'Wipe + Net Set', swatch: '#E7E1D3', note: 'Both, together' },
      { id: 'net-only', label: 'Washing Net only', swatch: '#CFE0DB', note: 'For your soap bar', price: 5 }
    ],
    keyIngredients: [],
    ingredients: 'Double-gauze cotton face wipe. Foaming net: soft polyester mesh with a drawstring.',
    benefits: [
      'Turns a soap bar into rich foam in about ten seconds',
      'Uses noticeably less product per wash',
      'Machine washable — replaces disposable rounds',
      'Hangs to dry between uses'
    ],
    howToUse: 'Wet the net, rub the bar into it a few times, squeeze and it foams. For the wipe: soak in warm water, wring, and press over the face to soften the day off.',
    art: { form: 'net', tint: ['#F5FBFB', '#DCEEEE'], body: '#E9EFEE', cap: '#3D8A8C', accent: '#98D2D3' }
  },

  {
    id: 'lip-balm',
    name: 'Lip Balm',
    category: 'body',
    categoryLabel: 'Body & Bath',
    tagline: 'Cocoa butter and beeswax, nothing clever',
    blurb: 'All natural, made with highly moisturising cocoa butter, castor oil, avocado oil, organic virgin coconut oil and beeswax.',
    description:
      'Five ingredients, all of which you could eat. Cocoa butter for staying power, castor oil for that faint natural gloss, avocado and organic virgin coconut oil to soften, and beeswax to hold it all in place through a Pacific Northwest winter. It goes on smooth rather than waxy and does not need reapplying every ten minutes.',
    price: 7,
    compareAt: null,
    rating: 4.9,
    reviews: 428,
    badges: ['Bestseller'],
    weight: '0.15 oz tube',
    scentFamily: ['citrus', 'herbal', 'unscented'],
    concerns: ['dry', 'daily', 'sensitive'],
    variants: [
      { id: 'peppermint', label: 'Peppermint',      swatch: '#7FBFA0', note: 'Cooling, classic' },
      { id: 'sweet-orange', label: 'Sweet Orange',  swatch: '#E8A64C', note: 'Bright, cheerful' },
      { id: 'vanilla-cocoa', label: 'Vanilla Cocoa', swatch: '#B98A62', note: 'Warm, dessert-soft' },
      { id: 'unscented',  label: 'Unscented',       swatch: '#EFE3CE', note: 'For the sensitive' }
    ],
    keyIngredients: ['cocoa-butter', 'castor-oil', 'avocado-oil', 'coconut-oil', 'beeswax'],
    ingredients: 'Cocoa butter, castor oil, avocado oil, organic virgin coconut oil, beeswax, vitamin E, pure essential oil.',
    benefits: [
      'Five food-grade ingredients, nothing else',
      'Cocoa butter holds through wind and cold',
      'A natural sheen without any wax drag',
      'No petrolatum, no synthetic flavour'
    ],
    howToUse: 'Swipe over lips as often as you like. Warm the tube in a pocket in deep winter for an easier glide.',
    art: { form: 'tube', tint: ['#FDF6F2', '#F5DDD1'], body: '#5C4656', cap: '#C4713A', accent: '#EBAB77' }
  },

  {
    id: 'deodorant',
    name: 'Deodorant Cream',
    category: 'body',
    categoryLabel: 'Body & Bath',
    tagline: 'Baking-soda free, works all day',
    blurb: 'All natural and free of baking soda, parabens, formaldehyde and silicon. Naturally scented, works all day without clogging your pores.',
    description:
      'Most natural deodorants that fail do so for one of two reasons: they use baking soda, which burns, or they stop working by lunch. This one uses magnesium hydroxide and kaolin instead of soda to neutralise odour, arrowroot to handle moisture, and coconut oil for its own quiet antibacterial work. A pea-sized amount, smoothed in with fingertips, holds a full day.',
    price: 16,
    compareAt: null,
    rating: 4.7,
    reviews: 203,
    badges: ['No baking soda'],
    weight: '2 oz jar',
    scentFamily: ['citrus', 'woody', 'unscented'],
    concerns: ['sensitive', 'daily'],
    variants: [
      { id: 'bergamot-cedar', label: 'Bergamot & Cedar', swatch: '#A0824F', note: 'Fresh, unisex' },
      { id: 'lavender-sage',  label: 'Lavender & Sage',  swatch: '#9E9BC0', note: 'Soft, herbal' },
      { id: 'unscented',      label: 'Unscented',        swatch: '#EFE7D8', note: 'For freshly shaved skin' }
    ],
    keyIngredients: ['arrowroot', 'magnesium', 'kaolin-clay', 'coconut-oil', 'shea-butter'],
    ingredients: 'Organic virgin coconut oil, shea butter, arrowroot powder, magnesium hydroxide, kaolin clay, candelilla wax, vitamin E, pure essential oils.',
    benefits: [
      'No baking soda — no stinging, no rash',
      'Free of parabens, formaldehyde and silicon',
      'Deodorises without blocking pores',
      'A jar lasts roughly three months of daily use'
    ],
    howToUse: 'Warm a pea-sized amount between fingertips until it melts, then smooth into clean, dry underarms. Less is genuinely more.',
    art: { form: 'tin', tint: ['#F8FBF4', '#E2EED6'], body: '#E9E5D8', cap: '#6E9450', accent: '#C4E0AC' }
  },

  {
    id: 'perfume',
    name: 'Solid Perfume',
    category: 'aroma',
    categoryLabel: 'Aromatherapy',
    tagline: 'Essential oil, set in butter and beeswax',
    blurb: 'All natural essential oil perfume in solid form, made with skin-loving butter oil and beeswax.',
    description:
      'Perfume without the alcohol, the sting, or the plume that fills a lift. Pure essential oils are blended into a base of shea butter, jojoba and beeswax, so the scent lifts off warm skin slowly and stays close. It sits in a pocket, survives a handbag, and never spills — and because the base is a balm, it conditions the skin it wears on.',
    price: 22,
    compareAt: null,
    rating: 4.8,
    reviews: 129,
    badges: ['Alcohol free'],
    weight: '0.5 oz tin',
    scentFamily: ['floral', 'woody', 'citrus'],
    concerns: ['daily', 'sensitive'],
    variants: [
      { id: 'rose-oud',    label: 'Rose & Oud',        swatch: '#B4667B', note: 'Deep, romantic' },
      { id: 'neroli-fig',  label: 'Neroli & Fig',      swatch: '#C7B06B', note: 'Green, sunlit' },
      { id: 'vetiver-vanilla', label: 'Vetiver & Vanilla', swatch: '#8B6B4A', note: 'Warm, woody' },
      { id: 'lavender-bergamot', label: 'Lavender & Bergamot', swatch: '#9186BC', note: 'Clean, calming' }
    ],
    keyIngredients: ['shea-butter', 'jojoba-oil', 'beeswax', 'essential-oils'],
    ingredients: 'Shea butter, jojoba oil, beeswax, sweet almond oil, vitamin E, pure essential oil blend.',
    benefits: [
      'No alcohol, no synthetic fixatives, no phthalates',
      'Wears close to the skin — considerate in shared spaces',
      'Spill-proof for travel and handbags',
      'Conditions the skin it is worn on'
    ],
    howToUse: 'Swipe a fingertip across the surface and press onto pulse points — wrists, throat, behind the ears. Layer a second pass after a few hours.',
    art: { form: 'tin-small', tint: ['#FCF6FA', '#EFDCEA'], body: '#E9D9E2', cap: '#9A4E86', accent: '#CE8BBC' }
  },

  {
    id: 'essential-oil',
    name: 'Essential Oil Roller',
    category: 'aroma',
    categoryLabel: 'Aromatherapy',
    tagline: 'Pre-diluted, pocket-sized, ready to use',
    blurb: 'Pure essential oil blends pre-diluted in fractionated coconut oil, in a steel roller bottle.',
    description:
      'Blended for a job rather than a mood board. Each roller carries a pure essential oil blend already diluted to a skin-safe strength in fractionated coconut oil, so there is nothing to measure and no risk of a burn. Stainless steel rollerball, amber glass to protect the oils from light, and a cap that has never once come loose in a bag.',
    price: 18,
    compareAt: null,
    rating: 4.8,
    reviews: 152,
    badges: [],
    weight: '10 ml roller',
    scentFamily: ['herbal', 'citrus', 'woody'],
    concerns: ['sleep', 'focus', 'muscle', 'daily'],
    variants: [
      { id: 'calm',   label: 'Calm — Lavender & Chamomile',   swatch: '#9186BC', note: 'Wind down' },
      { id: 'focus',  label: 'Focus — Rosemary & Peppermint', swatch: '#5E9E7A', note: 'Desk hours' },
      { id: 'breathe',label: 'Breathe — Eucalyptus & Ravensara', swatch: '#5E9BA8', note: 'Cold season' },
      { id: 'ease',   label: 'Ease — Copaiba & Ginger',       swatch: '#C08A4B', note: 'Aching shoulders' }
    ],
    keyIngredients: ['essential-oils', 'coconut-oil', 'jojoba-oil'],
    ingredients: 'Fractionated coconut oil, jojoba oil, pure essential oil blend. Amber glass bottle, stainless steel rollerball.',
    benefits: [
      'Pre-diluted to a skin-safe strength — no maths',
      'Amber glass keeps the oils from degrading in light',
      'Steel rollerball stays cool on the temples',
      'Refillable — keep the bottle, replace the blend'
    ],
    howToUse: 'Roll over pulse points, temples or the back of the neck. For Breathe, roll across the chest and cup your hands to inhale.',
    art: { form: 'roller', tint: ['#FBF8FC', '#E7DEEE'], body: '#A8763C', cap: '#43303E', accent: '#B98DDB' }
  },

  {
    id: 'essential-oil-bath-bomb',
    name: 'Essential Oil Bath Bomb',
    category: 'body',
    categoryLabel: 'Body & Bath',
    tagline: 'Natural colour, real fizz, safe for kids',
    blurb: 'All natural bath bombs made with natural colours and fragrance that fizz and foam — and are safe to use with kids.',
    description:
      'Coloured with clays and botanical powders rather than dyes, so nothing stains the tub or the towels, and scented only with essential oil at a strength that is gentle enough for children. Packed dense so the fizz lasts minutes rather than seconds, with a heart of cocoa butter that melts out and leaves the water soft.',
    price: 9,
    compareAt: null,
    rating: 4.9,
    reviews: 176,
    badges: ['Kid safe'],
    weight: '5 oz bomb',
    scentFamily: ['floral', 'citrus', 'herbal'],
    concerns: ['dry', 'sleep', 'muscle'],
    variants: [
      { id: 'lavender-dream', label: 'Lavender Dream',   swatch: '#9B8FC7', note: 'Bedtime' },
      { id: 'citrus-grove',   label: 'Citrus Grove',     swatch: '#E8A64C', note: 'Morning soak' },
      { id: 'eucalyptus-mint',label: 'Eucalyptus Mint',  swatch: '#6FAE9B', note: 'Stuffy heads' },
      { id: 'rose-garden',    label: 'Rose Garden',      swatch: '#D48C9B', note: 'Soft and floral' }
    ],
    keyIngredients: ['cocoa-butter', 'epsom-salt', 'kaolin-clay', 'essential-oils'],
    ingredients: 'Sodium bicarbonate, citric acid, Epsom salt, cornstarch, cocoa butter, kaolin clay, botanical colour (butterfly pea, madder root, spirulina, annatto), pure essential oils.',
    benefits: [
      'Botanical colour — no tub ring, no stained towels',
      'Dense-packed for a long, slow fizz',
      'Cocoa butter heart softens the water',
      'Essential-oil strength gentle enough for children'
    ],
    howToUse: 'Run a warm bath, drop the bomb in and let it fizz out fully before you get in. Half a bomb is plenty for a small child.',
    art: { form: 'sphere', tint: ['#FAF7FD', '#E4DAF1'], body: '#E5DCEE', cap: '#B98DDB', accent: '#7E4EAE' }
  },

  {
    id: 'room-and-linen-spray',
    name: 'Room & Linen Spray',
    category: 'home',
    categoryLabel: 'Home',
    tagline: 'Freshen the room, keep toxins at bay',
    blurb: 'All natural Room and Linen Spray helps to freshen your space with the aroma of essential oils, keeping toxins at bay.',
    description:
      'Distilled water, a little plant-derived solubiliser and pure essential oil — that is the whole formula. It freshens a room, a pillow, a gym bag or a car without the aerosol propellants, phthalates and synthetic musks that most air fresheners are built from. Fine mist, amber glass, and a scent that fades honestly instead of hanging for days.',
    price: 16,
    compareAt: null,
    rating: 4.7,
    reviews: 88,
    badges: [],
    weight: '4 oz bottle',
    scentFamily: ['herbal', 'citrus', 'woody'],
    concerns: ['sleep', 'daily'],
    variants: [
      { id: 'douglas-fir',  label: 'Douglas Fir',      swatch: '#3F6B4C', note: 'The Pacific Northwest, bottled' },
      { id: 'lavender-linen', label: 'Lavender Linen', swatch: '#9186BC', note: 'Pillows and sheets' },
      { id: 'lemon-sage',   label: 'Lemon & Sage',     swatch: '#B8C46E', note: 'Kitchens' },
      { id: 'cedar-smoke',  label: 'Cedar & Smoke',    swatch: '#7A6249', note: 'Evenings in' }
    ],
    keyIngredients: ['essential-oils'],
    ingredients: 'Distilled water, polysorbate-20 (plant-derived solubiliser), pure essential oils, a trace of grain alcohol as a natural preservative.',
    benefits: [
      'No aerosol propellants, phthalates or synthetic musk',
      'Safe on cotton and linen at a short distance',
      'Amber glass protects the oils',
      'Fades honestly rather than lingering for days'
    ],
    howToUse: 'Shake well. Mist two or three pumps into the air, or onto linens from about 30 cm. Spot-test delicate or coloured fabrics first.',
    art: { form: 'spray', tint: ['#F7F9FC', '#DEE4EF'], body: '#6F7BB0', cap: '#2E1F2B', accent: '#98D2D3' }
  }
];

/** Fast lookup by id. */
export const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]));

export const getProduct = (id) => PRODUCT_MAP.get(id) || null;

/** Lowest purchasable price for a product, accounting for variant overrides. */
export const priceOf = (product, variantId) => {
  if (!product) return 0;
  const v = variantId && product.variants?.find((x) => x.id === variantId);
  return v && typeof v.price === 'number' ? v.price : product.price;
};

export const formatPrice = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
