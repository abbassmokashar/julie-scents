/* ==========================================================================
   JULIE SCENTS — PRODUCT DETAIL
   Reads ?slug=, then renders the gallery, the buy box (original bottle vs
   in-house recreation), the composition, the accordions and related scents.
   ========================================================================== */

(function () {
  'use strict';

  var S = window.Store;
  var UI = window.UI;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var qs = UI.qs;
    var esc = UI.esc;
    var I = UI.icons;

    var slug = new URLSearchParams(location.search).get('slug');
    var p = slug ? S.findBySlug(slug) : null;

    /* ------------------------------------------------------- not found */
    if (!p) {
      var wrap = qs('#pdpWrap');
      if (wrap) {
        wrap.innerHTML = '' +
          '<div class="empty" style="padding-block:6rem">' +
            '<h1 class="empty__title">We could not find that fragrance</h1>' +
            '<p class="muted">It may have been renamed or removed from the collection.</p>' +
            '<a class="btn mt-5" href="shop.html"><span>Browse all fragrances</span></a>' +
          '</div>';
      }
      var c = qs('#crumbName');
      if (c) c.textContent = 'Not found';
      return;
    }

    /* ------------------------------------------------------------ state */
    var state = {
      variant: 'original',
      ml: S.sizesFor(p, 'original')[0].ml,
      qty: 1
    };

    document.title = p.brand + ' ' + p.name + ' — Julie Scents';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', p.blurb);

    var crumb = qs('#crumbName');
    if (crumb) crumb.textContent = p.name;

    /* --------------------------------------------------------- gallery */
    var stage = qs('#galleryStage');
    if (stage) {
      stage.innerHTML = '' +
        UI.media(p) +
        '<div class="gallery__badges">' +
          (p.badge ? '<span class="badge badge--gold">' + esc(p.badge) + '</span>' : '') +
          '<span class="badge badge--soft">' + esc(p.concentration) + '</span>' +
        '</div>' +
        '<button class="gallery__zoom" type="button" data-zoom="' +
          (window.JULIE_CONFIG.useProductImages ? esc(UI.imageUrl(p)) : '') + '" ' +
          'data-zoom-alt="' + esc(p.imageAlt || p.name) + '" ' +
          'data-zoom-brand="' + esc(p.brand) + '" ' +
          'data-zoom-title="' + esc(p.name) + '" aria-label="View image larger">' + I.zoom + '</button>';
    }

    var thumbs = qs('#galleryThumbs');
    if (thumbs) {
      /* A single photograph per fragrance today — show one active thumbnail
         rather than repeating the same image three times. */
      thumbs.innerHTML = window.JULIE_CONFIG.useProductImages
        ? '<span class="gallery__thumb is-on">' + UI.media(p) + '</span>'
        : '';
      thumbs.hidden = !window.JULIE_CONFIG.useProductImages;
    }

    /* --------------------------------------------------------- buy box */
    var buybox = qs('#buybox');

    function sizesNow() { return S.sizesFor(p, state.variant); }

    function currentPrice() { return S.unitPrice(p, state.variant, state.ml); }

    function comparePrice() {
      if (state.variant !== 'recreate') return null;
      var idx = p.sizes.filter(function (s) { return s.ml === state.ml; })[0];
      return idx ? idx.price : null;
    }

    function savingPct() {
      var orig = comparePrice();
      if (!orig) return null;
      return Math.round((1 - currentPrice() / orig) * 100);
    }

    function paint() {
      var sizes = sizesNow();
      var price = currentPrice();
      var was = comparePrice();
      var save = savingPct();
      var recAvailable = !!p.recreate;

      buybox.innerHTML = '' +
        '<p class="buybox__brand"><a href="shop.html?brand=' + encodeURIComponent(p.brand) + '">' + esc(p.brand) + '</a></p>' +
        '<h1>' + esc(p.name) + '</h1>' +

        '<div class="rating-row buybox__rating">' +
          UI.stars(p.rating, 'stars--lg') +
          '<span>' + p.rating.toFixed(1) + ' out of 5 &middot; ' + p.reviews + ' reviews</span>' +
        '</div>' +

        '<p class="buybox__blurb">' + esc(p.blurb) + '</p>' +

        /* buying options */
        '<p class="opt-label">Choose your bottle' +
          (recAvailable ? '<span class="hint">' + I.sparkle.replace(/width="\d+" height="\d+"/, 'width="11" height="11"') + ' recreated in-house</span>' : '') +
        '</p>' +
        '<div class="variants">' +
          variantCard('original', 'Original bottle', 'Sealed designer fragrance, sourced from authorised distributors',
            S.money(S.fromPrice(p)) + (p.sizes.length > 1 ? '+' : '')) +
          (recAvailable
            ? variantCard('recreate', 'Julie Scents Recreate', 'Rebuilt by our atelier from premium oils, 8–12 h wear',
                S.money(p.recreate.price[0]) + (p.recreate.price.length > 1 ? '+' : ''))
            : '') +
        '</div>' +

        /* price */
        '<div class="buybox__price">' +
          '<span class="now">' + S.money(price) + '</span>' +
          (was ? '<del>' + S.money(was) + '</del>' : '') +
          (save ? '<span class="save">Save ' + save + '%</span>' : '') +
        '</div>' +

        /* sizes */
        '<p class="opt-label">Size<span class="hint">' + (state.variant === 'recreate' ? 'Recreate' : 'Original') + '</span></p>' +
        '<div class="sizes">' +
          sizes.map(function (s) {
            return '<button class="size' + (s.ml === state.ml ? ' is-on' : '') + '" type="button" data-size="' + s.ml + '">' +
              s.ml + ' ml<small>' + S.money(s.price) + '</small>' +
            '</button>';
          }).join('') +
        '</div>' +

        /* purchase */
        '<div class="purchase">' +
          '<div class="qty">' +
            '<button class="qty__btn" type="button" data-qty-step="-1" aria-label="Decrease quantity">' + I.minus + '</button>' +
            '<span class="qty__val" id="pdpQty">' + state.qty + '</span>' +
            '<button class="qty__btn" type="button" data-qty-step="1" aria-label="Increase quantity">' + I.plus + '</button>' +
          '</div>' +
          '<button class="btn btn--lg" type="button" data-add-btn><span>Add to cart &mdash; ' +
            S.money(price * state.qty) + '</span></button>' +
        '</div>' +

        '<button class="btn btn--ghost btn--full" type="button" data-buy-now><span>Buy it now</span></button>' +

        /* assurances */
        '<div class="assurances mt-6">' +
          assurance(I.truck, '<strong>Free delivery</strong> on orders over ' + S.money(window.JULIE_CONFIG.freeShippingOver)) +
          assurance(I.clock, '<strong>8–12 hours</strong> of wear, or we replace the bottle') +
          assurance(I.shield, '<strong>100% authentic</strong> or your money back') +
          assurance(I.gift, '<strong>Two free 5 ml samples</strong> in every order') +
        '</div>' +

        /* meta */
        '<dl class="meta-strip">' +
          '<div><dt>Family</dt><dd>' + esc(p.family) + '</dd></div>' +
          '<div><dt>Concentration</dt><dd>' + esc(p.concentration) + '</dd></div>' +
          '<div><dt>Sizes</dt><dd>' + sizes.map(function (s) { return s.ml + ' ml'; }).join(' · ') + '</dd></div>' +
          '<div><dt>House</dt><dd>' + esc(p.brand) + '</dd></div>' +
        '</dl>' +

        (recAvailable
          ? '<div class="recreate-note"><strong>Can we rebuild this one for you?</strong>' +
              'Yes — ' + esc(p.brand) + ' ' + esc(p.name) + ' is on our recreate list. Choose the Recreate bottle above and our atelier will match the ' +
              'top, heart and base notes using premium oils at full concentration.' +
              '<button class="btn-text mt-4" type="button" data-jump-recreate>See the recreate price ' + I.arrowRight + '</button></div>'
          : '');
    }

    function variantCard(id, name, note, priceText) {
      var on = state.variant === id;
      var save = id === 'recreate' ? savingForRecreate() : null;
      return '' +
        '<button class="variant' + (on ? ' is-on' : '') + '" type="button" data-variant="' + id + '" aria-pressed="' + on + '">' +
          (save ? '<span class="variant__save">Save ' + save + '%</span>' : '') +
          '<span class="variant__tag">' + (id === 'recreate' ? 'In-house' : 'Designer') + '</span>' +
          '<span class="variant__name">' + esc(name) + '</span>' +
          '<span class="variant__price">from ' + priceText + '</span>' +
          '<span class="variant__note">' + esc(note) + '</span>' +
        '</button>';
    }

    function savingForRecreate() {
      if (!p.recreate) return null;
      var orig = S.fromPrice(p);
      var rec = p.recreate.price[0];
      if (!orig) return null;
      return Math.round((1 - rec / orig) * 100);
    }

    function assurance(icon, html) {
      return '<div class="assurance">' + icon + '<span>' + html + '</span></div>';
    }

    paint();

    /* ------------------------------------------------------- interactions */
    if (buybox) {
      buybox.addEventListener('click', function (e) {
        var t = e.target;

        var v = t.closest('[data-variant]');
        if (v && !v.classList.contains('is-on')) {
          state.variant = v.getAttribute('data-variant');
          var next = S.sizesFor(p, state.variant);
          if (!next.some(function (s) { return s.ml === state.ml; })) state.ml = next[0].ml;
          paint();
          paintSticky();
          return;
        }

        var sz = t.closest('[data-size]');
        if (sz) {
          state.ml = Number(sz.getAttribute('data-size'));
          paint();
          paintSticky();
          return;
        }

        var step = t.closest('[data-qty-step]');
        if (step) {
          state.qty = Math.max(1, state.qty + Number(step.getAttribute('data-qty-step')));
          paint();
          paintSticky();
          return;
        }

        if (t.closest('[data-jump-recreate]')) {
          state.variant = 'recreate';
          state.ml = S.sizesFor(p, 'recreate')[0].ml;
          paint();
          paintSticky();
          var bb = qs('#buybox');
          if (bb) bb.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        if (t.closest('[data-add-btn]') || t.closest('[data-buy-now]')) {
          e.preventDefault();
          S.add(p, { variant: state.variant, ml: state.ml, qty: state.qty });
          UI.toast(p.name + ' added to cart', I.checkCircle);
          UI.updateCount();
          UI.openDrawer();
        }
      });
    }

    /* ------------------------------------------------------- sticky bar */
    var stickyName = qs('#stickyName');
    var stickyPrice = qs('#stickyPrice');
    var stickyAdd = qs('#stickyAdd');

    function paintSticky() {
      if (stickyName) stickyName.textContent = p.brand + ' ' + p.name;
      if (stickyPrice) {
        stickyPrice.textContent = S.money(currentPrice()) + ' · ' + state.ml + ' ml · ' +
          (state.variant === 'recreate' ? 'Recreate' : 'Original');
      }
    }
    paintSticky();

    if (stickyAdd) {
      stickyAdd.addEventListener('click', function () {
        S.add(p, { variant: state.variant, ml: state.ml, qty: state.qty });
        UI.toast(p.name + ' added to cart', I.checkCircle);
        UI.updateCount();
        UI.openDrawer();
      });
    }

    /* ------------------------------------------------------ composition */
    var notesBody = qs('#notesBody');
    if (notesBody) {
      var rows = [
        { key: 'Top notes', vals: p.notes.top },
        { key: 'Heart notes', vals: p.notes.heart },
        { key: 'Base notes', vals: p.notes.base }
      ];
      notesBody.innerHTML = rows.map(function (r) {
        return '<div class="notes__row">' +
          '<span class="notes__key">' + r.key + '</span>' +
          '<span class="notes__vals">' + r.vals.map(function (v) {
            return '<span class="chip">' + esc(v) + '</span>';
          }).join('') + '</span>' +
        '</div>';
      }).join('');
    }

    var notesRecreate = qs('#notesRecreate');
    if (notesRecreate) {
      notesRecreate.innerHTML = p.recreate
        ? '<strong>Recreate this composition</strong>Our atelier rebuilds the full ' +
          esc(p.family).toLowerCase() + ' accord from premium oils at ' + '25–30% concentration — ' +
          'guaranteed for 8 to 12 hours on skin.'
        : '<strong>Original bottle only</strong>This house is not currently on our recreate list. ' +
          'Ask us and we will look into blending it for you.';
    }

    var accordion = qs('#pdpAccordion');
    if (accordion) {
      var items = [
        {
          title: 'The fragrance',
          body: '<p>' + esc(p.blurb) + '</p>' +
            '<p>' + esc(p.brand) + ' built this as a ' + esc(p.family).toLowerCase() +
            ' ' + esc(p.concentration).toLowerCase() + ', built around ' +
            esc(p.notes.heart.join(', ').toLowerCase()) + ' over a base of ' +
            esc(p.notes.base.join(', ').toLowerCase()) + '.</p>'
        },
        {
          title: 'How to wear it',
          body: '<p>Spray onto pulse points — wrists, the base of the throat and behind the ears — ' +
            'from roughly 15 cm away. Do not rub your wrists together; it crushes the top notes and ' +
            'shortens the wear.</p>' +
            '<p>For the longest performance, apply straight after a warm shower while the skin is still ' +
            'slightly damp, and layer with an unscented moisturiser first.</p>'
        },
        {
          title: 'Longevity guarantee',
          body: '<p>Every recreation is blended at 25–30% oil concentration and tested to give eight to ' +
            'twelve hours of wear. If yours fades before eight hours, tell us within 30 days and we will ' +
            're-blend it or refund you in full.</p>' +
            '<p>The guarantee covers our recreations only. Designer bottles carry their ' +
            'manufacturer&rsquo;s original formulation.</p>'
        },
        {
          title: 'Delivery &amp; returns',
          body: '<p>Dispatched within 24 hours. Standard delivery is complimentary on orders over ' +
            S.money(window.JULIE_CONFIG.freeShippingOver) + ', otherwise ' +
            S.money(window.JULIE_CONFIG.shippingFlat) + ' and typically arrives in three to five ' +
            'business days.</p>' +
            '<p>Unopened bottles can be returned within 30 days at our cost. Recreations that fail the ' +
            'longevity test are replaced free of charge.</p>'
        }
      ];

      accordion.innerHTML = items.map(function (it, i) {
        return '<div class="acc__item' + (i === 0 ? ' is-open' : '') + '">' +
          '<button class="acc__head" type="button" aria-expanded="' + (i === 0 ? 'true' : 'false') + '">' +
            it.title + '<span class="acc__icon"></span>' +
          '</button>' +
          '<div class="acc__panel"><div><div class="acc__body">' + it.body + '</div></div></div>' +
        '</div>';
      }).join('');

      UI.initAccordions(accordion);
    }

    /* ----------------------------------------------------------- related */
    var relatedGrid = qs('#relatedGrid');
    if (relatedGrid) {
      relatedGrid.innerHTML = S.related(p, 4).map(UI.card).join('');
    }

    var detail = qs('#detailSection');
    if (detail) detail.hidden = false;
    var relSection = qs('#relatedSection');
    if (relSection) relSection.hidden = false;

    UI.syncWishButtons();
  });
})();
