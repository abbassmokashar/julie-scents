# Julie Scents — demo storefront

A complete, working ecommerce front end for **Julie Scents**, a retailer of
designer perfumes for women and men that also *recreates* any fragrance in its
collection from high-concentration premium oils.

Built as plain HTML, CSS and JavaScript so it opens anywhere, previews instantly
and transfers cleanly into WordPress + WooCommerce.

- **60 fragrances** from **37 designer houses**, each with real note pyramids
- **241 purchasable options** — every size, as either the original bottle or an
  in-house recreation
- Seamless cart, cart drawer, three-step checkout and order confirmation
- GSAP scroll animation throughout, with graceful fallbacks
- Zero build step, zero backend, zero tracking

---

## 1. Quick start

Open `index.html` in any modern browser. That is genuinely all it needs.

For the smoothest experience (and correct `localStorage` behaviour in every
browser), serve it over HTTP instead:

```bash
npm start          # http://localhost:4173
```

The cart persists in the browser's `localStorage`, so it survives page changes
and refreshes. Nothing is sent anywhere.

---

## 2. What is in the box

```
.
├── index.html                 Home — hero, categories, best sellers, USP, reviews
├── shop.html                  All products, with filters / sort / search
├── product.html               Product detail  (?slug=dior-sauvage-edp)
├── cart.html                  Full cart
├── checkout.html              Three-step checkout
├── order-confirmation.html    Receipt  (?order=JS-XXXXXX)
├── recreate.html              The recreation USP explained
├── about.html                 The atelier story
├── contact.html               Contact, FAQ, shipping & returns
│
├── assets/
│   ├── css/
│   │   ├── style.css          Design tokens, base, header, cards, footer
│   │   ├── pages.css          Home sections, editorial blocks, prose
│   │   └── commerce.css       Shop, product, cart, checkout
│   ├── js/
│   │   ├── config.js          Brand, currency, shipping, coupons, feature flags
│   │   ├── products.js        The catalogue — single source of truth
│   │   ├── store.js           Cart, wishlist, coupons, totals
│   │   ├── ui.js              Icons, cards, drawer, search, toasts, mega menu
│   │   ├── home.js            Home page
│   │   ├── shop.js            Filtering, sorting, URL state
│   │   ├── product.js         Product detail + buy box
│   │   ├── cart.js            Cart page
│   │   ├── checkout.js        Checkout steps and validation
│   │   ├── confirmation.js    Order receipt
│   │   ├── recreate.js        Comparison bars + request form
│   │   └── animations.js      GSAP reveals, counters, parallax
│   └── img/
│       ├── products/          ← your product photographs go here
│       └── editorial/         ← optional lifestyle imagery
│
├── tools/
│   ├── import-images.mjs      Crops/normalises your photos into the grid
│   ├── export-woocommerce.mjs Produces importable WooCommerce CSVs
│   ├── validate.mjs           Markup, asset and syntax checks
│   └── test-commerce.mjs      37 assertions on the money maths
│
├── woocommerce/               Generated product-import CSVs
└── IMAGE-CHECKLIST.md         The 60 expected image filenames
```

---

## 3. The commercial idea this site is built around

This is the part worth understanding before changing anything, because the
whole shop is organised around it.

Every product can be bought **two ways**:

| | What it is | Price |
| --- | --- | --- |
| **Original Bottle** | The sealed designer fragrance, sourced from authorised distributors | Retail |
| **Julie Scents Recreate** | The same scent rebuilt in-house from premium oils, at 25–30% concentration | 50–75% less |

Both options sit side by side on every product page, with the saving shown as a
percentage. That comparison — *the real thing, or our version of it* — is the
reason the shop can undercut retail while still selling the genuine article, and
it is what the "Recreate" page and the longevity guarantee exist to support.

In WooCommerce this is modelled as a **variable product** with a `Version`
attribute. See §8.

---

## 4. Editing the catalogue

Everything comes from one file: `assets/js/products.js`.

