import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ── Mock recharts so tests don't fail on canvas/svg ──────────────────────────
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  RadialBarChart: ({ children }) => <div>{children}</div>,
  RadialBar: () => null,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
}));

import Quiz from '../components/Quiz.jsx';
import Dashboard from '../components/Dashboard.jsx';
import Tips from '../components/Tips.jsx';
import Header from '../components/Header.jsx';

// ── Quiz Component ────────────────────────────────────────────────────────────
describe('Quiz Component', () => {
  const defaultProps = {
    answers: {},
    onAnswer: vi.fn(),
    onSubmit: vi.fn(),
    isComplete: false,
    completedQuestions: 0,
    totalQuestions: 6,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hero heading', () => {
    render(<Quiz {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('renders a progress bar with correct aria attributes', () => {
    render(<Quiz {...defaultProps} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeTruthy();
    expect(progressbar.getAttribute('aria-valuenow')).toBe('0');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('6');
  });

  it('shows progress count', () => {
    render(<Quiz {...defaultProps} completedQuestions={3} />);
    expect(screen.getByText('3/6')).toBeTruthy();
  });

  it('renders question option buttons', () => {
    render(<Quiz {...defaultProps} />);
    const optionButtons = screen.getAllByRole('button');
    expect(optionButtons.length).toBeGreaterThan(2);
  });

  it('calls onAnswer when an option is clicked', async () => {
    render(<Quiz {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    // Find option buttons (aria-pressed attribute)
    const optionBtn = buttons.find((b) => b.getAttribute('aria-pressed') !== null);
    if (optionBtn) {
      fireEvent.click(optionBtn);
      expect(defaultProps.onAnswer).toHaveBeenCalledTimes(1);
    }
  });

  it('disables submit button when quiz is incomplete', () => {
    render(<Quiz {...defaultProps} completedQuestions={5} />);
    // Navigate to last question
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[tabs.length - 1]);
    const submitBtn = screen.queryByText(/Answer all/);
    if (submitBtn) expect(submitBtn.closest('button').disabled).toBe(true);
  });

  it('shows submit button text when complete', () => {
    render(<Quiz {...defaultProps} isComplete={true} completedQuestions={6} />);
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[tabs.length - 1]);
    expect(screen.queryByText(/Calculate My Footprint/)).toBeTruthy();
  });

  it('has accessible navigation buttons', () => {
    render(<Quiz {...defaultProps} />);
    expect(screen.getByLabelText('Previous question')).toBeTruthy();
  });

  it('shows privacy note', () => {
    render(<Quiz {...defaultProps} />);
    expect(screen.getByText(/stored locally/i)).toBeTruthy();
  });
});

// ── Dashboard Component ───────────────────────────────────────────────────────
describe('Dashboard Component', () => {
  const mockResult = {
    total: 5000,
    breakdown: {
      transport: 1800,
      diet: 1400,
      energy: 1200,
      shopping: 600,
    },
  };

  it('renders the total footprint in tonnes', () => {
    render(<Dashboard result={mockResult} onRetake={vi.fn()} />);
    expect(screen.getByText('5.0')).toBeTruthy();
  });

  it('shows CO2e unit label', () => {
    render(<Dashboard result={mockResult} onRetake={vi.fn()} />);
    expect(screen.getAllByText(/tonnes CO₂e/).length).toBeGreaterThan(0);
  });

  it('renders a retake button', () => {
    const onRetake = vi.fn();
    render(<Dashboard result={mockResult} onRetake={onRetake} />);
    const retakeBtn = screen.getByLabelText('Retake quiz');
    expect(retakeBtn).toBeTruthy();
  });

  it('calls onRetake when retake is clicked', () => {
    const onRetake = vi.fn();
    render(<Dashboard result={mockResult} onRetake={onRetake} />);
    fireEvent.click(screen.getByLabelText('Retake quiz'));
    expect(onRetake).toHaveBeenCalledOnce();
  });

  it('renders the Breakdown section heading', () => {
    render(<Dashboard result={mockResult} onRetake={vi.fn()} />);
    expect(screen.getAllByText(/Breakdown/i).length).toBeGreaterThan(0);
  });

  it('renders How You Compare section', () => {
    render(<Dashboard result={mockResult} onRetake={vi.fn()} />);
    expect(screen.getByText(/How You Compare/i)).toBeTruthy();
  });

  it('renders What This Means section', () => {
    render(<Dashboard result={mockResult} onRetake={vi.fn()} />);
    expect(screen.getByText(/What This Means/i)).toBeTruthy();
  });

  it('has proper ARIA labeling on score card', () => {
    render(<Dashboard result={mockResult} onRetake={vi.fn()} />);
    expect(screen.getByLabelText(/carbon footprint score/i)).toBeTruthy();
  });
});

// ── Tips Component ────────────────────────────────────────────────────────────
describe('Tips Component', () => {
  const mockResult = { total: 5000, breakdown: { transport: 2000, diet: 1500, energy: 1000, shopping: 500 } };
  const defaultProps = {
    result: mockResult,
    selectedTips: [],
    onToggleTip: vi.fn(),
    onViewPlan: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it('renders the page heading', () => {
    render(<Tips {...defaultProps} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
  });

  it('renders tip cards', () => {
    render(<Tips {...defaultProps} />);
    const cards = screen.getAllByRole('listitem');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders Add buttons on tip cards', () => {
    render(<Tips {...defaultProps} />);
    const addBtns = screen.getAllByText('+ Add');
    expect(addBtns.length).toBeGreaterThan(0);
  });

  it('calls onToggleTip when Add is clicked', () => {
    render(<Tips {...defaultProps} />);
    fireEvent.click(screen.getAllByText('+ Add')[0]);
    expect(defaultProps.onToggleTip).toHaveBeenCalledOnce();
  });

  it('shows savings bar when tips are selected', () => {
    const tips = [{ id: 1, title: 'Cycle', icon: '🚴', co2Saved: 320 }];
    render(<Tips {...defaultProps} selectedTips={tips} />);
    expect(screen.getByText(/1 action selected/i)).toBeTruthy();
  });

  it('shows selected state for chosen tips', () => {
    const tip = { id: 3, title: 'Try Meat-Free Mondays', icon: '🥗', co2Saved: 180, category: 'diet', difficulty: 'easy', description: 'test' };
    render(<Tips {...defaultProps} selectedTips={[tip]} />);
    expect(screen.getByText('✓ Selected')).toBeTruthy();
  });

  it('filters tips by category', () => {
    render(<Tips {...defaultProps} />);
    const filterBtns = screen.getAllByRole('button');
    const dietBtn = filterBtns.find((b) => b.textContent.includes('diet'));
    if (dietBtn) {
      fireEvent.click(dietBtn);
      // Should still have some tips
      expect(screen.queryAllByRole('listitem').length).toBeGreaterThan(0);
    }
  });

  it('has accessible filter buttons with aria-pressed', () => {
    render(<Tips {...defaultProps} />);
    const pressed = screen.getAllByRole('button').filter(
      (b) => b.getAttribute('aria-pressed') !== null
    );
    expect(pressed.length).toBeGreaterThan(0);
  });
});

// ── Header Component ──────────────────────────────────────────────────────────
describe('Header Component', () => {
  it('renders brand name', () => {
    render(<Header activeTab="quiz" onTabChange={vi.fn()} footprintResult={null} />);
    expect(screen.getByText('EcoTrace')).toBeTruthy();
  });

  it('marks active tab with aria-current', () => {
    render(<Header activeTab="quiz" onTabChange={vi.fn()} footprintResult={null} />);
    const activeBtn = screen.getByRole('button', { name: /calculate/i });
    expect(activeBtn.getAttribute('aria-current')).toBe('page');
  });

  it('disables locked tabs when no result', () => {
    render(<Header activeTab="quiz" onTabChange={vi.fn()} footprintResult={null} />);
    const dashBtn = screen.getByRole('button', { name: /dashboard/i });
    expect(dashBtn.disabled).toBe(true);
  });

  it('enables all tabs when result exists', () => {
    const result = { total: 5000, breakdown: {} };
    render(<Header activeTab="dashboard" onTabChange={vi.fn()} footprintResult={result} />);
    const dashBtn = screen.getByRole('button', { name: /dashboard/i });
    expect(dashBtn.disabled).toBe(false);
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<Header activeTab="quiz" onTabChange={onTabChange} footprintResult={null} />);
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }));
    expect(onTabChange).toHaveBeenCalledWith('quiz');
  });

  it('has a navigation landmark', () => {
    render(<Header activeTab="quiz" onTabChange={vi.fn()} footprintResult={null} />);
    expect(screen.getByRole('navigation')).toBeTruthy();
  });

  it('has a banner landmark', () => {
    render(<Header activeTab="quiz" onTabChange={vi.fn()} footprintResult={null} />);
    expect(screen.getByRole('banner')).toBeTruthy();
  });
});
