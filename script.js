document.documentElement.classList.remove('no-js');
(function () {
  // Smooth scroll (Lenis) — make sure CDN is included in HTML
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    smoothTouch: false
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // set date and year
  const todayEl = document.getElementById('today-date');
  if (todayEl) todayEl.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // theme
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');

  // Determine initial theme and set it explicitly (no hard-coded class in HTML)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  if (initialTheme === 'dark') {
    body.classList.add('dark-mode');
    if (themeToggle) themeToggle.querySelector('i')?.classList.replace('fa-moon', 'fa-sun');
  } else {
    body.classList.remove('dark-mode');
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon && icon.classList.contains('fa-sun')) icon.classList.replace('fa-sun', 'fa-moon');
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = body.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-moon', !isDark);
        icon.classList.toggle('fa-sun', isDark);
      }
    });
  }

  // top button + header shadow
  const topBtn = document.getElementById('top-btn');
  const masthead = document.querySelector('.masthead-section');
  window.addEventListener('scroll', () => {
    if (topBtn) topBtn.style.display = window.scrollY > 420 ? 'block' : 'none';
    if (masthead) {
      if (window.scrollY > 50) masthead.classList.add('scrolled');
      else masthead.classList.remove('scrolled');
    }
  });

  if (topBtn) {
    topBtn.addEventListener('click', () => {
      gsap.to(window, { duration: 0.9, scrollTo: 0, ease: 'power3.out' });
    });
  }

  // GSAP parallax for project images
  if (window.gsap && window.ScrollTrigger) {
    gsap.utils.toArray('.project-card').forEach(card => {
      const img = card.querySelector('img');
      if (!img) return;
      gsap.to(img, {
        y: "-20%",
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5
        }
      });
    });
  }

  // Reveal-on-scroll (IntersectionObserver)
  const reveals = document.querySelectorAll('.fade-up');
  if (reveals.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => io.observe(el));
  }

  // Cursor
  const cursor = document.querySelector('.cursor');
  if (cursor) {
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.addEventListener('mousedown', () => cursor.classList.add('click'));
    document.addEventListener('mouseup', () => cursor.classList.remove('click'));

    const interactiveElements = document.querySelectorAll('a, button, .project-card');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }
})();
