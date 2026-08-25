"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  Filter,
  Search,
  ShieldAlert,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type StudentStatus = "Pending" | "Admitted" | "Rejected";
type MonitorStatus = "On track" | "Needs attention" | "Submitted";

interface Student {
  id: number;
  name: string;
  email: string;
  exam: string;
  status: StudentStatus;
}

const initialStudents: Student[] = [
  { id: 1, name: "Aisha Rahman", email: "aisha@example.com", exam: "Computer Science Midterm", status: "Pending" },
  { id: 2, name: "Daniel Kim", email: "daniel@example.com", exam: "Computer Science Midterm", status: "Admitted" },
  { id: 3, name: "Maya Patel", email: "maya@example.com", exam: "Database Systems Quiz", status: "Pending" },
  { id: 4, name: "Noah Williams", email: "noah@example.com", exam: "Database Systems Quiz", status: "Admitted" },
];

const monitorRows = [
  { name: "Daniel Kim", exam: "Computer Science Midterm", progress: 72, time: "18:42", status: "On track" as MonitorStatus },
  { name: "Noah Williams", exam: "Computer Science Midterm", progress: 46, time: "25:09", status: "Needs attention" as MonitorStatus },
  { name: "Maya Patel", exam: "Database Systems Quiz", progress: 100, time: "Submitted", status: "Submitted" as MonitorStatus },
  { name: "Aisha Rahman", exam: "Computer Science Midterm", progress: 21, time: "31:16", status: "On track" as MonitorStatus },
];

const evaluationRows = [
  { id: 1, student: "Maya Patel", exam: "Database Systems Quiz", submitted: "Today, 10:42 AM", score: null },
  { id: 2, student: "Daniel Kim", exam: "Computer Science Midterm", submitted: "Today, 9:58 AM", score: null },
  { id: 3, student: "Noah Williams", exam: "Computer Science Midterm", submitted: "Yesterday, 4:20 PM", score: 82 },
];

const resultRows = [
  { student: "Maya Patel", exam: "Database Systems Quiz", score: 94, grade: "A", submitted: "Aug 25, 2026" },
  { student: "Noah Williams", exam: "Computer Science Midterm", score: 82, grade: "B+", submitted: "Aug 24, 2026" },
  { student: "Daniel Kim", exam: "Computer Science Midterm", score: 76, grade: "B", submitted: "Aug 24, 2026" },
  { student: "Aisha Rahman", exam: "Database Systems Quiz", score: 68, grade: "C+", submitted: "Aug 23, 2026" },
];

function statusVariant(status: StudentStatus | MonitorStatus) {
  if (status === "Admitted" || status === "On track" || status === "Submitted") return "success" as const;
  if (status === "Rejected" || status === "Needs attention") return "danger" as const;
  return "warning" as const;
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">{icon}</div>
        <div><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{value}</p></div>
      </CardContent>
    </Card>
  );
}

