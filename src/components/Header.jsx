import React from 'react';

export default function Header({ activeTab, onTabChange, footprintResult }) {
  const tabs = [
    { id: 'quiz', label: 'Calculate', icon: '📊' },
    { id: 'dashboard', label: 'Dashboard', icon: '🌍', disabled: !footprintResult },
    { id: 'tips', label: 'Reduce', icon: '🌱', disabled: !footprintResult },
    { id: 'insights', label: 'AI Insights', icon: '✨', disabled: !footprintResult },
  ];

  return (
    <header style={styles.header} role="banner">
      <div style={styles.inner}>
        <div style={styles.brand} aria-label="EcoTrace Home">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M16 4C16 4 6 8 6 18C6 23.52 10.48 28 16 28C21.52 28 26 23.52 26 18C26 8 16 4 16 4Z"
              fill="#c8f135"
            />
            <path d="M16 28L16 14" stroke="#080d08" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={styles.brandName}>EcoTrace</span>
        </div>

        <nav style={styles.nav} role="navigation" aria-label="Main navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
                ...(tab.disabled ? styles.tabDisabled : {}),
              }}
              title={tab.disabled ? 'Complete the quiz first' : tab.label}
            >
              <span aria-hidden="true" style={{ fontSize: '1rem' }}>{tab.icon}</span>
              <span style={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(8, 13, 8, 0.92)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid #1e2a1e',
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'default',
  },
  brandName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.25rem',
    color: '#e8e8e0',
    letterSpacing: '-0.02em',
  },
  nav: {
    display: 'flex',
    gap: 4,
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 8,
    color: '#8a9e8a',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  tabActive: {
    background: 'rgba(200, 241, 53, 0.1)',
    border: '1px solid rgba(200, 241, 53, 0.3)',
    color: '#c8f135',
  },
  tabDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  tabLabel: {
    fontSize: '0.875rem',
  },
};
