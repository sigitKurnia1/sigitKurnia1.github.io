/* =================================================================
   Sigit Kurniawan — Portfolio
   main.js  (vanilla JS, no dependencies)

   Handles:
     1. Theme toggle (localStorage + prefers-color-scheme)
     2. Mobile hamburger menu
     3. Scrollspy (active nav link)
     4. Scroll-reveal (respects prefers-reduced-motion)

   NOTE: Theme is applied pre-paint by a tiny inline script in <head>
   to avoid a flash. This file only handles the toggle button + sync.
   ================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     1. THEME TOGGLE
     --------------------------------------------------------------- */
  var themeToggle = document.getElementById('themeToggle');

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
  }

  if (themeToggle) {
    // Set correct initial aria-label based on the theme already applied in <head>.
    setTheme(root.getAttribute('data-theme') || 'dark');

    themeToggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // If the user never chose a theme, follow live OS changes.
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onSchemeChange = function (e) {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (err) { /* ignore */ }
    if (!stored) setTheme(e.matches ? 'dark' : 'light');
  };
  if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
  else if (mq.addListener) mq.addListener(onSchemeChange); // older Safari

  /* ---------------------------------------------------------------
     2. MOBILE HAMBURGER MENU
     --------------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  function closeMenu() {
    if (!navMenu) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }
  function openMenu() {
    navMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });

    // Close after tapping a link (mobile)
    navMenu.addEventListener('click', function (e) {
      if (e.target.closest('.nav__link')) closeMenu();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // Close menu if resized up to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720) closeMenu();
    });
  }

  /* ---------------------------------------------------------------
     2b. "BACK TO TOP" / brand — scroll fully to the top.
         #top sits on the sticky <header>, so a plain anchor jump
         barely moves. Force a true scroll-to-0 instead.
     --------------------------------------------------------------- */
  var topLinks = document.querySelectorAll('a[href="#top"]');
  Array.prototype.forEach.call(topLinks, function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
      // Clear the hash without adding a history entry / jumping.
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    });
  });

  /* ---------------------------------------------------------------
     3. SCROLLSPY — highlight active nav link
     --------------------------------------------------------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var linkById = {};
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').replace('#', '');
    linkById[id] = link;
  });

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id');
            navLinks.forEach(function (l) { l.classList.remove('is-active'); });
            if (linkById[id]) linkById[id].classList.add('is-active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------------
     4. SCROLL-REVEAL
     --------------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // Show everything immediately, no animation.
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObs = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    revealEls.forEach(function (el) { revealObs.observe(el); });
  }
})();
