import React, { useState } from 'react';
import { REDUCTION_TIPS, EMISSION_CATEGORIES } from '../data/emissionData.js';
import { calculatePotentialSavings, formatCO2 } from '../utils/calculations.js';

const DIFFICULTY_COLORS = {
  easy: '#5edb7a',
  medium: '#ffaa4d',
  hard: '#ff6b6b',
};

export default function Tips({ result, selectedTips, onToggleTip, onViewPlan }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const totalSavings = calculatePotentialSavings(selectedTips);
  const newFootprint = Math.max(0, result.total - totalSavings);

  const filteredTips = REDUCTION_TIPS.filter((tip) => {
    const catMatch = filterCategory === 'all' || tip.category === filterCategory;
    const diffMatch = filterDifficulty === 'all' || tip.difficulty === filterDifficulty;
    return catMatch && diffMatch;
  });

  const isSelected = (tip) => selectedTips.some((t) => t.id === tip.id);

  return (
    <main style={styles.container} role="main" id="main-content">
      <header style={styles.pageHeader}>
        <h1 style={styles.title}>Reduce Your Footprint</h1>
        <p style={styles.subtitle}>Select actions you're willing to take</p>
      </header>

      {/* Savings summary */}
      {selectedTips.length > 0 && (
        <section
          style={styles.savingsBar}
          aria-live="polite"
          aria-label={`Selected ${selectedTips.length} actions saving ${formatCO2(totalSavings)} per year`}
          className="animate-fade"
        >
          <div style={styles.savingsLeft}>
            <span style={styles.savingsCount}>{selectedTips.length} action{selectedTips.length !== 1 ? 's' : ''} selected</span>
            <span style={styles.savingsSeparator}>·</span>
            <span style={styles.savingsAmount}>
              Save <strong style={{ color: '#c8f135' }}>{formatCO2(totalSavings)}/yr</strong>
            </span>
          </div>
          <div style={styles.savingsRight}>
            <span style={styles.savingsNew}>
              New total: <strong style={{ color: '#5edb7a' }}>{(newFootprint / 1000).toFixed(1)}t CO₂e</strong>
            </span>
            <button onClick={onViewPlan} style={styles.planBtn}>
              View AI Plan →
            </button>
          </div>
        </section>
      )}

      {/* Filters */}
      <div style={styles.filters} role="group" aria-label="Filter tips">
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Category:</span>
          {['all', ...EMISSION_CATEGORIES.map((c) => c.key)].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              aria-pressed={filterCategory === cat}
              style={{
                ...styles.filterBtn,
                ...(filterCategory === cat ? styles.filterBtnActive : {}),
              }}
            >
              {cat === 'all' ? 'All' : EMISSION_CATEGORIES.find((c) => c.key === cat)?.icon + ' ' + cat}
            </button>
          ))}
        </div>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Difficulty:</span>
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              aria-pressed={filterDifficulty === diff}
              style={{
                ...styles.filterBtn,
                ...(filterDifficulty === diff ? styles.filterBtnActive : {}),
              }}
            >
              {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tips grid */}
      <div
        style={styles.tipsGrid}
        role="list"
        aria-label="Reduction tips"
      >
        {filteredTips.map((tip) => {
          const selected = isSelected(tip);
          return (
            <article
              key={tip.id}
              role="listitem"
              style={{
                ...styles.tipCard,
                ...(selected ? styles.tipCardSelected : {}),
              }}
            >
              <div style={styles.tipTop}>
                <span style={styles.tipIcon} aria-hidden="true">{tip.icon}</span>
                <div>
                  <span
                    style={{
                      ...styles.diffBadge,
                      color: DIFFICULTY_COLORS[tip.difficulty],
                      borderColor: DIFFICULTY_COLORS[tip.difficulty] + '40',
                    }}
                  >
                    {tip.difficulty}
                  </span>
                  <span style={styles.catBadge}>
                    {EMISSION_CATEGORIES.find((c) => c.key === tip.category)?.label}
                  </span>
                </div>
              </div>

              <h3 style={styles.tipTitle}>{tip.title}</h3>
              <p style={styles.tipDesc}>{tip.description}</p>

              <div style={styles.tipBottom}>
                <div style={styles.savingPill}>
                  <span style={styles.savingIcon} aria-hidden="true">↓</span>
                  <span>
                    <strong style={{ color: '#c8f135' }}>{formatCO2(tip.co2Saved)}</strong>
                    <span style={{ color: '#4a5e4a' }}>/yr</span>
                  </span>
                </div>
                <button
                  onClick={() => onToggleTip(tip)}
                  aria-pressed={selected}
                  aria-label={`${selected ? 'Remove' : 'Add'} "${tip.title}" to your action plan`}
                  style={{
                    ...styles.toggleBtn,
                    ...(selected ? styles.toggleBtnSelected : {}),
                  }}
                >
                  {selected ? '✓ Selected' : '+ Add'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filteredTips.length === 0 && (
        <div style={styles.emptyState} role="status">
          No tips match your filters. Try adjusting the category or difficulty.
        </div>
      )}
    </main>
  );
}

const styles = {
  container: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '32px 24px 80px',
  },
  pageHeader: {
    marginBottom: 28,
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
    color: '#e8e8e0',
    letterSpacing: '-0.03em',
    marginBottom: 8,
  },
  subtitle: {
    color: '#8a9e8a',
    fontSize: '1rem',
  },
  savingsBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    background: 'rgba(200, 241, 53, 0.06)',
    border: '1px solid rgba(200, 241, 53, 0.2)',
    borderRadius: 12,
    padding: '14px 20px',
    marginBottom: 24,
  },
  savingsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '0.9rem',
  },
  savingsCount: {
    color: '#c8d4c8',
    fontWeight: 500,
  },
  savingsSeparator: {
    color: '#4a5e4a',
  },
  savingsAmount: {
    color: '#c8d4c8',
  },
  savingsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    fontSize: '0.875rem',
  },
  savingsNew: {
    color: '#8a9e8a',
  },
  planBtn: {
    padding: '8px 16px',
    background: '#c8f135',
    border: 'none',
    borderRadius: 8,
    color: '#0a0f0a',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: "'Outfit', sans-serif",
  },
  filters: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 28,
    padding: '16px 20px',
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 12,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '0.75rem',
    color: '#4a5e4a',
    fontFamily: "'IBM Plex Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    minWidth: 70,
  },
  filterBtn: {
    padding: '5px 12px',
    background: 'transparent',
    border: '1px solid #1e2a1e',
    borderRadius: 20,
    color: '#8a9e8a',
    cursor: 'pointer',
    fontSize: '0.8rem',
    textTransform: 'capitalize',
    fontFamily: "'Outfit', sans-serif",
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    background: 'rgba(200, 241, 53, 0.1)',
    border: '1px solid rgba(200, 241, 53, 0.35)',
    color: '#c8f135',
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  tipCard: {
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 14,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    transition: 'all 0.2s ease',
  },
  tipCardSelected: {
    border: '1px solid rgba(200, 241, 53, 0.35)',
    background: 'rgba(200, 241, 53, 0.04)',
  },
  tipTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  tipIcon: {
    fontSize: '1.5rem',
  },
  diffBadge: {
    fontSize: '0.72rem',
    fontFamily: "'IBM Plex Mono', monospace",
    border: '1px solid',
    borderRadius: 4,
    padding: '2px 6px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginRight: 6,
  },
  catBadge: {
    fontSize: '0.72rem',
    color: '#4a5e4a',
    fontFamily: "'IBM Plex Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tipTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#e8e8e0',
    lineHeight: 1.3,
  },
  tipDesc: {
    fontSize: '0.83rem',
    color: '#8a9e8a',
    lineHeight: 1.5,
    flex: 1,
  },
  tipBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  savingPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.83rem',
  },
  savingIcon: {
    color: '#c8f135',
    fontWeight: 700,
  },
  toggleBtn: {
    padding: '7px 14px',
    background: 'transparent',
    border: '1px solid #2a3a2a',
    borderRadius: 8,
    color: '#8a9e8a',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: "'Outfit', sans-serif",
    transition: 'all 0.2s',
  },
  toggleBtnSelected: {
    background: 'rgba(200, 241, 53, 0.12)',
    border: '1px solid rgba(200, 241, 53, 0.4)',
    color: '#c8f135',
  },
  emptyState: {
    textAlign: 'center',
    color: '#4a5e4a',
    padding: '60px 20px',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.85rem',
  },
};
