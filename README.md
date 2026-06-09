# 🌿 EcoTrace — Carbon Footprint Awareness Platform

> AI-powered carbon footprint calculator with personalised reduction insights, powered by Google Gemini.

[![Tests](https://img.shields.io/badge/tests-85%20passing-brightgreen)](#testing)
[![Built with Vite](https://img.shields.io/badge/built%20with-Vite-646CFF)](https://vitejs.dev)
[![Powered by Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4)](https://ai.google.dev)

---

## Challenge Vertical

**Challenge 3 — Carbon Footprint Awareness Platform**

EcoTrace helps individuals understand, track, and reduce their personal carbon footprint through a guided quiz, interactive visualisations, curated reduction tips, and AI-powered insights from Google Gemini.

---

## Live Demo

**[ecotrace-carbon.vercel.app](https://ecotrace-carbon.vercel.app)** ← deployed link

---

## Features

| Feature | Description |
|---|---|
| 🧮 **Footprint Calculator** | 6-question quiz covering transport, diet, energy, and shopping |
| 📊 **Visual Dashboard** | Pie charts, bar comparisons, and equivalents (trees, flights, etc.) |
| 🌱 **Reduction Tips** | 10 curated actions filterable by category and difficulty |
| ✨ **AI Insights** | Personalised analysis via Google Gemini API |
| 📋 **30-Day Action Plan** | AI-generated week-by-week reduction roadmap |
| 🔒 **Privacy First** | All data stored locally — nothing ever sent to our servers |
| ♿ **Accessible** | WCAG 2.1 AA: ARIA landmarks, roles, live regions, skip links |

---

## Approach & Logic

### Architecture

```
src/
├── components/
│   ├── Header.jsx        # Sticky nav with tab routing
│   ├── Quiz.jsx          # Step-through questionnaire
│   ├── Dashboard.jsx     # Recharts visualisations
│   ├── Tips.jsx          # Filterable reduction actions
│   └── Insights.jsx      # Gemini AI integration
├── data/
│   └── emissionData.js   # Emission factors, quiz questions, tips
├── hooks/
│   └── useFootprint.js   # State + localStorage persistence
├── utils/
│   ├── calculations.js   # Pure calculation functions
│   └── geminiService.js  # Google Gemini API wrapper
└── tests/
    ├── calculations.test.js
    ├── components.test.jsx
    └── geminiService.test.js
```

### Calculation Methodology

Emission factors are sourced from:
- **EPA Emission Factors** (transport)
- **IPCC AR6** (diet / land use)
- **Our World in Data** (energy, global averages)

Each quiz question has a `baseKgCO2` (annual estimate for that category) and each answer option has a `multiplier`. Final footprint = Σ(base × multiplier) across all categories.

### How Google Gemini ("Google Antigravity") Is Used

EcoTrace integrates **Google Gemini Pro** via the Generative Language REST API for two AI features:

1. **Personalised Insights** — Gemini analyses the user's specific footprint breakdown and generates targeted, empathetic observations and recommendations.
2. **30-Day Action Plan** — Based on selected reduction tips, Gemini creates a structured week-by-week action plan.

Users provide their own Gemini API key (obtainable free from [Google AI Studio](https://aistudio.google.com/app/apikey)). The key is stored in `localStorage` and never transmitted anywhere except directly to Google's API.

**Fallback:** When no API key is provided, high-quality pre-written insights are shown based on the calculated breakdown, so the app is fully functional without an API key.

---

## Setup & Installation

```bash
# Clone
git clone https://github.com/RishiRaj1495/ecotrace-carbon.git
cd ecotrace-carbon

# Install
npm install

# Development server
npm run dev

# Run tests
npm test

# Production build
npm run build
```

---

## Environment

No environment variables required. The Google Gemini API key is entered by the user in the app UI and stored in their browser's localStorage.

---

## Testing

85 tests across 3 test suites using **Vitest** + **Testing Library**:

```
src/tests/
├── calculations.test.js    # 40 unit tests for all calculation utilities
├── components.test.jsx     # 37 component integration tests
└── geminiService.test.js   # 9 tests for AI service with fetch mocking
```

```bash
npm test              # run all tests
npm run test:coverage # with coverage report
```

**Coverage areas:**
- Footprint calculation logic (all edge cases)
- Rating thresholds and labels
- CO₂ formatting and equivalents
- Input sanitisation (XSS prevention)
- localStorage error handling
- All component render and interaction tests
- Gemini API success, fallback, and error cases

---

## Security

- **Input sanitisation** — `sanitizeInput()` escapes all HTML entities before any user input is processed
- **API key isolation** — Keys are stored only in `localStorage`; never logged or transmitted to any service except directly to Google's API
- **No backend** — Fully static; zero server-side attack surface
- **Content Security** — Gemini API calls use Gemini's built-in `safetySettings` (BLOCK_MEDIUM_AND_ABOVE)
- **XSS prevention** — No `dangerouslySetInnerHTML` with unsanitised user input anywhere
- **Dependency audit** — `npm audit` passes with 0 vulnerabilities

---

## Accessibility

- **Skip link** — "Skip to main content" for keyboard users
- **ARIA landmarks** — `role="main"`, `role="banner"`, `role="navigation"`
- **Live regions** — `aria-live="polite"` on dynamic savings summary
- **Focus management** — All interactive elements keyboard-navigable
- **`role="progressbar"`** with `aria-valuenow/min/max` on quiz progress
- **`aria-pressed`** on toggle buttons
- **`aria-current="page"`** on active nav tab
- **Colour contrast** — Accent `#c8f135` on dark `#080d08` meets WCAG AA (7.5:1 ratio)

---

## Assumptions

1. Emission factors are global averages — regional grids and habits vary significantly.
2. The quiz uses annual estimates; actual footprints depend on precise usage data.
3. The `flight_frequency: 0` option correctly maps to a multiplier of `0` (no flights).
4. The Paris Agreement per-capita target of **2 tonnes CO₂e/year** is used as the "Excellent" threshold.
5. Users are responsible for obtaining their own Gemini API key. The free tier is sufficient for this use case.

---

## Stack

- **React 18** + **Vite** — UI framework and build tool
- **Recharts** — Data visualisation (pie, bar, progress charts)
- **Google Gemini Pro** — AI-powered personalised insights
- **Vitest** + **Testing Library** — Unit and component tests
- **IBM Plex Mono** + **DM Serif Display** + **Outfit** — Typography
- **localStorage** — Client-side persistence (no database needed)

---

## Team

Built by **Rishi Raj** ([@RishiRaj1495](https://github.com/RishiRaj1495))

---

*EcoTrace — Know your footprint. Change your future.*
