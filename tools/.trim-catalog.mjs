/* Temporary: rebuild assets/js/products.js down to the 16 reference products. */
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';

const SRC = 'assets/js/products.js';
const text = readFileSync(SRC, 'utf8');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(text, sandbox);
const all = sandbox.window.JULIE_PRODUCTS;

const ORDER = [
  'dior-sauvage-edp',
  'chanel-bleu-de-chanel-edp',
  'armani-acqua-di-gio-profumo',
  'paco-rabanne-1-million-edp',
  'creed-aventus-edp',
  'chanel-no-5-edp',
  'dior-jadore-edp',
  'ysl-black-opium-edp',
  'dior-miss-dior-blooming-bouquet-edt',
  'lancome-la-vie-est-belle-edp',
  'carolina-herrera-good-girl-edp',
  'versace-eros-edt',
  'jpg-le-male-le-parfum',
  null, // 14 — Tom Ford Black Orchid (added below)
  'prada-paradoxe-edp',
  'le-labo-santal-33-edp'
];

const BLACK_ORCHID = {
  slug: 'tom-ford-black-orchid-edp',
  brand: 'Tom Ford',
  name: 'Black Orchid Eau de Parfum',
  gender: 'unisex',
  family: 'Oriental Floral',
  concentration: 'Eau de Parfum',
  sizes: [{ ml: 50, price: 168 }, { ml: 100, price: 235 }],
  recreate: { ml: [50, 100], price: [49, 70] },
  rating: 4.8,
  reviews: 964,
  badge: 'Unisex icon',
  notes: {
    top: ['Truffle', 'Black Currant', 'Ylang-Ylang'],
    heart: ['Black Orchid', 'Lotus Wood', 'Fruity Notes'],
    base: ['Patchouli', 'Vanilla', 'Incense', 'Sandalwood']
  },
  blurb: 'A dark, luxurious oriental — black truffle and orchid over patchouli, incense and creamy vanilla.',
  imageAlt: 'Tom Ford Black Orchid eau de parfum bottle',
  imageQuery: 'Tom Ford Black Orchid perfume bottle'
};

const bySlug = new Map(all.map((p) => [p.slug, p]));
const picked = ORDER.map((slug) => (slug ? bySlug.get(slug) : BLACK_ORCHID));
const missing = ORDER.filter((slug, i) => slug && !bySlug.get(slug));
if (missing.length) throw new Error('Missing slugs: ' + missing.join(', '));

/* Re-number sequentially and normalise key order. */
const out = picked.map((p, i) => ({
  id: i + 1,
  slug: p.slug,
  brand: p.brand,
  name: p.name,
  gender: p.gender,
  family: p.family,
  concentration: p.concentration,
  sizes: p.sizes,
  recreate: p.recreate,
  rating: p.rating,
  reviews: p.reviews,
  badge: p.badge ?? null,
  notes: p.notes,
  blurb: p.blurb,
  imageAlt: p.imageAlt,
  imageQuery: p.imageQuery
}));

const header = `/* ==========================================================================
   JULIE SCENTS — PRODUCT CATALOGUE
   --------------------------------------------------------------------------
   Single source of truth. Consumed by the storefront (window.JULIE_PRODUCTS)
   and by tools/import-images.mjs (which attaches product photos by slug).

   Order matches the presentation sheet: ids 1-16 line up one-to-one with the
   sixteen reference images. Prices are in USD and are demo values only.
   ========================================================================== */

window.JULIE_PRODUCTS = [\n`;

const body = out.map((p, i) => {
  const j = JSON.stringify(p, null, 2)
    .split('\n')
    .map((line) => '  ' + line)
    .join('\n');
  return j + (i < out.length - 1 ? ',' : '');
}).join('\n');

const footer = `\n];

/* Recreate hint shown across the site — the Julie Scents house promise. */
window.JULIE_RECREATE = {
  title: "Recreated to order",
  claim: "We re-blend any fragrance you love using premium fragrance oils.",
  points: [
    "High-concentration premium oils, blended in-house",
    "Long-lasting — 8 to 12 hours of wear, guaranteed",
    "Identical scent profile at a fraction of retail",
    "Every bottle filled, sealed and labelled by hand"
  ]
};
`;

writeFileSync(SRC, header + body + footer, 'utf8');
console.log('Wrote ' + out.length + ' products:');
out.forEach((p) => console.log('  ' + p.id + '  ' + p.slug + '  (' + p.gender + ')'));
