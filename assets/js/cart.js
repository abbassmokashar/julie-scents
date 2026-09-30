/* ==========================================================================
   JULIE SCENTS — CART PAGE
   Full line items, quantity control, coupons, delivery meter and summary.
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

    var panel = qs('#cartPanel');
    var summary = qs('#cartSummary');
    var cross = qs('#crossSell');
    if (!panel) return;

    var METHOD = 'standard';

    /* ------------------------------------------------------------ render */

    function render() {
      var lines = S.lines();

      if (!lines.length) {
        panel.innerHTML = '' +
          '<div class="empty" style="padding-block:4rem">' +
            '<div class="empty__icon">' + I.cart + '</div>' +
            '<h2 class="empty__title">Your cart is empty</h2>' +
            '<p class="muted">Nothing here yet. Browse the collection and add something you love.</p>' +
            '<a class="btn mt-5" href="shop.html"><span>Shop the collection</span></a>' +
          '</div>';
        if (summary) {
          summary.innerHTML = '' +
            '<div class="panel">' +
              '<div class="panel__head"><h2 class="panel__title">Order summary</h2></div>' +
              '<div class="sum-row"><span>Subtotal</span><strong>' + S.money(0) + '</strong></div>' +
              '<div class="sum-row"><span>Delivery</span><strong>—</strong></div>' +
              '<div class="sum-row sum-row--total"><span>Total</span><span class="amount">' + S.money(0) + '</span></div>' +
              '<a class="btn btn--full mt-5" href="shop.html"><span>Start shopping</span></a>' +
            '</div>';
        }
        if (cross) cross.innerHTML = '';
        return;
      }

      panel.innerHTML = '' +
        '<div class="panel__head">' +
          '<h2 class="panel__title">' + S.count() + ' item' + (S.count() === 1 ? '' : 's') + '</h2>' +
          '<a class="btn-text" href="shop.html">Continue shopping ' + I.arrowRight + '</a>' +
        '</div>' +
        lines.map(lineMarkup).join('');

      renderSummary();
      renderCross();
      UI.syncWishButtons();
    }

    function lineMarkup(l) {
      var was = null;
      if (l.item.variant === 'recreate') {
        var idx = l.product.sizes.filter(function (s) { return s.ml === l.item.ml; })[0];
        if (idx) was = idx.price * l.item.qty;
      }
      return '' +
        '<div class="line" data-key="' + l.key + '">' +
          '<a class="line__media" href="' + UI.productUrl(l.product) + '">' + UI.media(l.product) + '</a>' +
          '<div class="line__info">' +
            '<div class="line__brand">' + esc(l.product.brand) + '</div>' +
            '<a class="line__name" href="' + UI.productUrl(l.product) + '">' + esc(l.product.name) + '</a>' +
            '<div class="line__variant">' + esc(l.variantLabel) + '<span class="dot"></span>' + l.item.ml + ' ml' +
              '<span class="dot"></span>' + esc(l.product.family) + '</div>' +
            '<div class="qty" data-qty="' + l.key + '">' +
              '<button class="qty__btn" type="button" data-step="-1" aria-label="Decrease quantity">' + I.minus + '</button>' +
              '<span class="qty__val">' + l.item.qty + '</span>' +
              '<button class="qty__btn" type="button" data-step="1" aria-label="Increase quantity">' + I.plus + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="line__side">' +
            '<span class="line__price">' +
              (was ? '<del>' + S.money(was) + '</del>' : '') + S.money(l.lineTotal) +
            '</span>' +
            '<button class="line__remove" type="button" data-remove="' + l.key + '">Remove</button>' +
          '</div>' +
        '</div>';
    }

    function renderSummary() {
      if (!summary) return;

      var sub = S.subtotal();
      var disc = S.discount();
      var ship = S.shippingCost(METHOD);
      var tax = S.tax(METHOD);
      var total = S.total(METHOD);
      var coupon = S.coupon();
      var gap = S.freeShippingGap();

      summary.innerHTML = '' +
        '<div class="panel">' +
          '<div class="panel__head"><h2 class="panel__title">Order summary</h2></div>' +

          (gap > 0
            ? '<div class="ship-meter">' +
                '<p class="ship-meter__text">Add <strong>' + S.money(gap) + '</strong> more for free delivery</p>' +
                '<div class="bar"><span class="bar__fill" style="width:' +
                  Math.min(100, Math.round(((sub - disc) / window.JULIE_CONFIG.freeShippingOver) * 100)) + '%"></span></div>' +
              '</div>'
            : '<div class="ship-meter">' +
                '<p class="ship-meter__text">' + I.check + ' <strong>Free delivery</strong> unlocked</p>' +
                '<div class="bar"><span class="bar__fill" style="width:100%"></span></div>' +
              '</div>') +

          '<div class="sum-row"><span>Subtotal</span><strong>' + S.money(sub) + '</strong></div>' +
          (disc > 0
            ? '<div class="sum-row sum-row--save"><span>Discount' +
                (coupon ? ' (' + esc(coupon.code) + ')' : '') + '</span><strong>&minus;' + S.money(disc) + '</strong></div>'
            : '') +
          '<div class="sum-row"><span>Delivery</span><strong>' + (ship === 0 ? 'Free' : S.money(ship)) + '</strong></div>' +
          '<div class="sum-row"><span>Estimated tax</span><strong>' + S.money(tax) + '</strong></div>' +
          '<div class="sum-row sum-row--total"><span>Total</span><span class="amount">' + S.money(total) + '</span></div>' +

          '<form class="coupon" id="couponForm">' +
            '<label class="sr-only" for="couponInput">Discount code</label>' +
            '<input class="input" id="couponInput" type="text" placeholder="Discount code" autocomplete="off"' +
              (coupon ? ' value="' + esc(coupon.code) + '"' : '') + '>' +
            (coupon
              ? '<button class="btn btn--ghost btn--sm" type="button" id="removeCoupon"><span>Remove</span></button>'
              : '<button class="btn btn--sm" type="submit"><span>Apply</span></button>') +
          '</form>' +
          '<p class="coupon-msg" id="couponMsg"></p>' +

          '<a class="btn btn--full mt-4" href="checkout.html"><span>Proceed to checkout</span></a>' +
          '<p class="small muted mt-4">Taxes and delivery are confirmed at checkout. Try ' +
            '<strong>WELCOME10</strong> for 10% off.</p>' +

          '<div class="assurances mt-5">' +
            '<div class="assurance">' + I.shield + '<span>Secure 256-bit encrypted checkout</span></div>' +
            '<div class="assurance">' + I.clock + '<span>8&ndash;12 hour longevity guarantee</span></div>' +
            '<div class="assurance">' + I.truck + '<span>Free returns within 30 days</span></div>' +
          '</div>' +
        '</div>';

      var form = qs('#couponForm');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var input = qs('#couponInput');
          var res = S.applyCoupon(input ? input.value : '');
          var msg = qs('#couponMsg');
          if (msg) {
            msg.textContent = res.message;
            msg.className = 'coupon-msg ' + (res.ok ? 'ok' : 'bad');
          }
          if (res.ok) {
            UI.toast(res.message, I.checkCircle);
            setTimeout(render, 450);
          }
        });
      }

      var rm = qs('#removeCoupon');
      if (rm) {
        rm.addEventListener('click', function () {
          S.removeCoupon();
          UI.toast('Discount removed', I.close);
          render();
        });
      }
    }

    function renderCross() {
      if (!cross) return;
      var inCart = S.lines().map(function (l) { return l.product.id; });
      var picks = S.bestSellers(12).filter(function (p) {
        return inCart.indexOf(p.id) === -1;
      }).slice(0, 4);
      if (!picks.length) { cross.innerHTML = ''; return; }

      cross.innerHTML = '' +
        '<div class="section-head" style="margin-bottom:1.25rem">' +
          '<div class="section-head__title">' +
            '<p class="eyebrow">Complete the wardrobe</p>' +
            '<h2 class="mt-2" style="font-size:clamp(1.4rem,2.4vw,2rem)">Goes well with</h2>' +
          '</div>' +
        '</div>' +
        '<div class="grid-products grid-products--4">' + picks.map(UI.card).join('') + '</div>';
      UI.syncWishButtons();
    }

    /* -------------------------------------------------------- interactions */

    panel.addEventListener('click', function (e) {
      var step = e.target.closest('.qty__btn[data-step]');
      if (step) {
        var holder = step.closest('[data-qty]');
        var valEl = qs('.qty__val', holder);
        var next = Math.max(0, Number(valEl.textContent) + Number(step.getAttribute('data-step')));
        S.setQty(holder.getAttribute('data-qty'), next);
        if (next === 0) UI.toast('Item removed', I.close);
        return;
      }

      var rm = e.target.closest('[data-remove]');
      if (rm) {
        S.remove(rm.getAttribute('data-remove'));
        UI.toast('Item removed', I.close);
        return;
      }
    });

    // re-render whenever the store changes (drawer edits included)
    S.on('change', render);

    render();
  });
})();
