/**
 * Reusable Jupyter-style editable & runnable Pyodide notebook cell.
 */

import { icons } from '../icons.js';
import { runPythonCell } from '../pyodide-runner.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function updateGutter(textarea, gutterEl) {
  const lines = Math.max(1, textarea.value.split('\n').length);
  const nums = [];
  for (let i = 1; i <= lines; i += 1) {
    nums.push(String(i));
  }
  gutterEl.textContent = nums.join('\n');
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.max(105, Math.min(440, textarea.scrollHeight + 4))}px`;
}

export function createNotebookCell({ title, code, buggy = false, runLabel = 'Run', onSuccess } = {}) {
  let baselineCode = code || '';

  const root = document.createElement('section');
  root.className = `notebook-cell${buggy ? ' notebook-cell--buggy' : ''}`;
  root.setAttribute('aria-label', title || 'Interactive Python cell');

  root.innerHTML = `
    <div class="cell-toolbar">
      <div class="cell-title-group">
        <span class="cell-counter" data-role="in-counter">In [&nbsp;]:</span>
        <span class="cell-label">${escapeHtml(title || 'Python Cell')}</span>
      </div>
      <div class="cell-actions">
        <button type="button" class="cell-btn" data-action="copy" title="Copy code">
          ${icons.copy(13)} <span>Copy</span>
        </button>
        <button type="button" class="cell-btn" data-action="reset" title="Reset cell code">
          ${icons.reset(13)} <span>Reset</span>
        </button>
        <button type="button" class="cell-btn cell-btn--run" data-action="run" title="Run cell (Ctrl/Cmd + Enter)">
          ${icons.play(12)} <span>${escapeHtml(runLabel)}</span>
        </button>
      </div>
    </div>
    <div class="cell-editor-wrap">
      <pre class="cell-gutter" aria-hidden="true"></pre>
      <textarea
        class="cell-textarea"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        aria-label="${escapeHtml(title || 'Python code editor')}"
      ></textarea>
    </div>
    <div class="cell-hint-bar">
      <span>Editable Python 3 (Pyodide)</span>
      <span>Ctrl/Cmd + Enter or Shift + Enter to run</span>
    </div>
    <div class="cell-output" data-role="output" hidden aria-live="polite"></div>
  `;

  const inCounter = root.querySelector('[data-role="in-counter"]');
  const labelEl = root.querySelector('.cell-label');
  const gutter = root.querySelector('.cell-gutter');
  const textarea = root.querySelector('.cell-textarea');
  const outputEl = root.querySelector('[data-role="output"]');
  const runBtn = root.querySelector('[data-action="run"]');
  const resetBtn = root.querySelector('[data-action="reset"]');
  const copyBtn = root.querySelector('[data-action="copy"]');

  textarea.value = baselineCode;
  requestAnimationFrame(() => updateGutter(textarea, gutter));

  textarea.addEventListener('input', () => updateGutter(textarea, gutter));

  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey || e.shiftKey) && e.key === 'Enter') {
      e.preventDefault();
      execute();
    }
  });

  async function execute() {
    runBtn.disabled = true;
    const origRunHtml = runBtn.innerHTML;
    runBtn.innerHTML = `${icons.terminal(12)} <span>Running...</span>`;
    outputEl.hidden = false;
    outputEl.innerHTML = `<p class="mono-muted" style="margin:0;">Executing in browser Python runtime...</p>`;

    const result = await runPythonCell(textarea.value);
    inCounter.textContent = `In [${result.count}]:`;

    const statusBadge = result.error
      ? `<span class="cell-status-pill cell-status-pill--err">Error</span>`
      : buggy
      ? `<span class="cell-status-pill cell-status-pill--ok">${icons.check(12)} Fixed</span>`
      : `<span class="cell-status-pill cell-status-pill--ok">${icons.check(12)} Passed</span>`;

    const parts = [];
    parts.push(`
      <div class="cell-output-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="cell-out-tag">Out [${result.count}]:</span>
          ${statusBadge}
        </div>
        <span>${result.durationMs} ms</span>
      </div>
    `);

    if (result.stdout) {
      parts.push(`<pre class="cell-stdout">${escapeHtml(result.stdout)}</pre>`);
    }

    if (result.error) {
      parts.push(`<pre class="cell-error">${escapeHtml(result.error)}</pre>`);
    } else if (!result.stdout) {
      parts.push(`<p class="mono-muted" style="margin:0;">(Cell completed with no printed output.)</p>`);
    }

    outputEl.innerHTML = parts.join('');
    runBtn.disabled = false;
    runBtn.innerHTML = origRunHtml;

    if (!result.error && typeof onSuccess === 'function') {
      onSuccess(result);
    }
  }

  runBtn.addEventListener('click', execute);

  resetBtn.addEventListener('click', () => {
    textarea.value = baselineCode;
    updateGutter(textarea, gutter);
    outputEl.hidden = true;
    outputEl.innerHTML = '';
    inCounter.innerHTML = 'In [&nbsp;]:';
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(textarea.value);
      copyBtn.innerHTML = `${icons.check(13)} <span>Copied</span>`;
      setTimeout(() => {
        copyBtn.innerHTML = `${icons.copy(13)} <span>Copy</span>`;
      }, 1400);
    } catch {
      textarea.select();
    }
  });

  root.setCode = (nextCode, { title: nextTitle, updateBaseline = false } = {}) => {
    if (updateBaseline) {
      baselineCode = nextCode;
    }
    if (nextTitle) {
      if (labelEl) labelEl.textContent = nextTitle;
      root.setAttribute('aria-label', nextTitle);
      textarea.setAttribute('aria-label', nextTitle);
    }
    textarea.value = nextCode;
    updateGutter(textarea, gutter);
    outputEl.hidden = true;
    outputEl.innerHTML = '';
    inCounter.innerHTML = 'In [&nbsp;]:';
  };

  root.getCode = () => textarea.value;
  root.runCell = execute;

  return root;
}
