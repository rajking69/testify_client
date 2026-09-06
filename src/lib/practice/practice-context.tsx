"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import {
  Question,
  PracticeSessionConfig,
  PracticeResult,
  PracticeMode,
  Difficulty,
  PracticeHistoryItem,
} from "./practice-types";
import {
  subjects,
  defaultSessionTime,
} from "./practice-constants";

interface PracticeContextType {
  // Configuration state
  config: PracticeSessionConfig;
  setConfig: (config: PracticeSessionConfig) => void;

  // Session state
  currentSession: Question[] | null;
  setCurrentSession: (questions: Question[]) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  userAnswers: Record<string, string | number>;
  setUserAnswers: (answers: Record<string, string | number>) => void;

  // Timer state
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  isTimerRunning: boolean;
  setIsTimerRunning: (running: boolean) => void;

  // Bookmark state
  bookmarkedQuestions: Question[];
  toggleBookmark: (questionId: string) => void;

  // Results state
  lastResult: PracticeResult | null;
  setLastResult: (result: PracticeResult | null) => void;

  // History state
  history: PracticeHistoryItem[];
  addToHistory: (item: PracticeHistoryItem) => void;

  // Utility functions
  startPracticeSession: (config: PracticeSessionConfig) => void;
  endPracticeSession: () => PracticeResult;
  resetPracticeSession: () => void;
  getFilteredQuestions: (config: PracticeSessionConfig) => Question[];
}

const PracticeContext = createContext<PracticeContextType | undefined>(
  undefined,
);

