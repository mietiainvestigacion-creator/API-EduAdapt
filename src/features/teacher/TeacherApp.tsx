import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { EduLogo } from "@/shared/components/EduLogo";
import { getBrowserSupabase } from "@/shared/lib/supabase";
import { teacherFetch } from "@/shared/lib/api";
import { avg } from "@/shared/lib/adaptive";
import type {
  ClassInfo,
  InteractionLog,
  Lesson,
  ProgressEntry,
  StudentProfile,
} from "@/shared/types/domain";

type Tab = "dashboard" | "lessons" | "students" | "logs";
type AuthState = "checking" | "guest" | "ready";

export function TeacherApp() {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthState>("checking");
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [classId, setClassId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState("");
  const [tab, setTab] = useState<Tab>("dashboard");
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressByStudent, setProgressByStudent] = useState<
    Record<string, Record<string, ProgressEntry>>
  >({});
  const [logs, setLogs] = useState<InteractionLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [rosterText, setRosterText] = useState("");
  const [busy, setBusy] = useState(false);

  const activeClass = classes.find((c) => c.id === classId) || null;

  const loadClasses = useCallback(async () => {
    const data = await teacherFetch("/api/teacher/classes");
    setClasses(data.classes || []);
    setTeacherName(data.teacher?.fullName || "");
    setClassId((prev) => prev || data.classes?.[0]?.id || null);
    return data.classes as ClassInfo[];
  }, []);

  const loadDashboard = useCallback(async (id: string) => {
    const data = await teacherFetch(`/api/teacher/dashboard?classId=${encodeURIComponent(id)}`);
    setStudents(data.students || []);
    setLessons(data.lessons || []);
    setProgressByStudent(data.progressByStudent || {});
    setLogs(data.logs || []);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const supabase = getBrowserSupabase();
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setAuth("guest");
          return;
        }
        await loadClasses();
        setAuth("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error de sesión");
        setAuth("guest");
      }
    })();
  }, [loadClasses]);

  useEffect(() => {
    if (auth !== "ready" || !classId) return;
    void loadDashboard(classId).catch((e) =>
      setError(e instanceof Error ? e.message : "Error cargando panel"),
    );
  }, [auth, classId, loadDashboard]);

  const logout = async () => {
    await getBrowserSupabase().auth.signOut();
    setAuth("guest");
    navigate({ to: "/docente/login", replace: true });
  };

  if (auth === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando sesión...
      </div>
    );
  }

  if (auth === "guest") {
    return <Navigate to="/docente/login" replace />;
  }

  const createClass = async () => {
    if (!newClassName.trim()) return;
    setBusy(true);
    try {
      const data = await teacherFetch("/api/teacher/classes", {
        method: "POST",
        body: JSON.stringify({ name: newClassName.trim() }),
      });
      setNewClassName("");
      await loadClasses();
      setClassId(data.class.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const addStudents = async () => {
    if (!classId || !rosterText.trim()) return;
    setBusy(true);
    try {
      const codes = rosterText
        .split(/[\n,;]+/)
        .map((n) => n.trim())
        .filter(Boolean);
      await teacherFetch("/api/teacher/students", {
        method: "POST",
        body: JSON.stringify({ classId, codes }),
      });
      setRosterText("");
      await loadDashboard(classId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  const saveTutorProfile = async (studentId: string, tutorProfile: string) => {
    if (!classId) return;
    await teacherFetch("/api/teacher/students", {
      method: "PATCH",
      body: JSON.stringify({ classId, studentId, tutorProfile }),
    });
    await loadDashboard(classId);
  };

  const toggleLesson = async (lessonId: string, enabled: boolean) => {
    if (!classId) return;
    await teacherFetch("/api/teacher/lessons", {
      method: "PATCH",
      body: JSON.stringify({ classId, lessonId, enabled }),
    });
    await loadDashboard(classId);
  };

  const removeStudent = async (studentId: string) => {
    if (!classId) return;
    await teacherFetch(
      `/api/teacher/students?classId=${encodeURIComponent(classId)}&studentId=${encodeURIComponent(studentId)}`,
      { method: "DELETE" },
    );
    await loadDashboard(classId);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/">
            <EduLogo />
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span className="hidden sm:inline">{teacherName || "Docente"}</span>
            <button
              onClick={() => void logout()}
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Panel docente</h1>
            <p className="mt-2 text-muted-foreground">
              Clase compartida: el progreso de todos los dispositivos aparece aquí.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={classId || ""}
              onChange={(e) => setClassId(e.target.value || null)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              {classes.length === 0 && <option value="">Sin clases</option>}
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Nueva clase"
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            />
            <button
              onClick={() => void createClass()}
              disabled={busy || !newClassName.trim()}
              className="inline-flex items-center gap-1 rounded-lg gradient-hero px-3 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              <PlusCircle className="h-4 w-4" /> Crear
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {activeClass && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-card">
            <span className="font-medium">{activeClass.name}</span>
            <span className="text-muted-foreground">Código de clase:</span>
            <code className="rounded bg-secondary px-2 py-1 font-mono text-base tracking-widest">
              {activeClass.joinCode}
            </code>
            <button
              className="inline-flex items-center gap-1 text-xs text-primary"
              onClick={() => void navigator.clipboard.writeText(activeClass.joinCode)}
            >
              <Copy className="h-3.5 w-3.5" /> Copiar
            </button>
          </div>
        )}

        {!activeClass ? (
          <Empty text="Crea una clase para comenzar. Luego agrega la lista de estudiantes." />
        ) : (
          <>
            <nav className="mb-6 flex flex-wrap gap-2 border-b border-border">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${
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
              <Dashboard students={students} progressByStudent={progressByStudent} lessons={lessons} />
            )}
            {tab === "lessons" && (
              <LessonsManager lessons={lessons} onToggle={(id, en) => void toggleLesson(id, en)} />
            )}
            {tab === "students" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h3 className="font-display font-semibold">Lista anónima (códigos Explora-TIC)</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Un código por línea (ej. 003, 014, 024). Sin nombres reales.
                  </p>
                  <textarea
                    value={rosterText}
                    onChange={(e) => setRosterText(e.target.value)}
                    rows={4}
                    className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm"
                    placeholder={"003\n014\n024\n..."}
                  />
                  <button
                    onClick={() => void addStudents()}
                    disabled={busy || !rosterText.trim()}
                    className="mt-3 rounded-lg gradient-hero px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                  >
                    Guardar códigos
                  </button>
                </div>
                <StudentsManager
                  students={students}
                  progressByStudent={progressByStudent}
                  lessons={lessons}
                  onRemove={(id) => void removeStudent(id)}
                  onSaveProfile={(id, text) => void saveTutorProfile(id, text)}
                />
              </div>
            )}
            {tab === "logs" && <LogsViewer logs={logs} />}
          </>
        )}
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

function Dashboard({
  students,
  progressByStudent,
  lessons,
}: {
  students: StudentProfile[];
  progressByStudent: Record<string, Record<string, ProgressEntry>>;
  lessons: Lesson[];
}) {
  const stats = useMemo(() => {
    const all = Object.values(progressByStudent).flatMap((p) => Object.values(p));
    const completed = all.filter((p) => p.completedAt);
    return {
      studentsCount: students.length,
      lessonsActive: lessons.filter((l) => l.enabled).length,
      completed: completed.length,
      avgMot: avg(completed.map((p) => p.motivation)),
      avgAut: avg(completed.map((p) => p.autonomyLevel)),
      avgPost: avg(completed.map((p) => p.postTestScore ?? 0)),
    };
  }, [students, progressByStudent, lessons]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPI icon={<Users className="h-5 w-5" />} label="Estudiantes" value={stats.studentsCount} />
        <KPI
          icon={<BookOpen className="h-5 w-5" />}
          label="Lecciones activas"
          value={stats.lessonsActive}
        />
        <KPI
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Lecciones completadas"
          value={stats.completed}
        />
        <KPI
          icon={<TrendingUp className="h-5 w-5" />}
          label="Promedio post-test"
          value={`${Math.round(stats.avgPost)}%`}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Motivación y autonomía">
          <Gauge label="Motivación" value={Math.round(stats.avgMot)} color="var(--color-primary)" />
          <Gauge label="Autonomía" value={Math.round(stats.avgAut)} color="var(--color-accent)" />
          <Gauge label="Dominio" value={Math.round(stats.avgPost)} color="var(--color-success)" />
        </Panel>
        <Panel title="Desempeño por lección">
          {lessons.map((l) => {
            const entries = Object.values(progressByStudent)
              .map((p) => p[l.id])
              .filter(Boolean);
            const done = entries.filter((e) => e.completedAt).length;
            const avgScore = avg(entries.map((e) => e.postTestScore ?? 0));
            return (
              <div key={l.id} className="mb-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{l.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {done}/{entries.length} · {Math.round(avgScore)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full gradient-accent" style={{ width: `${avgScore}%` }} />
                </div>
              </div>
            );
          })}
        </Panel>
      </div>
    </div>
  );
}

function LessonsManager({
  lessons,
  onToggle,
}: {
  lessons: Lesson[];
  onToggle: (id: string, enabled: boolean) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {lessons.map((l, i) => (
        <div
          key={l.id}
          className={`rounded-2xl border bg-card p-5 shadow-card ${l.enabled ? "border-border" : "border-dashed opacity-70"}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary font-display text-sm font-bold text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <button
              onClick={() => onToggle(l.id, !l.enabled)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                l.enabled ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
              }`}
            >
              {l.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {l.enabled ? "Visible" : "Oculta"}
            </button>
          </div>
          <h3 className="font-display font-semibold">{l.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.objective}</p>
        </div>
      ))}
    </div>
  );
}

function StudentsManager({
  students,
  progressByStudent,
  lessons,
  onRemove,
  onSaveProfile,
}: {
  students: StudentProfile[];
  progressByStudent: Record<string, Record<string, ProgressEntry>>;
  lessons: Lesson[];
  onRemove: (id: string) => void;
  onSaveProfile: (id: string, tutorProfile: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  if (!students.length) return <Empty text="Aún no hay códigos en la lista." />;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {students.map((s) => {
        const p = progressByStudent[s.id] || {};
        const entries = Object.values(p);
        const completed = entries.filter((e) => e.completedAt).length;
        const isEditing = editingId === s.id;
        return (
          <div key={s.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold font-mono">Código {s.code}</h3>
                <div className="mt-1 text-xs text-muted-foreground">
                  {s.tutorProfile?.trim()
                    ? "Perfil pedagógico cargado"
                    : "Sin perfil para el tutor"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  {completed}/{lessons.filter((l) => l.enabled).length}
                </span>
                <button
                  onClick={() => onRemove(s.id)}
                  className="rounded-lg border border-border p-2 text-destructive hover:bg-destructive/10"
                  title="Quitar de la lista"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Perfil para el tutor (párrafo)
                </span>
                {!isEditing && (
                  <button
                    className="text-xs font-medium text-primary"
                    onClick={() => {
                      setEditingId(s.id);
                      setDraft(s.tutorProfile || "");
                    }}
                  >
                    {s.tutorProfile ? "Editar" : "Agregar"}
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Pega aquí el párrafo pedagógico de este código (intereses, nivel, cómo apoyarlo…)."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded-lg border border-border px-3 py-1.5 text-xs"
                      onClick={() => {
                        setEditingId(null);
                        setDraft("");
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={saving}
                      className="rounded-lg gradient-hero px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                      onClick={() => {
                        void (async () => {
                          setSaving(true);
                          try {
                            await onSaveProfile(s.id, draft);
                            setEditingId(null);
                          } finally {
                            setSaving(false);
                          }
                        })();
                      }}
                    >
                      Guardar perfil
                    </button>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl bg-secondary/40 px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {s.tutorProfile?.trim() || "Aún no hay párrafo. El tutor usará solo el prompt general."}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-1.5 border-t border-border pt-3">
              {lessons
                .filter((l) => l.enabled)
                .map((l) => {
                  const e = p[l.id];
                  return (
                    <div key={l.id} className="flex justify-between text-sm">
                      <span className="truncate">{l.title}</span>
                      <span className={e?.completedAt ? "text-success" : "text-muted-foreground"}>
                        {e?.completedAt ? `${e.postTestScore}%` : e ? e.stage : "pendiente"}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LogsViewer({ logs }: { logs: InteractionLog[] }) {
  if (!logs.length) return <Empty text="Sin interacciones registradas." />;
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
          {logs.map((l) => (
            <tr key={l.id} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {new Date(l.createdAt).toLocaleString()}
                </span>
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

function KPI({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
        {icon}
      </div>
      <div className="mt-4 text-sm text-muted-foreground">{label}</div>
      <div className="font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

function Gauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mb-4">
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

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
      {text}
    </div>
  );
}
