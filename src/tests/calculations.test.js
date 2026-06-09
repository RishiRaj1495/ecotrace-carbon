import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateFootprint,
  getFootprintRating,
  formatCO2,
  getPercentageVsAverage,
  getEquivalents,
  calculatePotentialSavings,
  sanitizeInput,
  safeLocalStorageSet,
  safeLocalStorageGet,
  generateProgressData,
  isValidApiKey,
} from '../utils/calculations.js';
import { QUIZ_QUESTIONS, TARGET_FOOTPRINT, GLOBAL_AVERAGE_FOOTPRINT } from '../data/emissionData.js';

describe('calculateFootprint', () => {
  it('returns zero total for empty answers', () => {
    const { total, breakdown } = calculateFootprint({}, QUIZ_QUESTIONS);
    expect(total).toBe(0);
    expect(breakdown).toEqual({});
  });

  it('calculates correctly for a single answered question', () => {
    const answers = { transport_mode: 'car' };
    const { total } = calculateFootprint(answers, QUIZ_QUESTIONS);
    // car multiplier = 1.0, base = 1200
    expect(total).toBe(1200);
  });

  it('calculates correctly for zero-multiplier option (wfh)', () => {
    const answers = { transport_mode: 'wfh' };
    const { total } = calculateFootprint(answers, QUIZ_QUESTIONS);
    expect(total).toBe(0);
  });

  it('accumulates categories correctly', () => {
    const answers = {
      transport_mode: 'car',
      diet_type: 'omnivore',
    };
    const { breakdown } = calculateFootprint(answers, QUIZ_QUESTIONS);
    expect(breakdown.transport).toBeDefined();
    expect(breakdown.diet).toBeDefined();
    expect(breakdown.transport).toBeCloseTo(1200, 0);
    expect(breakdown.diet).toBeCloseTo(1400, 0);
  });

  it('ignores answers for unknown question IDs', () => {
    const answers = { nonexistent_question: 'some_value' };
    const { total } = calculateFootprint(answers, QUIZ_QUESTIONS);
    expect(total).toBe(0);
  });

  it('handles all questions answered with minimum options', () => {
    const answers = {
      transport_mode: 'wfh',
      flight_frequency: 0,
      diet_type: 'vegan',
      energy_source: 'renewable',
      home_size: 'small',
      shopping_frequency: 'rarely',
    };
    const { total } = calculateFootprint(answers, QUIZ_QUESTIONS);
    expect(total).toBeGreaterThanOrEqual(0);
    expect(total).toBeLessThan(1500); // should be very low
  });

  it('returns rounded total', () => {
    const answers = { transport_mode: 'ev' }; // 1200 * 0.25 = 300
    const { total } = calculateFootprint(answers, QUIZ_QUESTIONS);
    expect(Number.isInteger(total)).toBe(true);
  });
});

