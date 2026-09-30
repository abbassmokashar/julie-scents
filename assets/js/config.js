/* ==========================================================================
   JULIE SCENTS — SITE CONFIG
   --------------------------------------------------------------------------
   The one place to change shop-wide behaviour. In WordPress these values map
   to Customizer settings / theme options (see README.md).
   ========================================================================== */

window.JULIE_CONFIG = {
  /* ---- Branding ---------------------------------------------------- */
  name: 'Julie Scents',
  tagline: 'Perfume, recreated without compromise',
  email: 'hello@juliescents.com',
  phone: '+1 (555) 014-2280',
  address: 'Atelier 14, 220 Fragrance Row, New York, NY',

  /* ---- Commerce ---------------------------------------------------- */
  currency: 'USD',
  currencySymbol: '$',
  /* Free shipping threshold, in whole currency units. */
  freeShippingOver: 150,
  shippingFlat: 12,
  /* Demo coupon codes -> percentage off. */
  coupons: { WELCOME10: 10, JULIE15: 15, RECREATE20: 20 },
  taxRate: 0.08,

  /* ---- Product imagery --------------------------------------------
     Product photos live at  assets/img/products/<slug>.webp (WebP, 1000x1250)
     Leave this false until you have added them: the grid then renders its
     elegant typographic tile and the browser makes no 404 requests.
     Run  node tools/import-images.mjs  after dropping your photos in, or just
     add correctly-named files and flip this to true.                        */
  useProductImages: true,

  /* ---- Editorial imagery ------------------------------------------- */
  useEditorialImages: true,

  /* ---- Misc -------------------------------------------------------- */
  gsapCdn: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js'
};
