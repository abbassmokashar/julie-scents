/* ==========================================================================
   JULIE SCENTS — PRODUCT IMAGE IMPORTER
   --------------------------------------------------------------------------
   Drop your own product photographs into  incoming-images/  and run this once.
   It will, for every product in the catalogue:

     • find the matching file (by filename, slug, brand or product name)
     • crop it to a clean square, centred on the bottle
     • knock out the background and lay it on the ONE shared backdrop colour
       (#F6F1E9 — the same colour the grid tiles use), unless you ask it not to
     • resize to 1000x1250 and save as  assets/img/products/<slug>.webp
     • report anything it could not match

   Then set  useProductImages: true  in assets/js/config.js and the grid
   switches from typographic tiles to your photographs. No CSS or JS changes.

   Usage:
     node tools/import-images.mjs                     # import from incoming-images/
     node tools/import-images.mjs --dir ./my-photos
     node tools/import-images.mjs --no-key            # keep the photo's own background
     node tools/import-images.mjs --only dior-sauvage-edp
     node tools/import-images.mjs --checklist         # just write the filename list
   ========================================================================== */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'img', 'products');
const CHECKLIST = path.join(ROOT, 'IMAGE-CHECKLIST.md');

/* Keep this in sync with --surface-product in assets/css/style.css. */
const BG = { r: 232, g: 232, b: 232 }; // #E8E8E8
/* Product cards use a 4:5 frame, so every import lands on the same canvas. */
const W = 1000;
const H = 1250;
const PAD = 62;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.indexOf(n) >= 0 ? args[args.indexOf(n) + 1] : null);
const DIR = path.resolve(ROOT, opt('--dir') || 'incoming-images');
const ONLY = opt('--only');
const DO_KEY = !flag('--no-key');
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);

fs.mkdirSync(OUT, { recursive: true });

/* ---------------------------------------------------------- catalogue */

function loadCatalogue() {
  const src = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'products.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.JULIE_PRODUCTS;
}

const products = loadCatalogue().filter((p) => !ONLY || p.slug === ONLY);

/* ---------------------------------------------------------- checklist */

function writeChecklist() {
  const rows = loadCatalogue().map(
    (p, i) =>
      `| ${i + 1} | \`${p.slug}.webp\` | ${p.brand} ${p.name} | ${p.gender} |`
  );
  fs.writeFileSync(
    CHECKLIST,
    `# Product image checklist

Drop your photographs into \`incoming-images/\` (or any folder, with \`--dir\`)
and name each file after the product **slug** shown below. Then run:

\`\`\`bash
npm run images
\`\`\`

The importer crops, squares, normalises the background to the shared brand
backdrop and resizes every image to 1000×1250. Finally set
\`useProductImages: true\` in \`assets/js/config.js\`.

Matching is forgiving — the filename only has to *contain* the slug, the brand
or the product name, so \`dior-sauvage.jpg\`, \`Dior Sauvage.png\` and
\`sauvage-100ml.webp\` all resolve to the same product. Where two files could
match the same product, the first one wins and the clash is reported.

**${rows.length} products need an image.**

| # | Expected filename | Product | For |
| --- | --- | --- | --- |
${rows.join('\n')}
`
  );
  return rows.length;
}

if (flag('--checklist')) {
  const n = writeChecklist();
  console.log(`Wrote IMAGE-CHECKLIST.md (${n} products).`);
  process.exit(0);
}

/* --------------------------------------------------------- matching */

function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')          // strip extension
    .replace(/[^a-z0-9]+/g, ' ')          // punctuation to spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/* Words that appear in half the catalogue carry no signal, so they are
   ignored when working out which product a filename refers to. */
const STOP = new Set([
  'eau', 'de', 'parfum', 'toilette', 'edp', 'edt', 'edc', 'ml', 'the', 'for',
  'and', 'pour', 'homme', 'femme', 'men', 'women', 'unisex', 'perfume', 'bottle',
  'spray', 'mist', 'cologne', 'fragrance', 'splash', 'jpg', 'jpeg', 'png', 'webp'
]);

function tokens(s) {
  return norm(s)
    .split(' ')
    .filter((t) => t && !STOP.has(t) && (t.length > 1 || /\d/.test(t)));
}

