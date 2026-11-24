/**
 * Interactive 3-question quiz component with immediate feedback and in-memory tracking.
 */

import { markLessonCompleted, setQuizAnswer, state } from '../state.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function createQuizSection(lessonSlug, questions = []) {
  const card = document.createElement('section');
  card.className = 'quiz-card';
  card.setAttribute('aria-labelledby', `quiz-title-${lessonSlug}`);

  function render() {
    const saved = state.quizAnswers.get(lessonSlug) || {};
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (typeof saved[idx] === 'number' && saved[idx] === q.answerIndex) {
        correctCount += 1;
      }
    });

    card.innerHTML = `
      <div class="quiz-header">
        <h3 id="quiz-title-${lessonSlug}">Check Your Understanding</h3>
        <span class="quiz-score-pill">${correctCount} / ${questions.length} correct</span>
      </div>
      ${questions
        .map((q, qIdx) => {
          const chosen = saved[qIdx];
          const isAnswered = typeof chosen === 'number';
          const isCorrect = isAnswered && chosen === q.answerIndex;

          return `
            <div class="quiz-question" data-q="${qIdx}">
              <p class="quiz-prompt">${qIdx + 1}. ${escapeHtml(q.question)}</p>
              <div class="quiz-options" role="group" aria-label="Question ${qIdx + 1} options">
                ${q.options
                  .map((opt, optIdx) => {
                    let optionState = '';
                    if (isAnswered) {
                      if (optIdx === q.answerIndex) optionState = 'correct';
                      else if (optIdx === chosen) optionState = 'incorrect';
                    }
                    return `
                      <button
                        type="button"
                        class="quiz-option"
                        data-q="${qIdx}"
                        data-opt="${optIdx}"
                        ${optionState ? `data-state="${optionState}"` : ''}
                        aria-pressed="${chosen === optIdx}"
                      >
                        ${escapeHtml(opt)}
                      </button>
                    `;
                  })
                  .join('')}
              </div>
              ${
                isAnswered
                  ? `<div class="quiz-feedback" data-correct="${isCorrect}">
                       <strong>${isCorrect ? 'Correct.' : 'Not quite.'}</strong> ${escapeHtml(q.explanation)}
                     </div>`
                  : ''
              }
            </div>
          `;
        })
        .join('')}
    `;

    card.querySelectorAll('.quiz-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qIdx = Number(btn.getAttribute('data-q'));
        const optIdx = Number(btn.getAttribute('data-opt'));
        setQuizAnswer(lessonSlug, qIdx, optIdx);

        const updated = state.quizAnswers.get(lessonSlug) || {};
        if (Object.keys(updated).length >= questions.length) {
          markLessonCompleted(lessonSlug);
        }
        render();
      });
    });
  }

  render();
  return card;
}
