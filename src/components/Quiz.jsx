import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/emissionData.js';

export default function Quiz({ answers, onAnswer, onSubmit, isComplete, completedQuestions }) {
  const [currentQ, setCurrentQ] = useState(0);
  const question = QUIZ_QUESTIONS[currentQ];
  const totalQ = QUIZ_QUESTIONS.length;
  const progress = (completedQuestions / totalQ) * 100;

  const handleSelect = (value) => {
    onAnswer(question.id, value);
    if (currentQ < totalQ - 1) {
      setTimeout(() => setCurrentQ((prev) => prev + 1), 200);
    }
  };

  const categoryColors = {
    transport: '#c8f135',
    diet: '#5edb7a',
    energy: '#5eb8db',
    shopping: '#ffaa4d',
  };

  const categoryIcons = {
    transport: '🚗',
    diet: '🍽️',
    energy: '⚡',
    shopping: '🛍️',
  };

  return (
    <main style={styles.container} role="main" id="main-content">
      {/* Hero */}
      <section style={styles.hero} aria-labelledby="hero-heading">
        <h1 id="hero-heading" style={styles.heroTitle}>
          What's your
          <br />
          <em style={styles.heroAccent}>carbon footprint?</em>
        </h1>
        <p style={styles.heroSub}>
          6 questions. 2 minutes. Personalised AI insights.
        </p>
      </section>

      {/* Progress bar */}
      <div style={styles.progressSection} role="progressbar"
        aria-valuenow={completedQuestions}
        aria-valuemin={0}
        aria-valuemax={totalQ}
        aria-label={`Quiz progress: ${completedQuestions} of ${totalQ} questions answered`}
      >
        <div style={styles.progressMeta}>
          <span style={styles.progressLabel}>Progress</span>
          <span style={styles.progressCount}>{completedQuestions}/{totalQ}</span>
        </div>
        <div style={styles.progressTrack}>
          <div
            style={{ ...styles.progressFill, width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Question navigation tabs */}
      <div style={styles.qTabs} role="tablist" aria-label="Quiz questions">
        {QUIZ_QUESTIONS.map((q, i) => (
          <button
            key={q.id}
            role="tab"
            aria-selected={i === currentQ}
            aria-controls={`question-panel-${i}`}
            onClick={() => setCurrentQ(i)}
            style={{
              ...styles.qTab,
              ...(i === currentQ ? styles.qTabActive : {}),
              ...(answers[q.id] ? styles.qTabDone : {}),
            }}
            title={`Question ${i + 1}: ${q.question}`}
            aria-label={`Question ${i + 1}${answers[q.id] ? ' — answered' : ''}`}
          >
            <span aria-hidden="true" style={{ fontSize: '1rem' }}>{categoryIcons[q.category]}</span>
          </button>
        ))}
      </div>

      {/* Question card */}
      <div
        id={`question-panel-${currentQ}`}
        role="tabpanel"
        aria-labelledby={`tab-${currentQ}`}
        style={styles.card}
        key={currentQ}
        className="animate-fade"
      >
        <div style={styles.categoryBadge}>
          <span
            style={{
              ...styles.categoryDot,
              background: categoryColors[question.category],
            }}
            aria-hidden="true"
          />
          {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
        </div>

        <h2 style={styles.questionText} id={`question-${currentQ}`}>
          {question.question}
        </h2>

        <div
          style={styles.optionGrid}
          role="group"
          aria-labelledby={`question-${currentQ}`}
        >
          {question.options.map((option) => {
            const isSelected = answers[question.id] === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                aria-pressed={isSelected}
                style={{
                  ...styles.option,
                  ...(isSelected ? styles.optionSelected : {}),
                }}
              >
                <div style={styles.optionCheck} aria-hidden="true">
                  {isSelected ? '✓' : ''}
                </div>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        <div style={styles.qNav}>
          <button
            onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
            disabled={currentQ === 0}
            style={{ ...styles.navBtn, opacity: currentQ === 0 ? 0.35 : 1 }}
            aria-label="Previous question"
          >
            ← Previous
          </button>
          {currentQ < totalQ - 1 ? (
            <button
              onClick={() => setCurrentQ((p) => p + 1)}
              style={styles.navBtn}
              aria-label="Next question"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={!isComplete}
              style={{
                ...styles.submitBtn,
                opacity: isComplete ? 1 : 0.5,
              }}
              aria-label={isComplete ? 'Calculate my carbon footprint' : 'Please answer all questions first'}
            >
              {isComplete ? '🌍 Calculate My Footprint' : `Answer all ${totalQ} questions`}
            </button>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p style={styles.note}>
        Your data is stored locally on your device only. We never collect or transmit personal information.
      </p>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: 700,
    margin: '0 auto',
    padding: '40px 24px 80px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: 48,
    paddingTop: 20,
  },
  heroTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 'clamp(2.4rem, 6vw, 3.6rem)',
    lineHeight: 1.1,
    color: '#e8e8e0',
    marginBottom: 16,
    letterSpacing: '-0.03em',
  },
  heroAccent: {
    color: '#c8f135',
    fontStyle: 'italic',
  },
  heroSub: {
    color: '#8a9e8a',
    fontSize: '1.05rem',
    letterSpacing: '0.02em',
  },
  progressSection: {
    marginBottom: 28,
  },
  progressMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: '0.8rem',
    color: '#8a9e8a',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  progressLabel: {},
  progressCount: {},
  progressTrack: {
    height: 4,
    background: '#1e2a1e',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #9db82a, #c8f135)',
    borderRadius: 2,
    transition: 'width 0.4s ease',
  },
  qTabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    justifyContent: 'center',
  },
  qTab: {
    width: 44,
    height: 44,
    border: '1px solid #1e2a1e',
    borderRadius: 8,
    background: '#0f160f',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    fontSize: '1.1rem',
  },
  qTabActive: {
    border: '1px solid rgba(200, 241, 53, 0.5)',
    background: 'rgba(200, 241, 53, 0.08)',
  },
  qTabDone: {
    border: '1px solid rgba(94, 219, 122, 0.4)',
  },
  card: {
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 16,
    padding: '32px 28px',
    marginBottom: 20,
  },
  categoryBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.78rem',
    color: '#8a9e8a',
    fontFamily: "'IBM Plex Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 16,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  questionText: {
    fontSize: '1.2rem',
    fontWeight: 500,
    color: '#e8e8e0',
    marginBottom: 24,
    lineHeight: 1.4,
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 10,
    marginBottom: 28,
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#131a13',
    border: '1px solid #1e2a1e',
    borderRadius: 10,
    color: '#c8d4c8',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.9rem',
    transition: 'all 0.18s ease',
    fontFamily: "'Outfit', sans-serif",
    lineHeight: 1.35,
  },
  optionSelected: {
    background: 'rgba(200, 241, 53, 0.1)',
    border: '1px solid rgba(200, 241, 53, 0.4)',
    color: '#e8e8e0',
  },
  optionCheck: {
    width: 20,
    height: 20,
    borderRadius: 4,
    border: '1px solid #2a3a2a',
    background: '#0f160f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: '#c8f135',
    flexShrink: 0,
  },
  qNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  navBtn: {
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid #2a3a2a',
    borderRadius: 8,
    color: '#8a9e8a',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s',
    fontFamily: "'Outfit', sans-serif",
  },
  submitBtn: {
    padding: '12px 28px',
    background: '#c8f135',
    border: 'none',
    borderRadius: 8,
    color: '#0a0f0a',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: '-0.01em',
  },
  note: {
    textAlign: 'center',
    fontSize: '0.78rem',
    color: '#4a5e4a',
    lineHeight: 1.5,
    fontFamily: "'IBM Plex Mono', monospace",
  },
};
