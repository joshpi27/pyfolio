/**
 * Playground view: free editable Pyodide editor, example snippets, and reset.
 */

import { createNotebookCell } from '../components/notebook-cell.js';
import { state } from '../state.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderPlaygroundView(container, params) {
  const snippets = state.content.playground?.snippets || [];
  const requestedId = params?.get('snippet');
  const initialSnippet = snippets.find((s) => s.id === requestedId) || snippets[0] || {
    id: 'empty',
    title: 'Blank Python Scratchpad',
    description: 'Write and run any Python 3 code in your browser.',
    code: 'print("Hello, Python!")',
  };

  let activeSnippet = initialSnippet;

  const page = document.createElement('div');
  page.className = 'page-container';

  page.innerHTML = `
    <header class="lesson-header">
      <div class="eyebrow">Sandbox</div>
      <h1 class="display-title">Python Playground</h1>
      <p class="lead-text">
        Write and run Python 3 code directly in your browser. Load an example snippet below or reset to a clean cell.
      </p>
    </header>

    <div class="toolbar-row">
      <div class="filter-pills" id="snippet-pills" role="group" aria-label="Load starter snippet">
        ${snippets
          .map(
            (s) => `
            <button
              type="button"
              class="filter-pill"
              data-snippet="${escapeHtml(s.id)}"
              aria-pressed="${s.id === activeSnippet.id}"
            >
              ${escapeHtml(s.title)}
            </button>
          `
          )
          .join('')}
      </div>
      <button type="button" id="clear-playground-btn" class="btn btn-sm btn-secondary">
        Clear to blank cell
      </button>
    </div>

    <p id="snippet-desc" class="mono-muted" style="margin-bottom: 12px;">
      ${escapeHtml(activeSnippet.description)}
    </p>

    <div id="playground-cell-slot"></div>
  `;

  const cell = createNotebookCell({
    title: activeSnippet.title,
    code: activeSnippet.code,
  });

  page.querySelector('#playground-cell-slot').appendChild(cell);

  const pills = page.querySelectorAll('#snippet-pills .filter-pill');
  const descEl = page.querySelector('#snippet-desc');

  pills.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-snippet');
      const found = snippets.find((s) => s.id === id);
      if (!found) return;
      activeSnippet = found;
      pills.forEach((p) => p.setAttribute('aria-pressed', String(p === btn)));
      descEl.textContent = found.description;
      cell.setCode(found.code, { title: found.title, updateBaseline: true });
    });
  });

  page.querySelector('#clear-playground-btn').addEventListener('click', () => {
    pills.forEach((p) => p.setAttribute('aria-pressed', 'false'));
    descEl.textContent = 'Blank Python scratchpad — write your own code and click Run.';
    cell.setCode('# Write your Python code here\n', { title: 'Custom Scratchpad', updateBaseline: true });
  });

  container.replaceChildren(page);
}
