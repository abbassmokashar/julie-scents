/* ==========================================================================
   JULIE SCENTS — SHOP
   Filter rail, sorting, active chips and progressive loading. Filter state is
   mirrored into the URL so any view can be shared or refreshed.
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

    var grid = qs('#shopGrid');
    if (!grid) return;

    var PER_PAGE = 12;
    var bounds = priceBounds();

    var state = {
      gender: [],
      brand: [],
      family: [],
      concentration: [],
      maxPrice: bounds.max,
      recreate: false,
      sale: false,
      q: '',
      sort: 'featured',
      shown: PER_PAGE
    };

    readUrl();
    buildFilters();
    bindControls();
    render(true);

    /* ------------------------------------------------------------ setup */

    function priceBounds() {
      var lo = Infinity, hi = 0;
      S.all().forEach(function (p) {
        var v = S.fromPrice(p);
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      });
      return { min: Math.floor(lo), max: Math.ceil(hi) };
    }

    function readUrl() {
      var q = new URLSearchParams(location.search);
      var gender = q.get('gender');
      var brand = q.get('brand');
      var family = q.get('family');
      var conc = q.get('concentration');

      if (gender) state.gender = gender.split(',');
      if (brand) state.brand = brand.split(',');
      if (family) state.family = family.split(',');
      if (conc) state.concentration = conc.split(',');
      if (q.get('q')) state.q = q.get('q');
      if (q.get('sale') === '1') state.sale = true;
      if (q.get('recreate') === '1') state.recreate = true;
      if (q.get('sort')) state.sort = q.get('sort');
    }

    function writeUrl() {
      var q = new URLSearchParams();
      if (state.gender.length) q.set('gender', state.gender.join(','));
      if (state.brand.length) q.set('brand', state.brand.join(','));
      if (state.family.length) q.set('family', state.family.join(','));
      if (state.concentration.length) q.set('concentration', state.concentration.join(','));
      if (state.q) q.set('q', state.q);
      if (state.sale) q.set('sale', '1');
      if (state.recreate) q.set('recreate', '1');
      if (state.sort !== 'featured') q.set('sort', state.sort);

      var url = location.pathname + (q.toString() ? '?' + q.toString() : '');
      history.replaceState({}, '', url);
    }

    /* --------------------------------------------------------- filtering */

    function countBy(key, value) {
      return S.all().filter(function (p) { return p[key] === value; }).length;
    }

    function matches(p) {
      if (state.gender.length && state.gender.indexOf(p.gender) === -1) return false;
      if (state.brand.length && state.brand.indexOf(p.brand) === -1) return false;
      if (state.family.length && state.family.indexOf(S.familyGroup(p)) === -1) return false;
      if (state.concentration.length && state.concentration.indexOf(p.concentration) === -1) return false;
      if (state.recreate && !p.recreate) return false;
      if (state.sale && !S.isOnSale(p)) return false;
      if (S.fromPrice(p) > state.maxPrice) return false;
      if (state.q) {
        var hay = (p.brand + ' ' + p.name + ' ' + p.family + ' ' + [].concat(p.notes.top, p.notes.heart, p.notes.base).join(' ')).toLowerCase();
        var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
        for (var i = 0; i < words.length; i++) {
          if (hay.indexOf(words[i]) === -1) return false;
        }
      }
      return true;
    }

    function sorted(list) {
      var out = list.slice();
      switch (state.sort) {
        case 'price-asc':
          return out.sort(function (a, b) { return S.fromPrice(a) - S.fromPrice(b); });
        case 'price-desc':
          return out.sort(function (a, b) { return S.fromPrice(b) - S.fromPrice(a); });
        case 'rating':
          return out.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
        case 'name':
          return out.sort(function (a, b) { return a.name.localeCompare(b.name); });
        case 'saving':
          return out.sort(function (a, b) { return saving(b) - saving(a); });
        default:
          return out.sort(function (a, b) { return (b.reviews || 0) - (a.reviews || 0); });
      }
    }

    function saving(p) {
      if (!p.recreate) return 0;
      var orig = S.fromPrice(p);
      return orig ? 1 - (p.recreate.price[0] / orig) : 0;
    }

    function results() {
      return sorted(S.all().filter(matches));
    }

    /* ------------------------------------------------------ filter rail */

    function group(id, title, bodyHtml, open) {
      return '' +
        '<div class="fgroup' + (open ? ' is-open' : '') + '" data-group="' + id + '">' +
          '<button class="fgroup__head" type="button" aria-expanded="' + (open ? 'true' : 'false') + '">' +
            title + UI.icons.chevronDown +
          '</button>' +
          '<div class="fgroup__panel"><div><div class="fgroup__body">' + bodyHtml + '</div></div></div>' +
        '</div>';
    }

    function check(id, label, checked, count, groupId) {
      return '' +
        '<label class="fcheck' + (checked ? ' is-on' : '') + '">' +
          '<input type="checkbox" data-fgroup="' + groupId + '" value="' + esc(id) + '"' + (checked ? ' checked' : '') + '>' +
          '<span>' + esc(label) + '</span>' +
          (count != null ? '<span class="fcheck__count">' + count + '</span>' : '') +
        '</label>';
    }

    function buildFilters() {
      var host = qs('#filterGroups');
      if (!host) return;

      var genders = [
        { id: 'women', label: 'For her' },
        { id: 'men', label: 'For him' },
        { id: 'unisex', label: 'Unisex' }
      ];
      var houses = S.brands();
      var families = S.familyGroups();
      var concs = [];
      S.all().forEach(function (p) {
        if (concs.indexOf(p.concentration) === -1) concs.push(p.concentration);
      });

      var html = '';

      html += group('gender', 'Shop for',
        genders.map(function (g) {
          return check(g.id, g.label, state.gender.indexOf(g.id) > -1, countBy('gender', g.id), 'gender');
        }).join(''), true);

      html += group('recreate', 'Buying options',
        '<label class="fcheck' + (state.recreate ? ' is-on' : '') + '">' +
          '<input type="checkbox" id="flagRecreate"' + (state.recreate ? ' checked' : '') + '>' +
          '<span>Available to recreate</span>' +
          '<span class="fcheck__count">' + S.all().filter(function (p) { return !!p.recreate; }).length + '</span>' +
        '</label>' +
        '<label class="fcheck' + (state.sale ? ' is-on' : '') + '">' +
          '<input type="checkbox" id="flagSale"' + (state.sale ? ' checked' : '') + '>' +
          '<span>Biggest recreate savings</span>' +
          '<span class="fcheck__count">' + S.all().filter(S.isOnSale).length + '</span>' +
        '</label>', true);

      html += group('price', 'Price',
        '<div class="range">' +
          '<input type="range" id="priceRange" min="' + bounds.min + '" max="' + bounds.max + '" step="1" value="' + state.maxPrice + '">' +
          '<div class="range__values">' +
            '<span>' + S.money(bounds.min) + '</span>' +
            '<span>up to <strong id="priceLabel">' + S.money(state.maxPrice) + '</strong></span>' +
          '</div>' +
        '</div>', true);

      html += group('brand', 'House',
        houses.map(function (b) {
          return check(b, b, state.brand.indexOf(b) > -1, countBy('brand', b), 'brand');
        }).join(''), false);

      html += group('family', 'Fragrance family',
        families.map(function (f) {
          var n = S.all().filter(function (p) { return S.familyGroup(p) === f; }).length;
          return check(f, f, state.family.indexOf(f) > -1, n, 'family');
        }).join(''), false);

      html += group('concentration', 'Concentration',
        concs.map(function (c) {
          return check(c, c, state.concentration.indexOf(c) > -1, countBy('concentration', c), 'concentration');
        }).join(''), false);

      host.innerHTML = html;
      UI.bindFilterGroups(host);
    }

    /* ---------------------------------------------------------- controls */

    function toggleValue(list, value) {
      var i = list.indexOf(value);
      if (i > -1) list.splice(i, 1);
      else list.push(value);
      return list;
    }

    function bindControls() {
      var host = qs('#filterGroups');

      host.addEventListener('change', function (e) {
        var t = e.target;

        if (t.matches('[data-fgroup]')) {
          var key = t.getAttribute('data-fgroup');
          toggleValue(state[key], t.value);
          t.closest('.fcheck').classList.toggle('is-on', t.checked);
          render(true);
          return;
        }

        if (t.id === 'flagRecreate') { state.recreate = t.checked; render(true); return; }
        if (t.id === 'flagSale') { state.sale = t.checked; render(true); return; }

        if (t.id === 'priceRange') {
          state.maxPrice = Number(t.value);
          var label = qs('#priceLabel');
          if (label) label.textContent = S.money(state.maxPrice);
          render(true);
        }
      });

      // range input fires 'input' as well as 'change'
      host.addEventListener('input', function (e) {
        if (e.target.id === 'priceRange') {
          state.maxPrice = Number(e.target.value);
          var label = qs('#priceLabel');
          if (label) label.textContent = S.money(state.maxPrice);
          render(true);
        }
      });

      var sort = qs('#sortSelect');
      if (sort) {
        sort.value = state.sort;
        sort.addEventListener('change', function () {
          state.sort = sort.value;
          render(true);
        });
      }

      var clear = qs('#clearFilters');
      if (clear) {
        clear.addEventListener('click', function () {
          state.gender = []; state.brand = []; state.family = []; state.concentration = [];
          state.recreate = false; state.sale = false; state.q = '';
          state.maxPrice = bounds.max; state.sort = 'featured';
          var sortSel = qs('#sortSelect');
          if (sortSel) sortSel.value = 'featured';
          buildFilters();
          render(true);
          UI.toast('Filters cleared', UI.icons.check);
        });
      }

      var loadMore = qs('#loadMore');
      if (loadMore) {
        loadMore.addEventListener('click', function () {
          state.shown += PER_PAGE;
          render(false);
        });
      }

      var toggle = qs('#filterToggle');
      if (toggle) {
        toggle.addEventListener('click', function () {
          document.body.classList.add('filters-open', 'is-locked');
        });
      }

      // tap the scrim to dismiss the mobile filter rail
      var scrim = qs('.scrim');
      if (scrim) {
        scrim.addEventListener('click', function () {
          document.body.classList.remove('filters-open');
          if (!document.body.classList.contains('drawer-open')) document.body.classList.remove('is-locked');
        });
      }
    }

    /* ------------------------------------------------------------ render */

    function render(resetScroll) {
      if (resetScroll) state.shown = PER_PAGE;

      var list = results();
      var visible = list.slice(0, state.shown);

      grid.innerHTML = visible.map(UI.card).join('');

      var countEl = qs('#resultCount');
      if (countEl) countEl.textContent = list.length;
      var wordEl = qs('#resultWord');
      if (wordEl) wordEl.textContent = list.length === 1 ? 'fragrance' : 'fragrances';

      // empty state
      var noResults = qs('#noResults');
      if (noResults) {
        noResults.innerHTML = list.length ? '' :
          '<div class="no-results">' +
            '<h3 class="empty__title">Nothing matched those filters</h3>' +
            '<p class="muted">Try removing a filter, or browse the whole collection.</p>' +
            '<button class="btn mt-5" type="button" id="resetFromEmpty"><span>Reset filters</span></button>' +
          '</div>';
        var reset = qs('#resetFromEmpty');
        if (reset) {
          reset.addEventListener('click', function () {
            var clear = qs('#clearFilters');
            if (clear) clear.click();
          });
        }
      }

      // load more
      var wrap = qs('#loadMoreWrap');
      var text = qs('#loadMoreText');
      var more = list.length - visible.length;
      if (wrap) wrap.hidden = more <= 0;
      if (text) text.textContent = more > 0
        ? 'Showing ' + visible.length + ' of ' + list.length
        : 'All ' + list.length + ' shown';

      renderChips();
      updateHeadings(list.length);
      writeUrl();

      if (window.UI.syncWishButtons) UI.syncWishButtons();
      // re-run reveals for freshly inserted cards
      if (window.ScrollTrigger && resetScroll) window.ScrollTrigger.refresh();
    }

    function renderChips() {
      var host = qs('#activeChips');
      if (!host) return;

      var chips = [];
      function push(kind, value, label) {
        chips.push({ kind: kind, value: value, label: label });
      }

      state.gender.forEach(function (g) { push('gender', g, g.charAt(0).toUpperCase() + g.slice(1)); });
      state.brand.forEach(function (b) { push('brand', b, b); });
      state.family.forEach(function (f) { push('family', f, f); });
      state.concentration.forEach(function (c) { push('concentration', c, c); });
      if (state.recreate) push('recreate', '1', 'Recreatable');
      if (state.sale) push('sale', '1', 'Biggest savings');
      if (state.q) push('q', state.q, '“' + state.q + '”');

      host.innerHTML = chips.map(function (c) {
        return '<button class="chip-btn" type="button" data-chip="' + esc(c.kind) + '" data-value="' + esc(c.value) + '">' +
          esc(c.label) +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>';
      }).join('');

      host.onclick = function (e) {
        var btn = e.target.closest('[data-chip]');
        if (!btn) return;
        var kind = btn.getAttribute('data-chip');
        var value = btn.getAttribute('data-value');
        if (kind === 'q') state.q = '';
        else if (kind === 'recreate') state.recreate = false;
        else if (kind === 'sale') state.sale = false;
        else {
          var i = state[kind].indexOf(value);
          if (i > -1) state[kind].splice(i, 1);
        }
        buildFilters();
        render(true);
      };
    }

    function updateHeadings(count) {
      var gender = state.gender.length === 1 ? state.gender[0] : null;
      var title = qs('#shopTitle');
      var crumb = qs('#crumbCurrent');
      var intro = qs('#shopIntro');

      var label = 'All fragrances';
      var text = 'Sixteen designer scents for women and men. Every one of them can also be recreated by our atelier from premium oils — identical in character, far kinder to your budget, and guaranteed to last.';

      if (gender === 'women') {
        label = 'Fragrance for her';
        text = 'Florals, gourmands and warm orientals — the most-loved feminine scents in the world, all available to recreate.';
      } else if (gender === 'men') {
        label = 'Fragrance for him';
        text = 'Fresh woods, ambers and the great modern masculines. Choose the original bottle or a long-lasting recreation.';
      } else if (gender === 'unisex') {
        label = 'Unisex fragrance';
        text = 'Woody, smoky and skin-close scents that do not belong to anyone in particular.';
      } else if (state.sale) {
        label = 'The recreate edit';
        text = 'The fragrances where recreating in-house saves the most — same scent profile, same hours of wear, a fraction of retail.';
      } else if (state.q) {
        label = 'Results for “' + state.q + '”';
        text = 'Matching fragrances from across the collection.';
      } else if (state.brand.length === 1) {
        label = state.brand[0];
        text = 'Every fragrance we carry from ' + state.brand[0] + '.';
      }

      if (title) title.textContent = label;
      if (crumb) crumb.textContent = label;
      if (intro) intro.textContent = text;
      if (title) document.title = label + ' — Julie Scents';
    }
  });
})();