describe('getFootprintRating', () => {
  it('returns Excellent for footprint at or below target', () => {
    expect(getFootprintRating(TARGET_FOOTPRINT).label).toBe('Excellent');
    expect(getFootprintRating(1000).label).toBe('Excellent');
  });

  it('returns Good for footprint between target and 3000', () => {
    expect(getFootprintRating(2500).label).toBe('Good');
  });

  it('returns Average around global average', () => {
    expect(getFootprintRating(3500).label).toBe('Average');
  });

  it('returns High for significantly above average', () => {
    expect(getFootprintRating(6000).label).toBe('High');
  });

  it('returns Very High for extreme footprints', () => {
    expect(getFootprintRating(15000).label).toBe('Very High');
  });

  it('returns an emoji for each rating', () => {
    [1000, 2500, 3500, 6000, 15000].forEach((val) => {
      expect(getFootprintRating(val).emoji).toBeTruthy();
    });
  });

  it('returns a color for each rating', () => {
    [1000, 2500, 3500, 6000, 15000].forEach((val) => {
      const { color } = getFootprintRating(val);
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});

describe('formatCO2', () => {
  it('formats values above 1000 as tonnes', () => {
    expect(formatCO2(4800)).toBe('4.8 tonnes CO₂e');
  });

  it('formats values below 1000 in kg', () => {
    expect(formatCO2(500)).toBe('500 kg CO₂e');
  });

  it('rounds kg values', () => {
    expect(formatCO2(500.7)).toBe('501 kg CO₂e');
  });

  it('handles exactly 1000', () => {
    expect(formatCO2(1000)).toBe('1.0 tonnes CO₂e');
  });
});

describe('getPercentageVsAverage', () => {
  it('returns 100 for global average', () => {
    expect(getPercentageVsAverage(GLOBAL_AVERAGE_FOOTPRINT)).toBe(100);
  });

  it('returns less than 100 for below-average', () => {
    expect(getPercentageVsAverage(2400)).toBeLessThan(100);
  });

  it('returns more than 100 for above-average', () => {
    expect(getPercentageVsAverage(9600)).toBe(200);
  });

  it('returns a rounded integer', () => {
    const result = getPercentageVsAverage(3000);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('getEquivalents', () => {
  it('returns an array of 4 equivalents', () => {
    const result = getEquivalents(5000);
    expect(result).toHaveLength(4);
  });

  it('each equivalent has a label and a value', () => {
    getEquivalents(5000).forEach((eq) => {
      expect(eq.label).toBeTruthy();
      expect(typeof eq.value).toBe('number');
    });
  });

  it('scales with input', () => {
    const low = getEquivalents(1000);
    const high = getEquivalents(10000);
    expect(high[0].value).toBeGreaterThan(low[0].value);
  });
});

describe('calculatePotentialSavings', () => {
  it('returns 0 for empty tips array', () => {
    expect(calculatePotentialSavings([])).toBe(0);
  });

  it('sums co2Saved correctly', () => {
    const tips = [{ co2Saved: 200 }, { co2Saved: 350 }];
    expect(calculatePotentialSavings(tips)).toBe(550);
  });

  it('handles tips without co2Saved gracefully', () => {
    const tips = [{ co2Saved: 200 }, {}];
    expect(calculatePotentialSavings(tips)).toBe(200);
  });
});

describe('sanitizeInput', () => {
  it('escapes HTML special chars', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<script>');
    expect(sanitizeInput('<b>bold</b>')).toContain('&lt;b&gt;');
  });

  it('truncates to 500 chars', () => {
    const long = 'a'.repeat(600);
    expect(sanitizeInput(long)).toHaveLength(500);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(123)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });

  it('passes normal text unchanged', () => {
    expect(sanitizeInput('Hello world!')).toBe('Hello world!');
  });
});

describe('safeLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('sets and retrieves a value', () => {
    safeLocalStorageSet('test_key', { a: 1 });
    expect(safeLocalStorageGet('test_key')).toEqual({ a: 1 });
  });

  it('returns fallback when key not found', () => {
    expect(safeLocalStorageGet('nonexistent', 'default')).toBe('default');
  });

  it('returns null fallback by default', () => {
    expect(safeLocalStorageGet('nonexistent')).toBe(null);
  });

  it('handles storing arrays', () => {
    safeLocalStorageSet('arr', [1, 2, 3]);
    expect(safeLocalStorageGet('arr')).toEqual([1, 2, 3]);
  });
});

describe('generateProgressData', () => {
  it('returns the correct number of months', () => {
    const data = generateProgressData(6, 4000);
    expect(data).toHaveLength(6);
  });

  it('each entry has month and value', () => {
    generateProgressData(3, 3000).forEach((entry) => {
      expect(entry.month).toBeTruthy();
      expect(typeof entry.value).toBe('number');
    });
  });

  it('applies 10% reduction at improvement months', () => {
    const data = generateProgressData(3, 1000, [1]);
    // Month 0: 1000, Month 1: 900, Month 2: 900
    expect(data[1].value).toBe(900);
    expect(data[2].value).toBe(900);
  });
});

describe('isValidApiKey', () => {
  it('rejects short strings', () => {
    expect(isValidApiKey('short')).toBe(false);
  });

  it('rejects empty strings', () => {
    expect(isValidApiKey('')).toBe(false);
  });

  it('rejects non-string inputs', () => {
    expect(isValidApiKey(null)).toBe(false);
    expect(isValidApiKey(undefined)).toBe(false);
  });

  it('accepts valid-looking API keys', () => {
    expect(isValidApiKey('AIzaSyABC123456789-_abcdefghijklmnop')).toBe(true);
  });

  it('rejects keys with invalid characters', () => {
    expect(isValidApiKey('AIzaSyABC123 456789 spaces')).toBe(false);
  });
});
