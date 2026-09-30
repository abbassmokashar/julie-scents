# Product image checklist

Drop your photographs into `incoming-images/` (or any folder, with `--dir`)
and name each file after the product **slug** shown below. Then run:

```bash
npm run images
```

The importer crops, squares, normalises the background to the shared brand
backdrop and resizes every image to 1000×1250. Finally set
`useProductImages: true` in `assets/js/config.js`.

Matching is forgiving — the filename only has to *contain* the slug, the brand
or the product name, so `dior-sauvage.jpg`, `Dior Sauvage.png` and
`sauvage-100ml.webp` all resolve to the same product. Where two files could
match the same product, the first one wins and the clash is reported.

**16 products need an image.**

| # | Expected filename | Product | For |
| --- | --- | --- | --- |
| 1 | `dior-sauvage-edp.jpg` | Dior Sauvage Eau de Parfum | men |
| 2 | `chanel-bleu-de-chanel-edp.jpg` | Chanel Bleu de Chanel Eau de Parfum | men |
| 3 | `armani-acqua-di-gio-profumo.jpg` | Giorgio Armani Acqua di Giò Profumo | men |
| 4 | `paco-rabanne-1-million-edp.jpg` | Paco Rabanne 1 Million Eau de Parfum | men |
| 5 | `creed-aventus-edp.jpg` | Creed Aventus Eau de Parfum | men |
| 6 | `chanel-no-5-edp.jpg` | Chanel No. 5 Eau de Parfum | women |
| 7 | `dior-jadore-edp.jpg` | Dior J'adore Eau de Parfum | women |
| 8 | `ysl-black-opium-edp.jpg` | Yves Saint Laurent Black Opium Eau de Parfum | women |
| 9 | `dior-miss-dior-blooming-bouquet-edt.jpg` | Dior Miss Dior Blooming Bouquet | women |
| 10 | `lancome-la-vie-est-belle-edp.jpg` | Lancôme La Vie Est Belle Eau de Parfum | women |
| 11 | `carolina-herrera-good-girl-edp.jpg` | Carolina Herrera Good Girl Eau de Parfum | women |
| 12 | `versace-eros-edt.jpg` | Versace Eros Eau de Toilette | men |
| 13 | `jpg-le-male-le-parfum.jpg` | Jean Paul Gaultier Le Male Le Parfum | men |
| 14 | `tom-ford-black-orchid-edp.jpg` | Tom Ford Black Orchid Eau de Parfum | unisex |
| 15 | `prada-paradoxe-edp.jpg` | Prada Paradoxe Eau de Parfum | women |
| 16 | `le-labo-santal-33-edp.jpg` | Le Labo Santal 33 Eau de Parfum | unisex |
