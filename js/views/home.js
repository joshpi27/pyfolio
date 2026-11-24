/**
 * Home view: hero with site name, one-line promise, live runnable cell,
 * Start learning button, and learning path overview.
 */

import { createNotebookCell } from '../components/notebook-cell.js';
import { icons } from '../icons.js';
import { state } from '../state.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderHomeView(container) {
  const site = state.content.site;
  const lessons = state.content.lessonIndex || [];
  const nextPending = lessons.find((l) => !state.completedLessons.has(l.slug));
  const targetLesson = nextPending || lessons[0];
  const ctaLabel =
    state.completedLessons.size > 0 && nextPending
      ? `Continue Lesson ${nextPending.number}`
      : 'Start learning';
  const targetSlug = targetLesson?.slug || 'variables-strings';

  const page = document.createElement('div');
  page.className = 'page-container';

  page.innerHTML = `
    <section class="hero-section" aria-labelledby="hero-title">
      <div class="hero-grid">
        <div>
          <div class="eyebrow">${escapeHtml(site.heroEyebrow)}</div>
          <h1 id="hero-title" class="display-title">${escapeHtml(site.heroHeadline)}</h1>
          <p class="lead-text">${escapeHtml(site.heroPromise)}</p>
          <div class="hero-actions">
            <a href="#/lessons/${targetSlug}" class="btn btn-primary">
              <span>${ctaLabel}</span>
              ${icons.arrowRight(16)}
            </a>
            <a href="#/playground" class="btn btn-secondary">
              ${icons.terminal(15)}
              <span>Open Playground</span>
            </a>
          </div>
          <div class="hero-meta-strip">
            <span>8 step-by-step lessons</span>
            <span>In-browser Python via Pyodide</span>
            <span>No account or setup needed</span>
          </div>
        </div>
        <div id="hero-cell-slot"></div>
      </div>
    </section>

    <section class="section-block" aria-labelledby="how-title">
      <h2 id="how-title" class="section-title">Designed like a living notebook</h2>
      <div class="how-grid">
        <article class="how-card">
          <div class="how-num">01 / RUN REAL PYTHON</div>
          <h3>No installation required</h3>
          <p>Every code cell runs Python 3 directly in your browser tab with Jupyter-style <code>In [n]</code> / <code>Out [n]</code> counters.</p>
        </article>
        <article class="how-card">
          <div class="how-num">02 / READ THE MARGINS</div>
          <h3>Common mistakes highlighted</h3>
          <p>Each chapter pairs concise explanations with margin notes warning against real bugs like aliasing and mutable defaults.</p>
        </article>
        <article class="how-card">
          <div class="how-num">03 / BREAK &amp; VERIFY</div>
          <h3>Debug challenges + quizzes</h3>
          <p>Fix a deliberately broken cell in every lesson, then test your understanding with a 3-question check.</p>
        </article>
      </div>
    </section>

    <section class="section-block" aria-labelledby="path-title">
      <h2 id="path-title" class="section-title">Learning Path Overview</h2>
      <p class="lead-text" style="margin-bottom: 12px;">
        Each lesson pairs concise reading and common-mistake margin notes with editable Python cells, a debugging challenge, and a short quiz.
      </p>
      <div class="path-grid">
        ${lessons
          .map((lesson) => {
            const done = state.completedLessons.has(lesson.slug);
            return `
              <a href="#/lessons/${lesson.slug}" class="lesson-card">
                <div class="lesson-card-top">
                  <span>Lesson ${lesson.number} &middot; ${escapeHtml(lesson.readTime)}</span>
                  <span class="lesson-card-status">${done ? 'Completed' : 'Start'}</span>
                </div>
                <h3>${escapeHtml(lesson.title)}</h3>
                <p>${escapeHtml(lesson.summary)}</p>
                <div class="lesson-card-tags">
                  ${lesson.tags.map((t) => `<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}
                </div>
              </a>
            `;
          })
          .join('')}
      </div>
    </section>
  `;

  const heroCellSlot = page.querySelector('#hero-cell-slot');
  const heroCell = createNotebookCell({
    title: 'Live Python Preview (click Run)',
    code: site.heroCode,
  });
  heroCellSlot.appendChild(heroCell);

  container.replaceChildren(page);
}
