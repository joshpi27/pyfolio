/**
 * Glossary view: searchable Python terms with plain-language definitions.
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

export function renderGlossaryView(container, params) {
  const terms = state.content.glossary?.terms || [];
  let query = params?.get('q') || '';

  const page = document.createElement('div');
  page.className = 'page-container';

  page.innerHTML = `
    <header class="lesson-header">
      <div class="eyebrow">Vocabulary</div>
      <h1 class="display-title">Python Glossary</h1>
      <p class="lead-text">
        Plain-language definitions of the core Python terms and common pitfalls covered in the lessons.
      </p>
    </header>

    <div class="toolbar-row">
      <label class="sr-only" for="glossary-search">Search glossary terms</label>
      <input
        id="glossary-search"
        type="search"
        class="search-input"
        placeholder="Search terms (e.g. immutable, scope, aliasing, JSON)..."
        value="${escapeHtml(query)}"
      />
      <span id="glossary-count" class="mono-muted"></span>
    </div>

    <div id="glossary-list" class="glossary-list"></div>
  `;

  const searchInput = page.querySelector('#glossary-search');
  const listEl = page.querySelector('#glossary-list');
  const countEl = page.querySelector('#glossary-count');

  function renderList() {
    const q = query.trim().toLowerCase();
    const filtered = terms.filter(
      (t) =>
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );

    countEl.textContent = `${filtered.length} of ${terms.length} terms`;

    if (filtered.length === 0) {
      listEl.innerHTML = `<p class="mono-muted">No glossary terms match "${escapeHtml(query)}".</p>`;
      return;
    }

    listEl.innerHTML = filtered
      .map(
        (t) => `
        <article class="glossary-item">
          <div class="glossary-item-top">
            <h2 class="glossary-term">${escapeHtml(t.term)}</h2>
            <span class="tag-chip">${escapeHtml(t.category)}</span>
          </div>
          <p class="glossary-def">${escapeHtml(t.definition)}</p>
          ${t.example ? `<pre class="glossary-example"><code>${highlightPython(t.example)}</code></pre>` : ''}
          ${
            t.lessonSlug
              ? `<a href="#/lessons/${escapeHtml(t.lessonSlug)}" style="font-size:0.86rem; display:inline-flex; align-items:center; gap:5px;">
                   <span>See in lesson</span> ${icons.arrowRight(13)}
                 </a>`
              : ''
          }
        </article>
      `
      )
      .join('');
  }

  searchInput.addEventListener('input', () => {
    query = searchInput.value;
    renderList();
  });

  renderList();
  container.replaceChildren(page);
}
