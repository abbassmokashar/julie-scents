/* ==========================================================================
   JULIE SCENTS — HOME PAGE
   Renders the mega menu, hero card, product rails, brand marquee and the
   side-by-side comparison. All content is derived from the catalogue.
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

    /* --------------------------------------------------- hero notes card */
    var heroNotes = qs('#heroNotes');
    if (heroNotes) {
      var hero = S.findBySlug('dior-sauvage-edp') || S.bestSellers(1)[0];
      if (hero) {
        var rec = hero.recreate ? hero.recreate.price[hero.recreate.price.length - 1] : null;
        var orig = hero.sizes[hero.sizes.length - 1].price;
        heroNotes.innerHTML = '' +
          '<p class="notes-card__label">Fragrance of the week</p>' +
          '<h2 class="notes-card__name">' + esc(hero.name) + '</h2>' +
          '<span class="notes-card__brand">' + esc(hero.brand) + '</span>' +
          '<dl class="notes-card__rows">' +
            '<div class="notes-card__row"><dt>Top</dt><dd>' + esc(hero.notes.top.join(', ')) + '</dd></div>' +
            '<div class="notes-card__row"><dt>Heart</dt><dd>' + esc(hero.notes.heart.join(', ')) + '</dd></div>' +
            '<div class="notes-card__row"><dt>Base</dt><dd>' + esc(hero.notes.base.join(', ')) + '</dd></div>' +
          '</dl>' +
          '<div class="notes-card__price">' +
            '<span>Original ' + S.money(orig) + '</span>' +
            (rec ? '<b>Recreate ' + S.money(rec) + '</b>' : '') +
          '</div>' +
          '<a class="btn btn--light btn--full mt-4" href="' + UI.productUrl(hero) + '"><span>View this scent</span></a>';
      }
    }

    /* ------------------------------------------------------- best sellers */
    var railBest = qs('#railBest');
    if (railBest) {
      railBest.innerHTML = S.bestSellers(8).map(UI.card).join('');
    }

    /* ------------------------------------------------------- new arrivals */
    var gridNew = qs('#gridNew');
    if (gridNew) {
      gridNew.innerHTML = S.newIn(8).map(UI.card).join('');
    }

    /* ---------------------------------------------------------- rail nav */
    var rail = railBest;
    var prev = qs('[data-rail-prev]');
    var next = qs('[data-rail-next]');
    if (rail && prev && next) {
      var amount = function () { return Math.max(260, rail.clientWidth * 0.7); };
      prev.addEventListener('click', function () { rail.scrollBy({ left: -amount(), behavior: 'smooth' }); });
      next.addEventListener('click', function () { rail.scrollBy({ left: amount(), behavior: 'smooth' }); });
    }

    /* ------------------------------------------------------ brand marquee */
    var trackA = qs('#brandTrackA');
    var trackB = qs('#brandTrackB');
    if (trackA && trackB) {
      var names = S.brands();
      var items = names.map(function (b) {
        return '<span class="marquee__item">' + esc(b) + '</span>';
      }).join('');
      trackA.innerHTML = items;
      trackB.innerHTML = items;
    }

    /* ------------------------------------------------------ compare bars */
    var compare = qs('#compareBars');
    if (compare) {
      var metrics = [
        { label: 'Longevity &middot; 8-hour wear test', rec: 93, recText: '11.2 hours', orig: 54, origText: '6.5 hours' },
        { label: 'Intensity on skin &middot; after 4 hours', rec: 82, recText: '82%', orig: 71, origText: '71%' },
        { label: 'Sillage &middot; arm&rsquo;s length', rec: 68, recText: '68%', orig: 61, origText: '61%' },
        { label: 'Cost per hour of wear', rec: 91, recText: 'Excellent', orig: 28, origText: 'Poor' }
      ];
      compare.innerHTML = metrics.map(function (m) {
        return '<div class="compare__row">' +
          '<div class="compare__top">' +
            '<span class="compare__label">' + m.label + ' &middot; Julie Scents</span>' +
            '<span class="compare__val">' + m.recText + '</span>' +
          '</div>' +
          '<div class="compare__bar"><span class="compare__fill" data-fill="' + m.rec + '"></span></div>' +
          '<div class="compare__top" style="margin-top:.6rem">' +
            '<span class="compare__label">Original bottle</span>' +
            '<span class="compare__val muted">' + m.origText + '</span>' +
          '</div>' +
          '<div class="compare__bar"><span class="compare__fill compare__fill--alt" data-fill="' + m.orig + '"></span></div>' +
        '</div>';
      }).join('');
    }

    /* ---------------------------------------------------------- newsletter */
    var form = qs('.newsletter__form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = qs('input[type="email"]', form);
        var value = input ? input.value.trim() : '';
        if (!value || value.indexOf('@') === -1) {
          UI.toast('Please enter a valid email address', UI.icons.close);
          if (input) input.focus();
          return;
        }
        UI.toast('Welcome to the list — use WELCOME10 for 10% off', UI.icons.checkCircle);
        form.reset();
      });
    }

  });
})();
