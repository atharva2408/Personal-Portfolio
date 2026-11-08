/* Atharva Yanna — portfolio interactions.
   Everything here is progressive enhancement: with JS off, all content is visible. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  window.__ready = true;

  /* ---------- footer year ---------- */
  var yr = qs('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- reveal on enter (once) ---------- */
  var revealEls = qsa('[data-reveal], [data-lines]');
  if ('IntersectionObserver' in window && !reduce.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- nav: scrolled state, progress bar, hero photo drift ---------- */
  var nav = qs('#nav');
  var bar = qs('.progress');
  var photo = qs('#photo');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 8);
    if (bar && max > 0) bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
    if (photo && !reduce.matches && y < window.innerHeight * 1.2) {
      photo.style.transform = 'translate3d(0,' + (y * 0.06).toFixed(1) + 'px,0)';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- active section + sliding indicator ---------- */
  var links = qsa('#navLinks a');
  var menuLinks = qsa('#menu a[href^="#"]');
  var ind = qs('.nav__ind');
  var sections = links.map(function (a) { return qs(a.getAttribute('href')); }).filter(Boolean);
  var currentId = 'home';

  function moveIndicator() {
    var active = links.filter(function (a) { return a.getAttribute('aria-current') === 'true'; })[0];
    if (!active || !ind) return;
    var box = active.getBoundingClientRect();
    var parent = active.closest('.nav__links').getBoundingClientRect();
    ind.style.setProperty('--x', (box.left - parent.left + 14) + 'px');
    ind.style.setProperty('--w', ((box.width - 28) / 100).toFixed(3));
  }

  function setActive(id) {
    currentId = id;
    links.concat(menuLinks).forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    moveIndicator();
  }

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }
  setActive('home');
  window.addEventListener('resize', moveIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);

  /* ---------- smooth anchor scrolling that also moves focus ---------- */
  function goTo(hash, push) {
    var target = qs(hash);
    if (!target) return;
    var top = hash === '#home' ? 0 : target.getBoundingClientRect().top + window.scrollY - 8;
    window.scrollTo({ top: top, behavior: reduce.matches ? 'auto' : 'smooth' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (push && history.pushState) history.pushState(null, '', hash);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    var hash = a.getAttribute('href');
    if (!qs(hash)) return;
    e.preventDefault();
    closeMenu(false);
    goTo(hash, true);
  });

  /* ---------- mobile menu ---------- */
  var toggle = qs('#navToggle');
  var menu = qs('#menu');
  var lastFocus = null;

  function openMenu() {
    lastFocus = document.activeElement;
    menu.classList.add('open');
    menu.removeAttribute('inert');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    var first = qs('a', menu);
    if (first) first.focus({ preventScroll: true });
  }
  function closeMenu(restore) {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open');
    menu.setAttribute('inert', '');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    if (restore !== false && lastFocus) lastFocus.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', function () {
    if (menu.classList.contains('open')) closeMenu(); else openMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab' && menu.classList.contains('open')) {
      var f = qsa('a, button', menu).concat([toggle]);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); toggle.focus(); }
      else if (!e.shiftKey && document.activeElement === toggle) { e.preventDefault(); first.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); toggle.focus(); }
    }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', function (m) { if (m.matches) closeMenu(false); });
  qsa('#menu a:not([href^="#"])').forEach(function (a) { a.addEventListener('click', function () { closeMenu(false); }); });

  /* ---------- skills: keyboard users get the same highlight as hover ---------- */
  /* (handled by :focus-within in CSS; rows are focusable via tabindex) */

  /* ---------- hash on load ---------- */
  if (location.hash && qs(location.hash)) {
    window.addEventListener('load', function () { setTimeout(function () { goTo(location.hash, false); }, 60); });
  }
})();
