import { useState, useCallback, useEffect } from 'react';
import { calculateFootprint, safeLocalStorageGet, safeLocalStorageSet } from '../utils/calculations.js';
import { QUIZ_QUESTIONS } from '../data/emissionData.js';

const STORAGE_KEY = 'ecotrace_data';

/**
 * Custom hook for managing carbon footprint state
 */
export function useFootprint() {
  const [answers, setAnswers] = useState(() =>
    safeLocalStorageGet(STORAGE_KEY + '_answers', {})
  );
  const [result, setResult] = useState(() =>
    safeLocalStorageGet(STORAGE_KEY + '_result', null)
  );
  const [selectedTips, setSelectedTips] = useState(() =>
    safeLocalStorageGet(STORAGE_KEY + '_tips', [])
  );
  const [apiKey, setApiKey] = useState(() =>
    safeLocalStorageGet(STORAGE_KEY + '_apikey', '')
  );

  // Persist answers
  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY + '_answers', answers);
  }, [answers]);

  // Persist result
  useEffect(() => {
    if (result) safeLocalStorageSet(STORAGE_KEY + '_result', result);
  }, [result]);

  // Persist tips
  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY + '_tips', selectedTips);
  }, [selectedTips]);

  const setAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const submitQuiz = useCallback(() => {
    const { total, breakdown } = calculateFootprint(answers, QUIZ_QUESTIONS);
    const newResult = { total, breakdown, timestamp: Date.now() };
    setResult(newResult);
    return newResult;
  }, [answers]);

  const toggleTip = useCallback((tip) => {
    setSelectedTips((prev) => {
      const exists = prev.find((t) => t.id === tip.id);
      if (exists) return prev.filter((t) => t.id !== tip.id);
      return [...prev, tip];
    });
  }, []);

  const reset = useCallback(() => {
    setAnswers({});
    setResult(null);
    setSelectedTips([]);
  }, []);

  const completedQuestions = Object.keys(answers).length;
  const totalQuestions = QUIZ_QUESTIONS.length;
  const isComplete = completedQuestions === totalQuestions;

  return {
    answers,
    result,
    selectedTips,
    apiKey,
    setApiKey,
    setAnswer,
    submitQuiz,
    toggleTip,
    reset,
    completedQuestions,
    totalQuestions,
    isComplete,
  };
}
