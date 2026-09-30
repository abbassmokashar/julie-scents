/* ==========================================================================
   JULIE SCENTS — ORDER CONFIRMATION
   Reads the order record written by checkout.js and lays out the receipt.
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

    var order = null;
    try {
      var raw = window.localStorage.getItem('julie.lastOrder');
      if (raw) order = JSON.parse(raw);
    } catch (e) { /* localStorage unavailable */ }
    if (!order && window.__julieLastOrder) order = window.__julieLastOrder;

    var numberFromUrl = new URLSearchParams(location.search).get('order');

    /* ------------------------------------------------------ no order yet */
    if (!order) {
      var root = qs('#confirmRoot');
      if (root) {
        root.innerHTML = '' +
          '<h1>No recent order found</h1>' +
          '<p class="lede" style="margin-inline:auto">This demo keeps your order in the browser only, ' +
          'so opening this page directly will not show a receipt.</p>' +
          '<a class="btn mt-6" href="shop.html"><span>Shop the collection</span></a>';
      }
      var lines = qs('#orderLines');
      if (lines) lines.innerHTML = '';
      var rel = qs('#relatedSection');
      if (rel) rel.hidden = true;
      return;
    }

    var number = order.number || numberFromUrl || 'JS-000000';

    /* ------------------------------------------------------------ header */
    var setText = function (sel, value) {
      var el = qs(sel);
      if (el) el.textContent = value;
    };

    setText('#orderNumber', number);
    setText('#orderAddress', order.address || '—');
    setText('#orderEmail', order.email || '—');
    setText('#orderMethod', (order.method || 'Standard delivery') + (order.gift ? ' · gift wrapped' : ''));
    setText('#orderDate', 'Placed ' + UI.formatDate(order.placedAt || new Date().toISOString()));
    setText('#orderCard', order.payment || 'Cash on delivery');

    var notePanel = qs('#giftNotePanel');
    if (notePanel && order.giftNote) {
      notePanel.hidden = false;
      setText('#orderGiftNote', order.giftNote);
    }

    /* ------------------------------------------------------------- lines */
    var host = qs('#orderLines');
    var count = order.lines.reduce(function (n, l) { return n + l.qty; }, 0);
    setText('#orderCount', count + ' item' + (count === 1 ? '' : 's'));

    if (host) {
      host.innerHTML = order.lines.map(function (l) {
        var p = S.findBySlug(l.slug);
        return '' +
          '<div class="line">' +
            '<span class="line__media">' + (p ? UI.media(p) : '') + '</span>' +
            '<div class="line__info">' +
              '<div class="line__brand">' + esc(l.brand) + '</div>' +
              '<div class="line__name">' + esc(l.name) + '</div>' +
              '<div class="line__variant">' + esc(l.variant) + '<span class="dot"></span>' + l.ml +
                ' ml<span class="dot"></span>×' + l.qty + '</div>' +
            '</div>' +
            '<div class="line__side"><span class="line__price">' + S.money(l.lineTotal) + '</span></div>' +
          '</div>';
      }).join('');
    }

    /* ------------------------------------------------------------ totals */
    var t = order.totals || {};
    setText('#sumSub', S.money(t.sub || 0));
    setText('#sumShip', (t.ship ? S.money(t.ship) : 'Free'));
    setText('#sumTax', S.money(t.tax || 0));
    setText('#sumTotal', S.money(t.total || 0));
    setText('#sumShipLabel', order.method || 'Delivery');

    var discountRow = qs('#sumDiscountRow');
    if (discountRow && t.disc > 0) {
      discountRow.hidden = false;
      setText('#sumDiscountLabel', 'Discount' + (order.coupon ? ' (' + order.coupon.code + ')' : ''));
      var d = qs('#sumDiscount');
      if (d) d.innerHTML = '&minus;' + S.money(t.disc);
    }

    var giftRow = qs('#sumGiftRow');
    if (giftRow && t.gift > 0) {
      giftRow.hidden = false;
      setText('#sumGift', S.money(t.gift));
    }

    /* ----------------------------------------------------------- related */
    var relatedGrid = qs('#relatedGrid');
    if (relatedGrid) {
      var purchased = {};
      order.lines.forEach(function (l) { purchased[l.slug] = true; });
      var picks = S.bestSellers(16).filter(function (p) { return !purchased[p.slug]; }).slice(0, 4);
      relatedGrid.innerHTML = picks.map(UI.card).join('');
      UI.syncWishButtons();
    }

    document.title = 'Order ' + number + ' confirmed — Julie Scents';
  });
})();
