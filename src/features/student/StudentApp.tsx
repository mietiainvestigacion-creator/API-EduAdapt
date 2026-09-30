import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Brain,
  CheckCircle2,
  Lightbulb,
  Rocket,
  Trophy,
  Sprout,
  Loader2,
} from "lucide-react";
import { EduLogo } from "@/shared/components/EduLogo";
import { TutorChat } from "@/features/student/TutorChat";
import { adaptiveDecision, scoreAnswer } from "@/shared/lib/adaptive";
import { studentFetch } from "@/shared/lib/api";
import type {
  Lesson,
  LessonStage,
  ProgressEntry,
  StudentProfile,
} from "@/shared/types/domain";

type FlowStage = "onboarding" | LessonStage;

export function StudentApp() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [className, setClassName] = useState("");
  const [stage, setStage] = useState<FlowStage>("onboarding");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({});
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const data = await studentFetch("/api/student/session");
      setProfile(data.student);
      setClassName(data.class?.name || "");
      setLessons(data.lessons || []);
      setProgress(data.progress || {});
      setStage("hub");
      setError(null);
    } catch {
      setProfile(null);
      setStage("onboarding");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) || null,
    [lessons, activeLessonId],
  );

  const logout = async () => {
    await studentFetch("/api/student/session", { method: "DELETE" }).catch(() => undefined);
    setProfile(null);
    setProgress({});
    setLessons([]);
    setActiveLessonId(null);
    setStage("onboarding");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando...
      </div>
    );
  }

  if (!profile || stage === "onboarding") {
    return (
      <Onboarding
        onDone={async () => {
          setLoading(true);
          await refreshSession();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="hidden sm:block">
            <EduLogo />
          </Link>
          <Link to="/" className="sm:hidden">
            <EduLogo withText={false} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold font-mono">Código {profile.code}</div>
              <div className="text-xs text-muted-foreground">
                {className || "Clase"} · anónimo
              </div>
            </div>
            <button
              onClick={() => void logout()}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-6 py-8">
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {stage === "hub" && (
          <Hub
            profile={profile}
            lessons={lessons}
            progress={progress}
            onPick={(id) => {
              const existing = progress[id];
              setActiveLessonId(id);
              if (existing?.completedAt) {
                setStage("pre-test");
              } else if (existing?.stage && existing.stage !== "hub" && existing.stage !== "summary") {
                setStage(existing.stage);
              } else {
                setStage("pre-test");
              }
            }}
          />
        )}
        {stage !== "hub" && activeLesson && (
          <LessonFlow
            profile={profile}
            lesson={activeLesson}
            stage={stage}
            initialProgress={progress[activeLesson.id]}
            setStage={setStage}
            onError={setError}
            onFinish={(entry) => {
              setProgress((prev) => ({ ...prev, [entry.lessonId]: entry }));
            }}
          />
        )}
      </main>
    </div>
  );
}

function Onboarding({ onDone }: { onDone: () => Promise<void> }) {
  const [step, setStep] = useState(0);
  const [joinCode, setJoinCode] = useState("");
  const [classLabel, setClassLabel] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupClass = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await studentFetch(
        `/api/student/join?joinCode=${encodeURIComponent(joinCode.trim())}`,
      );
      setClassLabel(data.class?.name || "");
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se encontró la clase");
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (!studentCode.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await studentFetch("/api/student/join", {
        method: "POST",
        body: JSON.stringify({ joinCode, studentCode }),
      });
      await onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo entrar");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-6 py-6">
        <Link to="/">
          <EduLogo />
        </Link>
      </header>
      <main className="container mx-auto flex max-w-2xl flex-col items-center px-6 py-10">
        <div className="w-full">
          <div className="mb-6 flex justify-center gap-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-12 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 0 && (
            <Card title="Código de clase" subtitle="Pídele el código a tu docente para entrar.">
              <input
                autoFocus
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && joinCode.trim() && void lookupClass()}
                placeholder="Ej: AB12CD"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg uppercase tracking-widest focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <div className="mt-6 flex justify-end">
                <button
                  disabled={!joinCode.trim() || busy}
                  onClick={() => void lookupClass()}
                  className="inline-flex items-center gap-2 rounded-xl gradient-hero px-6 py-3 font-semibold text-white shadow-glow disabled:opacity-40"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </Card>
          )}

          {step === 1 && (
            <Card
              title={classLabel || "Tu clase"}
              subtitle="Escribe tu código de estudiante (ej. 024). No uses tu nombre real."
            >
              <input
                autoFocus
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && studentCode.trim() && void finish()}
                placeholder="024"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-mono tracking-widest focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <div className="mt-6 flex justify-between">
                <BackButton onClick={() => setStep(0)} />
                <button
                  onClick={() => void finish()}
                  disabled={!studentCode.trim() || busy}
                  className="inline-flex items-center gap-2 rounded-xl gradient-hero px-6 py-3 font-semibold text-white shadow-glow disabled:opacity-40"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                  Entrar
                </button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
function Hub({
  profile,
  lessons,
  progress,
  onPick,
}: {
  profile: StudentProfile;
  lessons: Lesson[];
  progress: Record<string, ProgressEntry>;
  onPick: (id: string) => void;
}) {
  const completed = Object.values(progress).filter((p) => p.completedAt).length;
  const total = lessons.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const allDone = total > 0 && completed === total;

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 text-white shadow-glow-lg">
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Código {profile.code}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">
            {allDone
              ? `¡Completaste la unidad!`
              : `¡Listo para seguir!`}
          </h1>
          <p className="mt-2 max-w-2xl text-white/85">
            El tutor se adapta a tu perfil pedagógico. Avancemos a tu ritmo.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-2.5 rounded-full bg-white" style={{ width: `${pct}%` }} />
            </div>
            <div className="whitespace-nowrap text-sm font-semibold">
              {completed}/{total} · {pct}%
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Tus misiones</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((l, i) => {
          const p = progress[l.id];
          const done = !!p?.completedAt;
          const started = !!p && !done;
          const score = p?.postTestScore ?? 0;
          return (
            <button
              key={l.id}
              onClick={() => onPick(l.id)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-left shadow-card transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              {done && (
                <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completada
                </div>
              )}
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary font-display text-base font-bold text-primary">
                {done ? <CheckCircle2 className="h-5 w-5 text-success" /> : String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display text-lg font-semibold leading-snug">{l.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{l.objective}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                {done ? `Resultado ${score}% · Repasar` : started ? "Continuar" : "Comenzar"}
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          );
        })}
        {lessons.length === 0 && (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Tu docente aún no ha habilitado lecciones.
          </div>
        )}
      </div>
    </div>
  );
}

function LessonFlow({
  profile,
  lesson,
  stage,
  setStage,
  initialProgress,
  onFinish,
  onError,
}: {
  profile: StudentProfile;
  lesson: Lesson;
  stage: FlowStage;
  setStage: (s: FlowStage) => void;
  initialProgress?: ProgressEntry;
  onFinish: (entry: ProgressEntry) => void;
  onError: (msg: string | null) => void;
}) {
  const [preAnswer, setPreAnswer] = useState("");
  const [preScore, setPreScore] = useState<number | null>(initialProgress?.preTestScore ?? null);
  const [postAnswer, setPostAnswer] = useState("");
  const [postScore, setPostScore] = useState<number | null>(initialProgress?.postTestScore ?? null);
  const [reflection, setReflection] = useState(initialProgress?.reflection || "");
  const [messagesCount, setMessagesCount] = useState(initialProgress?.messagesCount ?? 0);
  const [busy, setBusy] = useState(false);

  const saveProgress = async (payload: Record<string, unknown>) => {
    const data = await studentFetch("/api/student/progress", {
      method: "POST",
      body: JSON.stringify({ lessonId: lesson.id, ...payload }),
    });
    return data.progress as ProgressEntry;
  };

  return (
    <div>
      <button
        onClick={() => setStage("hub")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a mis lecciones
      </button>

      <h1 className="font-display text-2xl font-bold md:text-3xl">{lesson.title}</h1>
      <p className="mt-1 text-muted-foreground">{lesson.objective}</p>

      <div className="mt-6">
        {stage === "pre-test" && (
          <StepCard
            icon={<Brain className="h-5 w-5" />}
            title="Diagnóstico inicial"
            description="Una pregunta rápida para ver desde dónde partimos."
          >
            <p className="text-base font-medium">{lesson.preTestQuestion}</p>
            <textarea
              value={preAnswer}
              onChange={(e) => setPreAnswer(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <div className="mt-4 flex justify-end">
              <button
                disabled={!preAnswer.trim() || busy}
                onClick={() => {
                  void (async () => {
                    setBusy(true);
                    onError(null);
                    try {
                      const s = scoreAnswer(lesson.preTestAnswer, preAnswer);
                      setPreScore(s);
                      await saveProgress({
                        stage: "chat",
                        preTestScore: s,
                        logType: "pre-test",
                        logPayload: `score=${s}`,
                      });
                      setStage("chat");
                    } catch (e) {
                      onError(e instanceof Error ? e.message : "Error guardando");
                    } finally {
                      setBusy(false);
                    }
                  })();
                }}
                className="inline-flex items-center gap-2 rounded-xl gradient-hero px-5 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-40"
              >
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </StepCard>
        )}

        {stage === "chat" && (
          <div>
            <TutorChat
              profile={profile}
              lesson={lesson}
              onComplete={(count) => {
                setMessagesCount(count);
                void saveProgress({ stage: "post-test", messagesCount: count }).then(() =>
                  setStage("post-test"),
                );
              }}
            />
          </div>
        )}

        {stage === "post-test" && (
          <StepCard
            icon={<Lightbulb className="h-5 w-5" />}
            title="Evaluación final"
            description="Demuestra lo que aprendiste con tus propias palabras."
          >
            <p className="text-base font-medium">{lesson.postTestQuestion}</p>
            <textarea
              value={postAnswer}
              onChange={(e) => setPostAnswer(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <div className="mt-4 flex justify-end">
              <button
                disabled={!postAnswer.trim() || busy}
                onClick={() => {
                  void (async () => {
                    setBusy(true);
                    try {
                      const s = scoreAnswer(lesson.postTestAnswer, postAnswer);
                      setPostScore(s);
                      await saveProgress({
                        stage: "reflection",
                        postTestScore: s,
                        logType: "post-test",
                        logPayload: `score=${s}`,
                      });
                      setStage("reflection");
                    } catch (e) {
                      onError(e instanceof Error ? e.message : "Error");
                    } finally {
                      setBusy(false);
                    }
                  })();
                }}
                className="inline-flex items-center gap-2 rounded-xl gradient-hero px-5 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-40"
              >
                Continuar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </StepCard>
        )}

        {stage === "reflection" && (
          <StepCard
            icon={<Sprout className="h-5 w-5" />}
            title="Reflexión metacognitiva"
            description="Pensar sobre cómo aprendiste es tan importante como el contenido."
          >
            <p className="text-base font-medium">
              ¿Qué fue lo más difícil y cómo lo lograste superar?
            </p>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <div className="mt-4 flex justify-end">
              <button
                disabled={!reflection.trim() || busy}
                onClick={() => {
                  void (async () => {
                    setBusy(true);
                    try {
                      const entry = await saveProgress({
                        stage: "summary",
                        reflection,
                        messagesCount,
                        autonomyLevel: Math.min(
                          100,
                          40 + messagesCount * 8 + (reflection.length > 50 ? 20 : 0),
                        ),
                        motivation: Math.min(100, 50 + (postScore ?? 0) / 2),
                        difficultyAdjustment:
                          (postScore ?? 0) >= 80 ? 1 : (postScore ?? 0) < 50 ? -1 : 0,
                        completed: true,
                        logType: "complete",
                      });
                      onFinish(entry);
                      setStage("summary");
                    } catch (e) {
                      onError(e instanceof Error ? e.message : "Error");
                    } finally {
                      setBusy(false);
                    }
                  })();
                }}
                className="inline-flex items-center gap-2 rounded-xl gradient-hero px-5 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-40"
              >
                Finalizar <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </StepCard>
        )}

        {stage === "summary" && (
          <Summary
            preScore={preScore ?? 0}
            postScore={postScore ?? 0}
            onContinue={() => setStage("hub")}
          />
        )}
      </div>
    </div>
  );
}

function Summary({
  preScore,
  postScore,
  onContinue,
}: {
  preScore: number;
  postScore: number;
  onContinue: () => void;
}) {
  const decision = adaptiveDecision({ preTestScore: preScore, postTestScore: postScore });
  const recMap = {
    challenge: "¡Listo para un reto mayor!",
    advance: "Buen avance. Continúa tu ruta.",
    repeat: "Vamos a reforzar el concepto pronto.",
  } as const;

  return (
    <div className="rounded-3xl gradient-hero p-8 text-white shadow-glow">
      <Trophy className="h-12 w-12" />
      <h2 className="mt-4 font-display text-3xl font-bold">¡Lección completada!</h2>
      <p className="mt-2 text-white/85">{recMap[decision.next]}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/15 p-4">
          <div className="text-xs uppercase tracking-widest text-white/70">Diagnóstico</div>
          <div className="mt-1 font-display text-2xl font-bold">{preScore}%</div>
        </div>
        <div className="rounded-2xl bg-white/15 p-4">
          <div className="text-xs uppercase tracking-widest text-white/70">Resultado</div>
          <div className="mt-1 font-display text-2xl font-bold">{postScore}%</div>
        </div>
      </div>
      <button
        onClick={onContinue}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary"
      >
        Ir a mis lecciones <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
      <h1 className="font-display text-2xl font-bold md:text-3xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function StepCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-hero text-white">
          {icon}
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function NextButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl gradient-hero px-6 py-3 font-semibold text-white shadow-glow disabled:opacity-40"
    >
      Siguiente <ArrowRight className="h-4 w-4" />
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> Atrás
    </button>
  );
}
