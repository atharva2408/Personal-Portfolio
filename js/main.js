/* Atharva Yanna — portfolio interactions.
   Progressive enhancement: with JS off, all content is visible. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  window.__ready = true;

  var yr = qs('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- stagger: children of [data-stagger] reveal one after another ---------- */
  qsa('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.setAttribute('data-reveal', '');
      child.style.setProperty('--d', Math.min(i, 8) * 70 + 'ms');
    });
  });

  /* ---------- reveal on enter (once) ---------- */
  var revealEls = qsa('[data-reveal]');
  var hero = qs('.hero__name');
  if (hero) revealEls.push(hero);
  if ('IntersectionObserver' in window && !reduce.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          el.classList.add('in'); io.unobserve(el);
          /* once revealed, drop the reveal hook so hover transforms and transitions work normally */
          var wait = (parseFloat(el.style.getPropertyValue('--d')) || 0) + 1100;
          setTimeout(function () { el.removeAttribute('data-reveal'); }, wait);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); el.removeAttribute('data-reveal'); });
  }

  /* ---------- nav state, progress bar, timeline line ---------- */
  var nav = qs('#nav');
  var bar = qs('.progress');
  var timeline = qs('#timeline');
  var xps = qsa('.xp');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('scrolled', y > 8);
    if (bar && max > 0) bar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var line = window.innerHeight * 0.6;
      var p = Math.max(0, Math.min(1, (line - r.top) / r.height));
      timeline.style.setProperty('--p', p.toFixed(3));
      xps.forEach(function (x) { x.classList.toggle('on', x.getBoundingClientRect().top < line); });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- active section + sliding indicator ---------- */
  var links = qsa('#navLinks a');
  var menuLinks = qsa('#menu a[href^="#"]');
  var ind = qs('.nav__ind');
  var sections = links.map(function (a) { return qs(a.getAttribute('href')); }).filter(Boolean);

  function moveIndicator() {
    var active = links.filter(function (a) { return a.getAttribute('aria-current') === 'true'; })[0];
    if (!active || !ind || !active.offsetWidth) return;
    var box = active.getBoundingClientRect();
    var parent = active.closest('.nav__links').getBoundingClientRect();
    ind.style.setProperty('--x', (box.left - parent.left + 13) + 'px');
    ind.style.setProperty('--w', ((box.width - 26) / 100).toFixed(3));
  }
  function setActive(id) {
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

  /* ---------- smooth anchors that also move focus ---------- */
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
    menu.classList.add('open'); menu.removeAttribute('inert'); menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    var first = qs('a', menu); if (first) first.focus({ preventScroll: true });
  }
  function closeMenu(restore) {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open'); menu.setAttribute('inert', ''); menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    if (restore !== false && lastFocus) lastFocus.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', function () { if (menu.classList.contains('open')) closeMenu(); else openMenu(); });
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

  /* ---------- photo tilt (fine pointers only) ---------- */
  if (!reduce.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    qsa('[data-tilt]').forEach(function (el) {
      var raf = 0;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.classList.add('is-active');
          el.style.transform = 'perspective(900px) rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg)';
        });
      });
      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(raf);
        el.classList.remove('is-active');
        el.style.transform = '';
      });
    });
  }

  /* ---------- project filter ---------- */
  var filters = qsa('#filters button');
  var cards = qsa('#projectGrid .card');
  var count = qs('#count');
  function applyFilter(f) {
    var n = 0;
    cards.forEach(function (c) {
      var show = f === 'all' || c.getAttribute('data-tags').split(' ').indexOf(f) > -1;
      c.hidden = !show;
      if (show) {
        n++;
        c.style.setProperty('--d', '0ms');
        if (!reduce.matches && c.animate) {
          c.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
            { duration: 450, delay: (n - 1) * 45, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        }
        c.classList.add('in');
      }
    });
    markOrphan();
    if (count) count.textContent = n + (n === 1 ? ' project' : ' projects');
  }
  /* a lone card on the last row stretches across it, so the grid never ends with a gap */
  function markOrphan() {
    var grid = qs('#projectGrid');
    if (!grid) return;
    var cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    var vis = cards.filter(function (c) { return !c.hidden; });
    cards.forEach(function (c) { c.classList.remove('wide'); });
    if (cols > 1 && vis.length > 1 && vis.length % cols === 1) vis[vis.length - 1].classList.add('wide');
  }
  window.addEventListener('resize', markOrphan);
  markOrphan();
  filters.forEach(function (b) {
    b.addEventListener('click', function () {
      filters.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      applyFilter(b.getAttribute('data-f'));
    });
  });

  /* ---------- EMY AI workflow explorer (tabs) ---------- */
  var tabs = qsa('#lab [role="tab"]');
  var panels = qsa('#lab [role="tabpanel"]');
  var auto = null, userTouched = false, labVisible = false;
  function selectTab(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
      panels[k].classList.toggle('show', on);
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { userTouched = true; stopAuto(); selectTab(i); });
    t.addEventListener('keydown', function (e) {
      var k = tabs.indexOf(t), n = tabs.length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); userTouched = true; stopAuto(); selectTab((k + 1) % n, true); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); userTouched = true; stopAuto(); selectTab((k - 1 + n) % n, true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(0, true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(n - 1, true); }
    });
  });
  function current() { return tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; }); }
  function startAuto() {
    if (auto || userTouched || reduce.matches) return;
    auto = setInterval(function () { selectTab((current() + 1) % tabs.length); }, 4200);
  }
  function stopAuto() { clearInterval(auto); auto = null; }
  var lab = qs('#lab');
  if (lab && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      labVisible = entries[0].isIntersecting;
      if (labVisible) startAuto(); else stopAuto();
    }, { threshold: 0.45 }).observe(lab);
    lab.addEventListener('pointerenter', stopAuto);
    lab.addEventListener('pointerleave', function () { if (labVisible) startAuto(); });
    lab.addEventListener('focusin', stopAuto);
  }

  /* ---------- copy email ---------- */
  var toast = qs('#toast'), toastTimer = 0;
  function say(msg) {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  var copyBtn = qs('#copyMail');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var mail = 'atharvay24@gmail.com';
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = mail; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); say(ok ? 'Email copied' : 'Copy failed: ' + mail);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(function () { say('Email copied'); }, fallback);
    else fallback();
  });

  /* ---------- hash on load ---------- */
  if (location.hash && qs(location.hash)) {
    window.addEventListener('load', function () { setTimeout(function () { goTo(location.hash, false); }, 60); });
  }
})();