```js
{
  id: 29,
  slug: 'dior-sauvage-edp',
  brand: 'Dior',
  name: 'Sauvage Eau de Parfum',
  gender: 'men',                       // women | men | unisex
  family: 'Fresh Amber',               // descriptive label
  concentration: 'Eau de Parfum',
  sizes: [{ ml: 60, price: 98 }, { ml: 100, price: 128 }],
  recreate: { ml: [60, 100], price: [32, 44] },   // omit for no recreation
  rating: 4.9,
  reviews: 3412,
  badge: 'Best Seller',                // or null
  notes: { top: [...], heart: [...], base: [...] },
  blurb: 'One line shown under the title.',
  imageAlt: 'Dior Sauvage eau de parfum bottle',
  imageQuery: 'Dior Sauvage perfume bottle'
}
```

Add a product by appending an object. The shop grid, filters, search, related
products, best sellers, new arrivals, mega menu and WooCommerce export all pick
it up automatically — there is nothing else to update.

The **fragrance family filter** groups the 46 descriptive family strings into
canonical buckets via `FAMILY_BUCKETS` in `assets/js/store.js` — eight are
defined and seven are currently in use. Add a new family string and it falls
into the closest bucket (or `Other`).

---

## 5. Design system

All tokens live at the top of `assets/css/style.css`.

| Token | Value | Used for |
| --- | --- | --- |
| `--ink` | `#14100f` | Headings, dark sections, footer |
| `--cream` | `#fbf8f3` | Page background |
| `--ivory` | `#f3ece1` | Alternating sections |
| `--surface-product` | `#f6f1e9` | **The shared product backdrop** |
| `--gold` | `#c09a5b` | Accents, badges, primary buttons |
| `--gold-light` | `#e0c794` | Highlights on dark |

Type is **Cormorant Garamond** for display and **Jost** for UI, loaded from
Google Fonts with system fallbacks.

> `--surface-product` is not just a colour — it is the contract that keeps the
> grid consistent. Every product image is composited onto exactly that hex, so
> photographs and typographic tiles read as one set. Change it in
> `style.css` **and** in `tools/import-images.mjs` (`const BG`) together.

---

## 6. Swapping in real product images

The demo ships **without product photographs**, and that is deliberate: it
renders elegant typographic tiles instead of pretending to have imagery it does
not own. Adding real photos takes one command.

1. Drop your photos into `incoming-images/` (create it, or use `--dir`).

2. Name them anything that identifies the product. Matching is by rarity-weighted
   keywords, so all of these work:

   ```
   dior-sauvage-edp.jpg
   Dior Sauvage.png
   Sauvage 100ml.webp
   ```

   `IMAGE-CHECKLIST.md` lists all 60 slugs if you want to be exact.

3. Run the importer:

   ```bash
   npm run images
   ```

   For each photo it crops to a square, removes the background and lays the
   bottle on the shared backdrop, then writes an optimised 1000×1250 **WebP** to
   `assets/img/products/<slug>.webp`. It reports anything it could not match and
   anything still missing.

   Everything the site ships is already WebP (photographs convert to roughly 40%
   of the JPEG weight at the same visual quality). Inputs can be JPG, PNG, WebP,
   AVIF or TIFF — the importer re-encodes them.

4. Switch the flag in `assets/js/config.js`:

   ```js
   useProductImages: true,
   ```

The grid now shows photographs. Cards whose image is missing still fall back to
their tile, so you can add images gradually.

Flags:
`--no-key` keeps each photo's own background · `--only <slug>` does one product ·
`--checklist` just rewrites the filename list.

Editorial imagery (`assets/img/editorial/`) is optional and works the same way —
every editorial block is art-directed to look intentional with or without a
photograph.

---

## 7. Verifying your changes

```bash
npm run check      # markup, assets, inline scripts + commerce tests
npm run validate   # markup / asset / syntax checks only
npm test           # 37 assertions on cart, pricing, coupons, shipping, tax
```

`validate.mjs` checks tag balance, missing asset references, inline-script
syntax, broken HTML entities, required head tags and catalogue integrity
(duplicate slugs, incomplete sizes, mismatched recreate arrays).

`test-commerce.mjs` runs the real `store.js` headlessly and asserts line
merging, variant pricing, the free-shipping threshold, coupon maths, tax,
quantity edits, and that **all 241 options are purchasable at a positive price**.

---

## 8. Moving this to WordPress

Two viable routes. **Route A is recommended** — it is what the demo's structure
maps onto most directly.

### Route A — custom theme + WooCommerce

Copy the nine colour/typography/layout files, let WooCommerce own the commerce
logic, and reuse the CSS almost untouched.

#### Page → template map

