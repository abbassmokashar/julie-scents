/* One-off: pull the 16 real product images out of the reference artifact. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, '50-Perfumes-Grey-Background.html'), 'utf8');

/* 1. every string variable that holds a data URI */
const byVar = new Map();
const re = /([A-Za-z0-9_$]{1,4})\s*=\s*"(data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+)"/g;
let m;
while ((m = re.exec(src))) byVar.set(m[1], m[2]);
console.log(`data-URI variables found: ${byVar.size}`);

/* 2. the real products array, in display order */
const start = src.indexOf('A5=[{id:1');
const end = src.indexOf('],k5=[');
const arrayText = src.slice(start, end);
console.log(`products array length: ${arrayText.length} chars`);

const items = [];
const itemRe = /{id:(\d+),name:"([^"]+)",brand:"([^"]+)",gender:"([^"]+)",src:([A-Za-z0-9_$]+)}/g;
let im;
while ((im = itemRe.exec(arrayText))) {
  items.push({ id: +im[1], name: im[2], brand: im[3], gender: im[4], varName: im[5], uri: byVar.get(im[5]) });
}
console.log(`products parsed: ${items.length}`);

/* 3. the 16 that have real images */
const withReal = items.filter((i) => i.uri);
console.log(`with real image: ${withReal.length}\n`);

/* our catalogue slugs, in the same order as the reference */
const SLUGS = {
  1: 'dior-sauvage-edp',
  2: 'chanel-bleu-de-chanel-edp',
  3: 'armani-acqua-di-gio-profumo',
  4: 'paco-rabanne-1-million-edp',
  5: 'creed-aventus-edp',
  6: 'chanel-no-5-edp',
  7: 'dior-jadore-edp',
  8: 'ysl-black-opium-edp',
  9: 'dior-miss-dior-blooming-bouquet-edt',
  10: 'lancome-la-vie-est-belle-edp',
  11: 'carolina-herrera-good-girl-edp',
  12: 'versace-eros-edt',
  13: 'jpg-le-male-le-parfum',
  14: 'tom-ford-black-orchid-edp',
  15: 'prada-paradoxe-edp',
  16: 'le-labo-santal-33-edp'
};

const outDir = path.join(ROOT, 'assets', 'img', 'products');
fs.mkdirSync(outDir, { recursive: true });

for (const it of withReal) {
  const slug = SLUGS[it.id];
  if (!slug) { console.log(`  ! no slug mapped for id ${it.id}`); continue; }
  const b64 = it.uri.split(',')[1];
  const buf = Buffer.from(b64, 'base64');
  const meta = await sharp(buf).metadata();

  // corner + centre pixel, to confirm the shared background colour
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const i = (y * info.width + x) * info.channels;
    return `${data[i]},${data[i + 1]},${data[i + 2]}`;
  };

  await sharp(buf).png().toFile(path.join(outDir, `${slug}.png`));
  console.log(
    `  ${String(it.id).padStart(2)} ${slug.padEnd(38)} ${String(meta.width).padStart(4)}x${meta.height} ` +
    `${meta.format}  corner=${px(3, 3)}  centre=${px(info.width >> 1, info.height >> 1)}  ${it.brand} ${it.name}`
  );
}
