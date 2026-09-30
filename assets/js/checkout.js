/* ==========================================================================
   JULIE SCENTS — CHECKOUT
   Three steps (information, delivery, payment) with inline validation, a live
   order summary and a demo order record handed to the confirmation page.
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
    var qsa = UI.qsa;
    var esc = UI.esc;
    var I = UI.icons;

    var summary = qs('#coSummary');
    if (!summary) return;

    var GIFT_PRICE = 6;

    var state = {
      step: 1,
      method: 'standard',
      gift: false,
      giftNote: ''
    };

    /* Payment is always settled in person: cash to the courier, or at the
       counter when the client collects the order from the boutique. */
    var PAYMENTS = {
      standard: { id: 'cod', name: 'Cash on delivery', stamp: 'On delivery',
        note: 'Pay the courier in cash when your order arrives.' },
      express: { id: 'cod', name: 'Cash on delivery', stamp: 'On delivery',
        note: 'Pay the courier in cash when your order arrives.' },
      pickup: { id: 'pickup', name: 'Pay at the boutique', stamp: 'At pickup',
        note: 'Settle the balance at the counter when you collect your order.' }
    };

    function payment() {
      return PAYMENTS[state.method] || PAYMENTS.standard;
    }

    /* --------------------------------------------------------- empty cart */
    if (!S.lines().length) {
      qsa('.step-panel').forEach(function (p) { p.classList.remove('is-active'); });
      var bar = qs('#stepsBar');
      if (bar) bar.style.display = 'none';
      var empty = qs('#checkoutEmpty');
      if (empty) {
        empty.classList.add('step-panel', 'is-active');
        empty.innerHTML = '' +
          '<div class="empty" style="padding-block:5rem">' +
            '<div class="empty__icon">' + I.cart + '</div>' +
            '<h1 class="empty__title">There is nothing to check out</h1>' +
            '<p class="muted">Add a fragrance to your cart and the checkout will open right up.</p>' +
            '<a class="btn mt-5" href="shop.html"><span>Shop the collection</span></a>' +
          '</div>';
      }
      if (summary) summary.innerHTML = '';
      return;
    }

    /* ------------------------------------------------------------- totals */

    function totals() {
      var sub = S.subtotal();
      var disc = S.discount();
      var ship = S.shippingCost(state.method);
      var gift = state.gift ? GIFT_PRICE : 0;
      var tax = S.tax(state.method);
      var total = Math.round((sub - disc + ship + gift + tax) * 100) / 100;
      return { sub: sub, disc: disc, ship: ship, gift: gift, tax: tax, total: total };
    }

    /* ----------------------------------------------------- order summary */

    function renderSummary() {
      var t = totals();
      var coupon = S.coupon();
      var gap = S.freeShippingGap();

      summary.innerHTML = '' +
        '<div class="panel">' +
          '<div class="panel__head"><h2 class="panel__title">Your order</h2>' +
            '<span class="small muted">' + S.count() + ' item' + (S.count() === 1 ? '' : 's') + '</span>' +
          '</div>' +

          '<div class="mini-lines">' +
            S.lines().map(function (l) {
              return '<div class="mini-line">' +
                '<span class="mini-line__media">' + UI.media(l.product) + '</span>' +
                '<span>' +
                  '<span class="mini-line__name">' + esc(l.product.name) + '</span>' +
                  '<span class="mini-line__variant">' + esc(l.variantLabel) + ' · ' + l.item.ml + ' ml · ×' + l.item.qty + '</span>' +
                '</span>' +
                '<span class="mini-line__price">' + S.money(l.lineTotal) + '</span>' +
              '</div>';
            }).join('') +
          '</div>' +

          '<div class="mt-5" style="border-top:1px solid var(--line);padding-top:1rem">' +
            (gap > 0
              ? '<div class="ship-meter"><p class="ship-meter__text">Add <strong>' + S.money(gap) +
                  '</strong> for free standard delivery</p></div>'
              : '<div class="ship-meter"><p class="ship-meter__text">' + I.check +
                  ' <strong>Free standard delivery</strong> unlocked</p></div>') +

            '<div class="sum-row"><span>Subtotal</span><strong>' + S.money(t.sub) + '</strong></div>' +
            (t.disc > 0 ? '<div class="sum-row sum-row--save"><span>Discount' +
              (coupon ? ' (' + esc(coupon.code) + ')' : '') + '</span><strong>&minus;' + S.money(t.disc) + '</strong></div>' : '') +
            '<div class="sum-row"><span>' + methodName() + '</span><strong>' +
              (t.ship === 0 ? 'Free' : S.money(t.ship)) + '</strong></div>' +
            (t.gift ? '<div class="sum-row"><span>Gift wrapping</span><strong>' + S.money(t.gift) + '</strong></div>' : '') +
            (t.gift && state.giftNote
              ? '<div class="sum-row"><span>Handwritten note</span><span class="small">' + esc(state.giftNote) + '</span></div>'
              : '') +
            '<div class="sum-row"><span>Estimated tax</span><strong>' + S.money(t.tax) + '</strong></div>' +
            '<div class="sum-row sum-row--total"><span>Total</span><span class="amount">' + S.money(t.total) + '</span></div>' +
          '</div>' +

          '<form class="coupon" id="coCoupon">' +
            '<label class="sr-only" for="coCouponInput">Discount code</label>' +
            '<input class="input" id="coCouponInput" placeholder="Discount code" value="' +
              (coupon ? esc(coupon.code) : '') + '" autocomplete="off">' +
            '<button class="btn btn--sm" type="submit"><span>Apply</span></button>' +
          '</form>' +
          '<p class="coupon-msg" id="coCouponMsg"></p>' +

          '<div class="assurances mt-5">' +
            '<div class="assurance">' + I.shield + '<span>No card needed &mdash; ' + esc(payment().name.toLowerCase()) + '</span></div>' +
            '<div class="assurance">' + I.clock + '<span>8&ndash;12 hour longevity guarantee</span></div>' +
            '<div class="assurance">' + I.truck + '<span>Dispatched within 24 hours</span></div>' +
          '</div>' +
        '</div>';

      var form = qs('#coCoupon');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var res = S.applyCoupon(qs('#coCouponInput').value);
          var msg = qs('#coCouponMsg');
          msg.textContent = res.message;
          msg.className = 'coupon-msg ' + (res.ok ? 'ok' : 'bad');
          if (res.ok) { UI.toast(res.message, I.checkCircle); renderSummary(); }
        });
      }
    }

    function methodName() {
      var m = S.shippingMethods().filter(function (x) { return x.id === state.method; })[0];
      return m ? m.name : 'Delivery';
    }

    /* --------------------------------------------------------- step logic */

    function setStep(n) {
      state.step = n;
      qsa('.step-panel').forEach(function (p) {
        p.classList.toggle('is-active', Number(p.getAttribute('data-step')) === n);
      });
      qsa('[data-step-indicator]').forEach(function (el) {
        var i = Number(el.getAttribute('data-step-indicator'));
        el.classList.toggle('is-active', i === n);
        el.classList.toggle('is-done', i < n);
      });
      if (n === 2) paintAddress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    qsa('[data-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () { setStep(Number(btn.getAttribute('data-goto'))); });
    });
    qsa('[data-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (validateStep(state.step)) setStep(Number(btn.getAttribute('data-next')));
      });
    });

    /* --------------------------------------------------------- validation */

    function fail(input, message) {
      var field = input.closest('.field');
      if (!field) return;
      field.classList.add('field--error');
      var err = qs('.field__error', field);
      if (err && message) err.textContent = message;
      input.addEventListener('input', function once() {
        field.classList.remove('field--error');
        input.removeEventListener('input', once);
      });
    }

    function validateStep(n) {
      var ok = true;
      var firstBad = null;

      function check(input, valid, message) {
        if (!input) return;
        var field = input.closest('.field');
        if (!field) return;
        if (!valid) {
          fail(input, message);
          ok = false;
          if (!firstBad) firstBad = input;
        } else {
          field.classList.remove('field--error');
        }
      }

      if (n === 1) {
        var email = qs('#email');
        var phone = qs('#phone');
        check(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()), 'Please enter a valid email address');
        check(qs('#firstName'), qs('#firstName').value.trim().length > 1, 'Required');
        check(qs('#lastName'), qs('#lastName').value.trim().length > 1, 'Required');
        check(phone, phone.value.replace(/\D/g, '').length >= 7, 'Please enter a contact number');
        check(qs('#address1'), qs('#address1').value.trim().length > 3, 'Required');
        check(qs('#city'), qs('#city').value.trim().length > 1, 'Required');
        check(qs('#postcode'), qs('#postcode').value.trim().length > 2, 'Required');
        check(qs('#country'), !!qs('#country').value, 'Please choose a country');
      }

      if (!ok) {
        UI.toast('Please check the highlighted fields', I.close);
        if (firstBad) firstBad.focus();
      }
      return ok;
    }

    /* ------------------------------------------------------ delivery step */

    function renderDelivery() {
      var host = qs('#deliveryOptions');
      if (!host) return;
      host.innerHTML = S.shippingMethods().map(function (m) {
        var price = S.shippingCost(m.id);
        var on = state.method === m.id;
        return '' +
          '<label class="radio-card' + (on ? ' is-on' : '') + '" data-method="' + m.id + '">' +
            '<input type="radio" name="delivery" value="' + m.id + '"' + (on ? ' checked' : '') + '>' +
            '<span class="radio-card__body">' +
              '<span class="radio-card__top">' +
                '<span class="radio-card__name">' + esc(m.name) + '</span>' +
                '<span class="radio-card__price">' + (price === 0 ? 'Free' : S.money(price)) + '</span>' +
              '</span>' +
              '<span class="radio-card__note">' + esc(m.note) + '</span>' +
            '</span>' +
          '</label>';
      }).join('');

      host.addEventListener('change', function (e) {
        if (!e.target.matches('input[name="delivery"]')) return;
        state.method = e.target.value;
        qsa('.radio-card', host).forEach(function (card) {
          card.classList.toggle('is-on', card.getAttribute('data-method') === state.method);
        });
        renderDelivery();
        renderPayment();
        renderSummary();
      });
    }

    /* ------------------------------------------------------- payment step */

    function renderPayment() {
      var host = qs('#paymentOptions');
      if (!host) return;
      var p = payment();
      host.innerHTML = '' +
        '<label class="radio-card is-on" data-method="' + p.id + '">' +
          '<input type="radio" name="payment" value="' + p.id + '" checked>' +
          '<span class="radio-card__body">' +
            '<span class="radio-card__top">' +
              '<span class="radio-card__name">' + esc(p.name) + '</span>' +
              '<span class="radio-card__price">' + esc(p.stamp) + '</span>' +
            '</span>' +
            '<span class="radio-card__note">' + esc(p.note) + '</span>' +
          '</span>' +
        '</label>';
    }

    function paintAddress() {
      var el = qs('#addressPreview');
      if (!el) return;
      var parts = [
        qs('#firstName').value + ' ' + qs('#lastName').value,
        qs('#address1').value,
        qs('#address2').value,
        qs('#city').value + ' ' + qs('#postcode').value,
        qs('#country').value
      ].filter(function (s) { return s && s.trim(); });
      el.innerHTML = parts.map(esc).join('<br>') +
        '<br><span class="muted">' + esc(qs('#email').value) + '</span>';
    }

    /* ------------------------------------------------------ gift wrapping */

    var gift = qs('#giftWrap');
    var giftNoteField = qs('#giftNoteField');
    var giftNoteInput = qs('#giftNote');

    function readGiftNote() {
      return giftNoteInput ? giftNoteInput.value.trim().slice(0, 200) : '';
    }

    function syncGift() {
      state.gift = !!(gift && gift.checked);
      state.giftNote = state.gift ? readGiftNote() : '';
      if (giftNoteField) giftNoteField.hidden = !state.gift;
      renderSummary();
    }

    if (gift) gift.addEventListener('change', syncGift);
    if (giftNoteInput) giftNoteInput.addEventListener('input', function () {
      state.giftNote = readGiftNote();
      renderSummary();
    });

    /* -------------------------------------------------------------- submit */

    var formInfo = qs('#formInfo');
    if (formInfo) {
      formInfo.addEventListener('submit', function (e) {
        e.preventDefault();
        if (validateStep(1)) setStep(2);
      });
    }

    var formPay = qs('#formPay');
    if (formPay) {
      formPay.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateStep(3)) return;

        var btn = qs('#placeOrder');
        if (btn) {
          btn.setAttribute('aria-disabled', 'true');
          btn.innerHTML = '<span>Placing order…</span>';
        }

        var t = totals();
        var order = {
          number: 'JS-' + Date.now().toString(36).toUpperCase().slice(-6),
          placedAt: new Date().toISOString(),
          email: qs('#email').value.trim(),
          name: qs('#firstName').value.trim() + ' ' + qs('#lastName').value.trim(),
          address: [
            qs('#address1').value, qs('#address2').value,
            qs('#city').value + ' ' + qs('#postcode').value, qs('#country').value
          ].filter(function (s) { return s && s.trim(); }).join(', '),
          method: methodName(),
          payment: payment().name,
          gift: state.gift,
          giftNote: state.gift ? readGiftNote() : '',
          newsletter: qs('#newsOptIn') ? qs('#newsOptIn').checked : false,
          lines: S.lines().map(function (l) {
            return {
              brand: l.product.brand,
              name: l.product.name,
              slug: l.product.slug,
              variant: l.variantLabel,
              ml: l.item.ml,
              qty: l.item.qty,
              lineTotal: l.lineTotal
            };
          }),
          totals: t,
          coupon: S.coupon()
        };

        try {
          window.localStorage.setItem('julie.lastOrder', JSON.stringify(order));
        } catch (err) {
          window.__julieLastOrder = order;
        }

        setTimeout(function () {
          S.clear();
          location.href = 'order-confirmation.html?order=' + encodeURIComponent(order.number);
        }, 900);
      });
    }

    /* ---------------------------------------------------------------- init */

    renderDelivery();
    renderPayment();
    renderSummary();
    setStep(1);
  });
})();