/*
 * Build a rarity index. A filename token that occurs in only one product
 * ("sauvage", "aventus") is a very strong signal, while one that occurs in
 * many ("edition", "intense") counts for little. This is what lets
 * "Sauvage 100ml.jpg" resolve correctly even without the house name.
 */
const docTokens = new Map();
const df = new Map();
for (const p of products) {
  const set = new Set([...tokens(p.slug), ...tokens(p.brand), ...tokens(p.name)]);
  docTokens.set(p.slug, set);
  for (const t of set) df.set(t, (df.get(t) || 0) + 1);
}

/** How confidently does this filename belong to this product? */
function matchScore(filename, product) {
  if (norm(filename) === norm(product.slug)) return 1000; // exact slug

  // Only tokens that exist somewhere in the catalogue are considered; things
  // like "100ml" or "front" are noise and must not dilute the coverage.
  const fileTokens = [...new Set(tokens(filename))].filter((t) => df.has(t));
  if (!fileTokens.length) return 0;

  const set = docTokens.get(product.slug);
  let matched = 0;
  let total = 0;
  for (const t of fileTokens) {
    const weight = 1 / df.get(t);
    total += weight;
    if (set.has(t)) matched += weight;
  }

  const coverage = total ? matched / total : 0;
  if (coverage < 0.6) return 0; // must account for most of what the name says
  return matched;               // rarer words win
}

/* ------------------------------------------------- image normalisation */

function measure(data, info) {
  const { width: W, height: H, channels: C } = info;
  const band = Math.max(4, Math.round(Math.min(W, H) * 0.04));
  let n = 0, sr = 0, sg = 0, sb = 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!(x < band || x >= W - band || y < band || y >= H - band)) continue;
      const i = (y * W + x) * C;
      sr += data[i]; sg += data[i + 1]; sb += data[i + 2]; n++;
    }
  }
  const mean = { r: sr / n, g: sg / n, b: sb / n };

  let varSum = 0, bn = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!(x < band || x >= W - band || y < band || y >= H - band)) continue;
      const i = (y * W + x) * C;
      varSum += (data[i] - mean.r) ** 2 + (data[i + 1] - mean.g) ** 2 + (data[i + 2] - mean.b) ** 2;
      bn++;
    }
  }
  return { mean, sd: Math.sqrt(varSum / bn) };
}

function keyOut(data, info, bg, sd) {
  const { width: W, height: H, channels: C } = info;
  const out = Buffer.alloc(W * H * 4);
  const clean = sd < 26;
  const t0 = clean ? 30 : 18;
  const t1 = clean ? 92 : 44;

  for (let p = 0, i = 0, o = 0; p < W * H; p++, i += C, o += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const a = C > 3 ? data[i + 3] : 255;
    const d = Math.max(Math.abs(r - bg.r), Math.abs(g - bg.g), Math.abs(b - bg.b));
    let keep;
    if (d <= t0) keep = 0;
    else if (d >= t1) keep = 1;
    else keep = (d - t0) / (t1 - t0);
    out[o] = r; out[o + 1] = g; out[o + 2] = b;
    out[o + 3] = Math.round(a * keep);
  }
  return out;
}

