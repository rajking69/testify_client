import { SubjectData } from "./practice-types";

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

export const defaultSessionTime = 600; // 10 minutes default
