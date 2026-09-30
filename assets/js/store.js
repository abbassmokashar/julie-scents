/* ==========================================================================
   JULIE SCENTS — STORE
   Cart, wishlist, coupons and money maths. State lives in localStorage so the
   flow survives page changes, and every mutation emits 'change' so the UI can
   re-render from one place.
   ========================================================================== */

(function () {
  'use strict';

  var CFG = window.JULIE_CONFIG;
  var PRODUCTS = window.JULIE_PRODUCTS || [];

  var CART_KEY = 'julie.cart.v1';
  var WISH_KEY = 'julie.wishlist.v1';
  var COUP_KEY = 'julie.coupon.v1';

  /* ---------------------------------------------------------- storage */

  var memory = {};          // fallback when localStorage is unavailable
  var canPersist = (function () {
    try {
      var k = '__julie_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  })();

  function read(key, fallback) {
    try {
      var raw = canPersist ? window.localStorage.getItem(key) : memory[key];
      if (!raw) return fallback;
      var val = JSON.parse(raw);
      return val == null ? fallback : val;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      var raw = JSON.stringify(value);
      if (canPersist) window.localStorage.setItem(key, raw);
      else memory[key] = raw;
    } catch (e) {
      memory[key] = JSON.stringify(value);
    }
  }

  /* ------------------------------------------------------------ events */

  var listeners = {};

  function on(evt, fn) {
    (listeners[evt] = listeners[evt] || []).push(fn);
    return function off() {
      listeners[evt] = listeners[evt].filter(function (f) { return f !== fn; });
    };
  }

  function emit(evt, detail) {
    (listeners[evt] || []).forEach(function (fn) {
      try { fn(detail); } catch (e) { console.error(e); }
    });
  }

  /* ----------------------------------------------------------- helpers */

  function all() { return PRODUCTS; }

  function findById(id) {
    id = Number(id);
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }

  function findBySlug(slug) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
    return null;
  }

  function money(value) {
    var n = Number(value) || 0;
    var s = n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return CFG.currencySymbol + s;
  }

  /** Lowest available price for a product, used for "from $x" labels. */
  function fromPrice(product) {
    var min = null;
    (product.sizes || []).forEach(function (s) {
      if (min === null || s.price < min) min = s.price;
    });
    return min === null ? 0 : min;
  }

  /** Price of one unit for a given variant + size. */
  function unitPrice(product, variant, ml) {
    ml = Number(ml);
    if (variant === 'recreate' && product.recreate) {
      var idx = product.recreate.ml.indexOf(ml);
      if (idx > -1) return product.recreate.price[idx];
    }
    var size = (product.sizes || []).filter(function (s) { return s.ml === ml; })[0];
    if (size) return size.price;
    var first = (product.sizes || [])[0];
    return first ? first.price : 0;
  }

  /** Sizes available for a variant, normalised to [{ml, price}]. */
  function sizesFor(product, variant) {
    if (variant === 'recreate' && product.recreate) {
      return product.recreate.ml.map(function (ml, i) {
        return { ml: ml, price: product.recreate.price[i] };
      });
    }
    return (product.sizes || []).slice();
  }

  function variantLabel(variant) {
    return variant === 'recreate' ? 'Julie Scents Recreate' : 'Original Bottle';
  }

  /** Stable identity for a cart line. */
  function lineKey(item) {
    return item.id + ':' + item.variant + ':' + item.ml;
  }

  /* -------------------------------------------------------------- cart */

  var cart = read(CART_KEY, []);
  var wishlist = read(WISH_KEY, []);
  var coupon = read(COUP_KEY, null);

  // Drop anything that no longer exists in the catalogue.
  cart = cart.filter(function (it) { return !!findById(it.id); });
  wishlist = wishlist.filter(function (id) { return !!findById(id); });

  /** Expand a stored line into everything the UI needs to draw it. */
  function resolve(item) {
    var product = findById(item.id);
    if (!product) return null;
    product = Object.assign({}, product, { price: fromPrice(product) });
    var price = unitPrice(product, item.variant, item.ml);
    return {
      key: lineKey(item),
      item: item,
      product: product,
      price: price,
      lineTotal: price * item.qty,
      variantLabel: variantLabel(item.variant),
      sizes: sizesFor(product, item.variant)
    };
  }

  function lines() {
    return cart.map(resolve).filter(Boolean);
  }

  function save() {
    write(CART_KEY, cart);
    emit('change', { cart: cart, coupon: coupon });
  }

  function add(product, opts) {
    opts = opts || {};
    var variant = opts.variant === 'recreate' && product.recreate ? 'recreate' : 'original';
    var sizes = sizesFor(product, variant);
    var ml = Number(opts.ml) || (sizes[0] ? sizes[0].ml : null);
    var qty = Math.max(1, Number(opts.qty) || 1);
    if (!ml) return null;

    var key = lineKey({ id: product.id, variant: variant, ml: ml });
    var found = null;
    for (var i = 0; i < cart.length; i++) {
      if (lineKey(cart[i]) === key) { found = cart[i]; break; }
    }
    if (found) found.qty += qty;
    else cart.push({ id: product.id, variant: variant, ml: ml, qty: qty });

    save();
    return resolve({ id: product.id, variant: variant, ml: ml, qty: qty });
  }

  function remove(key) {
    cart = cart.filter(function (it) { return lineKey(it) !== key; });
    save();
  }

  function setQty(key, qty) {
    qty = Number(qty);
    if (qty <= 0) return remove(key);
    cart.forEach(function (it) { if (lineKey(it) === key) it.qty = Math.min(qty, 99); });
    save();
  }

  function clear() {
    cart = [];
    coupon = null;
    write(COUP_KEY, null);
    save();
  }

  function count() {
    return cart.reduce(function (n, it) { return n + it.qty; }, 0);
  }

  /* ----------------------------------------------------------- coupons */

  function applyCoupon(code) {
    code = String(code || '').trim().toUpperCase();
    if (!code) return { ok: false, message: 'Enter a code' };
    var pct = (CFG.coupons || {})[code];
    if (!pct) return { ok: false, message: 'That code is not valid' };
    coupon = { code: code, percent: pct };
    write(COUP_KEY, coupon);
    save();
    return { ok: true, message: code + ' applied — ' + pct + '% off' };
  }

  function removeCoupon() {
    coupon = null;
    write(COUP_KEY, null);
    save();
  }

  /* ------------------------------------------------------------ totals */

  function subtotal() {
    return lines().reduce(function (n, l) { return n + l.lineTotal; }, 0);
  }

  function discount() {
    if (!coupon) return 0;
    return round2(subtotal() * (coupon.percent / 100));
  }

  /**
   * Shipping. Methods line up with the checkout options; standard shipping is
   * free once the order clears the configured threshold.
   */
  var SHIPPING_METHODS = [
    { id: 'standard', name: 'Standard delivery', note: '3–5 business days', price: CFG.shippingFlat },
    { id: 'express', name: 'Express delivery', note: '1–2 business days', price: 22 },
    { id: 'pickup', name: 'Boutique pickup', note: 'Ready in 4 hours', price: 0 }
  ];

  function shippingCost(methodId) {
    var net = subtotal() - discount();
    if (net <= 0) return 0;
    var method = SHIPPING_METHODS.filter(function (m) { return m.id === methodId; })[0] || SHIPPING_METHODS[0];
    if (method.id === 'pickup') return 0;
    if (method.id === 'standard' && net >= CFG.freeShippingOver) return 0;
    return method.price;
  }

  function tax(methodId) {
    var net = subtotal() - discount() + shippingCost(methodId);
    return round2(Math.max(0, net) * CFG.taxRate);
  }

  function total(methodId) {
    var t = subtotal() - discount() + shippingCost(methodId) + tax(methodId);
    return round2(Math.max(0, t));
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  /** How much more to spend to unlock free standard shipping. */
  function freeShippingGap() {
    var gap = CFG.freeShippingOver - (subtotal() - discount());
    return gap > 0 ? round2(gap) : 0;
  }

  /* ---------------------------------------------------------- wishlist */

  function inWishlist(id) { return wishlist.indexOf(Number(id)) > -1; }

  function toggleWish(id) {
    id = Number(id);
    var i = wishlist.indexOf(id);
    if (i > -1) wishlist.splice(i, 1);
    else wishlist.push(id);
    write(WISH_KEY, wishlist);
    emit('wishlist', { wishlist: wishlist.slice() });
    return inWishlist(id);
  }

  function wishlistProducts() {
    return wishlist.map(findById).filter(Boolean);
  }

  /* ------------------------------------------------------- collections */

  function byGender(g) { return PRODUCTS.filter(function (p) { return p.gender === g; }); }

  function isOnSale(p) {
    // A product counts as on sale when its recreation undercuts the original
    // by more than 60%, which is the house margin story on this demo.
    if (!p.recreate) return false;
    var orig = fromPrice(p);
    return orig > 0 && p.recreate.price[0] / orig < 0.4;
  }

  function salePrice(p) { return p.recreate ? p.recreate.price[0] : null; }

  function bestSellers(n) {
    return PRODUCTS.slice()
      .sort(function (a, b) { return (b.reviews || 0) - (a.reviews || 0); })
      .slice(0, n || 8);
  }

  function newIn(n) {
    return PRODUCTS.slice()
      .sort(function (a, b) { return b.id - a.id; })
      .slice(0, n || 8);
  }

  function related(product, n) {
    n = n || 4;
    var pool = PRODUCTS.filter(function (p) {
      return p.id !== product.id && (p.brand === product.brand || p.family === product.family);
    });
    if (pool.length < n) {
      PRODUCTS.forEach(function (p) {
        if (p.id !== product.id && pool.indexOf(p) === -1 && pool.length < n) pool.push(p);
      });
    }
    return pool.slice(0, n);
  }

  function brands() {
    var seen = {};
    PRODUCTS.forEach(function (p) { seen[p.brand] = true; });
    return Object.keys(seen).sort();
  }

  /*
   * Canonical fragrance families, used for the shop filter.
   * Each product keeps its descriptive `family` string ("Fresh Woody"), but
   * the filter groups those 46 variations into eight buckets so the rail stays
   * short and actually useful. Order matters: the first match wins, and the
   * order is chosen so a blend's dominant character is what it lands on.
   */
  var FAMILY_BUCKETS = [
    { id: 'Gourmand', test: /gourmand|sweet|tropical/i },
    { id: 'Amber & Oriental', test: /oriental|amber/i },
    { id: 'Leather & Chypre', test: /leather|chypre/i },
    { id: 'Woody', test: /woody|wood|oud|iris|sandal/i },
    { id: 'Floral', test: /floral|bouquet|aldehyde/i },
    { id: 'Fresh & Citrus', test: /fresh|citrus|aquatic|aromatic|foug/i },
    { id: 'Spicy', test: /spic/i },
    { id: 'Musk', test: /musk/i }
  ];

  function familyGroup(p) {
    var f = p.family || '';
    for (var i = 0; i < FAMILY_BUCKETS.length; i++) {
      if (FAMILY_BUCKETS[i].test.test(f)) return FAMILY_BUCKETS[i].id;
    }
    return 'Other';
  }

  function familyGroups() {
    var seen = {};
    PRODUCTS.forEach(function (p) { seen[familyGroup(p)] = true; });
    var out = FAMILY_BUCKETS.map(function (b) { return b.id; })
      .filter(function (id) { return seen[id]; });
    if (seen['Other']) out.push('Other');
    return out;
  }

  /* Every distinct descriptive family, for display purposes. */
  function families() {
    var seen = {};
    PRODUCTS.forEach(function (p) { seen[p.family] = true; });
    return Object.keys(seen).sort();
  }

  /* --------------------------------------------------------------- api */

  window.Store = {
    all: all,
    findById: findById,
    findBySlug: findBySlug,
    money: money,
    fromPrice: fromPrice,
    unitPrice: unitPrice,
    sizesFor: sizesFor,
    variantLabel: variantLabel,
    lineKey: lineKey,

    lines: lines,
    resolve: resolve,
    add: add,
    remove: remove,
    setQty: setQty,
    clear: clear,
    count: count,

    applyCoupon: applyCoupon,
    removeCoupon: removeCoupon,
    coupon: function () { return coupon; },

    subtotal: subtotal,
    discount: discount,
    shippingCost: shippingCost,
    tax: tax,
    total: total,
    /* Returns the available delivery methods (a copy, so callers cannot mutate
       the definition). Call it: Store.shippingMethods(). */
    shippingMethods: function () { return SHIPPING_METHODS.slice(); },
    freeShippingGap: freeShippingGap,

    inWishlist: inWishlist,
    toggleWish: toggleWish,
    wishlistProducts: wishlistProducts,

    byGender: byGender,
    isOnSale: isOnSale,
    bestSellers: bestSellers,
    newIn: newIn,
    related: related,
    brands: brands,
    families: families,
    familyGroup: familyGroup,
    familyGroups: familyGroups,

    on: on,
    emit: emit
  };
})();
