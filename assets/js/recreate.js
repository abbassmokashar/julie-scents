/* ==========================================================================
   JULIE SCENTS — RECREATE PAGE
   The side-by-side performance bars and the custom recreation request form.
   ========================================================================== */

(function () {
  'use strict';

  var UI = window.UI;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var qs = UI.qs;

    /* ------------------------------------------------------ compare bars */
    var compare = qs('#compareBars');
    if (compare) {
      var metrics = [
        { label: 'Longevity &middot; 8-hour wear test', rec: 93, recText: '11.2 hours', orig: 54, origText: '6.5 hours' },
        { label: 'Intensity on skin &middot; after 4 hours', rec: 82, recText: '82%', orig: 71, origText: '71%' },
        { label: 'Sillage &middot; arm&rsquo;s length', rec: 68, recText: '68%', orig: 61, origText: '61%' },
        { label: 'Oil concentration', rec: 88, recText: '27%', orig: 52, origText: '16%' },
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

    /* ---------------------------------------------------- request a blend */
    var form = qs('#recreateForm');
    if (form) {
      var mark = function (input, ok) {
        var field = input.closest('.field');
        if (field) field.classList.toggle('field--error', !ok);
        return ok;
      };

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var name = qs('#rcName');
        var email = qs('#rcEmail');
        var scent = qs('#rcScent');

        var okName = mark(name, name.value.trim().length > 1);
        var okEmail = mark(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()));
        var okScent = mark(scent, scent.value.trim().length > 1);

        if (!okName || !okEmail || !okScent) {
          UI.toast('Please check the highlighted fields', UI.icons.close);
          var firstBad = [name, email, scent].filter(function (i) {
            return i.closest('.field').classList.contains('field--error');
          })[0];
          if (firstBad) firstBad.focus();
          return;
        }

        UI.toast('Request received — we will be in touch within two working days', UI.icons.checkCircle);
        form.reset();
      });
    }
  });
})();
