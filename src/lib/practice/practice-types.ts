export type PracticeMode = "normal" | "timed" | "topic" | "random";
export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "mcq" | "true-false" | "short-answer";

export interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  questionType?: QuestionType;
  questionText: string;
  question?: string;
  options?: string[];
  correctAnswer: string | number;
  correctOptionIndex?: number;
  type?: string;
  explanation: string;
  isBookmarked?: boolean;
}

export interface PracticeSessionConfig {
  mode: PracticeMode;
  subject: string;
  topics: string[];
  difficulty: Difficulty[];
  questionCount: number;
}

export interface PracticeResult {
  sessionId: string;
  mode: PracticeMode;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  completedAt: string;
  userAnswers: Record<string, string | number>;
  questions: Question[];
}

export interface PracticeHistoryItem {
  id: string;
  date: string;
  mode: PracticeMode;
  subject: string;
  score: string;
  timeTaken: string;
  sessionId: string;
}

export interface SubjectData {
  name: string;
  topics: string[];
}
