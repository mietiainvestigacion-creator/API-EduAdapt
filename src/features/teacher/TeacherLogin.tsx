import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { EduLogo } from "@/shared/components/EduLogo";
import { getBrowserSupabase } from "@/shared/lib/supabase";

export function TeacherLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const supabase = getBrowserSupabase();
      void supabase.auth.getSession().then(({ data }) => {
        if (data.session) navigate({ to: "/docente", replace: true });
      });
    } catch (e) {
      setConfigError(
        e instanceof Error
          ? e.message
          : "Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en .env",
      );
    }
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const supabase = getBrowserSupabase();
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        navigate({ to: "/docente", replace: true });
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName || email.split("@")[0] } },
        });
        if (err) throw err;
        if (data.session) {
          navigate({ to: "/docente", replace: true });
        } else {
          setInfo(
            "Cuenta creada. Si Supabase pide confirmar correo, revisa tu bandeja; si no, inicia sesión.",
          );
          setMode("login");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
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
      <main className="container mx-auto flex max-w-md flex-col px-6 py-10">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <div className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" /> Acceso docente
          </div>
          <h1 className="font-display text-2xl font-bold">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Correo y contraseña. Los estudiantes entran con código de clase, sin email.
          </p>
          {configError && (
            <div className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {configError}. Reinicia `bun run dev` después de editar el `.env`.
            </div>
          )}

          <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-3">
            {mode === "register" && (
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre completo"
                className={INP}
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@colegio.edu.co"
              className={INP}
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className={INP}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            {info && <p className="text-sm text-success">{info}</p>}
            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-hero px-4 py-3 font-semibold text-white shadow-glow disabled:opacity-40"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Entrar" : "Registrarme"}
            </button>
          </form>

          <button
            className="mt-4 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "¿Primera vez? Crear cuenta" : "Ya tengo cuenta"}
          </button>
        </div>
      </main>
    </div>
  );
}

const INP =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20";
