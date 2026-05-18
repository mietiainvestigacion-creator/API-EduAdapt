import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Gamepad2,
  Lightbulb,
  Music,
  Palette,
  Rocket,
  Trophy,
  Beaker,
  Zap,
  Clock,
  Sprout,
} from "lucide-react";
import { EduLogo } from "@/components/EduLogo";
import { TutorChat } from "@/components/TutorChat";
import {
  adaptiveDecision,
  store,
  type Interest,
  type Lesson,
  type Pace,
  type ProgressEntry,
  type StudentProfile,
} from "@/lib/eduadapt-store";

export const Route = createFileRoute("/estudiante")({
  component: StudentPage,
});

type Stage = "onboarding" | "hub" | "pre-test" | "chat" | "post-test" | "reflection" | "summary";

function StudentPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stage, setStage] = useState<Stage>("onboarding");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({});

  useEffect(() => {
    const p = store.getProfile();
    setLessons(store.getLessons().filter((l) => l.enabled));
    if (p) {
      setProfile(p);
      setProgress(store.getProgress(p.name));
      setStage("hub");
    }
  }, []);

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) || null,
    [lessons, activeLessonId],
  );

  if (!profile || stage === "onboarding") {
    return <Onboarding onDone={(p) => { setProfile(p); setStage("hub"); setProgress(store.getProgress(p.name)); }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="hidden sm:block"><EduLogo /></Link>
          <Link to="/" className="sm:hidden"><EduLogo withText={false} /></Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold">{profile.name}</div>
              <div className="text-xs capitalize text-muted-foreground">
                {profile.interest} · ritmo {profile.pace}
              </div>
            </div>
            <button
              onClick={() => { store.setProfile(null); setProfile(null); setStage("onboarding"); }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-6 py-8">
        {stage === "hub" && (
          <Hub
            profile={profile}
            lessons={lessons}
            progress={progress}
            onPick={(id) => { setActiveLessonId(id); setStage("pre-test"); }}
          />
        )}
        {stage !== "hub" && activeLesson && (
          <LessonFlow
            profile={profile}
            lesson={activeLesson}
            stage={stage}
            setStage={setStage}
            onFinish={(entry) => {
              store.upsertProgress(profile.name, entry);
              setProgress(store.getProgress(profile.name));
            }}
          />
        )}
      </main>
    </div>
  );
}

// ---------- Onboarding ----------

function Onboarding({ onDone }: { onDone: (p: StudentProfile) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [interest, setInterest] = useState<Interest | null>(null);
  const [pace, setPace] = useState<Pace | null>(null);

  const finish = () => {
    if (!name.trim() || !interest || !pace) return;
    const profile: StudentProfile = {
      name: name.trim(),
      interest,
      pace,
      createdAt: Date.now(),
    };
    store.setProfile(profile);
    store.registerStudent(profile);
    onDone(profile);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-6 py-6">
        <Link to="/"><EduLogo /></Link>
      </header>
      <main className="container mx-auto flex max-w-2xl flex-col items-center px-6 py-10">
        <div className="w-full">
          <div className="mb-6 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-12 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>

          {step === 0 && (
            <Card title="¡Hola! Soy EduAdapt 👋" subtitle="Tu tutor inteligente. ¿Cómo te llamas?">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(1)}
                placeholder="Escribe tu nombre"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <NextButton disabled={!name.trim()} onClick={() => setStep(1)} />
            </Card>
          )}

          {step === 1 && (
            <Card title={`¿Qué te apasiona, ${name}?`} subtitle="Voy a usar esto para crear ejemplos pensados para ti.">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {INTERESTS.map((it) => (
                  <button
                    key={it.value}
                    onClick={() => setInterest(it.value)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-sm font-medium transition-all ${
                      interest === it.value
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${interest === it.value ? "gradient-hero text-white" : "bg-secondary text-primary"}`}>
                      {it.icon}
                    </span>
                    {it.label}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <BackButton onClick={() => setStep(0)} />
                <NextButton disabled={!interest} onClick={() => setStep(2)} />
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card title="¿Cómo te gusta aprender?" subtitle="Puedes cambiarlo más adelante.">
              <div className="space-y-3">
                {PACES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPace(p.value)}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                      pace === p.value
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${pace === p.value ? "gradient-hero text-white" : "bg-secondary text-primary"}`}>
                      {p.icon}
                    </span>
                    <div>
                      <div className="font-semibold">{p.label}</div>
                      <div className="text-sm text-muted-foreground">{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <BackButton onClick={() => setStep(1)} />
                <button
                  onClick={finish}
                  disabled={!pace}
                  className="inline-flex items-center gap-2 rounded-xl gradient-hero px-6 py-3 font-semibold text-white shadow-glow disabled:opacity-40"
                >
                  <Rocket className="h-4 w-4" /> Empezar
                </button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

const INTERESTS: { value: Interest; label: string; icon: React.ReactNode }[] = [
  { value: "videojuegos", label: "Videojuegos", icon: <Gamepad2 className="h-6 w-6" /> },
  { value: "deportes", label: "Deportes", icon: <Trophy className="h-6 w-6" /> },
  { value: "musica", label: "Música", icon: <Music className="h-6 w-6" /> },
  { value: "arte", label: "Arte", icon: <Palette className="h-6 w-6" /> },
  { value: "ciencia", label: "Ciencia", icon: <Beaker className="h-6 w-6" /> },
];

const PACES: { value: Pace; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: "rapido", label: "Rápido", desc: "Quiero ir al grano y avanzar pronto.", icon: <Zap className="h-5 w-5" /> },
  { value: "medio", label: "Equilibrado", desc: "Me gusta entender bien antes de avanzar.", icon: <Clock className="h-5 w-5" /> },
  { value: "reflexivo", label: "Reflexivo", desc: "Prefiero analizar y conectar ideas.", icon: <Sprout className="h-5 w-5" /> },
];

// ---------- Hub ----------

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

  return (
    <div>
      <div className="rounded-3xl gradient-hero p-8 text-white shadow-glow">
        <div className="text-sm uppercase tracking-widest text-white/80">Tu ruta personalizada</div>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          ¡Listo para seguir, {profile.name}! 🚀
        </h1>
        <p className="mt-2 max-w-2xl text-white/85">
          Pensé en ejemplos relacionados con <strong>{profile.interest}</strong> para que cada concepto te
          haga sentido. Vamos a tu ritmo {profile.pace}.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-2 gradient-accent" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-sm font-semibold">{completed}/{total} lecciones</div>
        </div>
      </div>

      <h2 className="mt-10 mb-4 font-display text-2xl font-bold">Lecciones disponibles</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((l) => {
          const p = progress[l.id];
          const done = !!p?.completedAt;
          return (
            <button
              key={l.id}
              onClick={() => onPick(l.id)}
              className="group text-left rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${done ? "bg-success/15 text-success" : "bg-secondary text-primary"}`}>
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                </div>
                <DifficultyBadge level={l.difficulty} />
              </div>
              <h3 className="font-display text-lg font-semibold">{l.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{l.objective}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                {done ? "Repasar" : "Comenzar"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
        {lessons.length === 0 && (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            Tu docente aún no ha habilitado lecciones. ¡Vuelve pronto!
          </div>
        )}
      </div>
    </div>
  );
}

function DifficultyBadge({ level }: { level: 1 | 2 | 3 }) {
  const map = {
    1: { label: "Inicial", cls: "bg-success/15 text-success" },
    2: { label: "Intermedio", cls: "bg-warning/20 text-warning-foreground" },
    3: { label: "Avanzado", cls: "bg-destructive/15 text-destructive" },
  } as const;
  const v = map[level];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${v.cls}`}>{v.label}</span>;
}

// ---------- Lesson Flow ----------

function LessonFlow({
  profile,
  lesson,
  stage,
  setStage,
  onFinish,
}: {
  profile: StudentProfile;
  lesson: Lesson;
  stage: Stage;
  setStage: (s: Stage) => void;
  onFinish: (entry: ProgressEntry) => void;
}) {
  const [preAnswer, setPreAnswer] = useState("");
  const [preScore, setPreScore] = useState<number | null>(null);
  const [postAnswer, setPostAnswer] = useState("");
  const [postScore, setPostScore] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");
  const [messagesCount, setMessagesCount] = useState(0);
  const navigate = useNavigate();

  const scoreAnswer = (expected: string, given: string) => {
    const g = given.toLowerCase().trim();
    if (!g) return 0;
    if (g.includes(expected.toLowerCase())) return 100;
    if (g.length > 8) return 50;
    return 20;
  };

  return (
    <div>
      <button
        onClick={() => setStage("hub")}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a mis lecciones
      </button>

      <div className="mb-6 flex items-center gap-3">
        {STAGES.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                stage === s.key
                  ? "gradient-hero text-white shadow-glow"
                  : stageIndex(stage) > i
                  ? "bg-success text-success-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className={`hidden text-xs sm:inline ${stage === s.key ? "font-semibold" : "text-muted-foreground"}`}>
              {s.label}
            </span>
            {i < STAGES.length - 1 && <div className="hidden h-px w-6 bg-border sm:block" />}
          </div>
        ))}
      </div>

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
              placeholder="Escribe lo que pienses, no hay respuesta mala aquí."
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  const s = scoreAnswer(lesson.preTestAnswer, preAnswer);
                  setPreScore(s);
                  store.log({
                    id: crypto.randomUUID(),
                    studentName: profile.name,
                    lessonId: lesson.id,
                    timestamp: Date.now(),
                    type: "pre-test",
                    payload: `score=${s}`,
                  });
                  setStage("chat");
                }}
                disabled={!preAnswer.trim()}
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
                setStage("post-test");
              }}
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Cuando sientas que ya entendiste, presiona <strong>Terminar lección</strong> para evaluar.
            </p>
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
              placeholder="Explícalo como si se lo dijeras a un amigo."
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  const s = scoreAnswer(lesson.postTestAnswer, postAnswer);
                  setPostScore(s);
                  store.log({
                    id: crypto.randomUUID(),
                    studentName: profile.name,
                    lessonId: lesson.id,
                    timestamp: Date.now(),
                    type: "post-test",
                    payload: `score=${s}`,
                  });
                  setStage("reflection");
                }}
                disabled={!postAnswer.trim()}
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
              placeholder="Comparte tu proceso..."
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  const entry: ProgressEntry = {
                    lessonId: lesson.id,
                    startedAt: Date.now(),
                    completedAt: Date.now(),
                    preTestScore: preScore ?? 0,
                    postTestScore: postScore ?? 0,
                    messagesCount,
                    reflection,
                    autonomyLevel: Math.min(100, 40 + messagesCount * 8 + (reflection.length > 50 ? 20 : 0)),
                    motivation: Math.min(100, 50 + (postScore ?? 0) / 2),
                    difficultyAdjustment:
                      (postScore ?? 0) >= 80 ? 1 : (postScore ?? 0) < 50 ? -1 : 0,
                  };
                  onFinish(entry);
                  store.log({
                    id: crypto.randomUUID(),
                    studentName: profile.name,
                    lessonId: lesson.id,
                    timestamp: Date.now(),
                    type: "complete",
                  });
                  setStage("summary");
                }}
                disabled={!reflection.trim()}
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
            onContinue={() => {
              setPreAnswer(""); setPostAnswer(""); setReflection("");
              setPreScore(null); setPostScore(null);
              setStage("hub");
              navigate({ to: "/estudiante" });
            }}
          />
        )}
      </div>
    </div>
  );
}

const STAGES: { key: Stage; label: string }[] = [
  { key: "pre-test", label: "Diagnóstico" },
  { key: "chat", label: "Tutor" },
  { key: "post-test", label: "Evaluación" },
  { key: "reflection", label: "Reflexión" },
];
const stageIndex = (s: Stage) => STAGES.findIndex((x) => x.key === s);

function Summary({
  preScore,
  postScore,
  onContinue,
}: { preScore: number; postScore: number; onContinue: () => void }) {
  const decision = adaptiveDecision({
    lessonId: "",
    startedAt: 0,
    messagesCount: 0,
    autonomyLevel: 0,
    motivation: 0,
    difficultyAdjustment: 0,
    preTestScore: preScore,
    postTestScore: postScore,
  });
  const recMap = {
    challenge: "¡Listo para un reto mayor! Avanzarás a una lección más exigente.",
    advance: "Buen avance. La próxima lección continuará tu ruta.",
    repeat: "Vamos a reforzar el concepto con otra analogía pronto.",
  } as const;

  return (
    <div className="rounded-3xl gradient-hero p-8 text-white shadow-glow">
      <Trophy className="h-12 w-12" />
      <h2 className="mt-4 font-display text-3xl font-bold">¡Lección completada!</h2>
      <p className="mt-2 text-white/85">{recMap[decision.next]}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Diagnóstico" value={`${preScore}%`} />
        <Stat label="Resultado" value={`${postScore}%`} />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 p-4">
      <div className="text-xs uppercase tracking-widest text-white/70">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

// ---------- shared bits ----------

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
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
}: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
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
    <div className="mt-6 flex justify-end">
      <button
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-xl gradient-hero px-6 py-3 font-semibold text-white shadow-glow disabled:opacity-40"
      >
        Siguiente <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" /> Atrás
    </button>
  );
}
