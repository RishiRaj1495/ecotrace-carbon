/**
 * Google Gemini AI Service
 * Uses Google Generative AI (Gemini) for personalized carbon reduction insights
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Generate personalized carbon reduction insights using Google Gemini
 * @param {Object} footprintData - { total, breakdown }
 * @param {string} apiKey - Google Gemini API key
 * @returns {Promise<string>}
 */
export async function getAIInsights(footprintData, apiKey) {
  if (!apiKey) {
    return getFallbackInsights(footprintData);
  }

  const prompt = buildInsightPrompt(footprintData);

  try {
    const response = await fetch(`${GEMINI_API_BASE}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400,
          topP: 0.9,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error('Empty response from Gemini');

    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackInsights(footprintData);
  }
}

/**
 * Build a focused prompt for Gemini
 * @param {Object} footprintData
 * @returns {string}
 */
function buildInsightPrompt(footprintData) {
  const { total, breakdown } = footprintData;
  const categories = Object.entries(breakdown)
    .map(([k, v]) => `${k}: ${Math.round(v)} kg CO₂e/year`)
    .join(', ');

  const highestCategory = Object.entries(breakdown).sort((a, b) => b[1] - a[1])[0];

  return `You are an expert sustainability advisor. A person has a carbon footprint of ${total} kg CO₂e/year.
Breakdown: ${categories}.
Their highest emission category is ${highestCategory?.[0]} at ${Math.round(highestCategory?.[1])} kg CO₂e/year.

In 3-4 short bullet points (use • symbol), give them:
1. One key insight about their footprint relative to global average (4,800 kg/year)
2. Their single biggest opportunity for reduction
3. One surprising or motivating fact
4. One simple action they can take this week

Be specific, empathetic, and encouraging. Keep it under 250 words.`;
}

/**
 * Fallback insights when API is unavailable
 * @param {Object} footprintData
 * @returns {string}
 */
function getFallbackInsights(footprintData) {
  const { total, breakdown } = footprintData;
  const globalAvg = 4800;
  const target = 2000;
  const pct = Math.round((total / globalAvg) * 100);

  const highestCategory = Object.entries(breakdown || {}).sort((a, b) => b[1] - a[1])[0];
  const cat = highestCategory?.[0] || 'transport';

  const categoryAdvice = {
    transport: 'Consider switching one car journey per week to public transport or cycling — this single change can save 250+ kg CO₂e annually.',
    diet: 'Reducing beef consumption by half is one of the most impactful food changes, saving up to 340 kg CO₂e per year.',
    energy: 'Switching to a green energy tariff or installing LED bulbs throughout your home can make a significant dent.',
    shopping: 'Buying second-hand clothes and extending the life of electronics can cut your shopping footprint by 30%.',
  };

  return `• Your footprint of ${(total / 1000).toFixed(1)} tonnes CO₂e/year is ${pct}% of the global average (4.8 tonnes). The Paris Agreement target is 2 tonnes per person.

• Your biggest emission source is ${cat}. ${categoryAdvice[cat] || 'Focus on your highest-emission category for maximum impact.'}

• If everyone on Earth lived like the average person in a high-income country, we'd need 3-5 planets to sustain it. Small changes at scale matter enormously.

• This week: Track every journey you make and consider one alternative. Awareness is the first step to lasting change.

Add your Google Gemini API key in settings for fully personalised AI insights.`;
}

/**
 * Generate an AI-powered action plan
 * @param {Object} footprintData
 * @param {Array} selectedTips
 * @param {string} apiKey
 * @returns {Promise<string>}
 */
export async function getActionPlan(footprintData, selectedTips, apiKey) {
  if (!apiKey) {
    return `To generate your personalised 30-day action plan, please add your Google Gemini API key in the settings panel. The plan will include week-by-week milestones, habit-stacking strategies, and progress checkpoints tailored to your specific footprint profile.`;
  }

  const tipNames = selectedTips.map((t) => t.title).join(', ');
  const prompt = `Create a motivating 30-day carbon reduction action plan for someone with a ${footprintData.total} kg CO₂e/year footprint.
They've chosen these actions to focus on: ${tipNames}.

Format as 4 weekly goals (Week 1, Week 2, Week 3, Week 4) with one specific, measurable action each week.
End with an encouraging summary. Keep it under 200 words. Be practical and specific.`;

  try {
    const response = await fetch(`${GEMINI_API_BASE}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 350 },
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackPlan();
  } catch (error) {
    console.error('Action plan error:', error);
    return getFallbackPlan();
  }
}

function getFallbackPlan() {
  return `**Week 1:** Audit your routine — track every commute, meal, and purchase for 7 days using this platform.

**Week 2:** Make one transport switch — try public transit, cycling, or remote work on at least 2 days.

**Week 3:** Eat one plant-based day per week and reduce red meat to 2 servings maximum.

**Week 4:** Review your home energy — switch to LED bulbs, turn down heating by 1°C, and check for green energy tariffs.

You're on the right path. Consistent small actions compound into significant impact over a year. Keep tracking and adjusting!`;
}
