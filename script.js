/* =========================================================
   Portfolio Core Script (robust + mobile-friendly)
   - Dark/Light toggle with moon/sun logic
   - Reveal-on-scroll with fallback
   - Optional Lenis, GSAP, Particles (safe-guarded)
   - Smooth scroll, back-to-top, header shadow
   - Mobile layout hook via body.mobile-dense
   ========================================================= */

(function () {
  // --- UTILITIES ------------------------------------------------------------
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  // If JS ever fails, keep content visible
  document.documentElement.classList.remove('no-js');

  // --- MOBILE LAYOUT HOOK ---------------------------------------------------
  function applyMobileLayoutClass() {
    const isMobile = window.matchMedia('(max-width: 680px)').matches;
    document.body.classList.toggle('mobile-dense', isMobile);
  }
  applyMobileLayoutClass();
  window.addEventListener('resize', applyMobileLayoutClass);

  // --- YEAR / DATE ----------------------------------------------------------
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const todayEl = $('#today-date');
  if (todayEl) todayEl.textContent = new Date().toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // --- THEME (dark/light) with moon/sun logic ------------------------------
  const body = document.body;
  const toggleBtn = $('#theme-toggle'); // must contain an <i> icon inside
  const iconEl = toggleBtn ? toggleBtn.querySelector('i') : null;

  // Determine initial theme
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = savedTheme || (prefersDark ? 'dark' : 'light');

  function applyTheme(next) {
    theme = next;
    body.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem('theme', theme);

    // Icon logic you asked for:
    // - Light mode shows MOON (click to go dark)
    // - Dark mode shows SUN (click to go light)
    if (iconEl) {
      iconEl.classList.remove('fa-moon', 'fa-sun');
      if (theme === 'light') {
        iconEl.classList.add('fa-moon');
        toggleBtn.setAttribute('aria-label', 'Enable dark mode');
        toggleBtn.title = 'Dark mode';
      } else {
        iconEl.classList.add('fa-sun');
        toggleBtn.setAttribute('aria-label', 'Enable light mode');
        toggleBtn.title = 'Light mode';
      }
    }
  }
  applyTheme(theme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      applyTheme(theme === 'dark' ? 'light' : 'dark');
    });
  }

  // --- SMOOTH SCROLL (Lenis if loaded) -------------------------------------
  let lenis = null;
  try {
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, smoothTouch: false });
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } catch (e) {
    console.warn('Lenis not available — continuing without it.');
  }

  // Smooth in-page anchors
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { duration: 0.9, easing: (x) => 1 - Math.pow(1 - x, 3) });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- HEADER SHADOW + BACK TO TOP -----------------------------------------
  const masthead = $('.masthead-section');
  const topBtn = $('#top-btn');

  function onScroll() {
    if (masthead) masthead.classList.toggle('scrolled', window.scrollY > 50);
    if (topBtn) topBtn.style.display = window.scrollY > 420 ? 'block' : 'none';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (topBtn) {
    topBtn.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0, { duration: 0.9 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- REVEAL-ON-SCROLL (fade-up) with fallback ----------------------------
  const revealTargets = $$('.fade-up, .reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible', 'show');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    // Fallback: just show
    revealTargets.forEach(el => el.classList.add('visible', 'show'));
  }

  // --- OPTIONAL: Parallax on project images (GSAP if available) ------------
  try {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('.project-card').forEach(card => {
        const img = card.querySelector('img');
        if (!img) return;
        gsap.to(img, {
          y: '-12%',
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.4
          }
        });
      });
    }
  } catch (e) {
    console.warn('GSAP/ScrollTrigger not available — skipping parallax.');
  }

  // --- OPTIONAL: particles.js if container exists --------------------------
  try {
    if (window.particlesJS && $('#particles-js')) {
      // If your HTML already initializes particles, skip. Otherwise you can init here.
      // particlesJS('particles-js', { ...config... });
    }
  } catch (e) {
    console.warn('particles.js not available — skipping particles.');
  }

  // --- MOBILE NAV (if you add it) ------------------------------------------
  const navToggle = $('#nav-toggle');
  const mobileMenu = $('#mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
    });
    // Close on link click
    $$('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

})();
