/**
 * In-memory-only session state.
 * Deliberately uses NO browser storage (no localStorage, sessionStorage, indexedDB, or cookies).
 */

const listeners = new Set();

export const state = {
  theme: 'dark',
  executionCount: 0,
  kernelStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'running' | 'error'
  kernelMessage: 'Python Idle',
  completedLessons: new Set(),
  quizAnswers: new Map(), // slug -> { [qIdx]: chosenOptionIdx }
  totalLessons: 8,
  content: {
    site: null,
    lessonIndex: [],
    lessonsBySlug: new Map(),
    playground: null,
    cheatsheet: null,
    glossary: null,
  },
};

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify() {
  for (const fn of listeners) {
    fn(state);
  }
}

export function setTheme(nextTheme) {
  state.theme = nextTheme;
  document.documentElement.setAttribute('data-theme', nextTheme);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', nextTheme === 'dark' ? '#0B1020' : '#FAF8F5');
  }
  notify();
}

export function nextExecutionNumber() {
  state.executionCount += 1;
  notify();
  return state.executionCount;
}

export function setKernelStatus(status, message) {
  state.kernelStatus = status;
  state.kernelMessage = message;
  notify();
}

export function markLessonCompleted(slug) {
  if (!state.completedLessons.has(slug)) {
    state.completedLessons.add(slug);
    notify();
  }
}

export function toggleLessonCompleted(slug) {
  if (state.completedLessons.has(slug)) {
    state.completedLessons.delete(slug);
  } else {
    state.completedLessons.add(slug);
  }
  notify();
}

export function setQuizAnswer(slug, qIndex, optionIndex) {
  const existing = state.quizAnswers.get(slug) || {};
  existing[qIndex] = optionIndex;
  state.quizAnswers.set(slug, existing);
  notify();
}
