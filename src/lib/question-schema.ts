export const questionTypes = ["mcq", "true_false", "short_answer"] as const;
export const questionDifficulties = ["easy", "medium", "hard"] as const;

export type QuestionType = (typeof questionTypes)[number];
export type QuestionDifficulty = (typeof questionDifficulties)[number];
export type QuestionAnswer = string | string[];

export interface Question {
  id: string;
  type: QuestionType;
  subject: string;
  category: string;
  difficulty: QuestionDifficulty;
  question: string;
  options?: string[] | null;
  correctAnswer: QuestionAnswer;
  explanation?: string | null;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export type QuestionInput = Omit<
  Question,
  "id" | "createdAt" | "updatedAt" | "usageCount"
>;

export type QuestionUpdateInput = Partial<
  Omit<Question, "id" | "createdBy" | "createdAt" | "updatedAt" | "usageCount">
>;

export function isQuestionType(value: unknown): value is QuestionType {
  return (
    typeof value === "string" &&
    questionTypes.includes(value as QuestionType)
  );
}

export function isQuestionDifficulty(
  value: unknown,
): value is QuestionDifficulty {
  return (
    typeof value === "string" &&
    questionDifficulties.includes(value as QuestionDifficulty)
  );
}

export function isQuestion(value: unknown): value is Question {
  if (!value || typeof value !== "object") {
    return false;
  }

  const question = value as Partial<Question>;
  const options = question.options;
  const answers = Array.isArray(question.correctAnswer)
    ? question.correctAnswer
    : [question.correctAnswer];

  const hasValidOptions =
    options === undefined ||
    options === null ||
    (Array.isArray(options) &&
      options.length > 0 &&
      options.every(isNonEmptyString));

  const hasValidAnswer =
    answers.length > 0 && answers.every(isNonEmptyString);

  const hasValidTypeRules =
    question.type === "mcq"
      ? Array.isArray(options) &&
        options.length >= 2 &&
        answers.every((answer) => answer !== undefined && options.includes(answer))
      : question.type === "true_false"
        ? answers.length === 1 && answers[0] !== undefined && ["true", "false"].includes(answers[0])
        : true;

  return (
    isNonEmptyString(question.id) &&
    isQuestionType(question.type) &&
    isNonEmptyString(question.subject) &&
    isNonEmptyString(question.category) &&
    isQuestionDifficulty(question.difficulty) &&
    isNonEmptyString(question.question) &&
    hasValidOptions &&
    hasValidAnswer &&
    hasValidTypeRules &&
    Array.isArray(question.tags) &&
    question.tags.every(isNonEmptyString) &&
    isNonEmptyString(question.createdBy) &&
    question.createdAt instanceof Date &&
    !Number.isNaN(question.createdAt.getTime()) &&
    question.updatedAt instanceof Date &&
    !Number.isNaN(question.updatedAt.getTime()) &&
    typeof question.usageCount === "number" &&
    Number.isInteger(question.usageCount) &&
    question.usageCount >= 0 &&
    isOptionalString(question.explanation)
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string";
}