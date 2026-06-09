import React, { useState } from 'react';
import Header from './components/Header.jsx';
import Quiz from './components/Quiz.jsx';
import Dashboard from './components/Dashboard.jsx';
import Tips from './components/Tips.jsx';
import Insights from './components/Insights.jsx';
import { useFootprint } from './hooks/useFootprint.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('quiz');
  const {
    answers, result, selectedTips, apiKey,
    setApiKey, setAnswer, submitQuiz, toggleTip,
    reset, completedQuestions, totalQuestions, isComplete,
  } = useFootprint();

  const handleSubmit = () => {
    submitQuiz();
    setActiveTab('dashboard');
  };

  const handleRetake = () => {
    reset();
    setActiveTab('quiz');
  };

  const handleViewPlan = () => setActiveTab('insights');

  return (
    <>
      <a href="#main-content" style={skipLinkStyle} className="skip-link">
        Skip to main content
      </a>

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        footprintResult={result}
      />

      {activeTab === 'quiz' && (
        <Quiz
          answers={answers}
          onAnswer={setAnswer}
          onSubmit={handleSubmit}
          isComplete={isComplete}
          completedQuestions={completedQuestions}
          totalQuestions={totalQuestions}
        />
      )}

      {activeTab === 'dashboard' && result && (
        <Dashboard result={result} onRetake={handleRetake} />
      )}

      {activeTab === 'tips' && result && (
        <Tips
          result={result}
          selectedTips={selectedTips}
          onToggleTip={toggleTip}
          onViewPlan={handleViewPlan}
        />
      )}

      {activeTab === 'insights' && result && (
        <Insights
          result={result}
          selectedTips={selectedTips}
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
        />
      )}
    </>
  );
}

const skipLinkStyle = {
  position: 'absolute',
  top: -40,
  left: 0,
  background: '#c8f135',
  color: '#0a0f0a',
  padding: '8px 16px',
  borderRadius: '0 0 8px 0',
  fontWeight: 700,
  zIndex: 9999,
  transition: 'top 0.2s',
};
