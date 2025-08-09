
// script.js
// Improvements: cache GitHub response in localStorage for short time,
// build DOM with DocumentFragment, lazy images, IntersectionObserver reveals,
// accessible controls, and efficient event handling.

(function () {
  const GITHUB_USER = 'mdadeel';
  const REPO_COUNT = 6; // Fetch more for filtering
  const CACHE_KEY = 'gh_repos_cache_v2';
  const CACHE_TTL = 1000 * 60 * 15; // 15 minutes
  const PROJECT_GRID = document.getElementById('project-grid');
  const FILTERS_CONTAINER = document.getElementById('project-filters');

  let allRepos = []; // To store all fetched repos

  // set date and year
  const todayEl = document.getElementById('today-date');
  if (todayEl) todayEl.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // theme
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
  }

  themeToggle.addEventListener('click', () => {
    const isDark = body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-moon');
      icon.classList.toggle('fa-sun');
    }
  });

  // top button
  const topBtn = document.getElementById('top-btn');
  const masthead = document.querySelector('.masthead-section');
  window.addEventListener('scroll', () => {
    topBtn.style.display = window.scrollY > 420 ? 'block' : 'none';
    if (window.scrollY > 50) {
        masthead.classList.add('scrolled');
    } else {
        masthead.classList.remove('scrolled');
    }
  });
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // reveal animation observer
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
      } else {
        e.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

  // small utility to escape text
  function esc(s) {
    return String(s || '').replace(/[&<>"'\/]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' }[c]));
  }

  // build single project card element
  function buildCard(repo, idx) {
    const a = document.createElement('a');
    a.className = 'project-card';
    a.href = repo.html_url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.dataset.lang = repo.language || 'Unknown';

    // Use curated illustrations
    const imgUrl = `https://source.unsplash.com/random/800x600?sig=${idx}&nature,water,minimal`;

    a.innerHTML = `
      <div class="project-media">
        <img loading="lazy" src="${imgUrl}" alt="${esc(repo.name)} screenshot">
      </div>
      <div class="project-body">
        <h4 class="project-title">${esc(repo.name)}</h4>
        <p class="project-desc">${esc(repo.description) || 'No description provided.'}</p>
        <div class="project-meta">
          <span class="badge">${esc(repo.language) || 'Unknown'}</span>
          <span class="muted">★ ${repo.stargazers_count || 0}</span>
        </div>
      </div>
    `;
    return a;
  }

  // render projects into grid using fragment
  function renderProjects(list) {
    PROJECT_GRID.innerHTML = '';
    if (!list || list.length === 0) {
      PROJECT_GRID.innerHTML = '<p class="muted">No public repositories found</p>';
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach((r, i) => {
      frag.appendChild(buildCard(r, i));
    });
    PROJECT_GRID.appendChild(frag);
  }

  // Setup filters
  function setupFilters(repos) {
    const languages = ['All', ...new Set(repos.map(r => r.language).filter(Boolean))];
    FILTERS_CONTAINER.innerHTML = '';
    languages.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      if (lang === 'All') btn.classList.add('active');
      btn.textContent = lang;
      btn.dataset.lang = lang;
      FILTERS_CONTAINER.appendChild(btn);
    });
  }

  FILTERS_CONTAINER.addEventListener('click', e => {
    if (e.target.tagName !== 'BUTTON') return;
    const selectedLang = e.target.dataset.lang;

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === selectedLang);
    });

    const filteredRepos = selectedLang === 'All'
      ? allRepos
      : allRepos.filter(repo => repo.language === selectedLang);
    
    renderProjects(filteredRepos);
  });

  // fetch with caching
  function fetchWithCache() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const obj = JSON.parse(cached);
        if (Date.now() - obj.t < CACHE_TTL && Array.isArray(obj.repos)) {
          allRepos = obj.repos;
          setupFilters(allRepos);
          renderProjects(allRepos);
          // Optional: fetch in background to update cache if needed
          // fetchAndCache(true); 
          return;
        }
      } catch (e) {
        // continue to fetch
      }
    }
    fetchAndCache(false);
  }

  // perform network fetch and update cache
  function fetchAndCache(silent) {
    const url = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
    if (!silent) PROJECT_GRID.innerHTML = '<p class="muted">Loading projects from GitHub...</p>';
    
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('GitHub fetch failed');
        return r.json();
      })
      .then(list => {
        allRepos = list.filter(r => !r.fork).sort((a,b)=> new Date(b.updated_at) - new Date(a.updated_at)).slice(0, REPO_COUNT);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), repos: allRepos }));
        setupFilters(allRepos);
        renderProjects(allRepos);
      })
      .catch(err => {
        console.error(err);
        if (!silent) {
          PROJECT_GRID.innerHTML = '<p class="muted">Unable to load projects from GitHub. Try again later.</p>';
        }
        const cached = localStorage.getItem(CACHE_KEY);
        if(cached) {
            try {
                allRepos = JSON.parse(cached).repos;
                setupFilters(allRepos);
                renderProjects(allRepos);
            } catch(e){}
        }
      });
  }

  // initial load
  fetchWithCache();
})();
