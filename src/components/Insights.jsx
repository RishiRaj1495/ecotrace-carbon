import React, { useState, useEffect } from 'react';
import { getAIInsights, getActionPlan } from '../utils/geminiService.js';
import { formatCO2, calculatePotentialSavings } from '../utils/calculations.js';
import { isValidApiKey } from '../utils/calculations.js';

export default function Insights({ result, selectedTips, apiKey, onApiKeyChange }) {
  const [insights, setInsights] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [showKeyInput, setShowKeyInput] = useState(!apiKey);
  const [activeTab, setActiveTab] = useState('insights');

  const totalSavings = calculatePotentialSavings(selectedTips);

  const loadInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const text = await getAIInsights(result, apiKey);
      setInsights(text);
    } catch (e) {
      setError('Failed to load insights. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  const loadActionPlan = async () => {
    setPlanLoading(true);
    setError('');
    try {
      const text = await getActionPlan(result, selectedTips, apiKey);
      setActionPlan(text);
    } catch (e) {
      setError('Failed to generate action plan.');
    } finally {
      setPlanLoading(false);
    }
  };

  useEffect(() => {
    if (result) loadInsights();
  }, [result, apiKey]);

  useEffect(() => {
    if (activeTab === 'plan' && selectedTips.length > 0 && !actionPlan) {
      loadActionPlan();
    }
  }, [activeTab]);

  const handleSaveKey = () => {
    const trimmed = keyInput.trim();
    onApiKeyChange(trimmed);
    setShowKeyInput(false);
    if (trimmed) {
      loadInsights();
    }
  };

  const formatInsightText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return null;
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
      const isHeader = line.includes('**');
      const cleaned = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return (
        <p
          key={i}
          style={isBullet ? styles.bulletLine : isHeader ? styles.headerLine : styles.textLine}
          dangerouslySetInnerHTML={{ __html: cleaned }}
        />
      );
    });
  };

  return (
    <main style={styles.container} role="main" id="main-content">
      <header style={styles.pageHeader}>
        <h1 style={styles.title}>
          AI Insights
          <span style={styles.titleBadge} aria-label="Powered by Google Gemini">
            ✦ Gemini
          </span>
        </h1>
        <p style={styles.subtitle}>Personalised analysis powered by Google's Gemini AI</p>
      </header>

      {/* Summary stat row */}
      <div style={styles.statRow} role="region" aria-label="Key metrics">
        <div style={styles.statCard}>
          <div style={styles.statValue}>{(result.total / 1000).toFixed(1)}t</div>
          <div style={styles.statLabel}>Current CO₂e/yr</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#5edb7a' }}>
            {totalSavings > 0 ? `-${formatCO2(totalSavings)}` : '—'}
          </div>
          <div style={styles.statLabel}>Potential saving</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#5eb8db' }}>{selectedTips.length}</div>
          <div style={styles.statLabel}>Actions selected</div>
        </div>
      </div>

      {/* API Key setup */}
      <div style={styles.apiSection}>
        <div style={styles.apiHeader}>
          <div style={styles.apiStatus}>
            <span style={{
              ...styles.apiDot,
              background: apiKey ? '#5edb7a' : '#4a5e4a',
            }} aria-hidden="true" />
            <span style={{ fontSize: '0.82rem', color: apiKey ? '#5edb7a' : '#4a5e4a' }}>
              {apiKey ? 'Google Gemini connected' : 'Using fallback insights'}
            </span>
          </div>
          <button
            onClick={() => setShowKeyInput((v) => !v)}
            style={styles.configBtn}
            aria-expanded={showKeyInput}
            aria-controls="api-key-form"
          >
            {showKeyInput ? '↑ Hide' : '⚙ Configure API Key'}
          </button>
        </div>

        {showKeyInput && (
          <div id="api-key-form" style={styles.keyForm} className="animate-fade">
            <p style={styles.keyInfo}>
              Add your{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#c8f135' }}
              >
                Google Gemini API key
              </a>{' '}
              for personalised AI insights. Your key is stored locally only.
            </p>
            <div style={styles.keyInputRow}>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIza..."
                style={styles.keyInput}
                aria-label="Google Gemini API key"
                autoComplete="off"
                spellCheck={false}
                maxLength={100}
              />
              <button onClick={handleSaveKey} style={styles.saveKeyBtn}>
                Save & Apply
              </button>
              {apiKey && (
                <button
                  onClick={() => { onApiKeyChange(''); setKeyInput(''); setShowKeyInput(false); }}
                  style={styles.clearKeyBtn}
                  aria-label="Remove API key"
                >
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tab nav */}
      <div style={styles.tabs} role="tablist" aria-label="Insight sections">
        {[
          { id: 'insights', label: '🔍 Analysis' },
          { id: 'plan', label: '📋 30-Day Plan' },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Insights panel */}
      {activeTab === 'insights' && (
        <section
          id="tab-panel-insights"
          role="tabpanel"
          aria-label="AI analysis of your carbon footprint"
          style={styles.insightPanel}
        >
          {loading ? (
            <div style={styles.loadingState} aria-live="polite" aria-busy="true">
              <div style={styles.spinner} aria-hidden="true" />
              <span>Gemini is analysing your footprint…</span>
            </div>
          ) : error ? (
            <div style={styles.errorState} role="alert">
              <span>⚠️ {error}</span>
              <button onClick={loadInsights} style={styles.retryBtn}>Retry</button>
            </div>
          ) : (
            <>
              <div style={styles.insightContent} aria-label="AI insights">
                {formatInsightText(insights)}
              </div>
              <button onClick={loadInsights} style={styles.refreshBtn} aria-label="Refresh insights">
                ↻ Refresh
              </button>
            </>
          )}
        </section>
      )}

      {/* Action plan panel */}
      {activeTab === 'plan' && (
        <section
          id="tab-panel-plan"
          role="tabpanel"
          aria-label="30-day action plan"
          style={styles.insightPanel}
        >
          {selectedTips.length === 0 ? (
            <div style={styles.emptyPlan} role="status">
              <p style={{ fontSize: '2rem', marginBottom: 12 }} aria-hidden="true">🌱</p>
              <p style={{ color: '#8a9e8a', marginBottom: 8 }}>No actions selected yet.</p>
              <p style={{ color: '#4a5e4a', fontSize: '0.85rem' }}>
                Go to the <strong style={{ color: '#c8f135' }}>Reduce</strong> tab and pick some tips to generate your personalised 30-day plan.
              </p>
            </div>
          ) : planLoading ? (
            <div style={styles.loadingState} aria-live="polite" aria-busy="true">
              <div style={styles.spinner} aria-hidden="true" />
              <span>Generating your 30-day plan…</span>
            </div>
          ) : (
            <>
              <div style={styles.selectedTipList} aria-label="Selected actions">
                {selectedTips.map((tip) => (
                  <span key={tip.id} style={styles.selectedTipPill}>
                    {tip.icon} {tip.title}
                  </span>
                ))}
              </div>
              <div style={styles.insightContent}>
                {formatInsightText(actionPlan)}
              </div>
              <button onClick={loadActionPlan} style={styles.refreshBtn} aria-label="Regenerate plan">
                ↻ Regenerate
              </button>
            </>
          )}
        </section>
      )}
    </main>
  );
}

const styles = {
  container: {
    maxWidth: 800,
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
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  titleBadge: {
    fontSize: '0.75rem',
    fontFamily: "'IBM Plex Mono', monospace",
    color: '#c8f135',
    background: 'rgba(200, 241, 53, 0.1)',
    border: '1px solid rgba(200, 241, 53, 0.25)',
    borderRadius: 20,
    padding: '4px 10px',
    letterSpacing: '0.05em',
  },
  subtitle: {
    color: '#8a9e8a',
    fontSize: '0.95rem',
  },
  statRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 12,
    padding: '16px',
    textAlign: 'center',
  },
  statValue: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.6rem',
    color: '#c8f135',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: '0.72rem',
    color: '#4a5e4a',
    fontFamily: "'IBM Plex Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  apiSection: {
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 20,
  },
  apiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  apiStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  apiDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  configBtn: {
    background: 'transparent',
    border: '1px solid #2a3a2a',
    borderRadius: 6,
    color: '#8a9e8a',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '6px 12px',
    fontFamily: "'Outfit', sans-serif",
  },
  keyForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: '1px solid #1e2a1e',
  },
  keyInfo: {
    fontSize: '0.83rem',
    color: '#8a9e8a',
    marginBottom: 12,
    lineHeight: 1.5,
  },
  keyInputRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  keyInput: {
    flex: 1,
    minWidth: 200,
    padding: '10px 14px',
    background: '#131a13',
    border: '1px solid #2a3a2a',
    borderRadius: 8,
    color: '#e8e8e0',
    fontSize: '0.9rem',
    fontFamily: "'IBM Plex Mono', monospace",
    outline: 'none',
  },
  saveKeyBtn: {
    padding: '10px 18px',
    background: '#c8f135',
    border: 'none',
    borderRadius: 8,
    color: '#0a0f0a',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: "'Outfit', sans-serif",
    whiteSpace: 'nowrap',
  },
  clearKeyBtn: {
    padding: '10px 14px',
    background: 'transparent',
    border: '1px solid #2a3a2a',
    borderRadius: 8,
    color: '#ff6b6b',
    cursor: 'pointer',
    fontSize: '0.83rem',
    fontFamily: "'Outfit', sans-serif",
  },
  tabs: {
    display: 'flex',
    gap: 4,
    marginBottom: 16,
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    border: 'none',
    borderRadius: 7,
    color: '#8a9e8a',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: "'Outfit', sans-serif",
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#131a13',
    color: '#e8e8e0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
  },
  insightPanel: {
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 14,
    padding: '28px 24px',
    minHeight: 200,
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    padding: '40px 0',
    color: '#8a9e8a',
    fontSize: '0.9rem',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #1e2a1e',
    borderTopColor: '#c8f135',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#ff6b6b',
    fontSize: '0.875rem',
    gap: 12,
  },
  retryBtn: {
    padding: '7px 14px',
    background: 'transparent',
    border: '1px solid rgba(255,107,107,0.3)',
    borderRadius: 7,
    color: '#ff6b6b',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: "'Outfit', sans-serif",
  },
  insightContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  bulletLine: {
    fontSize: '0.92rem',
    color: '#c8d4c8',
    lineHeight: 1.6,
    paddingLeft: 4,
    borderLeft: '2px solid rgba(200, 241, 53, 0.3)',
    paddingLeft: 14,
  },
  headerLine: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#e8e8e0',
    lineHeight: 1.5,
  },
  textLine: {
    fontSize: '0.9rem',
    color: '#8a9e8a',
    lineHeight: 1.6,
  },
  refreshBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #2a3a2a',
    borderRadius: 8,
    color: '#8a9e8a',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: "'Outfit', sans-serif",
  },
  selectedTipList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  selectedTipPill: {
    fontSize: '0.8rem',
    color: '#c8f135',
    background: 'rgba(200, 241, 53, 0.08)',
    border: '1px solid rgba(200, 241, 53, 0.2)',
    borderRadius: 20,
    padding: '4px 12px',
  },
  emptyPlan: {
    textAlign: 'center',
    padding: '40px 20px',
    lineHeight: 1.6,
  },
};
