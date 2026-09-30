/* Temporary: fill the editorial image slots with free stock photography.
   Photos come from Pexels (https://www.pexels.com/license/ — free to use,
   no attribution required). Each one is cropped to the aspect ratio its
   section actually renders at, with sharp's "attention" strategy deciding
   where to crop so the subject stays in frame.

   Re-run with:  node tools/.fetch-stock-images.mjs               */

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'assets/img/editorial';
mkdirSync(OUT, { recursive: true });

/* file             pexels id   w × h        what it shows                       */
const SLOTS = [
  ['hero.webp',            16239693, 2200, 1300, 'perfume bottle, dark textured backdrop'],
  ['craft.webp',            8450361, 1600, 1000, 'funnel pouring into an amber bottle'],
  ['cat-her.webp',          34144062,  900, 1200, 'pink bottle, pearls and white flowers'],
  ['cat-him.webp',          17978253,  900, 1200, 'black bottle on dark stones'],
  ['cat-unisex.webp',       33052323,  900, 1200, 'dropper bottle held on beige fabric'],
  ['cat-recreate.webp',     35909808,  900, 1200, 'amber dropper bottles, pastel backdrop'],
  ['recreate-steps.webp',    3865621, 1200, 1500, 'hands pouring oil into a glass bottle'],
  ['story.webp',              264819, 1400, 1750, 'three bottles on a wooden surface'],
  ['in-person.webp',        12346562, 1600, 1000, 'a client holding a bottle to the light']
];

for (const [file, id, width, height, note] of SLOTS) {
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2400`;
  const res = await fetch(url, { headers: { 'user-agent': 'julie-scents-demo/1.0' } });
  if (!res.ok) throw new Error(`${file}: ${res.status} ${res.statusText}`);

  const src = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(src).metadata();

  await sharp(src)
    .resize({ width, height, fit: 'cover', position: sharp.strategy.attention })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(`${OUT}/${file}`);

  console.log(
    file.padEnd(20) + `${meta.width}x${meta.height}`.padEnd(11) +
    `-> ${width}x${height}`.padEnd(15) + note
  );
}