| Demo file | WordPress template | Notes |
| --- | --- | --- |
| `index.html` | `front-page.php` | Static front page, or a block-built home |
| `shop.html` | `woocommerce/archive-product.php` | Use WooCommerce's native Product Filter blocks for the rail; delete `shop.js` |
| `product.html` | `woocommerce/single-product.php` | Variable product; `Version` attribute drives the two buying options |
| `cart.html` | `woocommerce/cart/cart.php` | Keep WooCommerce's template — it handles nonces and sessions |
| `checkout.html` | `woocommerce/checkout/form-checkout.php` | Keep WooCommerce's |
| `order-confirmation.html` | `woocommerce/checkout/thankyou.php` | Order data comes from WooCommerce |
| `recreate.html` | `page-recreate.php` or a page template | Fully static content |
| `about.html` | `page.php` | Static content |
| `contact.html` | `page-contact.php` | Point the form at Contact Form 7 / WPForms |
| `assets/css/*` | same paths under the theme | Enqueue in `functions.php` |
| header / footer markup | `header.php` / `footer.php` | Already written as one block each, ready to lift |
| `assets/js/animations.js` | same | Reuse as-is |
| `assets/js/store.js`, `cart.js`, `checkout.js`, `confirmation.js`, `shop.js` | **delete** | WooCommerce replaces all of it |

The demo's markup was written with this in mind: one `<header>` block and one
`<footer>` block per page, semantic sections, and a `assets/js/config.js` whose
values map one-to-one onto Customizer settings.

#### Theme skeleton

```
julie-scents-theme/
├── style.css                 ← theme header + assets/css/style.css
├── functions.php
├── header.php                ← the <header> block from any demo page
├── footer.php                ← the <footer> block
├── front-page.php
├── page.php
├── index.php
├── assets/css/{style,pages,commerce}.css
├── assets/js/{animations,theme-ui}.js
└── woocommerce/
    ├── archive-product.php
    ├── single-product.php
    ├── cart/cart.php
    ├── checkout/form-checkout.php
    └── content-product.php   ← reuse the demo's .pcard markup here
```

#### `functions.php`

```php
<?php
add_action( 'wp_enqueue_scripts', function () {
	$v = wp_get_theme()->get( 'Version' );
	$u = get_theme_file_uri();

	wp_enqueue_style( 'julie-fonts',
		'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap',
		[], null );

	wp_enqueue_style( 'julie-core',     "$u/assets/css/style.css",    [], $v );
	wp_enqueue_style( 'julie-pages',    "$u/assets/css/pages.css",    [ 'julie-core' ], $v );
	wp_enqueue_style( 'julie-commerce', "$u/assets/css/commerce.css", [ 'julie-core' ], $v );

	wp_enqueue_script( 'gsap', 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js', [], null, true );
	wp_enqueue_script( 'gsap-st', 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js', [ 'gsap' ], null, true );
	wp_enqueue_script( 'julie-anim', "$u/assets/js/animations.js", [ 'gsap-st' ], $v, true );
	wp_enqueue_script( 'julie-ui',   "$u/assets/js/theme-ui.js",   [], $v, true );

	wp_localize_script( 'julie-ui', 'JULIE', [
		'cartUrl'     => wc_get_cart_url(),
		'checkoutUrl' => wc_get_checkout_url(),
		'cartCount'   => WC()->cart ? WC()->cart->get_cart_contents_count() : 0,
	] );
} );

add_theme_support( 'woocommerce' );
add_theme_support( 'post-thumbnails' );
add_theme_support( 'html5', [ 'search-form', 'gallery', 'caption', 'style', 'script' ] );

register_nav_menus( [
	'primary'       => 'Primary',
	'footer_shop'   => 'Footer — Shop',
	'footer_atelier'=> 'Footer — Atelier',
	'footer_care'   => 'Footer — Client care',
] );
```

#### What to keep, what to delete

| Demo file | In WordPress |
| --- | --- |
| `animations.js` | **Keep.** Pure progressive enhancement, safe on any page. |
| `ui.js` | **Partly.** Keep icons, toasts, mega menu, search, mobile nav, accordions. Drop `Store` calls — render the cart badge from `JULIE.cartCount` and let the drawer link to the cart page, or wire it to WooCommerce's `wc_fragment_refresh`. |
| `store.js` | **Delete.** WooCommerce owns cart state, coupons, tax and shipping. |
| `cart.js`, `checkout.js`, `confirmation.js` | **Delete.** |
| `shop.js` | **Delete.** Replace with WooCommerce Product Filter blocks, or FacetWP if you want the exact rail. |
| All CSS | **Keep.** Class names are generic (`.pcard`, `.btn`, `.badge`) so they style WooCommerce output directly. |

