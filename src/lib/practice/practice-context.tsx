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
import { practiceService } from "@/services/practice.service";

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
  loadHistory: () => Promise<void>;

  // Utility functions
  startPracticeSession: (config: PracticeSessionConfig) => Promise<void>;
  endPracticeSession: () => Promise<PracticeResult>;
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

  // Bookmark state - loaded from backend via practice bookmarks endpoint
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

  // Load history from backend on mount
  const loadHistory = useCallback(async () => {
    try {
      const response = await practiceService.getHistory({ limit: 50 });
      if (response.success && response.data) {
        const formattedHistory: PracticeHistoryItem[] = response.data.map((item) => ({
          id: item._id || item.id,
          date: item.startedAt || item.createdAt,
          mode: item.mode || config.mode,
          subject: item.subject || item.category || "Mixed",
          score: `${item.accuracyPercentage || 0}%`,
          timeTaken: formatTime(item.totalTimeSeconds || 0),
          sessionId: item._id || item.id,
        }));
        setHistory(formattedHistory);
      }
    } catch (error) {
      console.error("Failed to load practice history from backend:", error);
      // Fallback to localStorage
      const savedHistory = localStorage.getItem("practice_history");
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to load history from localStorage", e);
        }
      }
    }
  }, [config.mode]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const loadBookmarks = useCallback(async () => {
    try {
      const response = await practiceService.getBookmarks();
      if (response.success && response.data) {
        const formattedBookmarks = response.data.map((q: any) => ({
          ...q,
          id: q._id || q.id,
          isBookmarked: true
        }));
        setBookmarkedQuestions(formattedBookmarks);
        // Sync local storage with fresh backend data
        localStorage.setItem("practice_bookmarks", JSON.stringify(formattedBookmarks));
      }
    } catch (error) {
      console.error("Failed to load bookmarks from backend:", error);
      // Fallback to localStorage
      const savedBookmarks = localStorage.getItem("practice_bookmarks");
      if (savedBookmarks) {
        try {
          setBookmarkedQuestions(JSON.parse(savedBookmarks));
        } catch (e) {
          console.error("Failed to load bookmarks from localStorage", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "practice_bookmarks",
      JSON.stringify(bookmarkedQuestions),
    );
  }, [bookmarkedQuestions]);

  // Filter questions based on configuration (for local filtering of mock data)
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

  // Start a new practice session - use backend API
  const startPracticeSession = useCallback(
    async (sessionConfig: PracticeSessionConfig) => {
      // Map config to backend API params
      const params = {
        category: sessionConfig.subject || sessionConfig.topics[0],
        subject: sessionConfig.subject,
        topic: sessionConfig.topics.length === 1 ? sessionConfig.topics[0] : undefined,
        topics: sessionConfig.topics.length > 0 ? sessionConfig.topics : undefined,
        difficulty: sessionConfig.difficulty.length === 1 ? sessionConfig.difficulty[0].toUpperCase() as "EASY" | "MEDIUM" | "HARD" : undefined,
        difficulties: sessionConfig.difficulty.length > 0 ? sessionConfig.difficulty.map(d => d.toUpperCase()) : undefined,
        count: sessionConfig.questionCount,
      };

      try {
        const response = await practiceService.startSession(params);
        
        if (response.success && response.data) {
          // Transform backend questions to frontend format
          const questions: Question[] = response.data.questions.map((q: any) => ({
            id: q._id || q.id,
            questionText: q.questionText,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            correctOptionIndex: q.correctOptionIndex,
            explanation: q.explanation,
            subject: q.subject || q.category,
            topic: q.topic,
            difficulty: (q.difficulty?.toLowerCase() || "medium") as Difficulty,
            marks: q.marks || 1,
          }));

          setCurrentSession(questions);
          setCurrentQuestionIndex(0);
          setUserAnswers({});
          setLastResult(null);

          // Store session ID for later API calls
          sessionStorage.setItem("practice_session_id", response.data.session._id || response.data.session.id);

          // Set timer based on mode
          if (sessionConfig.mode === "timed") {
            setTimeRemaining(defaultSessionTime);
            setIsTimerRunning(true);
          } else {
            setTimeRemaining(0);
            setIsTimerRunning(false);
          }
        } else {
          throw new Error(response.message || "Failed to start practice session");
        }
      } catch (error) {
        console.error("Failed to start practice session via backend:", error);
        // Fallback to local mock data if backend fails
        console.warn("Falling back to local mock data for practice session");
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
      }
    },
    [getFilteredQuestions],
  );

  // End current practice session and calculate results - use backend API
  const endPracticeSession = useCallback(async (): Promise<PracticeResult> => {
    if (!currentSession) {
      throw new Error("No active session to end");
    }

    // Try to finish session on backend and get correct answers
    const sessionId = sessionStorage.getItem("practice_session_id");
    let backendQuestions: any[] = [];
    if (sessionId) {
      try {
        const response = await practiceService.finishSession(sessionId);
        if (response.data && response.data.questions) {
          backendQuestions = response.data.questions;
        }
      } catch (error) {
        console.warn("Failed to finish practice session on backend:", error);
      }
      sessionStorage.removeItem("practice_session_id");
    }

    // Merge correct answers from backend if available
    const populatedQuestions = currentSession.map((q) => {
      const backendQ = backendQuestions.find(
        (bq) => String(bq._id) === String(q.id) || String(bq.id) === String(q.id)
      );
      if (backendQ) {
        return {
          ...q,
          correctAnswer: backendQ.correctAnswer !== undefined ? backendQ.correctAnswer : q.correctAnswer,
          correctOptionIndex: backendQ.correctOptionIndex !== undefined ? backendQ.correctOptionIndex : q.correctOptionIndex,
          explanation: backendQ.explanation !== undefined ? backendQ.explanation : q.explanation,
        };
      }
      return q;
    });

    // Calculate results locally for immediate feedback using populated questions
    let correctAnswers = 0;

    populatedQuestions.forEach((question) => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer !== undefined && userAnswer !== null) {
        let isCorrect = false;
        if (question.correctOptionIndex !== undefined) {
          isCorrect =
            Number(userAnswer) === Number(question.correctOptionIndex) ||
            (typeof userAnswer === 'string' && Array.isArray(question.options) && question.options[question.correctOptionIndex] !== undefined && String(userAnswer).trim().toLowerCase() === String(question.options[question.correctOptionIndex]).trim().toLowerCase());
        } else if (question.correctAnswer !== undefined) {
          isCorrect =
            userAnswer === question.correctAnswer ||
            String(userAnswer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase() ||
            (Array.isArray(question.options) && typeof userAnswer === 'number' && question.options[userAnswer] !== undefined && String(question.options[userAnswer]).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase());
        }

        if (isCorrect) {
          correctAnswers++;
        }
      }
    });

    const totalQuestions = populatedQuestions.length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

    const result: PracticeResult = {
      sessionId: sessionId || `session-${Date.now()}`,
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
      questions: populatedQuestions,
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
    sessionStorage.removeItem("practice_session_id");
  }, []);

  // Toggle bookmark status
  const toggleBookmark = useCallback((questionId: string) => {
    setBookmarkedQuestions((prev) => {
      const isBookmarked = prev.some((q) => q.id === questionId);

      if (isBookmarked) {
        // Sync with backend (fire and forget)
        practiceService.removeBookmark(questionId).catch(err => 
          console.warn("Failed to sync bookmark removal with backend:", err)
        );
        return prev.filter((q) => q.id !== questionId);
      } else {
        const questionToAdd = currentSession?.find((q) => q.id === questionId);
        if (questionToAdd) {
          // Sync with backend (fire and forget)
          practiceService.addBookmark(questionId).catch(err => 
            console.warn("Failed to sync bookmark addition with backend:", err)
          );
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
        loadHistory,
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