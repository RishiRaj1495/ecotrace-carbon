import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAIInsights, getActionPlan } from '../utils/geminiService.js';

const mockFetch = vi.fn();

beforeEach(() => {
  global.fetch = mockFetch;
});

afterEach(() => {
  vi.clearAllMocks();
});

const mockGeminiResponse = (text) => ({
  ok: true,
  json: async () => ({
    candidates: [{ content: { parts: [{ text }] } }],
  }),
});

describe('getAIInsights', () => {
  it('returns fallback insights when no API key is provided', async () => {
    const result = await getAIInsights({ total: 5000, breakdown: { transport: 2000 } }, '');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(50);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls Gemini API when API key is provided', async () => {
    mockFetch.mockResolvedValueOnce(mockGeminiResponse('AI insight text here'));
    const result = await getAIInsights(
      { total: 5000, breakdown: { transport: 2000, diet: 1400 } },
      'AIzaFakeKey1234567890abcdefghij'
    );
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(result).toBe('AI insight text here');
  });

  it('falls back gracefully on API error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const result = await getAIInsights(
      { total: 4000, breakdown: { transport: 1500 } },
      'AIzaFakeKey1234567890abcdefghij'
    );
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(50);
  });

  it('falls back gracefully on non-ok API response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });
    const result = await getAIInsights(
      { total: 6000, breakdown: { energy: 2000 } },
      'AIzaFakeKey1234567890abcdefghij'
    );
    expect(typeof result).toBe('string');
  });

  it('falls back gracefully on empty candidates response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [] }),
    });
    const result = await getAIInsights(
      { total: 4000, breakdown: {} },
      'AIzaFakeKey1234567890abcdefghij'
    );
    expect(typeof result).toBe('string');
  });

  it('fallback text contains footprint info', async () => {
    const result = await getAIInsights({ total: 4800, breakdown: { transport: 2400 } }, '');
    expect(result).toContain('4.8 tonnes');
  });
});

describe('getActionPlan', () => {
  it('returns placeholder when no API key', async () => {
    const result = await getActionPlan({ total: 5000 }, [], '');
    expect(typeof result).toBe('string');
    expect(result.toLowerCase()).toContain('gemini');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('calls API with selected tip names when key provided', async () => {
    mockFetch.mockResolvedValueOnce(mockGeminiResponse('Week 1: Start cycling'));
    const tips = [{ title: 'Cycle Short Distances', co2Saved: 320 }];
    const result = await getActionPlan({ total: 5000 }, tips, 'AIzaFakeKey1234567890abcdefghij');
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(result).toBe('Week 1: Start cycling');
  });

  it('falls back gracefully on API error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Timeout'));
    const result = await getActionPlan({ total: 4000 }, [], 'AIzaFakeKey1234567890abcdefghij');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(20);
  });
});
