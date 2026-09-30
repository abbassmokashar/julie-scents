/* ==========================================================================
   JULIE SCENTS — UI LAYER
   Icons, product cards, cart drawer, search, toasts and the header chrome.
   Everything that appears on more than one page lives here.
   ========================================================================== */

(function () {
  'use strict';

  var CFG = window.JULIE_CONFIG;
  var S = window.Store;

  /* ------------------------------------------------------------- utils */

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function productUrl(p) { return 'product.html?slug=' + encodeURIComponent(p.slug); }
  function imageUrl(p) { return 'assets/img/products/' + p.slug + '.webp'; }

  /* ------------------------------------------------------------- icons */

  var I = {
    cart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    search: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    user: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    heart: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1Z"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    plus: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 12h14"/></svg>',
    arrowRight: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    arrowLeft: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    chevronDown: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    check: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    checkCircle: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.4 2.4 4.6-4.9"/></svg>',
    shield: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5 4 6v6c0 5 3.4 8.4 8 9.5 4.6-1.1 8-4.5 8-9.5V6Z"/><path d="m9 12 2.2 2.2L15.5 10"/></svg>',
    drop: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5s6.5 6.9 6.5 11a6.5 6.5 0 0 1-13 0c0-4.1 6.5-11 6.5-11Z"/></svg>',
    truck: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v10H2z"/><path d="M13 9h4.5l3.5 3.5V16H13z"/><circle cx="6" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/></svg>',
    clock: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.4 2"/></svg>',
    flask: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v6.5L4.5 17A2.6 2.6 0 0 0 6.8 21h10.4a2.6 2.6 0 0 0 2.3-4L15 8.5V2"/><path d="M8 2h8M6.6 15h10.8"/></svg>',
    sparkle: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3 9 9M15 15l2.7 2.7M17.7 6.3 15 9M9 15l-2.7 2.7"/></svg>',
    leaf: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20C6 20 3 17 3 12.5A9.5 9.5 0 0 1 12.5 3H20v7.5A9.5 9.5 0 0 1 11 20Z"/><path d="M8 20c1.5-5 4.5-8 9-10"/></svg>',
    zoom: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg>',
    filter: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>',
    gift: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16v11H4z"/><path d="M2 7h20v3H2zM12 10v11"/><path d="M12 7S10.5 2 8 2a2.5 2.5 0 0 0 0 5h4Zm0 0s1.5-5 4-5a2.5 2.5 0 0 1 0 5h-4Z"/></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
    phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>',
    pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.8"/></svg>',
    instagram: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
    facebook: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 8h3V5h-3a4 4 0 0 0-4 4v2H8v3h2v7h3v-7h2.5l.5-3H13V9a1 1 0 0 1 1-1Z"/></svg>',
    tiktok: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3v9.5a3.5 3.5 0 1 1-3-3.4"/><path d="M15 3a4.5 4.5 0 0 0 4.5 4.5"/></svg>',
    pinterest: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 20c-.4-1.6 0-3.6.3-5l1-4.2"/><path d="M8.4 11.4c0-2.3 1.8-4.4 4.6-4.4 2.4 0 4 1.5 4 3.8 0 2.7-1.5 4.7-3.6 4.7a1.9 1.9 0 0 1-1.8-1.2"/></svg>'
  };

  /* ------------------------------------------------------------- pieces */

  function stars(rating, cls) {
    var full = Math.round(Number(rating) || 0);
    var out = '<span class="stars ' + (cls || '') + '" aria-hidden="true">';
    for (var i = 0; i < 5; i++) out += i < full ? I.star : I.star.replace('fill="currentColor"', 'fill="none" stroke="currentColor" stroke-width="1.2"');
    out += '</span>';
    return out;
  }

  /** The typographic tile used whenever a product photo is missing. */
  function tile(p, opts) {
    opts = opts || {};
    return '' +
      '<div class="tile">' +
        '<div class="tile__inner">' +
          '<span class="tile__brand">' + esc(p.brand) + '</span>' +
          '<span class="tile__rule"></span>' +
          '<span class="tile__name">' + esc(p.name) + '</span>' +
          (opts.hideFamily ? '' : '<span class="tile__family">' + esc(p.family) + '</span>') +
        '</div>' +
      '</div>';
  }

  /**
   * Product media: a real photo when configured and present, otherwise the
   * typographic tile. `useProductImages` keeps the browser from requesting
   * files that do not exist yet.
   */
  function media(p, opts) {
    opts = opts || {};
    var out = '';
    if (CFG.useProductImages) {
      out += '<img src="' + imageUrl(p) + '" alt="' + esc(p.imageAlt || p.brand + ' ' + p.name) +
        '" loading="lazy" decoding="async" onerror="this.remove()">';
    }
    if (!CFG.useProductImages || opts.tileAlways) out += tile(p, opts);
    return out;
  }

  function genderLabel(g) {
    if (g === 'women') return 'For Her';
    if (g === 'men') return 'For Him';
    return 'Unisex';
  }

  /** Standard product card. */
  function card(p) {
    var wished = S.inWishlist(p.id) ? ' is-on' : '';
    var price = S.fromPrice(p);
    var rec = p.recreate ? p.recreate.price[0] : null;

    return '' +
      '<article class="pcard" data-id="' + p.id + '">' +
        '<div class="pcard__media">' +
          '<a class="pcard__link" href="' + productUrl(p) + '" aria-label="' + esc(p.brand + ' ' + p.name) + '">' +
            media(p) +
          '</a>' +
          '<div class="pcard__badges">' +
            '<span class="pcard__num">' + p.id + '</span>' +
            (S.isOnSale(p) ? '<span class="badge badge--sale">Save</span>' : '') +
          '</div>' +
          '<button class="pcard__wish' + wished + '" type="button" data-wish="' + p.id + '" ' +
            'aria-label="Save ' + esc(p.name) + '" aria-pressed="' + (wished ? 'true' : 'false') + '">' + I.heart + '</button>' +
          '<div class="pcard__quick">' +
            '<button class="btn btn--sm" type="button" data-quick-add="' + p.id + '"><span>Quick add</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="pcard__body">' +
          '<div class="pcard__top">' +
            '<span class="pcard__brand">' + esc(p.brand) + '</span>' +
            '<span class="pill pill--gender" data-g="' + p.gender + '">' + genderLabel(p.gender) + '</span>' +
          '</div>' +
          '<a class="pcard__name" href="' + productUrl(p) + '">' + esc(p.name) + '</a>' +
          '<div class="pcard__meta">' + stars(p.rating) + '<span>' + (p.rating || 0).toFixed(1) + ' (' + p.reviews + ')</span></div>' +
          '<div class="pcard__price">' +
            '<span class="from">from</span>' +
            '<span class="now">' + S.money(price) + '</span>' +
          '</div>' +
          (rec ? '<span class="pcard__recreate">' + I.sparkle.replace(/width="\d+" height="\d+"/, 'width="11" height="11"') +
                 ' Recreate ' + S.money(rec) + '</span>' : '') +
        '</div>' +
      '</article>';
  }

  /** Compact row used in search results and cart summaries. */
  function miniLine(p) {
    return '' +
      '<a class="line" href="' + productUrl(p) + '">' +
        '<span class="line__media">' + media(p) + '</span>' +
        '<span class="line__info">' +
          '<span class="line__brand">' + esc(p.brand) + '</span>' +
          '<span class="line__name">' + esc(p.name) + '</span>' +
          '<span class="line__variant">' + esc(p.family) + '</span>' +
        '</span>' +
        '<span class="line__side"><span class="line__price">' + S.money(S.fromPrice(p)) + '</span></span>' +
      '</a>';
  }

  /* ----------------------------------------------------------- toasts */

  function toast(message, icon) {
    var wrap = qs('#toasts');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toasts';
      wrap.id = 'toasts';
      wrap.setAttribute('role', 'status');
      wrap.setAttribute('aria-live', 'polite');
      document.body.appendChild(wrap);
    }
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = (icon || I.checkCircle) + '<span>' + esc(message) + '</span>';
    wrap.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('is-in'); });
    setTimeout(function () {
      el.classList.remove('is-in');
      el.classList.add('is-out');
      setTimeout(function () { el.remove(); }, 450);
    }, 2800);
  }

  /* ------------------------------------------------------------- chrome */

  function chromeMarkup() {
    return '' +
      '<div class="scrim" data-close-drawer></div>' +

      /* mobile navigation */
      '<nav class="mobile-nav" id="mobileNav" aria-label="Mobile">' +
        '<div class="mobile-nav__head">' +
          '<span class="brand"><span class="brand__mark">Julie <em>Scents</em></span></span>' +
          '<button class="icon-btn" type="button" data-close-nav aria-label="Close menu">' + I.close + '</button>' +
        '</div>' +
        '<div class="mobile-nav__group"><a href="shop.html">Shop all</a>' +
          '<div class="mobile-nav__sub"><a href="shop.html?gender=women">Women</a><a href="shop.html?gender=men">Men</a>' +
          '<a href="shop.html?gender=unisex">Unisex</a><a href="shop.html?sale=1">Recreate deals</a></div></div>' +
        '<div class="mobile-nav__group"><a href="recreate.html">Recreate a scent</a>' +
          '<div class="mobile-nav__sub"><a href="recreate.html#how">How it works</a><a href="recreate.html#quality">Our oils</a></div></div>' +
        '<div class="mobile-nav__group"><a href="about.html">The atelier</a>' +
          '<div class="mobile-nav__sub"><a href="about.html#story">Our story</a><a href="contact.html">Contact</a></div></div>' +
        '<div class="mobile-nav__group"><a href="contact.html">Client care</a>' +
          '<div class="mobile-nav__sub"><a href="contact.html#faq">FAQ</a><a href="contact.html#form">Get in touch</a></div></div>' +
        '<div class="mobile-nav__cta">' +
          '<a class="btn btn--gold" href="shop.html"><span>Shop the collection</span></a>' +
          '<a class="btn btn--ghost" href="cart.html"><span>View cart</span></a>' +
        '</div>' +
      '</nav>' +

      /* cart drawer */
      '<aside class="drawer" id="cartDrawer" aria-label="Shopping cart" aria-hidden="true">' +
        '<div class="drawer__head">' +
          '<h2 class="drawer__title">Your cart</h2>' +
          '<button class="icon-btn" type="button" data-close-drawer aria-label="Close cart">' + I.close + '</button>' +
        '</div>' +
        '<div class="drawer__body" id="drawerBody"></div>' +
        '<div class="drawer__foot" id="drawerFoot"></div>' +
      '</aside>' +

      /* account panel */
      '<aside class="account-panel" id="accountPanel" aria-label="Your account" aria-hidden="true">' +
        '<div class="account-panel__head">' +
          '<h2 class="account-panel__title">Your account</h2>' +
          '<button class="icon-btn" type="button" data-close-account aria-label="Close account">' + I.close + '</button>' +
        '</div>' +
        '<div class="account-panel__body" id="accountBody"></div>' +
      '</aside>' +

      /* search */
      '<div class="search-overlay" id="searchOverlay" role="dialog" aria-label="Search">' +
        '<div class="search-panel">' +
          '<div class="wrap">' +
            '<div class="search-panel__row">' +
              I.search +
              '<input class="search-panel__input" id="searchInput" type="search" placeholder="Search a fragrance, house or note…" autocomplete="off">' +
              '<button class="icon-btn" type="button" data-close-search aria-label="Close search">' + I.close + '</button>' +
            '</div>' +
            '<div class="search-hints">' +
              '<span class="search-hints__label">Try</span>' +
              '<button class="chip-btn" type="button" data-suggest="Sauvage">Sauvage</button>' +
              '<button class="chip-btn" type="button" data-suggest="Black Opium">Black Opium</button>' +
              '<button class="chip-btn" type="button" data-suggest="oud">Oud</button>' +
              '<button class="chip-btn" type="button" data-suggest="vanilla">Vanilla</button>' +
              '<button class="chip-btn" type="button" data-suggest="rose">Rose</button>' +
            '</div>' +
            '<div class="search-results" id="searchResults"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* image lightbox (product gallery zoom) */
      '<div class="modal" id="lightbox" role="dialog" aria-label="Product image">' +
        '<div class="modal__scrim" data-close-modal></div>' +
        '<div class="modal__box"><button class="modal__close" type="button" data-close-modal aria-label="Close">' + I.close + '</button>' +
          '<div class="modal__grid"><div class="modal__media" id="lightboxMedia"></div>' +
          '<div class="modal__body" id="lightboxBody"></div></div>' +
        '</div>' +
      '</div>' +

      '<div class="toasts" id="toasts" role="status" aria-live="polite"></div>';
  }

  function mountChrome() {
    var holder = document.createElement('div');
    holder.innerHTML = chromeMarkup();
    while (holder.firstChild) document.body.appendChild(holder.firstChild);
  }

  /* ------------------------------------------------------------- drawer */

  function renderDrawer() {
    var body = qs('#drawerBody');
    var foot = qs('#drawerFoot');
    if (!body || !foot) return;

    var lines = S.lines();

    if (!lines.length) {
      body.innerHTML = '' +
        '<div class="empty">' +
          '<div class="empty__icon">' + I.cart + '</div>' +
          '<h3 class="empty__title">Your cart is empty</h3>' +
          '<p class="muted small">Explore the collection and add something you love.</p>' +
          '<a class="btn mt-5" href="shop.html"><span>Shop the collection</span></a>' +
        '</div>';
      foot.innerHTML = '';
      return;
    }

    body.innerHTML = lines.map(function (l) {
      return '' +
        '<div class="line" data-key="' + l.key + '">' +
          '<a class="line__media" href="' + productUrl(l.product) + '">' + media(l.product) + '</a>' +
          '<div class="line__info">' +
            '<div class="line__brand">' + esc(l.product.brand) + '</div>' +
            '<a class="line__name" href="' + productUrl(l.product) + '">' + esc(l.product.name) + '</a>' +
            '<div class="line__variant">' + esc(l.variantLabel) + '<span class="dot"></span>' + l.item.ml + ' ml</div>' +
            '<div class="qty qty--sm" data-qty="' + l.key + '">' +
              '<button class="qty__btn" type="button" data-step="-1" aria-label="Decrease quantity">' + I.minus + '</button>' +
              '<span class="qty__val">' + l.item.qty + '</span>' +
              '<button class="qty__btn" type="button" data-step="1" aria-label="Increase quantity">' + I.plus + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="line__side">' +
            '<span class="line__price">' + S.money(l.lineTotal) + '</span>' +
            '<button class="line__remove" type="button" data-remove="' + l.key + '">Remove</button>' +
          '</div>' +
        '</div>';
    }).join('');

    var gap = S.freeShippingGap();
    var progress = gap > 0
      ? Math.min(100, Math.round(((S.subtotal() - S.discount()) / CFG.freeShippingOver) * 100))
      : 100;

    foot.innerHTML = '' +
      (gap > 0
        ? '<div class="drawer__progress">' +
            '<p class="drawer__progress-text">You are <strong>' + S.money(gap) + '</strong> away from free delivery</p>' +
            '<div class="bar"><span class="bar__fill" style="width:' + progress + '%"></span></div>' +
          '</div>'
        : '<div class="drawer__progress"><p class="drawer__progress-text">' + I.check +
            ' <strong>Free standard delivery</strong> unlocked</p>' +
            '<div class="bar"><span class="bar__fill" style="width:100%"></span></div></div>') +
      '<div class="drawer__row">' +
        '<span class="drawer__row-label">Subtotal</span>' +
        '<span class="drawer__row-value">' + S.money(S.subtotal() - S.discount()) + '</span>' +
      '</div>' +
      '<a class="btn btn--full" href="checkout.html"><span>Checkout</span></a>' +
      '<a class="btn btn--ghost btn--full mt-2" href="cart.html"><span>View cart</span></a>' +
      '<p class="drawer__note">Taxes and delivery calculated at checkout</p>';
  }

  function openDrawer() {
    renderDrawer();
    document.body.classList.add('drawer-open', 'is-locked');
    var d = qs('#cartDrawer');
    if (d) d.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    document.body.classList.remove('drawer-open');
    if (!document.body.classList.contains('nav-open') && !document.body.classList.contains('search-open')) {
      document.body.classList.remove('is-locked');
    }
    var d = qs('#cartDrawer');
    if (d) d.setAttribute('aria-hidden', 'true');
  }

  /* ------------------------------------------------------------- account */

  function lastOrder() {
    try { return JSON.parse(window.localStorage.getItem('julie.lastOrder') || 'null'); }
    catch (e) { return null; }
  }

  function renderAccount() {
    var body = qs('#accountBody');
    if (!body) return;

    var wished = S.wishlistProducts();
    var order = lastOrder();
    var html = '';

    html += '<div class="account-panel__block">' +
      '<p class="account-panel__label">Saved fragrances</p>';
    if (wished.length) {
      html += '<div class="stack-3">' + wished.slice(0, 4).map(miniLine).join('') + '</div>' +
        (wished.length > 4
          ? '<a class="btn-text mt-4" href="shop.html">View all ' + wished.length + ' ' + I.arrowRight + '</a>'
          : '');
    } else {
      html += '<p class="muted small">Nothing saved yet. Tap the heart on any fragrance and it will wait for you here.</p>';
    }
    html += '</div>';

    html += '<div class="account-panel__block">' +
      '<p class="account-panel__label">Recent order</p>';
    if (order && order.number) {
      html += '<a class="account-order" href="order-confirmation.html?order=' +
        encodeURIComponent(order.number) + '">' +
        '<span class="account-order__row"><span>Order</span><strong>' + esc(order.number) + '</strong></span>' +
        '<span class="account-order__row"><span>Placed</span><span>' + esc(formatDate(order.placedAt || new Date().toISOString())) + '</span></span>' +
        '<span class="account-order__row"><span>Total</span><strong>' + S.money((order.totals && order.totals.total) || 0) + '</strong></span>' +
        '<span class="account-order__row"><span>Delivery to</span><span>' + esc(order.address || '\u2014') + '</span></span>' +
      '</a>';
    } else {
      html += '<p class="muted small">You have not placed an order with this browser yet.</p>';
    }
    html += '</div>';

    html += '<div class="account-panel__block">' +
      '<p class="account-panel__label">Help &amp; shortcuts</p>' +
      '<div class="account-links">' +
        '<a href="contact.html">Client care &amp; contact</a>' +
        '<a href="recreate.html">Request a recreation</a>' +
        '<a href="cart.html">Your cart</a>' +
        '<a href="checkout.html">Checkout</a>' +
      '</div>' +
    '</div>';

    body.innerHTML = html;
  }

  function openAccount() {
    renderAccount();
    closeDrawer(); closeSearch();
    document.body.classList.add('account-open', 'is-locked');
    var p = qs('#accountPanel');
    if (p) p.setAttribute('aria-hidden', 'false');
  }

  function closeAccount() {
    document.body.classList.remove('account-open');
    if (!document.body.classList.contains('drawer-open') &&
        !document.body.classList.contains('nav-open') &&
        !document.body.classList.contains('search-open') &&
        !document.body.classList.contains('modal-open')) {
      document.body.classList.remove('is-locked');
    }
    var p = qs('#accountPanel');
    if (p) p.setAttribute('aria-hidden', 'true');
  }

  function updateCount() {
    var n = S.count();
    qsa('[data-cart-count]').forEach(function (el) {
      el.textContent = n;
      el.classList.toggle('is-on', n > 0);
    });
    var link = qs('[data-cart-link]');
    if (link) link.setAttribute('aria-label', 'Cart, ' + n + ' item' + (n === 1 ? '' : 's'));
  }

  function bumpCount() {
    qsa('[data-cart-count]').forEach(function (el) {
      el.classList.remove('is-bump');
      void el.offsetWidth;
      el.classList.add('is-bump');
      el.classList.add('is-on');
    });
  }

  /* -------------------------------------------------------------- search */

  function scoreProduct(p, q) {
    var hay = (p.brand + ' ' + p.name + ' ' + p.family + ' ' + p.concentration + ' ' +
      [].concat(p.notes.top, p.notes.heart, p.notes.base).join(' ')).toLowerCase();
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    var score = 0;
    words.forEach(function (w) {
      if (p.brand.toLowerCase().indexOf(w) === 0) score += 6;
      if (p.name.toLowerCase().indexOf(w) > -1) score += 5;
      if (hay.indexOf(w) > -1) score += 2;
    });
    return score;
  }

  function searchProducts(q) {
    q = String(q || '').trim();
    if (!q) return [];
    return S.all()
      .map(function (p) { return { p: p, s: scoreProduct(p, q) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 6)
      .map(function (r) { return r.p; });
  }

  function renderSearch(q) {
    var box = qs('#searchResults');
    if (!box) return;
    var results = searchProducts(q);
    if (!q) { box.innerHTML = ''; return; }
    if (!results.length) {
      box.innerHTML = '<p class="muted">No fragrances matched “' + esc(q) + '”.</p>' +
        '<a class="btn-text mt-4" href="shop.html">Browse everything ' + I.arrowRight + '</a>';
      return;
    }
    box.innerHTML = '<p class="search-results__title">' + results.length + ' suggestion' +
      (results.length === 1 ? '' : 's') + '</p>' +
      '<div class="stack-3">' + results.map(miniLine).join('') + '</div>';
  }

  function openSearch() {
    document.body.classList.add('search-open', 'is-locked');
    var input = qs('#searchInput');
    setTimeout(function () { if (input) input.focus(); }, 120);
  }

  function closeSearch() {
    document.body.classList.remove('search-open');
    if (!document.body.classList.contains('drawer-open') && !document.body.classList.contains('nav-open')) {
      document.body.classList.remove('is-locked');
    }
  }

  /* --------------------------------------------------------------- modal */

  function openModal(html) {
    var box = qs('#lightbox');
    if (!box) return;
    qs('#lightboxBody').innerHTML = html;
    document.body.classList.add('modal-open', 'is-locked');
  }

  function closeModal() {
    document.body.classList.remove('modal-open');
    if (!document.body.classList.contains('drawer-open')) document.body.classList.remove('is-locked');
  }

  /* ------------------------------------------------------------ wishlist */

  function syncWishButtons() {
    qsa('[data-wish]').forEach(function (btn) {
      var on = S.inWishlist(btn.getAttribute('data-wish'));
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* -------------------------------------------------------------- header */

  function initHeader() {
    var header = qs('.header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-stuck', window.scrollY > 8);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // announcement rotator
    var items = qsa('.announce__item');
    if (items.length > 1) {
      var i = 0;
      items[0].classList.add('is-active');
      setInterval(function () {
        items[i].classList.remove('is-active');
        i = (i + 1) % items.length;
        items[i].classList.add('is-active');
      }, 4800);
    }
    var bar = qs('.announce');
    var dismissed = false;
    try { dismissed = window.localStorage.getItem('julie.announce.dismissed') === '1'; } catch (e) {}
    if (bar && dismissed) bar.style.display = 'none';

    var closeAnnounce = qs('[data-close-announce]');
    if (closeAnnounce) {
      closeAnnounce.addEventListener('click', function () {
        if (bar) bar.style.display = 'none';
        try { window.localStorage.setItem('julie.announce.dismissed', '1'); } catch (e) {}
      });
    }

    // active nav highlighting
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    qsa('.nav__link, .mobile-nav a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('?')[0].split('#')[0].toLowerCase();
      if (href && href === page) a.setAttribute('aria-current', 'page');
    });
  }

  /* ------------------------------------------------------ delegated binds */

  function initGlobalHandlers() {
    document.addEventListener('click', function (e) {
      var t = e.target;

      var quick = t.closest('[data-quick-add]');
      if (quick) {
        e.preventDefault();
        var p = S.findById(quick.getAttribute('data-quick-add'));
        if (p) {
          var line = S.add(p, { qty: 1 });
          toast(p.brand + ' ' + p.name + ' added to cart', I.checkCircle);
          bumpCount();
          updateCount();
          if (line) openDrawer();
        }
        return;
      }

      var add = t.closest('[data-add]');
      if (add) {
        e.preventDefault();
        var prod = S.findById(add.getAttribute('data-add'));
        if (prod) {
          S.add(prod, {
            variant: add.getAttribute('data-variant') || 'original',
            ml: add.getAttribute('data-ml'),
            qty: add.getAttribute('data-qty') || 1
          });
          toast(prod.name + ' added to cart', I.checkCircle);
          bumpCount();
          updateCount();
          openDrawer();
        }
        return;
      }

      var wish = t.closest('[data-wish]');
      if (wish) {
        e.preventDefault();
        var on = S.toggleWish(wish.getAttribute('data-wish'));
        wish.classList.toggle('is-on', on);
        wish.setAttribute('aria-pressed', on ? 'true' : 'false');
        toast(on ? 'Saved to your wishlist' : 'Removed from your wishlist', I.heart);
        return;
      }

      if (t.closest('[data-open-cart]')) { e.preventDefault(); openDrawer(); return; }
      if (t.closest('[data-close-drawer], .scrim')) { closeDrawer(); closeAccount(); return; }

      if (t.closest('[data-open-account]')) { e.preventDefault(); openAccount(); return; }
      if (t.closest('[data-close-account]')) { closeAccount(); return; }

      if (t.closest('[data-open-search]')) { e.preventDefault(); openSearch(); return; }
      if (t.closest('[data-close-search]')) { closeSearch(); return; }

      var sug = t.closest('[data-suggest]');
      if (sug) {
        e.preventDefault();
        var input = qs('#searchInput');
        if (input) { input.value = sug.getAttribute('data-suggest'); renderSearch(input.value); }
        return;
      }

      if (t.closest('[data-open-nav]')) {
        document.body.classList.add('nav-open', 'is-locked');
        return;
      }
      if (t.closest('[data-close-nav]')) {
        document.body.classList.remove('nav-open');
        if (!document.body.classList.contains('drawer-open')) document.body.classList.remove('is-locked');
        return;
      }

      if (t.closest('[data-close-modal]')) { closeModal(); return; }

      // quantity steppers inside the drawer
      var step = t.closest('.qty__btn[data-step]');
      if (step) {
        e.preventDefault();
        var holder = step.closest('[data-qty]');
        if (!holder) return;
        var key = holder.getAttribute('data-qty');
        var valEl = qs('.qty__val', holder);
        if (!valEl) return;
        var next = Math.max(0, Number(valEl.textContent) + Number(step.getAttribute('data-step')));
        S.setQty(key, next);
        updateCount();
        return;
      }

      var rm = t.closest('[data-remove]');
      if (rm) {
        e.preventDefault();
        S.remove(rm.getAttribute('data-remove'));
        toast('Item removed', I.close);
        updateCount();
        return;
      }
    });

    // search input
    var input = qs('#searchInput');
    if (input) {
      var t0;
      input.addEventListener('input', function () {
        clearTimeout(t0);
        var v = input.value;
        t0 = setTimeout(function () { renderSearch(v); }, 140);
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var results = searchProducts(input.value);
          if (results.length) location.href = productUrl(results[0]);
          else location.href = 'shop.html?q=' + encodeURIComponent(input.value);
        }
      });
    }

    // escape closes everything
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeDrawer(); closeSearch(); closeModal(); closeAccount();
      document.body.classList.remove('nav-open');
      document.body.classList.remove('is-locked');
    });

    // keep every instance of the cart badge in sync
    S.on('change', function () {
      updateCount();
      renderDrawer();
      if (document.body.classList.contains('account-open')) renderAccount();
    });
  }

  /* ---------------------------------------------------------- accordions */

  function initAccordions(root) {
    qsa('.acc__head', root).forEach(function (head) {
      if (head.dataset.bound) return;
      head.dataset.bound = '1';
      head.addEventListener('click', function () {
        var item = head.closest('.acc__item');
        var open = item.classList.contains('is-open');
        item.classList.toggle('is-open', !open);
        head.setAttribute('aria-expanded', String(!open));
      });
    });
  }

  /* ------------------------------------------------------ simple helpers */

  function bindFilterGroups(root) {
    qsa('.fgroup__head', root).forEach(function (head) {
      head.addEventListener('click', function () {
        head.closest('.fgroup').classList.toggle('is-open');
      });
    });
  }

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /* --------------------------------------------------------------- boot */

  /** Mega menu of houses, shared by every page's header. */
  function initMega() {
    var mega = qs('#megaBrands');
    if (!mega) return;
    var houses = S.brands();
    var columns = 3;
    var per = Math.ceil(houses.length / columns);
    var headings = ['Designer houses', 'More houses', 'And more'];
    var html = '';
    for (var c = 0; c < columns; c++) {
      html += '<div><p class="mega__title">' + headings[c] + '</p>';
      houses.slice(c * per, (c + 1) * per).forEach(function (b) {
        html += '<a class="mega__link" href="shop.html?brand=' +
          encodeURIComponent(b) + '">' + esc(b) + '</a>';
      });
      html += '</div>';
    }
    mega.innerHTML = html;
  }

  function initYear() {
    qsa('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /**
   * Fill in counts that would otherwise be hard-coded and drift out of date
   * as the catalogue changes.
   *   data-gender-count="women"  -> "29 fragrances"
   *   data-stat="houses"         -> "37"
   *   data-count-from="houses"   -> sets data-count so the GSAP counter animates
   */
  function initStats() {
    var value = function (key) {
      if (key === 'houses') return S.brands().length;
      if (key === 'products') return S.all().length;
      if (key === 'recreatable') return S.all().filter(function (p) { return !!p.recreate; }).length;
      return null;
    };

    qsa('[data-gender-count]').forEach(function (el) {
      var n = S.byGender(el.getAttribute('data-gender-count')).length;
      el.textContent = n + ' fragrance' + (n === 1 ? '' : 's');
    });

    qsa('[data-stat]').forEach(function (el) {
      var v = value(el.getAttribute('data-stat'));
      if (v != null) el.textContent = v;
    });

    qsa('[data-count-from]').forEach(function (el) {
      var v = value(el.getAttribute('data-count-from'));
      if (v != null) {
        el.setAttribute('data-count', v);
        el.textContent = v;
      }
    });
  }

  function boot() {
    mountChrome();
    initHeader();
    initGlobalHandlers();
    initAccordions(document);
    initMega();
    initYear();
    initStats();
    renderAccount();
    syncWishButtons();
    updateCount();
    renderDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.UI = {
    icons: I,
    esc: esc,
    qs: qs,
    qsa: qsa,
    stars: stars,
    tile: tile,
    media: media,
    card: card,
    miniLine: miniLine,
    productUrl: productUrl,
    imageUrl: imageUrl,
    toast: toast,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    openAccount: openAccount,
    closeAccount: closeAccount,
    renderAccount: renderAccount,
    openSearch: openSearch,
    closeSearch: closeSearch,
    openModal: openModal,
    closeModal: closeModal,
    updateCount: updateCount,
    renderDrawer: renderDrawer,
    renderSearch: renderSearch,
    searchProducts: searchProducts,
    syncWishButtons: syncWishButtons,
    initAccordions: initAccordions,
    bindFilterGroups: bindFilterGroups,
    formatDate: formatDate
  };
})();
