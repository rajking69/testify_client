"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QuestionItem, QuestionDifficulty } from "@/services/question.service";
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  HelpCircle,
  Sparkles,
  Lock,
  Code,
  Layers,
} from "lucide-react";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  examSubject: string;
  onImportQuestions: (questions: QuestionItem[]) => void;
}

interface ParsedQuestionRow {
  rowNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  topic: string;
  difficulty: QuestionDifficulty;
  marks: number;
  explanation: string;
  tags: string[];
  isValid: boolean;
  errors: string[];
}

export function BulkImportModal({
  isOpen,
  onClose,
  examSubject,
  onImportQuestions,
}: BulkImportModalProps) {
  const [importMode, setImportMode] = useState<"file" | "json_paste">("file");
  const [file, setFile] = useState<File | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedQuestionRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "valid" | "errors">("all");
  const [isImporting, setIsImporting] = useState(false);
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setJsonText("");
    setParsedRows([]);
    setIsParsing(false);
    setFilterTab("all");
    setIsImporting(false);
    setJsonParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // 1. Download CSV Template
  const downloadSampleCsv = () => {
    const headers = [
      "Question",
      "Option A",
      "Option B",
      "Option C",
      "Option D",
      "Correct Answer",
      "Topic",
      "Difficulty",
      "Marks",
      "Explanation",
      "Tags",
    ];

    const sampleRows = [
      [
        "What is the time complexity of binary search on a sorted array?",
        "O(n)",
        "O(log n)",
        "O(n log n)",
        "O(1)",
        "O(log n)",
        "Algorithms",
        "Medium",
        "2",
        "Binary search divides the search space in half each iteration.",
        "algorithms, search",
      ],
      [
        "Which data structure operates on a Last In First Out (LIFO) principle?",
        "Queue",
        "Stack",
        "Linked List",
        "Binary Tree",
        "Stack",
        "Data Structures",
        "Easy",
        "1",
        "A stack pushes and pops from the top element first.",
        "data-structures, stack",
      ],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...sampleRows.map((row) =>
          row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Testify_${examSubject.replace(/\s+/g, "_")}_Questions_Template.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Download JSON Template
  const downloadSampleJson = () => {
    const sampleQuestions = [
      {
        questionText: "What is the time complexity of binary search on a sorted array?",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        correctAnswer: "O(log n)",
        topic: "Algorithms",
        difficulty: "MEDIUM",
        marks: 2,
        explanation: "Binary search divides search space in half each iteration.",
        tags: ["algorithms", "search"],
      },
      {
        questionText: "Which data structure operates on a Last In First Out (LIFO) principle?",
        options: ["Queue", "Stack", "Linked List", "Binary Tree"],
        correctAnswer: "Stack",
        topic: "Data Structures",
        difficulty: "EASY",
        marks: 1,
        explanation: "A stack pushes and pops from the top element first.",
        tags: ["data-structures", "stack"],
      },
      {
        questionText: "What does HTTP stand for in web architecture?",
        options: [
          "HyperText Transfer Protocol",
          "High Text Transmission Program",
          "Hyperlink Total Transfer Platform",
          "Host Terminal Transfer Protocol",
        ],
        correctAnswer: "HyperText Transfer Protocol",
        topic: "Networking",
        difficulty: "EASY",
        marks: 1,
        explanation: "HTTP is the foundational protocol for data exchange on the web.",
        tags: ["networking", "http"],
      },
    ];

    const jsonString =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(sampleQuestions, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute(
      "download",
      `Testify_${examSubject.replace(/\s+/g, "_")}_Questions_Template.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust CSV Line Parser
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Common Question Object Validator
  const validateQuestionItem = (
    item: any,
    rowNum: number,
    seenQuestions: Set<string>
  ): ParsedQuestionRow => {
    const qText = item.questionText || item.question || item.prompt || "";
    let rawOptions: string[] = [];

    if (Array.isArray(item.options)) {
      rawOptions = item.options.map(String);
    } else {
      rawOptions = [
        item.optionA || item.option_a || "",
        item.optionB || item.option_b || "",
        item.optionC || item.option_c || "",
        item.optionD || item.option_d || "",
      ];
    }

    const optA = rawOptions[0] || "";
    const optB = rawOptions[1] || "";
    const optC = rawOptions[2] || "";
    const optD = rawOptions[3] || "";

    const correctAns = String(item.correctAnswer || item.answer || item.correct_answer || "");
    const topic = item.topic || "General";
    const rawDiff = String(item.difficulty || "MEDIUM").toUpperCase();
    const rawMarks = item.marks !== undefined ? String(item.marks) : "1";
    const explanation = item.explanation || "";

    let tags: string[] = [];
    if (Array.isArray(item.tags)) {
      tags = item.tags.map(String);
    } else if (typeof item.tags === "string") {
      tags = item.tags.split(/[;,]/).map((t: string) => t.trim()).filter(Boolean);
    }

    const errors: string[] = [];

    // Validation Rule 1: Question text required
    if (!qText.trim()) {
      errors.push("Missing question text prompt");
    }

    // Validation Rule 2: Options
    const validOptions = [optA, optB, optC, optD].filter((o) => o.trim().length > 0);
    if (validOptions.length < 2) {
      errors.push("At least 2 options (Option A & B) are required");
    }

    // Validation Rule 3: Correct Answer
    if (!correctAns.trim()) {
      errors.push("Missing correct answer");
    } else {
      const trimmedAns = correctAns.trim();
      const letterMatch =
        (trimmedAns.toUpperCase() === "A" && optA) ||
        (trimmedAns.toUpperCase() === "B" && optB) ||
        (trimmedAns.toUpperCase() === "C" && optC) ||
        (trimmedAns.toUpperCase() === "D" && optD);

      const directMatch = validOptions.some(
        (o) => o.toLowerCase() === trimmedAns.toLowerCase()
      );

      if (!letterMatch && !directMatch) {
        errors.push(`Correct answer "${trimmedAns}" does not match any options`);
      }
    }

    // Validation Rule 4: Difficulty
    let difficulty: QuestionDifficulty = "MEDIUM";
    if (rawDiff.includes("EASY")) difficulty = "EASY";
    else if (rawDiff.includes("HARD")) difficulty = "HARD";

    // Validation Rule 5: Numeric marks
    const marksNum = Number(rawMarks);
    if (isNaN(marksNum) || marksNum <= 0) {
      errors.push("Marks must be a positive number");
    }

    // Validation Rule 6: Duplicate detection in batch
    const normalizedQ = qText.toLowerCase().trim();
    if (normalizedQ && seenQuestions.has(normalizedQ)) {
      errors.push("Duplicate question prompt in this batch");
    } else if (normalizedQ) {
      seenQuestions.add(normalizedQ);
    }

    // Resolve correct answer value (if letter A/B/C/D)
    let resolvedCorrectAnswer = correctAns.trim();
    if (correctAns.trim().toUpperCase() === "A" && optA) resolvedCorrectAnswer = optA;
    else if (correctAns.trim().toUpperCase() === "B" && optB) resolvedCorrectAnswer = optB;
    else if (correctAns.trim().toUpperCase() === "C" && optC) resolvedCorrectAnswer = optC;
    else if (correctAns.trim().toUpperCase() === "D" && optD) resolvedCorrectAnswer = optD;

    return {
      rowNumber: rowNum,
      questionText: qText,
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctAnswer: resolvedCorrectAnswer,
      topic: topic || "General",
      difficulty,
      marks: isNaN(marksNum) || marksNum <= 0 ? 1 : marksNum,
      explanation,
      tags,
      isValid: errors.length === 0,
      errors,
    };
  };

  // Process and Validate Uploaded File (.CSV or .JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setJsonParseError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;

        // Check if file is JSON
        if (selectedFile.name.endsWith(".json") || text.trim().startsWith("[") || text.trim().startsWith("{")) {
          try {
            const parsedJson = JSON.parse(text);
            const items = Array.isArray(parsedJson) ? parsedJson : parsedJson.questions || [parsedJson];
            const seenQuestions = new Set<string>();
            const parsed = items.map((item: any, idx: number) =>
              validateQuestionItem(item, idx + 1, seenQuestions)
            );
            setParsedRows(parsed);
          } catch (err: any) {
            setJsonParseError(`Invalid JSON file syntax: ${err.message}`);
          }
          return;
        }

        // Otherwise parse CSV
        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length <= 1) {
          setParsedRows([]);
          return;
        }

        const rawHeaders = parseCsvLine(lines[0]);
        const isFirstLineHeader =
          rawHeaders[0]?.toLowerCase().includes("question") ||
          rawHeaders[1]?.toLowerCase().includes("option");

        const dataLines = isFirstLineHeader ? lines.slice(1) : lines;
        const seenQuestions = new Set<string>();

        const parsed = dataLines.map((line, index) => {
          const cols = parseCsvLine(line);
          const rowNum = isFirstLineHeader ? index + 2 : index + 1;
          const item = {
            questionText: cols[0] || "",
            optionA: cols[1] || "",
            optionB: cols[2] || "",
            optionC: cols[3] || "",
            optionD: cols[4] || "",
            correctAnswer: cols[5] || "",
            topic: cols[6] || "General",
            difficulty: cols[7] || "Medium",
            marks: cols[8] || "1",
            explanation: cols[9] || "",
            tags: cols[10] || "",
          };
          return validateQuestionItem(item, rowNum, seenQuestions);
        });

        setParsedRows(parsed);
      } catch (err) {
        console.error("Error parsing file:", err);
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsText(selectedFile);
  };

  // Process Directly Pasted JSON Text
  const handleParsePastedJson = () => {
    if (!jsonText.trim()) return;

    setIsParsing(true);
    setJsonParseError(null);

    try {
      const parsedJson = JSON.parse(jsonText);
      const items = Array.isArray(parsedJson) ? parsedJson : parsedJson.questions || [parsedJson];

      const seenQuestions = new Set<string>();
      const parsed = items.map((item: any, idx: number) =>
        validateQuestionItem(item, idx + 1, seenQuestions)
      );

      setParsedRows(parsed);
    } catch (err: any) {
      setJsonParseError(`Invalid JSON Syntax: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const errorRows = parsedRows.filter((r) => !r.isValid);

  const displayedRows =
    filterTab === "valid"
      ? validRows
      : filterTab === "errors"
      ? errorRows
      : parsedRows;

  // Execute Batch Import for Valid Questions
  const handleImportApproved = () => {
    if (validRows.length === 0) return;

    setIsImporting(true);

    const questionsToImport: QuestionItem[] = validRows.map((row, i) => {
      const options = [row.optionA, row.optionB, row.optionC, row.optionD].filter(
        (o) => o.trim().length > 0
      );

      return {
        _id: `q_bulk_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        questionText: row.questionText.trim(),
        questionType: "MCQ",
        options,
        correctAnswer: row.correctAnswer.trim(),
        explanation: row.explanation.trim(),
        category: "Academic",
        subject: examSubject,
        topic: row.topic.trim() || "General",
        difficulty: row.difficulty,
        marks: row.marks,
        tags: row.tags,
        status: "READY",
        createdBy: "Teacher",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    onImportQuestions(questionsToImport);
    setIsImporting(false);
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Import Exam Questions (JSON / CSV)"
      description={`Import multiple questions at once for ${examSubject}. Subject is automatically inherited.`}
      size="xl"
    >
      <div className="space-y-5 pt-1">
        {/* Step 1: Template Download Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-blue-50/80 dark:bg-cyan-950/40 border border-blue-200/80 dark:border-cyan-800">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-cyan-900/60 text-[#0092E3] dark:text-cyan-300 shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#152234] dark:text-white">
                Download Questions Template (.JSON or .CSV)
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Prepare 50–100+ questions. Subject is already set to <strong>{examSubject}</strong> and does not need to be specified in the file.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={downloadSampleJson}
              className="bg-white hover:bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs"
              leftIcon={<FileCode className="h-4 w-4 text-purple-600" />}
            >
              JSON Template
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={downloadSampleCsv}
              className="bg-white hover:bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs"
              leftIcon={<Download className="h-4 w-4 text-[#0092E3]" />}
            >
              CSV Template
            </Button>
          </div>
        </div>

        {/* Mode Switcher: File Upload vs Paste JSON */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setImportMode("file")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              importMode === "file"
                ? "bg-[#152234] text-white"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload File (.JSON / .CSV)
          </button>

          <button
            type="button"
            onClick={() => setImportMode("json_paste")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              importMode === "json_paste"
                ? "bg-purple-600 text-white"
                : "text-slate-500 hover:text-purple-600"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Paste JSON Code
          </button>
        </div>

        {/* Option A: File Upload Zone */}
        {importMode === "file" && !file && parsedRows.length === 0 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0092E3] dark:hover:border-cyan-400 rounded-3xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-950/40 group space-y-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,.json,application/json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-slate-900 text-[#0092E3] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click to upload JSON or CSV file
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports .JSON arrays and .CSV spreadsheets up to 10MB
              </p>
            </div>
          </div>
        )}

        {/* Option B: Direct JSON Code Paste */}
        {importMode === "json_paste" && parsedRows.length === 0 && (
          <div className="space-y-3">
            <textarea
              rows={8}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={`[\n  {\n    "questionText": "What is binary search?",\n    "options": ["O(log n)", "O(n)", "O(1)", "O(n^2)"],\n    "correctAnswer": "O(log n)",\n    "topic": "Algorithms",\n    "difficulty": "MEDIUM",\n    "marks": 2\n  }\n]`}
              className="w-full font-mono text-xs p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />

            {jsonParseError && (
              <p className="text-xs text-rose-500 font-bold">
                ⚠️ {jsonParseError}
              </p>
            )}

            <Button
              type="button"
              disabled={!jsonText.trim() || isParsing}
              onClick={handleParsePastedJson}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
              leftIcon={<Code className="h-3.5 w-3.5" />}
            >
              Parse & Validate JSON
            </Button>
          </div>
        )}

        {/* Parsed Preview Table & Validation Metrics */}
        {parsedRows.length > 0 && (
          <div className="space-y-4">
            {/* Header info & clear */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-[#0092E3]" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                  {file ? file.name : "Pasted JSON Data"}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  ({parsedRows.length} Questions Processed)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetState}
                  className="p-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove and re-upload"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Validation Overview Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Total Questions
                </span>
                <p className="text-xl font-extrabold font-display text-[#152234] dark:text-white">
                  {parsedRows.length}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Valid to Import
                </span>
                <p className="text-xl font-extrabold font-display text-emerald-700 dark:text-emerald-300">
                  {validRows.length}
                </p>
              </div>

              <div className={`p-3 rounded-2xl border text-center ${
                errorRows.length > 0
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400"
              }`}>
                <span className="text-[10px] font-bold uppercase">
                  Validation Errors
                </span>
                <p className="text-xl font-extrabold font-display">
                  {errorRows.length}
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filterTab === "all"
                    ? "bg-[#152234] text-white"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                All ({parsedRows.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("valid")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filterTab === "valid"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-500 hover:text-emerald-600"
                }`}
              >
                Valid ({validRows.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("errors")}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  filterTab === "errors"
                    ? "bg-rose-600 text-white"
                    : "text-slate-500 hover:text-rose-600"
                }`}
              >
                Errors ({errorRows.length})
              </button>
            </div>

            {/* Interactive Preview Table */}
            <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-2.5 pl-3">Row</th>
                    <th className="p-2.5">Question Text</th>
                    <th className="p-2.5">Options</th>
                    <th className="p-2.5">Correct Answer</th>
                    <th className="p-2.5">Marks</th>
                    <th className="p-2.5 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        No rows matching this filter.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={
                          row.isValid
                            ? "hover:bg-slate-50/60 dark:hover:bg-slate-900/60"
                            : "bg-rose-50/40 dark:bg-rose-950/20"
                        }
                      >
                        <td className="p-2.5 pl-3 font-mono text-slate-400">
                          #{row.rowNumber}
                        </td>
                        <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                          {row.questionText || <span className="text-rose-500 italic">Empty</span>}
                        </td>
                        <td className="p-2.5 text-slate-500">
                          {[row.optionA, row.optionB, row.optionC, row.optionD]
                            .filter(Boolean)
                            .join(" | ") || <span className="text-rose-500 italic">Missing</span>}
                        </td>
                        <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                          {row.correctAnswer || <span className="text-rose-500 italic">None</span>}
                        </td>
                        <td className="p-2.5 font-mono">{row.marks}</td>
                        <td className="p-2.5 pr-3">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> Valid
                            </span>
                          ) : (
                            <div className="space-y-0.5">
                              {row.errors.map((err, ei) => (
                                <span
                                  key={ei}
                                  className="block text-[10px] font-bold text-rose-600 dark:text-rose-400 leading-tight"
                                >
                                  • {err}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>

          <Button
            type="button"
            disabled={validRows.length === 0 || isImporting}
            onClick={handleImportApproved}
            className="bg-[#0092E3] hover:bg-[#007AC9] text-white font-bold px-6"
            leftIcon={<Upload className="h-4 w-4" />}
          >
            {isImporting
              ? "Importing..."
              : `Import ${validRows.length} Valid Questions`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
