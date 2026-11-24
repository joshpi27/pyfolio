/**
 * Cheat Sheet view: searchable, category-filtered Python snippets with copy buttons.
 */

import { highlightPython } from '../highlight.js';
import { icons } from '../icons.js';
import { state } from '../state.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderCheatsheetView(container, params) {
  const data = state.content.cheatsheet || { categories: ['All'], items: [] };
  let activeCat = 'All';
  let query = params?.get('q') || '';

  const page = document.createElement('div');
  page.className = 'page-container';

  page.innerHTML = `
    <header class="lesson-header">
      <div class="eyebrow">Quick Reference</div>
      <h1 class="display-title">Python Cheat Sheet</h1>
      <p class="lead-text">
        Searchable, copy-ready syntax for strings, loops, functions, collections, files, JSON, and dataclasses.
      </p>
    </header>

    <div class="toolbar-row">
      <label class="sr-only" for="cheat-search">Search cheat sheet</label>
      <input
        id="cheat-search"
        type="search"
        class="search-input"
        placeholder="Filter snippets (e.g. f-string, json, dataclass)..."
        value="${escapeHtml(query)}"
      />
      <div class="filter-pills" id="cheat-cats" role="group" aria-label="Filter by topic">
        ${data.categories
          .map(
            (cat) => `
            <button type="button" class="filter-pill" data-cat="${escapeHtml(cat)}" aria-pressed="${cat === activeCat}">
              ${escapeHtml(cat)}
            </button>
          `
          )
          .join('')}
      </div>
    </div>

    <div id="cheat-grid" class="cheat-grid"></div>
  `;

  const searchInput = page.querySelector('#cheat-search');
  const gridEl = page.querySelector('#cheat-grid');
  const catBtns = page.querySelectorAll('#cheat-cats .filter-pill');

  function renderGrid() {
    const q = query.trim().toLowerCase();
    const filtered = data.items.filter((item) => {
      const catOk = activeCat === 'All' || item.category === activeCat;
      const textOk =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return catOk && textOk;
    });

    if (filtered.length === 0) {
      gridEl.innerHTML = `<p class="mono-muted">No snippets match "${escapeHtml(query)}".</p>`;
      return;
    }

    gridEl.innerHTML = filtered
      .map(
        (item) => `
        <article class="cheat-card">
          <div class="cheat-card-head">
            <div>
              <span class="cheat-card-cat">${escapeHtml(item.category)}</span>
              <h2 class="cheat-card-title">${escapeHtml(item.title)}</h2>
            </div>
            <button type="button" class="cell-btn" data-copy-id="${escapeHtml(item.id)}" title="Copy snippet">
              ${icons.copy(13)} <span>Copy</span>
            </button>
          </div>
          <pre class="cheat-pre"><code>${highlightPython(item.code)}</code></pre>
          <div class="cheat-card-foot">
            <span>${escapeHtml(item.note)}</span>
          </div>
        </article>
      `
      )
      .join('');

    gridEl.querySelectorAll('[data-copy-id]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-copy-id');
        const entry = data.items.find((i) => i.id === id);
        if (!entry) return;
        try {
          await navigator.clipboard.writeText(entry.code);
          btn.innerHTML = `${icons.check(13)} <span>Copied</span>`;
          setTimeout(() => {
            btn.innerHTML = `${icons.copy(13)} <span>Copy</span>`;
          }, 1400);
        } catch {
          // Ignore clipboard denial
        }
      });
    });
  }

  searchInput.addEventListener('input', () => {
    query = searchInput.value;
    renderGrid();
  });

  catBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCat = btn.getAttribute('data-cat');
      catBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderGrid();
    });
  });

  renderGrid();
  container.replaceChildren(page);
}
