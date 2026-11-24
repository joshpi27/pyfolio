/**
 * Sidebar component: in-memory progress ring and 8-lesson navigation list.
 */

import { icons } from '../icons.js';
import { state } from '../state.js';

export function renderSidebar(container, currentRoute, onCloseMobile) {
  const lessons = state.content.lessonIndex || [];
  const total = lessons.length || state.totalLessons;
  const completedCount = state.completedLessons.size;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  const currentSlug = currentRoute.name === 'lesson' ? currentRoute.slug : null;

  container.innerHTML = `
    <div class="progress-card" aria-label="Session progress tracker">
      <div class="progress-row">
        <div class="progress-ring-wrap" aria-hidden="true">
          <svg class="progress-ring-svg" viewBox="0 0 56 56">
            <circle class="progress-ring-track" cx="28" cy="28" r="${radius}"></circle>
            <circle
              class="progress-ring-fill"
              cx="28"
              cy="28"
              r="${radius}"
              stroke-dasharray="${circumference.toFixed(2)}"
              stroke-dashoffset="${dashOffset.toFixed(2)}"
            ></circle>
          </svg>
          <span class="progress-ring-pct">${pct}%</span>
        </div>
        <div>
          <p class="progress-meta-title">Learning Progress</p>
          <p class="progress-meta-sub">${completedCount} / ${total} lessons done</p>
        </div>
      </div>
      <p class="memory-note">Saved in memory only for this session (no browser storage).</p>
    </div>

    <div class="sidebar-section-label">Learning Path</div>
    <nav aria-label="Lesson list">
      <ul class="sidebar-list">
        ${lessons
          .map((lesson) => {
            const isCurrent = currentSlug === lesson.slug;
            const isDone = state.completedLessons.has(lesson.slug);
            return `
              <li>
                <a
                  href="#/lessons/${lesson.slug}"
                  class="sidebar-link"
                  ${isCurrent ? 'aria-current="page"' : ''}
                  data-completed="${isDone}"
                >
                  <span class="sidebar-step-num">${lesson.number}</span>
                  <span>${lesson.shortTitle}</span>
                  ${isDone ? `<span class="sidebar-check" aria-label="Completed">${icons.check(14)}</span>` : ''}
                </a>
              </li>
            `;
          })
          .join('')}
      </ul>
    </nav>

    <div class="sidebar-mobile-links">
      <div class="sidebar-section-label">Pages</div>
      <ul class="sidebar-list">
        <li><a href="#/" class="sidebar-link" ${currentRoute.name === 'home' ? 'aria-current="page"' : ''}>Home</a></li>
        <li><a href="#/playground" class="sidebar-link" ${currentRoute.name === 'playground' ? 'aria-current="page"' : ''}>Playground</a></li>
        <li><a href="#/cheatsheet" class="sidebar-link" ${currentRoute.name === 'cheatsheet' ? 'aria-current="page"' : ''}>Cheat Sheet</a></li>
        <li><a href="#/glossary" class="sidebar-link" ${currentRoute.name === 'glossary' ? 'aria-current="page"' : ''}>Glossary</a></li>
      </ul>
    </div>
  `;

  if (typeof onCloseMobile === 'function') {
    container.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', onCloseMobile);
    });
  }
}
