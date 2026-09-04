import { Question, SubjectData, PracticeHistoryItem } from "./practice-types";

export const subjects: SubjectData[] = [
  {
    name: "Mathematics",
    topics: ["Algebra", "Calculus", "Geometry", "Statistics", "Trigonometry"],
  },
  {
    name: "Computer Science",
    topics: ["Data Structures", "Algorithms", "Programming", "Databases", "Operating Systems"],
  },
  {
    name: "English",
    topics: ["Grammar", "Vocabulary", "Reading Comprehension", "Writing", "Literature"],
  },
  {
    name: "Physics",
    topics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Quantum Physics"],
  },
  {
    name: "Chemistry",
    topics: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry", "Analytical Chemistry"],
  },
];

export const questionBank: Question[] = [
  {
    id: "cs-1",
    subject: "Computer Science",
    topic: "Data Structures",
    questionType: "mcq", isBookmarked: false,
    difficulty: "easy",
    questionText: "Which data structure follows the LIFO (Last In First Out) principle?",
    question: "Which data structure follows the LIFO (Last In First Out) principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    explanation: "A Stack follows LIFO principle where the last inserted element is removed first.",
  },
  {
    id: "cs-2",
    subject: "Computer Science",
    topic: "Algorithms",
    questionType: "mcq", isBookmarked: false,
    difficulty: "medium",
    questionText: "What is the worst-case time complexity of Quick Sort?",
    question: "What is the worst-case time complexity of Quick Sort?",
    options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
    correctAnswer: 2,
    explanation: "Quick sort worst case complexity is O(n²) when pivot selection leads to unbalanced splits.",
  },
  {
    id: "math-1",
    subject: "Mathematics",
    topic: "Calculus",
    questionType: "mcq", isBookmarked: false,
    difficulty: "easy",
    questionText: "What is the derivative of sin(x) with respect to x?",
    question: "What is the derivative of sin(x) with respect to x?",
    options: ["cos(x)", "-cos(x)", "tan(x)", "sec²(x)"],
    correctAnswer: 0,
    explanation: "The derivative of sin(x) is cos(x).",
  },
  {
    id: "physics-1",
    subject: "Physics",
    topic: "Mechanics",
    questionType: "mcq", isBookmarked: false,
    difficulty: "medium",
    questionText: "According to Newton's Second Law of Motion, Force equals:",
    question: "According to Newton's Second Law of Motion, Force equals:",
    options: ["Mass × Velocity", "Mass × Acceleration", "Work / Time", "Energy × Mass"],
    correctAnswer: 1,
    explanation: "Newton's second law states F = m × a.",
  }
];

export const mockHistory: PracticeHistoryItem[] = [];
export const practiceHistory: PracticeHistoryItem[] = [];
export const defaultSessionTime = 600; // 10 minutes default