export function AdmissionPanel() {
  const [students, setStudents] = useState(initialStudents);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const visibleStudents = students.filter((student) => `${student.name} ${student.email} ${student.exam}`.toLowerCase().includes(query.toLowerCase()));

  const updateStatus = (id: number, status: StudentStatus) => {
    setStudents((current) => current.map((student) => student.id === id ? { ...student, status } : student));
    setNotice(`Student ${status.toLowerCase()} successfully.`);
  };

  return <div className="space-y-6">
    <PageIntro eyebrow="Student admission" title="Admit students to exams" description="Review enrollment requests, assign an exam, and control who can enter each assessment." action={<Button leftIcon={<UserPlus className="h-4 w-4" />}>Invite student</Button>} />
    {notice && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" />{notice}</div>}
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Total requests" value={`${students.length}`} icon={<Users className="h-5 w-5" />} /><Stat label="Admitted" value={`${students.filter((student) => student.status === "Admitted").length}`} icon={<Check className="h-5 w-5" />} /><Stat label="Pending review" value={`${students.filter((student) => student.status === "Pending").length}`} icon={<Clock3 className="h-5 w-5" />} /></div>
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>Admission requests</CardTitle><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students..." className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" /></div></CardHeader>
      <CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60"><tr><th className="px-6 py-3">Student</th><th className="px-6 py-3">Exam</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{visibleStudents.map((student) => <tr key={student.id}><td className="px-6 py-4"><p className="font-semibold text-slate-900 dark:text-white">{student.name}</p><p className="text-xs text-slate-500">{student.email}</p></td><td className="px-6 py-4 text-slate-600 dark:text-slate-300">{student.exam}</td><td className="px-6 py-4"><Badge variant={statusVariant(student.status)}>{student.status}</Badge></td><td className="px-6 py-4"><div className="flex justify-end gap-2">{student.status === "Pending" && <><Button size="sm" onClick={() => updateStatus(student.id, "Admitted")} leftIcon={<Check className="h-3.5 w-3.5" />}>Admit</Button><Button size="sm" variant="outline" onClick={() => updateStatus(student.id, "Rejected")} leftIcon={<X className="h-3.5 w-3.5" />}>Reject</Button></>}{student.status !== "Pending" && <Button size="sm" variant="ghost">View profile</Button>}</div></td></tr>)}</tbody></table></CardContent>
    </Card>
  </div>;
}

export function MonitoringPanel() {
  const [lastUpdated, setLastUpdated] = useState("just now");
  const [selected, setSelected] = useState<string | null>(null);
  return <div className="space-y-6">
    <PageIntro eyebrow="Live monitoring" title="Monitor active exams" description="Track progress, time remaining, and integrity alerts while students are taking an exam." action={<Button variant="outline" onClick={() => setLastUpdated("just now")} leftIcon={<Activity className="h-4 w-4" />}>Refresh monitor</Button>} />
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Active exams" value="2" icon={<FileCheck2 className="h-5 w-5" />} /><Stat label="Students online" value="32" icon={<Users className="h-5 w-5" />} /><Stat label="Alerts to review" value="3" icon={<ShieldAlert className="h-5 w-5" />} /></div>
    <p className="text-xs text-slate-500">Last updated {lastUpdated}</p>
    <Card><CardHeader><CardTitle>Live student activity</CardTitle></CardHeader><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60"><tr><th className="px-6 py-3">Student</th><th className="px-6 py-3">Exam</th><th className="px-6 py-3">Progress</th><th className="px-6 py-3">Time</th><th className="px-6 py-3">Status</th><th className="px-6 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{monitorRows.map((row) => <tr key={row.name}><td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{row.name}</td><td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.exam}</td><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-2 w-24 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${row.progress}%` }} /></div><span className="text-xs font-semibold">{row.progress}%</span></div></td><td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.time}</td><td className="px-6 py-4"><Badge variant={statusVariant(row.status)}>{row.status}</Badge></td><td className="px-6 py-4 text-right"><Button size="sm" variant="ghost" onClick={() => setSelected(row.name)} leftIcon={<Eye className="h-3.5 w-3.5" />}>Inspect</Button></td></tr>)}</tbody></table></CardContent></Card>
    {selected && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Monitoring details opened for <strong>{selected}</strong>. Review focus and proctoring events before contacting the student.</div>}
  </div>;
}

export function EvaluationPanel() {
  const [scores, setScores] = useState<Record<number, number>>({ 3: 82 });
  const [selectedId, setSelectedId] = useState(1);
  const selected = evaluationRows.find((row) => row.id === selectedId) ?? evaluationRows[0];
  const [score, setScore] = useState(String(scores[selected.id] ?? ""));
  const saveScore = () => setScores((current) => ({ ...current, [selected.id]: Number(score) }));
  return <div className="space-y-6">
    <PageIntro eyebrow="Post-exam evaluation" title="Review and grade submissions" description="Evaluate written answers, override automated scores, and publish final results when your review is complete." action={<Badge variant="warning">{evaluationRows.filter((row) => !scores[row.id]).length} awaiting review</Badge>} />
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><Card><CardHeader><CardTitle>Submission queue</CardTitle></CardHeader><CardContent className="space-y-2">{evaluationRows.map((row) => <button key={row.id} onClick={() => { setSelectedId(row.id); setScore(String(scores[row.id] ?? "")); }} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${selected.id === row.id ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30" : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"}`}><span><span className="block font-semibold text-slate-900 dark:text-white">{row.student}</span><span className="mt-1 block text-xs text-slate-500">{row.exam} · {row.submitted}</span></span>{scores[row.id] ? <Badge variant="success">{scores[row.id]} / 100</Badge> : <Badge variant="warning">Needs review</Badge>}</button>)}</CardContent></Card><Card><CardHeader><CardTitle>Evaluation workspace</CardTitle></CardHeader><CardContent className="space-y-5"><div><p className="font-semibold text-slate-900 dark:text-white">{selected.student}</p><p className="text-xs text-slate-500">{selected.exam}</p></div><div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-950 dark:text-slate-300">Student response: Explain how database indexing improves query performance and mention one trade-off.</div><div className="grid gap-2"><label htmlFor="score" className="text-xs font-bold uppercase tracking-wide text-slate-500">Final score</label><input id="score" type="number" min="0" max="100" value={score} onChange={(event) => setScore(event.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" /></div><Button onClick={saveScore} leftIcon={<Check className="h-4 w-4" />}>Save evaluation</Button></CardContent></Card></div>
  </div>;
}

export function ResultsPanel() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All exams");
  const exams = ["All exams", ...new Set(resultRows.map((row) => row.exam))];
  const filtered = useMemo(() => resultRows.filter((row) => `${row.student} ${row.exam}`.toLowerCase().includes(query.toLowerCase()) && (filter === "All exams" || row.exam === filter)), [filter, query]);
  const average = Math.round(resultRows.reduce((total, row) => total + row.score, 0) / resultRows.length);
  return <div className="space-y-6">
    <PageIntro eyebrow="Results & analytics" title="Results overview" description="Review class performance, identify students who need support, and share published results." action={<Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Export CSV</Button>} />
    <div className="grid gap-4 sm:grid-cols-3"><Stat label="Submissions" value={`${resultRows.length}`} icon={<FileCheck2 className="h-5 w-5" />} /><Stat label="Average score" value={`${average}%`} icon={<Activity className="h-5 w-5" />} /><Stat label="Pass rate" value="75%" icon={<CheckCircle2 className="h-5 w-5" />} /></div>
    <Card><CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>Published results</CardTitle><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search results..." className="h-9 rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" /></div><div className="relative"><Filter className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950">{exams.map((exam) => <option key={exam}>{exam}</option>)}</select></div></div></CardHeader><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60"><tr><th className="px-6 py-3">Student</th><th className="px-6 py-3">Exam</th><th className="px-6 py-3">Score</th><th className="px-6 py-3">Grade</th><th className="px-6 py-3">Submitted</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filtered.map((row) => <tr key={`${row.student}-${row.exam}`}><td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{row.student}</td><td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.exam}</td><td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.score}%</td><td className="px-6 py-4"><Badge variant={row.score >= 80 ? "success" : row.score >= 70 ? "info" : "warning"}>{row.grade}</Badge></td><td className="px-6 py-4 text-slate-500">{row.submitted}</td></tr>)}</tbody></table></CardContent></Card>
  </div>;
}
