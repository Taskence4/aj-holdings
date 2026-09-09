/* AJ Holdings — page behaviour.
 *
 * Owns the single source of truth for "where in the story are we": a
 * continuous float in [0, chapters-1] published on window.__ajStory. The WebGL
 * field reads it each frame; the rail and nav read it on change. Nothing here
 * depends on WebGL, so the page degrades to a plain scrolling document.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var story = { form: 0, chapter: 0, count: 1 };
  window.__ajStory = story;

  /* ---------------------------------------------------------------- year */

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------- reveals */

  var revealEls = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealEls, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    Array.prototype.forEach.call(revealEls, function (el) {
      revealObserver.observe(el);
    });
  }

  /* ------------------------------------------------------- story progress */

  var chapters = Array.prototype.slice.call(document.querySelectorAll('[data-form]'));
  var railLinks = Array.prototype.slice.call(document.querySelectorAll('.rail a'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var masthead = document.getElementById('masthead');

  story.count = chapters.length;

  // Document-space centre of each chapter. Recomputed on resize / reflow.
  var anchors = [];

  function measure() {
    var scrollY = window.pageYOffset;
    anchors = chapters.map(function (el) {
      var r = el.getBoundingClientRect();
      return r.top + scrollY + r.height / 2;
    });
  }

  function smoothstep(x) {
    x = x < 0 ? 0 : x > 1 ? 1 : x;
    return x * x * (3 - 2 * x);
  }

  var lastChapter = -1;

  function update() {
    if (!anchors.length) return;

    var c = window.pageYOffset + window.innerHeight / 2;

    var form;
    if (c <= anchors[0]) {
      form = 0;
    } else if (c >= anchors[anchors.length - 1]) {
      form = anchors.length - 1;
    } else {
      var i = 0;
      while (i < anchors.length - 2 && c > anchors[i + 1]) i++;
      var span = anchors[i + 1] - anchors[i];
      // Eased so each chapter holds its shape, then transitions decisively.
      form = i + smoothstep(span > 0 ? (c - anchors[i]) / span : 0);
    }

    story.form = form;

    var chapter = Math.round(form);
    if (chapter !== lastChapter) {
      lastChapter = chapter;
      story.chapter = chapter;
      setCurrent(chapter);
    }

    if (masthead) {
      masthead.classList.toggle('is-stuck', window.pageYOffset > 40);
    }
  }

  function setCurrent(index) {
    var id = chapters[index] ? chapters[index].id : null;

    railLinks.forEach(function (a) {
      a.classList.toggle('is-current', a.getAttribute('data-rail') === id);
      if (a.getAttribute('data-rail') === id) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });

    navLinks.forEach(function (a) {
      a.classList.toggle('is-current', a.getAttribute('href') === '#' + id);
    });
  }

  /* --------------------------------------------------------- scheduling */

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      update();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); update(); }, { passive: true });

  // Late-loading images (the portfolio wall) change chapter heights.
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function () { measure(); update(); });
    ro.observe(document.body);
  } else {
    window.addEventListener('load', function () { measure(); update(); });
  }

  measure();
  update();

  /* ------------------------------------------------------- pointer state */

  var pointer = { x: 0, y: 0 };
  window.__ajPointer = pointer;

  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', function (e) {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }
})();
