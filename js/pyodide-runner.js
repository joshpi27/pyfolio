/**
 * In-browser Python runtime backed by Pyodide from jsDelivr CDN.
 * Lazy-loaded on first cell run, serializes execution cleanly,
 * captures stdout/stderr, and isolates cell namespaces.
 */

import { nextExecutionNumber, setKernelStatus } from './state.js';

const PYODIDE_BASE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.5/full/';
const PYODIDE_SCRIPT_URL = `${PYODIDE_BASE_URL}pyodide.js`;

let pyodideInstance = null;
let initPromise = null;
let executionQueue = Promise.resolve();

function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.loadPyodide) resolve();
      else existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load Pyodide runtime from ${src}`));
    document.head.appendChild(script);
  });
}

async function ensurePyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      setKernelStatus('loading', 'Loading Python...');
      await loadExternalScript(PYODIDE_SCRIPT_URL);
      const py = await window.loadPyodide({ indexURL: PYODIDE_BASE_URL });
      pyodideInstance = py;
      setKernelStatus('ready', 'Python Ready');
      return py;
    } catch (err) {
      initPromise = null;
      setKernelStatus('error', 'Runtime Error');
      throw err;
    }
  })();

  return initPromise;
}

/**
 * Execute Python code in Pyodide and return structured cell output.
 * @param {string} code
 * @returns {Promise<{count: number, stdout: string, error: string|null, durationMs: number}>}
 */
export function runPythonCell(code) {
  const task = executionQueue.then(async () => {
    const start = performance.now();
    const count = nextExecutionNumber();

    try {
      const py = await ensurePyodide();
      setKernelStatus('running', `Running [${count}]...`);

      // Automatically load optional Pyodide packages if imported in Playground
      if (typeof py.loadPackagesFromImports === 'function') {
        await py.loadPackagesFromImports(code);
      }

      py.globals.set('_CELL_CODE', code);

      const rawJson = await py.runPythonAsync(`
import json, io, traceback, contextlib

_out_buf = io.StringIO()
_err_buf = io.StringIO()
_error_text = None

try:
    _ns = {"__name__": "__main__"}
    with contextlib.redirect_stdout(_out_buf), contextlib.redirect_stderr(_err_buf):
        _compiled = compile(_CELL_CODE, '<notebook-cell>', 'exec')
        exec(_compiled, _ns, _ns)
except Exception:
    _error_text = traceback.format_exc()

json.dumps({
    "stdout": _out_buf.getvalue(),
    "stderr": _err_buf.getvalue(),
    "error": _error_text,
})
`);

      const parsed = JSON.parse(rawJson);
      const durationMs = Math.round(performance.now() - start);
      setKernelStatus('ready', 'Python Ready');

      const combinedOut = [parsed.stdout, parsed.stderr].filter(Boolean).join('\n');
      return {
        count,
        stdout: combinedOut,
        error: parsed.error || null,
        durationMs,
      };
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      setKernelStatus('error', 'Runtime Error');
      return {
        count,
        stdout: '',
        error: err instanceof Error ? err.message : String(err),
        durationMs,
      };
    }
  });

  executionQueue = task.catch(() => {});
  return task;
}
