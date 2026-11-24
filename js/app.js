/**
 * Main application bootstrap:
 * loads /content JSON data, wires header/sidebar/theme/command palette,
 * and handles hash-based routing without touching browser storage.
 */

import { initCommandPalette } from './components/command-palette.js';
import { renderSidebar } from './components/sidebar.js';
import { icons } from './icons.js';
import { parseRoute } from './router.js';
import { setTheme, state, subscribe } from './state.js';
import { renderCheatsheetView } from './views/cheatsheet.js';
import { renderGlossaryView } from './views/glossary.js';
import { renderHomeView } from './views/home.js';
import { renderLessonView } from './views/lesson.js';
import { renderPlaygroundView } from './views/playground.js';

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`);
  }
  return res.json();
}

async function loadAllContent() {
  const [site, indexData, playground, cheatsheet, glossary] = await Promise.all([
    fetchJson('./content/site.json'),
    fetchJson('./content/lessons/index.json'),
    fetchJson('./content/playground.json'),
    fetchJson('./content/cheatsheet.json'),
    fetchJson('./content/glossary.json'),
  ]);

  state.content.site = site;
  state.content.lessonIndex = indexData.lessons || [];
  state.totalLessons = state.content.lessonIndex.length;
  state.content.playground = playground;
  state.content.cheatsheet = cheatsheet;
  state.content.glossary = glossary;

  const lessonPayloads = await Promise.all(
    state.content.lessonIndex.map((meta) => fetchJson(`./content/lessons/${meta.number}-${meta.slug}.json`))
  );
  for (const lesson of lessonPayloads) {
    state.content.lessonsBySlug.set(lesson.slug, lesson);
  }
}

function updateHeaderUI() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  const kernelPill = document.getElementById('kernel-status');
  const kernelLabel = kernelPill?.querySelector('.kernel-label');

  if (themeBtn) {
    const isDark = state.theme === 'dark';
    themeBtn.innerHTML = isDark ? icons.sun(18) : icons.moon(18);
    themeBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  if (kernelPill && kernelLabel) {
    kernelPill.setAttribute('data-state', state.kernelStatus);
    kernelLabel.textContent = state.kernelMessage;
  }
}

function updateNavActive(route) {
  const navLinks = document.querySelectorAll('.primary-nav .nav-link');
  navLinks.forEach((link) => {
    const key = link.getAttribute('data-nav');
    const isCurrent =
      (key === 'home' && route.name === 'home') ||
      (key === 'lessons' && route.name === 'lesson') ||
      (key === route.name);
    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function updateDocumentTitle(route) {
  const base = state.content.site?.siteName || 'PyFolio';
  if (route.name === 'home') {
    document.title = `${base} — Learn Python in a Living Notebook`;
  } else if (route.name === 'lesson') {
    const lesson = state.content.lessonsBySlug.get(route.slug);
    document.title = lesson ? `${lesson.number}. ${lesson.title} — ${base}` : `Lesson — ${base}`;
  } else if (route.name === 'playground') {
    document.title = `Playground — ${base}`;
  } else if (route.name === 'cheatsheet') {
    document.title = `Cheat Sheet — ${base}`;
  } else if (route.name === 'glossary') {
    document.title = `Glossary — ${base}`;
  }
}

function setupShellControls() {
  const brandMark = document.querySelector('.brand-mark');
  if (brandMark) brandMark.innerHTML = icons.brandBracket(18);

  const brandName = document.getElementById('brand-name');
  if (brandName && state.content.site?.siteName) {
    brandName.textContent = state.content.site.siteName;
  }

  const brandSub = document.querySelector('.brand-sub');
  if (brandSub && state.content.site?.subtitle) {
    brandSub.textContent = state.content.site.subtitle;
  }

  const cmdIcon = document.querySelector('.cmd-trigger-icon');
  if (cmdIcon) cmdIcon.innerHTML = icons.search(15);

  const kbdHint = document.getElementById('cmd-kbd-hint');
  if (kbdHint && /Mac|iPhone|iPad/i.test(navigator.platform || '')) {
    kbdHint.textContent = 'Cmd+K';
  }

  const themeBtn = document.getElementById('theme-toggle-btn');
  themeBtn.addEventListener('click', () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  const menuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar-drawer');
  const backdrop = document.getElementById('sidebar-backdrop');

  function setDrawerOpen(open) {
    sidebar.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.innerHTML = open ? icons.close(18) : icons.menu(18);
  }

  menuBtn.innerHTML = icons.menu(18);
  menuBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.contains('is-open');
    setDrawerOpen(!isOpen);
  });
  backdrop.addEventListener('click', () => setDrawerOpen(false));

  return () => setDrawerOpen(false);
}

async function bootstrap() {
  const mainEl = document.getElementById('main-content');
  const sidebarEl = document.getElementById('sidebar-drawer');

  try {
    await loadAllContent();
  } catch (err) {
    mainEl.innerHTML = `
      <div class="page-container">
        <h1>Failed to load notebook content</h1>
        <p>${err instanceof Error ? err.message : String(err)}</p>
        <p class="mono-muted">Serve this folder over HTTP (e.g. <code>python -m http.server</code>).</p>
      </div>
    `;
    return;
  }

  const closeMobileDrawer = setupShellControls();
  initCommandPalette();

  let currentRoute = parseRoute();

  function renderCurrentRoute(scrollTop = false) {
    currentRoute = parseRoute();
    updateNavActive(currentRoute);
    updateDocumentTitle(currentRoute);
    renderSidebar(sidebarEl, currentRoute, closeMobileDrawer);

    if (currentRoute.name === 'home') {
      renderHomeView(mainEl);
    } else if (currentRoute.name === 'lesson') {
      renderLessonView(mainEl, currentRoute.slug);
    } else if (currentRoute.name === 'playground') {
      renderPlaygroundView(mainEl, currentRoute.params);
    } else if (currentRoute.name === 'cheatsheet') {
      renderCheatsheetView(mainEl, currentRoute.params);
    } else if (currentRoute.name === 'glossary') {
      renderGlossaryView(mainEl, currentRoute.params);
    }

    if (scrollTop) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      mainEl.focus({ preventScroll: true });
    }
  }

  subscribe(() => {
    updateHeaderUI();
    renderSidebar(sidebarEl, currentRoute, closeMobileDrawer);
  });

  window.addEventListener('hashchange', () => {
    renderCurrentRoute(true);
  });

  updateHeaderUI();
  renderCurrentRoute(false);
}

bootstrap();
