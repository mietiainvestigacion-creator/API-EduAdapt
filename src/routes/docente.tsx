import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  PlusCircle,
  Trash2,
  Users,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { EduLogo } from "@/components/EduLogo";
import {
  DEFAULT_LESSONS,
  store,
  type InteractionLog,
  type Lesson,
  type ProgressEntry,
  type StudentProfile,
} from "@/lib/eduadapt-store";

export const Route = createFileRoute("/docente")({
  component: TeacherPage,
});

function TeacherPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [allProgress, setAllProgress] = useState<Record<string, Record<string, ProgressEntry>>>({});
  const [logs, setLogs] = useState<InteractionLog[]>([]);
  const [tab, setTab] = useState<"dashboard" | "lessons" | "students" | "logs">("dashboard");

  const refresh = () => {
    setLessons(store.getLessons());
    setStudents(store.getStudents());
    setAllProgress(store.getAllProgress());
    setLogs(store.getLogs());
  };
  useEffect(() => { refresh(); }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/"><EduLogo /></Link>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <ShieldCheck className="h-4 w-4 text-success" /> Modo docente
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Panel docente</h1>
          <p className="mt-2 text-muted-foreground">
            Supervisa, ajusta y orquesta la experiencia de aprendizaje personalizado.
          </p>
        </div>

        <nav className="mb-6 flex flex-wrap gap-2 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        {tab === "dashboard" && (
          <Dashboard students={students} allProgress={allProgress} lessons={lessons} />
        )}
        {tab === "lessons" && (
          <LessonsManager lessons={lessons} onChange={(l) => { store.saveLessons(l); refresh(); }} />
        )}
        {tab === "students" && (
          <StudentsManager students={students} allProgress={allProgress} lessons={lessons} />
        )}
        {tab === "logs" && <LogsViewer logs={logs} />}
      </main>
    </div>
  );
}

const TABS = [
  { key: "dashboard" as const, label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "lessons" as const, label: "Lecciones", icon: <BookOpen className="h-4 w-4" /> },
  { key: "students" as const, label: "Estudiantes", icon: <Users className="h-4 w-4" /> },
  { key: "logs" as const, label: "Trazabilidad", icon: <Activity className="h-4 w-4" /> },
];

// ---------- Dashboard ----------

