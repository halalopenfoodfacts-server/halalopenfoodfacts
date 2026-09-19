(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Progress bar + header scroll effect */
  var siteHeader = document.querySelector('.site-header');
  var scrollThreshold = 40;
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var scrolled = scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    var bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = scrolled + '%';
    // Header glassmorphism renforcé au scroll
    if (siteHeader) {
      siteHeader.classList.toggle('is-scrolled', scrollTop > scrollThreshold);
    }
  }, { passive: true });

  /* Mobile nav toggle */
  var toggle = document.getElementById('nav-toggle');
  var controls = document.getElementById('header-controls');
  if (toggle && controls) {
    toggle.addEventListener('click', function () {
      var open = controls.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* Animated counters (stat-card + inline hero count) */
  var counters = document.querySelectorAll('[data-count]');
  var fmt = function (n) { return Math.floor(n).toLocaleString('fr-FR'); };
  if ('IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10);
        if (!target) return;
        if (reduceMotion) { el.textContent = fmt(target); counterObserver.unobserve(el); return; }
        var start = null;
        var duration = 1500;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(eased * target);
          if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
        }
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = fmt(parseInt(el.dataset.count, 10) || 0); });
  }

  /* Scroll reveal */
  var revealTargets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* Ticker content */
  var tickerItems = [
    '✅ Nutella B-Ready — vérifié conforme', '🚫 Marshmallows Haribo — gélatine détectée',
    '✅ Sauce Soja Kikkoman — conforme', '✅ Lait UHT Lactel — conforme',
    '🚫 Bonbons Skittles — E120 (carmin)', '✅ Houmous Sabra — vérifié conforme'
  ];
  var track = document.getElementById('tickerTrack');
  if (track) {
    tickerItems.concat(tickerItems).forEach(function (t) {
      var span = document.createElement('span');
      span.innerHTML = t.replace(/^(✅|🚫)\s(.+?)\s—\s(.+)$/, function (m, icon, name, note) {
        return icon + ' <b>' + name + '</b> — ' + note;
      });
      track.appendChild(span);
    });
  }

  /* Steps accordion */
  document.querySelectorAll('.step').forEach(function (step) {
    step.addEventListener('click', function () {
      document.querySelectorAll('.step').forEach(function (s) { s.classList.remove('is-active'); });
      step.classList.add('is-active');
    });
  });

  // Note BUG-01 fix : les états visuels des .filter-btn et .chip sont gérés exclusivement
  // par app.js pour éviter la désynchronisation entre l'état visuel et l'état du filtre.

  /* Voyage: update info panel (in addition to whatever voyage.js already does) */
  var vpFlag = document.getElementById('vp-flag');
  var vpTitle = document.getElementById('vp-title');
  var vpText = document.getElementById('vp-text');
  document.querySelectorAll('.voyage-country').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.voyage-country').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      if (vpFlag) vpFlag.textContent = btn.dataset.flag || '🌍';
      if (vpTitle) vpTitle.textContent = btn.dataset.title || btn.textContent;
      if (vpText) vpText.textContent = btn.dataset.text || '';
    });
  });

  /* Testimonial carousel */
  var slides = document.querySelectorAll('.slide');
  var dots = document.querySelectorAll('.dot-btn');
  var slideIndex = 0;
  function showSlide(i) {
    slides.forEach(function (s) { s.classList.remove('is-active'); });
    dots.forEach(function (d) { d.classList.remove('is-active'); });
    if (slides[i]) slides[i].classList.add('is-active');
    if (dots[i]) dots[i].classList.add('is-active');
    slideIndex = i;
  }
  dots.forEach(function (d, i) { d.addEventListener('click', function () { showSlide(i); }); });
  if (slides.length) { setInterval(function () { showSlide((slideIndex + 1) % slides.length); }, 5000); }
})();