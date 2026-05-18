import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Compass, GraduationCap, LineChart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { EduLogo } from "@/components/EduLogo";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto flex items-center justify-between px-6 py-6">
        <EduLogo />
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <a href="#sistema" className="hover:text-foreground transition-colors">Sistema</a>
          <a href="#agentes" className="hover:text-foreground transition-colors">Agentes</a>
          <a href="#etica" className="hover:text-foreground transition-colors">Gobernanza</a>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 pt-10 pb-20 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-card">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Personalización con IA · DUA · Mediación socrática
          </div>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Aprender Tecnología,
            <br />
            <span className="text-gradient">a tu propio ritmo.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            EduAdapt es un agente pedagógico inteligente que acompaña a estudiantes de grado 7° con
            rutas hiperpersonalizadas, retroalimentación formativa y supervisión docente.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/estudiante"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-hero px-7 py-4 text-base font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <GraduationCap className="h-5 w-5" />
              Entrar como estudiante
            </Link>
            <Link
              to="/docente"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 py-4 text-base font-semibold text-foreground shadow-card transition-colors hover:bg-secondary sm:w-auto"
            >
              <Users className="h-5 w-5" />
              Panel docente
            </Link>
          </div>
        </section>

        {/* Sistema */}
        <section id="sistema" className="container mx-auto px-6 py-16">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Un ecosistema, dos experiencias</h2>
            <p className="mt-3 text-muted-foreground">Diseñado para estudiantes activos y docentes en control.</p>
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
            <h2 className="font-display text-3xl font-bold md:text-4xl">Arquitectura multiagente</h2>
            <p className="mt-3 text-muted-foreground">
              Cada agente con una función pedagógica diferenciada.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {AGENTS.map((a) => (
              <div
                key={a.name}
                className="rounded-2xl border border-border bg-card p-5 shadow-card transition-transform hover:-translate-y-0.5"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
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
          <div className="rounded-3xl border border-border bg-card p-8 shadow-card md:p-12">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl gradient-accent text-white">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold md:text-3xl">
                  Gobernanza ética y supervisión humana
                </h2>
                <p className="mt-2 text-muted-foreground">
                  EduAdapt no sustituye al docente. Actúa como andamiaje: nunca entrega respuestas
                  directas sin mediación, permanece dentro del currículo definido y promueve siempre
                  el pensamiento crítico y la agencia epistémica del estudiante.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        EduAdapt · Universidad de Córdoba · Maestría en Innovación Educativa con Tecnología e IA
      </footer>
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
      className={`rounded-2xl border border-border p-7 shadow-card ${
        gradient ? "gradient-hero text-white" : "bg-card"
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
          <li key={it} className={`flex gap-2 ${gradient ? "text-white/90" : "text-muted-foreground"}`}>
            <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${gradient ? "bg-white" : "bg-primary"}`} />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

const AGENTS = [
  { name: "Tutor Cognitivo Adaptativo", desc: "Acompaña, modela y consolida aprendizajes.", icon: <Brain className="h-5 w-5" /> },
  { name: "Diagnóstico Psicopedagógico", desc: "Detecta intereses, ritmos y preferencias.", icon: <Compass className="h-5 w-5" /> },
  { name: "Diseñador de Rutas", desc: "Genera trayectorias únicas por estudiante.", icon: <Sparkles className="h-5 w-5" /> },
  { name: "Mediador Socrático", desc: "Pregunta, no responde. Fomenta el razonamiento.", icon: <Brain className="h-5 w-5" /> },
  { name: "Evaluador Formativo", desc: "Pre y post test con feedback inmediato.", icon: <LineChart className="h-5 w-5" /> },
  { name: "Gobernador Ético", desc: "Mantiene límites curriculares y privacidad.", icon: <ShieldCheck className="h-5 w-5" /> },
];
