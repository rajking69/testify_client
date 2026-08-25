import Link from "next/link";
import { Activity, ArrowRight, ClipboardList, FileCheck2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const exams = [
  { title: "Computer Science Midterm", subject: "Data Structures", date: "Today, 2:00 PM", students: 32, status: "Live" },
  { title: "Database Systems Quiz", subject: "SQL and Indexing", date: "Tomorrow, 10:00 AM", students: 24, status: "Scheduled" },
  { title: "JavaScript Fundamentals", subject: "Async Programming", date: "Aug 29, 2026", students: 18, status: "Draft" },
];

export default function TeacherExamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">Exam operations</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Your exams</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">Create, schedule, and manage every assessment from one place.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>Create exam</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {exams.map((exam) => <Card key={exam.title} hoverEffect><CardHeader><div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"><ClipboardList className="h-5 w-5" /></div><Badge variant={exam.status === "Live" ? "success" : exam.status === "Scheduled" ? "info" : "outline"}>{exam.status}</Badge></div><CardTitle className="mt-4">{exam.title}</CardTitle><p className="mt-1 text-xs text-slate-500">{exam.subject}</p></CardHeader><CardContent className="space-y-4"><div className="flex justify-between text-xs text-slate-500"><span>{exam.date}</span><span>{exam.students} students</span></div><div className="flex gap-2">{exam.status === "Live" ? <Link href="/teacher/monitoring"><Button size="sm" leftIcon={<Activity className="h-3.5 w-3.5" />}>Monitor</Button></Link> : <Button size="sm" variant="outline" leftIcon={<FileCheck2 className="h-3.5 w-3.5" />}>Manage</Button>}<Button size="sm" variant="ghost" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>View details</Button></div></CardContent></Card>)}
      </div>
    </div>
  );
}
