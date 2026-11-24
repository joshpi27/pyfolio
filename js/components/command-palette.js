/**
 * Cmd/Ctrl+K Command Palette to jump to any lesson, cheat sheet entry,
 * playground snippet, or glossary term.
 */

import { icons } from '../icons.js';
import { navigate } from '../router.js';
import { state } from '../state.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function initCommandPalette() {
  const backdrop = document.getElementById('command-palette-backdrop');
  const input = document.getElementById('palette-input');
  const resultsEl = document.getElementById('palette-results');
  const iconSlot = backdrop.querySelector('.palette-search-icon');
  const triggerBtn = document.getElementById('cmd-palette-btn');

  if (iconSlot) iconSlot.innerHTML = icons.search(17);

  let activeIndex = 0;
  let currentMatches = [];
  let lastFocused = null;

  function buildIndex() {
    const items = [];

    for (const lesson of state.content.lessonIndex || []) {
      items.push({
        kind: 'Lesson',
        title: `${lesson.number}. ${lesson.title}`,
        sub: lesson.summary,
        keywords: `${lesson.title} ${lesson.tags.join(' ')} ${lesson.summary}`,
        route: `#/lessons/${lesson.slug}`,
      });
    }

    for (const snippet of state.content.playground?.snippets || []) {
      items.push({
        kind: 'Playground',
        title: snippet.title,
        sub: snippet.description,
        keywords: `${snippet.title} ${snippet.description}`,
        route: `#/playground?snippet=${snippet.id}`,
      });
    }

    for (const sheet of state.content.cheatsheet?.items || []) {
      items.push({
        kind: 'Cheat Sheet',
        title: sheet.title,
        sub: `${sheet.category} — ${sheet.note}`,
        keywords: `${sheet.category} ${sheet.title} ${sheet.note}`,
        route: `#/cheatsheet?q=${encodeURIComponent(sheet.title)}`,
      });
    }

    for (const entry of state.content.glossary?.terms || []) {
      items.push({
        kind: 'Glossary',
        title: entry.term,
        sub: entry.definition,
        keywords: `${entry.term} ${entry.category} ${entry.definition}`,
        route: `#/glossary?q=${encodeURIComponent(entry.term)}`,
      });
    }

    items.push({
      kind: 'Page',
      title: 'Home',
      sub: 'Overview & live Python hero cell',
      keywords: 'home start overview',
      route: '#/',
    });

    return items;
  }

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    const allItems = buildIndex();
    currentMatches = q
      ? allItems.filter((item) => item.keywords.toLowerCase().includes(q) || item.title.toLowerCase().includes(q))
      : allItems.slice(0, 12);

    if (activeIndex >= currentMatches.length) activeIndex = 0;

    if (currentMatches.length === 0) {
      resultsEl.innerHTML = `<div class="palette-empty">No matching lessons, cheat sheet entries, or glossary terms.</div>`;
      return;
    }

    resultsEl.innerHTML = currentMatches
      .slice(0, 18)
      .map((item, idx) => {
        const selected = idx === activeIndex;
        return `
          <button
            type="button"
            class="palette-item"
            role="option"
            aria-selected="${selected}"
            data-idx="${idx}"
          >
            <div>
              <div class="palette-item-title">${escapeHtml(item.title)}</div>
              <div class="palette-item-sub">${escapeHtml(item.sub.slice(0, 88))}${item.sub.length > 88 ? '...' : ''}</div>
            </div>
            <span class="palette-item-kind">${escapeHtml(item.kind)}</span>
          </button>
        `;
      })
      .join('');

    resultsEl.querySelectorAll('.palette-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-idx'));
        choose(idx);
      });
    });

    const selectedBtn = resultsEl.querySelector('[aria-selected="true"]');
    if (selectedBtn) {
      selectedBtn.scrollIntoView({ block: 'nearest' });
    }
  }

  function choose(idx) {
    const target = currentMatches[idx];
    if (!target) return;
    close();
    navigate(target.route);
  }

  function open() {
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    input.value = '';
    activeIndex = 0;
    renderResults('');
    requestAnimationFrame(() => input.focus());
  }

  function close() {
    backdrop.hidden = true;
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  triggerBtn.addEventListener('click', open);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  input.addEventListener('input', () => {
    activeIndex = 0;
    renderResults(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentMatches.length > 0) {
        activeIndex = (activeIndex + 1) % Math.min(currentMatches.length, 18);
        renderResults(input.value);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentMatches.length > 0) {
        const len = Math.min(currentMatches.length, 18);
        activeIndex = (activeIndex - 1 + len) % len;
        renderResults(input.value);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(activeIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (backdrop.hidden) open();
      else close();
    } else if (e.key === 'Escape' && !backdrop.hidden) {
      close();
    }
  });
}