export function PracticeProvider({ children }: { children: ReactNode }) {
  // Configuration state
  const [config, setConfig] = useState<PracticeSessionConfig>({
    mode: "normal",
    subject: "",
    topics: [],
    difficulty: ["easy", "medium", "hard"],
    questionCount: 10,
  });

  // Session state
  const [currentSession, setCurrentSession] = useState<Question[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<
    Record<string, string | number>
  >({});

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(defaultSessionTime);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Bookmark state (initialized empty for real user bookmarks)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Question[]>([]);

  // Results state
  const [lastResult, setLastResultState] = useState<PracticeResult | null>(null);

  const setLastResult = useCallback((result: PracticeResult | null) => {
    setLastResultState(result);
    if (result) {
      try {
        localStorage.setItem("testify_last_result", JSON.stringify(result));
      } catch (e) {
        console.error("Failed to save lastResult to localStorage", e);
      }
    }
  }, []);

  // History state
  const [history, setHistory] = useState<PracticeHistoryItem[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("practice_bookmarks");
    if (savedBookmarks) {
      try {
        setBookmarkedQuestions(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error("Failed to load bookmarks from localStorage", e);
      }
    }

    const savedHistory = localStorage.getItem("practice_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history from localStorage", e);
      }
    }

    const savedResult = localStorage.getItem("testify_last_result");
    if (savedResult) {
      try {
        setLastResultState(JSON.parse(savedResult));
      } catch (e) {
        console.error("Failed to load lastResult from localStorage", e);
      }
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "practice_bookmarks",
      JSON.stringify(bookmarkedQuestions),
    );
  }, [bookmarkedQuestions]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("practice_history", JSON.stringify(history));
  }, [history]);

  // Filter questions based on configuration
  const getFilteredQuestions = useCallback(
    (config: PracticeSessionConfig): Question[] => {
      let filtered: Question[] = [];

      // Filter by subject
      if (config.subject) {
        filtered = filtered.filter((q) => q.subject === config.subject);
      }

      // Filter by topics
      if (config.topics.length > 0) {
        filtered = filtered.filter((q) => config.topics.includes(q.topic));
      }

      // Filter by difficulty
      if (config.difficulty.length > 0 && config.difficulty.length < 3) {
        filtered = filtered.filter((q) =>
          config.difficulty.includes(q.difficulty),
        );
      }

      // For random mode, shuffle the questions
      if (config.mode === "random") {
        filtered = filtered.sort(() => Math.random() - 0.5);
      }

      // Limit to question count
      return filtered.slice(0, config.questionCount);
    },
    [],
  );

  // Start a new practice session
  const startPracticeSession = useCallback(
    (sessionConfig: PracticeSessionConfig) => {
      const filteredQuestions = getFilteredQuestions(sessionConfig);

      if (filteredQuestions.length === 0) {
        alert(
          "No questions match your criteria. Please adjust your selection.",
        );
        return;
      }

      setCurrentSession(filteredQuestions);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setLastResult(null);

      // Set timer based on mode
      if (sessionConfig.mode === "timed") {
        setTimeRemaining(defaultSessionTime);
        setIsTimerRunning(true);
      } else {
        setTimeRemaining(0);
        setIsTimerRunning(false);
      }
    },
    [getFilteredQuestions],
  );

  // End current practice session and calculate results
  const endPracticeSession = useCallback((): PracticeResult => {
    if (!currentSession) {
      throw new Error("No active session to end");
    }

    let correctAnswers = 0;

    currentSession.forEach((question) => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer !== undefined && userAnswer !== null) {
        const directMatch =
          userAnswer === question.correctAnswer ||
          String(userAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase() ||
          (question.correctOptionIndex !== undefined && Number(userAnswer) === Number(question.correctOptionIndex));

        const optionTextMatch =
          Array.isArray(question.options) &&
          typeof userAnswer === 'number' &&
          question.options[userAnswer] !== undefined &&
          String(question.options[userAnswer]).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();

        const stringOptionMatch =
          Array.isArray(question.options) &&
          typeof userAnswer === 'string' &&
          question.correctOptionIndex !== undefined &&
          question.options[question.correctOptionIndex] !== undefined &&
          String(userAnswer).trim().toLowerCase() === String(question.options[question.correctOptionIndex]).trim().toLowerCase();

        if (directMatch || optionTextMatch || stringOptionMatch) {
          correctAnswers++;
        }
      }
    });

    const totalQuestions = currentSession.length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    const result: PracticeResult = {
      sessionId: `session-${Date.now()}`,
      mode: config.mode,
      totalQuestions,
      correctAnswers,
      scorePercentage,
      timeSpentSeconds:
        config.mode === "timed"
          ? defaultSessionTime - timeRemaining
          : timeRemaining,
      completedAt: new Date().toISOString(),
      userAnswers,
      questions: currentSession,
    };

    setLastResult(result);
    setIsTimerRunning(false);

    // Add to history
    const historyItem = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString(),
      mode: config.mode,
      subject: config.subject || "Mixed",
      score: `${scorePercentage}%`,
      timeTaken: formatTime(result.timeSpentSeconds),
      sessionId: result.sessionId,
    };
    setHistory((prev) => [historyItem, ...prev]);

    return result;
  }, [currentSession, userAnswers, config, timeRemaining]);

  // Reset practice session
  const resetPracticeSession = useCallback(() => {
    setCurrentSession(null);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeRemaining(defaultSessionTime);
    setIsTimerRunning(false);
    setLastResult(null);
  }, []);

  // Toggle bookmark status
  const toggleBookmark = useCallback((questionId: string) => {
    setBookmarkedQuestions((prev) => {
      const isBookmarked = prev.some((q) => q.id === questionId);

      if (isBookmarked) {
        return prev.filter((q) => q.id !== questionId);
      } else {
        const questionToAdd = currentSession?.find((q) => q.id === questionId);
        if (questionToAdd) {
          return [...prev, { ...questionToAdd, isBookmarked: true }];
        }
        return prev;
      }
    });
  }, [currentSession]);

  // Add item to history
  const addToHistory = useCallback((item: PracticeHistoryItem) => {
    setHistory((prev) => [item, ...prev]);
  }, []);

  return (
    <PracticeContext.Provider
      value={{
        config,
        setConfig,
        currentSession,
        setCurrentSession,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        userAnswers,
        setUserAnswers,
        timeRemaining,
        setTimeRemaining,
        isTimerRunning,
        setIsTimerRunning,
        bookmarkedQuestions,
        toggleBookmark,
        lastResult,
        setLastResult,
        history,
        addToHistory,
        startPracticeSession,
        endPracticeSession,
        resetPracticeSession,
        getFilteredQuestions,
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
}

export function usePractice() {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error("usePractice must be used within a PracticeProvider");
  }
  return context;
}

// Helper function to format time
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
