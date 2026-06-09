import React from 'react';
import {
  RadialBarChart, RadialBar, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  getFootprintRating, formatCO2, getPercentageVsAverage,
  getEquivalents, generateProgressData
} from '../utils/calculations.js';
import { EMISSION_CATEGORIES, GLOBAL_AVERAGE_FOOTPRINT, TARGET_FOOTPRINT } from '../data/emissionData.js';

const COLORS = ['#c8f135', '#5edb7a', '#5eb8db', '#ffaa4d'];

export default function Dashboard({ result, onRetake }) {
  const { total, breakdown } = result;
  const rating = getFootprintRating(total);
  const pct = getPercentageVsAverage(total);
  const equivalents = getEquivalents(total);

  const pieData = EMISSION_CATEGORIES
    .filter((cat) => breakdown[cat.key] > 0)
    .map((cat, i) => ({
      name: cat.label,
      value: Math.round(breakdown[cat.key] || 0),
      color: COLORS[i],
      icon: cat.icon,
    }));

  const comparisonData = [
    { name: 'You', value: total, color: rating.color },
    { name: 'Global Avg', value: GLOBAL_AVERAGE_FOOTPRINT, color: '#5eb8db' },
    { name: 'Target', value: TARGET_FOOTPRINT, color: '#5edb7a' },
  ];

  const progressData = generateProgressData(6, total, [2, 4]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <div style={styles.tooltipLabel}>{payload[0].name}</div>
          <div style={styles.tooltipValue}>{formatCO2(payload[0].value)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <main style={styles.container} role="main" id="main-content">
      <div style={styles.topRow}>
        {/* Score card */}
        <section style={styles.scoreCard} aria-label="Your carbon footprint score">
          <div style={styles.ratingBadge}>
            <span aria-hidden="true">{rating.emoji}</span>
            <span style={{ color: rating.color }}>{rating.label}</span>
          </div>
          <div style={styles.totalDisplay} aria-label={`Total footprint: ${formatCO2(total)} per year`}>
            <span style={styles.totalNumber}>{(total / 1000).toFixed(1)}</span>
            <span style={styles.totalUnit}>tonnes CO₂e / year</span>
          </div>
          <p style={styles.ratingDesc}>{rating.description}</p>

          <div style={styles.pctBar} role="meter"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={200}
            aria-label={`${pct}% of global average`}
          >
            <div style={styles.pctBarInner}>
              <div
                style={{
                  ...styles.pctFill,
                  width: `${Math.min(pct, 100)}%`,
                  background: rating.color,
                }}
              />
              <div style={{ ...styles.pctMarker, left: `${(TARGET_FOOTPRINT / GLOBAL_AVERAGE_FOOTPRINT) * 100}%` }}
                title="Paris Target"
              />
            </div>
            <div style={styles.pctLabels}>
              <span style={{ color: '#5edb7a', fontSize: '0.72rem' }}>🎯 Target</span>
              <span style={{ color: '#8a9e8a', fontSize: '0.72rem' }}>100% = Global Avg</span>
            </div>
          </div>
          <div style={styles.pctText}>{pct}% of global average</div>

          <button onClick={onRetake} style={styles.retakeBtn} aria-label="Retake quiz">
            ↺ Retake Quiz
          </button>
        </section>

        {/* Pie breakdown */}
        <section style={styles.pieCard} aria-label="Emissions breakdown by category">
          <h2 style={styles.cardTitle}>Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart aria-hidden="true">
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div style={styles.legend} role="list">
            {pieData.map((item) => (
              <div key={item.name} style={styles.legendItem} role="listitem">
                <span style={{ ...styles.legendDot, background: item.color }} aria-hidden="true" />
                <span style={styles.legendName}>{item.icon} {item.name}</span>
                <span style={styles.legendValue}>{formatCO2(item.value)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Comparison bar chart */}
      <section style={styles.comparisonCard} aria-label="Compare your footprint to averages">
        <h2 style={styles.cardTitle}>How You Compare</h2>
        <ResponsiveContainer width="100%" height={180} aria-hidden="true">
          <BarChart data={comparisonData} layout="vertical" margin={{ left: 20, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a1e" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}t`}
              tick={{ fill: '#8a9e8a', fontSize: 11, fontFamily: 'IBM Plex Mono' }}
              axisLine={{ stroke: '#1e2a1e' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#c8d4c8', fontSize: 13 }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={36}>
              {comparisonData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Equivalents grid */}
      <section style={styles.equivSection} aria-label="What your footprint equals">
        <h2 style={styles.cardTitle}>What This Means</h2>
        <div style={styles.equivGrid}>
          {equivalents.map((eq, i) => (
            <div key={i} style={styles.equivCard}>
              <div style={styles.equivValue}>{eq.value.toLocaleString()}</div>
              <div style={styles.equivLabel}>{eq.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Progress preview */}
      <section style={styles.progressSection} aria-label="Simulated footprint reduction over time">
        <h2 style={styles.cardTitle}>Simulated Reduction Trend</h2>
        <p style={styles.progressNote}>If you take 2 actions at month 3 and 5</p>
        <ResponsiveContainer width="100%" height={160} aria-hidden="true">
          <BarChart data={progressData} margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a1e" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#8a9e8a', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(1)}t`} tick={{ fill: '#8a9e8a', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#c8f135" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '32px 24px 80px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  topRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
  },
  scoreCard: {
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 16,
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  ratingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.85rem',
    fontFamily: "'IBM Plex Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#8a9e8a',
  },
  totalDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
  },
  totalNumber: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '3.2rem',
    color: '#e8e8e0',
    lineHeight: 1,
  },
  totalUnit: {
    fontSize: '0.8rem',
    color: '#8a9e8a',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  ratingDesc: {
    fontSize: '0.875rem',
    color: '#8a9e8a',
    lineHeight: 1.4,
  },
  pctBar: {
    marginTop: 4,
  },
  pctBarInner: {
    height: 8,
    background: '#1e2a1e',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  pctFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 1s ease',
  },
  pctMarker: {
    position: 'absolute',
    top: -2,
    width: 3,
    height: 12,
    background: '#5edb7a',
    borderRadius: 1,
    transform: 'translateX(-50%)',
  },
  pctLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  pctText: {
    fontSize: '0.78rem',
    color: '#4a5e4a',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  retakeBtn: {
    alignSelf: 'flex-start',
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #2a3a2a',
    borderRadius: 8,
    color: '#8a9e8a',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontFamily: "'Outfit', sans-serif",
    marginTop: 4,
  },
  pieCard: {
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 16,
    padding: '28px 24px',
  },
  cardTitle: {
    fontSize: '0.85rem',
    fontFamily: "'IBM Plex Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#8a9e8a',
    marginBottom: 16,
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 8,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '0.85rem',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendName: {
    color: '#c8d4c8',
    flex: 1,
  },
  legendValue: {
    color: '#8a9e8a',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.78rem',
  },
  comparisonCard: {
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 16,
    padding: '28px 24px',
  },
  equivSection: {
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 16,
    padding: '28px 24px',
  },
  equivGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  },
  equivCard: {
    background: '#131a13',
    border: '1px solid #1e2a1e',
    borderRadius: 10,
    padding: '16px',
  },
  equivValue: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.8rem',
    color: '#c8f135',
    lineHeight: 1,
    marginBottom: 6,
  },
  equivLabel: {
    fontSize: '0.8rem',
    color: '#8a9e8a',
    lineHeight: 1.3,
  },
  progressSection: {
    background: '#0f160f',
    border: '1px solid #1e2a1e',
    borderRadius: 16,
    padding: '28px 24px',
  },
  progressNote: {
    fontSize: '0.8rem',
    color: '#4a5e4a',
    fontFamily: "'IBM Plex Mono', monospace",
    marginBottom: 12,
    marginTop: -8,
  },
  tooltip: {
    background: '#131a13',
    border: '1px solid #2a3a2a',
    borderRadius: 8,
    padding: '8px 12px',
  },
  tooltipLabel: {
    fontSize: '0.78rem',
    color: '#8a9e8a',
    fontFamily: "'IBM Plex Mono', monospace",
    marginBottom: 2,
  },
  tooltipValue: {
    fontSize: '0.9rem',
    color: '#e8e8e0',
    fontWeight: 500,
  },
};
