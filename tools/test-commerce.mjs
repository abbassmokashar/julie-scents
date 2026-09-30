/* ==========================================================================
   JULIE SCENTS — COMMERCE TESTS
   Runs the real store.js in a sandbox (no browser) and asserts the money maths.
       node tools/test-commerce.mjs
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ------------------------------------------------------------- sandbox */

const sandbox = { window: {}, console };
sandbox.window.localStorage = undefined; // force the in-memory fallback
vm.createContext(sandbox);
for (const f of ['assets/js/config.js', 'assets/js/products.js', 'assets/js/store.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}

const S = sandbox.window.Store;
const CFG = sandbox.window.JULIE_CONFIG;

/* --------------------------------------------------------------- assert */

let passed = 0;
const failures = [];

function ok(name, condition, detail) {
  if (condition) { passed++; return; }
  failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

function eq(name, actual, expected) {
  ok(name, actual === expected, `expected ${expected}, got ${actual}`);
}

function near(name, actual, expected) {
  ok(name, Math.abs(actual - expected) < 0.005, `expected ${expected}, got ${actual}`);
}

const money = (n) => Number(n.toFixed(2));

/* ------------------------------------------------------------------ run */

const sauvage = S.findBySlug('dior-sauvage-edp');
ok('catalogue loads', !!sauvage, 'dior-sauvage-edp not found');

S.clear();

/* --- add ------------------------------------------------------------ */
S.add(sauvage, { variant: 'original', ml: 100, qty: 1 });
eq('cart count after one add', S.count(), 1);
eq('one line in cart', S.lines().length, 1);
eq('line unit price uses original 100ml', S.lines()[0].price, 128);
eq('subtotal matches unit price', S.subtotal(), 128);

/* --- merging -------------------------------------------------------- */
S.add(sauvage, { variant: 'original', ml: 100, qty: 2 });
eq('same variant+size merges into one line', S.lines().length, 1);
eq('quantities summed', S.lines()[0].item.qty, 3);
eq('subtotal is 3 x 128', S.subtotal(), 384);

/* --- variant separation --------------------------------------------- */
S.add(sauvage, { variant: 'recreate', ml: 100, qty: 1 });
eq('different variant becomes its own line', S.lines().length, 2);
const recLine = S.lines().filter((l) => l.item.variant === 'recreate')[0];
eq('recreate price resolved from recreate table', recLine.price, 44);
eq('variant label', recLine.variantLabel, 'Julie Scents Recreate');

/* --- shipping threshold --------------------------------------------- */
ok('order over threshold ships free', S.shippingCost('standard') === 0,
  `subtotal ${S.subtotal()}`);
eq('express still costs money', S.shippingCost('express'), 22);
eq('boutique pickup is free', S.shippingCost('pickup'), 0);

/* --- tax and total -------------------------------------------------- */
const sub = S.subtotal();
near('tax is rate x (subtotal + shipping)', S.tax('standard'), money(sub * CFG.taxRate));
near('total adds up', S.total('standard'), money(sub + S.tax('standard')));

/* --- coupon --------------------------------------------------------- */
const bad = S.applyCoupon('NOPE');
ok('invalid coupon rejected', bad.ok === false);
const good = S.applyCoupon('WELCOME10');
ok('valid coupon accepted', good.ok === true);
near('discount is 10% of subtotal', S.discount(), money(sub * 0.1));

const net = money(sub - S.discount());
near('total applies discount then tax', S.total('standard'), money(net + S.tax('standard')));

/* --- quantity edits ------------------------------------------------- */
const firstKey = S.lines()[0].key;
S.setQty(firstKey, 1);
eq('setQty reduces the line', S.lines()[0].item.qty, 1);
S.setQty(firstKey, 0);
ok('setQty 0 removes the line', S.lines().every((l) => l.key !== firstKey));

/* --- free shipping gap ---------------------------------------------- */
S.clear();
S.add(sauvage, { variant: 'original', ml: 60, qty: 1 }); // 98
near('gap to free shipping is threshold - subtotal', S.freeShippingGap(), money(CFG.freeShippingOver - 98));
eq('below threshold pays flat rate', S.shippingCost('standard'), CFG.shippingFlat);

/* --- applying and removing a coupon moves the total ----------------- */
const noCouponTotal = S.total('standard');
S.applyCoupon('WELCOME10');
ok('coupon lowers the total', S.total('standard') < noCouponTotal,
  `${S.total('standard')} should be below ${noCouponTotal}`);
S.removeCoupon();
eq('coupon cleared', S.coupon(), null);
near('total returns to its pre-coupon value', S.total('standard'), noCouponTotal);

/* --- empty cart ----------------------------------------------------- */
S.clear();
eq('empty cart count', S.count(), 0);
eq('empty subtotal', S.subtotal(), 0);
eq('empty total', S.total('standard'), 0);
eq('empty cart ships free', S.shippingCost('standard'), 0);

/* --- every product is purchasable ----------------------------------- */
let allAddable = true;
let badProduct = null;
S.clear();
for (const p of S.all()) {
  const line = S.add(p, { qty: 1 });
  if (!line || !(line.price > 0)) { allAddable = false; badProduct = p.slug; }
}
ok('every product can be added at a positive price', allAddable, badProduct || '');
eq('all products in cart', S.lines().length, S.all().length);
ok('cart total is positive', S.total('standard') > 0);
S.clear();

/* --- every recreation is cheaper than the original ------------------ */
let savingsOk = true;
let badSaving = null;
for (const p of S.all()) {
  if (!p.recreate) continue;
  const orig = S.fromPrice(p);
  if (!(p.recreate.price[0] < orig)) { savingsOk = false; badSaving = p.slug; }
}
ok('every recreation undercuts the original bottle', savingsOk, badSaving || '');

/* --- wishlist ------------------------------------------------------- */
S.toggleWish(sauvage.id);
ok('wishlist add works', S.inWishlist(sauvage.id));
S.toggleWish(sauvage.id);
ok('wishlist remove works', !S.inWishlist(sauvage.id));

/* ------------------------------------------------------------- report */
console.log(`\nCommerce tests: ${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log(`  ✗ ${f}`));
  process.exit(1);
}
console.log('✓ All commerce logic verified.');
