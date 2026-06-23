/**
 * PRODESK IT — main.js
 * Hamburger: JS-driven animated slide + fade
 * Animations: staggered fade-up, hero sequence, section reveals
 * Dark mode: toggle + localStorage + prefers-color-scheme
 * Extras: counter, active nav, smooth scroll, scroll spy
 */
'use strict';

/* ================================================================
   1. THEME — runs before paint (also inlined in <head>)
   ================================================================ */
const THEME_KEY = 'prodesk-theme';

function getTheme() {
  const s = localStorage.getItem(THEME_KEY);
  if (s === 'dark' || s === 'light') return s;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(THEME_KEY, t);
  const btn = document.getElementById('theme-btn');
  if (btn) {
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('aria-pressed', String(t === 'light'));
  }
}

applyTheme(getTheme());

/* ================================================================
   2. DOM READY
   ================================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* --------------------------------------------------------------
     2a. THEME TOGGLE
     -------------------------------------------------------------- */
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const cur = document.documentElement.getAttribute('data-theme');
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* --------------------------------------------------------------
     2b. HAMBURGER — fully JS-driven with animation
     -------------------------------------------------------------- */
  const hamburgerBtn  = document.getElementById('hamburger-btn');
  const mobileMenu    = document.getElementById('mobile-menu');
  const menuOverlay   = document.getElementById('menu-overlay');
  const mobileLinks   = document.querySelectorAll('.navbar__mobile-link');
  let   menuOpen      = false;

  function openMenu() {
    menuOpen = true;
    hamburgerBtn.classList.add('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', 'Close navigation menu');

    mobileMenu.classList.add('is-open');
    menuOverlay.classList.add('is-visible');

    document.body.style.overflow = 'hidden';

    // Stagger each mobile link in
    const items = mobileMenu.querySelectorAll('.navbar__mobile-item');
    items.forEach(function (item, i) {
      item.style.transitionDelay = (0.06 + i * 0.055) + 's';
      item.classList.add('is-visible');
    });
  }

  function closeMenu() {
    menuOpen = false;
    hamburgerBtn.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Open navigation menu');

    mobileMenu.classList.remove('is-open');
    menuOverlay.classList.remove('is-visible');

    document.body.style.overflow = '';

    const items = mobileMenu.querySelectorAll('.navbar__mobile-item');
    items.forEach(function (item) {
      item.style.transitionDelay = '0s';
      item.classList.remove('is-visible');
    });
  }

  function toggleMenu() {
    menuOpen ? closeMenu() : openMenu();
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMenu);
  if (menuOverlay)  menuOverlay.addEventListener('click', closeMenu);

  // Close when any mobile nav link is clicked
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  /* --------------------------------------------------------------
     2c. NAVBAR SCROLL STATE
     -------------------------------------------------------------- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    function onScroll() {
      navbar.classList.toggle('navbar--scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------------
     2d. SMOOTH ANCHOR SCROLL with nav offset
     -------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) * 16 || 72;
      const y = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top: y, behavior: 'smooth' });
      if (menuOpen) closeMenu();
    });
  });

  /* --------------------------------------------------------------
     2e. ACTIVE NAV LINK — scroll spy
     -------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link[href^="#"]');

  if (sections.length && navLinks.length) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(function (link) {
          const active = link.getAttribute('href') === '#' + id;
          link.classList.toggle('navbar__link--active', active);
          active
            ? link.setAttribute('aria-current', 'page')
            : link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-38% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* --------------------------------------------------------------
     2f. SECTION REVEAL ANIMATIONS
         Every .reveal element fades up as it enters viewport.
         Children with .reveal--child stagger with delay.
     -------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        ro.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* --------------------------------------------------------------
     2g. COUNTER ANIMATION — data-count attribute
     -------------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');

  if ('IntersectionObserver' in window && counters.length) {
    const co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const raw    = el.getAttribute('data-count');
        const target = parseFloat(raw);
        const dec    = (raw.split('.')[1] || '').length;
        const dur    = 1800;
        const t0     = performance.now();

        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          const v = (1 - Math.pow(1 - p, 3)) * target;
          el.textContent = v.toFixed(dec);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toFixed(dec);
        })(performance.now());

        co.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { co.observe(el); });
  }

  /* --------------------------------------------------------------
     2h. SPARKLINE live update (dashboard panel)
     -------------------------------------------------------------- */
  const sparks = document.querySelectorAll('.dashboard__spark-bar');
  if (sparks.length) {
    setInterval(function () {
      sparks.forEach(function (bar) {
        if (bar.classList.contains('dashboard__spark-bar--peak')) return;
        bar.style.height = Math.floor(Math.random() * 65 + 22) + '%';
      });
    }, 2600);
  }

  /* --------------------------------------------------------------
     2i. COPYRIGHT YEAR
     -------------------------------------------------------------- */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

}); // end DOMContentLoaded
