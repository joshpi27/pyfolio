/**
 * Lesson view: explanation, margin note, runnable code cell,
 * "Try breaking it" challenge, 3-question quiz, and Next Lesson button.
 */

import { createNotebookCell } from '../components/notebook-cell.js';
import { createQuizSection } from '../components/quiz.js';
import { icons } from '../icons.js';
import { markLessonCompleted, state, toggleLessonCompleted } from '../state.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderLessonView(container, slug) {
  const indexList = state.content.lessonIndex || [];
  const idx = indexList.findIndex((item) => item.slug === slug);
  const resolvedIdx = idx >= 0 ? idx : 0;
  const meta = indexList[resolvedIdx];
  const lesson = state.content.lessonsBySlug.get(meta.slug);

  if (!lesson) {
    container.innerHTML = `<div class="page-container"><p>Lesson not found.</p></div>`;
    return;
  }

  const prevLesson = resolvedIdx > 0 ? indexList[resolvedIdx - 1] : null;
  const nextLesson = resolvedIdx < indexList.length - 1 ? indexList[resolvedIdx + 1] : null;
  const isDone = state.completedLessons.has(lesson.slug);
  const progressPct = Math.round(((resolvedIdx + 1) / Math.max(1, indexList.length)) * 100);

  const page = document.createElement('article');
  page.className = 'page-container';

  page.innerHTML = `
    <header class="lesson-header">
      <div class="eyebrow">Lesson ${escapeHtml(lesson.number)} of ${String(indexList.length).padStart(2, '0')}</div>
      <h1 class="display-title">${escapeHtml(lesson.title)}</h1>
      <p class="lead-text">${escapeHtml(lesson.subtitle)}</p>
      <div class="lesson-meta-row">
        <span>Estimated time: ${escapeHtml(lesson.readTime)}</span>
        <button type="button" id="lesson-complete-btn" class="btn btn-sm ${isDone ? 'btn-teal' : 'btn-secondary'}">
          ${icons.check(14)}
          <span>${isDone ? 'Completed (this session)' : 'Mark lesson complete'}</span>
        </button>
      </div>
      <div class="lesson-progress-track" aria-hidden="true">
        <div class="lesson-progress-fill" style="width: ${progressPct}%"></div>
      </div>
    </header>

    <div class="notebook-layout">
      <div class="prose-column" id="lesson-prose-col">
        ${lesson.sections
          .map(
            (sec) => `
            <section class="prose-section">
              <h2>${escapeHtml(sec.heading)}</h2>
              ${sec.paragraphs.map((p) => `<p>${p}</p>`).join('')}
              ${
                sec.bullets
                  ? `<ul class="prose-list">${sec.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`
                  : ''
              }
            </section>
          `
          )
          .join('')}

        <div id="main-cell-slot"></div>

        <section class="challenge-box" aria-labelledby="breakit-title">
          <div class="challenge-header">${icons.bug(15)} Try Breaking It</div>
          <h3 id="breakit-title">${escapeHtml(lesson.breakIt.title)}</h3>
          <p>${escapeHtml(lesson.breakIt.prompt)}</p>
          <div id="breakit-cell-slot"></div>
          <div class="challenge-details">
            <button type="button" id="toggle-hint-btn" class="btn btn-sm btn-secondary" aria-expanded="false">
              Show hint
            </button>
            <button type="button" id="load-solution-btn" class="btn btn-sm btn-teal">
              Load working fix into cell
            </button>
          </div>
          <div id="hint-panel" class="disclosure-panel" hidden>
            <strong>Hint:</strong> ${escapeHtml(lesson.breakIt.hint)}
          </div>
        </section>

        <div id="quiz-slot"></div>
      </div>

      <aside class="margin-column" aria-label="Lesson margin notes">
        <div class="margin-note">
          <div class="margin-note-label">${icons.alert(14)} Common Mistakes</div>
          <h3>${escapeHtml(lesson.marginNote.title)}</h3>
          ${lesson.marginNote.paragraphs.map((p) => `<p>${p}</p>`).join('')}
        </div>

        <div class="margin-note margin-note--teal">
          <div class="margin-note-label">${icons.terminal(14)} Notebook Shortcut</div>
          <p>
            Press <code>Ctrl/Cmd + Enter</code> inside any code cell to run it right away, or <code>Ctrl/Cmd + K</code> to jump anywhere.
          </p>
        </div>
      </aside>
    </div>

    <nav class="lesson-nav-footer" aria-label="Lesson pagination">
      <div>
        ${
          prevLesson
            ? `<a href="#/lessons/${prevLesson.slug}" class="btn btn-secondary">
                 ${icons.arrowLeft(15)}
                 <span>Prev: ${escapeHtml(prevLesson.shortTitle)}</span>
               </a>`
            : `<a href="#/" class="btn btn-secondary">
                 ${icons.arrowLeft(15)}
                 <span>Back to Home</span>
               </a>`
        }
      </div>
      <div>
        ${
          nextLesson
            ? `<a href="#/lessons/${nextLesson.slug}" id="next-lesson-link" class="btn btn-primary">
                 <span>Next lesson: ${escapeHtml(nextLesson.shortTitle)}</span>
                 ${icons.arrowRight(15)}
               </a>`
            : `<a href="#/playground" id="next-lesson-link" class="btn btn-primary">
                 <span>Continue to Playground</span>
                 ${icons.arrowRight(15)}
               </a>`
        }
      </div>
    </nav>
  `;

  const mainCell = createNotebookCell({
    title: lesson.mainCell.title,
    code: lesson.mainCell.code,
  });
  page.querySelector('#main-cell-slot').appendChild(mainCell);

  const breakCell = createNotebookCell({
    title: 'Debug this cell',
    code: lesson.breakIt.buggyCode,
    buggy: true,
    runLabel: 'Run & Inspect',
  });
  page.querySelector('#breakit-cell-slot').appendChild(breakCell);

  const hintBtn = page.querySelector('#toggle-hint-btn');
  const hintPanel = page.querySelector('#hint-panel');
  hintBtn.addEventListener('click', () => {
    const nextOpen = hintPanel.hidden;
    hintPanel.hidden = !nextOpen;
    hintBtn.setAttribute('aria-expanded', String(nextOpen));
    hintBtn.textContent = nextOpen ? 'Hide hint' : 'Show hint';
  });

  page.querySelector('#load-solution-btn').addEventListener('click', () => {
    breakCell.setCode(lesson.breakIt.solution);
  });

  page.querySelector('#quiz-slot').appendChild(createQuizSection(lesson.slug, lesson.quiz));

  const completeBtn = page.querySelector('#lesson-complete-btn');
  completeBtn.addEventListener('click', () => {
    toggleLessonCompleted(lesson.slug);
    const nowDone = state.completedLessons.has(lesson.slug);
    completeBtn.className = `btn btn-sm ${nowDone ? 'btn-teal' : 'btn-secondary'}`;
    completeBtn.innerHTML = `${icons.check(14)} <span>${nowDone ? 'Completed (this session)' : 'Mark lesson complete'}</span>`;
  });

  const nextLink = page.querySelector('#next-lesson-link');
  if (nextLink) {
    nextLink.addEventListener('click', () => {
      markLessonCompleted(lesson.slug);
    });
  }

  container.replaceChildren(page);
}