function Dashboard({
  students,
  allProgress,
  lessons,
}: {
  students: StudentProfile[];
  allProgress: Record<string, Record<string, ProgressEntry>>;
  lessons: Lesson[];
}) {
  const stats = useMemo(() => {
    const all = Object.values(allProgress).flatMap((p) => Object.values(p));
    const completed = all.filter((p) => p.completedAt);
    const avgMot = avg(completed.map((p) => p.motivation));
    const avgAut = avg(completed.map((p) => p.autonomyLevel));
    const avgPost = avg(completed.map((p) => p.postTestScore ?? 0));
    return {
      studentsCount: students.length,
      lessonsActive: lessons.filter((l) => l.enabled).length,
      completed: completed.length,
      avgMot, avgAut, avgPost,
    };
  }, [students, allProgress, lessons]);

  const perLesson = useMemo(() => {
    return lessons.map((l) => {
      const entries = Object.values(allProgress).map((p) => p[l.id]).filter(Boolean);
      const done = entries.filter((e) => e.completedAt).length;
      const avgScore = avg(entries.map((e) => e.postTestScore ?? 0));
      return { lesson: l, attempts: entries.length, completed: done, avgScore };
    });
  }, [lessons, allProgress]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPI icon={<Users className="h-5 w-5" />} label="Estudiantes" value={stats.studentsCount} />
        <KPI icon={<BookOpen className="h-5 w-5" />} label="Lecciones activas" value={stats.lessonsActive} />
        <KPI icon={<CheckCircle2 className="h-5 w-5" />} label="Lecciones completadas" value={stats.completed} />
        <KPI icon={<TrendingUp className="h-5 w-5" />} label="Promedio post-test" value={`${Math.round(stats.avgPost)}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Motivación y autonomía promedio">
          <div className="space-y-5 py-2">
            <Gauge label="Motivación" value={Math.round(stats.avgMot)} color="var(--color-primary)" />
            <Gauge label="Autonomía" value={Math.round(stats.avgAut)} color="var(--color-accent)" />
            <Gauge label="Dominio" value={Math.round(stats.avgPost)} color="var(--color-success)" />
          </div>
        </Panel>

        <Panel title="Desempeño por lección">
          {perLesson.length === 0 ? (
            <Empty text="Sin datos aún." />
          ) : (
            <div className="space-y-3 py-1">
              {perLesson.map((p) => (
                <div key={p.lesson.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <div className="font-medium">{p.lesson.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.completed}/{p.attempts} · {Math.round(p.avgScore)}%
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full gradient-accent" style={{ width: `${p.avgScore}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">{icon}</div>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">{label}</div>
      <div className="font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

// ---------- Lessons Manager ----------

function LessonsManager({ lessons, onChange }: { lessons: Lesson[]; onChange: (l: Lesson[]) => void }) {
  const [draft, setDraft] = useState<Lesson | null>(null);

  const toggle = (id: string) =>
    onChange(lessons.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l)));
  const remove = (id: string) => onChange(lessons.filter((l) => l.id !== id));
  const save = (l: Lesson) => {
    if (lessons.some((x) => x.id === l.id)) {
      onChange(lessons.map((x) => (x.id === l.id ? l : x)));
    } else {
      onChange([...lessons, l]);
    }
    setDraft(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold">Lecciones</h2>
        <div className="flex gap-2">
          <button
            onClick={() => onChange(DEFAULT_LESSONS)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"
          >
            Restaurar predeterminadas
          </button>
          <button
            onClick={() =>
              setDraft({
                id: `cust-${Date.now()}`,
                title: "Nueva lección",
                objective: "",
                competency: "",
                difficulty: 1,
                enabled: true,
                preTestQuestion: "",
                preTestAnswer: "",
                postTestQuestion: "",
                postTestAnswer: "",
              })
            }
            className="inline-flex items-center gap-2 rounded-lg gradient-hero px-3 py-2 text-sm font-medium text-white shadow-glow"
          >
            <PlusCircle className="h-4 w-4" /> Nueva
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Lección</th>
              <th className="px-4 py-3">Dificultad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{l.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{l.objective}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{["Inicial","Intermedio","Avanzado"][l.difficulty-1]}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(l.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      l.enabled ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {l.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {l.enabled ? "Visible" : "Oculta"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setDraft(l)} className="rounded-md px-2 py-1 text-xs text-primary hover:bg-secondary">Editar</button>
                  <button onClick={() => remove(l.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {draft && <LessonEditor draft={draft} onSave={save} onCancel={() => setDraft(null)} />}
    </div>
  );
}

function LessonEditor({ draft, onSave, onCancel }: { draft: Lesson; onSave: (l: Lesson) => void; onCancel: () => void }) {
  const [l, setL] = useState<Lesson>(draft);
  const set = <K extends keyof Lesson>(k: K, v: Lesson[K]) => setL({ ...l, [k]: v });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-glow">
        <h3 className="font-display text-lg font-semibold">Editar lección</h3>
        <div className="mt-4 grid gap-3">
          <Field label="Título"><input value={l.title} onChange={(e) => set("title", e.target.value)} className={INP} /></Field>
          <Field label="Objetivo"><textarea value={l.objective} onChange={(e) => set("objective", e.target.value)} rows={2} className={INP} /></Field>
          <Field label="Competencia MEN"><input value={l.competency} onChange={(e) => set("competency", e.target.value)} className={INP} /></Field>
          <Field label="Dificultad">
            <select value={l.difficulty} onChange={(e) => set("difficulty", Number(e.target.value) as 1|2|3)} className={INP}>
              <option value={1}>Inicial</option>
              <option value={2}>Intermedio</option>
              <option value={3}>Avanzado</option>
            </select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Pregunta pre-test"><input value={l.preTestQuestion} onChange={(e) => set("preTestQuestion", e.target.value)} className={INP} /></Field>
            <Field label="Palabra clave esperada"><input value={l.preTestAnswer} onChange={(e) => set("preTestAnswer", e.target.value)} className={INP} /></Field>
            <Field label="Pregunta post-test"><input value={l.postTestQuestion} onChange={(e) => set("postTestQuestion", e.target.value)} className={INP} /></Field>
            <Field label="Palabra clave esperada"><input value={l.postTestAnswer} onChange={(e) => set("postTestAnswer", e.target.value)} className={INP} /></Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-sm">Cancelar</button>
          <button onClick={() => onSave(l)} className="rounded-lg gradient-hero px-4 py-2 text-sm font-medium text-white shadow-glow">Guardar</button>
        </div>
      </div>
    </div>
  );
}

const INP = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

// ---------- Students Manager ----------

function StudentsManager({
  students,
  allProgress,
  lessons,
}: {
  students: StudentProfile[];
  allProgress: Record<string, Record<string, ProgressEntry>>;
  lessons: Lesson[];
}) {
  if (students.length === 0) return <Empty text="Aún no hay estudiantes registrados." />;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {students.map((s) => {
        const p = allProgress[s.name] || {};
        const entries = Object.values(p);
        const completed = entries.filter((e) => e.completedAt).length;
        const avgScore = avg(entries.map((e) => e.postTestScore ?? 0));
        const avgAut = avg(entries.map((e) => e.autonomyLevel));
        const avgMot = avg(entries.map((e) => e.motivation));
        return (
          <div key={s.name} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                <div className="mt-1 text-xs capitalize text-muted-foreground">
                  Interés: {s.interest} · Ritmo: {s.pace}
                </div>
              </div>
              <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                {completed}/{lessons.filter((l) => l.enabled).length}
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <Gauge label="Dominio promedio" value={Math.round(avgScore)} color="var(--color-success)" />
              <Gauge label="Autonomía" value={Math.round(avgAut)} color="var(--color-primary)" />
              <Gauge label="Motivación" value={Math.round(avgMot)} color="var(--color-accent)" />
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Lecciones</div>
              <div className="space-y-1.5">
                {lessons.map((l) => {
                  const e = p[l.id];
                  return (
                    <div key={l.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{l.title}</span>
                      <span className={`text-xs ${e?.completedAt ? "text-success" : "text-muted-foreground"}`}>
                        {e?.completedAt ? `${e.postTestScore}%` : "pendiente"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Logs ----------

function LogsViewer({ logs }: { logs: InteractionLog[] }) {
  if (logs.length === 0) return <Empty text="Sin interacciones registradas." />;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Hora</th>
            <th className="px-4 py-3">Estudiante</th>
            <th className="px-4 py-3">Lección</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {logs.slice(0, 100).map((l) => (
            <tr key={l.id} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{new Date(l.timestamp).toLocaleString()}</span>
              </td>
              <td className="px-4 py-2.5 font-medium">{l.studentName}</td>
              <td className="px-4 py-2.5">{l.lessonId}</td>
              <td className="px-4 py-2.5">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{l.type}</span>
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">{l.payload}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- helpers ----------

function avg(xs: number[]) {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
      {text}
    </div>
  );
}