#### Products

Import `woocommerce/products-variable.csv` (WooCommerce → Products → Import).
It creates every category and tag, and gives each fragrance a **Size** and
**Version** dropdown — the same two-choice buying flow as the demo. If your
version of WooCommerce objects to the variation rows, use
`products-simple.csv` instead. See `woocommerce/README.md`.

Then copy the values from `assets/js/config.js` across:

| `config.js` | WooCommerce / WordPress |
| --- | --- |
| `currency`, `currencySymbol` | WooCommerce → Settings → General |
| `freeShippingOver`, `shippingFlat` | WooCommerce → Settings → Shipping |
| `coupons` | WooCommerce → Coupons (`WELCOME10`, `JULIE15`, `RECREATE20`) |
| `taxRate` | WooCommerce → Settings → Tax |
| `name`, `email`, `phone`, `address` | Customizer, and the footer |
| `useProductImages` | Not needed — WooCommerce uses the Media Library |

#### Route A checklist

- [ ] Theme activated, `style.css` carries the theme header
- [ ] Header/footer markup lifted into `header.php` / `footer.php`
- [ ] Menus assigned in Appearance → Menus
- [ ] CSS enqueued and no console 404s
- [ ] GSAP + `animations.js` loading (`defer` preserved via the `true` argument)
- [ ] Products imported; the *Version* attribute visible and set to "used for variations"
- [ ] Cart, checkout and thank-you pages assigned in WooCommerce settings
- [ ] Static pages created for Recreate / Atelier / Contact, permalinks set
- [ ] Demo `store.js` / `cart.js` / `checkout.js` / `shop.js` removed
- [ ] Test order placed end to end in sandbox mode
- [ ] Product images uploaded and attached

### Route B — Elementor + WooCommerce (no custom theme)

Fastest route if the client wants to edit everything visually.

1. Install a blank theme (Hello Elementor) plus Elementor Pro and WooCommerce.
2. Rebuild the home page in Elementor; carry the palette and type scale over
   from §5 as global colours and fonts.
3. Use Elementor's **Products** / **Product Archive** and **Product Categories**
   widgets for the grid and category tiles.
4. Add `assets/css/*.css` under Elementor → Custom CSS (Global), and load
   `animations.js` via an HTML widget or a small snippet plugin.
5. Import the same CSV for the catalogue.

Trade-off: far less code to maintain, but you lose the bespoke card markup,
filter rail and the exact motion design. Route A preserves the demo as built.

---

## 9. Demo limitations — worth stating plainly

- **Prices are illustrative.** They are realistic retail figures, not quotes.
- **No backend.** The cart lives in `localStorage`; checkout validates and
  produces an order number in the browser but takes no payment.
- **The product images are absent by design** (see §6). When you supply them,
  make sure you hold the rights to use them — official distributor photography
  is normally the right source for a reseller.
- **Brand names are used descriptively**, as any reseller would, to say which
  fragrances are stocked. The site does not imply affiliation with those houses,
  and no designer logo or trademark artwork is reproduced anywhere in the design.
- **Recreations are described as interpretations**, matching the copy in
  `recreate.html`, not as copies of proprietary formulas.

---

## 10. Talking points for the presentation

If it helps to have a narrative when you show this:

1. **The comparison is the hook.** Every product page shows *original versus
   recreation* side by side, with the saving in real numbers. It answers the
   customer's question before they ask it.
2. **Longevity is the objection, so it is answered head-on** — the 8-hour
   guarantee, the wear-test figures, and the oil-concentration explanation.
3. **The aesthetic is deliberately quiet.** Ivory, ink and one gold. It reads as
   a perfume house rather than a marketplace, which is what lets the recreate
   proposition feel premium instead of cheap.
4. **It is already transferable.** 60 products, 241 options and the full
   catalogue structure export to WooCommerce in one file, so the build does not
   have to be thrown away if they say yes.

---

*Demo build. Not affiliated with any of the fragrance houses referenced.*
