/* ==========================================================================
   JULIE SCENTS — MOTION
   GSAP + ScrollTrigger driven reveals. Everything here is progressive
   enhancement: if the CDN is unreachable, or the visitor prefers reduced
   motion, the page simply renders in its final state. Nothing important is
   ever hidden by CSS, so there is no way to end up with a blank page.
   ========================================================================== */

(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    /* These two are behaviour, not decoration: they must work even when the
       GSAP CDN is unreachable, so they are wired up before we look at motion. */
    initLightbox();
    initStickyBuy();

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = window.gsap;

    /* ---------------------------------------------------- no GSAP fallback */
    if (!gsap || reduced) {
      document.documentElement.classList.add('motion-off');
      // Any bar whose width was deferred until scroll should read as filled.
      Array.prototype.forEach.call(document.querySelectorAll('.compare__fill'), function (el) {
        el.style.width = (el.getAttribute('data-fill') || 0) + '%';
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
        el.textContent = el.getAttribute('data-count');
      });
      return;
    }

    var ScrollTrigger = window.ScrollTrigger;
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    var ease = 'power3.out';

    /* --------------------------------------------------------- hero intro */
    var heroLines = document.querySelectorAll('.hero__title .line > span');
    if (heroLines.length) {
      gsap.set(heroLines, { yPercent: 118, opacity: 0 });
      gsap.to(heroLines, {
        yPercent: 0, opacity: 1, duration: 1.15, ease: 'power4.out',
        stagger: 0.11, delay: 0.15
      });
    }

    var heroBits = document.querySelectorAll('[data-hero-fade]');
    if (heroBits.length) {
      gsap.set(heroBits, { y: 26, opacity: 0 });
      gsap.to(heroBits, {
        y: 0, opacity: 1, duration: 0.95, ease: ease,
        stagger: 0.09, delay: 0.45
      });
    }

    var heroImg = document.querySelector('.hero__img');
    if (heroImg) {
      gsap.fromTo(heroImg, { scale: 1.14 }, { scale: 1, duration: 2.2, ease: 'power2.out' });
    }

    /* ------------------------------------------------------ scroll reveals */
    function revealIn(targets, opts) {
      opts = opts || {};
      Array.prototype.forEach.call(targets, function (el, i) {
        gsap.fromTo(el,
          { y: opts.y || 34, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: opts.duration || 0.9,
            ease: ease,
            delay: (opts.stagger || 0) * (i % (opts.perRow || 6)),
            scrollTrigger: { trigger: el, start: opts.start || 'top 88%', once: true }
          }
        );
      });
    }

    if (ScrollTrigger) {
      revealIn(document.querySelectorAll('[data-reveal]'));
      revealIn(document.querySelectorAll('.trust__item'), { y: 22, perRow: 4 });
      revealIn(document.querySelectorAll('.cat'), { y: 40, perRow: 4 });
      revealIn(document.querySelectorAll('.vcard'), { y: 30, perRow: 3 });
      revealIn(document.querySelectorAll('.quote'), { y: 30, perRow: 3 });
      revealIn(document.querySelectorAll('.step'), { y: 24, perRow: 1 });
      revealIn(document.querySelectorAll('.visual'), { y: 40, perRow: 1 });

      // product grids stagger in
      var grids = document.querySelectorAll('[data-stagger-grid]');
      Array.prototype.forEach.call(grids, function (grid) {
        gsap.fromTo(grid.children,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.75, ease: ease, stagger: 0.045,
            scrollTrigger: { trigger: grid, start: 'top 86%', once: true }
          }
        );
      });

      // subtle parallax on hero art
      gsap.to('.hero__glow', {
        yPercent: 22, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });

      // section headings drift a touch slower than the page
      Array.prototype.forEach.call(document.querySelectorAll('[data-parallax]'), function (el) {
        gsap.to(el, {
          yPercent: -14, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });

      // animated counters
      Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
        var target = Number(el.getAttribute('data-count'));
        var decimals = (el.getAttribute('data-decimals') || 0) * 1;
        var obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.7, ease: 'power2.out',
          onUpdate: function () { el.textContent = obj.v.toFixed(decimals); },
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });

      // comparison bars fill as they come into view
      Array.prototype.forEach.call(document.querySelectorAll('.compare__fill'), function (el) {
        gsap.fromTo(el, { width: 0 }, {
          width: (el.getAttribute('data-fill') || 0) + '%',
          duration: 1.25, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });

      // hairline rules draw themselves
      Array.prototype.forEach.call(document.querySelectorAll('[data-draw-line]'), function (el) {
        gsap.fromTo(el, { scaleX: 0 }, {
          scaleX: 1, transformOrigin: 'left center', duration: 1.1, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });
    }

    /* ---------------------------------------------- card hover micro-motion */
    Array.prototype.forEach.call(document.querySelectorAll('.pcard'), function (card) {
      var media = card.querySelector('.pcard__media');
      if (!media) return;
      card.addEventListener('mouseenter', function () {
        gsap.to(media, { y: -5, duration: 0.4, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(media, { y: 0, duration: 0.45, ease: 'power2.out' });
      });
    });

  });

  /**
   * Product image lightbox. Delegated from the document so it also works for
   * markup that a page script renders after this file has run.
   */
  function initLightbox() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-zoom]');
      if (!btn) return;
      e.preventDefault();

      var src = btn.getAttribute('data-zoom');
      var alt = btn.getAttribute('data-zoom-alt') || '';
      var holder = document.getElementById('lightboxMedia');
      if (holder) {
        var img = document.querySelector('.gallery__stage img');
        var href = src || (img && img.getAttribute('src')) || '';
        if (href) {
          holder.innerHTML = '<img src="' + href + '" alt="' + alt +
            '" style="width:100%;height:100%;object-fit:contain;background:#e8e8e8">';
        } else {
          var tileEl = document.querySelector('.gallery__stage .tile');
          holder.innerHTML = tileEl ? tileEl.outerHTML : '';
        }
      }
      window.UI.openModal(
        '<p class="eyebrow eyebrow--plain">' + (btn.getAttribute('data-zoom-brand') || '') + '</p>' +
        '<h2 class="mt-4">' + (btn.getAttribute('data-zoom-title') || '') + '</h2>'
      );
    });
  }

  /** Sticky buy bar on the product page — works with or without ScrollTrigger. */
  function initStickyBuy() {
    var bar = document.querySelector('.sticky-buy');
    var anchor = document.querySelector('[data-buy-anchor]');
    if (!bar || !anchor) return;

    if (window.ScrollTrigger && window.gsap) {
      window.ScrollTrigger.create({
        trigger: anchor,
        start: 'bottom center',
        onEnter: function () { bar.classList.add('is-on'); },
        onLeaveBack: function () { bar.classList.remove('is-on'); }
      });
      return;
    }

    var onScroll = function () {
      var r = anchor.getBoundingClientRect();
      bar.classList.toggle('is-on', r.bottom < 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }
})();
