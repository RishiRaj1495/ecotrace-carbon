import { GLOBAL_AVERAGE_FOOTPRINT, TARGET_FOOTPRINT } from '../data/emissionData.js';

/**
 * Calculate total carbon footprint from quiz answers
 * @param {Object} answers - Map of question ID to selected option
 * @param {Array} questions - Array of quiz question definitions
 * @returns {Object} - { total, breakdown }
 */
export function calculateFootprint(answers, questions) {
  const breakdown = {};
  let total = 0;

  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;

    const option = q.options.find((o) => o.value === answer);
    if (!option) continue;

    const kg = q.baseKgCO2 * option.multiplier;
    breakdown[q.category] = (breakdown[q.category] || 0) + kg;
    total += kg;
  }

  return { total: Math.round(total), breakdown };
}

/**
 * Get carbon footprint rating based on total kg CO2e/year
 * @param {number} totalKg
 * @returns {Object} - { label, color, description }
 */
export function getFootprintRating(totalKg) {
  if (totalKg <= TARGET_FOOTPRINT) {
    return {
      label: 'Excellent',
      color: '#5edb7a',
      description: 'You\'re within the Paris Agreement target!',
      emoji: '🌟',
    };
  }
  if (totalKg <= 3000) {
    return {
      label: 'Good',
      color: '#c8f135',
      description: 'Below global average — keep it up!',
      emoji: '🌱',
    };
  }
  if (totalKg <= GLOBAL_AVERAGE_FOOTPRINT) {
    return {
      label: 'Average',
      color: '#ffaa4d',
      description: 'Around the global average — room to improve.',
      emoji: '🌍',
    };
  }
  if (totalKg <= 8000) {
    return {
      label: 'High',
      color: '#ff8c42',
      description: 'Above global average — consider key changes.',
      emoji: '⚠️',
    };
  }
  return {
    label: 'Very High',
    color: '#ff6b6b',
    description: 'Significantly above sustainable levels.',
    emoji: '🔥',
  };
}

/**
 * Convert kg CO2e to equivalent comparisons for context
 * @param {number} kg
 * @returns {Array} - Array of comparison strings
 */
export function getEquivalents(kg) {
  return [
    { label: 'trees needed to absorb this per year', value: Math.round(kg / 22) },
    { label: 'km driven by an average car', value: Math.round(kg / 0.21) },
    { label: 'smartphone charges', value: Math.round(kg / 0.005) },
    { label: 'London → NY flights equivalent', value: +(kg / 1500).toFixed(1) },
  ];
}

/**
 * Format kg CO2e for display
 * @param {number} kg
 * @returns {string}
 */
export function formatCO2(kg) {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} tonnes CO₂e`;
  }
  return `${Math.round(kg)} kg CO₂e`;
}

/**
 * Get percentage vs global average
 * @param {number} totalKg
 * @returns {number}
 */
export function getPercentageVsAverage(totalKg) {
  return Math.round((totalKg / GLOBAL_AVERAGE_FOOTPRINT) * 100);
}

/**
 * Calculate potential savings from applying tips
 * @param {Array} selectedTips - Array of tip objects
 * @returns {number} - Total kg CO2e saved per year
 */
export function calculatePotentialSavings(selectedTips) {
  return selectedTips.reduce((sum, tip) => sum + (tip.co2Saved || 0), 0);
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 500); // max length
}

/**
 * Store data safely in localStorage with error handling
 * @param {string} key
 * @param {*} value
 */
export function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('localStorage write failed:', e);
    return false;
  }
}

/**
 * Read data safely from localStorage
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
export function safeLocalStorageGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('localStorage read failed:', e);
    return fallback;
  }
}

/**
 * Generate months array for chart data
 * @param {number} months
 * @param {number} startValue
 * @param {Array} improvements - months at which improvements were made
 * @returns {Array}
 */
export function generateProgressData(months, startValue, improvements = []) {
  const data = [];
  let current = startValue;

  for (let i = 0; i < months; i++) {
    if (improvements.includes(i)) {
      current *= 0.9; // 10% reduction
    }
    const month = new Date();
    month.setMonth(month.getMonth() - (months - i - 1));
    data.push({
      month: month.toLocaleString('default', { month: 'short' }),
      value: Math.round(current),
    });
  }

  return data;
}

/**
 * Validate API key format (basic check)
 * @param {string} key
 * @returns {boolean}
 */
export function isValidApiKey(key) {
  return typeof key === 'string' && key.length > 20 && /^[A-Za-z0-9_-]+$/.test(key);
}
