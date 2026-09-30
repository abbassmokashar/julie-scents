/* ==========================================================================
   JULIE SCENTS — WOOCOMMERCE EXPORT
   --------------------------------------------------------------------------
   Turns the storefront catalogue into WooCommerce product-import CSVs, so the
   shop can be rebuilt as a real store without re-typing 60 products.

   Two files are produced, both covering every size and both purchase options
   (the original designer bottle and the Julie Scents recreation):

     woocommerce/products-variable.csv
        Variable products — one parent per fragrance with Size and Version
        dropdowns, exactly like the demo's product page. This is the one you
        normally want.

     woocommerce/products-simple.csv
        The same catalogue flattened to one row per purchasable option. More
        rows, but it imports under any WooCommerce version without attribute
        setup, so it is the safe fallback.

     node tools/export-woocommerce.mjs
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'woocommerce');

/* ------------------------------------------------------------- load data */

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets', 'js', 'config.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets', 'js', 'products.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets', 'js', 'store.js'), 'utf8'), sandbox);

const PRODUCTS = sandbox.window.JULIE_PRODUCTS;
const Store = sandbox.window.Store;

/* ------------------------------------------------------------------ csv */

function cell(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function toCsv(rows) {
  return rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}

const GENDER_LABEL = { women: 'Women', men: 'Men', unisex: 'Unisex' };

function categoriesFor(p) {
  return [GENDER_LABEL[p.gender] || 'Unisex', p.brand].join(', ');
}

function tagsFor(p) {
  const tags = [
    Store.familyGroup(p),
    p.concentration,
    p.badge || null,
    'Recreatable',
    ...p.notes.top,
    ...p.notes.heart,
    ...p.notes.base
  ].filter(Boolean);
  return [...new Set(tags)].join(', ');
}

/*
 * WooCommerce description fields are HTML, so line breaks are expressed as
 * <br> rather than \n. That also keeps every CSV row on a single physical
 * line, which some import parsers are much happier with.
 */
function descriptionFor(p) {
  return [
    p.blurb,
    '<br><br>',
    '<strong>Top notes:</strong> ' + p.notes.top.join(', '),
    '<br><strong>Heart notes:</strong> ' + p.notes.heart.join(', '),
    '<br><strong>Base notes:</strong> ' + p.notes.base.join(', '),
    '<br><br>',
    '<strong>Fragrance family:</strong> ' + p.family,
    '<br><strong>Concentration:</strong> ' + p.concentration,
    '<br><br>',
    'Available as the original designer bottle, or recreated in-house by the ' +
    'Julie Scents atelier using high-concentration premium oils and guaranteed ' +
    'for 8-12 hours of wear.'
  ].join('');
}

const IMAGE_NOTE =
  'Replace with the Media Library URL after uploading ' +
  'assets/img/products/<slug>.webp, or leave blank and add images in WooCommerce.';

function imageCell(p) {
  return 'assets/img/products/' + p.slug + '.webp';
}

/* --------------------------------------------------------------- options */

/** Every purchasable option: { variant, ml, price, label, sku } */
function optionsFor(p) {
  const out = [];
  for (const s of p.sizes || []) {
    out.push({
      variant: 'original',
      label: 'Original Bottle',
      ml: s.ml,
      price: s.price,
      sku: `JS-${p.slug}-orig-${s.ml}`
    });
  }
  if (p.recreate) {
    p.recreate.ml.forEach((ml, i) => {
      out.push({
        variant: 'recreate',
        label: 'Julie Scents Recreate',
        ml: ml,
        price: p.recreate.price[i],
        sku: `JS-${p.slug}-rec-${ml}`
      });
    });
  }
  return out;
}

const VARIANTS = [
  { key: 'original', label: 'Original Bottle' },
  { key: 'recreate', label: 'Julie Scents Recreate' }
];

/* ---------------------------------------------------- variable products */

const VARIABLE_HEADER = [
  'Type', 'SKU', 'Name', 'Published', 'Is featured?', 'Visibility in catalog',
  'Short description', 'Description', 'In stock?', 'Stock', 'Regular price',
  'Sale price', 'Categories', 'Tags', 'Images', 'Position',
  'Attribute 1 name', 'Attribute 1 value(s)', 'Attribute 1 visible', 'Attribute 1 global',
  'Attribute 2 name', 'Attribute 2 value(s)', 'Attribute 2 visible', 'Attribute 2 global',
  'Attribute 3 name', 'Attribute 3 value(s)', 'Attribute 3 visible', 'Attribute 3 global',
  'Attribute 4 name', 'Attribute 4 value(s)', 'Attribute 4 visible', 'Attribute 4 global',
  'Parent'
];

function buildVariableRows() {
  const rows = [VARIABLE_HEADER];

  PRODUCTS.forEach((p, index) => {
    const opts = optionsFor(p);
    const sizes = [...new Set(opts.map((o) => o.ml))].sort((a, b) => a - b);
    const variants = VARIANTS
      .filter((v) => v.key === 'original' || !!p.recreate)
      .map((v) => v.label);

    rows.push([
      'variable',
      `JS-${p.slug}`,
      `${p.brand} ${p.name}`,
      1,
      p.badge ? 1 : 0,
      'visible',
      p.blurb,
      descriptionFor(p),
      1,             // in stock
      '',            // stock managed at variation level
      '',            // price lives on the variations
      '',
      categoriesFor(p),
      tagsFor(p),
      imageCell(p),
      index,
      'Size', sizes.map((s) => `${s} ml`).join(' | '), 1, 1,
      'Version', variants.join(' | '), 1, 1,
      'House', p.brand, 1, 1,
      'Concentration', p.concentration, 1, 1,
      ''
    ]);

    for (const o of opts) {
      rows.push([
        'variation',
        o.sku,
        `${p.brand} ${p.name} — ${o.label} ${o.ml} ml`,
        1,
        '',
        'visible',
        '',
        '',
        1,
        25,
        o.price.toFixed(2),
        '',
        '',
        '',
        imageCell(p),
        '',
        'Size', `${o.ml} ml`, 1, 1,
        'Version', o.label, 1, 1,
        '', '', '', '',
        '', '', '', '',
        `JS-${p.slug}`
      ]);
    }
  });

  return rows;
}

/* ------------------------------------------------------ simple products */

const SIMPLE_HEADER = [
  'Type', 'SKU', 'Name', 'Published', 'Is featured?', 'Visibility in catalog',
  'Short description', 'Description', 'In stock?', 'Stock', 'Regular price',
  'Sale price', 'Categories', 'Tags', 'Images', 'Position',
  'Attribute 1 name', 'Attribute 1 value(s)', 'Attribute 1 visible', 'Attribute 1 global',
  'Attribute 2 name', 'Attribute 2 value(s)', 'Attribute 2 visible', 'Attribute 2 global',
  'Attribute 3 name', 'Attribute 3 value(s)', 'Attribute 3 visible', 'Attribute 3 global',
  'Attribute 4 name', 'Attribute 4 value(s)', 'Attribute 4 visible', 'Attribute 4 global'
];

function buildSimpleRows() {
  const rows = [SIMPLE_HEADER];
  let position = 0;

  PRODUCTS.forEach((p) => {
    for (const o of optionsFor(p)) {
      rows.push([
        'simple',
        o.sku,
        `${p.brand} ${p.name} — ${o.label} ${o.ml} ml`,
        1,
        p.badge ? 1 : 0,
        'visible',
        p.blurb,
        descriptionFor(p),
        1,
        25,
        o.price.toFixed(2),
        '',
        categoriesFor(p),
        tagsFor(p),
        imageCell(p),
        position++,
        'Size', `${o.ml} ml`, 1, 1,
        'Version', o.label, 1, 1,
        'House', p.brand, 1, 1,
        'Concentration', p.concentration, 1, 1
      ]);
    }
  });

  return rows;
}

/* ------------------------------------------------------------------ main */

fs.mkdirSync(OUT_DIR, { recursive: true });

const variable = buildVariableRows();
const simple = buildSimpleRows();

fs.writeFileSync(path.join(OUT_DIR, 'products-variable.csv'), toCsv(variable));
fs.writeFileSync(path.join(OUT_DIR, 'products-simple.csv'), toCsv(simple));

const optionCount = PRODUCTS.reduce((n, p) => n + optionsFor(p).length, 0);

fs.writeFileSync(
  path.join(OUT_DIR, 'README.md'),
  `# WooCommerce import

Two CSVs, both generated from the storefront catalogue
(\`assets/js/products.js\`) by \`npm run woocommerce\`.

| File | Shape | Rows |
| --- | --- | --- |
| \`products-variable.csv\` | Variable products — one parent per fragrance with **Size** and **Version** dropdowns | ${variable.length - 1} |
| \`products-simple.csv\` | The same catalogue flattened to one row per purchasable option | ${simple.length - 1} |

Covers **${PRODUCTS.length} fragrances** and **${optionCount} purchasable options**.

## How to import

1. WooCommerce → **Products** → **Import** → choose the CSV → **Continue**.
2. On the mapping step, leave WooCommerce's suggested column mapping as it is —
   the headers already use its standard names.
3. Import. Categories (\`Women\`, \`Men\`, \`Unisex\`, plus every house) and tags
   are created automatically.

**Start with \`products-variable.csv\`.** If your WooCommerce version objects to
the variation rows, fall back to \`products-simple.csv\`, which needs no
attribute setup at all — you get ${simple.length - 1} simple products instead of
${PRODUCTS.length} variable ones.

## Notes

- Prices are in USD and are **demo values**. Adjust them before you publish.
- The **Version** attribute carries the commercial story: \`Original Bottle\` is
  the sealed designer fragrance, \`Julie Scents Recreate\` is the in-house blend.
  Keep both visible so customers can compare prices on the product page.
- The **Images** column contains a relative path
  (\`assets/img/products/<slug>.webp\`). WooCommerce needs a real URL, so either
  upload the images to the Media Library and replace the paths, or blank the
  column and attach images in the admin. ${IMAGE_NOTE}
- Stock is set to 25 per variation as a placeholder.
`
);

console.log(`WooCommerce export complete.

  products-variable.csv  ${variable.length - 1} rows
  products-simple.csv    ${simple.length - 1} rows

  ${PRODUCTS.length} fragrances, ${optionCount} purchasable options
  written to  woocommerce/
`);