async function render(sourceBuf, outPath) {
  const meta = await sharp(sourceBuf).metadata();
  const prepped = await sharp(sourceBuf)
    .rotate()
    .resize(1500, 1500, { fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;
  let subject;

  if (!DO_KEY) {
    // Keep the photograph's own background; just centre it on the backdrop.
    subject = await sharp(sourceBuf)
      .rotate()
      .resize(innerW, innerH, {
        fit: 'contain',
        background: { r: BG.r, g: BG.g, b: BG.b, alpha: 1 }
      })
      .png()
      .toBuffer();
  } else if (meta.hasAlpha) {
    // Already cut out — flatten straight onto the backdrop.
    subject = await sharp(sourceBuf)
      .rotate()
      .resize(innerW, innerH, {
        fit: 'contain',
        background: { r: BG.r, g: BG.g, b: BG.b, alpha: 0 }
      })
      .png()
      .toBuffer();
  } else {
    const stats = measure(prepped.data, prepped.info);
    const keyed = keyOut(prepped.data, prepped.info, stats.mean, stats.sd);
    subject = await sharp(keyed, {
      raw: { width: prepped.info.width, height: prepped.info.height, channels: 4 }
    })
      .trim({ background: { r: BG.r, g: BG.g, b: BG.b, alpha: 1 }, threshold: 24 })
      .resize(innerW, innerH, {
        fit: 'contain',
        background: { r: BG.r, g: BG.g, b: BG.b, alpha: 0 }
      })
      .png()
      .toBuffer();
  }

  const out = await sharp({
    create: { width: W, height: H, channels: 3, background: BG }
  })
    .composite([{ input: subject, gravity: 'center' }])
    /* WebP is 50-60% smaller than JPEG at this quality with no visible loss,
       and every browser we target has supported it for years. */
    .webp({ quality: 84, effort: 6, smartSubsample: true })
    .toBuffer();

  await fsp.writeFile(outPath, out);
}

/* ---------------------------------------------------------------- main */

async function main() {
  if (!fs.existsSync(DIR)) {
    fs.mkdirSync(DIR, { recursive: true });
    writeChecklist();
    console.log(`Created  ${path.relative(ROOT, DIR)}/  — put your product photos in there.`);
    console.log('Wrote    IMAGE-CHECKLIST.md with the 60 expected filenames.');
    console.log('\nThen run:  npm run images');
    return;
  }

  const files = fs.readdirSync(DIR).filter((f) => EXT.has(path.extname(f).toLowerCase()));
  if (!files.length) {
    writeChecklist();
    console.log(`No images found in ${path.relative(ROOT, DIR) || '.'}/`);
    console.log('Add your photos there (see IMAGE-CHECKLIST.md for the expected names).');
    return;
  }

  console.log(`Found ${files.length} image(s). Matching to ${products.length} product(s)…\n`);

  const claimed = new Map(); // file -> product
  const unmatchedFiles = [];
  const clashes = [];

  for (const file of files) {
    let best = null, bestScore = 0;
    for (const p of products) {
      const s = matchScore(file, p);
      if (s > bestScore) { bestScore = s; best = p; }
    }
    if (!best || bestScore <= 0) { unmatchedFiles.push(file); continue; }
    if (claimed.has(best.slug)) {
      const other = claimed.get(best.slug);
      // keep the stronger match
      if (matchScore(file, best) > matchScore(other.file, best)) {
        clashes.push(`${other.file} lost to ${file} for ${best.slug}`);
        claimed.set(best.slug, { file, score: bestScore });
      } else {
        clashes.push(`${file} also matched ${best.slug} (kept ${other.file})`);
      }
      continue;
    }
    claimed.set(best.slug, { file, score: bestScore });
  }

  let done = 0;
  const failed = [];

  for (const [slug, { file }] of claimed) {
    const src = path.join(DIR, file);
    const outPath = path.join(OUT, `${slug}.webp`);
    try {
      await render(await fsp.readFile(src), outPath);
      console.log(`  ✓ ${slug.padEnd(38)} ← ${file}`);
      done++;
    } catch (e) {
      console.error(`  ✗ ${slug}: ${e.message}`);
      failed.push(slug);
    }
  }

  const missing = products
    .map((p) => p.slug)
    .filter((s) => !claimed.has(s));

  writeChecklist();

  console.log(`\nImported ${done} image(s) into assets/img/products/.`);

  if (clashes.length) {
    console.log('\nAmbiguous filenames (the first match was kept):');
    clashes.forEach((c) => console.log(`  • ${c}`));
  }
  if (unmatchedFiles.length) {
    console.log('\nCould not match these files to a product — rename them to the slug:');
    unmatchedFiles.forEach((f) => console.log(`  • ${f}`));
  }
  if (missing.length) {
    console.log(`\nStill missing (${missing.length}):`);
    console.log('  ' + missing.slice(0, 24).join(', ') + (missing.length > 24 ? ' …' : ''));
  }

  if (done) {
    console.log(
      '\nNext step: set  useProductImages: true  in assets/js/config.js\n' +
      'and the grid will show your photographs instead of the typographic tiles.'
    );
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
