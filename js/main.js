/**
 * PRODESK IT — main.js
 *
 * Phase 2: Scroll-triggered animations, micro-interactions
 * Phase 3: Dark Mode toggle with localStorage persistence,
 *           hamburger close on nav link click
 */

'use strict';

/* =============================================================
   1. DARK MODE — Phase 3
   State persists across reloads via localStorage
   Respects prefers-color-scheme as default
   ============================================================= */
(function initTheme() {
  const STORAGE_KEY = 'prodesk-theme';
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme) {
    // Restore persisted preference
    root.setAttribute('data-theme', savedTheme);
  } else {
    // Fall back to OS preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
})();

document.addEventListener('DOMContentLoaded', function () {

  /* -----------------------------------------------------------
     2. THEME TOGGLE BUTTON (Phase 3)
     ----------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');
  const root        = document.documentElement;
  const STORAGE_KEY = 'prodesk-theme';

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = root.getAttribute('data-theme');
      const next    = current === 'dark' ? 'light' : 'dark';

      root.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);

      // Update ARIA label for accessibility
      themeToggle.setAttribute(
        'aria-label',
        next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    });

    // Set initial aria-label
    const currentTheme = root.getAttribute('data-theme');
    themeToggle.setAttribute(
      'aria-label',
      currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  /* -----------------------------------------------------------
     3. HAMBURGER — close menu when a mobile nav link is clicked
        Phase 1: minimal JS complement to CSS-only checkbox
     ----------------------------------------------------------- */
  const navToggleCheckbox = document.getElementById('nav-toggle');
  const mobileLinks = document.querySelectorAll('.navbar__mobile-link');

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (navToggleCheckbox) {
        navToggleCheckbox.checked = false;
      }
    });
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (!navToggleCheckbox) return;
    const navbar = document.querySelector('.navbar');
    if (navbar && !navbar.contains(e.target)) {
      navToggleCheckbox.checked = false;
    }
  });

  /* -----------------------------------------------------------
     4. NAVBAR SCROLL STATE
        Slightly elevate navbar on scroll for depth
     ----------------------------------------------------------- */
  const navbar = document.querySelector('.navbar');

  if (navbar) {
    function onScroll() {
      if (window.scrollY > 20) {
        navbar.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
  }

  /* -----------------------------------------------------------
     5. SCROLL-TRIGGERED ANIMATIONS (Phase 2)
        Fade-in-up for section content as it enters viewport
        Uses IntersectionObserver for performance
     ----------------------------------------------------------- */
  const animateEls = document.querySelectorAll(
    '.feature-card, .testi-card, .step, .metric-card, ' +
    '.section-header, .how-it-works__inner, .cta-section__card'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.animationName    = 'fade-in-up';
            entry.target.style.animationDuration = '0.6s';
            entry.target.style.animationFillMode = 'both';
            entry.target.style.animationTimingFunction = 'ease';
            // Stagger children of a grid
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -3rem 0px',
      }
    );

    animateEls.forEach(function (el, i) {
      // Set initial hidden state
      el.style.opacity = '0';
      el.style.transform = 'translateY(1.5rem)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      // Stagger delay based on index within parent
      const delay = (i % 3) * 0.1;
      el.style.transitionDelay = delay + 's';

      observer.observe(el);
    });

    // Override: use transition not animation for scroll elements
    const scrollObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0)';
            scrollObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -2rem 0px',
      }
    );

    animateEls.forEach(function (el) {
      scrollObserver.observe(el);
    });
  } else {
    // Fallback: just show everything
    animateEls.forEach(function (el) {
      el.style.opacity   = '1';
      el.style.transform = 'none';
    });
  }

  /* -----------------------------------------------------------
     6. SMOOTH ANCHOR SCROLLING WITH OFFSET
        Accounts for fixed navbar height (Phase 2 polish)
     ----------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')
      ) || 72;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* -----------------------------------------------------------
     7. ACTIVE NAV LINK — highlight based on scroll position
        (Phase 2 polish / accessibility)
     ----------------------------------------------------------- */
  const sections   = document.querySelectorAll('section[id]');
  const navLinks   = document.querySelectorAll('.navbar__link');

  if (sections.length && navLinks.length) {
    function highlightNav() {
      let current = '';
      const scrollY = window.scrollY;

      sections.forEach(function (section) {
        const sectionTop = section.offsetTop - 120;
        if (scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(function (link) {
        link.removeAttribute('aria-current');
        link.style.color = '';
        if (link.getAttribute('href') === '#' + current) {
          link.setAttribute('aria-current', 'page');
          link.style.color = '#f8fafc';
        }
      });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });
    highlightNav();
  }

  /* -----------------------------------------------------------
     8. STAT COUNTER ANIMATION (Phase 2 — dynamic feedback)
        Counts up numbers when stat cards enter viewport
     ----------------------------------------------------------- */
  const statValues = document.querySelectorAll('[data-count]');

  if (statValues.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const el       = entry.target;
          const target   = parseFloat(el.getAttribute('data-count'));
          const decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
          const duration = 1800;
          const start    = performance.now();

          function update(now) {
            const elapsed  = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = eased * target;

            el.textContent = value.toFixed(decimals);

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              el.textContent = target.toFixed(decimals);
            }
          }

          requestAnimationFrame(update);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    statValues.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  /* -----------------------------------------------------------
     9. PREFERS-COLOR-SCHEME CHANGE LISTENER
        Auto-switch theme if user changes OS setting
        Only applies if no manual preference is saved
     ----------------------------------------------------------- */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    const saved = localStorage.getItem('prodesk-theme');
    if (!saved) {
      document.documentElement.setAttribute(
        'data-theme',
        e.matches ? 'dark' : 'light'
      );
    }
  });

}); // end DOMContentLoaded
