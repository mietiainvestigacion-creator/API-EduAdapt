import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  Compass,
  GraduationCap,
  LineChart,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  Cpu,
  MonitorSmartphone,
  Layers,
  Apple,
  History,
  GitCompare,
  ArrowRight,
} from "lucide-react";
import { EduLogo } from "@/components/EduLogo";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="orb animate-blob h-[420px] w-[420px] -left-24 -top-24 bg-primary/40" />
        <div
          className="orb animate-blob h-[380px] w-[380px] right-[-120px] top-24 bg-accent/40"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="orb animate-blob h-[300px] w-[300px] left-1/3 top-[420px] bg-chart-5/30"
          style={{ animationDelay: "6s" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px] bg-grid" />

      <div className="relative z-10">
        <header className="container mx-auto flex items-center justify-between px-6 py-6">
          <EduLogo />
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#unidad" className="hover:text-foreground transition-colors">
              Unidad
            </a>
            <a href="#sistema" className="hover:text-foreground transition-colors">
              Sistema
            </a>
            <a href="#agentes" className="hover:text-foreground transition-colors">
              Agentes
            </a>
            <a href="#etica" className="hover:text-foreground transition-colors">
              Gobernanza
            </a>
          </nav>
          <Link
            to="/estudiante"
            className="hidden rounded-xl gradient-hero px-4 py-2 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            Empezar
          </Link>
        </header>

        <main>
          {/* Hero */}
          <section className="container mx-auto px-6 pb-24 pt-12 text-center">
            <div className="animate-rise mx-auto inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-card">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Tutor con IA · Grado 7° · Tecnología e Informática
            </div>

            <h1
              className="animate-rise mt-6 font-display text-5xl font-bold leading-[1.03] tracking-tight md:text-7xl"
              style={{ animationDelay: "0.05s" }}
            >
              Domina los
              <br />
              <span className="text-gradient">Sistemas Operativos</span>
              <br />a tu propio ritmo.
            </h1>

            <p
              className="animate-rise mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
              style={{ animationDelay: "0.1s" }}
            >
              EduAdapt es tu tutor inteligente: te acompaña con retos, pistas y ejemplos hechos para{" "}
              <strong className="text-foreground">tus intereses</strong>. Nunca te da la respuesta
              hecha; te ayuda a construirla.
            </p>

            <div
              className="animate-rise mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              style={{ animationDelay: "0.15s" }}
            >
              <Link
                to="/estudiante"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl gradient-hero px-7 py-4 text-base font-semibold text-white shadow-glow-lg transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                <GraduationCap className="h-5 w-5" />
                Entrar como estudiante
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/docente"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border glass px-7 py-4 text-base font-semibold text-foreground shadow-card transition-colors hover:bg-secondary sm:w-auto"
              >
                <Users className="h-5 w-5" />
                Panel docente
              </Link>
            </div>

            {/* Stats */}
            <div
              className="animate-rise mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-4"
              style={{ animationDelay: "0.2s" }}
            >
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border glass p-5 shadow-card"
                >
                  <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Unidad: temas */}
          <section id="unidad" className="container mx-auto px-6 py-16">
            <div className="mb-10 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Unidad actual
              </div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Tu ruta de Sistemas Operativos
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                8 misiones que van de lo básico al pensamiento crítico. Cada una se adapta a cómo
                respondes.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TOPICS.map((t, i) => (
                <div
                  key={t.title}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-glow"
                >
                  <div className="absolute inset-x-0 top-0 h-1 gradient-hero opacity-70" />
                  <div className="mb-3 flex items-center justify-between">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:gradient-hero group-hover:text-white">
                      {t.icon}
                    </div>
                    <span className="font-display text-2xl font-bold text-border">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-semibold leading-snug">{t.title}</h3>
                </div>
              ))}
            </div>
          </section>

          {/* Sistema */}
          <section id="sistema" className="container mx-auto px-6 py-16">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Un ecosistema, dos experiencias
              </h2>
              <p className="mt-3 text-muted-foreground">
                Diseñado para estudiantes activos y docentes en control.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <FeatureCard
                icon={<GraduationCap className="h-6 w-6" />}
                title="Para el estudiante"
                items={[
                  "Diagnóstico inicial de intereses y ritmos",
                  "Tutor socrático que acompaña con pistas, no respuestas",
                  "Retroalimentación adaptativa y reflexión metacognitiva",
                  "Progreso visible y motivador",
                ]}
                gradient
              />
              <FeatureCard
                icon={<Users className="h-6 w-6" />}
                title="Para el docente"
                items={[
                  "Crea y habilita lecciones del currículo",
                  "Dashboards de motivación, autonomía y desempeño",
                  "Trazabilidad completa de interacciones",
                  "Ajuste manual de dificultad por estudiante",
                ]}
              />
            </div>
          </section>

          {/* Agentes */}
          <section id="agentes" className="container mx-auto px-6 py-16">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Arquitectura multiagente
              </h2>
              <p className="mt-3 text-muted-foreground">
                Cada agente con una función pedagógica diferenciada.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {AGENTS.map((a) => (
                <div
                  key={a.name}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-glow"
                >
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:gradient-hero group-hover:text-white">
                    {a.icon}
                  </div>
                  <h3 className="font-display text-base font-semibold">{a.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Ética */}
          <section id="etica" className="container mx-auto px-6 py-16">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-card md:p-12">
              <div className="orb h-64 w-64 right-[-40px] top-[-40px] bg-accent/30" />
              <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl gradient-accent text-white shadow-glow">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold md:text-3xl">
                    Gobernanza ética y supervisión humana
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    EduAdapt no sustituye al docente. Actúa como andamiaje: nunca entrega respuestas
                    directas sin mediación, permanece dentro del currículo definido y promueve
                    siempre el pensamiento crítico y la agencia epistémica del estudiante.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA final */}
          <section className="container mx-auto px-6 py-16">
            <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 text-center text-white shadow-glow-lg md:p-16">
              <div className="orb h-72 w-72 left-[-40px] bottom-[-60px] bg-white/20" />
              <Rocket className="mx-auto h-10 w-10 animate-float" />
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
                ¿List@ para tu primera misión?
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-white/85">
                Cuéntame qué te apasiona y arrancamos con un reto pensado para ti.
              </p>
              <Link
                to="/estudiante"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-semibold text-primary shadow-card transition-transform hover:-translate-y-0.5"
              >
                <GraduationCap className="h-5 w-5" /> Empezar ahora
              </Link>
            </div>
          </section>
        </main>

        <footer className="container mx-auto border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
          EduAdapt · Universidad de Córdoba · Maestría en Innovación Educativa con Tecnología e IA
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  items,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  gradient?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border p-7 shadow-card transition-transform hover:-translate-y-1 ${
        gradient ? "gradient-hero text-white shadow-glow" : "bg-card"
      }`}
    >
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
          gradient ? "bg-white/15 text-white" : "bg-secondary text-primary"
        }`}
      >
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((it) => (
          <li
            key={it}
            className={`flex gap-2 ${gradient ? "text-white/90" : "text-muted-foreground"}`}
          >
            <span
              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${gradient ? "bg-white" : "bg-primary"}`}
            />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

const STATS = [
  { value: "8", label: "Misiones de la unidad" },
  { value: "100%", label: "Adaptado a ti" },
  { value: "24/7", label: "Tutor disponible" },
];

const TOPICS = [
  { title: "¿Qué es un sistema operativo?", icon: <Cpu className="h-5 w-5" /> },
  { title: "¿Para qué sirve?", icon: <Sparkles className="h-5 w-5" /> },
  { title: "Partes de un sistema operativo", icon: <Layers className="h-5 w-5" /> },
  { title: "Windows", icon: <MonitorSmartphone className="h-5 w-5" /> },
  { title: "Historia de Windows", icon: <History className="h-5 w-5" /> },
  { title: "macOS y Apple", icon: <Apple className="h-5 w-5" /> },
  { title: "Historia de macOS/Apple", icon: <History className="h-5 w-5" /> },
  { title: "Windows vs macOS", icon: <GitCompare className="h-5 w-5" /> },
];

const AGENTS = [
  {
    name: "Tutor Cognitivo Adaptativo",
    desc: "Acompaña, modela y consolida aprendizajes.",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    name: "Diagnóstico Psicopedagógico",
    desc: "Detecta intereses, ritmos y preferencias.",
    icon: <Compass className="h-5 w-5" />,
  },
  {
    name: "Diseñador de Rutas",
    desc: "Genera trayectorias únicas por estudiante.",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    name: "Mediador Socrático",
    desc: "Pregunta, no responde. Fomenta el razonamiento.",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    name: "Evaluador Formativo",
    desc: "Pre y post test con feedback inmediato.",
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    name: "Gobernador Ético",
    desc: "Mantiene límites curriculares y privacidad.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];
