/* ==========================================================================
   JULIE SCENTS — SITE VALIDATOR
   Run after edits:  node tools/validate.mjs
   Checks: inline script syntax, tag balance, local asset references, obvious
   markup breakage, and that every catalogue image would resolve.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/* The presentation sheet the client supplied is not one of our pages. */
const IGNORED_HTML = new Set(['50-Perfumes-Grey-Background.html']);
const htmlFiles = fs.readdirSync(ROOT)
  .filter((f) => f.endsWith('.html') && !IGNORED_HTML.has(f))
  .sort();

const problems = [];
const notes = [];

/* --------------------------------------------------------- inline scripts */

function checkInlineScripts(file, html) {
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m, n = 0;
  while ((m = re.exec(html))) {
    n++;
    const code = m[1].trim();
    if (!code) continue;
    try {
      new vm.Script(code, { filename: `${file}#inline-${n}` });
    } catch (err) {
      problems.push(`${file}: inline script ${n} has a syntax error — ${err.message}`);
    }
  }
  return n;
}

/* ------------------------------------------------------------ tag balance */

const TRACKED = ['div', 'section', 'aside', 'main', 'header', 'footer', 'form', 'ul', 'article', 'dl'];
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function checkTagBalance(file, html) {
  const stack = [];
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  let m;
  while ((m = tagRe.exec(html))) {
    const raw = m[0];
    const name = m[1].toLowerCase();
    if (VOID.has(name) || !TRACKED.includes(name)) continue;
    if (raw.startsWith('</')) {
      if (!stack.length) {
        problems.push(`${file}: closing </${name}> with nothing open`);
        continue;
      }
      const open = stack.pop();
      if (open !== name) {
        problems.push(`${file}: </${name}> closes <${open}> (mismatched nesting)`);
      }
    } else if (!m[2]) {
      stack.push(name);
    }
  }
  if (stack.length) {
    problems.push(`${file}: unclosed ${stack.map((t) => `<${t}>`).join(', ')}`);
  }
}

/* --------------------------------------------------------- asset existence */

function checkAssets(file, html) {
  const re = /(?:src|href)\s*=\s*"([^"]+)"/gi;
  let m;
  const seen = new Set();
  while ((m = re.exec(html))) {
    let ref = m[1].trim();
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/i.test(ref)) continue;
    const clean = ref.split('#')[0].split('?')[0];
    if (!clean || clean === '') continue;
    const target = path.join(ROOT, clean);
    if (!fs.existsSync(target)) {
      problems.push(`${file}: references missing file "${clean}"`);
    }
  }
}

/* ------------------------------------------------------------ entity scan */

function checkEntities(file, html) {
  const bad = [
    /&copy[^;a-z]/, /&nbsp[^;]/, /&mdash[^;]/, /&ndash[^;]/, /&middot[^;]/,
    /&amp;(copy|nbsp|mdash|ndash|middot|quot|amp);/, /\u00c2\u00a0/
  ];
  bad.forEach((re) => {
    const m = html.match(re);
    if (m) problems.push(`${file}: suspicious entity near "${html.slice(Math.max(0, m.index - 20), m.index + 20).trim()}"`);
  });
  // a stray raw ampersand that is not part of an entity
  const stray = html.match(/&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/g);
  if (stray && stray.length) {
    notes.push(`${file}: ${stray.length} bare "&" character(s) — fine in text, check they are intentional`);
  }
}

/* ------------------------------------------------------------------- main */

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  checkInlineScripts(file, html);
  checkTagBalance(file, html);
  checkAssets(file, html);
  checkEntities(file, html);

  if (!/<!DOCTYPE html>/i.test(html)) problems.push(`${file}: missing doctype`);
  if (!/<html lang=/i.test(html)) problems.push(`${file}: <html> is missing a lang attribute`);
  if (!/<title>/i.test(html)) problems.push(`${file}: missing <title>`);
  if (!/name="viewport"/i.test(html)) problems.push(`${file}: missing viewport meta`);
  if (!/class="skip-link"/i.test(html)) problems.push(`${file}: missing skip link`);
  if (!/id="main"/i.test(html)) problems.push(`${file}: missing <main id="main">`);
}

/* ------------------------------------------------------------ js syntax */
const jsDir = path.join(ROOT, 'assets', 'js');
for (const f of fs.readdirSync(jsDir).filter((f) => f.endsWith('.js'))) {
  const code = fs.readFileSync(path.join(jsDir, f), 'utf8');
  try {
    new vm.Script(code, { filename: f });
  } catch (err) {
    problems.push(`assets/js/${f}: syntax error — ${err.message}`);
  }
}

/* -------------------------------------------------------- catalogue sanity */
const src = fs.readFileSync(path.join(jsDir, 'products.js'), 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
const products = sandbox.window.JULIE_PRODUCTS || [];

const slugs = new Set();
const ids = new Set();
for (const p of products) {
  if (slugs.has(p.slug)) problems.push(`catalogue: duplicate slug "${p.slug}"`);
  if (ids.has(p.id)) problems.push(`catalogue: duplicate id ${p.id}`);
  slugs.add(p.slug);
  ids.add(p.id);
  if (!p.notes || !p.notes.top) problems.push(`catalogue: ${p.slug} is missing notes`);
  if (!p.sizes || !p.sizes.length) problems.push(`catalogue: ${p.slug} has no sizes`);
  if (p.recreate && p.recreate.ml.length !== p.recreate.price.length) {
    problems.push(`catalogue: ${p.slug} recreate ml/price length mismatch`);
  }
  for (const s of p.sizes || []) {
    if (!s.ml || !s.price) problems.push(`catalogue: ${p.slug} has an incomplete size entry`);
  }
}

/* ----------------------------------------------------------------- report */
console.log(`Checked ${htmlFiles.length} pages and ${products.length} products.\n`);
console.log(`  houses      : ${new Set(products.map((p) => p.brand)).size}`);
console.log(`  women       : ${products.filter((p) => p.gender === 'women').length}`);
console.log(`  men         : ${products.filter((p) => p.gender === 'men').length}`);
console.log(`  unisex      : ${products.filter((p) => p.gender === 'unisex').length}`);
console.log(`  recreatable : ${products.filter((p) => p.recreate).length}`);
console.log(`  families    : ${new Set(products.map((p) => p.family)).size}\n`);

if (notes.length) {
  console.log('Notes:');
  notes.forEach((n) => console.log(`  • ${n}`));
  console.log('');
}

if (problems.length) {
  console.log(`PROBLEMS (${problems.length}):`);
  problems.forEach((p) => console.log(`  ✗ ${p}`));
  process.exit(1);
} else {
  console.log('✓ No problems found.');
}
